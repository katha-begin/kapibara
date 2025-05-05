'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link'; // Import Link
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProjectEditForm from './project-edit-form';
import type { Project } from '@/types/project'; // Import the Project type

interface ProjectEditTableProps {
  projects: Project[];
  onUpdateProject: (updatedProject: Partial<Project> & { id: string }) => void; // Adjusted to handle partial updates
}

const ProjectEditTable: FC<ProjectEditTableProps> = ({ projects, onUpdateProject }) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  // Adjusted to handle partial updates from the form
  const handleFormSubmit = (updatedProjectData: Partial<Project> & { id: string }) => {
     if (!editingProject) return;
     // Merge the updated data with the existing project data
     const fullyUpdatedProject = { ...editingProject, ...updatedProjectData };
     onUpdateProject(fullyUpdatedProject); // Pass the merged object
     setIsDialogOpen(false); // Close dialog on successful submit
     setEditingProject(null);
   };


  const formatDate = (date: Date | null | undefined) => {
    return date ? format(date, 'PPP') : 'N/A';
  };

   const formatPercentage = (value: number | null | undefined) => {
    return typeof value === 'number' ? `${value}%` : 'N/A';
  };

  // Calculate sum of department allocated mandays
  const calculateTotalDeptAllocation = (project: Project): number | string => {
    if (!project.departmentAllocations || project.departmentAllocations.length === 0) return 'N/A'; // Check for empty array too
    return project.departmentAllocations.reduce((sum, dept) => sum + (dept.allocatedMandays || 0), 0); // Handle null/undefined mandays
  };


  return (
    <Card className="shadow-md">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Project Name</TableHead><TableHead>Start Date</TableHead><TableHead>End Date</TableHead><TableHead className="text-right">Overall Allocated</TableHead><TableHead className="text-right">Dept. Allocated Sum</TableHead><TableHead className="text-right">Inhouse %</TableHead><TableHead className="text-right">Outsource %</TableHead><TableHead className="text-center">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                {/* Project Name as Link */}
                <TableCell className="font-medium text-primary hover:underline"><Link href={`/admin-control/project/${project.id}`}>{project.name}</Link></TableCell><TableCell>{formatDate(project.startDate)}</TableCell><TableCell>{formatDate(project.endDate)}</TableCell><TableCell className="text-right">{project.allocatedMandays ?? 'N/A'}</TableCell><TableCell className="text-right">{calculateTotalDeptAllocation(project)}</TableCell><TableCell className="text-right">{formatPercentage(project.inhousePortion)}</TableCell><TableCell className="text-right">{formatPercentage(project.outsourcePortion)}</TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => handleEditClick(project)} aria-label={`Edit ${project.name}`}><Pencil className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg">
                <DialogHeader>
                <DialogTitle>Edit Project: {editingProject?.name}</DialogTitle>
                </DialogHeader>
                {editingProject && (
                    <ProjectEditForm
                        project={editingProject}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                )}
            </DialogContent>
        </Dialog>
    </Card>
  );
};

export default ProjectEditTable;