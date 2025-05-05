

'use client';

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import UserKpiFilters from '@/components/user-kpis/user-kpi-filters';
import UserKpiTable from '@/components/user-kpis/user-kpi-table';
import type { UserKpiData } from '@/types/user-kpi'; // Define this type


// Mock Data for User KPIs - Added 'projects' array
const mockUserKpis: UserKpiData[] = [
  { id: 'user1', name: 'Alice Smith', department: 'Engineering', timeliness: 4, utilization: 5, contribution: 4, development: 3, projects: ['Project Alpha', 'Project Gamma'] },
  { id: 'user2', name: 'Bob Johnson', department: 'Engineering', timeliness: 5, utilization: 4, contribution: 5, development: 4, projects: ['Project Alpha', 'Project Zeta'] },
  { id: 'user3', name: 'Charlie Brown', department: 'Marketing', timeliness: 3, utilization: 4, contribution: 3, development: 5, projects: ['Project Beta', 'Project Delta', 'Project Epsilon'] },
  { id: 'user4', name: 'Diana Prince', department: 'Sales', timeliness: 5, utilization: 5, contribution: 5, development: 4, projects: ['Project Delta', 'Project Zeta'] },
  { id: 'user5', name: 'Ethan Hunt', department: 'Marketing', timeliness: 4, utilization: 3, contribution: 4, development: 3, projects: ['Project Epsilon'] },
  { id: 'user6', name: 'Fiona Glenanne', department: 'Engineering', timeliness: 3, utilization: 5, contribution: 4, development: 5, projects: ['Project Gamma'] },
  { id: 'user7', name: 'George Constanza', department: 'Sales', timeliness: 2, utilization: 3, contribution: 2, development: 3, projects: [] }, // User with no projects
  { id: 'user8', name: 'Hannah Montana', department: 'Design', timeliness: 5, utilization: 4, contribution: 5, development: 4, projects: ['Project Gamma'] },
  { id: 'user9', name: 'Ian Malcolm', department: 'Engineering', timeliness: 4, utilization: 4, contribution: 4, development: 4, projects: ['Project Alpha'] },
  { id: 'user10', name: 'Jane Doe', department: 'Design', timeliness: 4, utilization: 5, contribution: 4, development: 3, projects: ['Project Gamma'] },
];


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
    const projects = new Set(mockUserKpis.flatMap(user => user.projects));
    return Array.from(projects);
  }, []);


  // Filter users based on selected department AND project
  const filteredUsers = useMemo(() => {
     let users = mockUserKpis;

     if (selectedDepartment !== 'all') {
       users = users.filter(user => user.department === selectedDepartment);
     }

     if (selectedProject !== 'all') {
       users = users.filter(user => user.projects.includes(selectedProject));
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
