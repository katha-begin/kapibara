
'use client'; // Change to client component to handle data source switching

import type { Metadata } from "next";
import { useState, useEffect, useMemo } from 'react'; // Import useMemo
import Dashboard from "@/components/dashboard/dashboard";
import type { Project } from "@/types/project"; // Import the Project type
// Import raw JSON data for staging/fallback
import rawProjectsData from '@/data/projects.json';
import rawDevProjectsData from '@/data/projects_dev.json'; // Import separate dev data

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


export default function HomePage() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Determine data source based on environment (simplified for example)
  const dataSource = process.env.NEXT_PUBLIC_APP_ENV === 'development' ? 'inline' : 'json';

  useEffect(() => {
    setLoading(true);
    let data: Project[];
    if (dataSource === 'json') {
      // Simulate fetching from JSON (could be an API call in future)
      console.log("Using JSON data source");
      data = processProjectsData(rawProjectsData);
    } else {
      // Use different inline data for 'development' stage display from projects_dev.json
      console.log("Using inline DEVELOPMENT data source (from projects_dev.json)");
      data = processProjectsData(rawDevProjectsData); // Load from dev JSON
    }
    setProjectsData(data);
    setLoading(false);
  }, [dataSource]); // Re-run if data source changes (for demonstration)

  // Calculate departments and project names from the currently loaded data
  const departments = useMemo(() =>
    // Use departmentAllocations if available, otherwise fall back to project.department
    Array.from(new Set(projectsData.flatMap(p =>
      p.departmentAllocations ? p.departmentAllocations.map(da => da.department) : p.department
    ))),
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
