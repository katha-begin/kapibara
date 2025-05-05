
export interface Project {
  id: string;
  name: string;
  department: string[];
  kpiScore: number; // Keep existing fields if needed elsewhere
  completion: number; // Keep existing fields if needed elsewhere
  mandays: number;
  startDate?: Date | null; // Optional start date
  endDate?: Date | null; // Optional end date
  inhousePortion?: number | null; // Optional percentage (0-100)
  outsourcePortion?: number | null; // Optional percentage (0-100)
}
