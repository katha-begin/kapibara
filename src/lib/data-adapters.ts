import type { Project } from '@/types/project';
import type { UserKpiData } from '@/types/user-kpi';

// Import the processed data files
import rawProcessedProjects from '@/data/processed_projects.json';
import rawProcessedUserKpis from '@/data/processed_userKpis.json';

// Import fallback data
import rawProjectsData from '@/data/projects.json';
import rawDevProjectsData from '@/data/projects_dev.json';
import rawUserKpis from '@/data/userKpis.json';
import rawDevUserKpis from '@/data/userKpis_dev.json';

// Helper function to ensure we have an array
function ensureArray<T>(value: any): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

/**
 * Gets project data from processed_projects.json or falls back to projects.json
 */
export function getProjects(): Project[] {
  try {
    // First try to use processed_projects.json
    const processedProjects = ensureArray(rawProcessedProjects);
    if (processedProjects.length > 0) {
      console.log("Using processed_projects.json with", processedProjects.length, "projects");
      return processedProjects;
    }
    
    // Fall back to static data
    console.warn("No projects found in processed_projects.json, falling back to projects.json");
    return process.env.NEXT_PUBLIC_APP_ENV === 'development' 
      ? ensureArray(rawDevProjectsData)
      : ensureArray(rawProjectsData);
  } catch (error) {
    console.error("Error getting projects:", error);
    // Fall back to static data
    return process.env.NEXT_PUBLIC_APP_ENV === 'development' 
      ? ensureArray(rawDevProjectsData)
      : ensureArray(rawProjectsData);
  }
}

/**
 * Gets user KPI data from processed_userKpis.json or falls back to userKpis.json
 */
export function getUserKpis(): UserKpiData[] {
  try {
    // First try to use processed_userKpis.json
    const processedUserKpis = ensureArray(rawProcessedUserKpis);
    if (processedUserKpis.length > 0) {
      console.log("Using processed_userKpis.json with", processedUserKpis.length, "users");
      return processedUserKpis;
    }
    
    // Fall back to static data
    console.warn("No users found in processed_userKpis.json, falling back to userKpis.json");
    return process.env.NEXT_PUBLIC_APP_ENV === 'development' 
      ? ensureArray(rawDevUserKpis)
      : ensureArray(rawUserKpis);
  } catch (error) {
    console.error("Error getting user KPIs:", error);
    // Fall back to static data
    return process.env.NEXT_PUBLIC_APP_ENV === 'development' 
      ? ensureArray(rawDevUserKpis)
      : ensureArray(rawUserKpis);
  }
}




