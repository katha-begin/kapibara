
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartConfig // Import ChartConfig type
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { WeeklyDepartmentProgressData } from '@/types/project'; // Import the new type

interface WeeklyDepartmentProgressChartProps {
  data: WeeklyDepartmentProgressData[];
  departments: string[]; // List of departments involved in the project
}

// Function to generate chart colors dynamically
const generateChartColor = (index: number): string => {
  // Use the theme's chart colors, cycling through them
  return `hsl(var(--chart-${(index % 5) + 1}))`;
};

const WeeklyDepartmentProgressChart: FC<WeeklyDepartmentProgressChartProps> = ({ data, departments }) => {
  // Dynamically create chartConfig based on the departments involved
  const chartConfig = departments.reduce((acc, dept, index) => {
    acc[dept] = {
      label: dept,
      color: generateChartColor(index),
    };
    return acc;
  }, {} as ChartConfig); // Assert type as ChartConfig

  const hasData = data && data.length > 0;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Weekly Manday Progress by Department</CardTitle>
        <CardDescription>Accumulated mandays spent each week, stacked by department.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          {hasData ? (
            <BarChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
              <XAxis
                dataKey="weekEnding"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString()}
                style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip
                 cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                 content={<ChartTooltipContent indicator="dashed" />} // Use ShadCN tooltip style
              />
              <Legend content={<ChartLegendContent />} />
              {departments.map((dept) => (
                <Bar
                  key={dept}
                  dataKey={dept}
                  stackId="a" // All bars belong to the same stack
                  fill={chartConfig[dept]?.color || '#ccc'} // Use configured color or fallback
                  radius={[4, 4, 0, 0]} // Rounded top corners like the example image
                  name={chartConfig[dept]?.label} // Use configured label for legend/tooltip
                />
              ))}
            </BarChart>
          ) : (
            <p className="text-muted-foreground text-center h-[350px] flex items-center justify-center">
              No weekly department progress data available.
            </p>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default WeeklyDepartmentProgressChart;
