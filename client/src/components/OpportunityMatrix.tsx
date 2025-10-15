import { useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import type { ImplementationOpportunity } from "@shared/schema";
import { calculateOpportunityScore, type ToggleState } from "@shared/opportunityCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OpportunityMatrixProps {
  opportunities: ImplementationOpportunity[];
  readinessScores: Record<string, number>; // workflowId -> readiness score
  workflowColors?: Record<string, string>; // workflowId -> color
  onOpportunityClick?: (opportunity: ImplementationOpportunity) => void;
}

// Color palette for workflows
const WORKFLOW_COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#f97316", // orange
  "#14b8a6", // teal
];

interface DataPoint {
  id: string;
  name: string;
  workflowId: string;
  x: number; // Business Impact
  y: number; // Implementation Effort (inverted for display)
  quadrant: string;
  color: string;
}

export default function OpportunityMatrix({ 
  opportunities, 
  readinessScores,
  workflowColors,
  onOpportunityClick 
}: OpportunityMatrixProps) {
  const { dataPoints, workflowLegend } = useMemo(() => {
    // Assign colors to workflows
    const uniqueWorkflows = Array.from(new Set(opportunities.map(o => o.workflowId)));
    const colorMap: Record<string, string> = {};
    
    uniqueWorkflows.forEach((workflowId, index) => {
      colorMap[workflowId] = workflowColors?.[workflowId] || WORKFLOW_COLORS[index % WORKFLOW_COLORS.length];
    });

    // Calculate scores for each opportunity using per-opportunity toggle state
    const points: DataPoint[] = opportunities.map(opp => {
      const readinessScore = readinessScores[opp.workflowId];
      
      // Use per-opportunity toggle state
      const toggles: ToggleState = {
        errorMetrics: opp.errorMetricsEnabled ?? false,
        revenueMetrics: opp.revenueMetricsEnabled ?? false,
      };
      
      const score = calculateOpportunityScore(opp, readinessScore, toggles);
      
      return {
        id: opp.id,
        name: opp.name,
        workflowId: opp.workflowId,
        x: score.businessImpact,
        y: score.implementationEffort, // Higher effort = higher on Y-axis
        quadrant: score.quadrant,
        color: colorMap[opp.workflowId],
      };
    });

    // Create legend data
    const legend = uniqueWorkflows.map(wId => ({
      workflowId: wId,
      color: colorMap[wId],
    }));

    return { dataPoints: points, workflowLegend: legend };
  }, [opportunities, readinessScores, workflowColors]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DataPoint;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-xs text-muted-foreground mt-1">Quadrant: {data.quadrant}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs">
              <span className="text-muted-foreground">Business Impact:</span> {data.x.toFixed(1)}
            </p>
            <p className="text-xs">
              <span className="text-muted-foreground">Implementation Effort:</span> {data.y.toFixed(1)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleClick = (data: any) => {
    if (onOpportunityClick && data) {
      const opportunity = opportunities.find(o => o.id === data.id);
      if (opportunity) {
        onOpportunityClick(opportunity);
      }
    }
  };

  return (
    <Card data-testid="card-opportunity-matrix">
      <CardHeader>
        <CardTitle>Opportunity Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]" data-testid="chart-opportunity-matrix">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              
              {/* Axes */}
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Business Impact"
                domain={[0, 100]}
                label={{ 
                  value: 'Business Impact →', 
                  position: 'bottom',
                  offset: 40,
                  className: "fill-foreground text-sm"
                }}
                tick={{ className: "fill-muted-foreground text-xs" }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Implementation Effort"
                domain={[0, 100]}
                label={{ 
                  value: 'Implementation Effort →', 
                  angle: -90, 
                  position: 'left',
                  offset: 40,
                  className: "fill-foreground text-sm"
                }}
                tick={{ className: "fill-muted-foreground text-xs" }}
              />

              {/* Quadrant dividers */}
              <ReferenceLine 
                x={50} 
                stroke="hsl(var(--border))" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <ReferenceLine 
                y={50} 
                stroke="hsl(var(--border))" 
                strokeWidth={2}
                strokeDasharray="5 5"
              />

              {/* Quadrant labels */}
              <text x="25%" y="75%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                Nice-To-Haves
              </text>
              <text x="75%" y="75%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                Quick Wins
              </text>
              <text x="25%" y="25%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                Deprioritize
              </text>
              <text x="75%" y="25%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                Strategic Goals
              </text>

              <Tooltip content={<CustomTooltip />} />

              {/* Data points */}
              <Scatter 
                data={dataPoints} 
                onClick={handleClick}
                className="cursor-pointer"
              >
                {dataPoints.map((entry) => (
                  <Cell 
                    key={entry.id} 
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend (if multiple workflows) */}
        {workflowLegend.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {workflowLegend.map(item => (
              <div key={item.workflowId} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">
                  Workflow {item.workflowId.slice(0, 8)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {dataPoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              No opportunities to display
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
