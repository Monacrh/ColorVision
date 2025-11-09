// src/app/results/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FileText,
  Star // <-- Impor ikon Star
} from 'lucide-react';
import LLMResponseRenderer from '../../components/llmresponse/llmresponse';

// Interface tetap sama
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
  careerRecommendation?: string;
}

export default function ResultsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<TestResultDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'answers' | 'career'>('answers');
  const [careerRecommendation, setCareerRecommendation] = useState<string>('');
  const [isLoadingCareer, setIsLoadingCareer] = useState(false);

  // Menggunakan useCallback agar fungsi ini stabil
  const fetchResultDetail = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/test-results?id=${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch test result');
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        if (data.data.careerRecommendation) {
          setCareerRecommendation(data.data.careerRecommendation);
        }
      } else {
        setError('Test result not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchResultDetail(params.id as string);
    }
  }, [params.id, fetchResultDetail]);

  // Fungsi untuk menangani generasi DAN penyimpanan
  const handleGenerateRecommendation = async (forceRegenerate: boolean = false) => {
    if (!result) return;
    
    // PENGECEKAN TAMBAHAN: Jangan pernah generate jika severity 'none'
    if (result.summary.severity === 'none') return;

    if (careerRecommendation && !forceRegenerate) {
      return;
    }
    
    setIsLoadingCareer(true);
    try {
      const llmResponse = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          severity: result.summary.severity,
          deficiencyType: result.summary.deficiencyType,
          diagnosis: result.summary.diagnosis,
        }),
      });

      const llmData = await llmResponse.json();
      if (!llmData.success) {
        throw new Error(llmData.message || 'Failed to generate recommendation');
      }

      const newRecommendation = llmData.recommendation;
      setCareerRecommendation(newRecommendation); 

      await fetch(`/api/test-results?id=${result._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation: newRecommendation,
          metadata: llmData.metadata
        }),
      });

    } catch (err) {
      console.error('Error handling career recommendation:', err);
      if (!careerRecommendation) {
        setCareerRecommendation('Unable to load career recommendations at this time. Please try again later.');
      }
    } finally {
      setIsLoadingCareer(false);
    }
  };

  useEffect(() => {
    // Logika ini sekarang aman karena jika severity 'none', activeTab tidak akan pernah menjadi 'career'
    if (activeTab === 'career' && !careerRecommendation && result && !isLoadingCareer) {
      handleGenerateRecommendation(false); 
    }
  }, [activeTab, careerRecommendation, result, isLoadingCareer]);

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

          {/* Tab Switch - SEKARANG KONDISIONAL */}
          {summary.severity !== 'none' && (
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
                  <span>AI Career Guidance</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Analysis Details */}
          {summary.details && summary.details.length > 0 && activeTab === 'answers' && (
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
            {/* Tampilkan Answer Breakdown jika tab 'answers' ATAU jika severity 'none' */}
            {activeTab === 'answers' && (
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
                      {/* ... (isi answer breakdown tetap sama) ... */}
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
            )}

            {/* HANYA tampilkan career jika tab 'career' DAN severity BUKAN 'none' */}
            {activeTab === 'career' && summary.severity !== 'none' && (
              <motion.div
                key="career"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {isLoadingCareer ? (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-xl p-12 text-center">
                    <Loader2 size={48} className="text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-900 font-semibold text-lg mb-2">Generating Your Personalized Career Consultation</p>
                    <p className="text-gray-600 text-sm">AI is analyzing your results and crafting tailored guidance...</p>
                  </div>
                ) : careerRecommendation ? (
                  <LLMResponseRenderer 
                    content={careerRecommendation}
                    deficiencyType={summary.deficiencyType}
                    severity={summary.severity}
                    onRegenerate={() => handleGenerateRecommendation(true)}
                  />
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                    <AlertTriangle size={48} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No career recommendations loaded.</p>
                    <button
                      onClick={() => handleGenerateRecommendation(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Generate Recommendations
                    </button>
                  </div>
                )}

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
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAMBAHAN: Pesan untuk Penglihatan Normal */}
          {summary.severity === 'none' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No Career Guidance Needed
                </h3>
                <p className="text-gray-700 max-w-lg mx-auto">
                  Your test results indicate **Normal Color Vision**. 
                  You should not face any career restrictions related to color vision. 
                  Therefore, specialized AI career guidance is not required.
                </p>
              </div>
            </motion.div>
          )}

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
              onClick={() => router.push('/dashboard')}
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