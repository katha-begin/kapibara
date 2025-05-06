
'use client';

import { useState, useEffect, useMemo } from 'react';
import Dashboard from "@/components/dashboard/dashboard";
import type { Project } from "@/types/project";
import { adaptProcessedDataToProjects } from '@/lib/data-adapters';

export default function HomePage() {
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Use the adapter to get projects in the expected format
        const data = adaptProcessedDataToProjects();
        if (isMounted) {
          setProjectsData(data);
        }
      } catch (error) {
        console.error("Error loading project data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

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
