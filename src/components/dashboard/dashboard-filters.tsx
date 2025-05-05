
"use client";

import type { FC } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface DashboardFiltersProps {
  availableDepartments: string[]; // Renamed from departments
  projectNames: string[];
  selectedDepartment: string;
  selectedProject: string;
  onDepartmentChange: (value: string) => void;
  onProjectChange: (value: string) => void;
}

const DashboardFilters: FC<DashboardFiltersProps> = ({
  availableDepartments, // Use availableDepartments
  projectNames,
  selectedDepartment,
  selectedProject,
  onDepartmentChange,
  onProjectChange,
}) => {
  return (
    // Adjusted styles: lighter background, smaller padding, remove shadow
    <div className="flex flex-col sm:flex-row gap-4 mb-4 md:mb-6 p-3 bg-card rounded-lg border">
       {/* Project Filter - Now First */}
      <div className="flex-1 space-y-1"> {/* Reduced space */}
        <Label htmlFor="project-filter" className="text-xs font-medium text-muted-foreground">Project</Label> {/* Smaller label */}
        <Select value={selectedProject} onValueChange={onProjectChange}>
          {/* Adjusted trigger style */}
          <SelectTrigger id="project-filter" className="w-full h-9 text-sm">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projectNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
       {/* Department Filter - Now Second */}
      <div className="flex-1 space-y-1"> {/* Reduced space */}
        <Label htmlFor="department-filter" className="text-xs font-medium text-muted-foreground">Department</Label> {/* Smaller label */}
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          {/* Adjusted trigger style */}
          <SelectTrigger id="department-filter" className="w-full h-9 text-sm">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {/* Use availableDepartments for options */}
            {availableDepartments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default DashboardFilters;
