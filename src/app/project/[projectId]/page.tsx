
import type { FC } from 'react';
import ProjectStatsSummary from '@/components/project-analytics/project-stats-summary';
import CompletionVsMandayChart from '@/components/project-analytics/completion-vs-manday-chart';
import DepartmentMandayPieChart from '@/components/project-analytics/department-manday-pie-chart'; // Import Manday Pie Chart
import DepartmentCompletionPieChart from '@/components/project-analytics/department-completion-pie-chart'; // Import Completion Pie Chart
import type { Project, ProjectWeeklyProgress, DepartmentContribution } from '@/types/project'; // Import types
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Mock data fetching - replace with actual API call
// Simulating fetching a single project and its weekly progress
const fetchProjectData = (projectId: string): { project: Project | null; weeklyProgress: ProjectWeeklyProgress[] } => {
  // Find the project from the mock data list
   const allProjects: Project[] = [
      {
        id: 'proj1', name: 'Project Alpha', department: ['Engineering'], kpiScore: 85, completion: 70, mandays: 120, startDate: new Date(2024, 0, 15), endDate: new Date(2024, 5, 30), inhousePortion: 80, outsourcePortion: 20, allocatedMandays: 150,
        departmentContributions: [
          { department: 'Engineering', mandays: 120, completion: 70 },
        ]
      },
      {
        id: 'proj2', name: 'Project Beta', department: ['Marketing'], kpiScore: 92, completion: 95, mandays: 80, startDate: new Date(2024, 1, 1), endDate: new Date(2024, 4, 15), inhousePortion: 100, outsourcePortion: 0, allocatedMandays: 90,
        departmentContributions: [
          { department: 'Marketing', mandays: 80, completion: 95 },
        ]
      },
      {
        id: 'proj3', name: 'Project Gamma', department: ['Engineering', 'Design'], kpiScore: 78, completion: 40, mandays: 200, startDate: new Date(2024, 0, 5), endDate: new Date(2024, 7, 30), inhousePortion: 50, outsourcePortion: 50, allocatedMandays: 250,
        departmentContributions: [
          { department: 'Engineering', mandays: 130, completion: 25 }, // Example split
          { department: 'Design', mandays: 70, completion: 15 }, // Example split
        ]
      },
      {
        id: 'proj4', name: 'Project Delta', department: ['Sales', 'Marketing'], kpiScore: 88, completion: 80, mandays: 50, startDate: new Date(2024, 2, 10), endDate: new Date(2024, 4, 20), inhousePortion: null, outsourcePortion: null, allocatedMandays: 60,
        departmentContributions: [
          { department: 'Sales', mandays: 20, completion: 30 },
          { department: 'Marketing', mandays: 30, completion: 50 },
        ]
      },
      {
        id: 'proj5', name: 'Project Epsilon', department: ['Marketing'], kpiScore: 95, completion: 100, mandays: 65, startDate: new Date(2023, 11, 1), endDate: new Date(2024, 2, 28), inhousePortion: 90, outsourcePortion: 10, allocatedMandays: 70,
        departmentContributions: [
          { department: 'Marketing', mandays: 65, completion: 100 },
        ]
      },
      {
        id: 'proj6', name: 'Project Zeta', department: ['Engineering', 'Sales'], kpiScore: 80, completion: 60, mandays: 150, startDate: new Date(2024, 3, 1), endDate: new Date(2024, 9, 1), inhousePortion: 70, outsourcePortion: 30, allocatedMandays: 180,
        departmentContributions: [
          { department: 'Engineering', mandays: 100, completion: 40 },
          { department: 'Sales', mandays: 50, completion: 20 },
        ]
      },
   ];

  const project = allProjects.find(p => p.id === projectId) ?? null;

  // Generate some mock weekly progress data if project exists
  const weeklyProgress: ProjectWeeklyProgress[] = [];
  if (project && project.startDate && project.endDate) {
    let currentDate = new Date(project.startDate);
    let week = 1;
    let accumulatedMandays = 0;
    let currentCompletion = 0;

    while (currentDate <= project.endDate && currentDate <= new Date()) {
        // Simulate progress - make this more realistic if needed
        const weeklyMandays = Math.max(0, Math.random() * (project.allocatedMandays ? project.allocatedMandays/20 : 10)); // Random mandays per week
        accumulatedMandays += weeklyMandays;
        const weeklyCompletion = Math.max(0, Math.min(100 - currentCompletion, Math.random() * 7)); // Random completion increase per week
        currentCompletion += weeklyCompletion;

        weeklyProgress.push({
            week: week++,
            weekEnding: new Date(currentDate),
            completionPercentage: Math.round(currentCompletion),
            accumulatedMandays: Math.round(accumulatedMandays),
        });

      currentDate.setDate(currentDate.getDate() + 7); // Move to next week
       if(week > 52) break; // safety break
    }

     // Ensure the final actual completion and mandays are reflected if project is ongoing/finished
     const lastWeek = weeklyProgress[weeklyProgress.length -1];
     if(lastWeek && project.mandays && project.completion) {
        if (lastWeek.accumulatedMandays < project.mandays) {
           lastWeek.accumulatedMandays = project.mandays; // Use actual if higher
        }
        if(lastWeek.completionPercentage < project.completion) {
            lastWeek.completionPercentage = project.completion; // Use actual if higher
        }
     } else if (!lastWeek && project.mandays && project.completion) {
        // Handle case where project finished before first week ending date or no progress yet
        weeklyProgress.push({
             week: 1,
             weekEnding: project.startDate, // or endDate if finished?
             completionPercentage: project.completion,
             accumulatedMandays: project.mandays,
        })
     }

  }


  return { project, weeklyProgress };
};


interface ProjectAnalyticsPageProps {
  params: { projectId: string };
}

const ProjectAnalyticsPage: FC<ProjectAnalyticsPageProps> = ({ params }) => {
  const { projectId } = params;
  const { project, weeklyProgress } = fetchProjectData(projectId); // Fetch data


  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 md:p-6">
         <Link href="/" passHref>
          <Button variant="outline" className="absolute top-4 left-4 md:top-6 md:left-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <p className="text-xl text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  // Use the actual department contribution data if available
  const departmentContributionData: DepartmentContribution[] = project.departmentContributions ?? project.department.map(dept => ({
    department: dept,
    // Fallback logic if departmentContributions is null/undefined (less accurate)
    mandays: (project.mandays ?? 0) / project.department.length,
    completion: (project.completion ?? 0) / project.department.length
  }));


  return (
    <div className="flex flex-col p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
           <h1 className="text-2xl font-semibold text-primary">
               Project Analytics: <span className="font-normal">{project.name}</span>
            </h1>
            <Link href="/" passHref>
                <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </Link>
        </div>

        <ProjectStatsSummary project={project} />

        <CompletionVsMandayChart weeklyProgress={weeklyProgress} />

        {/* Grid for Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DepartmentMandayPieChart data={departmentContributionData} />
          <DepartmentCompletionPieChart data={departmentContributionData} />
        </div>

    </div>
  );
};

export default ProjectAnalyticsPage;
