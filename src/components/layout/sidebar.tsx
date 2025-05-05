
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { LayoutDashboard, Users, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react'; // Added Settings, ChevronsLeft, ChevronsRight icons
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Import Button
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components
import { ThemeToggle } from './theme-toggle'; // Import ThemeToggle

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false); // Add mounted state

  // Use effect to set mounted to true only on the client side after initial render
  useEffect(() => {
    setMounted(true);
  }, []);


  const navItems = [
    { href: '/', label: 'Project Dashboard', icon: LayoutDashboard },
    { href: '/user-kpis', label: 'User KPIs', icon: Users },
    { href: '/admin-control', label: 'Admin Control', icon: Settings }, // Added Admin Control
  ];

  // Render a placeholder or null during SSR and initial client render before mounted
   if (!mounted) {
     // Render a simple placeholder matching the collapsed/expanded width to minimize layout shift
     // Use neutral background colors initially
     return (
       <aside
         className={cn(
           'border-r border-border flex flex-col transition-all duration-300 ease-in-out bg-muted', // Use neutral colors
           isCollapsed ? 'w-16' : 'w-60'
         )}
         aria-hidden="true" // Hide from accessibility tree initially
       >
        {/* Minimal placeholder content mirroring structure */}
        <div className={cn("flex items-center h-16 px-2 border-b border-border", isCollapsed ? "justify-center" : "justify-between")}>
            {/* Placeholder for header content */}
             <div className="flex items-center gap-1">
                {/* Placeholder for ThemeToggle */}
                <div className="h-10 w-10"></div>
                {/* Placeholder for Collapse Button */}
                <div className="h-10 w-10"></div>
             </div>
        </div>
        <nav className="flex-1 space-y-1 p-2">
            {/* Placeholder for nav items */}
            {navItems.map((item) => (
                <div key={item.href} className={cn('h-10 rounded-md px-3 py-2', isCollapsed ? 'w-10' : '')}></div>
            ))}
        </nav>
       </aside>
     );
   }


  // Original return when mounted
  return (
    <aside
      className={cn(
        // Use sidebar variables from theme, adjust border
        'bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-60' // Slightly narrower width when expanded
      )}
    >
      <div className={cn(
        // Adjust padding and height for header
        "flex items-center h-16 px-2 border-b border-sidebar-border", // Reduced px to 2
        isCollapsed ? "justify-center" : "justify-between"
        )}>
        {/* Updated App Name - Hide when collapsed, adjusted font */}
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-foreground ml-2">Kapibara</h2> // Added ml-2 for spacing
        )}
         <div className="flex items-center gap-1"> {/* Wrapper for buttons */}
            <ThemeToggle isCollapsed={isCollapsed} /> {/* Add Theme Toggle */}
            {/* Toggle Button - Adjusted style */}
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
            </Button>
         </div>
      </div>

      {/* Adjusted padding and link styles */}
      <nav className="flex-1 space-y-1 p-2">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
             <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <Link
                    href={item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', // Adjusted text size and padding
                        pathname === item.href ? 'bg-sidebar-accent text-sidebar-accent-foreground' : '', // Use accent for active, lighter background
                        isCollapsed ? 'justify-center h-10 w-10' : 'h-10' // Fixed height for icon button when collapsed
                    )}
                    >
                    <item.icon className="h-4 w-4 shrink-0" /> {/* Smaller icon */}
                    {!isCollapsed && <span className="truncate">{item.label}</span>} {/* Hide label, added truncate */}
                     <span className="sr-only">{item.label}</span> {/* Screen reader label */}
                    </Link>
                 </TooltipTrigger>
                 {/* Show tooltip only when collapsed - adjusted style */}
                 {isCollapsed && (
                    <TooltipContent side="right" className="bg-foreground text-background text-xs">
                        <p>{item.label}</p>
                    </TooltipContent>
                 )}
             </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Optional: Add footer or user profile section here */}
      {/* Removed footer for cleaner look */}
      {/* <div className="mt-auto p-4"> */}
        {/* Example Footer Content */}
      {/* </div> */}
    </aside>
  );
};

export default Sidebar;
