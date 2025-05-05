'use client';

import { useState, useMemo, type FC } from 'react';
import DashboardFilters from './dashboard-filters';
import ProjectCard from './project-card';
import SummaryCard from './summary-card'; // Import the new SummaryCard component
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProjectData {
  id: string;
  name: string;
  department: string;
  kpiScore: number;
  completion: number;
  mandays: number;
}

interface DashboardProps {
    projectsData: ProjectData[];
    departments: string[];
    projectNames: string[];
}

const Dashboard: FC<DashboardProps> = ({ projectsData, departments, projectNames }) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const filteredProjects = useMemo(() => {
    return projectsData.filter((project) => {
      const departmentMatch = selectedDepartment === 'all' || project.department === selectedDepartment;
      const projectMatch = selectedProject === 'all' || project.name === selectedProject;
      return departmentMatch && projectMatch;
    });
  }, [projectsData, selectedDepartment, selectedProject]);

  // Calculate summary metrics
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
        {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="bg-card border-b p-4 shadow-sm">
            <h1 className="text-2xl font-semibold text-primary">BizFlow Dashboard</h1>
         </header>
         <ScrollArea className="flex-1 p-4 md:p-6">
           <DashboardFilters
              departments={departments}
              projectNames={projectNames}
              selectedDepartment={selectedDepartment}
              selectedProject={selectedProject}
              onDepartmentChange={setSelectedDepartment}
              onProjectChange={setSelectedProject}
            />
            {/* Add the Summary Card */}
            <SummaryCard metrics={summaryMetrics} className="mb-6" />

            {filteredProjects.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
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
