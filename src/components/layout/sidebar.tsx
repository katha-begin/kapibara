
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react'; // Import useState and useEffect
import { LayoutDashboard, Users, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react'; // Added Settings, ChevronsLeft, ChevronsRight icons
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Import Button
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components
import { ThemeToggle } from './theme-toggle'; // Import ThemeToggle
import DevelopmentStageIndicator from './development-stage-indicator'; // Import the new indicator

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
             {/* Placeholder for App Name */}
             {!isCollapsed && <div className="h-6 w-24 bg-muted-foreground/20 rounded"></div>}
            {/* Placeholder for Collapse Button */}
             <div className={cn("flex items-center", isCollapsed ? "" : "ml-auto")}>
                <div className="h-10 w-10"></div>
             </div>
        </div>
        <nav className="flex-1 space-y-1 p-2">
            {/* Placeholder for nav items */}
            {navItems.map((item) => (
                <div key={item.href} className={cn('h-10 rounded-md px-3 py-2 bg-muted-foreground/10', isCollapsed ? 'w-10' : '')}></div>
            ))}
        </nav>
         {/* Placeholder for Footer Items at the bottom */}
         <div className={cn(
             "mt-auto p-2 border-t border-border flex items-center gap-2",
              isCollapsed ? "flex-col items-center justify-center space-y-2" : "justify-between" // Adjust for collapsed layout
            )}>
             {/* Placeholder Stage Indicator */}
             <div className={cn("h-6 rounded-md", isCollapsed ? "w-8" : "w-12 bg-muted-foreground/10")}></div>
             {/* Placeholder Theme Toggle */}
             <div className={cn("h-10 w-10 bg-muted-foreground/10 rounded-md", isCollapsed ? "" : "ml-auto")}></div>
         </div>
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
         {/* Wrapper for Collapse button - moved ThemeToggle out */}
         <div className={cn("flex items-center", isCollapsed ? "" : "ml-auto")}> {/* Use ml-auto only when expanded */}
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

       {/* Footer section for Stage Indicator and Theme Toggle */}
      <div className={cn(
         "mt-auto p-2 border-t border-sidebar-border flex items-center gap-2",
         // When collapsed: center items vertically, stack them, add space between
         // When expanded: justify between (default flex behavior)
         isCollapsed ? "flex-col items-center justify-center space-y-2" : "justify-between"
         )}>
         {/* Stage Indicator */}
         <DevelopmentStageIndicator />
         {/* Theme Toggle */}
         <ThemeToggle isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
