
import type { FC } from 'react';
import Link from 'next/link'; // Import Link
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Users, CalendarClock, Clock } from "lucide-react"; // Added CalendarClock, Clock
import { cn } from "@/lib/utils";
import type { Project } from '@/types/project';
import {
  calculateMandayPercentage,
  getMandayProgressColorClass, // Use class-based color utility
  calculateSchedulePercentage,
  getKpiColor,
} from '@/lib/project-utils'; // Import utility functions

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const targetKpi = 85; // Define the target KPI
  const schedulePercentage = calculateSchedulePercentage(project.startDate, project.endDate);
  const mandayPercentage = calculateMandayPercentage(project.mandays, project.allocatedMandays);
  const mandayProgressColorClass = getMandayProgressColorClass(mandayPercentage); // Get color class

  return (
    // Wrap the Card with Link
    <Link href={`/project/${project.id}`} passHref legacyBehavior>
      <a className="block hover:no-underline"> {/* Use anchor tag for styling */}
        {/* Use shadow-sm or shadow-none for lighter shadow, added border */}
        <Card className="shadow-sm border transition-shadow hover:shadow-md h-full cursor-pointer">
          {/* Adjusted padding and reduced title size */}
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-medium text-foreground">{project.name}</CardTitle>
            {/* Smaller description text */}
            <CardDescription className="text-xs text-muted-foreground">{project.department.join(', ')}</CardDescription>
          </CardHeader>
          {/* Adjusted padding and spacing */}
          <CardContent className="p-4 pt-2 space-y-3">
            {/* KPI Score */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                 <Target className="h-4 w-4" /> {/* Smaller Icon */}
                <span>KPI Ratio</span>
              </div>
              <span className={cn("font-medium", getKpiColor(project.kpiScore, targetKpi))}>
                {targetKpi > 0 ? (project.kpiScore / targetKpi).toFixed(2) : 'N/A'} {/* Avoid division by zero */}
              </span>
            </div>

            {/* Project Schedule Percentage */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarClock className="h-4 w-4" /> {/* Smaller Icon */}
                <span>Schedule</span>
              </div>
              <div className="w-1/2 flex items-center gap-2">
                {schedulePercentage !== null ? (
                    <>
                    <Progress value={schedulePercentage} className="h-1.5 flex-1" aria-label={`Project schedule ${schedulePercentage}% complete`}/> {/* Smaller progress bar */}
                    <span className="text-xs font-medium text-muted-foreground">{schedulePercentage}%</span> {/* Smaller percentage text */}
                    </>
                ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </div>
            </div>


            {/* Completion Percentage */}
            <div className="flex items-center justify-between text-sm">
               <div className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle className="h-4 w-4" /> {/* Smaller Icon */}
                <span>Completion</span>
               </div>
              <div className="w-1/2 flex items-center gap-2">
                <Progress value={project.completion} className="h-1.5 flex-1" indicatorClassName="bg-chart-2" aria-label={`Project completion ${project.completion}%`}/> {/* Use indicatorClassName */}
                <span className="text-xs font-medium text-muted-foreground">{project.completion}%</span> {/* Smaller percentage text */}
              </div>
            </div>

            {/* Manday Cumulative Percentage */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                 <Clock className="h-4 w-4" /> {/* Smaller Icon */}
                <span>Manday Usage</span>
              </div>
               <div className="w-1/2 flex items-center gap-2">
                 {mandayPercentage !== null ? (
                     <>
                      {/* Use a smaller progress bar, capping visual at 100% but showing actual % */}
                      <Progress value={Math.min(mandayPercentage, 100)} className="h-1.5 flex-1" indicatorClassName={mandayProgressColorClass} aria-label={`Manday usage ${mandayPercentage}%`}/> {/* Use indicatorClassName */}
                     <span className="text-xs font-medium text-muted-foreground">{mandayPercentage}%</span> {/* Smaller percentage text */}
                     </>
                 ) : (
                     <span className="text-xs text-muted-foreground">N/A</span>
                 )}
               </div>
            </div>


            {/* Cumulative Mandays (Actual) */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" /> {/* Smaller Icon */}
                <span>Actual Mandays</span>
              </div>
              <span className="font-medium text-foreground">{project.mandays ?? 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
};

export default ProjectCard;
