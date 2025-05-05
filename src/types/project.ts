

// New type for department-specific allocated mandays
export interface DepartmentAllocation {
  department: string;
  allocatedMandays: number;
}


export interface Project {
  id: string;
  name: string;
  department: string[]; // List of involved departments (derived or could be managed separately)
  kpiScore: number; // This might be calculated or come from processed data later
  completion: number; // Overall project completion percentage (likely from processed data)
  mandays: number | null; // Overall actual mandays consumed (read-only, from processed data)
  startDate?: Date | null;
  endDate?: Date | null;
  inhousePortion?: number | null;
  outsourcePortion?: number | null;
  allocatedMandays?: number | null; // Overall allocated mandays (potentially sum of department allocations)
  // Renamed departmentContributions to departmentAllocations
  departmentAllocations?: DepartmentAllocation[] | null; // Department-specific *allocated* mandays
}

// Type for overall weekly progress data (remains the same)
export interface ProjectWeeklyProgress {
  week: number;
  weekEnding: Date;
  completionPercentage: number; // Overall weekly completion
  accumulatedMandays: number; // Overall weekly mandays (absolute)
  mandayPercentage: number | null; // Overall weekly manday usage percentage
}

// Type for weekly progress broken down by department (remains the same)
// Used for the stacked bar chart
export interface WeeklyDepartmentProgressData {
  weekEnding: string; // Formatted date string for X-axis
  [department: string]: number | string; // Dynamic keys for each department's mandays (or completion) + weekEnding
}
