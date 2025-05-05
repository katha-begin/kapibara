
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

// Function to determine KPI color based on score relative to target (same as in ProjectTable/Card)
const getKpiColor = (avgKpiScore: number, targetKpi: number): string => {
  // Calculate average ratio based on the average raw score
  const avgRatio = avgKpiScore / targetKpi;
  if (avgRatio < 0.95) { // Significantly below target (Bad)
    return "text-destructive";
  } else if (avgRatio > 1.05) { // Significantly above target (Better)
    return "text-green-600";
  } else { // Close to target (Good)
    return "text-amber-600";
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
          <span className="text-sm text-muted-foreground">Avg. KPI Score</span> {/* Changed label */}
           {/* Apply color coding to the average KPI score ratio */}
          <span className={cn("text-xl font-semibold", getKpiColor(metrics.avgKpiScore, targetKpi))}>
             {/* Display average KPI as ratio */}
            {metrics.totalProjects > 0 ? (metrics.avgKpiScore / targetKpi).toFixed(2) : 'N/A'}
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
