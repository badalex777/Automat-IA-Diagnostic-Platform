import { useMemo, useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LabelList } from "recharts";
import type { ImplementationOpportunity, Workflow, WorkflowConsolidation } from "@shared/schema";
import { 
  calculateBaseImpact,
  calculateImplementationEffort,
  type CompanyContext,
  getQuadrant
} from "@shared/opportunityCalculations";
import { 
  calculateConsolidatedMetrics,
  calculateConsolidatedBaseImpact,
  computeConsolidatedReadiness,
  getConsolidatedImplementationInputs
} from "@shared/consolidationCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { MatrixViewMode } from "@/lib/opportunityViewMode";
import { MATRIX_VIEW_OPTIONS } from "@/lib/opportunityViewMode";

interface BaseImpactMatrixProps {
  opportunities: ImplementationOpportunity[];
  workflows: Workflow[];
  readinessScores: Record<string, number>;
  consolidations?: WorkflowConsolidation[];
  viewMode: MatrixViewMode;
  onViewModeChange: (mode: MatrixViewMode) => void;
  workflowColors?: Record<string, string>;
  companyContext?: CompanyContext;
  onOpportunityClick?: (opportunity: ImplementationOpportunity) => void;
}

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
  workflowName: string;
  x: number; // Base Business Impact (0-100)
  y: number; // Implementation Effort
  quadrant: string;
  color: string;
  isConsolidation?: boolean; // Flag for visual differentiation
}

export default function BaseImpactMatrix({ 
  opportunities, 
  workflows,
  readinessScores,
  consolidations = [],
  viewMode,
  onViewModeChange,
  workflowColors,
  companyContext,
  onOpportunityClick 
}: BaseImpactMatrixProps) {
  const [displayData, setDisplayData] = useState<DataPoint[]>([]);

  // Build stable color map
  const colorMap = useMemo(() => {
    const allWorkflows = Array.from(new Set(opportunities.map(o => o.workflowId)));
    allWorkflows.sort();
    const colors: Record<string, string> = {};
    
    allWorkflows.forEach((workflowId, index) => {
      colors[workflowId] = workflowColors?.[workflowId] || WORKFLOW_COLORS[index % WORKFLOW_COLORS.length];
    });
    
    return colors;
  }, [opportunities, workflowColors]);

  const { dataPoints, workflowLegend } = useMemo(() => {
    const workflowMap = workflows.reduce((acc, w) => {
      acc[w.id] = w.name;
      return acc;
    }, {} as Record<string, string>);

    const points: DataPoint[] = [];
    
    // Add opportunity points based on viewMode
    if (viewMode !== 'consolidations-only') {
      opportunities.forEach(opp => {
        // Use step-level readiness score for positioning (opportunities are always linked to steps)
        const readinessScore = opp.stepId ? readinessScores[opp.stepId] : 0;
        
        const implementationEffort = calculateImplementationEffort(
          readinessScore || 0,
          parseFloat(opp.rampupPeriodMonths || "0"),
          parseFloat(opp.paybackPeriodMonths || "0"),
          parseFloat(opp.trainingHoursPerEmployee || "0")
        );

        // Calculate BASE impact (always 0-100, no toggles)
        const baseImpact = calculateBaseImpact(opp, companyContext);
        
        // Determine quadrant (base scale is always 100)
        const quadrant = getQuadrant(implementationEffort, baseImpact, 100);
        
        points.push({
          id: opp.id,
          name: opp.name,
          workflowId: opp.workflowId,
          workflowName: workflowMap[opp.workflowId] || "Unknown",
          x: baseImpact,
          y: implementationEffort,
          quadrant,
          color: colorMap[opp.workflowId],
        });
      });
    }
    
    // Add consolidation points based on viewMode (using BASE calculations)
    if (viewMode !== 'opportunities-only') {
      consolidations.forEach(cons => {
        // Get constituent opportunities
        const constituentOpps = opportunities.filter(o => 
          cons.opportunityIds.includes(o.id)
        );
        
        if (constituentOpps.length === 0) return;
        
        // Calculate consolidated metrics
        const metrics = calculateConsolidatedMetrics(constituentOpps);
        
        // Calculate base impact (ROI 60% + FTE 40%, no enhanced bonuses)
        const baseImpact = calculateConsolidatedBaseImpact(metrics, companyContext);
        
        // Calculate consolidated readiness score (FTE-weighted average)
        const consolidatedReadiness = computeConsolidatedReadiness(constituentOpps, readinessScores);
        
        // Get implementation effort inputs (already has coordination buffers)
        const effortInputs = getConsolidatedImplementationInputs(metrics, consolidatedReadiness);
        
        // Calculate implementation effort with additional integration overhead
        const implementationEffort = calculateImplementationEffort(
          effortInputs.readinessScore,
          effortInputs.rampupMonths * 1.15, // 15% integration overhead
          effortInputs.paybackMonths, // Already has 20% coordination buffer
          effortInputs.trainingHours * 1.15 // 15% integration overhead
        );
        
        // Determine quadrant (base scale is always 100)
        const quadrant = getQuadrant(implementationEffort, baseImpact, 100);
        
        points.push({
          id: cons.id,
          name: cons.name,
          workflowId: cons.workflowId,
          workflowName: workflowMap[cons.workflowId] || "Unknown",
          x: baseImpact,
          y: implementationEffort,
          quadrant,
          color: colorMap[cons.workflowId],
          isConsolidation: true,
        });
      });
    }

    // Create legend from all unique workflows
    const allWorkflowIds = Array.from(new Set([
      ...opportunities.map(o => o.workflowId),
      ...consolidations.map(c => c.workflowId)
    ]));
    const legend = allWorkflowIds.map(wId => ({
      workflowId: wId,
      workflowName: workflowMap[wId] || "Unknown",
      color: colorMap[wId],
    }));

    return { dataPoints: points, workflowLegend: legend };
  }, [opportunities, consolidations, workflows, readinessScores, colorMap, companyContext, viewMode]);

  // Update display data immediately
  useEffect(() => {
    setDisplayData(dataPoints);
  }, [dataPoints]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DataPoint;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          {data.isConsolidation && (
            <p className="text-xs text-primary font-medium">Strategic Consolidation</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Quadrant: {data.quadrant}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs">
              <span className="text-muted-foreground">Base Impact:</span> {data.x.toFixed(1)}
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

  if (opportunities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Base Impact Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No opportunities to display. Create opportunities to see them plotted here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Base Impact Matrix</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Fair comparison using ROI 60% + Time Savings 40% (0-100 scale)
            </p>
          </div>
          
          {consolidations.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">View:</span>
              <Select value={viewMode} onValueChange={onViewModeChange}>
                <SelectTrigger className="w-[220px]" data-testid="select-base-matrix-view">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MATRIX_VIEW_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div 
            className="h-[500px]" 
            data-testid="chart-base-impact-matrix"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Base Impact"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  label={{
                    value: 'Base Business Impact →',
                    position: 'bottom',
                    offset: 40,
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Implementation Effort"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  label={{
                    value: '↑ Implementation Effort',
                    angle: -90,
                    position: 'left',
                    offset: 40,
                    style: { fill: 'hsl(var(--muted-foreground))' }
                  }}
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                <ReferenceLine
                  x={50}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeOpacity={0.3}
                />
                <ReferenceLine
                  y={50}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="5 5"
                  strokeOpacity={0.3}
                />

                <text
                  x="33%"
                  y="25%"
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.4}
                  fontSize={14}
                  fontWeight={600}
                >
                  Deprioritize
                </text>

                <text
                  x="33%"
                  y="67%"
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.4}
                  fontSize={14}
                  fontWeight={600}
                >
                  Nice-to-Have
                </text>

                <text
                  x="75%"
                  y="67%"
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.4}
                  fontSize={14}
                  fontWeight={600}
                >
                  Quick Wins
                </text>

                <text
                  x="75%"
                  y="25%"
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  opacity={0.4}
                  fontSize={14}
                  fontWeight={600}
                >
                  Strategic Bets
                </text>

                <Scatter
                  data={displayData}
                  onClick={handleClick}
                  style={{ cursor: 'pointer' }}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload) return <></>;
                    
                    // Larger size and border for consolidations
                    const radius = payload.isConsolidation ? 9 : 5;
                    const strokeWidth = payload.isConsolidation ? 2 : 0;
                    
                    return (
                      <g>
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r={radius} 
                          fill={payload.color}
                          stroke={payload.isConsolidation ? "hsl(var(--foreground))" : "none"}
                          strokeWidth={strokeWidth}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </g>
                    );
                  }}
                >
                  <LabelList
                    dataKey="name"
                    position="top"
                    style={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 600 }}
                    offset={8}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {workflowLegend.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {workflowLegend.map(item => (
                <div key={item.workflowId} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.workflowName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
