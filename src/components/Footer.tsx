import { FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/alerts', label: 'Alerts' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <footer className="relative bg-gradient-to-t from-[#071024] to-[#081426] text-gray-300 pt-10 pb-8 border-t border-gray-800/30" aria-labelledby="site-footer">
      <div className="max-w-7xl mx-auto px-6">
        {/* thin accent line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-cyan-500/30 via-transparent to-indigo-500/15 mb-6 rounded-sm" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Brand */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-3">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden className="text-cyan-400">
                <path d="M3 12c0 4.97 4.03 9 9 9s9-4.03 9-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 7h7l3 3 8-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 id="site-footer" className="text-2xl font-extrabold text-white tracking-tight">SkyWatch Alerts</h3>
            </div>
            <p className="text-sm text-gray-300 mt-2 md:mt-0 md:ml-1 max-w-sm">Real-time updates and alerts about skies, weather and nearby flights to keep you informed.</p>
          </div>

          {/* Nav */}
          <nav aria-label="Footer navigation" className="flex items-center justify-center">
            <ul className="flex flex-wrap justify-center gap-3 md:gap-4 text-sm font-medium">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-transparent border border-white/6 text-gray-300 hover:bg-white/6 hover:border-cyan-400 hover:text-white transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials + feedback */}
          <div className="flex items-center md:justify-end justify-center gap-4">
            <a href="#" aria-label="Twitter" className="group inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/4 text-gray-300 hover:bg-cyan-500/90 hover:text-white transform transition-all motion-safe:scale-100 group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400">
              <FaTwitter size={16} aria-hidden />
            </a>
            <a href="#" aria-label="LinkedIn" className="group inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/4 text-gray-300 hover:bg-cyan-500/90 hover:text-white transform transition-all motion-safe:scale-100 group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400">
              <FaLinkedin size={16} aria-hidden />
            </a>
            <a href="#" aria-label="GitHub" className="group inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/4 text-gray-300 hover:bg-cyan-500/90 hover:text-white transform transition-all motion-safe:scale-100 group-hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400">
              <FaGithub size={16} aria-hidden />
            </a>

            <Link href="/feedback" className="ml-4 inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-900 px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg hover:from-cyan-500 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-transform transform hover:-translate-y-0.5" aria-label="Give feedback">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden className="mr-1">
                <path d="M22 2L11 13" stroke="#022" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 2l-7 20 2-7 7-7z" stroke="#022" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Give feedback
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-gray-700/30 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400 gap-3">
          <p className="text-xs md:text-sm">© {new Date().getFullYear()} SkyWatch Alerts. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="inline-flex items-center px-2 py-0.5 rounded-full text-xs md:text-sm bg-transparent border border-transparent text-gray-400 hover:border-cyan-400 hover:text-cyan-300 transition focus:outline-none focus:ring-2 focus:ring-cyan-300">Privacy</Link>
            <Link href="/terms" className="inline-flex items-center px-2 py-0.5 rounded-full text-xs md:text-sm bg-transparent border border-transparent text-gray-400 hover:border-cyan-400 hover:text-cyan-300 transition focus:outline-none focus:ring-2 focus:ring-cyan-300">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
