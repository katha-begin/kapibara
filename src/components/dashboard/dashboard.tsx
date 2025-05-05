
'use client';

import { useState, useMemo, useEffect, type FC } from 'react';
import DashboardFilters from './dashboard-filters';
import ProjectCard from './project-card';
import ProjectTable from './project-table';
import SummaryCard from './summary-card';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from 'lucide-react';

interface ProjectData {
  id: string;
  name: string;
  department: string[]; // Updated to array
  kpiScore: number;
  completion: number;
  mandays: number;
}

interface DashboardProps {
    projectsData: ProjectData[];
    departments: string[]; // All unique departments passed initially
    projectNames: string[];
}

const Dashboard: FC<DashboardProps> = ({ projectsData, departments, projectNames }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Determine available departments based on selected project
  const availableDepartments = useMemo(() => {
    if (selectedProject === 'all') {
      return departments; // Show all unique departments if no specific project is selected
    }
    const project = projectsData.find(p => p.name === selectedProject);
    return project ? project.department : []; // Show only departments of the selected project
  }, [selectedProject, projectsData, departments]);

  // Effect to reset department filter if the selected department is not available for the chosen project
  useEffect(() => {
    if (selectedDepartment !== 'all' && !availableDepartments.includes(selectedDepartment)) {
      setSelectedDepartment('all');
    }
  }, [selectedProject, availableDepartments, selectedDepartment]);


  const filteredProjects = useMemo(() => {
    let projects = projectsData;

    // Filter by selected project first
    if (selectedProject !== 'all') {
      projects = projects.filter(project => project.name === selectedProject);
    }

    // Then filter by selected department within the already filtered projects (or all projects if 'all' projects selected)
    if (selectedDepartment !== 'all') {
      projects = projects.filter(project => project.department.includes(selectedDepartment));
    }

    return projects;
  }, [projectsData, selectedProject, selectedDepartment]);

  // Calculate summary metrics based on filtered projects
  const summaryMetrics = useMemo(() => {
    const totalProjects = filteredProjects.length;
    if (totalProjects === 0) {
        return {
            totalProjects: 0,
            avgKpiScore: 0,
            avgCompletion: 0,
            totalMandays: 0,
        };
    }
    const totalKpiScore = filteredProjects.reduce((sum, p) => sum + p.kpiScore, 0);
    const totalCompletion = filteredProjects.reduce((sum, p) => sum + p.completion, 0);
    const totalMandays = filteredProjects.reduce((sum, p) => sum + p.mandays, 0);

    return {
        totalProjects,
        avgKpiScore: Math.round(totalKpiScore / totalProjects),
        avgCompletion: Math.round(totalCompletion / totalProjects),
        totalMandays,
    };
  }, [filteredProjects]);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="bg-card border-b p-4 shadow-sm flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-primary">BizFlow Dashboard</h1>
            <div className="flex gap-2">
                <Button
                    variant={viewMode === 'card' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('card')}
                    aria-label="Card View"
                >
                    <LayoutGrid />
                </Button>
                <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setViewMode('table')}
                    aria-label="Table View"
                >
                    <List />
                </Button>
            </div>
         </header>
         <ScrollArea className="flex-1 p-4 md:p-6">
           <DashboardFilters
              availableDepartments={availableDepartments} // Pass dynamic list
              projectNames={projectNames}
              selectedDepartment={selectedDepartment}
              selectedProject={selectedProject}
              onDepartmentChange={setSelectedDepartment}
              onProjectChange={setSelectedProject}
            />
            <SummaryCard metrics={summaryMetrics} className="mb-6" />

            {filteredProjects.length > 0 ? (
              <div>
                {viewMode === 'card' ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <ProjectTable projects={filteredProjects} />
                )}
              </div>
            ) : (
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">No projects match the selected filters.</p>
                </div>
            )}
         </ScrollArea>
       </div>
    </div>
  );
};

export default Dashboard;
