

import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/dashboard";
import type { Project } from "@/types/project"; // Import the Project type

export const metadata: Metadata = {
  title: "BizFlow - Project Dashboard", // Specific title for the page
  description: "ERP Dashboard Overview",
};

export default function HomePage() {

  // Mock data - replace with actual data fetching later
  // Update data structure to match the Project type including departmentContributions
  const projectsData: Project[] = [
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

  // Get unique department names across all projects
  const departments = Array.from(new Set(projectsData.flatMap(p => p.department)));
  const projectNames = projectsData.map(p => p.name);


  return (
    <Dashboard
        projectsData={projectsData}
        departments={departments} // Pass all unique departments initially
        projectNames={projectNames}
     />
  );
}
