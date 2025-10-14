import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { AggregatedPIFScores } from "@shared/pifCalculations";

interface PIFAggregatedScoresProps {
  aggregated: AggregatedPIFScores;
}

export function PIFAggregatedScores({ aggregated }: PIFAggregatedScoresProps) {
  const getVarianceIcon = (variance: number) => {
    if (variance > 1.5) return <TrendingUp className="w-4 h-4 text-destructive" />;
    if (variance > 0.5) return <Minus className="w-4 h-4 text-warning" />;
    return <TrendingDown className="w-4 h-4 text-success" />;
  };

  const getVarianceLabel = (variance: number) => {
    if (variance > 1.5) return "High variance";
    if (variance > 0.5) return "Moderate variance";
    return "Low variance";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span data-testid="text-respondent-count">{aggregated.respondentCount} respondent{aggregated.respondentCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-4">
        {/* Process Clarity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Process Clarity</span>
              <span className={`text-2xl font-bold ${getScoreColor(aggregated.processClarity.average)}`} data-testid="text-process-clarity-avg">
                {aggregated.processClarity.average}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={aggregated.processClarity.average} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getVarianceIcon(aggregated.processClarity.variance)}
                <span className="text-muted-foreground">{getVarianceLabel(aggregated.processClarity.variance)}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span data-testid="text-process-clarity-range">
                  Range: {aggregated.processClarity.min}-{aggregated.processClarity.max}
                </span>
                <span data-testid="text-process-clarity-sd">
                  SD: {aggregated.processClarity.standardDeviation.toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Magnitude */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Change Magnitude</span>
              <span className={`text-2xl font-bold ${getScoreColor(aggregated.changeMagnitude.average)}`} data-testid="text-change-magnitude-avg">
                {aggregated.changeMagnitude.average}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={aggregated.changeMagnitude.average} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getVarianceIcon(aggregated.changeMagnitude.variance)}
                <span className="text-muted-foreground">{getVarianceLabel(aggregated.changeMagnitude.variance)}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span data-testid="text-change-magnitude-range">
                  Range: {aggregated.changeMagnitude.min}-{aggregated.changeMagnitude.max}
                </span>
                <span data-testid="text-change-magnitude-sd">
                  SD: {aggregated.changeMagnitude.standardDeviation.toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Brittleness */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Workflow Brittleness</span>
              <span className={`text-2xl font-bold ${getScoreColor(aggregated.workflowBrittleness.average)}`} data-testid="text-workflow-brittleness-avg">
                {aggregated.workflowBrittleness.average}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={aggregated.workflowBrittleness.average} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {getVarianceIcon(aggregated.workflowBrittleness.variance)}
                <span className="text-muted-foreground">{getVarianceLabel(aggregated.workflowBrittleness.variance)}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span data-testid="text-workflow-brittleness-range">
                  Range: {aggregated.workflowBrittleness.min}-{aggregated.workflowBrittleness.max}
                </span>
                <span data-testid="text-workflow-brittleness-sd">
                  SD: {aggregated.workflowBrittleness.standardDeviation.toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
