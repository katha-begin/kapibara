
import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "BizFlow - Project Dashboard", // Specific title for the page
  description: "ERP Dashboard Overview",
};

export default function HomePage() {

  // Mock data - replace with actual data fetching later
  // Updated department to be an array of strings
  const projectsData = [
    { id: 'proj1', name: 'Project Alpha', department: ['Engineering'], kpiScore: 85, completion: 70, mandays: 120 },
    { id: 'proj2', name: 'Project Beta', department: ['Marketing'], kpiScore: 92, completion: 95, mandays: 80 },
    { id: 'proj3', name: 'Project Gamma', department: ['Engineering', 'Design'], kpiScore: 78, completion: 40, mandays: 200 },
    { id: 'proj4', name: 'Project Delta', department: ['Sales', 'Marketing'], kpiScore: 88, completion: 80, mandays: 50 },
    { id: 'proj5', name: 'Project Epsilon', department: ['Marketing'], kpiScore: 95, completion: 100, mandays: 65 },
    { id: 'proj6', name: 'Project Zeta', department: ['Engineering', 'Sales'], kpiScore: 80, completion: 60, mandays: 150 },
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
