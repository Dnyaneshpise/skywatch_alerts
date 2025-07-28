// app/layout.tsx
import { ThemeProvider } from 'next-themes';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. IMPORT THE NAVBAR COMPONENT
import Navbar from '@/components/layout/Navbar';

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-slate-900 text-slate-50 antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}