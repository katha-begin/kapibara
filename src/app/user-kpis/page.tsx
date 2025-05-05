
'use client';

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import UserKpiFilters from '@/components/user-kpis/user-kpi-filters';
import UserKpiTable from '@/components/user-kpis/user-kpi-table';
import type { UserKpiData } from '@/types/user-kpi'; // Define this type

// Mock Data for User KPIs
const mockUserKpis: UserKpiData[] = [
  { id: 'user1', name: 'Alice Smith', department: 'Engineering', timeliness: 4, utilization: 5, contribution: 4, development: 3 },
  { id: 'user2', name: 'Bob Johnson', department: 'Engineering', timeliness: 5, utilization: 4, contribution: 5, development: 4 },
  { id: 'user3', name: 'Charlie Brown', department: 'Marketing', timeliness: 3, utilization: 4, contribution: 3, development: 5 },
  { id: 'user4', name: 'Diana Prince', department: 'Sales', timeliness: 5, utilization: 5, contribution: 5, development: 4 },
  { id: 'user5', name: 'Ethan Hunt', department: 'Marketing', timeliness: 4, utilization: 3, contribution: 4, development: 3 },
  { id: 'user6', name: 'Fiona Glenanne', department: 'Engineering', timeliness: 3, utilization: 5, contribution: 4, development: 5 },
  { id: 'user7', name: 'George Constanza', department: 'Sales', timeliness: 2, utilization: 3, contribution: 2, development: 3 },
  { id: 'user8', name: 'Hannah Montana', department: 'Design', timeliness: 5, utilization: 4, contribution: 5, development: 4 },
  { id: 'user9', name: 'Ian Malcolm', department: 'Engineering', timeliness: 4, utilization: 4, contribution: 4, development: 4 },
  { id: 'user10', name: 'Jane Doe', department: 'Design', timeliness: 4, utilization: 5, contribution: 4, development: 3 },
];


const UserKpiPage: FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Get unique departments from mock data
  const availableDepartments = useMemo(() => {
    const departments = new Set(mockUserKpis.map(user => user.department));
    return Array.from(departments);
  }, []);

  // Filter users based on selected department
  const filteredUsers = useMemo(() => {
    if (selectedDepartment === 'all') {
      return mockUserKpis;
    }
    return mockUserKpis.filter(user => user.department === selectedDepartment);
  }, [selectedDepartment]);

  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b p-4 shadow-sm flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">User KPIs Dashboard</h1>
          {/* Add any header elements like navigation or user info here if needed */}
        </header>
        <ScrollArea className="flex-1 p-4 md:p-6">
          <UserKpiFilters
            availableDepartments={availableDepartments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
          />
          {filteredUsers.length > 0 ? (
            <UserKpiTable users={filteredUsers} />
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">No users match the selected filters.</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default UserKpiPage;
