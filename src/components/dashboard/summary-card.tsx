import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Target, CheckCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryMetrics {
  totalProjects: number;
  avgKpiScore: number;
  avgCompletion: number;
  totalMandays: number;
}

interface SummaryCardProps {
  metrics: SummaryMetrics;
  className?: string;
}

const SummaryCard: FC<SummaryCardProps> = ({ metrics, className }) => {
  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary">Projects Summary</CardTitle>
        <p className="text-sm text-muted-foreground">Overview of selected projects</p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
          <Briefcase className="h-6 w-6 text-primary mb-2" />
          <span className="text-sm text-muted-foreground">Total Projects</span>
          <span className="text-xl font-semibold text-primary">{metrics.totalProjects}</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
          <Target className="h-6 w-6 text-chart-1 mb-2" />
          <span className="text-sm text-muted-foreground">Avg. KPI</span>
          <span className="text-xl font-semibold text-primary">{metrics.avgKpiScore}%</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
          <CheckCircle className="h-6 w-6 text-chart-2 mb-2" />
          <span className="text-sm text-muted-foreground">Avg. Completion</span>
          <span className="text-xl font-semibold text-primary">{metrics.avgCompletion}%</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-secondary/50 rounded-lg">
          <Users className="h-6 w-6 text-chart-3 mb-2" />
          <span className="text-sm text-muted-foreground">Total Mandays</span>
          <span className="text-xl font-semibold text-primary">{metrics.totalMandays}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
