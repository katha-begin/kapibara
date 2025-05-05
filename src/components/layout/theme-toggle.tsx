"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ThemeToggle({ isCollapsed }: { isCollapsed: boolean }) {
  const { setTheme } = useTheme();

  const buttonContent = (
     <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
  );

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
         <Tooltip>
           <TooltipTrigger asChild>
             <DropdownMenuTrigger asChild>
                {buttonContent}
             </DropdownMenuTrigger>
           </TooltipTrigger>
           {/* Show tooltip only when collapsed */}
           {isCollapsed && (
             <TooltipContent side="right" className="bg-foreground text-background text-xs">
               <p>Change Theme</p>
             </TooltipContent>
           )}
         </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
