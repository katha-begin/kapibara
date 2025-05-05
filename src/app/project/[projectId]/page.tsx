
import type { FC } from 'react';
import { format } from 'date-fns';
import ProjectStatsSummary from '@/components/project-analytics/project-stats-summary';
import CompletionVsMandayChart from '@/components/project-analytics/completion-vs-manday-chart';
import DepartmentMandayPieChart from '@/components/project-analytics/department-manday-pie-chart'; // Import Manday Pie Chart
import DepartmentCompletionPieChart from '@/components/project-analytics/department-completion-pie-chart'; // Import Completion Pie Chart
import WeeklyDepartmentProgressChart from '@/components/project-analytics/weekly-department-progress-chart'; // Import Stacked Bar Chart
import type { Project, ProjectWeeklyProgress, DepartmentContribution, WeeklyDepartmentProgressData } from '@/types/project'; // Import types
import { calculateMandayPercentage } from '@/lib/project-utils'; // Import utility
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import rawProjectsData from '@/data/projects.json'; // Import raw JSON data

// Process raw data to convert date strings to Date objects
const allProjectsData: Project[] = rawProjectsData.map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    // Ensure departmentContributions is handled correctly
    departmentContributions: project.departmentContributions ?? null,
}));


// Mock data fetching - updated to use data from imported JSON
const fetchProjectData = (projectId: string): { project: Project | null; weeklyProgress: ProjectWeeklyProgress[]; weeklyDepartmentProgress: WeeklyDepartmentProgressData[] } => {
  // Find the project from the processed mock data list
  const project = allProjectsData.find(p => p.id === projectId) ?? null;

  // --- Weekly Progress Simulation Logic (remains mostly the same) ---
  const weeklyProgress: ProjectWeeklyProgress[] = [];
  const weeklyDepartmentIncrements: WeeklyDepartmentProgressData[] = [];

  if (project && project.startDate && project.endDate) {
    let currentDate = new Date(project.startDate);
    let week = 1;
    let accumulatedMandaysOverall = 0;
    let currentCompletion = 0;
    const actualProjectCompletion = project.completion ?? 100;

    let currentDeptMandaysAccumulator: Record<string, number> = {};
    project.department.forEach(dept => { currentDeptMandaysAccumulator[dept] = 0; });

    while (currentDate <= project.endDate && currentDate <= new Date()) {
        const weeklyMandaysOverall = Math.max(0, Math.random() * (project.allocatedMandays ? project.allocatedMandays / 20 : 10));
        accumulatedMandaysOverall += weeklyMandaysOverall;
        const roundedAccumulatedMandays = Math.round(accumulatedMandaysOverall);

        const remainingCompletion = actualProjectCompletion - currentCompletion;
        // Ensure weekly completion doesn't overshoot the final project completion
        let weeklyCompletionIncrement = Math.random() * 7;
        if (currentCompletion + weeklyCompletionIncrement > actualProjectCompletion) {
             weeklyCompletionIncrement = actualProjectCompletion - currentCompletion;
        }
        weeklyCompletionIncrement = Math.max(0, weeklyCompletionIncrement); // Ensure non-negative

        currentCompletion += weeklyCompletionIncrement;
        const roundedCurrentCompletion = Math.round(currentCompletion);


        const mandayPercentage = calculateMandayPercentage(roundedAccumulatedMandays, project.allocatedMandays);

        weeklyProgress.push({
            week: week,
            weekEnding: new Date(currentDate),
            completionPercentage: roundedCurrentCompletion,
            accumulatedMandays: roundedAccumulatedMandays,
            mandayPercentage: mandayPercentage,
        });

        const weeklyDeptIncrementData: WeeklyDepartmentProgressData = { weekEnding: format(currentDate, 'MMM d') };
        let distributedWeeklyMandays = 0;

        project.department.forEach((dept, index) => {
            let deptWeeklyMandaysIncrement = 0;
            if (index === project.department.length - 1) {
                deptWeeklyMandaysIncrement = Math.max(0, weeklyMandaysOverall - distributedWeeklyMandays);
            } else {
                const baseShare = weeklyMandaysOverall / project.department.length;
                const variation = baseShare * (Math.random() - 0.3);
                deptWeeklyMandaysIncrement = Math.max(0, baseShare + variation);
                deptWeeklyMandaysIncrement = Math.min(deptWeeklyMandaysIncrement, weeklyMandaysOverall - distributedWeeklyMandays);
            }
            const roundedIncrement = Math.round(deptWeeklyMandaysIncrement);
            weeklyDeptIncrementData[dept] = roundedIncrement;
            distributedWeeklyMandays += roundedIncrement;
            currentDeptMandaysAccumulator[dept] += roundedIncrement;
        });

        if (Math.abs(distributedWeeklyMandays - weeklyMandaysOverall) > 0.5 && project.department.length > 0) {
             const lastDept = project.department[project.department.length - 1];
             const diff = Math.round(weeklyMandaysOverall - distributedWeeklyMandays);
             weeklyDeptIncrementData[lastDept] = Math.max(0, (weeklyDeptIncrementData[lastDept] as number || 0) + diff);
         }

        weeklyDepartmentIncrements.push(weeklyDeptIncrementData);

        currentDate.setDate(currentDate.getDate() + 7);
        week++;
        if(week > 104) break; // Extended safety break
    }

    // Adjust last recorded overall progress to match actuals if project finished/ongoing
    const lastWeekOverall = weeklyProgress[weeklyProgress.length -1];
    if(lastWeekOverall && project.mandays != null && project.completion != null) {
        // Ensure the last week's mandays matches the total actual mandays
        if (roundedAccumulatedMandays < project.mandays) {
            lastWeekOverall.accumulatedMandays = project.mandays;
            lastWeekOverall.mandayPercentage = calculateMandayPercentage(project.mandays, project.allocatedMandays);
        }
        // Ensure the last week's completion matches the total actual completion
        // Make sure not to exceed the actual project completion
        if (roundedCurrentCompletion < project.completion) {
            lastWeekOverall.completionPercentage = project.completion;
        } else {
            // If simulation somehow overshot, cap it at actual completion
            lastWeekOverall.completionPercentage = Math.min(roundedCurrentCompletion, project.completion);
        }

     } else if (!lastWeekOverall && project.mandays != null && project.completion != null) {
        const finalMandayPercentage = calculateMandayPercentage(project.mandays, project.allocatedMandays);
        weeklyProgress.push({
             week: 1,
             weekEnding: project.startDate || new Date(),
             completionPercentage: project.completion,
             accumulatedMandays: project.mandays,
             mandayPercentage: finalMandayPercentage,
        })
     }
     // If the project has officially ended according to data, ensure the final simulated week matches the end state
     if (project.endDate && new Date() > project.endDate && lastWeekOverall) {
        lastWeekOverall.completionPercentage = project.completion;
        lastWeekOverall.accumulatedMandays = project.mandays;
        lastWeekOverall.mandayPercentage = calculateMandayPercentage(project.mandays, project.allocatedMandays);
     }


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
