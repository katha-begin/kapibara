
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Label, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
// Adjust import if DepartmentAllocation is now the relevant type
import type { DepartmentAllocation } from '@/types/project';

// Update Props: Expect data related to completion, potentially derived
interface DepartmentCompletionPieChartProps {
  // Data might need restructuring depending on how completion contribution is determined
  data: { department: string; completion: number }[]; // Use 'completion' for clarity
  departments: string[]; // Pass all project departments for consistent coloring
}

// Define chart configuration for colors and labels
const chartConfig = {
  completion: {
    label: "Completion",
  },
} satisfies Record<string, { label?: string; color?: string }>;

// Generate colors dynamically using the theme's chart variables based on a consistent index
const generateChartColor = (department: string, allDepartments: string[]): string => {
  const index = allDepartments.indexOf(department);
   if (index === -1) return `hsl(var(--muted))`; // Fallback color
  return `hsl(var(--chart-${(index % 5) + 1}))`;
};


const DepartmentCompletionPieChart: FC<DepartmentCompletionPieChartProps> = ({ data, departments }) => {

  // Check if data is valid and has entries where completion > 0
  const hasData = data && data.length > 0 && data.some(d => d.completion > 0);

  // Calculate total completion contribution VALUE (sum of individual contributions)
  const totalCompletionValue = data.reduce((sum, entry) => sum + (entry.completion || 0), 0);

  // Calculate the *overall* project completion percentage from the sum of contributions
  // This assumes the input `data.completion` represents the contribution % value
  const overallProjectCompletion = totalCompletionValue;

  return (
    <Card className="shadow-md flex flex-col h-full">
      <CardHeader>
        <CardTitle>Department Completion Contribution</CardTitle>
        <CardDescription>Approximate distribution of completion per department.</CardDescription>
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
                          formatter={(value, name, props) => `${value.toFixed(1)}% completion`} // Format tooltip value
                        />
                      }
                   />
                  <Pie
                    data={data}
                    dataKey="completion" // Use completion data key
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={80} // Adjusted radius
                    innerRadius={60} // Make it a donut chart
                    fill="#82ca9d" // Base fill, overridden by Cells
                    labelLine={false} // Hide label lines
                    label={false} // Disable default labels
                  >
                     {data.map((entry, index) => {
                        const color = generateChartColor(entry.department, departments);
                        return <Cell key={`cell-completion-${index}`} fill={color} />
                     })}
                     {/* Label in the center - showing overall completion */}
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
                                  {/* Show overall project completion */}
                                  {overallProjectCompletion.toFixed(1)}%
                                </text>
                                <text
                                     x={viewBox.cx}
                                     y={(viewBox.cy || 0) + 20} // Position below the main number
                                     textAnchor="middle"
                                     dominantBaseline="middle"
                                     className="fill-muted-foreground text-sm"
                                >
                                     Overall Complete
                                 </text>
                              </>
                            );
                          }
                          return null;
                        }}
                     />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

             {/* Custom Legend/List */}
             <div className="w-full mt-4 space-y-2">
                {/* Sort by completion contribution */}
                {data.sort((a, b) => b.completion - a.completion).map((entry, index) => {
                  // Calculate the percentage share of this department's contribution to the total completion VALUE
                  const contributionPercentageShare = totalCompletionValue > 0 ? ((entry.completion / totalCompletionValue) * 100) : 0;
                  const color = generateChartColor(entry.department, departments); // Get the consistent color

                  // Style for the progress bar indicator using inline style for dynamic color
                  const indicatorStyle = { backgroundColor: color };

                  return (
                    <div key={entry.department} className="flex items-center gap-3 text-sm">
                      <span className="flex-1 text-muted-foreground truncate">{entry.department}</span>
                      {/* Use inline style for dynamic color */}
                      <Progress value={contributionPercentageShare} className="h-2 w-24" style={{ '--indicator-color': color } as React.CSSProperties} indicatorClassName={`bg-[var(--indicator-color)]`} />
                      <span className="w-10 text-right font-medium">{contributionPercentageShare.toFixed(0)}%</span>
                    </div>
                  );
                })}
             </div>
           </>
         ) : (
           <p className="text-muted-foreground text-center">
             No completion contribution data available.
           </p>
         )}
      </CardContent>
    </Card>
  );
};

export default DepartmentCompletionPieChart;
