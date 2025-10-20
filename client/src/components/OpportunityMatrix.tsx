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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
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

  // Determine max X-axis scale based on filter (100/125/150)
  const maxImpactScale = useMemo(() => {
    // Calculate what max scale we need based on filter type
    let hasError = false;
    let hasRevenue = false;
    
    const filteredOpps = filterOpportunitiesByMetrics(opportunities, filterType);
    filteredOpps.forEach(opp => {
      if (opp.errorMetricsEnabled) hasError = true;
      if (opp.revenueMetricsEnabled) hasRevenue = true;
    });
    
    return getFilterMaxScore({ errorMetrics: hasError, revenueMetrics: hasRevenue });
  }, [opportunities, filterType]);

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
      
      // Determine quadrant using filter-specific max scale
      const toggles: ToggleState = {
        errorMetrics: opp.errorMetricsEnabled || false,
        revenueMetrics: opp.revenueMetricsEnabled || false
      };
      const oppMaxScale = getFilterMaxScore(toggles);
      const quadrant = getQuadrant(implementationEffort, enhancedImpact, oppMaxScale);
      
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
              Reweighted scoring with dynamic scale ({maxImpactScale === 150 ? 'All 3 Metrics: 0-150' : maxImpactScale === 125 ? 'Two Metrics: 0-125' : 'Base Only: 0-100'})
            </p>
          </div>
          <Select value={filterType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[240px]" data-testid="select-matrix-filter">
              <SelectValue placeholder={t.labels.filterByMetrics} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-opportunities" data-testid="filter-all-opportunities">
                {t.labels.allOpportunities}
              </SelectItem>
              <SelectItem value="time-only" data-testid="filter-time-only">
                {t.opportunities.filters.timeOnly}
              </SelectItem>
              <SelectItem value="time-error" data-testid="filter-time-error">
                {t.opportunities.filters.timeError}
              </SelectItem>
              <SelectItem value="time-revenue" data-testid="filter-time-revenue">
                {t.opportunities.filters.timeRevenue}
              </SelectItem>
              <SelectItem value="all-three" data-testid="filter-all-three">
                {t.opportunities.filters.allThree}
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
                  name={t.matrix.xAxis}
                  domain={[0, maxImpactScale]}
                  ticks={maxImpactScale === 150 ? [0, 30, 60, 90, 120, 150] : maxImpactScale === 125 ? [0, 25, 50, 75, 100, 125] : [0, 25, 50, 75, 100]}
                  label={{ 
                    value: `${t.matrix.xAxis} (0-${maxImpactScale}) →`, 
                    position: 'bottom',
                    offset: 40,
                    className: "fill-foreground text-sm"
                  }}
                  tick={{ className: "fill-muted-foreground text-xs" }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name={t.matrix.yAxis}
                  domain={[0, 100]}
                  label={{ 
                    value: `${t.matrix.yAxis} →`, 
                    angle: -90, 
                    position: 'left',
                    offset: 40,
                    className: "fill-foreground text-sm"
                  }}
                  tick={{ className: "fill-muted-foreground text-xs" }}
                />

                {/* Quadrant dividers - Dynamic midpoint based on max scale */}
                <ReferenceLine 
                  x={maxImpactScale / 2} 
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
                  {t.matrix.quadrants.lowHanging}
                </text>
                <text x="75%" y="75%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                  {t.matrix.quadrants.quickWins}
                </text>
                <text x="25%" y="25%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                  {t.matrix.quadrants.maybeNever}
                </text>
                <text x="75%" y="25%" textAnchor="middle" className="fill-muted-foreground text-sm font-medium">
                  {t.matrix.quadrants.strategicBets}
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
