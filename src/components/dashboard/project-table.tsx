
import type { FC } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Import cn for conditional classes
import type { Project } from '@/types/project'; // Import the Project type

interface ProjectTableProps {
  projects: Project[];
  selectedProject: string; // Receive selected project state
}

// Function to determine KPI color based on score relative to target (1 is ideal - green, deviation scales to red)
const getKpiColor = (kpiScore: number, targetKpi: number): string => {
  const ratio = kpiScore / targetKpi;
  if (ratio === 1) {
    return "text-green-600"; // Perfect score
  } else if (ratio < 1.05 && ratio > 0.95) { // Adjusted ranges slightly
    return "text-lime-600"; // Close to 1 (more forgiving)
  } else if (ratio < 1.15 && ratio > 0.85) {
    return "text-yellow-600"; // Moderately off
  } else if (ratio < 1.30 && ratio > 0.70) {
    return "text-orange-600"; // Significantly off
  } else {
    return "text-destructive"; // Very far off (bad)
  }
};

// Function to calculate manday cumulative percentage
const calculateMandayPercentage = (actualMandays: number | null | undefined, allocatedMandays: number | null | undefined): number | null => {
    const actual = actualMandays ?? 0;
    const allocated = allocatedMandays ?? 0;

    if (allocated <= 0) {
        return null; // Cannot calculate if allocated is zero or less, or missing
    }

    const percentage = Math.round((actual / allocated) * 100);
    return Math.max(0, percentage); // Can exceed 100%
};

// Function to determine manday progress bar color based on percentage
const getMandayProgressColor = (percentage: number | null): string => {
  if (percentage === null) return "[&>div]:bg-muted"; // Muted color if N/A
  if (percentage <= 80) return "[&>div]:bg-green-500";
  if (percentage <= 100) return "[&>div]:bg-yellow-500";
  return "[&>div]:bg-destructive"; // Red if over 100%
};


const ProjectTable: FC<ProjectTableProps> = ({ projects, selectedProject }) => {
  const isSingleProjectSelected = selectedProject !== 'all' && projects.length > 0;
  const targetKpi = 85; // Define the target KPI

  return (
    <Card className="shadow-md">
      <Table>
        <TableHeader>
          <TableRow><TableHead>Project Name</TableHead><TableHead>Department(s)</TableHead><TableHead className="text-right">KPI Ratio</TableHead><TableHead>Completion</TableHead><TableHead>Manday Usage</TableHead><TableHead className="text-right">Actual Mandays</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {projects.flatMap((project) => {
             const mandayPercentage = calculateMandayPercentage(project.mandays, project.allocatedMandays);
            // If a single project is selected, create a row for each department
            if (isSingleProjectSelected && project.department.length > 1) { // Only break down if multiple departments
              return project.department.map((dept, index) => (
                <TableRow key={`${project.id}-${dept}-${index}`}>{/* Show project name only for the first department row */}<TableCell className={cn("font-medium text-primary", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? project.name : ""}</TableCell><TableCell className={cn("text-muted-foreground", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{dept}</TableCell>{/* Shared values only shown for the first row */}<TableCell className={cn("text-right font-semibold", getKpiColor(project.kpiScore, targetKpi), index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? (project.kpiScore / targetKpi).toFixed(2) : ""}</TableCell><TableCell className={cn(index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? (<div className="flex items-center gap-2"><Progress value={project.completion} className="h-2 w-16 [&>div]:bg-chart-2" aria-label={`Project completion ${project.completion}%`}/><span className="text-xs font-medium text-primary">{project.completion}%</span></div>) : ""}</TableCell>{/* Manday Percentage - show only for first row */}<TableCell className={cn(index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? (mandayPercentage !== null ? (<div className="flex items-center gap-2"><Progress value={Math.min(mandayPercentage, 100)} className={cn("h-2 w-16", getMandayProgressColor(mandayPercentage))} aria-label={`Manday usage ${mandayPercentage}%`}/><span className="text-xs font-medium text-primary">{mandayPercentage}%</span></div>) : (<span className="text-xs text-muted-foreground">N/A</span>)) : ""}</TableCell><TableCell className={cn("text-right font-semibold text-primary", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? project.mandays ?? 'N/A' : ""}</TableCell></TableRow>
              ));
            } else {
              // If multiple projects or 'all' projects are selected, or single project with single department, show one row per project
              return (
                <TableRow key={project.id}><TableCell className="font-medium text-primary">{project.name}</TableCell><TableCell className="text-muted-foreground">{project.department.join(', ')}</TableCell><TableCell className={cn("text-right font-semibold", getKpiColor(project.kpiScore, targetKpi))}>{(project.kpiScore / targetKpi).toFixed(2)}</TableCell><TableCell><div className="flex items-center gap-2"><Progress value={project.completion} className="h-2 w-16 [&>div]:bg-chart-2" aria-label={`Project completion ${project.completion}%`}/><span className="text-xs font-medium text-primary">{project.completion}%</span></div></TableCell>{/* Manday Percentage */}<TableCell>{mandayPercentage !== null ? (<div className="flex items-center gap-2"><Progress value={Math.min(mandayPercentage, 100)} className={cn("h-2 w-16", getMandayProgressColor(mandayPercentage))} aria-label={`Manday usage ${mandayPercentage}%`}/><span className="text-xs font-medium text-primary">{mandayPercentage}%</span></div>) : (<span className="text-xs text-muted-foreground">N/A</span>)}</TableCell><TableCell className="text-right font-semibold text-primary">{project.mandays ?? 'N/A'}</TableCell></TableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProjectTable;
