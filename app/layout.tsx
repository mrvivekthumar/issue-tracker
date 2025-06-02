import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "./auth/Provider";
import "./globals.css";
import Navbar from "./Navbar";
import QueryClientProvider from "./QueryClientProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: "IssueTracker Pro - Modern Issue Management",
  description: "Professional issue tracking with advanced analytics and team collaboration",
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans h-full bg-gray-50 antialiased`}>
        <QueryClientProvider>
          <AuthProvider>
            <div className="min-h-full">

              {/* Test 1: Inline styles (should always work) */}
              <div style={{
                background: 'red',
                color: 'white',
                padding: '16px',
                margin: '16px',
                borderRadius: '8px'
              }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  Test 1: Inline Styles
                </h1>
                <p>If you see this with red background, HTML/CSS loading works ✅</p>
              </div>

              {/* Test 2: Tailwind classes */}
              <div className="bg-blue-500 text-white p-4 m-4 rounded-lg">
                <h1 className="text-2xl font-bold">Test 2: Tailwind Classes</h1>
                <p>If you see this with blue background, Tailwind works ✅</p>
              </div>

              {/* Test 3: More complex Tailwind */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 m-4 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Test 3: Complex Tailwind</h1>
                <p className="text-lg">Gradient, shadows, spacing - Advanced Tailwind ✅</p>
              </div>

              {/* Test 4: Check if CSS file is loading */}
              <div className="debug-info p-4 m-4 border-2 border-gray-300 rounded">
                <h2 className="text-xl font-bold text-color-black-500 mb-2">Debug Information:</h2>
                <p><strong>Font Variable:</strong> {inter.variable}</p>
                <p><strong>Body Classes:</strong> Check DevTools for applied classes</p>
                <p><strong>Background:</strong> Should be bg-gray-50</p>
              </div>

              {/* Your original components (commented out for now) */}
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}