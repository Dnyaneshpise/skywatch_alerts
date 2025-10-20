'use client';

import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const STREAK_KEY = 'flightFunStreak';

interface StreakData {
  count: number;
  lastVisit: number; // Timestamp
}

const isSameDay = (ts1: number, ts2: number) => {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isYesterday = (ts1: number, ts2: number) => {
  const yesterday = new Date(ts1);
  yesterday.setDate(yesterday.getDate() - 1);
  const d2 = new Date(ts2);
  
  return (
    yesterday.getFullYear() === d2.getFullYear() &&
    yesterday.getMonth() === d2.getMonth() &&
    yesterday.getDate() === d2.getDate()
  );
};

const DailyStreak = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const now = Date.now();
    let currentStreak = 0;
    
    try {
      const storedData = localStorage.getItem(STREAK_KEY);
      if (storedData) {
        const data: StreakData = JSON.parse(storedData);
        
        if (isSameDay(now, data.lastVisit)) {
          // Already visited today, just show the streak
          currentStreak = data.count;
        } else if (isYesterday(now, data.lastVisit)) {
          // Visited yesterday, increment streak
          currentStreak = data.count + 1;
          localStorage.setItem(STREAK_KEY, JSON.stringify({ count: currentStreak, lastVisit: now }));
        } else {
          // Missed a day, reset streak to 1
          currentStreak = 1;
          localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastVisit: now }));
        }
      } else {
        // First visit
        currentStreak = 1;
        localStorage.setItem(STREAK_KEY, JSON.stringify({ count: 1, lastVisit: now }));
      }
    } catch (error) {
      console.error("Failed to access local storage for streak:", error);
      currentStreak = 1; // Default to 1 if local storage fails
    }
    
    setStreak(currentStreak);
  }, []);

  if (streak === 0) return null; // Don't show if streak is 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg"
    >
      <Flame size={20} />
      <span>{streak} Day Streak!</span>
    </motion.div>
  );
};

export default DailyStreak;