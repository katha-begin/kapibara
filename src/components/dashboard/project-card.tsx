
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn for conditional classes

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    department: string[]; // Updated to array
    kpiScore: number;
    completion: number;
    mandays: number;
  };
}

// Function to determine KPI color based on score relative to target (1 is ideal - green, deviation scales to red)
const getKpiColor = (kpiScore: number, targetKpi: number): string => {
  const ratio = kpiScore / targetKpi;
  if (ratio === 1) {
    return "text-green-600"; // Perfect score
  } else if (ratio > 0.97 && ratio < 1.03) {
     return "text-lime-600"; // Slightly off
  } else if (ratio > 0.95 && ratio < 1.05) {
    return "text-yellow-600"; // Moderately off
  } else if (ratio > 0.90 && ratio < 1.10) {
    return "text-orange-600"; // Significantly off
  } else {
    return "text-destructive"; // Very far off (bad)
  }
};

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const targetKpi = 85; // Define the target KPI

  return (
    <Card className="shadow-md transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">{project.name}</CardTitle>
        {/* Display department array as comma-separated string */}
        <p className="text-sm text-muted-foreground">{project.department.join(', ')}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-secondary-foreground">
             <Target className="text-chart-1" />
            <span>KPI Score Ratio</span> {/* Changed label */}
          </div>
          {/* Apply color coding to the KPI score ratio */}
          <span className={cn("font-semibold text-lg", getKpiColor(project.kpiScore, targetKpi))}>
            {/* Display KPI as ratio */}
            {(project.kpiScore / targetKpi).toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-secondary-foreground">
            <CheckCircle className="text-chart-2" />
            <span>Completion</span>
           </div>
          <div className="w-1/2 flex items-center gap-2">
            <Progress value={project.completion} className="h-2 [&>div]:bg-chart-2" aria-label={`Project completion ${project.completion}%`}/>
            <span className="text-sm font-medium text-primary">{project.completion}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-secondary-foreground">
            <Users className="text-chart-3" />
            <span>Cumulative Mandays</span>
          </div>
          <span className="font-semibold text-lg text-primary">{project.mandays}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
