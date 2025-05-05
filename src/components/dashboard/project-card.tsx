
import type { FC } from 'react';
import Link from 'next/link'; // Import Link
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, Users, CalendarClock } from "lucide-react"; // Added CalendarClock
import { cn } from "@/lib/utils";
import type { Project } from '@/types/project';


interface ProjectCardProps {
  project: Project;
}

// Function to determine KPI color based on score relative to target (1 is ideal - green, deviation scales to red)
const getKpiColor = (kpiScore: number, targetKpi: number): string => {
  const ratio = kpiScore / targetKpi;
  if (ratio === 1) {
    return "text-green-600"; // Perfect score
  } else if (ratio > 0.97 && ratio < 1.03) {
     return "text-lime-600"; // Slightly off (closer to green)
  } else if (ratio > 0.95 && ratio < 1.05) {
    return "text-yellow-600"; // Moderately off (closer to green)
  } else if (ratio > 0.90 && ratio < 1.10) {
    return "text-orange-600"; // Significantly off (closer to red)
  } else {
    return "text-destructive"; // Very far off (bad - red)
  }
};

// Function to calculate schedule percentage
const calculateSchedulePercentage = (startDate: Date | null | undefined, endDate: Date | null | undefined): number | null => {
  if (!startDate || !endDate || startDate >= endDate) {
    return null; // Cannot calculate if dates are invalid or missing
  }

  const today = new Date();
  // Set time to 00:00:00 to compare dates only
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);


  const totalDuration = end.getTime() - start.getTime();
  if (totalDuration <= 0) return 0; // Avoid division by zero or negative duration

  // If today is before the start date, schedule % is 0
  if (today < start) return 0;
  // If today is after the end date, schedule % is 100
  if (today > end) return 100;

  const elapsedTime = today.getTime() - start.getTime();
  const percentage = Math.round((elapsedTime / totalDuration) * 100);

  return Math.min(100, Math.max(0, percentage)); // Clamp between 0 and 100
};


const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  const targetKpi = 85; // Define the target KPI
  const schedulePercentage = calculateSchedulePercentage(project.startDate, project.endDate);

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
                {(project.kpiScore / targetKpi).toFixed(2)}
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
                <Progress value={project.completion} className="h-1.5 flex-1 [&>div]:bg-chart-2" aria-label={`Project completion ${project.completion}%`}/> {/* Smaller progress bar */}
                <span className="text-xs font-medium text-muted-foreground">{project.completion}%</span> {/* Smaller percentage text */}
              </div>
            </div>

            {/* Cumulative Mandays */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="h-4 w-4" /> {/* Smaller Icon */}
                <span>Mandays</span>
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
