
import type { Metadata } from "next";
// Removed import: import { SidebarProvider } from "@/components/ui/sidebar";
import Dashboard from "@/components/dashboard/dashboard";

export const metadata: Metadata = {
  title: "BizFlow Dashboard",
  description: "ERP Dashboard Overview",
};

export default function HomePage() {

  // Mock data - replace with actual data fetching later
  const projectsData = [
    { id: 'proj1', name: 'Project Alpha', department: 'Engineering', kpiScore: 85, completion: 70, mandays: 120 },
    { id: 'proj2', name: 'Project Beta', department: 'Marketing', kpiScore: 92, completion: 95, mandays: 80 },
    { id: 'proj3', name: 'Project Gamma', department: 'Engineering', kpiScore: 78, completion: 40, mandays: 200 },
    { id: 'proj4', name: 'Project Delta', department: 'Sales', kpiScore: 88, completion: 80, mandays: 50 },
    { id: 'proj5', name: 'Project Epsilon', department: 'Marketing', kpiScore: 95, completion: 100, mandays: 65 },
  ];

  const departments = Array.from(new Set(projectsData.map(p => p.department)));
  const projectNames = projectsData.map(p => p.name);


  return (
    // Removed SidebarProvider wrapper
    <Dashboard
        projectsData={projectsData}
        departments={departments}
        projectNames={projectNames}
     />
    // Removed SidebarProvider wrapper
  );
}
