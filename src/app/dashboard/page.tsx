'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Eye, Clock, CheckCircle, XCircle, RotateCcw, Home, FileText, AlertTriangle, Award
} from 'lucide-react';
import Image from 'next/image';
import { IshiharaDecisionTree } from '@/lib/ishiharaDecisionTree';
import { testPlates } from '@/lib/ishiharaPlate'; 
import { TestAnswer } from '@/types/ishihara';
import { useRouter } from 'next/navigation';

const ColorBlindnessDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'test' | 'results'>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false); // Tambahan state loading
  const router = useRouter();

  const handleAnswer = useCallback((answer: string) => {
    const currentPlate = testPlates[currentQuestion];
    const correctAnswer = currentPlate.normalAnswer || currentPlate.deficientAnswer || '';
    
    const newAnswers: TestAnswer[] = [...answers, {
      questionId: currentPlate.id,
      userAnswer: answer,
      correctAnswer: correctAnswer,
      isCorrect: answer === correctAnswer,
      timeToAnswer: 30 - timeRemaining
    }];
    
    setAnswers(newAnswers);
    setCurrentInput('');

    if (currentQuestion < testPlates.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeRemaining(30);
    } else {
      setTestCompleted(true);
      setTestStarted(false);
      setCurrentView('results');
    }
  }, [answers, currentQuestion, timeRemaining]);

  const calculateResults = useCallback(() => {
    const startTime = performance.now();

    const decisionTree = new IshiharaDecisionTree(testPlates);
    const result = decisionTree.analyzeResults(answers);

    const endTime = performance.now();
    const duration = endTime - startTime;

    console.log(`⏱️ Diagnostic Core Execution Time: ${duration.toFixed(4)} ms`);
    
    return {
      correctAnswers: result.correctAnswers,
      accuracy: result.accuracy,
      diagnosis: result.conclusion,
      recommendation: result.recommendation,
      severity: result.severity || 'none',
      deficiencyType: result.deficiencyType || 'none',
      confidence: result.confidence,
      details: result.details
    };
  }, [answers]);

  useEffect(() => {
    if (currentView === 'results' && answers.length > 0 && !isSaving) {
      const saveTestResults = async () => {
        setIsSaving(true);
        const results = calculateResults();

        try {
          const response = await fetch('/api/test-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              answers: answers,
              summary: {
                totalQuestions: testPlates.length,
                correctAnswers: results.correctAnswers,
                accuracy: results.accuracy,
                totalTime: answers.reduce((acc, a) => acc + a.timeToAnswer, 0),
                diagnosis: results.diagnosis,
                severity: results.severity,
                deficiencyType: results.deficiencyType,
                confidence: results.confidence,
                details: results.details,
              },
            }),
          });

          if (!response.ok) throw new Error('Failed to save test results.');
          
          const data = await response.json();
          if (data.success && data.id) {
            console.log('Test results saved!', data.id);
            router.push(`/results/${data.id}`);
          }
        } catch (error) {
          console.error('Error saving test results:', error);
          setIsSaving(false); // Tetap di halaman result jika error
        }
      };

      saveTestResults();
    }
  }, [currentView, answers, router, calculateResults, isSaving]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (testStarted && !testCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAnswer(currentInput.trim() || 'timeout');
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testStarted, testCompleted, timeRemaining, currentInput, handleAnswer]);

  const startTest = () => {
    setCurrentView('test');
    setTestStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setCurrentInput('');
    setTestCompleted(false);
    setTimeRemaining(30);
    setIsSaving(false);
  };

  const handleKeypadInput = (value: string) => {
    if (value === 'clear') {
      setCurrentInput('');
    } else if (value === 'cant-see') {
      setCurrentInput("Can't see");
    } else if (value === 'submit') {
      if (currentInput.trim() !== '') {
        handleAnswer(currentInput.trim());
      }
    } else {
      if (currentInput.length < 2 && !currentInput.includes("Can't see")) {
        setCurrentInput(prev => prev + value);
      }
    }
  };

  // --- RESPONSIVE LAYOUT COMPONENTS ---

  // 1. Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Eye size={32} className="text-white md:w-10 md:h-10" />
              </motion.div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Color Vision Assessment
              </h1>
              <p className="text-gray-600 text-base md:text-lg">
                AI-Powered Ishihara Color Blindness Test
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              {[
                { icon: Clock, color: 'blue', title: 'Quick Test', sub: '30s per question' },
                { icon: FileText, color: 'green', title: `${testPlates.length} Questions`, sub: 'Comprehensive screening' },
                { icon: Award, color: 'purple', title: 'AI Analysis', sub: 'Instant results' }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (idx + 1) }}
                  className={`bg-${item.color}-50 border border-${item.color}-100 rounded-xl p-4 md:p-6 text-center`}
                >
                  <item.icon className={`w-8 h-8 text-${item.color}-600 mx-auto mb-3`} />
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.sub}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-5 md:p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                Test Instructions
              </h3>
              <ul className="space-y-3 text-gray-600 text-sm md:text-base">
                {['Enter the number using keypad', '30 seconds per question', 'Ensure good lighting', 'Press "Can\'t See" if invisible'].map((txt, i) => (
                  <li key={i} className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    {txt}
                  </li>
                ))}
              </ul>
            </div>

            <motion.button
              onClick={startTest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play size={20} />
              <span>Begin Color Vision Test</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  // 2. Test Screen (Responsive Fixes Applied)
  if (currentView === 'test') {
    const currentTest = testPlates[currentQuestion];
    const progress = ((currentQuestion + 1) / testPlates.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  Question {currentQuestion + 1} <span className="text-gray-400 text-sm font-normal">of {testPlates.length}</span>
                </h2>
              </div>
              <div className="flex items-center justify-between md:justify-end md:space-x-6 w-full md:w-auto">
                <div className="flex items-center space-x-2">
                  <Clock size={18} className="text-gray-500" />
                  <span className={`font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {timeRemaining}s
                  </span>
                </div>
                <div className="text-sm text-gray-500 md:hidden">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6 md:mb-8">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Main Content Grid: Stacks on mobile, Side-by-side on Large screens */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              
              {/* Left Side - Test Image */}
              <div className="flex justify-center w-full order-1">
                <motion.div
                  key={currentQuestion}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full max-w-[350px] md:max-w-[450px] aspect-square bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center shadow-sm p-2"
                >
                   {/* Using fill + object-contain for responsive image */}
                  <div className="relative w-full h-full">
                    <Image 
                      src={currentTest.image} 
                      alt="Ishihara color test plate"
                      fill
                      className="rounded-xl object-contain"
                      sizes="(max-width: 768px) 100vw, 450px"
                      priority
                    />
                  </div>
                </motion.div>
              </div>

              {/* Right Side - Input and Keypad */}
              <div className="flex flex-col justify-center w-full max-w-md mx-auto lg:max-w-none order-2">
                <div className="mb-6 md:mb-8">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 md:py-6 text-center">
                    <div className="text-sm md:text-lg text-gray-500 mb-2">Your Answer:</div>
                    <div className="text-3xl md:text-4xl font-bold text-gray-900 h-10 md:h-12 flex items-center justify-center">
                      {currentInput || <span className="text-gray-400 text-2xl md:text-3xl">Enter number</span>}
                    </div>
                  </div>
                </div>

                {/* Responsive Keypad */}
                <div className="w-full">
                  <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <motion.button
                        key={num}
                        onClick={() => handleKeypadInput(num.toString())}
                        className="h-14 md:h-16 w-full bg-white border-2 border-gray-200 rounded-xl text-2xl md:text-3xl font-bold text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm active:scale-95"
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
                    <motion.button
                      onClick={() => handleKeypadInput('clear')}
                      className="h-14 md:h-16 w-full bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-sm md:text-lg font-bold transition-colors duration-200 shadow-sm active:scale-95"
                    >
                      Clear
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleKeypadInput('0')}
                      className="h-14 md:h-16 w-full bg-white border-2 border-gray-200 rounded-xl text-2xl md:text-3xl font-bold text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm active:scale-95"
                    >
                      0
                    </motion.button>

                    <motion.button
                      onClick={() => handleKeypadInput('submit')}
                      disabled={!currentInput.trim()}
                      className={`h-14 md:h-16 w-full rounded-xl text-sm md:text-lg font-bold transition-all duration-200 shadow-sm active:scale-95 ${
                        currentInput.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Submit
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={() => handleKeypadInput('cant-see')}
                    className="w-full h-14 md:h-16 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-base md:text-lg font-bold transition-colors duration-200 shadow-sm active:scale-95"
                  >
                    Can&apos;t See Any Number
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // 3. Results Screen (Responsive & Handling Save State)
  if (currentView === 'results') {
    // Perhitungan ini hanya untuk display sementara saat loading/saving
    // Karena setelah save berhasil, user akan di-redirect
    const results = calculateResults();
    
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 text-center"
          >
            {isSaving ? (
              <div className="py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900">Analyzing Results...</h2>
                <p className="text-gray-500">Please wait while our AI processes your vision data.</p>
              </div>
            ) : (
              <>
                {/* Fallback view if redirection fails or is slow */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    results.severity === 'none' ? 'bg-green-600' :
                    results.severity === 'mild' ? 'bg-yellow-600' :
                    results.severity === 'moderate' ? 'bg-amber-600' : 'bg-red-600'
                  }`}
                >
                  {results.severity === 'none' ? (
                    <CheckCircle size={32} className="text-white md:w-10 md:h-10" />
                  ) : (
                    <AlertTriangle size={32} className="text-white md:w-10 md:h-10" />
                  )}
                </motion.div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Test Complete
                </h1>
                <p className="text-gray-600 text-lg mb-8">
                  {results.diagnosis}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                   <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500">Accuracy</div>
                      <div className="text-xl font-bold text-gray-900">{results.accuracy}%</div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-sm text-gray-500">Type</div>
                      <div className="text-xl font-bold text-gray-900 capitalize">{results.deficiencyType}</div>
                   </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default ColorBlindnessDashboard;