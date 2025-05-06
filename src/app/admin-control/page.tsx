
'use client';

import { useState, useEffect } from 'react';
import ProjectEditTable from '@/components/admin-control/project-edit-table';
import type { Project } from '@/types/project';
import { getProjects } from '@/lib/data-adapters';

const AdminControlPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Use the adapter to get projects in the expected format
        const data = await getProjects();
        if (isMounted) {
          setProjects(data);
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
          <p className="text-muted-foreground">Edit project details below. Click project name to manage department allocations.</p>
        </header>
        <ProjectEditTable projects={projects} onUpdateProject={handleUpdateProject} />
    </div>
  );
};

export default AdminControlPage;
