'use client';

import FunSection from '../../components/FunSection';
import Link from 'next/link';

export default function FunSectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B1E39] via-[#112A4D] to-[#0B1E39] text-white flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* ✈️ Floating Plane Animation (optional aesthetic) */}
      <div className="absolute top-10 left-[-50px] text-5xl animate-bounce-slow opacity-30">
        ✈️
      </div>
      <div className="absolute top-1/3 right-[-50px] text-6xl animate-bounce-slow opacity-20 rotate-12">
        🛫
      </div>

      {/* Page Title */}
      <h1 className="text-5xl font-bold mb-8 text-center drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]">
        ✨ Fun Section ✨
      </h1>

      {/* Fun Section Component */}
      <div className="w-full max-w-5xl">
        <FunSection />
      </div>

      {/* Back to Home Button */}
      <div className="mt-10 text-center">
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#1E3A8A] hover:bg-[#1D4ED8] text-white font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
