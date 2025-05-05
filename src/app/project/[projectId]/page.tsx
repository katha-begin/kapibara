
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
// Import raw JSON data for staging/fallback
import rawProjectsData from '@/data/projects.json';
import rawDevProjectsData from '@/data/projects_dev.json'; // Import separate dev data

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
      console.log(`Fetching project ${projectId} from inline DEVELOPMENT data source (projects_dev.json)`);
      allProjectsData = processProjectsData(rawDevProjectsData); // Load from dev JSON
  }

  const project = allProjectsData.find(p => p.id === projectId) ?? null;

  // --- Weekly Progress Simulation Logic (remains mostly the same) ---
  // (This logic should ideally be done on the backend if using a real API)
  const weeklyProgress: ProjectWeeklyProgress[] = [];
  const weeklyDepartmentIncrements: WeeklyDepartmentProgressData[] = [];

  if (project && project.startDate && project.endDate && project.mandays !== null && project.completion !== null) {
    let currentDate = new Date(project.startDate);
    let week = 1;
    let accumulatedMandaysOverall = 0;
    let currentCompletion = 0;
    const actualProjectCompletion = project.completion; // Use non-null value

    // Initialize accumulator based on departmentAllocations or project.department
    const departmentsInProject = project.departmentAllocations && project.departmentAllocations.length > 0
        ? project.departmentAllocations.map(da => da.department)
        : project.department;
    let currentDeptMandaysAccumulator: Record<string, number> = {};
    departmentsInProject.forEach(dept => { currentDeptMandaysAccumulator[dept] = 0; });


    while (currentDate <= project.endDate && currentDate <= new Date()) {
        let weeklyMandaysOverall = Math.max(0, Math.random() * (project.allocatedMandays ? project.allocatedMandays / 20 : 10));

        // Cap weekly mandays if approaching total mandays prematurely
        if (project.mandays && accumulatedMandaysOverall + weeklyMandaysOverall > project.mandays && new Date() <= project.endDate && project.completion < 100) {
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

        // Distribute weekly mandays somewhat realistically (proportional to allocation?)
        departmentsInProject.forEach((dept, index) => {
            let deptWeeklyMandaysIncrement = 0;
            const deptAllocation = project.departmentAllocations?.find(da => da.department === dept);
            const deptMandayTarget = deptAllocation?.allocatedMandays ?? (project.allocatedMandays ?? 0) / departmentsInProject.length; // Fallback to equal share of overall allocation

            if (index === departmentsInProject.length - 1) {
                deptWeeklyMandaysIncrement = Math.max(0, weeklyMandaysOverall - distributedWeeklyMandays);
            } else {
                const baseShare = weeklyMandaysOverall / departmentsInProject.length;
                const variation = baseShare * (Math.random() - 0.3); // +/- 30% variation
                deptWeeklyMandaysIncrement = Math.max(0, baseShare + variation);
                deptWeeklyMandaysIncrement = Math.min(deptWeeklyMandaysIncrement, weeklyMandaysOverall - distributedWeeklyMandays);
            }
            const roundedIncrement = Math.round(deptWeeklyMandaysIncrement);
            weeklyDeptIncrementData[dept] = roundedIncrement;
            distributedWeeklyMandays += roundedIncrement;
            currentDeptMandaysAccumulator[dept] = (currentDeptMandaysAccumulator[dept] || 0) + roundedIncrement;
        });

        // Adjust last department if rounding caused mismatch
         if (Math.abs(distributedWeeklyMandays - Math.round(weeklyMandaysOverall)) > 0.5 && departmentsInProject.length > 0) {
             const lastDept = departmentsInProject[departmentsInProject.length - 1];
             const diff = Math.round(weeklyMandaysOverall - distributedWeeklyMandays);
             weeklyDeptIncrementData[lastDept] = Math.max(0, (weeklyDeptIncrementData[lastDept] as number || 0) + diff);
             currentDeptMandaysAccumulator[lastDept] = Math.max(0, (currentDeptMandaysAccumulator[lastDept] || 0) + diff);
         }


        weeklyDepartmentIncrements.push(weeklyDeptIncrementData);

        currentDate.setDate(currentDate.getDate() + 7);
        week++;
        if(week > 104) break;
    }

    const lastWeekOverall = weeklyProgress.length > 0 ? weeklyProgress[weeklyProgress.length - 1] : null;
    const isProjectCompleteOrPastDue = (project.endDate && new Date() > project.endDate) || (project.completion >= 100);

    // --- Ensure final data matches project totals if project ended/is past due ---
    if (isProjectCompleteOrPastDue && lastWeekOverall) {
        lastWeekOverall.completionPercentage = project.completion;
        lastWeekOverall.accumulatedMandays = project.mandays;
        lastWeekOverall.mandayPercentage = calculateMandayPercentage(project.mandays, project.allocatedMandays);

        // Adjust final department increments based on ACTUAL mandays consumed per department (if we had that data)
        // Since we only have *allocated* mandays per department, this simulation part is tricky.
        // For now, we'll adjust the last simulated week to *try* and match the *allocated* amounts
        // This is imperfect as actual consumption might differ significantly.
        if(project.departmentAllocations && weeklyDepartmentIncrements.length > 0) {
             const lastDeptWeek = weeklyDepartmentIncrements[weeklyDepartmentIncrements.length -1];
             let simulatedTotalMandaysPerDeptBeforeLastWeek: Record<string, number> = {};
             departmentsInProject.forEach(dept => { simulatedTotalMandaysPerDeptBeforeLastWeek[dept] = 0; });

             weeklyDepartmentIncrements.slice(0, -1).forEach(weekData => {
                 departmentsInProject.forEach(dept => {
                     simulatedTotalMandaysPerDeptBeforeLastWeek[dept] += (weekData[dept] as number || 0);
                 });
             });

             // Set the last week's increment to make the total match the *allocated* amount (approximation)
             project.departmentAllocations.forEach(alloc => {
                 const requiredLastWeekIncrement = Math.max(0, alloc.allocatedMandays - (simulatedTotalMandaysPerDeptBeforeLastWeek[alloc.department] || 0) );
                 lastDeptWeek[alloc.department] = requiredLastWeekIncrement;
             });
        }

    } else if (lastWeekOverall && lastWeekOverall.completionPercentage > project.completion) {
         lastWeekOverall.completionPercentage = project.completion;
         // Don't force mandays to match allocated if project is still ongoing
    } else if (!lastWeekOverall && project.startDate && project.startDate <= new Date()) {
        // Handle case where project started but loop didn't run (e.g., end date = start date)
        const finalMandayPercentage = calculateMandayPercentage(project.mandays, project.allocatedMandays);
        weeklyProgress.push({
            week: 1,
            weekEnding: project.startDate,
            completionPercentage: project.completion,
            accumulatedMandays: project.mandays,
            mandayPercentage: finalMandayPercentage,
        });

        const singleDeptIncrement: WeeklyDepartmentProgressData = { weekEnding: format(project.startDate, 'MMM d') };
        // Base initial increments on allocated mandays (approximation)
        project.departmentAllocations?.forEach(alloc => {
            // This assumes initial mandays somehow relate to allocation - might need better data
            singleDeptIncrement[alloc.department] = Math.round(alloc.allocatedMandays * (project.mandays / (project.allocatedMandays||1)));
        });
        if (Object.keys(singleDeptIncrement).length > 1) {
            weeklyDepartmentIncrements.push(singleDeptIncrement);
        }
    }


  }

  return { project, weeklyProgress, weeklyDepartmentProgress: weeklyDepartmentIncrements };
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
  const dataSource = process.env.NEXT_PUBLIC_APP_ENV === 'development' ? 'inline' : 'json';

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
