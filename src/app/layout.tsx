// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. IMPORT THE NAVBAR COMPONENT
import Navbar from '@/components/layout/Navbar';

// 2. IMPORT THE THEME PROVIDER
import { ThemeProvider } from '@/components/Providers/ThemeProvider';

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | SkyWatch', // Adds "| SkyWatch" to page titles
    default: 'SkyWatch Alerts', // Default title for the homepage
  },
  description: "Real-time flight tracking with proximity alerts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      {/* 
        You had `suppressHydrationWarning` which is a good safeguard.
        However, the structure we are using is the standard Next.js pattern and 
        is designed to prevent these warnings from occurring in the first place.
        The `usePathname` hook in your Navbar is supported during server rendering,
        and the initial state of the mobile menu is consistent between server and client.
        Keeping it is fine, but this setup is robust.
      */}
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Navbar />
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}