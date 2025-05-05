
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
  ChartConfig // Import ChartConfig type
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
    color: "hsl(140, 60%, 40%)", // Green color
  },
  mandays: { // Renamed to mandayPercentage
    label: "Manday Usage (%)", // Changed label
    color: "hsl(var(--chart-1))", // Use chart-1 color
  },
} satisfies ChartConfig; // Use ChartConfig type

const CompletionVsMandayChart: FC<CompletionVsMandayChartProps> = ({ weeklyProgress }) => {
  // Format data for the chart
  const chartData = weeklyProgress.map(item => ({
    weekEnding: format(item.weekEnding, 'MMM d'), // Format date for X-axis
    completion: item.completionPercentage,
    mandays: item.mandayPercentage, // Use mandayPercentage for this area
    weekNumber: item.week, // Keep week number if needed for tooltip or labels
  }));

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Project Progress Over Time</CardTitle>
        <CardDescription>Weekly Completion Percentage vs. Manday Usage Percentage</CardDescription>
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
              {/* Y Axis for Manday Usage Percentage */}
              <YAxis
                 yAxisId="right"
                 orientation="right"
                 dataKey="mandays" // This now refers to mandayPercentage from chartData
                 tickLine={false}
                 axisLine={false}
                 tickMargin={8}
                 tickFormatter={(value) => `${value}%`} // Format as percentage
                 style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
                 domain={[0, 'auto']} // Start at 0, allow exceeding 100%
              />
              <Tooltip
                 cursor={{ fill: 'hsl(var(--muted)/0.3)' }} // Light background on hover
                 content={
                    <ChartTooltipContent
                      indicator="line"
                      formatter={(value, name, props) => {
                        if (props.dataKey === 'completion') {
                          return `${value}% Completion`;
                        }
                        if (props.dataKey === 'mandays') { // This is mandayPercentage now
                           return `${value}% Manday Usage`;
                        }
                        return `${value}`;
                      }}
                    />
                 }
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
               {/* Area for Manday Usage Percentage */}
               <Area
                 yAxisId="right"
                 dataKey="mandays" // This is mandayPercentage
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
