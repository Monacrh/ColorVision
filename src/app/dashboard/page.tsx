'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Home,
  FileText,
  AlertTriangle,
  Award
} from 'lucide-react';
import Image from 'next/image';

// Type definitions
interface TestAnswer {
  questionId: number;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeToAnswer: number;
}

interface IshiharaTest {
  id: number;
  image: string;
  correctAnswer: string;
  description: string;
  difficulty: string;
}

// **FIXED**: Corrected the `correctAnswer` values to match standard Ishihara plates.
const ishiharaTests: IshiharaTest[] = [
  {
    id: 1,
    image: "/Ishihara/Ishihara_Tests_page-0003.jpg", // Plate 3: Everyone should see 12
    correctAnswer: "12",
    description: "Control plate - everyone should see this number",
    difficulty: "control"
  },
  {
    id: 2,
    image: "/Ishihara/Ishihara_Tests_page-0004.jpg", // Plate 4: Normal: 8, Red-green deficiency: 3
    correctAnswer: "8",
    description: "Red-green color blindness screening",
    difficulty: "easy"
  },
  {
    id: 3,
    image: "/Ishihara/Ishihara_Tests_page-0005.jpg", // Plate 5: Normal: 6, Red-green deficiency: 5
    correctAnswer: "29",
    description: "Red-green color vision test",
    difficulty: "easy"
  },
  {
    id: 4,
    image: "/Ishihara/Ishihara_Tests_page-0006.jpg", // Plate 6: Normal: 29, Red-green deficiency: 70
    correctAnswer: "5",
    description: "Advanced red-green discrimination test",
    difficulty: "medium"
  },
  {
    id: 5,
    image: "/Ishihara/Ishihara_Tests_page-0007.jpg", // Plate 7: Normal: 57, Red-green deficiency: 35
    correctAnswer: "3",
    description: "Red-green color blindness detection",
    difficulty: "medium"
  },
  {
    id: 6,
    image: "/Ishihara/Ishihara_Tests_page-0008.jpg", // Plate 8: Normal: 5, Red-green deficiency: 2
    correctAnswer: "15",
    description: "Color discrimination assessment",
    difficulty: "medium"
  },
  {
    id: 7,
    image: "/Ishihara/Ishihara_Tests_page-0009.jpg", // Plate 9: Normal: 3, Red-green deficiency: 5
    correctAnswer: "74",
    description: "Red-green vision evaluation",
    difficulty: "medium"
  },
  {
    id: 8,
    image: "/Ishihara/Ishihara_Tests_page-0010.jpg", // Plate 10: Normal: 15, Red-green deficiency: 17
    correctAnswer: "6",
    description: "Color perception test",
    difficulty: "hard"
  },
  {
    id: 9,
    image: "/Ishihara/Ishihara_Tests_page-0011.jpg", // Plate 11: Normal: 74, Red-green deficiency: 21
    correctAnswer: "45",
    description: "Color perception test",
    difficulty: "hard"
  },
  {
    id: 10,
    image: "/Ishihara/Ishihara_Tests_page-0012.jpg", // Plate 12: Normal: 6
    correctAnswer: "5",
    description: "Color perception test",
    difficulty: "hard"
  },
];

const ColorBlindnessDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'test' | 'results'>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);

  const handleAnswer = useCallback((answer: string) => {
    const newAnswers: TestAnswer[] = [...answers, {
      questionId: ishiharaTests[currentQuestion].id,
      userAnswer: answer,
      correctAnswer: ishiharaTests[currentQuestion].correctAnswer,
      isCorrect: answer === ishiharaTests[currentQuestion].correctAnswer,
      timeToAnswer: 30 - timeRemaining
    }];
    
    setAnswers(newAnswers);
    setCurrentInput('');

    if (currentQuestion < ishiharaTests.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeRemaining(30);
    } else {
      setTestCompleted(true);
      setTestStarted(false);
      setCurrentView('results');
    }
  }, [answers, currentQuestion, timeRemaining]);

  useEffect(() => {
    // This function will run whenever the component updates.
    // We only want to save results when the view switches to 'results'.
    if (currentView === 'results' && answers.length > 0) {
      
      const saveTestResults = async () => {
        const results = calculateResults(); // You need to calculate results first!

        try {
          const response = await fetch('/api/test-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              answers: answers,
              summary: {
                totalQuestions: ishiharaTests.length,
                correctAnswers: results.correctAnswers,
                accuracy: results.accuracy,
                totalTime: answers.reduce((acc, a) => acc + a.timeToAnswer, 0),
                diagnosis: results.diagnosis,
                severity: results.severity,
              },
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to save test results.');
          }

          const data = await response.json();
          if (data.success) {
            console.log('Test results saved!', data.id);
          }
        } catch (error) {
          console.error('Error saving test results:', error);
        }
      };

      saveTestResults();
    }
  }, [currentView, answers]);

  // Timer effect
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
      if (interval) {
        clearInterval(interval);
      }
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
      // Handle number input (limit to 2 digits)
      if (currentInput.length < 2 && !currentInput.includes("Can't see")) {
        setCurrentInput(prev => prev + value);
      }
    }
  };

  const calculateResults = () => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / answers.length) * 100;
    
    let diagnosis = "Normal Color Vision";
    let recommendation = "Your color vision appears to be normal. No further testing needed.";
    let severity = "none";

    // **FIXED**: Used `if...else if` to prevent overlapping conditions and ensure correct diagnosis.
    if (correctAnswers <= 3) {
      diagnosis = "Significant Color Vision Deficiency";
      recommendation = "Strong indication of color vision deficiency. Consult an eye care professional immediately for comprehensive testing.";
      severity = "high";
    } else if (correctAnswers <= 5) {
      diagnosis = "Moderate Color Vision Issues";
      recommendation = "Possible color vision deficiency detected. Professional evaluation recommended.";
      severity = "high";
    } else if (correctAnswers <= 7) {
      diagnosis = "Mild Color Vision Issues";
      recommendation = "Some color vision difficulties detected. Consider professional consultation.";
      severity = "medium";
    } else if (correctAnswers === 8 || correctAnswers === 9) {
      diagnosis = "Borderline Color Vision";
      recommendation = "Minor color vision variations detected. Monitor and consider professional evaluation if concerned.";
      severity = "medium";
    }

    return { correctAnswers, accuracy, diagnosis, recommendation, severity };
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
            {/* Header */}
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

            {/* Test Information Cards */}
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
                <h3 className="font-semibold text-gray-900 mb-2">10 Questions</h3>
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

            {/* Instructions */}
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

            {/* Start Button */}
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
    const currentTest = ishiharaTests[currentQuestion];
    const progress = ((currentQuestion + 1) / ishiharaTests.length) * 100;

    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Question {currentQuestion + 1} of {ishiharaTests.length}
                </h2>
                <p className="text-gray-600">{currentTest.description}</p>
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

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Main Content - Side by Side Layout */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Test Image (Much Larger) */}
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
                {/* Input Display */}
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
                  {/* Number Grid */}
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

                  {/* Zero and Special Buttons */}
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

                  {/* Can't See Button */}
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

  // Results Screen
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
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  results.severity === 'none' ? 'bg-green-600' :
                  results.severity === 'medium' ? 'bg-amber-600' : 'bg-red-600'
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

            {/* Results Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {results.correctAnswers}/{answers.length}
                </div>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {Math.round(results.accuracy)}%
                </div>
                <p className="text-sm text-gray-600">Accuracy Score</p>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {answers.reduce((acc, a) => acc + a.timeToAnswer, 0)}s
                </div>
                <p className="text-sm text-gray-600">Total Time</p>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                AI Analysis & Recommendations
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {results.recommendation}
              </p>
              {results.severity !== 'none' && (
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> This is a screening test and not a substitute for professional diagnosis. 
                    Please consult with an eye care professional for comprehensive evaluation.
                  </p>
                </div>
              )}
            </div>

            {/* Detailed Results */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Detailed Results</h3>
              <div className="space-y-3">
                {answers.map((answer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">Question {index + 1}</span>
                      <span className="text-gray-500 ml-2">
                        Your answer: {answer.userAnswer}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {answer.timeToAnswer}s
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
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={resetTest}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RotateCcw size={20} />
                <span>Take Test Again</span>
              </motion.button>

              <motion.button
                onClick={() => setCurrentView('welcome')}
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
  }

  return null;
};

export default ColorBlindnessDashboard;