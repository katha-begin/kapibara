
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react'; // Import useEffect
import ProjectEditTable from '@/components/admin-control/project-edit-table';
import type { Project } from '@/types/project'; // Import the Project type
import rawProjectsData from '@/data/projects.json'; // Import raw JSON data

// Process raw data to convert date strings to Date objects
const initialProjectsData: Project[] = rawProjectsData.map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    // Ensure departmentContributions is handled correctly
    departmentContributions: project.departmentContributions ?? null,
}));


const AdminControlPage: FC = () => {
  // Initialize state with processed data
  const [projects, setProjects] = useState<Project[]>(initialProjectsData);

  // Note: If you were fetching from an API, you'd use useEffect here
  // useEffect(() => {
  //   // Fetch data from API and setProjects
  // }, []);

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
    // Here you would typically make an API call to save the changes to the backend
    console.log("Updated Project:", updatedProject);
    // If using local JSON for mock persistence (advanced mock):
    // You might consider updating the JSON file via a server action or API route in a real dev setup,
    // but for simple frontend mock, just updating state is sufficient.
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
