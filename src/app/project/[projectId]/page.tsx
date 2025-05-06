
'use client';

import type { FC } from 'react';
import { useState, useEffect, useMemo, use } from 'react';
import { format } from 'date-fns';
import ProjectStatsSummary from '@/components/project-analytics/project-stats-summary';
import CompletionVsMandayChart from '@/components/project-analytics/completion-vs-manday-chart';
import DepartmentMandayPieChart from '@/components/project-analytics/department-manday-pie-chart';
import DepartmentCompletionPieChart from '@/components/project-analytics/department-completion-pie-chart';
import WeeklyDepartmentProgressChart from '@/components/project-analytics/weekly-department-progress-chart';
import type { Project, ProjectWeeklyProgress, DepartmentAllocation, WeeklyDepartmentProgressData } from '@/types/project'; // Import DepartmentAllocation
import { calculateMandayPercentage } from '@/lib/project-utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Project, ProjectWeeklyProgress, WeeklyDepartmentProgressData } from '@/types/project';
import { adaptProcessedDataToProjects } from '@/lib/data-adapters';
import rawProcessedData from '@/data/processed_data.json';

// Function to fetch project data and weekly progress from processed_data.json
const fetchProjectData = (
  projectId: string,
): { 
  project: Project | null; 
  weeklyProgress: ProjectWeeklyProgress[]; 
  weeklyDepartmentProgress: WeeklyDepartmentProgressData[] 
} => {
  try {
    // Get project from processed_projects.json
    const allProjectsData = getProjects();
    const project = allProjectsData.find(p => p.id === projectId) ?? null;
    
    // Initialize weekly progress arrays
    const weeklyProgress: ProjectWeeklyProgress[] = [];
    const weeklyDepartmentProgress: WeeklyDepartmentProgressData[] = [];
    
    // Get weekly data from processed_data.json
    if (rawProcessedData && Array.isArray(rawProcessedData.projects)) {
      // Find the project in the raw processed data to get weekly data
      const rawProject = rawProcessedData.projects.find(
        p => (p.project_id === projectId) || (p.project_name === projectId)
      );
      
      // If we found the project in the raw data, extract its weekly data
      if (rawProject && Array.isArray(rawProject.weekly_data)) {
        // Convert raw weekly data to our expected format
        rawProject.weekly_data.forEach((weekData, index) => {
          // Only include weeks with data
          if (weekData) {
            try {
              const weekDate = new Date(weekData.week_end_date);
              
              // Add to weekly progress
              weeklyProgress.push({
                week: index + 1,
                date: weekDate,
                kpiScore: weekData.kpis_ratio || 0,
                completion: weekData.completion_rate || 0,
                mandays: weekData.cumulative_actual_mandays || 0
              });
              
              // Process department mandays for this week
              if (Array.isArray(weekData.department_mandays)) {
                const deptData: Record<string, number> = {};
                
                // First collect all department mandays
                weekData.department_mandays.forEach(dept => {
                  if (dept && dept.Department) {
                    deptData[dept.Department] = dept.mandays || 0;
                  }
                });
                
                // Then create a weekly department progress entry
                if (Object.keys(deptData).length > 0) {
                  weeklyDepartmentProgress.push({
                    weekEnding: weekData.week_end_date,
                    ...deptData
                  });
                }
              }
            } catch (err) {
              console.error("Error processing week data:", err);
            }
          }
        });
      }
    }
    
    return { project, weeklyProgress, weeklyDepartmentProgress };
  } catch (err) {
    console.error("Error fetching or processing project data:", err);
    return { project: null, weeklyProgress: [], weeklyDepartmentProgress: [] };
  }
};


interface ProjectAnalyticsPageProps {
  params: { projectId: string };
}

const ProjectAnalyticsPage: FC<ProjectAnalyticsPageProps> = ({ params }) => {
  const { projectId } = params; // Direct access is fine in latest Next.js client components

  const [projectData, setProjectData] = useState<{ project: Project | null; weeklyProgress: ProjectWeeklyProgress[]; weeklyDepartmentProgress: WeeklyDepartmentProgressData[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Add error state

  // Determine data source based on environment
  const dataSource = process.env.NEXT_PUBLIC_APP_ENV === 'development' ? 'inline' : process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 'production' : 'json';

  useEffect(() => {
    setLoading(true);
    setError(null); // Reset error on new fetch
    try {
        const data = fetchProjectData(projectId, dataSource);
        if (!data.project) {
             setError(`Project with ID "${projectId}" not found in ${dataSource} data.`);
        }
        setProjectData(data);
    } catch (err) {
        console.error("Error fetching or processing project data:", err);
        setError("Failed to load project analytics data.");
    } finally {
        setLoading(false);
    }
  }, [projectId, dataSource]);

  const project = projectData?.project;
  const weeklyProgress = projectData?.weeklyProgress ?? [];
  const weeklyDepartmentProgress = projectData?.weeklyDepartmentProgress ?? [];

  // Get department list for charts
  const departmentsInProject = useMemo(() => {
      if (!project) return [];
      return project.departmentAllocations && project.departmentAllocations.length > 0
        ? project.departmentAllocations.map(da => da.department)
        : project.department;
  }, [project]);


  if (loading) {
      return <div className="p-6">Loading project analytics...</div>;
  }

  // Use error state for displaying error message
  if (error) {
      return (
          <div className="flex flex-col items-center justify-center h-screen p-4 md:p-6">
              <Link href="/" passHref>
                  <Button variant="outline" className="absolute top-4 left-4 md:top-6 md:left-6">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                  </Button>
              </Link>
              <p className="text-xl text-destructive">{error}</p>
          </div>
      );
  }


  if (!project) {
    // This case might be redundant if error state handles 'not found', but keep as fallback
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 md:p-6">
         <Link href="/" passHref>
          <Button variant="outline" className="absolute top-4 left-4 md:top-6 md:left-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <p className="text-xl text-muted-foreground">Project data not available (ID: {projectId}).</p>
      </div>
    );
  }

  // Prepare data for pie charts using DepartmentAllocation
  // Note: Completion data per department is not directly available in allocations.
  // We might need to derive/simulate it or adjust the completion pie chart.
  // For now, manday pie chart uses allocatedMandays. Completion pie chart might show inaccurate data.
  const departmentChartData = project.departmentAllocations?.map(alloc => ({
      department: alloc.department,
      allocatedMandays: alloc.allocatedMandays,
      // Placeholder/Derived Completion - Needs better source data
      // This assumes completion contribution is proportional to manday allocation
      completionContribution: project.allocatedMandays
        ? (alloc.allocatedMandays / project.allocatedMandays) * project.completion
        : 0,
  })) ?? [];


  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
           <h1 className="text-2xl font-semibold text-primary">
               Project Analytics: <span className="font-normal">{project.name}</span>
               <span className="text-sm ml-2 text-muted-foreground">(Data: {dataSource})</span>
            </h1>
            <Link href="/" passHref>
                <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </Link>
        </div>

        <ProjectStatsSummary project={project} />

        <CompletionVsMandayChart weeklyProgress={weeklyProgress} />

        <WeeklyDepartmentProgressChart data={weeklyDepartmentProgress} departments={departmentsInProject} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pass allocatedMandays to Manday Pie Chart */}
          <DepartmentMandayPieChart data={departmentChartData.map(d => ({ department: d.department, mandays: d.allocatedMandays }))} departments={departmentsInProject} />
          {/* Pass derived completion to Completion Pie Chart - acknowledge potential inaccuracy */}
          <DepartmentCompletionPieChart data={departmentChartData.map(d => ({ department: d.department, completion: d.completionContribution, mandays: 0 /* mandays not needed here */ }))} departments={departmentsInProject} />
        </div>

    </div>
  );
};

export default ProjectAnalyticsPage;
