// src/app/profile/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/UseAuth';
import { auth } from '@/lib/flights/firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import the Link component
import { UserRound, ShieldCheck } from 'lucide-react'; // Import a new icon

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [updateStatus, setUpdateStatus] = useState('');
  
  // --- NEW: Mock data for the user's alert stats ---
  // In a real application, you would fetch this from your database.
  const [alertCount] = useState(1); // Using the initial alert from the alerts page

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (auth.currentUser && displayName.trim() !== '') {
      setUpdateStatus('Updating...');
      try {
        await updateProfile(auth.currentUser, { displayName });
        setIsEditing(false);
        setUpdateStatus('Profile updated successfully!');
        setTimeout(() => window.location.reload(), 1000);
      } catch (error) {
        console.error("Error updating profile:", error);
        setUpdateStatus('Failed to update profile.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg p-8">
        
        <div className="flex flex-col items-center">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full border-2 border-cyan-400"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-slate-700">
              <UserRound className="w-12 h-12 text-slate-400" />
            </div>
          )}

          {!isEditing ? (
            <div className="text-center mt-4">
              <h1 className="text-2xl font-bold text-white">
                {user.displayName || 'Welcome!'}
              </h1>
              <button
                onClick={() => {
                  setDisplayName(user.displayName || '');
                  setIsEditing(true);
                }}
                className="text-sm text-cyan-400 hover:underline mt-1"
              >
                Edit Name
              </button>
            </div>
          ) : (
            <div className="w-full mt-4">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-md p-2 text-center focus:ring-cyan-400 focus:border-cyan-400"
              />
              <div className="flex justify-center space-x-2 mt-2">
                <button onClick={handleUpdateProfile} className="text-sm bg-cyan-500 text-black px-3 py-1 rounded hover:bg-cyan-400">Save</button>
                <button onClick={() => setIsEditing(false)} className="text-sm bg-slate-600 px-3 py-1 rounded hover:bg-slate-500">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {updateStatus && <p className="text-center text-sm text-green-400 my-4">{updateStatus}</p>}

        {/* --- NEW: Project-Specific Stats Section --- */}
        <div className="my-8 border-t border-b border-slate-700 py-6">
            <h2 className="text-lg font-semibold text-white mb-4 text-center">My SkyWatch Stats</h2>
            <div className="bg-slate-900/50 rounded-lg p-4">
                <Link href="/alerts" className="flex items-center justify-between hover:bg-slate-700 p-2 rounded-md transition-colors">
                    <div className="flex items-center space-x-3">
                        <ShieldCheck className="w-6 h-6 text-cyan-400" />
                        <span className="text-slate-200 font-medium">Active Alerts</span>
                    </div>
                    <div className="text-xl font-bold text-white bg-cyan-500/20 px-3 py-1 rounded-md">
                        {alertCount}
                    </div>
                </Link>
            </div>
        </div>
        {/* --- End of New Section --- */}

        <div className="space-y-4 text-slate-300">
          <div>
            <label className="block text-sm font-medium text-slate-400">Email</label>
            <p className="mt-1 text-lg">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400">UID</label>
            <p className="mt-1 text-sm font-mono">{user.uid}</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 rounded-lg text-lg font-medium transition-all duration-300 bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
}