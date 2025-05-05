
'use client';

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import UserKpiFilters from '@/components/user-kpis/user-kpi-filters';
import UserKpiTable from '@/components/user-kpis/user-kpi-table';
import type { UserKpiData } from '@/types/user-kpi'; // Define this type
import mockUserKpis from '@/data/userKpis.json'; // Import mock data from JSON


const UserKpiPage: FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all'); // State for selected project

  // Get unique departments from mock data
  const availableDepartments = useMemo(() => {
    const departments = new Set(mockUserKpis.map(user => user.department));
    return Array.from(departments);
  }, []);

  // Get unique project names from mock data
  const availableProjects = useMemo(() => {
    // Ensure projects array exists and is not empty before flatMapping
    const projects = new Set(mockUserKpis.flatMap(user => user.projects ?? []));
    return Array.from(projects);
  }, []);


  // Filter users based on selected department AND project
  // The order of filtering (project then department or vice-versa) does not change the final result.
  // The logic remains correct for filtering based on both criteria.
  const filteredUsers = useMemo(() => {
     let users = mockUserKpis as UserKpiData[]; // Cast to UserKpiData[]

     // Filter by Project
     if (selectedProject !== 'all') {
       // Ensure user.projects exists before calling includes
       users = users.filter(user => user.projects?.includes(selectedProject));
     }

     // Filter by Department
     if (selectedDepartment !== 'all') {
       users = users.filter(user => user.department === selectedDepartment);
     }

     return users;
  }, [selectedDepartment, selectedProject]);

  return (
    <div className="flex flex-col p-4 md:p-6">
        <header className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-primary">User KPIs Dashboard</h1>
        </header>
        <UserKpiFilters
          availableDepartments={availableDepartments}
          availableProjects={availableProjects} // Pass available projects
          selectedDepartment={selectedDepartment}
          selectedProject={selectedProject} // Pass selected project state
          onDepartmentChange={setSelectedDepartment}
          onProjectChange={setSelectedProject} // Pass handler for project change
        />
        {filteredUsers.length > 0 ? (
          <UserKpiTable users={filteredUsers} />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-muted-foreground">No users match the selected filters.</p>
          </div>
        )}
    </div>
  );
};

export default UserKpiPage;
