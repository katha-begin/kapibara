
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
import {
  calculateMandayPercentage,
  getMandayProgressColorClass, // Use class-based color utility
  getKpiColorTable,
} from '@/lib/project-utils'; // Import utility functions

interface ProjectTableProps {
  projects: Project[];
  selectedProject: string; // Receive selected project state
}

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
             const mandayProgressColorClass = getMandayProgressColorClass(mandayPercentage); // Get color class
            // If a single project is selected, create a row for each department
            if (isSingleProjectSelected && project.department.length > 1) { // Only break down if multiple departments
              return project.department.map((dept, index) => (
                <TableRow key={`${project.id}-${dept}-${index}`}><TableCell className={cn("font-medium text-primary", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? project.name : ""}</TableCell><TableCell className={cn("text-muted-foreground", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{dept}</TableCell><TableCell className={cn("text-right font-semibold", getKpiColorTable(project.kpiScore, targetKpi), index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 && targetKpi > 0 ? (project.kpiScore / targetKpi).toFixed(2) : (index === 0 ? "N/A" : "")}</TableCell><TableCell className={cn(index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? (<div className="flex items-center gap-2"><Progress value={project.completion} className="h-2 w-16" indicatorClassName="bg-chart-2" aria-label={`Project completion ${project.completion}%`}/><span className="text-xs font-medium text-primary">{project.completion}%</span></div>) : ""}</TableCell><TableCell className={cn(index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? (mandayPercentage !== null ? (<div className="flex items-center gap-2"><Progress value={Math.min(mandayPercentage, 100)} className="h-2 w-16" indicatorClassName={mandayProgressColorClass} aria-label={`Manday usage ${mandayPercentage}%`}/><span className="text-xs font-medium text-primary">{mandayPercentage}%</span></div>) : (<span className="text-xs text-muted-foreground">N/A</span>)) : ""}</TableCell><TableCell className={cn("text-right font-semibold text-primary", index > 0 ? "border-t-0 pt-1 pb-1" : "")}>{index === 0 ? project.mandays ?? 'N/A' : ""}</TableCell></TableRow>
              ));
            } else {
              // If multiple projects or 'all' projects are selected, or single project with single department, show one row per project
              return (
                <TableRow key={project.id}><TableCell className="font-medium text-primary">{project.name}</TableCell><TableCell className="text-muted-foreground">{project.department.join(', ')}</TableCell><TableCell className={cn("text-right font-semibold", getKpiColorTable(project.kpiScore, targetKpi))}>{targetKpi > 0 ? (project.kpiScore / targetKpi).toFixed(2) : 'N/A'}</TableCell><TableCell><div className="flex items-center gap-2"><Progress value={project.completion} className="h-2 w-16" indicatorClassName="bg-chart-2" aria-label={`Project completion ${project.completion}%`}/><span className="text-xs font-medium text-primary">{project.completion}%</span></div></TableCell><TableCell>{mandayPercentage !== null ? (<div className="flex items-center gap-2"><Progress value={Math.min(mandayPercentage, 100)} className="h-2 w-16" indicatorClassName={mandayProgressColorClass} aria-label={`Manday usage ${mandayPercentage}%`}/><span className="text-xs font-medium text-primary">{mandayPercentage}%</span></div>) : (<span className="text-xs text-muted-foreground">N/A</span>)}</TableCell><TableCell className="text-right font-semibold text-primary">{project.mandays ?? 'N/A'}</TableCell></TableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProjectTable;
