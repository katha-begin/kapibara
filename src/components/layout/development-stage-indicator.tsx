
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
  tooltip: string;
};

const stageConfig: Record<Stage, StageInfo> = {
  Development: {
    label: 'DEV',
    color: 'bg-blue-600',
    textColor: 'text-blue-100',
    tooltip: 'Using local mock data embedded in components.',
  },
  Staging: {
    label: 'STG',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-900',
    tooltip: 'Using mock data loaded from local JSON files.',
    // tooltip: 'Using data from the staging API server.', // Future tooltip
  },
  Production: {
    label: 'PROD',
    color: 'bg-green-600',
    textColor: 'text-green-100',
    tooltip: 'Using live data from the production API server.',
  },
};

const DevelopmentStageIndicator = () => {
  const [stage, setStage] = useState<Stage | null>(null);

  useEffect(() => {
    // Determine the stage based on environment variable or hostname
    const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV;
    let currentStage: Stage;

    if (env === 'production') {
      // Further check hostname if needed for staging vs prod on same env setting
      // Example: if (window.location.hostname === 'staging.myapp.com') currentStage = 'Staging';
      // else currentStage = 'Production';
       currentStage = 'Staging'; // Defaulting to Staging for now as JSON is used
       // currentStage = 'Production'; // Set this when backend API is live
    } else {
       currentStage = 'Staging'; // Using JSON files, so consider it Staging
       // currentStage = 'Development'; // If you revert to embedded data, use this
    }
    setStage(currentStage);
  }, []);

  if (!stage) {
    return null; // Don't render anything until stage is determined
  }

  const config = stageConfig[stage];

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
           {/* Removed variant="outline" to rely on custom bg/text colors */}
           <Badge
             className={cn(
               'border-transparent', // Remove default border
               config.color,
               config.textColor,
               'hover:opacity-90', // Slight hover effect
               'cursor-default' // Default cursor as it's informational
             )}
           >
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DevelopmentStageIndicator;
