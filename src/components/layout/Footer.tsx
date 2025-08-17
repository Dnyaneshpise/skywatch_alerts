// src/components/Footer.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { Wind, Radar, ShieldAlert, Info, Mail, Github, Twitter, Linkedin, HelpCircle, BookOpen, Briefcase } from 'lucide-react';

const sections = [
  {
    title: 'Navigation',
    links: [
      { href: '/', label: 'Live Radar', icon: Radar },
      { href: '/alerts', label: 'Alerts', icon: ShieldAlert },
      { href: '/about', label: 'About Us', icon: Info },
      { href: '/contact', label: 'Contact', icon: Mail },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/faq', label: 'FAQ', icon: HelpCircle },
      { href: '/blog', label: 'Blog', icon: BookOpen },
      { href: '/careers', label: 'Careers', icon: Briefcase },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
    ],
  },
];

const socialLinks = [
  { href: 'https://github.com/your-repo', label: 'GitHub', icon: Github },
  { href: 'https://twitter.com/your-handle', label: 'Twitter', icon: Twitter },
  { href: 'https://linkedin.com/company/your-company', label: 'LinkedIn', icon: Linkedin },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300 border-t-2 border-slate-700/50 shadow-lg">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand + Social */}
          <div className="md:col-span-1 flex flex-col">
            <Link href="/" className="flex items-center space-x-3 mb-4">
              <Wind className="h-9 w-9 text-cyan-400" />
              <span className="text-2xl font-bold text-white hover:text-cyan-300 transition-colors duration-300">
                SkyWatch
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-6">
              Empowering you with real-time flight tracking, proximity alerts, and personalized aviation insights.
            </p>
            <div className="flex space-x-5 mt-auto">
              {socialLinks.map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                    className="text-slate-400 hover:text-cyan-400 transition-colors duration-300">
                    <Icon className="h-6 w-6" />
                    <span className="sr-only">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sections */}
          {sections.map(sec => (
            <div key={sec.title}>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-cyan-500/40 pb-2">{sec.title}</h3>
              <ul className="space-y-3">
                {sec.links.map(link => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link href={link.href} className="flex items-center space-x-2 text-sm text-slate-300 hover:text-cyan-400 transition-colors duration-300 group">
                        {Icon && <Icon className="h-4 w-4 text-cyan-500 group-hover:text-cyan-400" />}
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700/50 pt-6 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} SkyWatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
