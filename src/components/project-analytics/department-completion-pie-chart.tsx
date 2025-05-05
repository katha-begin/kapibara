
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
}

// Define chart configuration for colors and labels
const chartConfig = {
  completion: {
    label: "Completion",
  },
  // Use greenish colors
  // Engineering: { label: "Engineering", color: "hsl(140, 60%, 40%)" }, // Greenish for completion
  // Design: { label: "Design", color: "hsl(160, 60%, 40%)" },
  // Marketing: { label: "Marketing", color: "hsl(180, 60%, 40%)" },
  // Sales: { label: "Sales", color: "hsl(200, 60%, 40%)" },
} satisfies Record<string, { label?: string; color?: string }>;

// Generate greenish color palette dynamically
const generateGreenShade = (index: number, total: number) => {
  const baseHue = 140; // Green base
  const hueShift = (index / total) * 40; // Shift hue slightly for variation
  const saturation = 60 + (index % 3) * 5; // Vary saturation
  const lightness = 40 + (index % 4) * 5; // Vary lightness
  return `hsl(${baseHue + hueShift}, ${saturation}%, ${lightness}%)`;
};


const DepartmentCompletionPieChart: FC<DepartmentCompletionPieChartProps> = ({ data }) => {

  // Check if data is valid and has entries
  const hasData = data && data.length > 0 && data.some(d => d.completion > 0);
  const totalDepartments = data.length;

  // Calculate total actual completion value (sum of department contributions)
  // This represents the portion of the project completed, distributed among departments
  const totalCompletionValue = data.reduce((sum, entry) => sum + (entry.completion || 0), 0);
   // Calculate the *overall* project completion percentage (average or specific value if available)
   // Assuming the average for now if a direct overall project completion isn't passed/calculated here
   const overallProjectCompletion = totalDepartments > 0
     ? data.reduce((sum, entry) => sum + (entry.completion || 0), 0) / totalDepartments // Simple average, might need refinement
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
                          formatter={(value, name, props) => `${props.payload.completion.toFixed(1)}% completion`} // Format tooltip value - Use payload.completion
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
                     {data.map((entry, index) => (
                        <Cell key={`cell-completion-${index}`} fill={chartConfig[entry.department]?.color || generateGreenShade(index, totalDepartments)} />
                     ))}
                     {/* Label in the center - showing average completion */}
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
                                  {/* Displaying average or overall completion - adjust logic if needed */}
                                  {overallProjectCompletion.toFixed(1)}%
                                </text>
                                <text
                                     x={viewBox.cx}
                                     y={(viewBox.cy || 0) + 20} // Position below the main number
                                     textAnchor="middle"
                                     dominantBaseline="middle"
                                     className="fill-muted-foreground text-sm"
                                >
                                     Total Complete
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
                {data.sort((a, b) => b.completion - a.completion).map((entry, index) => { // Sort by completion descending
                  // Calculate the percentage *contribution* of this department to the total completion VALUE
                  const contributionPercentage = totalCompletionValue > 0 ? ((entry.completion / totalCompletionValue) * 100) : 0;
                  const color = chartConfig[entry.department]?.color || generateGreenShade(index, totalDepartments);
                  return (
                    <div key={entry.department} className="flex items-center gap-3 text-sm">
                      {/* <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} /> // Optional color dot */}
                      <span className="flex-1 text-muted-foreground truncate">{entry.department}</span>
                      {/* Progress bar shows the contribution percentage */}
                      <Progress value={contributionPercentage} className="h-2 w-24" indicatorClassName={cn(`bg-[${color}]`)} />
                      {/* Label shows the contribution percentage */}
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
