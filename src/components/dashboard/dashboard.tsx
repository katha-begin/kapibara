
'use client';

import { useState, useMemo, useEffect, type FC } from 'react';
import DashboardFilters from './dashboard-filters';
import ProjectCard from './project-card';
import ProjectTable from './project-table';
import SummaryCard from './summary-card';
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from 'lucide-react';
import type { Project } from '@/types/project'; // Import the Project type


interface DashboardProps {
    projectsData: Project[];
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
    const totalMandays = filteredProjects.reduce((sum, p) => sum + (p.mandays ?? 0), 0); // Handle potential null mandays

    return {
        totalProjects,
        avgKpiScore: Math.round(totalKpiScore / totalProjects),
        avgCompletion: Math.round(totalCompletion / totalProjects),
        totalMandays,
    };
  }, [filteredProjects]);

  return (
    // Removed padding here, will be added in layout.tsx or page.tsx if needed globally
    <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4 md:mb-6"> {/* Adjusted margin */}
           {/* Reduced heading size */}
           <h1 className="text-xl font-semibold text-foreground">Project Dashboard</h1>
           <div className="flex gap-2">
               <Button
                   variant={viewMode === 'card' ? 'secondary' : 'ghost'} // Adjusted variants for subtle look
                   size="icon"
                   onClick={() => setViewMode('card')}
                   aria-label="Card View"
                   className={viewMode === 'card' ? 'bg-muted text-primary' : 'text-muted-foreground'}
               >
                   <LayoutGrid className="h-5 w-5"/>
               </Button>
               <Button
                   variant={viewMode === 'table' ? 'secondary' : 'ghost'} // Adjusted variants
                   size="icon"
                   onClick={() => setViewMode('table')}
                   aria-label="Table View"
                   className={viewMode === 'table' ? 'bg-muted text-primary' : 'text-muted-foreground'}
               >
                   <List className="h-5 w-5"/>
               </Button>
           </div>
        </div>

        <DashboardFilters
         availableDepartments={availableDepartments} // Pass dynamic list
         projectNames={projectNames}
         selectedDepartment={selectedDepartment}
         selectedProject={selectedProject}
         onDepartmentChange={setSelectedDepartment}
         onProjectChange={setSelectedProject}
       />
       <SummaryCard metrics={summaryMetrics} className="mb-4 md:mb-6" /> {/* Adjusted margin */}

       {filteredProjects.length > 0 ? (
         <div>
           {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Reduced gap */}
               {filteredProjects.map((project) => (
                 <ProjectCard key={project.id} project={project} />
               ))}
             </div>
           ) : (
             <ProjectTable
               projects={filteredProjects}
               selectedProject={selectedProject} // Pass selectedProject down
             />
           )}
         </div>
       ) : (
           <div className="flex justify-center items-center h-64">
               <p className="text-muted-foreground">No projects match the selected filters.</p>
           </div>
       )}
     </div>
  );
};

export default Dashboard;
