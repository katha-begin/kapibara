
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Label, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"; // Removed ChartLegendContent
import { Progress } from "@/components/ui/progress"; // Import Progress
import { cn } from "@/lib/utils"; // Import cn
import type { DepartmentContribution } from '@/types/project'; // Import type

interface DepartmentCompletionPieChartProps {
  data: DepartmentContribution[];
  departments: string[]; // Pass all project departments for consistent coloring
}

// Define chart configuration for colors and labels
const chartConfig = {
  completion: {
    label: "Completion",
  },
  // Colors will be generated dynamically based on the full department list
} satisfies Record<string, { label?: string; color?: string }>;

// Generate colors dynamically using the theme's chart variables based on a consistent index
const generateChartColor = (department: string, allDepartments: string[]): string => {
  const index = allDepartments.indexOf(department);
   if (index === -1) return `hsl(var(--muted))`; // Fallback color
  // Use chart colors 1-5 from the theme
  return `hsl(var(--chart-${(index % 5) + 1}))`;
};


const DepartmentCompletionPieChart: FC<DepartmentCompletionPieChartProps> = ({ data, departments }) => {

  // Check if data is valid and has entries
  const hasData = data && data.length > 0 && data.some(d => d.completion > 0);

  // Calculate total actual completion value (sum of department contributions)
  const totalCompletionValue = data.reduce((sum, entry) => sum + (entry.completion || 0), 0);

   // Calculate the *overall* project completion percentage
   // Find the highest completion value among departments as a proxy for overall,
   // or assume average if needed. Let's try taking the max reported completion.
   // This might need refinement based on how 'overall project completion' should be calculated.
   const overallProjectCompletion = data.length > 0
     ? Math.max(...data.map(d => d.completion || 0)) // Max completion from contributions
     : 0;


  return (
    <Card className="shadow-md flex flex-col h-full">
      <CardHeader>
        <CardTitle>Department Completion Contribution</CardTitle>
        <CardDescription>Distribution of total completion per department.</CardDescription>
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
                          formatter={(value, name, props) => `${value.toFixed(1)}% completion`} // Format tooltip value - Use actual value
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
                {data.sort((a, b) => b.completion - a.completion).map((entry, index) => { // Sort by completion descending
                  // Calculate the percentage *contribution* of this department to the total completion VALUE
                  const contributionPercentage = totalCompletionValue > 0 ? ((entry.completion / totalCompletionValue) * 100) : 0;
                   const color = generateChartColor(entry.department, departments); // Get the consistent color
                  return (
                    <div key={entry.department} className="flex items-center gap-3 text-sm">
                      <span className="flex-1 text-muted-foreground truncate">{entry.department}</span>
                      {/* Apply department color to the progress bar indicator */}
                      {/* Ensure color string is directly usable by Tailwind JIT */}
                      <Progress value={contributionPercentage} className="h-2 w-24" indicatorClassName={`bg-[${color}]`} />
                      <span className="w-10 text-right font-medium">{contributionPercentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
             </div>
           </>
         ) : (
           <p className="text-muted-foreground text-center">
             No completion data available for the selected project<br />
             or department contributions are zero.
           </p>
         )}
      </CardContent>
    </Card>
  );
};

export default DepartmentCompletionPieChart;
