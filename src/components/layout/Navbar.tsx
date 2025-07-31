// /components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radar, ShieldAlert, Info, Menu, X, Wind, LayoutDashboard, Mail, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/UseAuth';
import { auth } from '@/lib/flights/firebase';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import ThemeToggle from '../ui/ThemeToggle';


const allNavLinks = [
  { href: '/', label: 'Live Radar', icon: Radar, protected: false },
  { href: '/alerts', label: 'Alerts', icon: ShieldAlert, protected: true },
  { href: '/about', label: 'About', icon: Info, protected: false },
  { href: '/Dashboard', label: 'Dashboard', icon: LayoutDashboard, protected: true },
  { href: '/contact', label: 'Contact us', icon: Mail, protected: false },
];





export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth(); // DEBUG: Removed 'loading' for now to force render

  const navLinks = allNavLinks.filter(link => !link.protected || !!user);

  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  // DEBUG: This component will now render immediately without the loading check
  const AuthButtons = () => {
    return user ? (
      <button
        onClick={handleSignOut}
        className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 bg-red-600 hover:bg-red-700 text-white"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </button>
    ) : (
      <button
        onClick={handleGoogleSignIn}
        className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 bg-cyan-500 hover:bg-cyan-600 text-white"
      >
        <LogIn className="h-4 w-4" />
        <span>Sign In with Google</span>
      </button>
    );
  };
  
  // DEBUG: This component will also render immediately
  const MobileAuthButtons = () => {
    return user ? (
       <button
        onClick={handleSignOut}
        className="flex w-full items-center space-x-4 rounded-lg p-3 text-lg font-medium transition-colors duration-200 bg-red-600/90 text-white hover:bg-red-700"
      >
        <LogOut className="h-6 w-6" />
        <span>Sign Out ({user.email})</span>
      </button>
    ) : (
      <button
        onClick={handleGoogleSignIn}
        className="flex w-full items-center space-x-4 rounded-lg p-3 text-lg font-medium transition-colors duration-200 bg-cyan-500/90 text-white hover:bg-cyan-600"
      >
        <LogIn className="h-6 w-6" />
        <span>Sign In with Google</span>
      </button>
    );
  };


  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="bg-slate-900/80 text-white backdrop-blur-lg sticky top-0 z-40 border-b border-slate-700/60 shadow-lg">        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Wind className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white hover:text-cyan-300 transition-colors duration-300">
                SkyWatch
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:text-cyan-300 ${
                      isActive ? 'text-cyan-400' : 'text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4/5 bg-cyan-400 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
              <ThemeToggle/>
               <div className="pl-4">
                 <AuthButtons />
               </div>
            </div>

            {/* Mobile Menu Hamburger Button */}
            <div className="md:hidden space-x-2">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 rounded-md"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 md:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/60">
            <Link href="/" className="flex items-center space-x-2">
              <Wind className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">SkyWatch</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-6 px-6 space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex w-full items-center space-x-4 rounded-lg p-3 text-lg font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-cyan-400/90 text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <hr className="border-slate-700/60" />
            <MobileAuthButtons />
          </div>
        </div>
      )}
    </>
  );
}
