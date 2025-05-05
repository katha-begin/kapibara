
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react'; // Added Settings, ChevronsLeft, ChevronsRight icons
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Import Button
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isCollapsed, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Project Dashboard', icon: LayoutDashboard },
    { href: '/user-kpis', label: 'User KPIs', icon: Users },
    { href: '/admin-control', label: 'Admin Control', icon: Settings }, // Added Admin Control
  ];

  return (
    <aside
      className={cn(
        'bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64' // Dynamic width
      )}
    >
      <div className={cn(
        "flex items-center justify-between p-4",
        isCollapsed ? "justify-center" : "justify-between"
        )}>
        {/* Updated App Name - Hide when collapsed */}
        {!isCollapsed && (
          <h2 className="text-xl font-semibold text-sidebar-primary">Kapibara</h2>
        )}
         {/* Toggle Button */}
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
            {isCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2 px-2"> {/* Adjusted padding */}
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
             <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                    <Link
                    href={item.href}
                    className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        pathname === item.href ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' : '',
                        isCollapsed ? 'justify-center' : '' // Center icon when collapsed
                    )}
                    >
                    <item.icon className="h-5 w-5 shrink-0" /> {/* Ensure icon doesn't shrink */}
                    {!isCollapsed && <span>{item.label}</span>} {/* Hide label when collapsed */}
                     <span className="sr-only">{item.label}</span> {/* Screen reader label */}
                    </Link>
                 </TooltipTrigger>
                 {/* Show tooltip only when collapsed */}
                 {isCollapsed && (
                    <TooltipContent side="right" className="bg-sidebar-primary text-sidebar-primary-foreground">
                        <p>{item.label}</p>
                    </TooltipContent>
                 )}
             </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* Optional: Add footer or user profile section here */}
      <div className="mt-auto p-4">
        {/* Example Footer Content */}
      </div>
    </aside>
  );
};

export default Sidebar;
