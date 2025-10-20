'use client';

import { useState, useEffect } from "react";
import Confetti from "react-confetti"; // npm install react-confetti

// Fun facts
const facts = [
  "The hottest planet in our solar system is Venus, not Mercury!",
  "Lightning strikes about 8 million times per day on Earth.",
  "A day on Venus is longer than a year on Venus.",
  "Saturn has a density lower than water — it could float!",
  "Tornadoes can reach speeds over 300 mph!",
  "The Milky Way galaxy contains over 100 billion stars."
];

// Mini quiz
const quiz = {
  question: "Which planet is known as the Red Planet?",
  options: ["Venus", "Mars", "Jupiter", "Saturn"],
  answer: "Mars"
};

export default function FunSection() {
  const [randomFacts, setRandomFacts] = useState(facts.slice(0, 3));
  const [selectedOption, setSelectedOption] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Rotate random facts every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRandomFacts(facts.sort(() => 0.5 - Math.random()).slice(0, 3));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle quiz answer
  const handleAnswer = (option: string) => {
    setSelectedOption(option);
    if (option === quiz.answer) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Confetti */}
      {showConfetti && <Confetti recycle={false} numberOfPieces={150} />}

      {/* Fact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {randomFacts.map((fact, idx) => (
          <div
            key={idx}
            className="bg-purple-700/80 text-white p-6 rounded-xl shadow-lg text-center animate-fade-in hover:scale-105 transition-transform duration-300"
          >
            <p className="text-lg italic">{fact}</p>
          </div>
        ))}
      </div>

      {/* Mini Quiz */}
      <div className="bg-purple-800/90 text-white p-6 rounded-xl shadow-lg w-full max-w-md animate-fade-in">
        <h3 className="text-2xl font-bold mb-4">🎯 Quiz Time!</h3>
        <p className="mb-4">{quiz.question}</p>
        <div className="flex flex-col gap-2">
          {quiz.options.map((option) => (
            <button
              key={option}
              className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                selectedOption
                  ? option === quiz.answer
                    ? "bg-green-500"
                    : option === selectedOption
                    ? "bg-red-500"
                    : "bg-purple-600"
                  : "bg-purple-500 hover:bg-purple-600"
              }`}
              onClick={() => handleAnswer(option)}
              disabled={!!selectedOption}
            >
              {option}
            </button>
          ))}
        </div>
        {selectedOption && (
          <p className="mt-3 font-semibold">
            {selectedOption === quiz.answer ? "✅ Correct!" : "❌ Try again next time!"}
          </p>
        )}
      </div>
    </div>
  );
}
