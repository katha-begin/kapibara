
'use client'; // Change to client component to handle data source switching

import type { Metadata } from "next";
import { useState, useEffect, useMemo } from 'react'; // Import useMemo
import Dashboard from "@/components/dashboard/dashboard";
import type { Project } from "@/types/project"; // Import the Project type
// Import raw JSON data for staging/fallback
import rawProjectsData from '@/data/projects.json';

// Metadata needs to be handled differently in Client Components or moved to layout if static
// export const metadata: Metadata = {
//   title: "Kapibara - Project Dashboard", // Specific title for the page
//   description: "ERP Dashboard Overview",
// };

// Function to process raw project data (convert date strings to Date objects)
const processProjectsData = (rawData: any[]): Project[] => {
  return rawData.map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    departmentContributions: project.departmentContributions ?? null,
  }));
};


export default function HomePage() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Determine data source based on environment (simplified for example)
  // In a real app, this might involve context or a hook
  const dataSource = process.env.NEXT_PUBLIC_APP_ENV === 'development' ? 'inline' : 'json';

  useEffect(() => {
    setLoading(true);
    let data: Project[];
    if (dataSource === 'json') {
      // Simulate fetching from JSON (could be an API call in future)
      console.log("Using JSON data source");
      data = processProjectsData(rawProjectsData);
    } else {
      // Use different inline data for 'development' stage display
      console.log("Using inline DEVELOPMENT data source");
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
    setProjectsData(data);
    setLoading(false);
  }, [dataSource]); // Re-run if data source changes (for demonstration)

  // Calculate departments and project names from the currently loaded data
  const departments = useMemo(() =>
    Array.from(new Set(projectsData.flatMap(p => p.department))),
    [projectsData]
  );
  const projectNames = useMemo(() =>
    projectsData.map(p => p.name),
    [projectsData]
  );

  if (loading) {
    return <div className="p-6">Loading dashboard data...</div>; // Basic loading state
  }

  return (
    <>
      {/* You might want to set the title using document.title in useEffect if needed */}
      <Dashboard
          projectsData={projectsData}
          departments={departments}
          projectNames={projectNames}
      />
    </>
  );
}
