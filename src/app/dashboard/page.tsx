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

// Define types for our data
interface Answer {
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
  options: string[];
  description: string;
  difficulty: string;
}

// Sample Ishihara test data (in real app, you&apos;d have actual test images)
const ishiharaTests: IshiharaTest[] = [
  {
    id: 1,
    image: "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='95' fill='%23f0f0f0' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='100' y='110' text-anchor='middle' font-size='60' font-weight='bold' fill='%2388c999'%3E8%3C/text%3E%3C/svg%3E",
    correctAnswer: "8",
    options: ["3", "8", "5", "0"],
    description: "Normal vision should see number 8",
    difficulty: "easy"
  },
  {
    id: 2,
    image: "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='95' fill='%23f0f0f0' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='100' y='110' text-anchor='middle' font-size='60' font-weight='bold' fill='%23ff6b6b'%3E29%3C/text%3E%3C/svg%3E",
    correctAnswer: "29",
    options: ["70", "29", "79", "Cannot see"],
    description: "Test for red-green color blindness",
    difficulty: "medium"
  },
  {
    id: 3,
    image: "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='95' fill='%23f0f0f0' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='100' y='110' text-anchor='middle' font-size='60' font-weight='bold' fill='%234dabf7'%3E5%3C/text%3E%3C/svg%3E",
    correctAnswer: "5",
    options: ["2", "5", "3", "Cannot see"],
    description: "Blue-yellow color vision test",
    difficulty: "hard"
  },
  {
    id: 4,
    image: "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='100' cy='100' r='95' fill='%23f0f0f0' stroke='%23ddd' stroke-width='2'/%3E%3Ctext x='100' y='110' text-anchor='middle' font-size='60' font-weight='bold' fill='%2394a3b8'%3E42%3C/text%3E%3C/svg%3E",
    correctAnswer: "42",
    options: ["42", "24", "72", "Cannot see"],
    description: "Advanced color discrimination test",
    difficulty: "hard"
  }
];

const ColorBlindnessDashboard = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'test' | 'results'>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  // Use useCallback to memoize handleAnswer to avoid useEffect dependency issues
  const handleAnswer = useCallback((answer: string) => {
    const newAnswers: Answer[] = [...answers, {
      questionId: ishiharaTests[currentQuestion].id,
      userAnswer: answer,
      correctAnswer: ishiharaTests[currentQuestion].correctAnswer,
      isCorrect: answer === ishiharaTests[currentQuestion].correctAnswer,
      timeToAnswer: 30 - timeRemaining
    }];
    
    setAnswers(newAnswers);

    if (currentQuestion < ishiharaTests.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setTimeRemaining(30);
    } else {
      setTestCompleted(true);
      setTestStarted(false);
      setCurrentView('results');
    }
  }, [answers, currentQuestion, timeRemaining]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testStarted && !testCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAnswer('timeout');
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, testCompleted, timeRemaining, handleAnswer]);

  const startTest = () => {
    setCurrentView('test');
    setTestStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setTestCompleted(false);
    setTimeRemaining(30);
  };

  const calculateResults = () => {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const accuracy = (correctAnswers / answers.length) * 100;
    
    let diagnosis = "Normal Color Vision";
    let recommendation = "Your color vision appears to be normal. No further testing needed.";
    let severity: "none" | "medium" | "high" = "none";

    if (accuracy < 50) {
      diagnosis = "Possible Color Vision Deficiency";
      recommendation = "Consider consulting an eye care professional for comprehensive testing.";
      severity = "high";
    } else if (accuracy < 75) {
      diagnosis = "Mild Color Vision Issues";
      recommendation = "Monitor your color vision and consider professional evaluation.";
      severity = "medium";
    }

    return { correctAnswers, accuracy, diagnosis, recommendation, severity };
  };

  const resetTest = () => {
    setCurrentView('welcome');
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeRemaining(30);
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
                <h3 className="font-semibold text-gray-900 mb-2">4 Questions</h3>
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
                  Look at each color plate and identify the number you see
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
                  Select &quot;Cannot see&quot; if no number is visible
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
        <div className="max-w-3xl mx-auto">
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

            {/* Test Image */}
            <div className="flex justify-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-80 h-80 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center shadow-sm"
              >
                {/* Using img element for data URLs is acceptable */}
                <img 
                  src={currentTest.image} 
                  alt="Ishihara color test plate"
                  className="w-72 h-72 rounded-xl"
                />
              </motion.div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {currentTest.options.map((option, index) => (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleAnswer(option)}
                  className="p-4 border-2 border-gray-200 rounded-xl text-lg font-semibold text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option}
                </motion.button>
              ))}
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
                AI Analysis &amp; Recommendations
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