

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

interface UserKpiFiltersProps {
  availableDepartments: string[];
  availableProjects: string[]; // Add available projects
  selectedDepartment: string;
  selectedProject: string; // Add selected project state
  onDepartmentChange: (value: string) => void;
  onProjectChange: (value: string) => void; // Add handler for project change
}

const UserKpiFilters: FC<UserKpiFiltersProps> = ({
  availableDepartments,
  availableProjects, // Destructure projects
  selectedDepartment,
  selectedProject, // Destructure selected project
  onDepartmentChange,
  onProjectChange, // Destructure project handler
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg shadow">
       {/* Project Filter - Now First */}
      <div className="flex-1 space-y-2">
        <Label htmlFor="project-filter">Filter by Project</Label>
        <Select value={selectedProject} onValueChange={onProjectChange}>
          <SelectTrigger id="project-filter" className="w-full sm:w-64">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {availableProjects.map((proj) => (
              <SelectItem key={proj} value={proj}>
                {proj}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Department Filter - Now Second */}
      <div className="flex-1 space-y-2">
        <Label htmlFor="department-filter">Filter by Department</Label>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger id="department-filter" className="w-full sm:w-64">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {availableDepartments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* Add more filters here if needed in the future */}
    </div>
  );
};

export default UserKpiFilters;
