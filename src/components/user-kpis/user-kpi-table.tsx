

"use client";

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import type { UserKpiData, SortableColumn, SortDirection } from '@/types/user-kpi';

interface UserKpiTableProps {
  users: UserKpiData[];
}

const UserKpiTable: FC<UserKpiTableProps> = ({ users }) => {
  const [sortColumn, setSortColumn] = useState<SortableColumn>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (column: SortableColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      // Handle sorting by project count specifically
      if (sortColumn === 'projectCount') {
        aValue = a.projects.length;
        bValue = b.projects.length;
      } else {
        // Type assertion needed because 'projectCount' isn't directly on UserKpiData
        aValue = a[sortColumn as keyof Omit<UserKpiData, 'id' | 'projects'>];
        bValue = b[sortColumn as keyof Omit<UserKpiData, 'id' | 'projects'>];
      }


      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [users, sortColumn, sortDirection]);

  const renderSortIcon = (column: SortableColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sortDirection === 'asc' ?
      <ArrowUpDown className="ml-2 h-4 w-4" /> :
      <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />; // Simple visual toggle
  };

  // Add 'Project Count' to columns
  const columns: { key: SortableColumn; label: string; isNumeric?: boolean }[] = [
    { key: 'name', label: 'User Name' },
    { key: 'department', label: 'Department' },
    { key: 'projectCount', label: 'Project Count', isNumeric: true }, // Added Project Count column
    { key: 'timeliness', label: 'Timeliness', isNumeric: true },
    { key: 'utilization', label: 'Utilization', isNumeric: true },
    { key: 'contribution', label: 'Contribution', isNumeric: true },
    { key: 'development', label: 'Development', isNumeric: true },
  ];

  return (
    <Card className="shadow-md">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.isNumeric ? 'text-right' : ''}><Button variant="ghost" onClick={() => handleSort(col.key)} className="px-0 hover:bg-transparent">{col.label}{renderSortIcon(col.key)}</Button></TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedUsers.map((user) => (
            <TableRow key={user.id}><TableCell className="font-medium text-primary">{user.name}</TableCell><TableCell className="text-muted-foreground">{user.department}</TableCell><TableCell className="text-right">{user.projects.length}</TableCell><TableCell className="text-right">{user.timeliness}</TableCell><TableCell className="text-right">{user.utilization}</TableCell><TableCell className="text-right">{user.contribution}</TableCell><TableCell className="text-right">{user.development}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default UserKpiTable;
