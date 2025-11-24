'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Eye, Clock, CheckCircle, XCircle, RotateCcw, Home, FileText, AlertTriangle, Award
} from 'lucide-react';
import Image from 'next/image';
import { IshiharaDecisionTree } from '@/lib/ishiharaDecisionTree';
import { testPlates } from '@/lib/ishiharaPlate'; // Use filtered version
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
  const router = useRouter();

  const handleAnswer = useCallback((answer: string) => {
    const currentPlate = testPlates[currentQuestion]; // Changed from ishiharaPlates
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

    if (currentQuestion < testPlates.length - 1) { // Changed
      setCurrentQuestion(prev => prev + 1);
      setTimeRemaining(30);
    } else {
      setTestCompleted(true);
      setTestStarted(false);
      setCurrentView('results');
    }
  }, [answers, currentQuestion, timeRemaining]);

  useEffect(() => {
    if (currentView === 'results' && answers.length > 0) {
      const saveTestResults = async () => {
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
            // Redirect ke halaman result dengan ID
            router.push(`/results/${data.id}`);
          }
        } catch (error) {
          console.error('Error saving test results:', error);
          // Fallback: tetap tampilkan results di halaman current jika error
          setCurrentView('results');
        }
      };

      saveTestResults();
    }
  }, [currentView, answers, router]);

  // Timer effect (same as before)
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

  const calculateResults = () => {
    const startTime = performance.now();

    const decisionTree = new IshiharaDecisionTree(testPlates); // Changed
    const result = decisionTree.analyzeResults(answers);

    // 2. Hentikan timer & hitung selisih
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
  };

  const resetTest = () => {
    setCurrentView('welcome');
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeRemaining(30);
    setCurrentInput('');
    setTestStarted(false);
    setTestCompleted(false);
  };

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
              >
                <Eye size={40} className="text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Color Vision Assessment
              </h1>
              <p className="text-gray-600 text-lg">
                AI-Powered Ishihara Color Blindness Test
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center"
              >
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Quick Test</h3>
                <p className="text-sm text-gray-600">30 seconds per question</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-green-50 border border-green-100 rounded-xl p-6 text-center"
              >
                <FileText className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{testPlates.length} Questions</h3>
                <p className="text-sm text-gray-600">Comprehensive screening</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-purple-50 border border-purple-100 rounded-xl p-6 text-center"
              >
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">Instant results</p>
              </motion.div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                Test Instructions
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Enter the number you see using the keypad
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  You have 30 seconds to answer each question
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Ensure good lighting and view from arm&apos;s length
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  Press &quot;Can&apos;t See&quot; if no number is visible
                </li>
              </ul>
            </div>

            <motion.button
              onClick={startTest}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-3"
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

  // Test Screen
  if (currentView === 'test') {
    const currentTest = testPlates[currentQuestion]; // Changed
    const progress = ((currentQuestion + 1) / testPlates.length) * 100; // Changed

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Question {currentQuestion + 1} of {testPlates.length}
                </h2>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock size={18} className="text-gray-500" />
                  <span className={`font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
                    {timeRemaining}s
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(progress)}% complete
                </div>
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Test Image */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-[500px] h-[500px] bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center shadow-lg p-4"
                >
                  <Image 
                    src={currentTest.image} 
                    alt="Ishihara color test plate"
                    width={450}
                    height={450}
                    className="w-[450px] h-[450px] rounded-xl object-contain"
                  />
                </motion.div>
              </div>

              {/* Right Side - Input and Keypad */}
              <div className="flex flex-col justify-center">
                <div className="mb-8">
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-8 py-6 text-center">
                    <div className="text-lg text-gray-500 mb-3">Your Answer:</div>
                    <div className="text-4xl font-bold text-gray-900 h-12">
                      {currentInput || <span className="text-gray-400">Enter number</span>}
                    </div>
                  </div>
                </div>

                {/* Keypad */}
                <div className="max-w-lg mx-auto">
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <motion.button
                        key={num}
                        onClick={() => handleKeypadInput(num.toString())}
                        className="h-16 w-24 bg-white border-2 border-gray-200 rounded-xl text-3xl font-bold text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <motion.button
                      onClick={() => handleKeypadInput('clear')}
                      className="h-16 w-24 bg-gray-600 hover:bg-gray-700 text-white rounded-xl text-lg font-bold transition-colors duration-200 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Clear
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleKeypadInput('0')}
                      className="h-16 w-24 bg-white border-2 border-gray-200 rounded-xl text-3xl font-bold text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      0
                    </motion.button>

                    <motion.button
                      onClick={() => handleKeypadInput('submit')}
                      disabled={!currentInput.trim()}
                      className={`h-16 w-24 rounded-xl text-lg font-bold transition-all duration-200 shadow-sm ${
                        currentInput.trim() 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={currentInput.trim() ? { scale: 1.05 } : {}}
                      whileTap={currentInput.trim() ? { scale: 0.95 } : {}}
                    >
                      Submit
                    </motion.button>
                  </div>

                  <motion.button
                    onClick={() => handleKeypadInput('cant-see')}
                    className="w-full h-16 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-lg font-bold transition-colors duration-200 shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
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

  // Results Screen (same as before, just replace ishiharaPlates with testPlates)
  if (currentView === 'results') {
    const results = calculateResults();
    
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            {/* ... Rest of results screen code (same as before) */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  results.severity === 'none' ? 'bg-green-600' :
                  results.severity === 'mild' ? 'bg-yellow-600' :
                  results.severity === 'moderate' ? 'bg-amber-600' : 'bg-red-600'
                }`}
              >
                {results.severity === 'none' ? (
                  <CheckCircle size={40} className="text-white" />
                ) : (
                  <AlertTriangle size={40} className="text-white" />
                )}
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Test Complete
              </h1>
              <p className="text-gray-600 text-lg">
                {results.diagnosis}
              </p>
            </div>

            {/* Results continue as before... */}
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
};

export default ColorBlindnessDashboard;