
'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Stage = 'Development' | 'Staging' | 'Production';
type StageInfo = {
  label: string;
  color: string; // Tailwind background color class
  textColor: string; // Tailwind text color class
  tooltip: string; // Tooltip for the currently displayed stage
  actualDataSourceTooltip: string; // Tooltip explaining the *actual* data source based on environment
};

// Determine the actual stage based on environment variables once
const getActualStage = (): Stage => {
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;
  if (env === 'production') {
     // In a real scenario, you might check hostname here for prod vs staging
     return 'Staging'; // Defaulting to Staging for now as JSON is used
     // return 'Production'; // Set this when backend API is live
  } else if (env === 'development') {
      return 'Development'; // Explicitly map 'development' to Development stage
  } else {
     return 'Staging'; // Default other environments (like undefined NEXT_PUBLIC_APP_ENV) to Staging
  }
};

const actualStage = getActualStage(); // Determine the actual stage on component load

const stageConfig: Record<Stage, StageInfo> = {
  Development: {
    label: 'DEV',
    color: 'bg-blue-600',
    textColor: 'text-blue-100',
    tooltip: 'Displaying Development stage (using inline mock data).',
    actualDataSourceTooltip: 'Currently using inline mock data embedded in components.',
  },
  Staging: {
    label: 'STG',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-900',
    tooltip: 'Displaying Staging stage (using mock data from local JSON).',
    actualDataSourceTooltip: 'Currently using mock data loaded from local JSON files.',
    // tooltip: 'Using data from the staging API server.', // Future tooltip
  },
  Production: {
    label: 'PROD',
    color: 'bg-green-600',
    textColor: 'text-green-100',
    tooltip: 'Displaying Production stage (using live data).',
    actualDataSourceTooltip: 'Currently configured to use the Production API (not implemented).',
  },
};


const DevelopmentStageIndicator = () => {
  // Initialize displayedStage state based on the actualStage determined from environment
  const [displayedStage, setDisplayedStage] = useState<Stage>(actualStage);

  // This effect ensures the component updates if actualStage changes (though it shouldn't in a typical build)
  useEffect(() => {
    setDisplayedStage(actualStage);
  }, []);


  // Visual-only toggle function
  const toggleStageDisplay = () => {
    setDisplayedStage(prev => {
      if (prev === 'Development') return 'Staging';
      if (prev === 'Staging') return 'Production';
      return 'Development'; // Cycle back to Development
    });
     // In a real implementation, this function would trigger a context update or API call change
     console.log("Toggled displayed stage (visual only). Actual data source remains based on environment.");
  };

  if (!displayedStage) {
    return null; // Should not happen with initial state set
  }

  const config = stageConfig[displayedStage];
  const actualConfig = stageConfig[actualStage];

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
           <Badge
             onClick={toggleStageDisplay} // Add click handler for toggling
             className={cn(
               'border-transparent',
               config.color,
               config.textColor,
               'hover:opacity-90',
               'cursor-pointer' // Change cursor to pointer to indicate clickability
             )}
           >
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {/* Display both the visually selected stage and the actual data source */}
          <p>{config.tooltip}</p>
          <p className="text-xs text-muted-foreground">({actualConfig.actualDataSourceTooltip})</p>
          <p className="text-xs mt-1">(Click to cycle displayed stage - visual only)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DevelopmentStageIndicator;
