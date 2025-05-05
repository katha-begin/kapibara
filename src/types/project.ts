

export interface Project {
  id: string;
  name: string;
  department: string[];
  kpiScore: number;
  completion: number;
  mandays: number; // Actual mandays consumed
  startDate?: Date | null;
  endDate?: Date | null;
  inhousePortion?: number | null;
  outsourcePortion?: number | null;
  allocatedMandays?: number | null; // New: Mandays originally allocated
}

// New type for weekly progress data
export interface ProjectWeeklyProgress {
  week: number;
  weekEnding: Date;
  completionPercentage: number;
  accumulatedMandays: number;
}
