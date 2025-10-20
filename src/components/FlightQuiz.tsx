'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, RefreshCw, Check, X, Timer } from 'lucide-react';

const QUIZ_TIMER_DURATION = 15; // 15 seconds per question
const HIGH_SCORE_KEY = 'flightQuizHighScore'; // Key for local storage

// ✈️ Expanded Flight Quiz Data
const quizData = [
  {
    question: "Which part of the airplane primarily provides lift?",
    options: ["Wings", "Wheels", "Tail", "Cockpit"],
    answer: "Wings",
  },
  {
    question: "What is the 'black box' in an airplane actually colored?",
    options: ["Black", "Orange", "Yellow", "Transparent"],
    answer: "Orange",
  },
  {
    question: "What does 'ATC' stand for in aviation?",
    options: [
      "Airplane Traffic Control",
      "Air Transport Command",
      "Air Traffic Control",
      "Aviation Terminal Center",
    ],
    answer: "Air Traffic Control",
  },
  {
    question: "What is the term for the 'engine' of a jet plane?",
    options: ["Propeller", "Turbine", "Motor", "Booster"],
    answer: "Turbine",
  },
];

const FlightQuiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIMER_DURATION);

  // Load high score from local storage on mount
  useEffect(() => {
    const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (quizFinished || isAnswered) {
      return; // Don't run timer if question is answered or quiz is over
    }

    if (timeLeft === 0) {
      handleAnswerClick('Time is up'); // Handle time's up
      return;
    }

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timeLeft, isAnswered, quizFinished]);

  // Reset timer for new question
  useEffect(() => {
    setTimeLeft(QUIZ_TIMER_DURATION);
  }, [currentQuestionIndex]);

  const currentQuestion = quizData[currentQuestionIndex];

  const handleAnswerClick = (option: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedAnswer(option);

    if (option === currentQuestion.answer) {
      setScore((prevScore) => prevScore + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    } else {
      // Quiz finished, check for new high score
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      }
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizFinished(false);
  };

  // --- Quiz Finished State ---
  if (quizFinished) {
    return (
      <div className="bg-gradient-to-br from-[#0B1E39] to-[#112A4D] text-white p-8 rounded-xl shadow-lg w-full max-w-md border border-blue-500/30 text-center">
        {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <Award className="mx-auto text-yellow-400 mb-4" size={64} />
          <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
          <p className="text-xl mb-2">You scored {score} out of {quizData.length}!</p>
          <p className="text-lg text-blue-300 mb-6">High Score: {highScore}</p>
          <button
            onClick={handleRestartQuiz}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 bg-blue-600 hover:bg-blue-700 hover:scale-105"
          >
            <RefreshCw size={18} />
            Restart Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  // --- Timer Bar ---
  const timerPercentage = (timeLeft / QUIZ_TIMER_DURATION) * 100;
  let timerColor = 'bg-green-500';
  if (timerPercentage < 50) timerColor = 'bg-yellow-500';
  if (timerPercentage < 25) timerColor = 'bg-red-500';

  // --- Quiz In-Progress State ---
  return (
    <div className="bg-gradient-to-br from-[#0B1E39] to-[#112A4D] text-white p-8 rounded-xl shadow-lg w-full max-w-md border border-blue-500/30">
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header & Timer */}
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-gray-400">
              Question {currentQuestionIndex + 1} of {quizData.length}
            </div>
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <Timer size={16} />
              <span>{timeLeft}s</span>
            </div>
          </div>
          {/* Timer Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-4">
            <motion.div
              className={`h-1.5 rounded-full ${timerColor}`}
              initial={{ width: '100%' }}
              animate={{ width: `${timerPercentage}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>

          <h3 className="text-2xl font-bold mb-4 text-center">🎯 Flight Quiz</h3>
          <p className="mb-6 text-center text-lg min-h-[56px]">{currentQuestion.question}</p>
          
          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((option) => {
              const isCorrect = option === currentQuestion.answer;
              const isSelected = option === selectedAnswer;
              
              let buttonClass = "bg-[#1E3A8A] hover:bg-[#2563EB] hover:scale-105";
              if (isAnswered) {
                if (isCorrect) buttonClass = "bg-green-600 text-white";
                else if (isSelected) buttonClass = "bg-red-600 text-white";
                else buttonClass = "bg-gray-700 text-gray-400 opacity-60";
              }

              return (
                <button
                  key={option}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg font-medium transition-all duration-300 ${buttonClass}`}
                  onClick={() => handleAnswerClick(option)}
                  disabled={isAnswered}
                >
                  {option}
                  {isAnswered && (
                    <span>
                      {isCorrect ? <Check size={20} /> : isSelected ? <X size={20} /> : null}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleNextQuestion}
              className="mt-6 w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 bg-blue-600 hover:bg-blue-700 hover:scale-105"
            >
              {currentQuestionIndex < quizData.length - 1 ? "Next Question" : "Finish Quiz"}
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FlightQuiz;