import { useMemo, useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, LabelList } from "recharts";
import type { ImplementationOpportunity, Workflow } from "@shared/schema";
import { 
  type CompanyContext,
  type MatrixFilterType,
  filterOpportunitiesByMetrics,
  calculateBusinessImpactForFilter,
  calculateImplementationEffort,
  getQuadrant,
  type ToggleState,
  getFilterMaxScore
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
  const [displayData, setDisplayData] = useState<DataPoint[]>([]);

  // Build stable color map based on ALL workflows (not just filtered)
  // Sort workflow IDs to ensure stable color assignment even when opportunities change
  const colorMap = useMemo(() => {
    const allWorkflows = Array.from(new Set(opportunities.map(o => o.workflowId)));
    // Sort by ID to ensure consistent ordering and stable colors
    allWorkflows.sort();
    const colors: Record<string, string> = {};
    
    allWorkflows.forEach((workflowId, index) => {
      colors[workflowId] = workflowColors?.[workflowId] || WORKFLOW_COLORS[index % WORKFLOW_COLORS.length];
    });
    
    return colors;
  }, [opportunities, workflowColors]);

  // Enhanced Impact Matrix always uses 0-150 scale (supports all 3 metrics)
  // Individual opportunities may score lower if their bonuses are toggled off
  const maxImpactScale = 150;

  const { dataPoints, workflowLegend } = useMemo(() => {
    const workflowMap = workflows.reduce((acc, w) => {
      acc[w.id] = w.name;
      return acc;
    }, {} as Record<string, string>);

    // Filter opportunities based on selected filter
    const filteredOpps = filterOpportunitiesByMetrics(opportunities, filterType);

    // Calculate scores for filtered opportunities
    const points: DataPoint[] = filteredOpps.map(opp => {
      const readinessScore = readinessScores[opp.workflowId];
      
      const implementationEffort = calculateImplementationEffort(
        readinessScore,
        parseFloat(opp.rampupPeriodMonths || "0"),
        parseFloat(opp.paybackPeriodMonths || "0"),
        parseFloat(opp.trainingHoursPerEmployee || "0")
      );

      // Calculate ENHANCED impact (respects per-opportunity toggles, uses reweighting)
      const enhancedImpact = calculateBusinessImpactForFilter(opp, filterType, companyContext);
      
      // Determine quadrant using fixed 150 scale (Enhanced Impact Matrix uses full capability scale)
      const quadrant = getQuadrant(implementationEffort, enhancedImpact, 150);
      
      return {
        id: opp.id,
        name: opp.name,
        workflowId: opp.workflowId,
        workflowName: workflowMap[opp.workflowId] || "Unknown",
        x: enhancedImpact,
        y: implementationEffort,
        quadrant,
        color: colorMap[opp.workflowId],
      };
    });

    // Create legend
    const allUniqueWorkflows = Array.from(new Set(opportunities.map(o => o.workflowId)));
    const legend = allUniqueWorkflows.map(wId => ({
      workflowId: wId,
      workflowName: workflowMap[wId] || "Unknown",
      color: colorMap[wId],
    }));

    return { dataPoints: points, workflowLegend: legend };
  }, [opportunities, workflows, readinessScores, colorMap, companyContext, filterType]);

  // Handle display data updates - immediate for data changes, fade for filter changes
  useEffect(() => {
    // No previous data - just populate immediately (initial render or recovery from empty)
    if (displayData.length === 0) {
      setDisplayData(dataPoints);
      return;
    }

    // No new data - clear immediately
    if (dataPoints.length === 0) {
      setDisplayData([]);
      return;
    }

    // Data changed (toggle updates, opportunity edits) - update immediately
    // No transition needed for same-filter data updates
    setDisplayData(dataPoints);
  }, [dataPoints]);

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
    setFilterType(value as MatrixFilterType);
  };

  return (
    <Card data-testid="card-opportunity-matrix">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Enhanced Impact Matrix</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Additive bonus model with full capability scale (0-150)
            </p>
          </div>
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
        <div className="relative">
          <div 
            className="h-[500px]" 
            data-testid="chart-opportunity-matrix"
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                
                {/* Axes - Dynamic X-axis domain based on filter */}
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Business Impact"
                  domain={[0, 150]}
                  ticks={[0, 30, 60, 90, 120, 150]}
                  label={{ 
                    value: "Business Impact (0-150) →", 
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
                    value: "Implementation Effort →", 
                    angle: -90, 
                    position: 'left',
                    offset: 40,
                    className: "fill-foreground text-sm"
                  }}
                  tick={{ className: "fill-muted-foreground text-xs" }}
                />

                {/* Quadrant dividers - Fixed at 75 (midpoint of 0-150 scale) */}
                <ReferenceLine 
                  x={75} 
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
                <text x="33%" y="67%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                  Nice-to-Have
                </text>
                <text x="75%" y="67%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                  Quick Wins
                </text>
                <text x="33%" y="25%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                  Deprioritize
                </text>
                <text x="75%" y="25%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                  Strategic Bets
                </text>

                <Tooltip content={<CustomTooltip />} />

                {/* Data points - use displayData for smooth transitions */}
                <Scatter 
                  data={displayData} 
                  onClick={handleClick}
                  className="cursor-pointer"
                >
                  {displayData.map((entry) => (
                    <Cell 
                      key={entry.id} 
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                  <LabelList 
                    dataKey="name" 
                    position="top" 
                    offset={12}
                    className="fill-foreground text-[10px] font-medium"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  />
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        {workflowLegend.length > 0 && (
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
      </CardContent>
    </Card>
  );
}
