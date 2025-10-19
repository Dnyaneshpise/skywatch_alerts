'use client';

import LiveRadar from "@/components/map/LiveRadar";
import { useAuth } from "@/hooks/UseAuth";
import { auth } from "@/lib/flights/firebase";
// Updated Firebase imports to include signOut
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// Cleaned up Lucide imports
import { LogIn, LogOut, MessageSquare } from "lucide-react";
// Added Link for navigation
import Link from "next/link";
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

  // Added Handle Sign-Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <StarfieldBackground />
      
      {/* --- Auth & Community Section --- */}
      {/* This wrapper div prevents layout shifts while auth is loading */}
      <div className="mb-8 min-h-[190px]">
        {!loading && (
          <>
            {/* Sign-In Prompt for Logged-Out Users */}
            {!user && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg text-center p-8">
                <h2 className="text-2xl font-bold text-white mb-3">Welcome to SkyWatch</h2>
                <p className="text-slate-400 mb-6">
                  Sign in for alerts or join the community discussion.
                </p>
                {/* Button Container */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    onClick={handleGoogleSignIn}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 bg-cyan-500 hover:bg-cyan-600 text-white shadow-md hover:shadow-lg"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Sign In with Google</span>
                  </button>
                  {/* "Community Chat" Button */}
                  <Link
                    href="/chat"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Community Chat</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Welcome & Sign-Out for Logged-In Users */}
            {user && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg text-center p-8">
                <h2 className="text-2xl font-bold text-white mb-3">
                  Welcome, {user.displayName || 'Pilot'}!
                </h2>
                <p className="text-slate-400 mb-6">
                  View the radar, join the chat, or manage your account.
                </p>
                {/* Button Container */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  {/* "Sign Out" Button */}
                  <button
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                  {/* "Community Chat" Button */}
                  <Link
                    href="/chat"
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Community Chat</span>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* --- End Auth & Community Section --- */}


      {/* Live Radar Map (Unchanged) */}
      <div className="bg-slate-800/50 rounded-xl shadow-lg p-4 border border-slate-700/50">
        <LiveRadar />
      </div>

      {/* Footer Text (Unchanged) */}
      <div className="mt-8 text-center">
        <p className="text-slate-400">
          Real-time flight tracking with proximity alerts
        </p>
      </div>
    </main>
  );
}