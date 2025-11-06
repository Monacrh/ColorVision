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
      const response = await fetch('/api/llm', {
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
                {/* Loading State */}
                {isLoadingCareer ? (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-12 text-center">
                    <Loader2 size={48} className="text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold text-lg mb-2">Generating Your Personalized Career Consultation</p>
                    <p className="text-gray-600 text-sm">AI is analyzing your results and crafting tailored guidance...</p>
                  </div>
                ) : careerRecommendation ? (
                  // Main Career Consultation Content
                  <div className="space-y-6">
                    
                    {/* Header */}
                    <div className="text-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={32} className="text-white" />
                      </div>
                      <h2 className="text-3xl font-bold mb-2">Career Guidance & Consultation</h2>
                      <p className="text-purple-100">Personalized recommendations based on your color vision assessment</p>
                    </div>

                    {/* Main Content Container */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-6">
                      
                      {/* Parse and render sections from LLM response */}
                      <div className="space-y-8">
                        
                        {/* 1. Personalized Assessment */}
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-[2px] rounded-xl">
                          <div className="bg-white rounded-[calc(0.75rem-2px)] p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">1</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">Your Results & What They Mean</h3>
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                              <p className="text-gray-800 leading-relaxed">
                                <span className="font-semibold text-blue-900">Dear User,</span><br/><br/>
                                I understand that receiving color vision deficiency results can bring mixed feelings. 
                                You might be wondering what this means for your future career and daily life. 
                                Let me assure you that you&apos;re not alone—approximately{' '}
                                <span className="font-semibold">8% of men and 0.5% of women</span> have some form of color vision deficiency.
                              </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                                <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                                  <span className="mr-2">📊</span> Your Condition
                                </h4>
                                <p className="text-sm text-gray-700">{summary.deficiencyType} - {summary.severity}</p>
                              </div>
                              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                                <h4 className="font-semibold text-pink-900 mb-2 flex items-center">
                                  <span className="mr-2">💪</span> You&apos;re Not Alone
                                </h4>
                                <p className="text-sm text-gray-700">Affects millions worldwide</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Understanding Your Condition */}
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-[2px] rounded-xl">
                          <div className="bg-white rounded-[calc(0.75rem-2px)] p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">2</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">Understanding Your Vision</h3>
                            </div>

                            <div className="space-y-4">
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                                  <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
                                    <span className="text-xs">🔴</span>
                                  </span>
                                  What {summary.deficiencyType} Means
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  This affects your perception of certain color wavelengths, making it difficult 
                                  to distinguish between specific colors.
                                </p>
                              </div>

                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3">Daily Life Impact:</h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <div className="flex items-start">
                                    <span className="text-blue-600 mr-2 mt-1">•</span>
                                    <span>Traffic lights may appear less distinct</span>
                                  </div>
                                  <div className="flex items-start">
                                    <span className="text-blue-600 mr-2 mt-1">•</span>
                                    <span>Color-coded charts might be challenging</span>
                                  </div>
                                  <div className="flex items-start">
                                    <span className="text-blue-600 mr-2 mt-1">•</span>
                                    <span>Some career fields may require accommodations</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Career Paths - Highly Recommended */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-[2px] rounded-xl">
                          <div className="bg-white rounded-[calc(0.75rem-2px)] p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">3</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">✅ Perfect Career Matches</h3>
                            </div>

                            {/* Technology Category */}
                            <div className="mb-6">
                              <div className="flex items-center mb-3">
                                <span className="text-2xl mr-2">💻</span>
                                <h4 className="text-xl font-semibold text-gray-800">Technology & Software</h4>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mb-4">
                                {['Software Developer', 'Data Scientist', 'Backend Engineer', 'DevOps', 'Cybersecurity', 'Database Admin'].map((career, idx) => (
                                  <span 
                                    key={idx}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-sm font-medium text-gray-900 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                  >
                                    {career}
                                  </span>
                                ))}
                              </div>

                              {/* Detailed Career Card */}
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-bold text-gray-900 text-lg">Software Developer</h5>
                                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    Highly Suitable
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-3">
                                  <span className="font-semibold">Why suitable:</span> Code is text-based and doesn&apos;t rely on color perception. 
                                  Most IDEs offer excellent accessibility features.
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="font-semibold text-gray-900">💰 Salary:</span>
                                    <span className="text-gray-700"> $70k-$150k</span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-gray-900">📈 Growth:</span>
                                    <span className="text-gray-700"> Excellent</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Business Category */}
                            <div className="mb-6">
                              <div className="flex items-center mb-3">
                                <span className="text-2xl mr-2">💼</span>
                                <h4 className="text-xl font-semibold text-gray-800">Business & Management</h4>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {['Business Analyst', 'Project Manager', 'Financial Analyst', 'Operations Manager', 'HR Manager'].map((career, idx) => (
                                  <span 
                                    key={idx}
                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg text-sm font-medium text-gray-900 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                                  >
                                    {career}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 4. Careers to Approach with Caution */}
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-[2px] rounded-xl">
                          <div className="bg-white rounded-[calc(0.75rem-2px)] p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">4</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">⚠️ Careers Requiring Accommodations</h3>
                            </div>

                            <div className="space-y-3">
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900">Graphic Designer</h5>
                                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                    Need Tools
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                  <span className="font-semibold">Challenges:</span> Color selection and matching
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">Accommodations:</span> Color picker tools, accessibility plugins, colleague verification
                                </p>
                              </div>

                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900">UX/UI Designer</h5>
                                  <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                                    Possible
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">
                                  <span className="font-semibold">Challenges:</span> Color contrast and accessibility testing
                                </p>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">Accommodations:</span> Use WCAG guidelines, contrast checkers, automated tools
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 5. Careers to Avoid */}
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-[2px] rounded-xl">
                          <div className="bg-white rounded-[calc(0.75rem-2px)] p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">5</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">❌ Careers Not Recommended</h3>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="space-y-3 text-sm">
                                <div className="flex items-start">
                                  <XCircle size={16} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-semibold text-gray-900">Commercial Pilot</span>
                                    <p className="text-gray-700">Strict FAA color vision requirements. Safety-critical role.</p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <XCircle size={16} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-semibold text-gray-900">Electrician</span>
                                    <p className="text-gray-700">Color-coded wiring systems. Safety risk.</p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <XCircle size={16} className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-semibold text-gray-900">Firefighter</span>
                                    <p className="text-gray-700">Emergency situations require quick color identification.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 6. Assistive Technology */}
                        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-[2px] rounded-xl">
                          <div className="bg-white rounded-[calc(0.75rem-2px)] p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">6</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">🛠️ Tools & Technology</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                                  <span className="mr-2">📱</span> Mobile Apps
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <div>
                                      <span className="font-semibold">ColorBlind Pal</span>
                                      <span className="text-gray-600"> - iOS/Android - Free</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <span className="text-blue-600 mr-2">•</span>
                                    <div>
                                      <span className="font-semibold">Color Name AR</span>
                                      <span className="text-gray-600"> - Real-time identification</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                                  <span className="mr-2">🔌</span> Browser Extensions
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    <div>
                                      <span className="font-semibold">Colorblindly</span>
                                      <span className="text-gray-600"> - Chrome/Firefox</span>
                                    </div>
                                  </div>
                                  <div className="flex items-start">
                                    <span className="text-green-600 mr-2">•</span>
                                    <div>
                                      <span className="font-semibold">Color Enhancer</span>
                                      <span className="text-gray-600"> - Filter overlays</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 7. Success Strategies */}
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-[2px] rounded-xl">
                          <div className="bg-white rounded-[calc(0.75rem-2px)] p-6">
                            <div className="flex items-center mb-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-lg">7</span>
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900">💡 Success Strategies</h3>
                            </div>

                            <div className="grid gap-3">
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <h4 className="font-semibold text-indigo-900 mb-2">1. Leverage Technology</h4>
                                <p className="text-sm text-gray-700">
                                  Use color identification apps and browser extensions to assist with daily tasks.
                                </p>
                              </div>
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <h4 className="font-semibold text-indigo-900 mb-2">2. Be Proactive</h4>
                                <p className="text-sm text-gray-700">
                                  Inform employers early and discuss reasonable accommodations.
                                </p>
                              </div>
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                <h4 className="font-semibold text-indigo-900 mb-2">3. Focus on Strengths</h4>
                                <p className="text-sm text-gray-700">
                                  Emphasize your analytical, technical, or creative skills that don&apos;t rely on color.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 8. Closing Encouragement */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
                          <h3 className="text-2xl font-bold mb-3 flex items-center justify-center">
                            <span className="mr-2">🌟</span> You&apos;ve Got This!
                          </h3>
                          <p className="text-lg mb-4 leading-relaxed">
                            Your color vision doesn&apos;t define your potential. Your creativity, intelligence, and determination do.
                          </p>
                          <p className="text-purple-100 italic text-lg mb-6">
                            &quot;Different isn&apos;t deficient. It&apos;s just different.&quot;
                          </p>
                          <div className="pt-6 border-t border-purple-400">
                            <p className="text-sm text-purple-100">
                              Remember: Many successful professionals, including renowned engineers, programmers, 
                              and entrepreneurs, have color vision deficiency and thrive in their careers.
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ) : (
                  // No recommendation state
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No career recommendations available at this time.</p>
                  </div>
                )}

                {/* Additional Important Notes - Only show for deficiency cases */}
                {summary.severity !== 'none' && !isLoadingCareer && careerRecommendation && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <AlertTriangle size={20} className="text-blue-600 mr-2" />
                      Important Notes
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-start">
                        <CheckCircle size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Color vision deficiency does not limit your potential or intelligence</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Many successful professionals have color vision deficiency</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Technology and assistive tools can help in many careers</span>
                      </div>
                      <div className="flex items-start">
                        <CheckCircle size={16} className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Focus on your strengths and interests when choosing a career path</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Home size={20} />
              <span>Back to Dashboard</span>
            </button>
            <button
              onClick={() => router.push('/test')}
              className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-6 rounded-xl border border-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Eye size={20} />
              <span>Take Test Again</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}