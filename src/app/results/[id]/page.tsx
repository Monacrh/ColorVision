'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Home,
  AlertTriangle,
  Clock,
  Calendar,
  TrendingUp,
  Loader2,
  ArrowLeft,
  Briefcase,
  FileText
} from 'lucide-react';

interface TestResultDetail {
  _id: string;
  testDate: Date;
  answers: Array<{
    questionId: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    timeToAnswer: number;
  }>;
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    totalTime: number;
    diagnosis: string;
    severity: string;
    deficiencyType: string;
    confidence: number;
    details: string[];
  };
}

export default function ResultsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<TestResultDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'answers' | 'career'>('answers'); // Tab state
  const [careerRecommendation, setCareerRecommendation] = useState<string>('');
  const [isLoadingCareer, setIsLoadingCareer] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchResultDetail(params.id as string);
    }
  }, [params.id]);

  const fetchResultDetail = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/test-results?id=${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test result');
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setError('Test result not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch career recommendation when switching to career tab
  const fetchCareerRecommendation = async () => {
    if (careerRecommendation || !result) return; // Already fetched or no result
    
    setIsLoadingCareer(true);
    try {
      const response = await fetch('/api/career-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity: result.summary.severity,
          deficiencyType: result.summary.deficiencyType,
          diagnosis: result.summary.diagnosis,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCareerRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error('Error fetching career recommendation:', err);
      setCareerRecommendation('Unable to load career recommendations at this time.');
    } finally {
      setIsLoadingCareer(false);
    }
  };

  // Trigger career recommendation fetch when switching to career tab
  useEffect(() => {
    if (activeTab === 'career' && !careerRecommendation) {
      fetchCareerRecommendation();
    }
  }, [activeTab]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading test results...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Test result not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { summary } = result;
  const formattedDate = new Date(result.testDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          whileHover={{ x: -4 }}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                summary.severity === 'none' ? 'bg-green-600' :
                summary.severity === 'mild' ? 'bg-yellow-600' :
                summary.severity === 'moderate' ? 'bg-amber-600' : 'bg-red-600'
              }`}
            >
              {summary.severity === 'none' ? (
                <CheckCircle size={40} className="text-white" />
              ) : (
                <AlertTriangle size={40} className="text-white" />
              )}
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Results
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              {summary.diagnosis}
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>{formattedDate}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock size={16} />
                <span>{summary.totalTime}s total</span>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {summary.correctAnswers}/{summary.totalQuestions}
              </div>
              <p className="text-xs text-gray-600">Correct Answers</p>
            </div>

            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {Math.round(summary.accuracy)}%
              </div>
              <p className="text-xs text-gray-600">Accuracy</p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {summary.totalTime}s
              </div>
              <p className="text-xs text-gray-600">Total Time</p>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {summary.confidence}%
              </div>
              <p className="text-xs text-gray-600">Confidence</p>
            </div>
          </div>

          {/* Severity & Type Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  summary.severity === 'none' ? 'bg-green-100' :
                  summary.severity === 'mild' ? 'bg-yellow-100' :
                  summary.severity === 'moderate' ? 'bg-orange-100' : 'bg-red-100'
                }`}>
                  <TrendingUp size={20} className={
                    summary.severity === 'none' ? 'text-green-600' :
                    summary.severity === 'mild' ? 'text-yellow-600' :
                    summary.severity === 'moderate' ? 'text-orange-600' : 'text-red-600'
                  } />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Severity Level</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{summary.severity}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Eye size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Deficiency Type</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {summary.deficiencyType === 'none' ? 'None' : 
                     summary.deficiencyType === 'protanopia' ? 'Protanopia (Red)' :
                     summary.deficiencyType === 'deuteranopia' ? 'Deuteranopia (Green)' :
                     'General (Red-Green)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Switch */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-xl p-1 inline-flex">
              <button
                onClick={() => setActiveTab('answers')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'answers'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText size={18} />
                <span>Answer Breakdown</span>
              </button>
              <button
                onClick={() => setActiveTab('career')}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'career'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Briefcase size={18} />
                <span>Career Guidance</span>
              </button>
            </div>
          </div>

          {/* AI Analysis Details - Always show */}
          {summary.details && summary.details.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                AI Analysis Details
              </h3>
              <div className="space-y-2">
                {summary.details.map((detail, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <p className="text-gray-700 text-sm leading-relaxed">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Section with Animation */}
          <AnimatePresence mode="wait">
            {activeTab === 'answers' ? (
              <motion.div
                key="answers"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <h3 className="font-semibold text-gray-900 mb-4">Answer Breakdown</h3>
                <div className="space-y-3">
                  {result.answers.map((answer, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        answer.isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          answer.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Your answer: <span className="text-blue-600">{answer.userAnswer}</span>
                          </span>
                          {!answer.isCorrect && (
                            <span className="text-gray-500 ml-2">
                              (Expected: {answer.correctAnswer})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500 flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{answer.timeToAnswer}s</span>
                        </span>
                        {answer.isCorrect ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="career"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="w-5 h-5 text-purple-600 mr-2" />
                    Career Recommendations & Guidance
                  </h3>
                  
                  {isLoadingCareer ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={32} className="text-purple-600 animate-spin" />
                      <span className="ml-3 text-gray-600">Generating personalized career guidance...</span>
                    </div>
                  ) : careerRecommendation ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {careerRecommendation}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600">No career recommendations available.</p>
                  )}
                </div>

                {/* Additional Info for Career Tab */}
                {summary.severity !== 'none' && !isLoadingCareer && (
                  <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Important Notes:</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Color vision deficiency does not limit your potential or intelligence</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Many successful professionals have color vision deficiency</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Technology and assistive tools can help in many careers</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>Focus on your strengths and interests when choosing a career path</span>
                      </li>
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Disclaimer */}
          {summary.severity !== 'none' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    <strong className="text-amber-900">Important:</strong> This is a screening test and not a substitute for professional diagnosis. 
                    Please consult with an eye care professional for comprehensive evaluation and treatment options.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Take New Test</span>
            </motion.button>

            <motion.button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home size={20} />
              <span>Back to Home</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};