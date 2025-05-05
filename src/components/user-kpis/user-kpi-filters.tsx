
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
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
}

const UserKpiFilters: FC<UserKpiFiltersProps> = ({
  availableDepartments,
  selectedDepartment,
  onDepartmentChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-card rounded-lg shadow">
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
