import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import Sidebar from '@/components/layout/sidebar'; // Import Sidebar

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BizFlow Dashboard', // Updated App Name
  description: 'Basic ERP Dashboard for Small Businesses', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex h-screen bg-background`}>
        <Sidebar /> {/* Add Sidebar */}
        <main className="flex-1 overflow-y-auto"> {/* Main content area */}
          {children}
        </main>
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
