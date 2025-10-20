'use client';

// 1. Import useState, useEffect, and the ArrowUp icon
import { useState, useEffect } from "react";
import Link from "next/link";
import LiveRadar from "@/components/map/LiveRadar";
import { useAuth } from "@/hooks/UseAuth";
import { auth } from "@/lib/flights/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { LogIn, ArrowUp } from "lucide-react"; // <-- Added ArrowUp
import { FaChartLine, FaBell } from "react-icons/fa";
import StarfieldBackground from '@/components/StarfieldBackground';

export default function Home() {
  const { user, loading } = useAuth();
  
  // 2. Add state to track button visibility
  const [isVisible, setIsVisible] = useState(false);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in error:", error);
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
      
      {/* 6. Added 'relative' and 'z-10' to <main>
        This ensures it sits above the z-index: -1 background
      */}
      <main className="container mx-auto py-8 px-4 relative z-10">
        
        {/* Sign-In Prompt for Logged-Out Users */}
        {!loading && !user && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg text-center p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">Welcome to SkyWatch</h2>
            <p className="text-slate-400 mb-6">
              Sign in to set custom alerts and access your personal dashboard.
            </p>
            <button
              onClick={handleGoogleSignIn}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-lg"
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}

        {/* Live Radar Map */}
        <div className="bg-slate-800/50 rounded-xl shadow-lg p-4 border border-slate-700/50">
          <LiveRadar />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <FaChartLine className="text-blue-400" />
              Flight Statistics
            </h3>
            <p className="text-slate-300 mb-4">
              View real-time analytics of nearby air traffic including altitude distribution, speed analysis, and flight patterns.
            </p>
            <Link 
              href="/statistics" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300"
            >
              View Statistics
            </Link>
          </div>
          <div className="mt-8 text-center">
  <Link
    href="/fun-section"
    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-300 shadow-md"
  >
    Fun Section
  </Link>
</div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <FaBell className="text-yellow-400" />
              Flight Alerts
            </h3>
            <p className="text-slate-300 mb-4">
              Set up custom alerts to get notified when aircraft enter your defined radius. Perfect for aviation enthusiasts!
            </p>
            <Link 
              href="/alerts" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-300"
            >
              {user ? 'Manage Alerts' : 'Sign in for Alerts'}
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400">
            Real-time flight tracking with proximity alerts and detailed analytics
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