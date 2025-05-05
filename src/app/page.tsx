
import type { Metadata } from "next";
import Dashboard from "@/components/dashboard/dashboard";
import type { Project } from "@/types/project"; // Import the Project type
import rawProjectsData from "@/data/projects.json"; // Import raw JSON data

export const metadata: Metadata = {
  title: "Kapibara - Project Dashboard", // Specific title for the page
  description: "ERP Dashboard Overview",
};

// Process raw data to convert date strings to Date objects
const projectsData: Project[] = rawProjectsData.map(project => ({
    ...project,
    startDate: project.startDate ? new Date(project.startDate) : null,
    endDate: project.endDate ? new Date(project.endDate) : null,
    // Ensure departmentContributions is handled correctly (might be null/undefined in JSON)
    departmentContributions: project.departmentContributions ?? null,
}));


export default function HomePage() {
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
