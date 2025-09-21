"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-12 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white">SkyWatch Alerts</h2>
            <p className="mt-2 text-sm text-gray-400">
              Stay updated with real-time sky & weather alerts.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center space-x-6">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/about" className="hover:text-white transition">
              About
            </Link>
            <Link href="/alerts" className="hover:text-white transition">
              Alerts
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              Contact
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex md:justify-end justify-center space-x-5">
            <a href="#" className="hover:text-white transition" aria-label="Twitter">
              
            </a>
            <a href="#" className="hover:text-white transition" aria-label="LinkedIn">
              
            </a>
            <a href="#" className="hover:text-white transition" aria-label="GitHub">
              
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SkyWatch Alerts. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
