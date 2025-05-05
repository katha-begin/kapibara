
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
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg shadow">
       {/* Project Filter - Now First */}
      <div className="flex-1 space-y-2">
        <Label htmlFor="project-filter">Filter by Project</Label>
        <Select value={selectedProject} onValueChange={onProjectChange}>
          <SelectTrigger id="project-filter" className="w-full">
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
      <div className="flex-1 space-y-2">
        <Label htmlFor="department-filter">Filter by Department</Label>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger id="department-filter" className="w-full">
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
