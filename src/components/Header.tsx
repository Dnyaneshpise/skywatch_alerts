// src/components/Header.tsx (example)
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/UseAuth';
import { auth } from '@/lib/flights/firebase';
import { signOut } from 'firebase/auth';

export default function Header() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav>
      {/* Your other nav links */}
      <div>
        {user ? (
          <>
            <span>Welcome, {user.displayName || user.email}</span>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <Link href="/login">Sign In</Link>
        )}
      </div>
    </nav>
  );
}