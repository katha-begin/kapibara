
import type { FC } from 'react';
import { format } from 'date-fns';
import ProjectStatsSummary from '@/components/project-analytics/project-stats-summary';
import CompletionVsMandayChart from '@/components/project-analytics/completion-vs-manday-chart';
import DepartmentMandayPieChart from '@/components/project-analytics/department-manday-pie-chart'; // Import Manday Pie Chart
import DepartmentCompletionPieChart from '@/components/project-analytics/department-completion-pie-chart'; // Import Completion Pie Chart
import WeeklyDepartmentProgressChart from '@/components/project-analytics/weekly-department-progress-chart'; // Import Stacked Bar Chart
import type { Project, ProjectWeeklyProgress, DepartmentContribution, WeeklyDepartmentProgressData } from '@/types/project'; // Import types
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Mock data fetching - replace with actual API call
// Simulating fetching a single project and its weekly progress
// Updated to generate weekly increments for the department progress chart
const fetchProjectData = (projectId: string): { project: Project | null; weeklyProgress: ProjectWeeklyProgress[]; weeklyDepartmentProgress: WeeklyDepartmentProgressData[] } => {
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

  // Generate mock data
  const weeklyProgress: ProjectWeeklyProgress[] = [];
  const weeklyDepartmentIncrements: WeeklyDepartmentProgressData[] = []; // Stores weekly increments

  if (project && project.startDate && project.endDate) {
    let currentDate = new Date(project.startDate);
    let week = 1;
    let accumulatedMandaysOverall = 0;
    let currentCompletion = 0;
    const actualProjectCompletion = project.completion ?? 100; // Use actual completion or default to 100

    // Keep track of accumulated mandays per department for calculation purposes
    let currentDeptMandaysAccumulator: Record<string, number> = {};
    project.department.forEach(dept => { currentDeptMandaysAccumulator[dept] = 0; });

    while (currentDate <= project.endDate && currentDate <= new Date()) {
        // Simulate overall progress for the week
        const weeklyMandaysOverall = Math.max(0, Math.random() * (project.allocatedMandays ? project.allocatedMandays / 20 : 10)); // Total mandays this week
        accumulatedMandaysOverall += weeklyMandaysOverall;
        // Ensure weekly completion doesn't push the total beyond the actual project completion
        const remainingCompletion = actualProjectCompletion - currentCompletion;
        const weeklyCompletionIncrement = Math.max(0, Math.min(remainingCompletion, Math.random() * 7));
        currentCompletion += weeklyCompletionIncrement;

        // Store overall weekly progress (accumulated)
        weeklyProgress.push({
            week: week,
            weekEnding: new Date(currentDate),
            // Cap the stored completion percentage at the actual project completion
            completionPercentage: Math.min(Math.round(currentCompletion), actualProjectCompletion),
            accumulatedMandays: Math.round(accumulatedMandaysOverall),
        });

        // Simulate and store weekly department INCREMENTS for stacked bar chart
        const weeklyDeptIncrementData: WeeklyDepartmentProgressData = { weekEnding: format(currentDate, 'MMM d') };
        let distributedWeeklyMandays = 0;

        project.department.forEach((dept, index) => {
            let deptWeeklyMandaysIncrement = 0;
            // Distribute the weeklyMandaysOverall among departments
            if (index === project.department.length - 1) {
                // Assign remaining to the last department
                deptWeeklyMandaysIncrement = Math.max(0, weeklyMandaysOverall - distributedWeeklyMandays);
            } else {
                 // Example: semi-random distribution based on index/total departments
                const baseShare = weeklyMandaysOverall / project.department.length;
                const variation = baseShare * (Math.random() - 0.3); // Allow some variation
                deptWeeklyMandaysIncrement = Math.max(0, baseShare + variation);
                 // Ensure we don't overshoot in intermediate steps
                 deptWeeklyMandaysIncrement = Math.min(deptWeeklyMandaysIncrement, weeklyMandaysOverall - distributedWeeklyMandays);
            }

            // Round the increment for this week
            const roundedIncrement = Math.round(deptWeeklyMandaysIncrement);
            weeklyDeptIncrementData[dept] = roundedIncrement;
            distributedWeeklyMandays += roundedIncrement; // Use rounded value for tracking distribution

            // Update the overall accumulator for this department (optional, if needed elsewhere)
             currentDeptMandaysAccumulator[dept] += roundedIncrement;
        });

         // Final check/adjustment due to rounding potentially making sum != weeklyMandaysOverall
         if (Math.abs(distributedWeeklyMandays - weeklyMandaysOverall) > 0.5 && project.department.length > 0) {
             const lastDept = project.department[project.department.length - 1];
             const diff = Math.round(weeklyMandaysOverall - distributedWeeklyMandays);
             weeklyDeptIncrementData[lastDept] = Math.max(0, (weeklyDeptIncrementData[lastDept] as number || 0) + diff);
             // Optionally adjust accumulator too
             // currentDeptMandaysAccumulator[lastDept] += diff;
         }


        weeklyDepartmentIncrements.push(weeklyDeptIncrementData);

        currentDate.setDate(currentDate.getDate() + 7); // Move to next week
        week++;
        if(week > 52) break; // Safety break
    }

    // Adjust last recorded overall progress to match actuals if project finished/ongoing
    const lastWeekOverall = weeklyProgress[weeklyProgress.length -1];
    if(lastWeekOverall && project.mandays != null && project.completion != null) {
        // Ensure the last week's mandays matches the total actual mandays
        if (lastWeekOverall.accumulatedMandays !== project.mandays) {
           lastWeekOverall.accumulatedMandays = project.mandays;
        }
        // Ensure the last week's completion matches the total actual completion
        if(lastWeekOverall.completionPercentage !== project.completion) {
            lastWeekOverall.completionPercentage = project.completion;
        }
     } else if (!lastWeekOverall && project.mandays != null && project.completion != null) {
        // Handle case where project finished before first week or no progress yet
        weeklyProgress.push({
             week: 1,
             weekEnding: project.startDate || new Date(), // Use start date or fallback
             completionPercentage: project.completion,
             accumulatedMandays: project.mandays,
        })
     }

    // Note: weeklyDepartmentIncrements already represents weekly additions,
    // so no final adjustment needed unless you want the *last* week's increment
    // to force the total sum to match project.mandays exactly.
    // This might make the last bar look unusually large/small.
    // Keeping it as simulated weekly increments.

  }


  return { project, weeklyProgress, weeklyDepartmentProgress: weeklyDepartmentIncrements };
};


interface ProjectAnalyticsPageProps {
  params: { projectId: string };
}

const ProjectAnalyticsPage: FC<ProjectAnalyticsPageProps> = ({ params }) => {
  const { projectId } = params;
  // Fetch all data including weeklyDepartmentProgress (which now contains increments)
  const { project, weeklyProgress, weeklyDepartmentProgress } = fetchProjectData(projectId);


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

  // Use the actual department contribution data if available for pie charts
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

        {/* Area Chart for Overall Completion vs Accumulated Mandays */}
        <CompletionVsMandayChart weeklyProgress={weeklyProgress} />

         {/* Stacked Bar Chart for Weekly Department Manday Increments */}
        <WeeklyDepartmentProgressChart data={weeklyDepartmentProgress} departments={project.department} />


        {/* Grid for Pie Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DepartmentMandayPieChart data={departmentContributionData} departments={project.department} />
          <DepartmentCompletionPieChart data={departmentContributionData} departments={project.department} />
        </div>

    </div>
  );
};

export default ProjectAnalyticsPage;
