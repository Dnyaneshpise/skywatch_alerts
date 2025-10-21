'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, BrainCircuit, Check, X } from 'lucide-react';

// --- Define Challenge Types ---
export type TrueFalseChallenge = {
  type: 'trueFalse';
  question: string;
  answer: boolean;
  explanation: string;
};

export type ScrambleChallenge = {
  type: 'scramble';
  question: string;
  scrambled: string;
  answer: string;
  hint: string;
};

// NEW TYPE
export type ImageQuizChallenge = {
  type: 'imageQuiz';
  question: string;
  imageUrl: string; // URL to the image (e.g., /images/tails/qantas.png)
  options: string[];
  answer: string;
  explanation: string;
};

// Union type
export type Challenge = TrueFalseChallenge | ScrambleChallenge | ImageQuizChallenge;

// --- Component Props ---
interface QuickChallengeCardProps {
  challenge: Challenge;
  index: number;
}

const QuickChallengeCard: React.FC<QuickChallengeCardProps> = ({ challenge, index }) => {
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [scrambleInput, setScrambleInput] = useState('');

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, duration: 0.4 } },
  };

  const handleTrueFalse = (userAnswer: boolean) => {
    if (challenge.type !== 'trueFalse' || isAnswered) return;
    const correct = userAnswer === challenge.answer;
    setIsCorrect(correct);
    setIsAnswered(true);
    setSelectedAnswer(userAnswer.toString());
  };

  const handleScrambleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (challenge.type !== 'scramble' || isAnswered) return;
    const correct = scrambleInput.trim().toUpperCase() === challenge.answer.toUpperCase();
    setIsCorrect(correct);
    setIsAnswered(true);
  };
  
  const handleImageQuizAnswer = (option: string) => {
    if (challenge.type !== 'imageQuiz' || isAnswered) return;
    const correct = option === challenge.answer;
    setIsCorrect(correct);
    setIsAnswered(true);
    setSelectedAnswer(option);
  };

  const baseStyle = "bg-gradient-to-br from-[#0B1E39] to-[#112A4D] text-white p-6 rounded-xl shadow-lg border border-blue-500/30 flex flex-col";
  const correctStyle = "shadow-green-500/40 border-green-500/50";
  const incorrectStyle = "shadow-red-500/40 border-red-500/50";
  
  let dynamicStyle = baseStyle;
  if (isAnswered) {
    dynamicStyle += isCorrect ? ` ${correctStyle}` : ` ${incorrectStyle}`;
  }

  // --- Determine Title ---
  let title = "Quick Challenge";
  if (challenge.type === 'trueFalse') title = 'True or False?';
  if (challenge.type === 'scramble') title = 'Unscramble the Code';
  if (challenge.type === 'imageQuiz') title = 'Identify This!';

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className={dynamicStyle}>
      <div className="flex items-center gap-3 mb-4">
        <BrainCircuit className="text-blue-300 flex-shrink-0" size={24} />
        <h4 className="font-bold text-lg">{title}</h4>
      </div>
      
      <p className="text-base mb-4 min-h-[40px]">{challenge.question}</p>
      
      {/* Spacer to push content down */}
      <div className="flex-grow" />

      {/* --- True/False Render --- */}
      {challenge.type === 'trueFalse' && (
        <div className="flex gap-3">
          <button
            onClick={() => handleTrueFalse(true)}
            disabled={isAnswered}
            className={`w-full py-2 rounded-lg font-medium ${!isAnswered ? 'bg-green-600 hover:bg-green-700' : (challenge.answer === true ? 'bg-green-600' : 'bg-gray-600 opacity-70')}`}
          >
            True
          </button>
          <button
            onClick={() => handleTrueFalse(false)}
            disabled={isAnswered}
            className={`w-full py-2 rounded-lg font-medium ${!isAnswered ? 'bg-red-600 hover:bg-red-700' : (challenge.answer === false ? 'bg-green-600' : 'bg-gray-600 opacity-70')}`}
          >
            False
          </button>
        </div>
      )}

      {/* --- Scramble Render --- */}
      {challenge.type === 'scramble' && (
        <form onSubmit={handleScrambleSubmit}>
          <p className="text-center text-3xl font-mono tracking-widest mb-2">{challenge.scrambled}</p>
          <p className="text-center text-sm text-gray-400 mb-3 italic">{challenge.hint}</p>
          <input
            type="text"
            value={scrambleInput}
            onChange={(e) => setScrambleInput(e.target.value)}
            disabled={isAnswered}
            maxLength={3}
            className="w-full p-2 rounded-lg bg-[#071324] text-white text-center font-mono text-lg tracking-widest uppercase border border-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="???"
          />
          {!isAnswered && (
            <button
              type="submit"
              className="w-full mt-3 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          )}
        </form>
      )}
      
      {/* --- Image Quiz Render (NEW) --- */}
      {challenge.type === 'imageQuiz' && (
        <div className="flex flex-col gap-3">
          <div className="w-full h-40 bg-[#071324] rounded-lg mb-3 overflow-hidden border border-blue-500/30">
            {/* You must provide the images in your /public folder */}
            <img src={challenge.imageUrl} alt="Quiz challenge image" className="w-full h-full object-contain" />
          </div>
          {challenge.options.map((option) => {
            const isCorrect = option === challenge.answer;
            const isSelected = option === selectedAnswer;
            
            let buttonClass = "bg-[#1E3A8A] hover:bg-[#2563EB]";
            if (isAnswered) {
              if (isCorrect) buttonClass = "bg-green-600 text-white";
              else if (isSelected) buttonClass = "bg-red-600 text-white";
              else buttonClass = "bg-gray-700 text-gray-400 opacity-60";
            }
            
            return (
              <button
                key={option}
                onClick={() => handleImageQuizAnswer(option)}
                disabled={isAnswered}
                className={`w-full py-2 px-3 rounded-lg font-medium transition-all duration-300 flex justify-between items-center ${buttonClass}`}
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
      )}

      {/* --- Answer Feedback --- */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 flex items-center gap-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}
        >
          {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span className="text-sm">
            {isCorrect ? 'Correct!' : 'Incorrect.'}{' '}
            {challenge.type === 'trueFalse' 
              ? challenge.explanation 
              : `The answer was ${challenge.answer}. ${challenge.type === 'imageQuiz' ? challenge.explanation : ''}`
            }
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuickChallengeCard;