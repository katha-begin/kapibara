
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
     return "text-lime-600"; // Slightly off
  } else if (avgRatio > 0.95 && avgRatio < 1.05) {
    return "text-yellow-600"; // Moderately off
  } else if (avgRatio > 0.90 && avgRatio < 1.10) {
    return "text-orange-600"; // Significantly off
  } else {
    return "text-destructive"; // Very far off (bad)
  }
};

const SummaryCard: FC<SummaryCardProps> = ({ metrics, className }) => {
  const targetKpi = 85; // Define the target KPI

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">Projects Summary</CardTitle>
        <p className="text-sm text-muted-foreground">Overview of selected projects</p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
          <Briefcase className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-muted-foreground">Total Projects</span>
          <span className="text-xl font-semibold text-primary">{metrics.totalProjects}</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
          <Target className="h-6 w-6 text-chart-1 mb-2" />
          <span className="text-sm text-muted-foreground">Avg. KPI Ratio</span> {/* Changed label */}
           {/* Apply color coding to the average KPI score ratio */}
          <span className={cn("text-xl font-semibold", getKpiColor(metrics.avgKpiScore, targetKpi))}>
             {/* Display average KPI as ratio */}
            {metrics.totalProjects > 0 && targetKpi > 0 ? (metrics.avgKpiScore / targetKpi).toFixed(2) : 'N/A'}
          </span>
        </div>
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
          <CheckCircle className="h-6 w-6 text-chart-2 mb-2" />
          <span className="text-sm text-muted-foreground">Avg. Completion</span>
          <span className="text-xl font-semibold text-primary">{metrics.avgCompletion}%</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
          <Users className="h-6 w-6 text-chart-3 mb-2" />
          <span className="text-sm text-muted-foreground">Total Mandays</span>
          <span className="text-xl font-semibold text-primary">{metrics.totalMandays}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
