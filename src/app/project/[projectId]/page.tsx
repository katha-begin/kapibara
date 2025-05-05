
'use client'; // Required for useEffect, useState, and React.use

import type { FC } from 'react';
import { useState, useEffect, useMemo, use } from 'react'; // Import React.use
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
// Import raw JSON data for staging/fallback
import rawProjectsData from '@/data/projects.json';

// Function to process raw project data (convert date strings to Date objects)
const processProjectsData = (rawData: any[]): Project[] => {
  return rawData.map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    departmentContributions: project.departmentContributions ?? null,
  }));
};

// Define the inline development data separately
const inlineDevProjectsData = processProjectsData([
    {
      "id": "dev-proj1",
      "name": "Dev Project A (Inline)",
      "department": ["Dev Team"],
      "kpiScore": 90,
      "completion": 80,
      "mandays": 50,
      "startDate": "2024-05-01",
      "endDate": "2024-09-30",
      "inhousePortion": 100,
      "outsourcePortion": 0,
      "allocatedMandays": 60,
      "departmentContributions": [
        { "department": "Dev Team", "mandays": 50, "completion": 80 }
      ]
    },
    {
      "id": "dev-proj2",
      "name": "Dev Project B (Inline)",
      "department": ["QA Team", "Dev Team"],
      "kpiScore": 75,
      "completion": 50,
      "mandays": 100,
      "startDate": "2024-06-10",
      "endDate": "2024-11-15",
      "inhousePortion": 70,
      "outsourcePortion": 30,
      "allocatedMandays": 120,
      "departmentContributions": [
        { "department": "QA Team", "mandays": 30, "completion": 20 },
        { "department": "Dev Team", "mandays": 70, "completion": 30 }
      ]
    }
]);

// Combined data fetching logic (simulates API/JSON/Inline)
const fetchProjectData = (
    projectId: string,
    dataSource: 'inline' | 'json' // Add dataSource parameter
): { project: Project | null; weeklyProgress: ProjectWeeklyProgress[]; weeklyDepartmentProgress: WeeklyDepartmentProgressData[] } => {

  let allProjectsData: Project[];
  if (dataSource === 'json') {
      console.log(`Fetching project ${projectId} from JSON data source`);
      allProjectsData = processProjectsData(rawProjectsData);
  } else {
      console.log(`Fetching project ${projectId} from inline DEVELOPMENT data source`);
      allProjectsData = inlineDevProjectsData;
  }

  const project = allProjectsData.find(p => p.id === projectId) ?? null;

  // --- Weekly Progress Simulation Logic (remains mostly the same) ---
  // (This logic should ideally be done on the backend if using a real API)
  const weeklyProgress: ProjectWeeklyProgress[] = [];
  const weeklyDepartmentIncrements: WeeklyDepartmentProgressData[] = [];

  if (project && project.startDate && project.endDate) {
    let currentDate = new Date(project.startDate);
    let week = 1;
    let accumulatedMandaysOverall = 0; // Initialize before the loop
    let currentCompletion = 0;
    const actualProjectCompletion = project.completion ?? 100;

    let currentDeptMandaysAccumulator: Record<string, number> = {};
    project.department.forEach(dept => { currentDeptMandaysAccumulator[dept] = 0; });

    while (currentDate <= project.endDate && currentDate <= new Date()) {
        let weeklyMandaysOverall = Math.max(0, Math.random() * (project.allocatedMandays ? project.allocatedMandays / 20 : 10)); // Use 'let' to allow modification
        // Ensure accumulated mandays doesn't exceed allocated unless project is complete or past due
        if (project.mandays && accumulatedMandaysOverall + weeklyMandaysOverall > project.mandays && new Date() <= project.endDate && project.completion < 100) {
            // Cap weekly mandays if approaching total mandays prematurely
            // This logic might need refinement based on how over-budget should be handled visually
             weeklyMandaysOverall = Math.max(0, project.mandays - accumulatedMandaysOverall); // Cap to remaining mandays
        }
        accumulatedMandaysOverall += weeklyMandaysOverall;
        const roundedAccumulatedMandays = Math.round(accumulatedMandaysOverall);


        const remainingCompletion = actualProjectCompletion - currentCompletion;
        let weeklyCompletionIncrement = Math.random() * 7; // Simulate some weekly progress

        // Ensure weekly completion increment doesn't overshoot the final actual completion
        if (currentCompletion + weeklyCompletionIncrement > actualProjectCompletion) {
             weeklyCompletionIncrement = Math.max(0, actualProjectCompletion - currentCompletion);
        }
        weeklyCompletionIncrement = Math.max(0, weeklyCompletionIncrement); // Ensure non-negative

        currentCompletion += weeklyCompletionIncrement;
        // Ensure currentCompletion does not exceed actualProjectCompletion due to floating point issues
        currentCompletion = Math.min(currentCompletion, actualProjectCompletion);
        const roundedCurrentCompletion = Math.round(currentCompletion);

        const mandayPercentage = calculateMandayPercentage(roundedAccumulatedMandays, project.allocatedMandays);

        weeklyProgress.push({
            week: week,
            weekEnding: new Date(currentDate),
            completionPercentage: roundedCurrentCompletion,
            accumulatedMandays: roundedAccumulatedMandays,
            mandayPercentage: mandayPercentage,
        });

        // Simulate weekly department manday increments
        const weeklyDeptIncrementData: WeeklyDepartmentProgressData = { weekEnding: format(currentDate, 'MMM d') };
        let distributedWeeklyMandays = 0;

        // Distribute weekly mandays somewhat realistically (proportional to contribution?)
        project.department.forEach((dept, index) => {
            let deptWeeklyMandaysIncrement = 0;
            // Find the contribution data for this department
            const deptContribution = project.departmentContributions?.find(dc => dc.department === dept);
            const deptMandayTarget = deptContribution?.mandays ?? (project.mandays ?? 0) / project.department.length; // Fallback to equal share

            if (index === project.department.length - 1) {
                // Assign remaining to the last department
                deptWeeklyMandaysIncrement = Math.max(0, weeklyMandaysOverall - distributedWeeklyMandays);
            } else {
                // Simple random distribution for now, could be weighted by target mandays
                const baseShare = weeklyMandaysOverall / project.department.length;
                const variation = baseShare * (Math.random() - 0.3); // +/- 30% variation
                deptWeeklyMandaysIncrement = Math.max(0, baseShare + variation);
                 // Prevent distributing more than the total weekly mandays
                deptWeeklyMandaysIncrement = Math.min(deptWeeklyMandaysIncrement, weeklyMandaysOverall - distributedWeeklyMandays);
            }
            const roundedIncrement = Math.round(deptWeeklyMandaysIncrement);
            weeklyDeptIncrementData[dept] = roundedIncrement;
            distributedWeeklyMandays += roundedIncrement;
            currentDeptMandaysAccumulator[dept] += roundedIncrement;
        });

        // Adjust last department if rounding caused mismatch
         if (Math.abs(distributedWeeklyMandays - Math.round(weeklyMandaysOverall)) > 0.5 && project.department.length > 0) {
             const lastDept = project.department[project.department.length - 1];
             const diff = Math.round(weeklyMandaysOverall - distributedWeeklyMandays);
             weeklyDeptIncrementData[lastDept] = Math.max(0, (weeklyDeptIncrementData[lastDept] as number || 0) + diff);
             currentDeptMandaysAccumulator[lastDept] = Math.max(0, currentDeptMandaysAccumulator[lastDept] + diff);
         }


        weeklyDepartmentIncrements.push(weeklyDeptIncrementData);

        // Move to the next week
        currentDate.setDate(currentDate.getDate() + 7);
        week++;
        if(week > 104) break; // Safety break for long projects
    }

     // --- Ensure final data matches project totals if project ended or is past due ---
    const lastWeekOverall = weeklyProgress[weeklyProgress.length - 1];
    const isProjectCompleteOrPastDue = (project.endDate && new Date() > project.endDate) || (project.completion >= 100);

    if (isProjectCompleteOrPastDue && lastWeekOverall) {
        // Set final week's values to the actual project totals
        lastWeekOverall.completionPercentage = project.completion;
        lastWeekOverall.accumulatedMandays = project.mandays ?? roundedAccumulatedMandays; // Use actual if available
        lastWeekOverall.mandayPercentage = calculateMandayPercentage(lastWeekOverall.accumulatedMandays, project.allocatedMandays);

        // Adjust final department increments to match actual contributions if available
        if(project.departmentContributions && weeklyDepartmentIncrements.length > 0) {
            const lastDeptWeek = weeklyDepartmentIncrements[weeklyDepartmentIncrements.length -1];
             // Calculate total simulated mandays per department up to the *second to last* week
             let simulatedTotalMandaysPerDeptBeforeLastWeek: Record<string, number> = {};
             project.department.forEach(dept => { simulatedTotalMandaysPerDeptBeforeLastWeek[dept] = 0; });
             weeklyDepartmentIncrements.slice(0, -1).forEach(weekData => {
                 project.department.forEach(dept => {
                     simulatedTotalMandaysPerDeptBeforeLastWeek[dept] += (weekData[dept] as number || 0);
                 });
             });

             // Set the last week's increment to make the total match the actual contribution
             project.departmentContributions.forEach(contrib => {
                 const requiredLastWeekIncrement = Math.max(0, contrib.mandays - simulatedTotalMandaysPerDeptBeforeLastWeek[contrib.department]);
                 lastDeptWeek[contrib.department] = requiredLastWeekIncrement;
             });
        }

    } else if (lastWeekOverall && lastWeekOverall.completionPercentage > project.completion) {
         // If simulation overshot completion before end date, cap it
         lastWeekOverall.completionPercentage = project.completion;
     } else if (!lastWeekOverall && project.mandays != null && project.completion != null) {
        // Handle cases where the project hasn't even started (or has zero duration in data)
        // Add a single entry representing the current state if start date is in the past or today
        if (project.startDate && project.startDate <= new Date()) {
            const finalMandayPercentage = calculateMandayPercentage(project.mandays, project.allocatedMandays);
            weeklyProgress.push({
                week: 1,
                weekEnding: project.startDate || new Date(), // Or today?
                completionPercentage: project.completion,
                accumulatedMandays: project.mandays,
                mandayPercentage: finalMandayPercentage,
            });

            // Add a single department increment entry based on contributions
            const singleDeptIncrement: WeeklyDepartmentProgressData = { weekEnding: format(project.startDate || new Date(), 'MMM d') };
            project.departmentContributions?.forEach(contrib => {
                singleDeptIncrement[contrib.department] = contrib.mandays;
            });
            if (Object.keys(singleDeptIncrement).length > 1) { // Check if contributions exist
                 weeklyDepartmentIncrements.push(singleDeptIncrement);
             }
        }
     }


  }

  return { project, weeklyProgress, weeklyDepartmentProgress: weeklyDepartmentIncrements };
};


interface ProjectAnalyticsPageProps {
  // params is now expected to be a Promise in Client Components under Suspense
  params: { projectId: string }; // No longer a promise after applying React.use
}

const ProjectAnalyticsPage: FC<ProjectAnalyticsPageProps> = ({ params }) => {
  // Unwrap the params Promise using React.use() - Removed as it's no longer needed after fixing the type
  // const resolvedParams = use(params);
  const { projectId } = params; // Access projectId directly

  const [projectData, setProjectData] = useState<{ project: Project | null; weeklyProgress: ProjectWeeklyProgress[]; weeklyDepartmentProgress: WeeklyDepartmentProgressData[] } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Determine data source based on environment (simplified)
  const dataSource = process.env.NEXT_PUBLIC_APP_ENV === 'development' ? 'inline' : 'json';

  useEffect(() => {
    setLoading(true);
    // Fetch data based on determined source
    const data = fetchProjectData(projectId, dataSource);
    setProjectData(data);
    setLoading(false);
  }, [projectId, dataSource]); // Re-run if projectId or dataSource changes

  const project = projectData?.project;
  const weeklyProgress = projectData?.weeklyProgress ?? [];
  const weeklyDepartmentProgress = projectData?.weeklyDepartmentProgress ?? [];

  if (loading) {
      return <div className="p-6">Loading project analytics...</div>;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 md:p-6">
         <Link href="/" passHref>
          <Button variant="outline" className="absolute top-4 left-4 md:top-6 md:left-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
        <p className="text-xl text-muted-foreground">Project not found (ID: {projectId}) in {dataSource} data.</p>
      </div>
    );
  }

  // Use the actual department contribution data if available for pie charts
  const departmentContributionData: DepartmentContribution[] = project.departmentContributions ?? project.department.map(dept => ({
    department: dept,
    mandays: (project.mandays ?? 0) / project.department.length, // Fallback: Equal distribution
    completion: (project.completion ?? 0) // Fallback: No specific completion breakdown available
    // Note: Completion breakdown per department might not be accurate without specific data.
    //       For the pie chart, we might need to adjust the logic if 'departmentContributions.completion' isn't reliable.
    //       Let's assume `departmentContributions.completion` represents the % of *overall* completion attributed to that dept.
    //       Or perhaps it's the department's *internal* completion % on their tasks?
    //       Assuming the `completion` in DepartmentContribution is the % value this dept contributed to the *overall* project completion.
  }));


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

        <WeeklyDepartmentProgressChart data={weeklyDepartmentProgress} departments={project.department} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DepartmentMandayPieChart data={departmentContributionData} departments={project.department} />
          <DepartmentCompletionPieChart data={departmentContributionData} departments={project.department} />
        </div>

    </div>
  );
};

export default ProjectAnalyticsPage;
