

// New type for department-specific contribution
export interface DepartmentContribution {
  department: string;
  mandays: number;
  completion: number; // Percentage completion contribution of this department
}


export interface Project {
  id: string;
  name: string;
  department: string[]; // List of involved departments
  kpiScore: number;
  completion: number; // Overall project completion percentage
  mandays: number; // Overall actual mandays consumed
  startDate?: Date | null;
  endDate?: Date | null;
  inhousePortion?: number | null;
  outsourcePortion?: number | null;
  allocatedMandays?: number | null; // New: Mandays originally allocated
  departmentContributions?: DepartmentContribution[] | null; // New: Department-specific contributions
}

// Type for overall weekly progress data
export interface ProjectWeeklyProgress {
  week: number;
  weekEnding: Date;
  completionPercentage: number; // Overall weekly completion
  accumulatedMandays: number; // Overall weekly mandays
}

// New type for weekly progress broken down by department
// Used for the stacked bar chart
export interface WeeklyDepartmentProgressData {
  weekEnding: string; // Formatted date string for X-axis
  [department: string]: number | string; // Dynamic keys for each department's mandays (or completion) + weekEnding
}
