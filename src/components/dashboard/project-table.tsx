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
import { Card } from "@/components/ui/card"; // Use Card for container styling

interface ProjectData {
  id: string;
  name: string;
  department: string;
  kpiScore: number;
  completion: number;
  mandays: number;
}

interface ProjectTableProps {
  projects: ProjectData[];
}

const ProjectTable: FC<ProjectTableProps> = ({ projects }) => {
  return (
    <Card className="shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Avg. KPI</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead className="text-right">Mandays</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium text-primary">{project.name}</TableCell>
              <TableCell className="text-muted-foreground">{project.department}</TableCell>
              <TableCell className="text-right font-semibold text-primary">{project.kpiScore}%</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Progress value={project.completion} className="h-2 w-24 [&>div]:bg-chart-2" aria-label={`Project completion ${project.completion}%`}/>
                  <span className="text-sm font-medium text-primary">{project.completion}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">{project.mandays}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProjectTable;
