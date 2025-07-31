// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Import the necessary components and providers
import Navbar from '@/components/layout/Navbar';
import { AuthProvider } from '@/hooks/UseAuth'; // Corrected the casing for convention

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
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Wrap the entire application with AuthProvider.
          This makes the authentication context available to all child components,
          including the Navbar and any page content.
        */}
        <AuthProvider>
          <ThemeProvider>
            <Navbar />
            <main className="container mx-auto px-6 py-8">
            {children}
           </main>
         </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
