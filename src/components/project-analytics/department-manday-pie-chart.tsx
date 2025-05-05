
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Label, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"; // Removed ChartLegendContent
import { Progress } from "@/components/ui/progress"; // Import Progress
import { cn } from "@/lib/utils"; // Import cn
import type { DepartmentContribution } from '@/types/project'; // Import type

interface DepartmentMandayPieChartProps {
  data: DepartmentContribution[];
  departments: string[]; // Pass all project departments for consistent coloring
}

// Define chart configuration for colors and labels
const chartConfig = {
  mandays: {
    label: "Mandays",
  },
  // Colors will be generated dynamically based on the full department list
} satisfies Record<string, { label?: string; color?: string }>;

// Function to format large numbers (e.g., 1200 -> 1.2k)
const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

// Generate colors dynamically using the theme's chart variables based on a consistent index
const generateChartColor = (department: string, allDepartments: string[]): string => {
  const index = allDepartments.indexOf(department);
  if (index === -1) return `hsl(var(--muted))`; // Fallback color
  return `hsl(var(--chart-${(index % 5) + 1}))`; // Cycle through chart-1 to chart-5
};


const DepartmentMandayPieChart: FC<DepartmentMandayPieChartProps> = ({ data, departments }) => {

  // Check if data is valid and has entries
  const hasData = data && data.length > 0 && data.some(d => d.mandays > 0);
  // Calculate total mandays
  const totalMandaysValue = data.reduce((sum, entry) => sum + (entry.mandays || 0), 0);


  return (
    <Card className="shadow-md flex flex-col h-full">
      <CardHeader>
        <CardTitle>Department Manday Contribution</CardTitle>
        <CardDescription>Distribution of total mandays per department.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-4 pt-0">
        {hasData ? (
          <>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
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
                    outerRadius={80} // Adjusted radius
                    innerRadius={60} // Make it a donut chart
                    fill="#82ca9d" // Base fill, overridden by Cells
                    labelLine={false} // Hide label lines
                    label={false} // Disable default labels on segments
                  >
                     {data.map((entry, index) => {
                        const color = generateChartColor(entry.department, departments);
                        return <Cell key={`cell-manday-${index}`} fill={color} />
                     })}
                     {/* Label in the center */}
                     <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <>
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy} // Adjusted y position slightly
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="fill-foreground text-3xl font-bold"
                                >
                                  {formatNumber(totalMandaysValue)}
                                </text>
                                <text
                                     x={viewBox.cx}
                                     y={(viewBox.cy || 0) + 20} // Position below the main number
                                     textAnchor="middle"
                                     dominantBaseline="middle"
                                     className="fill-muted-foreground text-sm"
                                >
                                     Total Mandays
                                 </text>
                              </>
                            );
                          }
                          return null;
                        }}
                     />
                  </Pie>
                  {/* Remove default Legend: <Legend content={<ChartLegendContent nameKey="department" />} /> */}
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Custom Legend/List */}
            <div className="w-full mt-4 space-y-2">
               {data.sort((a, b) => b.mandays - a.mandays).map((entry, index) => { // Sort by mandays descending
                 const percentage = totalMandaysValue > 0 ? ((entry.mandays / totalMandaysValue) * 100) : 0;
                 const color = generateChartColor(entry.department, departments); // Get the consistent color
                 return (
                   <div key={entry.department} className="flex items-center gap-3 text-sm">
                     <span className="flex-1 text-muted-foreground truncate">{entry.department}</span>
                     {/* Apply department color to the progress bar indicator */}
                     {/* Ensure color string is directly usable by Tailwind JIT */}
                     <Progress value={percentage} className="h-2 w-24" indicatorClassName={`bg-[${color}]`} />
                     <span className="w-10 text-right font-medium">{percentage.toFixed(0)}%</span>
                   </div>
                 );
               })}
            </div>
          </>
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
