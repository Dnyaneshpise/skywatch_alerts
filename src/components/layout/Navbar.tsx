// /components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Radar, ShieldAlert, Info, Menu, X, Wind, LayoutDashboard, Mail} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Live Radar', icon: Radar },
  { href: '/alerts', label: 'Alerts', icon: ShieldAlert },
  { href: '/about', label: 'About', icon: Info },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard  },
  { href: '/contact', label: 'Contact us', icon: Mail },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      {/* ✅ FIX 1: Changed z-100 to z-40, a standard and sufficient Tailwind z-index value */}
      <nav className="bg-slate-900/80 text-white backdrop-blur-lg sticky top-0 z-40 border-b border-slate-700/60 shadow-lg">
        <div className="container mx-auto px-6 py-3">
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
            </div>

            {/* Mobile Menu Hamburger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(true)}
                className="p-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 rounded-md"
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU OVERLAY --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-900 md:hidden" role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/60">
            <Link href="/" className="flex items-center space-x-2">
              <Wind className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-white">SkyWatch</span>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md bg-blue-500/90 text-slate-900 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                      ? 'bg-cyan-400 text-white'
                      : 'text-sky-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}




