
export interface UserKpiData {
  id: string;
  name: string;
  department: string;
  timeliness: number; // Scale 1-5
  utilization: number; // Scale 1-5
  contribution: number; // Scale 1-5
  development: number; // Scale 1-5
}

// Define possible sortable columns
export type SortableColumn = keyof Omit<UserKpiData, 'id'>; // Allow sorting by any field except id

// Define sort direction
export type SortDirection = 'asc' | 'desc';
