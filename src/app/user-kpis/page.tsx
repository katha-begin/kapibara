
'use client'; // Keep as client component

import type { FC } from 'react';
import { useState, useMemo, useEffect } from 'react';
import UserKpiFilters from '@/components/user-kpis/user-kpi-filters';
import UserKpiTable from '@/components/user-kpis/user-kpi-table';
import type { UserKpiData } from '@/types/user-kpi'; // Define this type
// Import mock data from JSON for staging/fallback
import rawUserKpis from '@/data/userKpis.json';


const UserKpiPage: FC = () => {
  const [userKpisData, setUserKpisData] = useState<UserKpiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all'); // State for selected project

  // Determine data source based on environment (simplified)
  const dataSource = process.env.NEXT_PUBLIC_APP_ENV === 'development' ? 'inline' : 'json';

  useEffect(() => {
    setLoading(true);
    let data: UserKpiData[];
    if (dataSource === 'json') {
      // Simulate fetching from JSON (could be API call)
       console.log("Using JSON data source for User KPIs");
      // Assume rawUserKpis is already in the correct format or process if needed
      data = rawUserKpis as UserKpiData[];
    } else {
      // Use different inline data for 'development' stage display
      console.log("Using inline DEVELOPMENT data source for User KPIs");
      data = [
        // Different inline data for DEV stage
        {
          "id": "dev-user1",
          "name": "Dev User One (Inline)",
          "department": "Dev Team",
          "timeliness": 5,
          "utilization": 5,
          "contribution": 5,
          "development": 5,
          "projects": ["Dev Project A (Inline)", "Dev Project B (Inline)"]
        },
        {
          "id": "dev-user2",
          "name": "Dev User Two (Inline)",
          "department": "QA Team",
          "timeliness": 4,
          "utilization": 4,
          "contribution": 3,
          "development": 4,
          "projects": ["Dev Project B (Inline)"]
        }
      ];
    }
    setUserKpisData(data);
    setLoading(false);
  }, [dataSource]);


  // Get unique departments and projects from the currently loaded data
  const availableDepartments = useMemo(() => {
    const departments = new Set(userKpisData.map(user => user.department));
    return Array.from(departments);
  }, [userKpisData]);

  const availableProjects = useMemo(() => {
    const projects = new Set(userKpisData.flatMap(user => user.projects ?? []));
    return Array.from(projects);
  }, [userKpisData]);


  // Filter users based on selected department AND project
  const filteredUsers = useMemo(() => {
     let users = userKpisData;

     // Filter by Project
     if (selectedProject !== 'all') {
       users = users.filter(user => user.projects?.includes(selectedProject));
     }

     // Filter by Department
     if (selectedDepartment !== 'all') {
       users = users.filter(user => user.department === selectedDepartment);
     }

     return users;
  }, [userKpisData, selectedDepartment, selectedProject]);

   if (loading) {
    return <div className="p-6">Loading user KPI data...</div>; // Basic loading state
  }


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
