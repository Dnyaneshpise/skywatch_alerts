'use client';

import { useState } from 'react'; // <-- Added
import LiveRadar from '@/components/map/LiveRadar';
import { useAuth } from '@/hooks/UseAuth';
import { auth } from '@/lib/flights/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { LogIn, MessageSquare, X } from 'lucide-react'; // <-- Added MessageSquare and X
import StarfieldBackground from '@/components/StarfieldBackground';

/**
 * A placeholder component for the community chat window.
 */
const CommunityChat = ({ onClose }) => {
  return (
    <div className="fixed bottom-20 right-4 sm:right-8 w-full max-w-sm h-[500px] bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50">
      {/* Chat Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h3 className="font-bold text-white">Community Chat</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Chat Body (Placeholder) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {/* Example Messages */}
        <div className="text-sm">
          <span className="font-bold text-cyan-400">FlightFan123: </span>
          <span className="text-slate-300">
            Anyone spotting the A380 near Dubai?
          </span>
        </div>
        <div className="text-sm">
          <span className="font-bold text-amber-400">RadarGazer: </span>
          <span className="text-slate-300">
            Yeah, just saw it! Amazing.
          </span>
        </div>
        <div className="text-sm text-center text-slate-500 pt-4">
          (Chat functionality placeholder)
        </div>
      </div>

      {/* Chat Input (Placeholder) */}
      <div className="p-4 border-t border-slate-700">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          // You would add state and an onSubmit/onKeyDown handler here
        />
      </div>
    </div>
  );
};

export default function Home() {
  const { user, loading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false); // <-- Added state for chat

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  // 3. Add effect to listen for scroll events
  useEffect(() => {
    // Show button when user scrolls down
    const toggleVisibility = () => {
      if (window.scrollY > 300) { // Show after scrolling 300px
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []); // Empty dependency array ensures this runs only on mount/unmount

  // 4. Add function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // For a smooth scrolling animation
    });
  };

  return (
    // 5. Use a Fragment to wrap everything
    <>
      <StarfieldBackground />
      {/* Sign-In Prompt for Logged-Out Users */}
      {!loading && !user && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg text-center p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-3">
            Welcome to SkyWatch
          </h2>
          <p className="text-slate-400 mb-6">
            Sign in to set custom alerts and access your personal dashboard.
          </p>
        </div>

        {/* This is just to add extra space so you can test scrolling.
          You can remove this div.
        */}
        <div className="h-[1000px]"></div>

      </main>

      {/* 7. Add the Scroll-to-Top Button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-all duration-300 shadow-lg animate-fade-in"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </>
  );
}