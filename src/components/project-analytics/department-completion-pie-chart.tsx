
'use client';

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import type { DepartmentContribution } from '@/types/project'; // Import type

interface DepartmentCompletionPieChartProps {
  data: DepartmentContribution[];
}

// Define chart configuration for colors and labels
const chartConfig = {
  completion: {
    label: "Completion",
  },
  // Example: Add specific colors per department if needed, otherwise uses default palette
  // Engineering: { label: "Engineering", color: "hsl(140, 60%, 40%)" }, // Greenish for completion
  // Design: { label: "Design", color: "hsl(160, 60%, 40%)" },
  // Marketing: { label: "Marketing", color: "hsl(180, 60%, 40%)" },
  // Sales: { label: "Sales", color: "hsl(200, 60%, 40%)" },
} satisfies Record<string, { label?: string; color?: string }>;

// Generate greenish color palette dynamically if needed
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

  // Calculate total completion to determine percentages accurately for labels
  const totalCompletionValue = data.reduce((sum, entry) => sum + (entry.completion || 0), 0);


  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Department Completion Contribution</CardTitle>
        <CardDescription>Percentage contribution to total completion per department.</CardDescription>
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
                          formatter={(value, name) => `${value.toFixed(1)}% completion`} // Format tooltip value
                        />
                      }
                   />
                  <Pie
                    data={data}
                    dataKey="completion" // Use completion data key
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40} // Make it a donut chart
                    fill="#82ca9d" // Base fill, overridden by Cells
                    labelLine={false} // Hide label lines
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index, department }) => {
                        const RADIAN = Math.PI / 180;
                        // Calculate radius for label placement (slightly outside the outer radius)
                        const radius = outerRadius + 15;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        const percentage = totalCompletionValue > 0 ? ((value / totalCompletionValue) * 100).toFixed(0) : 0;


                        // Don't render label if percentage is too small
                        if (parseFloat(percentage as string) < 3) return null;

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
                        <Cell key={`cell-completion-${index}`} fill={chartConfig[entry.department]?.color || generateGreenShade(index, totalDepartments)} />
                     ))}
                  </Pie>
                  <Legend content={<ChartLegendContent nameKey="department" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
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
