
import type { FC } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, CheckCircle, TrendingUp, TrendingDown, Percent, Clock } from "lucide-react"; // Added Clock icon
import type { Project } from '@/types/project';
import { calculateMandayPercentage } from '@/lib/project-utils'; // Import utility function
import { cn } from '@/lib/utils';

interface ProjectStatsSummaryProps {
  project: Project;
}

// Simple mock for average headcount calculation (replace with real logic later)
// Example: Assume average 5 mandays per person per week. Calculate total weeks.
const calculateAvgHeadcount = (project: Project): string => {
    if (!project.startDate || !project.endDate || !project.mandays || project.mandays <= 0) {
        return 'N/A';
    }
    const durationMs = project.endDate.getTime() - project.startDate.getTime();
    const durationWeeks = durationMs / (1000 * 60 * 60 * 24 * 7);
    if (durationWeeks <= 0) return 'N/A'; // Avoid division by zero

    // Simplified: assumes 5 mandays per person per week
    const avgHeadcount = (project.mandays / durationWeeks) / 5;
    return avgHeadcount.toFixed(1); // Return as a string with one decimal place
}

// Function to determine variance color
const getVarianceColor = (variance: number | null): string => {
    if (variance === null) return "text-muted-foreground";
    if (variance > 5) return "text-green-600"; // Significantly ahead
    if (variance > -5) return "text-yellow-600"; // Slightly off or on track
    return "text-destructive"; // Significantly behind
};


const ProjectStatsSummary: FC<ProjectStatsSummaryProps> = ({ project }) => {
  const allocatedMandays = project.allocatedMandays ?? 0;
  const accumulatedMandaysValue = project.mandays ?? 0; // Raw value
  const totalCompletion = project.completion ?? 0;
  const mandayPercentage = calculateMandayPercentage(accumulatedMandaysValue, allocatedMandays); // Calculate percentage
  const completionVariance = mandayPercentage !== null ? totalCompletion - mandayPercentage : null;
  const avgHeadcount = calculateAvgHeadcount(project);

  // Choose icon based on variance
  const VarianceIcon = completionVariance === null ? Percent : (completionVariance >= 0 ? TrendingUp : TrendingDown);


  return (
    <Card className="shadow-sm">
      <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 md:p-6"> {/* Changed to 5 columns */}
         {/* Total Manday Allocation */}
        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
          <Briefcase className="h-5 w-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground text-center">Allocated Mandays</span>
          <span className="text-lg font-semibold text-primary">{allocatedMandays.toLocaleString()}</span>
        </div>

         {/* Accumulate Manday Percentage */}
        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
          <Clock className="h-5 w-5 text-chart-3 mb-1" /> {/* Changed icon to Clock */}
          <span className="text-xs text-muted-foreground text-center">Manday Usage (%)</span> {/* Updated Label */}
           <span className={cn(
              "text-lg font-semibold",
              mandayPercentage === null ? "text-muted-foreground" : "text-primary"
            )}>
              {mandayPercentage !== null ? `${mandayPercentage}%` : 'N/A'} {/* Display Percentage */}
           </span>
        </div>

        {/* Average Headcount */}
        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
          <Users className="h-5 w-5 text-chart-4 mb-1" /> {/* Using Users icon for headcount */}
          <span className="text-xs text-muted-foreground text-center">Avg. Headcount</span>
           {/* Display N/A or the calculated value */}
          <span className="text-lg font-semibold text-primary">{avgHeadcount}</span>
        </div>

        {/* Completion Variance */}
        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
          <VarianceIcon className={cn("h-5 w-5 mb-1", getVarianceColor(completionVariance))} />
          <span className="text-xs text-muted-foreground text-center">Completion Variance</span>
          <span className={cn("text-lg font-semibold", getVarianceColor(completionVariance))}>
             {completionVariance !== null ? `${completionVariance.toFixed(1)}%` : 'N/A'}
          </span>
        </div>

        {/* Total Completion */}
        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-chart-2 mb-1" />
          <span className="text-xs text-muted-foreground text-center">Total Completion</span>
          <span className="text-lg font-semibold text-primary">{totalCompletion}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectStatsSummary;
