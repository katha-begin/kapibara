
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react'; // Import useEffect and useMemo
import ProjectEditTable from '@/components/admin-control/project-edit-table';
import type { Project } from '@/types/project'; // Import the Project type
// Import raw JSON data for staging/fallback
import rawProjectsData from '@/data/projects.json';

// Function to process raw project data (convert date strings to Date objects)
const processProjectsData = (rawData: any[]): Project[] => {
  return rawData.map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    departmentContributions: project.departmentContributions ?? null,
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
      // Use different inline data for 'development' stage display
      console.log("Using inline DEVELOPMENT data source for Admin Control");
      data = processProjectsData([
        // Different inline data for DEV stage
        {
          "id": "dev-proj1",
          "name": "Dev Project A (Inline)",
          "department": ["Dev Team"],
          "kpiScore": 90,
          "completion": 80,
          "mandays": 50,
          "startDate": "2024-05-01",
          "endDate": "2024-09-30",
          "inhousePortion": 100,
          "outsourcePortion": 0,
          "allocatedMandays": 60,
          "departmentContributions": [
            { "department": "Dev Team", "mandays": 50, "completion": 80 }
          ]
        },
        {
          "id": "dev-proj2",
          "name": "Dev Project B (Inline)",
          "department": ["QA Team", "Dev Team"],
          "kpiScore": 75,
          "completion": 50,
          "mandays": 100,
          "startDate": "2024-06-10",
          "endDate": "2024-11-15",
          "inhousePortion": 70,
          "outsourcePortion": 30,
          "allocatedMandays": 120,
          "departmentContributions": [
            { "department": "QA Team", "mandays": 30, "completion": 20 },
            { "department": "Dev Team", "mandays": 70, "completion": 30 }
          ]
        }
      ]);
    }
    setProjects(data);
    setLoading(false);
  }, [dataSource]);


  const handleUpdateProject = (updatedProject: Project) => {
    // Update logic needs to consider the source (state vs. API)
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === updatedProject.id ? updatedProject : p))
    );
    // In a real app:
    // if (dataSource === 'json') { /* Make API call to update JSON/backend */ }
    // else { /* Update local state only for inline data */ }
    console.log("Updated Project (in-memory):", updatedProject);
    // Consider persisting changes back to JSON file via API/server action if needed for staging demo
  };

  if (loading) {
    return <div className="p-6">Loading project data for admin...</div>; // Basic loading state
  }


  return (
    <div className="flex flex-col p-4 md:p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-primary">Admin Control - Projects</h1>
          <p className="text-muted-foreground">Edit project details below. (Data source: {dataSource})</p>
        </header>
        <ProjectEditTable projects={projects} onUpdateProject={handleUpdateProject} />
    </div>
  );
};

export default AdminControlPage;
