
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import ProjectEditTable from '@/components/admin-control/project-edit-table';
import type { Project } from '@/types/project'; // Import the Project type

// Mock data - including new fields, using initial null/undefined values
// This would typically come from an API or database
const initialProjectsData: Project[] = [
  { id: 'proj1', name: 'Project Alpha', department: ['Engineering'], kpiScore: 85, completion: 70, mandays: 120, startDate: new Date(2024, 0, 15), endDate: new Date(2024, 5, 30), inhousePortion: 80, outsourcePortion: 20 },
  { id: 'proj2', name: 'Project Beta', department: ['Marketing'], kpiScore: 92, completion: 95, mandays: 80, startDate: new Date(2024, 1, 1), endDate: new Date(2024, 4, 15), inhousePortion: 100, outsourcePortion: 0 },
  { id: 'proj3', name: 'Project Gamma', department: ['Engineering', 'Design'], kpiScore: 78, completion: 40, mandays: 200, startDate: null, endDate: null, inhousePortion: 50, outsourcePortion: 50 },
  { id: 'proj4', name: 'Project Delta', department: ['Sales', 'Marketing'], kpiScore: 88, completion: 80, mandays: 50, startDate: new Date(2024, 2, 10), endDate: new Date(2024, 4, 20), inhousePortion: null, outsourcePortion: null },
  { id: 'proj5', name: 'Project Epsilon', department: ['Marketing'], kpiScore: 95, completion: 100, mandays: 65, startDate: new Date(2023, 11, 1), endDate: new Date(2024, 2, 28), inhousePortion: 90, outsourcePortion: 10 },
  { id: 'proj6', name: 'Project Zeta', department: ['Engineering', 'Sales'], kpiScore: 80, completion: 60, mandays: 150, startDate: new Date(2024, 3, 1), endDate: null, inhousePortion: 70, outsourcePortion: 30 },
];


const AdminControlPage: FC = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjectsData);

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
    // Here you would typically make an API call to save the changes to the backend
    console.log("Updated Project:", updatedProject);
  };

  return (
    <div className="flex flex-col p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-primary">Admin Control - Projects</h1>
          <p className="text-muted-foreground">Edit project details below.</p>
        </header>
        <ProjectEditTable projects={projects} onUpdateProject={handleUpdateProject} />
    </div>
  );
};

export default AdminControlPage;
