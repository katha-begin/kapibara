

export interface UserKpiData {
  id: string;
  name: string;
  department: string;
  timeliness: number; // Scale 1-5
  utilization: number; // Scale 1-5
  contribution: number; // Scale 1-5
  development: number; // Scale 1-5
  projects: string[]; // Array of project names or IDs the user is involved in
}

// Define possible sortable columns
// Added 'projectCount' as a virtual sortable column, handle logic in table component
export type SortableColumn = keyof Omit<UserKpiData, 'id' | 'projects'> | 'projectCount';

// Define sort direction
export type SortDirection = 'asc' | 'desc';

