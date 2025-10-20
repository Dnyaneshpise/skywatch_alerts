'use client';

import FunSection from '../../components/FunSection';
import Link from 'next/link';

export default function FunSectionPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      
      {/* Page Title */}
      <h1 className="text-4xl font-bold text-white mb-8 text-center">
        ✨ Fun Section ✨
      </h1>

      {/* Fun Section Component */}
      <FunSection />

      {/* Back to Home Button */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-all duration-300 shadow-md"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
