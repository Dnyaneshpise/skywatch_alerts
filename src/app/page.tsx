'use client';

// 1. Import useState, useEffect, and the ArrowUp icon
import { useState, useEffect } from "react";
import LiveRadar from "@/components/map/LiveRadar";
import { useAuth } from "@/hooks/UseAuth";
import { auth } from "@/lib/flights/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { LogIn, ArrowUp } from "lucide-react"; // <-- Added ArrowUp
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

        <div className="mt-8 text-center">
          <p className="text-slate-400">
            Real-time flight tracking with proximity alerts
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