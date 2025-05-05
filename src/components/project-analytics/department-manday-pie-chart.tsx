
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import type { DepartmentContribution } from '@/types/project'; // Import type

interface DepartmentMandayPieChartProps {
  data: DepartmentContribution[];
}

// Define chart configuration for colors and labels
const chartConfig = {
  mandays: {
    label: "Mandays",
  },
  // Example: Add specific colors per department if needed, otherwise uses default palette
  // Engineering: { label: "Engineering", color: "hsl(var(--chart-1))" },
  // Design: { label: "Design", color: "hsl(var(--chart-2))" },
  // Marketing: { label: "Marketing", color: "hsl(var(--chart-3))" },
  // Sales: { label: "Sales", color: "hsl(var(--chart-4))" },
} satisfies Record<string, { label?: string; color?: string }>;


const DepartmentMandayPieChart: FC<DepartmentMandayPieChartProps> = ({ data }) => {

  // Check if data is valid and has entries
  const hasData = data && data.length > 0 && data.some(d => d.mandays > 0);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Department Manday Contribution</CardTitle>
        <CardDescription>Percentage of total mandays per department.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-[350px]">
        {hasData ? (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                   cursor={false}
                   content={
                      <ChartTooltipContent
                        hideLabel // Hide the default label line
                        formatter={(value, name) => `${value.toLocaleString()} mandays`} // Format tooltip value
                      />
                    }
                />
                <Pie
                  data={data}
                  dataKey="mandays"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40} // Make it a donut chart
                  labelLine={false} // Hide label lines
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, department }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + (radius + 15) * Math.cos(-midAngle * RADIAN); // Adjust label position slightly outwards
                    const y = cy + (radius + 15) * Math.sin(-midAngle * RADIAN);
                    const percentage = (percent * 100).toFixed(0);

                    // Don't render label if percentage is too small
                    if (parseFloat(percentage) < 3) return null;

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="hsl(var(--foreground))" // Use theme foreground color
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        style={{ fontSize: '12px', fontWeight: '500' }}
                      >
                         {`${department} (${percentage}%)`}
                      </text>
                    );
                  }}
                >
                   {data.map((entry, index) => (
                      <Cell key={`cell-manday-${index}`} fill={chartConfig[entry.department]?.color || `hsl(var(--chart-${index % 5 + 1}))`} /> // Cycle through 5 chart colors
                   ))}
                </Pie>
                <Legend content={<ChartLegendContent nameKey="department" />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <p className="text-muted-foreground text-center">
           No manday data available for the selected project<br />
           or department contributions are zero.
         </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentMandayPieChart;
