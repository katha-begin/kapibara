
'use client'; // Need to make layout client component to manage state

import type { ReactNode } from 'react'; // Import ReactNode
import { useState } from 'react'; // Import useState
// Removed Geist font imports
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Sidebar from '@/components/layout/sidebar';
import { cn } from '@/lib/utils'; // Import cn utility
import { ThemeProvider } from "@/components/layout/theme-provider"; // Import ThemeProvider

// Removed Geist font constants

// Metadata can still be exported from a Client Component in App Router
// export const metadata: Metadata = { // This needs to be moved or handled differently if strict RSC is needed
//   title: 'Kapibara Dashboard',
//   description: 'Basic ERP Dashboard for Small Businesses using Kapibara',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <html lang="en" suppressHydrationWarning><head>
         {/* Add metadata tags here directly if needed */}
         <title>Kapibara Dashboard</title>
         <meta name="description" content="Basic ERP Dashboard for Small Businesses using Kapibara" />
      </head>{/* Removed font variable classes from body */}
      <body className={`antialiased flex h-screen bg-background overflow-hidden`}> {/* Added overflow-hidden */}
        <ThemeProvider
           attribute="class"
           defaultTheme="system"
           enableSystem
           disableTransitionOnChange
        >
          <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} /> {/* Pass state and toggle function */}
          <main className={cn(
              "flex-1 overflow-y-auto transition-all duration-300 ease-in-out p-4 md:p-6", // Added default padding
              // isSidebarCollapsed ? 'ml-16' : 'ml-64' // This causes layout shift, better to let flexbox handle it
              )}> {/* Main content area */}
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body></html>
  );
}

