
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react'; // Import useEffect and useMemo
import ProjectEditTable from '@/components/admin-control/project-edit-table';
import type { Project } from '@/types/project'; // Import the Project type
// Import raw JSON data for staging/fallback
import rawProjectsData from '@/data/projects.json';
import rawDevProjectsData from '@/data/projects_dev.json'; // Import separate dev data

// Function to process raw project data (convert date strings to Date objects)
const processProjectsData = (rawData: any[]): Project[] => {
  return rawData.map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    // Rename departmentContributions to departmentAllocations for consistency
    departmentAllocations: project.departmentAllocations ?? null,
    // Ensure other fields exist or are defaulted if missing in raw data
    id: project.id ?? `proj-${Math.random().toString(36).substring(2, 9)}`, // Generate ID if missing
    name: project.name ?? 'Unnamed Project',
    department: project.department ?? [],
    kpiScore: project.kpiScore ?? 0,
    completion: project.completion ?? 0,
    mandays: project.mandays ?? null,
    allocatedMandays: project.allocatedMandays ?? null,
    inhousePortion: project.inhousePortion ?? null,
    outsourcePortion: project.outsourcePortion ?? null,
  }));
};


const AdminControlPage: FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Determine data source based on environment (simplified)
  const dataSource = process.env.NEXT_PUBLIC_APP_ENV === 'development' ? 'inline' : 'json';

  useEffect(() => {
    setLoading(true);
    let data: Project[];
    if (dataSource === 'json') {
      // Simulate fetching from JSON (could be API call)
      console.log("Using JSON data source for Admin Control");
      data = processProjectsData(rawProjectsData);
    } else {
      // Use different inline data for 'development' stage display from projects_dev.json
      console.log("Using inline DEVELOPMENT data source for Admin Control (from projects_dev.json)");
      data = processProjectsData(rawDevProjectsData); // Load from dev JSON
    }
    setProjects(data);
    setLoading(false);
  }, [dataSource]);


  // Adjusted to handle partial updates
  const handleUpdateProject = (updatedProjectData: Partial<Project> & { id: string }) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === updatedProjectData.id ? { ...p, ...updatedProjectData } : p
      )
    );
    // In a real app:
    // if (dataSource === 'json') { /* Make API call to update JSON/backend */ }
    // else { /* Update local state only for inline data */ }
    console.log("Updated Project (in-memory):", updatedProjectData);
    // Consider persisting changes back to JSON file via API/server action if needed for staging demo
  };


  if (loading) {
    return <div className="p-6">Loading project admin data...</div>; // Updated loading state message
  }


  return (
    <div className="flex flex-col p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-primary">Admin Control - Projects</h1>
          <p className="text-muted-foreground">Edit project details below. Click project name to manage department allocations. (Data source: {dataSource})</p>
        </header>
        <ProjectEditTable projects={projects} onUpdateProject={handleUpdateProject} />
    </div>
  );
};

export default AdminControlPage;
