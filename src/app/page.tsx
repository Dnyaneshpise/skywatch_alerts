'use client';

import LiveRadar from "@/components/map/LiveRadar";
import { useAuth } from "@/hooks/UseAuth";
import { auth } from "@/lib/flights/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { LogIn } from "lucide-react";
import StarfieldBackground from '@/components/StarfieldBackground';
export default function Home() {
  const { user, loading } = useAuth();

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <StarfieldBackground />
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
    </main>
  );
}
