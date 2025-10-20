'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

// Import the components
// ⬇️ FIXED PATHS: Removed the redundant './components/'
import FlightQuiz from './FlightQuiz';
import DailyStreak from './DailyStreak';
import QuickChallengeCard, { Challenge, ScrambleChallenge, ImageQuizChallenge } from './QuickChallengeCard';

// ✈️ New Interactive Challenge Data
// We now use the specific types for our array
const allChallenges: (Challenge)[] = [
  // --- NEW IMAGE QUIZZES ---
  // ** IMPORTANT: You must create these image paths in your /public folder **
  {
    type: 'imageQuiz',
    question: 'Which airline does this tail fin belong to?',
    imageUrl: '/images/tails/qantas.png', // Example: /public/images/tails/qantas.png
    options: ['Emirates', 'Qantas', 'Delta', 'Lufthansa'],
    answer: 'Qantas',
    explanation: 'That\'s the iconic "Flying Roo" of Qantas Airways.',
  },
  {
    type: 'imageQuiz',
    question: 'What aircraft is this?',
    imageUrl: '/images/silhouettes/a380.png', // Example: /public/images/silhouettes/a380.png
    options: ['Boeing 747', 'Airbus A380', 'Concorde', 'Boeing 737'],
    answer: 'Airbus A380',
    explanation: 'It\'s the Airbus A380, the world\'s largest passenger airliner.',
  },
  
  // --- Existing Challenges ---
  {
    type: 'trueFalse',
    question: 'The "black box" flight recorder is actually bright orange.',
    answer: true,
    explanation: 'This is to make it easier to find in wreckage.',
  },
  {
    type: 'scramble',
    question: 'Unscramble this major US airport code:',
    scrambled: 'KJF',
    answer: 'JFK',
    hint: 'Located in New York City',
  },
  {
    type: 'trueFalse',
    question: 'Planes can fly safely even if both engines fail.',
    answer: true,
    explanation: 'They become gliders! The "Gimli Glider" is a famous example.',
  },
  {
    type: 'scramble',
    question: 'Unscramble this major European airport code:',
    scrambled: 'RHL',
    answer: 'LHR',
    hint: 'The busiest airport in London, UK',
  },
  {
    type: 'imageQuiz',
    question: 'What aircraft is this famous silhouette?',
    imageUrl: '/images/silhouettes/concorde.png', // Example: /public/images/silhouettes/concorde.png
    options: ['SR-71 Blackbird', 'Boeing 747', 'Concorde', 'Tupolev Tu-144'],
    answer: 'Concorde',
    explanation: 'The droop-snoot of the supersonic Concorde is unmistakable!',
  },
];

// Helper to get random challenges
const getRandomChallenges = (num: number) => {
  return allChallenges.sort(() => 0.5 - Math.random()).slice(0, num);
};

// ------------------------------------
// Main FunSection Component
// ------------------------------------
export default function FunSection() {
  const [currentChallenges, setCurrentChallenges] = useState(() => getRandomChallenges(3));

  const handleNewChallenges = () => {
    setCurrentChallenges(getRandomChallenges(3));
  };

  return (
    <div className="relative flex flex-col items-center gap-12 p-4 md:p-8 w-full">

      {/* 🚀 New Daily Streak Component 🚀 */}
      <div className="absolute top-4 right-4 z-20">
        <DailyStreak />
      </div>

      {/* ✈️ New Interactive "Quick Challenge" Section */}
      <div className="w-full max-w-6xl z-10">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-3xl font-bold text-white">Quick Challenges</h2>
          <button
            onClick={handleNewChallenges}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-gray-700 text-white hover:bg-gray-600"
          >
            <RefreshCw size={16} />
            New Challenges
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {currentChallenges.map((challenge, idx) => (
            <QuickChallengeCard
              // Using a more stable key if possible, but index is ok for remounting
              key={`${challenge.type}-${idx}`}
              challenge={challenge}
              index={idx}
            />
          ))}
        </div>
      </div>

      {/* ✈️ Upgraded Quiz Section (with timer and high score) */}
      <div className="w-full flex justify-center z-10">
        <FlightQuiz />
      </div>
    </div>
  );
}