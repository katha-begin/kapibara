
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

interface ProjectData {
  id: string;
  name: string;
  department: string[]; // Updated to array
  kpiScore: number;
  completion: number;
  mandays: number;
}

interface ProjectTableProps {
  projects: ProjectData[];
  selectedProject: string; // Receive selected project state
}

// Function to determine KPI color based on score relative to target (lower is better)
const getKpiColor = (kpiScore: number, targetKpi: number): string => {
  const ratio = kpiScore / targetKpi;
  // Using Tailwind classes directly for simplicity. Theme variables could be used for better consistency.
  if (ratio < 0.95) { // Significantly below target (Better)
    return "text-green-600"; // Use a green color
  } else if (ratio > 1.05) { // Significantly above target (Bad)
    return "text-destructive"; // Use destructive color (usually red)
  } else { // Close to target (Good)
    return "text-amber-600"; // Use an amber/yellow color
  }
};

const ProjectTable: FC<ProjectTableProps> = ({ projects, selectedProject }) => {
  const isSingleProjectSelected = selectedProject !== 'all' && projects.length > 0;
  const targetKpi = 85; // Define the target KPI

  return (
    <Card className="shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Department(s)</TableHead>
            <TableHead className="text-right">KPI Score</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead className="text-right">Mandays</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.flatMap((project) => {
            // If a single project is selected, create a row for each department
            if (isSingleProjectSelected && project.department.length > 1) { // Only break down if multiple departments
              return project.department.map((dept, index) => (
                <TableRow key={`${project.id}-${dept}-${index}`}>
                  {/* Show project name only for the first department row */}
                  <TableCell className={cn("font-medium text-primary", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>
                     {index === 0 ? project.name : ""}
                  </TableCell>
                  <TableCell className={cn("text-muted-foreground", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>
                    {dept}
                  </TableCell>
                  {/* Shared values only shown for the first row */}
                  <TableCell className={cn("text-right font-semibold", getKpiColor(project.kpiScore, targetKpi), index > 0 ? "border-t-0 pt-1 pb-1" : "")}>
                    {index === 0 ? (project.kpiScore / targetKpi).toFixed(2) : ""}
                  </TableCell>
                  <TableCell className={cn(index > 0 ? "border-t-0 pt-1 pb-1" : "")}>
                    {index === 0 ? (
                      <div className="flex items-center gap-2">
                        <Progress value={project.completion} className="h-2 w-24 [&>div]:bg-chart-2" aria-label={`Project completion ${project.completion}%`}/>
                        <span className="text-sm font-medium text-primary">{project.completion}%</span>
                      </div>
                    ) : ""}
                  </TableCell>
                   <TableCell className={cn("text-right font-semibold text-primary", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>
                    {index === 0 ? project.mandays : ""}
                   </TableCell>
                </TableRow>
              ));
            } else {
              // If multiple projects or 'all' projects are selected, or single project with single department, show one row per project
              return (
                <TableRow key={project.id}>
                  <TableCell className="font-medium text-primary">{project.name}</TableCell>
                  <TableCell className="text-muted-foreground">{project.department.join(', ')}</TableCell>
                  <TableCell className={cn("text-right font-semibold", getKpiColor(project.kpiScore, targetKpi))}>
                     {/* Display KPI as ratio */}
                    {(project.kpiScore / targetKpi).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={project.completion} className="h-2 w-24 [&>div]:bg-chart-2" aria-label={`Project completion ${project.completion}%`}/>
                      <span className="text-sm font-medium text-primary">{project.completion}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">{project.mandays}</TableCell>
                </TableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProjectTable;
