
import type { Project } from '@/types/project';

/**
 * Calculates the percentage of actual mandays used compared to allocated mandays.
 * @param actualMandays - The actual mandays consumed.
 * @param allocatedMandays - The total allocated mandays.
 * @returns The percentage (can exceed 100) or null if allocation is invalid.
 */
export const calculateMandayPercentage = (
    actualMandays: number | null | undefined,
    allocatedMandays: number | null | undefined
): number | null => {
    const actual = actualMandays ?? 0;
    const allocated = allocatedMandays ?? 0;

    if (allocated <= 0) {
        return null; // Cannot calculate if allocated is zero or less, or missing
    }

    const percentage = Math.round((actual / allocated) * 100);
    return Math.max(0, percentage); // Can exceed 100%
};

/**
 * Determines the Tailwind CSS class for manday progress based on percentage.
 * @param percentage - The manday usage percentage.
 * @returns Tailwind class string for the progress bar indicator color.
 */
export const getMandayProgressColorClass = (percentage: number | null): string => {
  if (percentage === null) return "bg-muted"; // Muted color if N/A
  if (percentage <= 80) return "bg-green-500";
  if (percentage <= 100) return "bg-yellow-500";
  return "bg-destructive"; // Red if over 100%
};

/**
 * Calculates the percentage of the project schedule that has passed.
 * @param startDate - The project start date.
 * @param endDate - The project end date.
 * @returns The schedule completion percentage (0-100) or null if dates are invalid.
 */
export const calculateSchedulePercentage = (
    startDate: Date | null | undefined,
    endDate: Date | null | undefined
): number | null => {
  if (!startDate || !endDate || startDate >= endDate) {
    return null; // Cannot calculate if dates are invalid or missing
  }

  const today = new Date();
  // Set time to 00:00:00 to compare dates only
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  const totalDuration = end.getTime() - start.getTime();
  if (totalDuration <= 0) return 0; // Avoid division by zero or negative duration

  // If today is before the start date, schedule % is 0
  if (today < start) return 0;
  // If today is after the end date, schedule % is 100
  if (today > end) return 100;

  const elapsedTime = today.getTime() - start.getTime();
  const percentage = Math.round((elapsedTime / totalDuration) * 100);

  return Math.min(100, Math.max(0, percentage)); // Clamp between 0 and 100
};


// Function to determine KPI color based on score relative to target (1 is ideal - green, deviation scales to red)
export const getKpiColor = (kpiScore: number, targetKpi: number): string => {
  if (targetKpi === 0) return "text-muted-foreground"; // Avoid division by zero

  const ratio = kpiScore / targetKpi;
  if (ratio === 1) {
    return "text-green-600"; // Perfect score
  } else if (ratio > 0.97 && ratio < 1.03) {
     return "text-lime-600"; // Slightly off (closer to green)
  } else if (ratio > 0.95 && ratio < 1.05) {
    return "text-yellow-600"; // Moderately off (closer to green)
  } else if (ratio > 0.90 && ratio < 1.10) {
    return "text-orange-600"; // Significantly off (closer to red)
  } else {
    return "text-destructive"; // Very far off (bad - red)
  }
};

// Function to determine KPI color for table view (lower ratio is better - green, higher is worse - red)
export const getKpiColorTable = (kpiScore: number, targetKpi: number): string => {
   if (targetKpi === 0) return "text-muted-foreground"; // Avoid division by zero
  const ratio = kpiScore / targetKpi;
  if (ratio === 1) {
    return "text-green-600"; // Perfect score
  } else if (ratio < 1.05 && ratio > 0.95) { // Close to 1
    return "text-lime-600";
  } else if (ratio < 1.15 && ratio > 0.85) { // Moderately off
    return "text-yellow-600";
  } else if (ratio < 1.30 && ratio > 0.70) { // Significantly off
    return "text-orange-600";
  } else { // Very far off
    return "text-destructive";
  }
};
