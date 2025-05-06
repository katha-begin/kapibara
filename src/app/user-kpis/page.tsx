
'use client';

import { useState, useMemo, useEffect } from 'react';
import UserKpiFilters from '@/components/user-kpis/user-kpi-filters';
import UserKpiTable from '@/components/user-kpis/user-kpi-table';
import type { UserKpiData } from '@/types/user-kpi';
import { getUserKpis } from '@/lib/data-adapters';

const UserKpiPage = () => {
  const [userKpisData, setUserKpisData] = useState<UserKpiData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      
      try {
        const data = await getUserKpis();
        if (isMounted) {
          setUserKpisData(data);
        }
      } catch (error) {
        console.error("Error loading user KPI data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);


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
