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
      <body className="font-sans h-full bg-gray-50">
        <QueryClientProvider>
          <AuthProvider>
            <div className="min-h-full">
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