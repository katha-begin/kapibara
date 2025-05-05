
import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Users } from "lucide-react";

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

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
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
            <span>Avg. KPI Score</span>
          </div>
          <span className="font-semibold text-lg text-primary">{project.kpiScore}%</span>
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
