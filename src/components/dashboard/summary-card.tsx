
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Target, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryMetrics {
  totalProjects: number;
  avgKpiScore: number; // This is still the average raw score (0-100)
  avgCompletion: number;
  totalMandays: number;
}

interface SummaryCardProps {
  metrics: SummaryMetrics;
  className?: string;
}

// Function to determine KPI color based on score relative to target (1 is ideal - green, deviation scales to red)
const getKpiColor = (avgKpiScore: number, targetKpi: number): string => {
  // Calculate average ratio based on the average raw score
  if (targetKpi === 0 || avgKpiScore === 0) return "text-muted-foreground"; // Handle division by zero or no data

  const avgRatio = avgKpiScore / targetKpi;

  if (avgRatio === 1) {
    return "text-green-600"; // Perfect score
  } else if (avgRatio > 0.97 && avgRatio < 1.03) {
     return "text-lime-600"; // Slightly off (closer to green)
  } else if (avgRatio > 0.95 && avgRatio < 1.05) {
    return "text-yellow-600"; // Moderately off (closer to green)
  } else if (avgRatio > 0.90 && avgRatio < 1.10) {
    return "text-orange-600"; // Significantly off (closer to red)
  } else {
    return "text-destructive"; // Very far off (bad - red)
  }
};

const SummaryCard: FC<SummaryCardProps> = ({ metrics, className }) => {
  const targetKpi = 85; // Define the target KPI

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };


  return (
    // Removed CardHeader for a denser look like the image
    <Card className={cn("shadow-sm border", className)}> {/* Added border */}
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4"> {/* Adjusted padding and gap */}
        {/* Total Projects */}
        <div className="flex flex-col items-start p-0"> {/* Align items start */}
           <div className="flex items-center gap-1 mb-1">
             <Briefcase className="h-4 w-4 text-muted-foreground" />
             <span className="text-xs text-muted-foreground">Total Projects</span>
           </div>
           <span className="text-xl font-semibold text-foreground">{formatNumber(metrics.totalProjects)}</span>
        </div>
         {/* Avg. KPI Ratio */}
        <div className="flex flex-col items-start p-0">
           <div className="flex items-center gap-1 mb-1">
              <Target className="h-4 w-4 text-muted-foreground" />
             <span className="text-xs text-muted-foreground">Avg. KPI Ratio</span>
           </div>
           <span className={cn("text-xl font-semibold", getKpiColor(metrics.avgKpiScore, targetKpi))}>
             {metrics.totalProjects > 0 && targetKpi > 0 ? (metrics.avgKpiScore / targetKpi).toFixed(2) : 'N/A'}
          </span>
        </div>
        {/* Avg. Completion */}
        <div className="flex flex-col items-start p-0">
          <div className="flex items-center gap-1 mb-1">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Avg. Completion</span>
          </div>
          <span className="text-xl font-semibold text-foreground">{metrics.avgCompletion}%</span>
        </div>
        {/* Total Mandays */}
        <div className="flex flex-col items-start p-0">
          <div className="flex items-center gap-1 mb-1">
             <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Mandays</span>
          </div>
          <span className="text-xl font-semibold text-foreground">{formatNumber(metrics.totalMandays)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
