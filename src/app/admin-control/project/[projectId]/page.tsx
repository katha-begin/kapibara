
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DepartmentAllocationTable from '@/components/admin-control/department-allocation-table';
import type { Project, DepartmentAllocation } from '@/types/project';
import { toast } from '@/hooks/use-toast';

// Import raw JSON data for both stages
import rawProjectsData from '@/data/projects.json';
import rawDevProjectsData from '@/data/projects_dev.json'; // Separate dev data

// Function to process raw project data (convert date strings, ensure allocations)
const processProjectsData = (rawData: any[]): Project[] => {
  return rawData.map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    departmentAllocations: project.departmentAllocations ?? [], // Default to empty array
    // Ensure other fields exist or are defaulted
    id: project.id ?? `proj-${Math.random().toString(36).substring(2, 9)}`,
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

// Mock list of available departments (replace with dynamic loading if needed)
const AVAILABLE_DEPARTMENTS = ["Engineering", "Marketing", "Design", "Sales", "QA Team", "Dev Team", "Operations"];

interface ProjectAllocationPageProps {
  params: { projectId: string };
}

const ProjectAllocationPage: FC<ProjectAllocationPageProps> = ({ params }) => {
  const { projectId } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Determine data source based on environment
  const dataSource = process.env.NEXT_PUBLIC_APP_ENV === 'development' ? 'inline' : 'json';

  useEffect(() => {
    setLoading(true);
    setError(null);
    let allProjectsData: Project[];

    try {
        if (dataSource === 'json') {
          console.log(`Fetching project ${projectId} allocations from JSON data source`);
          allProjectsData = processProjectsData(rawProjectsData);
        } else {
          console.log(`Fetching project ${projectId} allocations from inline DEVELOPMENT data source (projects_dev.json)`);
          allProjectsData = processProjectsData(rawDevProjectsData);
        }

        const foundProject = allProjectsData.find(p => p.id === projectId);
        if (foundProject) {
          // Ensure departmentAllocations is an array
          setProject({
            ...foundProject,
            departmentAllocations: foundProject.departmentAllocations ?? []
          });
        } else {
          setError(`Project with ID "${projectId}" not found in ${dataSource} data.`);
        }
    } catch (err) {
        console.error("Error loading project data:", err);
        setError("Failed to load project data.");
    } finally {
        setLoading(false);
    }

  }, [projectId, dataSource]);

  const handleUpdateAllocations = (updatedAllocations: DepartmentAllocation[]) => {
    if (!project) return;

    const updatedProject = { ...project, departmentAllocations: updatedAllocations };
    setProject(updatedProject);

    // In a real app, you would make an API call here to save the changes
    console.log("Updated Allocations (in-memory):", updatedAllocations);
    toast({
      title: "Department Allocations Updated",
      description: `Manday allocations for ${project.name} saved.`,
    });

    // TODO: Persist changes to JSON or backend API
    // Example (Conceptual - Needs API/Server Action):
    // fetch(`/api/projects/${projectId}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ departmentAllocations: updatedAllocations }),
    // })
    // .then(res => { if (!res.ok) throw new Error('Failed to save'); /* ... */ })
    // .catch(err => toast({ variant: 'destructive', title: 'Save Failed', description: err.message }));
  };

  if (loading) {
    return <div className="p-6">Loading department allocation data...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 md:p-6">
        <Link href="/admin-control" passHref>
          <Button variant="outline" className="absolute top-4 left-4 md:top-6 md:left-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
          </Button>
        </Link>
        <p className="text-xl text-destructive">{error}</p>
      </div>
    );
  }

  if (!project) {
     // Should be caught by error state, but as a fallback
    return <div className="p-6">Project data not available.</div>;
  }

  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">
          Department Manday Allocation: <span className="font-normal">{project.name}</span>
          <span className="text-sm ml-2 text-muted-foreground">(Data: {dataSource})</span>
        </h1>
        <Link href="/admin-control" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin Control
          </Button>
        </Link>
      </div>

      <DepartmentAllocationTable
        initialAllocations={project.departmentAllocations || []} // Pass current allocations
        availableDepartments={AVAILABLE_DEPARTMENTS} // Pass the list of departments
        onSave={handleUpdateAllocations}
      />
    </div>
  );
};

export default ProjectAllocationPage;
