// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import the necessary components and providers
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/hooks/UseAuth'; // Corrected the casing for convention
import Footer from "@/components/Footer";

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
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${inter.variable} font-sans bg-slate-900 text-slate-50 antialiased`}>
        {/* Wrap the entire application with AuthProvider.
          This makes the authentication context available to all child components,
          including the Navbar and any page content.
        */}
         <AuthProvider> *
          <Navbar />
          
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
          {/* Add Footer here */}
          <Footer/>
        </AuthProvider> 
      </body>
    </html>
  );
}
