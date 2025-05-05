
'use client';

import type { FC } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle, // Import ChartStyle if needed for custom colors
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import type { ProjectWeeklyProgress } from '@/types/project';

interface CompletionVsMandayChartProps {
  weeklyProgress: ProjectWeeklyProgress[];
}

// Define chart configuration for colors and labels
const chartConfig = {
  completion: {
    label: "Completion (%)",
    color: "hsl(var(--chart-2))", // Example: Use chart-2 color (soft blue)
  },
  mandays: {
    label: "Accum. Mandays",
    color: "hsl(var(--chart-1))", // Example: Use chart-1 color (another soft blue)
  },
} satisfies Record<string, { label: string; color: string }>;

const CompletionVsMandayChart: FC<CompletionVsMandayChartProps> = ({ weeklyProgress }) => {
  // Format data for the chart
  const chartData = weeklyProgress.map(item => ({
    weekEnding: format(item.weekEnding, 'MMM d'), // Format date for X-axis
    completion: item.completionPercentage,
    mandays: item.accumulatedMandays,
    weekNumber: item.week, // Keep week number if needed for tooltip or labels
  }));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Project Progress Over Time</CardTitle>
        <CardDescription>Weekly Completion Percentage vs. Accumulated Mandays</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
           {/* Use ResponsiveContainer for proper sizing */}
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 10, // Adjusted left margin for Y-axis labels
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
               {/* X Axis for Week Ending Dates */}
              <XAxis
                dataKey="weekEnding"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value} // Already formatted
                 style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
              />
               {/* Y Axis for Completion Percentage */}
              <YAxis
                yAxisId="left"
                dataKey="completion"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value}%`}
                style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                 domain={[0, 100]} // Percentage scale
              />
              {/* Y Axis for Accumulated Mandays */}
              <YAxis
                 yAxisId="right"
                 orientation="right"
                 dataKey="mandays"
                 tickLine={false}
                 axisLine={false}
                 tickMargin={8}
                 tickFormatter={(value) => value.toLocaleString()} // Format large numbers
                 style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                 domain={['auto', 'auto']} // Auto scale based on data
              />
              <Tooltip
                 cursor={{ fill: 'hsl(var(--muted)/0.3)' }} // Light background on hover
                 content={<ChartTooltipContent indicator="line" />} // Use ShadCN tooltip style
              />
              <ChartLegend content={<ChartLegendContent />} />
              {/* Area for Completion Percentage */}
              <Area
                yAxisId="left"
                dataKey="completion"
                type="monotone"
                fill={chartConfig.completion.color}
                fillOpacity={0.3}
                stroke={chartConfig.completion.color}
                strokeWidth={2}
                stackId="a" // Use stackId if you want stacked areas, remove if not
                name={chartConfig.completion.label} // Name for legend/tooltip
                dot={false}
              />
               {/* Area for Accumulated Mandays */}
               <Area
                 yAxisId="right"
                 dataKey="mandays"
                 type="monotone"
                 fill={chartConfig.mandays.color}
                 fillOpacity={0.2} // Slightly different opacity
                 stroke={chartConfig.mandays.color}
                 strokeWidth={2}
                 stackId="b" // Different stackId for separate area
                 name={chartConfig.mandays.label} // Name for legend/tooltip
                 dot={false}
               />
            </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CompletionVsMandayChart;
