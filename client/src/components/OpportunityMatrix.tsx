import { useMemo, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Label } from "recharts";
import type { ImplementationOpportunity, Workflow } from "@shared/schema";
import { 
  calculateOpportunityScore, 
  type ToggleState, 
  type CompanyContext,
  type MatrixFilterType,
  filterOpportunitiesByMetrics,
  calculateBusinessImpactForFilter,
  calculateImplementationEffort
} from "@shared/opportunityCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OpportunityMatrixProps {
  opportunities: ImplementationOpportunity[];
  workflows: Workflow[]; // Workflow data for name mapping
  readinessScores: Record<string, number>; // workflowId -> readiness score
  workflowColors?: Record<string, string>; // workflowId -> color
  companyContext?: CompanyContext; // Company financial context for normalized scoring
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
  workflowName: string;
  x: number; // Business Impact
  y: number; // Implementation Effort (inverted for display)
  quadrant: string;
  color: string;
}

export default function OpportunityMatrix({ 
  opportunities, 
  workflows,
  readinessScores,
  workflowColors,
  companyContext,
  onOpportunityClick 
}: OpportunityMatrixProps) {
  const [filterType, setFilterType] = useState<MatrixFilterType>("all-opportunities");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { dataPoints, workflowLegend } = useMemo(() => {
    // Create workflow name mapping
    const workflowMap = workflows.reduce((acc, w) => {
      acc[w.id] = w.name;
      return acc;
    }, {} as Record<string, string>);

    // First filter opportunities based on selected filter
    const filteredOpps = filterOpportunitiesByMetrics(opportunities, filterType);

    // Assign colors to workflows
    const uniqueWorkflows = Array.from(new Set(filteredOpps.map(o => o.workflowId)));
    const colorMap: Record<string, string> = {};
    
    uniqueWorkflows.forEach((workflowId, index) => {
      colorMap[workflowId] = workflowColors?.[workflowId] || WORKFLOW_COLORS[index % WORKFLOW_COLORS.length];
    });

    // Calculate raw scores for filtered opportunities
    const rawPoints = filteredOpps.map(opp => {
      const readinessScore = readinessScores[opp.workflowId];
      
      // Calculate implementation effort (same for all filters)
      const implementationEffort = calculateImplementationEffort(
        readinessScore,
        parseFloat(opp.rampupPeriodMonths || "0"),
        parseFloat(opp.paybackPeriodMonths || "0"),
        parseFloat(opp.trainingHoursPerEmployee || "0")
      );

      // Calculate business impact using filter-specific recalculation
      const businessImpact = calculateBusinessImpactForFilter(opp, filterType, companyContext);
      
      return {
        id: opp.id,
        name: opp.name,
        workflowId: opp.workflowId,
        businessImpact,
        implementationEffort,
        color: colorMap[opp.workflowId],
      };
    });

    // Within-category normalization: find max Business Impact and normalize
    const maxBusinessImpact = Math.max(...rawPoints.map(p => p.businessImpact), 0);
    
    // Only normalize if we have meaningful scores (max > 20)
    // This prevents over-inflation of very low scores
    const shouldNormalize = maxBusinessImpact > 20 && filterType !== "all-opportunities";
    
    const points: DataPoint[] = rawPoints.map(point => {
      // Normalize Business Impact to make best opportunity reach ~100
      let normalizedImpact = point.businessImpact;
      if (shouldNormalize && maxBusinessImpact > 0) {
        normalizedImpact = (point.businessImpact / maxBusinessImpact) * 100;
      }
      
      // Determine quadrant based on normalized scores
      const isLowEffort = point.implementationEffort < 50;
      const isHighImpact = normalizedImpact >= 50;
      let quadrant: string;
      if (isLowEffort && isHighImpact) quadrant = "Quick Wins";
      else if (!isLowEffort && isHighImpact) quadrant = "Strategic Goals";
      else if (isLowEffort && !isHighImpact) quadrant = "Nice-To-Haves";
      else quadrant = "Deprioritize";
      
      return {
        id: point.id,
        name: point.name,
        workflowId: point.workflowId,
        workflowName: workflowMap[point.workflowId] || "Unknown",
        x: normalizedImpact,
        y: point.implementationEffort,
        quadrant,
        color: point.color,
      };
    });

    // Create legend data with workflow names
    const legend = uniqueWorkflows.map(wId => ({
      workflowId: wId,
      workflowName: workflowMap[wId] || "Unknown",
      color: colorMap[wId],
    }));

    return { dataPoints: points, workflowLegend: legend };
  }, [opportunities, workflows, readinessScores, workflowColors, companyContext, filterType]);

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

  const handleFilterChange = (value: string) => {
    setIsTransitioning(true);
    // Fade out
    setTimeout(() => {
      setFilterType(value as MatrixFilterType);
      // Fade in after data updates
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 200);
  };

  // Custom label content for opportunity names
  const CustomLabel = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload || !payload.name) return null;
    
    return (
      <text
        x={cx}
        y={cy - 12}
        textAnchor="middle"
        className="fill-foreground text-[10px] font-medium pointer-events-none"
        style={{ userSelect: 'none' }}
      >
        {payload.name}
      </text>
    );
  };

  return (
    <Card data-testid="card-opportunity-matrix">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Opportunity Matrix</CardTitle>
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[240px]" data-testid="select-matrix-filter">
              <SelectValue placeholder="Filter by metrics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-opportunities" data-testid="filter-all-opportunities">
                All Opportunities
              </SelectItem>
              <SelectItem value="time-only" data-testid="filter-time-only">
                Time Savings Only
              </SelectItem>
              <SelectItem value="time-error" data-testid="filter-time-error">
                Time + Error Reduction
              </SelectItem>
              <SelectItem value="time-revenue" data-testid="filter-time-revenue">
                Time + Revenue Uplift
              </SelectItem>
              <SelectItem value="all-three" data-testid="filter-all-three">
                All 3 Metrics
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="h-[500px] transition-opacity duration-200" 
          data-testid="chart-opportunity-matrix"
          style={{ opacity: isTransitioning ? 0 : 1 }}
        >
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
                label={<CustomLabel />}
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
                  {item.workflowName}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {dataPoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">
              {filterType === "all-opportunities" 
                ? "No opportunities to display"
                : "No opportunities match this filter"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
