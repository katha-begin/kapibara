
import type { FC } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, BarChart, CheckCircle } from "lucide-react"; // Assuming CheckCircle for completion
import type { Project } from '@/types/project';

interface ProjectStatsSummaryProps {
  project: Project;
}

const ProjectStatsSummary: FC<ProjectStatsSummaryProps> = ({ project }) => {
  const allocatedMandays = project.allocatedMandays ?? 0; // Use allocated if available, else 0
  const accumulatedMandays = project.mandays ?? 0; // Use actual mandays spent
  const difference = allocatedMandays - accumulatedMandays;
  const totalCompletion = project.completion ?? 0;

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return "text-green-600"; // Positive difference (under budget)
    if (diff < 0) return "text-destructive"; // Negative difference (over budget)
    return "text-primary"; // Zero difference
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6">
         {/* Total Manday Allocation */}
        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
          <Briefcase className="h-5 w-5 text-primary mb-1" />
          <span className="text-xs text-muted-foreground text-center">Allocated Mandays</span>
          <span className="text-lg font-semibold text-primary">{allocatedMandays.toLocaleString()}</span>
        </div>

         {/* Accumulate Manday */}
        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
          <Users className="h-5 w-5 text-chart-3 mb-1" />
          <span className="text-xs text-muted-foreground text-center">Accumulated Mandays</span>
          <span className="text-lg font-semibold text-primary">{accumulatedMandays.toLocaleString()}</span>
        </div>

        {/* Difference */}
        <div className="flex flex-col items-center p-3 bg-secondary/50 rounded-lg">
          <BarChart className="h-5 w-5 text-chart-1 mb-1" /> {/* Using BarChart for difference */}
          <span className="text-xs text-muted-foreground text-center">Manday Difference</span>
          <span className={`text-lg font-semibold ${getDifferenceColor(difference)}`}>
            {difference >= 0 ? `+${difference.toLocaleString()}` : difference.toLocaleString()}
          </span>
        </div>

        {/* Total Complete */}
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
