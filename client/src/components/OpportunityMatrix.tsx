import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import type { ImplementationOpportunity, Workflow, WorkflowConsolidation } from "@shared/schema";
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
import { 
  calculateConsolidatedMetrics,
  calculateConsolidationBusinessImpact,
  computeConsolidatedReadiness,
  getConsolidatedImplementationInputs
} from "@shared/consolidationCalculations";
import { type MatrixViewMode, MATRIX_VIEW_OPTIONS } from "@/lib/opportunityViewMode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OpportunityMatrixProps {
  opportunities: ImplementationOpportunity[];
  workflows: Workflow[]; // Workflow data for name mapping
  readinessScores: Record<string, number>; // stepId -> readiness score
  consolidations?: WorkflowConsolidation[]; // Workflow consolidations to display
  workflowColors?: Record<string, string>; // workflowId -> color
  companyContext?: CompanyContext; // Company financial context for normalized scoring
  viewMode: MatrixViewMode; // External view mode control
  onViewModeChange: (mode: MatrixViewMode) => void; // View mode change callback
  onOpportunityClick?: (opportunity: ImplementationOpportunity) => void;
  onConsolidationClick?: (consolidation: WorkflowConsolidation) => void;
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
  isConsolidation?: boolean; // Flag for visual differentiation
}

interface LabelPosition {
  id: string;
  x: number; // pixel position
  y: number; // pixel position
  text: string;
  originalY: number; // original pixel position before adjustment
}

export default function OpportunityMatrix({ 
  opportunities, 
  workflows,
  readinessScores,
  consolidations = [],
  workflowColors,
  companyContext,
  viewMode,
  onViewModeChange,
  onOpportunityClick,
  onConsolidationClick 
}: OpportunityMatrixProps) {
  const [filterType, setFilterType] = useState<MatrixFilterType>("all-opportunities");
  const [displayData, setDisplayData] = useState<DataPoint[]>([]);
  const [labelPositions, setLabelPositions] = useState<LabelPosition[]>([]);
  const [chartDimensions, setChartDimensions] = useState({ width: 500, height: 450 });
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Measure actual chart dimensions for accurate collision detection
  useEffect(() => {
    const measureChart = () => {
      if (chartContainerRef.current) {
        const { width, height } = chartContainerRef.current.getBoundingClientRect();
        // Account for chart margins (top: 20, right: 20, bottom: 60, left: 60)
        const chartWidth = width - 80; // left (60) + right (20)
        const chartHeight = height - 80; // top (20) + bottom (60)
        setChartDimensions({ width: chartWidth, height: chartHeight });
      }
    };

    // Measure on mount
    measureChart();

    // Remeasure on window resize
    window.addEventListener('resize', measureChart);
    return () => window.removeEventListener('resize', measureChart);
  }, []);

  // Build stable color map based on ALL workflows (opportunities AND consolidations)
  // Sort workflow IDs to ensure stable color assignment even when data changes
  const colorMap = useMemo(() => {
    const allWorkflows = Array.from(new Set([
      ...opportunities.map(o => o.workflowId),
      ...consolidations.map(c => c.workflowId)
    ]));
    // Sort by ID to ensure consistent ordering and stable colors
    allWorkflows.sort();
    const colors: Record<string, string> = {};
    
    allWorkflows.forEach((workflowId, index) => {
      colors[workflowId] = workflowColors?.[workflowId] || WORKFLOW_COLORS[index % WORKFLOW_COLORS.length];
    });
    
    return colors;
  }, [opportunities, consolidations, workflowColors]);

  // Enhanced Impact Matrix always uses 0-150 scale (supports all 3 metrics)
  // Individual opportunities may score lower if their bonuses are toggled off
  const maxImpactScale = 150;

  const { dataPoints, workflowLegend } = useMemo(() => {
    const workflowMap = (workflows ?? []).reduce((acc, w) => {
      acc[w.id] = w.name;
      return acc;
    }, {} as Record<string, string>);

    const points: DataPoint[] = [];

    // Add individual opportunities based on viewMode
    if (viewMode !== 'consolidations-only') {
      // Filter opportunities based on selected filter
      const filteredOpps = filterOpportunitiesByMetrics(opportunities, filterType);

      // Calculate scores for filtered opportunities
      filteredOpps.forEach(opp => {
        // Use step-level readiness score for positioning (opportunities are always linked to steps)
        const readinessScore = opp.stepId ? readinessScores[opp.stepId] : 0;
        
        const implementationEffort = calculateImplementationEffort(
          readinessScore || 0,
          parseFloat(opp.rampupPeriodMonths || "0"),
          parseFloat(opp.paybackPeriodMonths || "0"),
          parseFloat(opp.trainingHoursPerEmployee || "0")
        );

        // Calculate ENHANCED impact (respects per-opportunity toggles, uses reweighting)
        const enhancedImpact = calculateBusinessImpactForFilter(opp, filterType, companyContext);
        
        // Determine quadrant using fixed 150 scale (Enhanced Impact Matrix uses full capability scale)
        const quadrant = getQuadrant(implementationEffort, enhancedImpact, 150);
        
        points.push({
          id: opp.id,
          name: opp.name,
          workflowId: opp.workflowId,
          workflowName: workflowMap[opp.workflowId] || "Unknown",
          x: enhancedImpact,
          y: implementationEffort,
          quadrant,
          color: colorMap[opp.workflowId],
          isConsolidation: false,
        });
      });
    }

    // Add consolidation data points based on viewMode
    if (viewMode !== 'opportunities-only') {
      consolidations.forEach(consolidation => {
        // Get constituent opportunities
        const constituentOpps = opportunities.filter(opp => 
          consolidation.opportunityIds.includes(opp.id)
        );
        
        if (constituentOpps.length === 0) return;

        // Calculate aggregated metrics with buffers
        const metrics = calculateConsolidatedMetrics(constituentOpps);
        
        // Calculate FTE-weighted readiness (same as base matrix)
        const consolidatedReadiness = computeConsolidatedReadiness(constituentOpps, readinessScores);
        
        // Get implementation effort inputs with coordination buffers
        const effortInputs = getConsolidatedImplementationInputs(metrics, consolidatedReadiness);
        
        // Calculate implementation effort using consolidated weighted metrics
        const implementationEffort = calculateImplementationEffort(
          effortInputs.readinessScore,
          effortInputs.rampupMonths,
          effortInputs.paybackMonths,
          effortInputs.trainingHours
        );

        // Calculate ENHANCED business impact (includes error/revenue bonuses)
        const businessImpact = calculateConsolidationBusinessImpact(metrics, companyContext);
        
        const quadrant = getQuadrant(implementationEffort, businessImpact, 150);
        
        // Use workflow color from consolidation's workflowId
        const workflowId = consolidation.workflowId;
        
        points.push({
          id: consolidation.id,
          name: consolidation.name,
          workflowId: workflowId,
          workflowName: workflowMap[workflowId] || "Unknown",
          x: businessImpact,
          y: implementationEffort,
          quadrant,
          color: colorMap[workflowId],
          isConsolidation: true,
        });
      });
    }

    // Create legend from all unique workflows (both opportunities and consolidations)
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
  }, [opportunities, workflows, readinessScores, colorMap, companyContext, filterType, viewMode, consolidations]);

  // Collision detection function - works in data space with proper scaling
  const detectCollision = useCallback((pos1: { x: number; y: number; text: string }, pos2: { x: number; y: number; text: string }) => {
    // Chart dimensions: x-axis 0-150, y-axis 0-100
    // Use actual measured chart dimensions for accurate pixel-to-data conversion
    
    // Convert pixel-based label dimensions to data space using actual chart size
    const pixelToDataX = 150 / chartDimensions.width;
    const pixelToDataY = 100 / chartDimensions.height;
    
    // Estimate label dimensions in pixels, then convert to data space
    const estimateWidthPixels = (text: string) => Math.min(text.length * 6 + 10, 120);
    const labelHeightPixels = 18; // label height + small gap
    
    const width1Data = estimateWidthPixels(pos1.text) * pixelToDataX;
    const width2Data = estimateWidthPixels(pos2.text) * pixelToDataX;
    const labelHeightData = labelHeightPixels * pixelToDataY;

    // Check for overlap using bounding boxes in data space
    const horizontalOverlap = Math.abs(pos1.x - pos2.x) < (width1Data + width2Data) / 2;
    const verticalOverlap = Math.abs(pos1.y - pos2.y) < labelHeightData;

    return horizontalOverlap && verticalOverlap;
  }, [chartDimensions]);

  // Handle display data updates with collision-aware label positioning
  useEffect(() => {
    // Update display data
    setDisplayData(dataPoints);

    // No data - clear label positions
    if (dataPoints.length === 0) {
      setLabelPositions([]);
      return;
    }

    // Calculate label positions with collision avoidance
    // We work in data coordinate space (0-150 for x, 0-100 for y)
    const positions: LabelPosition[] = dataPoints.map(point => ({
      id: point.id,
      x: point.x,
      y: point.y, // will be adjusted if collisions detected
      text: point.name,
      originalY: point.y,
    }));

    // Sort by y-coordinate (lower values = higher on chart = should take priority)
    positions.sort((a, b) => a.y - b.y);

    // Detect and resolve collisions by shifting labels vertically
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        if (detectCollision(positions[i], positions[j])) {
          // Shift the lower label down by 8 units in data space
          // Clamp to chart bounds (Y max = 100)
          const newY = Math.min(positions[j].y + 8, 100);
          positions[j].y = newY;
        }
      }
    }

    setLabelPositions(positions);
  }, [dataPoints, detectCollision]);

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
    if (data) {
      if (data.isConsolidation && onConsolidationClick) {
        const consolidation = consolidations.find(c => c.id === data.id);
        if (consolidation) {
          onConsolidationClick(consolidation);
        }
      } else if (onOpportunityClick) {
        const opportunity = opportunities.find(o => o.id === data.id);
        if (opportunity) {
          onOpportunityClick(opportunity);
        }
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
          <div className="flex items-center gap-4">
            {consolidations.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">View:</span>
                <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as MatrixViewMode)}>
                  <SelectTrigger className="w-[220px]" data-testid="select-enhanced-matrix-view">
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div 
            ref={chartContainerRef}
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
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload) return <></>;
                    
                    // Larger size for consolidations
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
                />

                {/* Custom labels with collision avoidance - invisible scatter for coordinate mapping */}
                <Scatter 
                  data={labelPositions}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload) return <></>;

                    const dataPoint = displayData.find(d => d.id === payload.id);
                    if (!dataPoint) return <></>;

                    // Check if label was adjusted (moved from original position)
                    const wasAdjusted = Math.abs(payload.y - payload.originalY) > 1;

                    // For connector line, we need the original point's pixel position
                    // Since we can't easily get it from Recharts, we'll calculate approximate position
                    // based on the same data-to-pixel conversion Recharts uses
                    // Chart area: 500px width for 0-150 domain, 450px height for 0-100 domain
                    const chartLeft = 60; // approximate left margin
                    const chartBottom = 440; // approximate bottom position (inverted y-axis)
                    const xScale = 500 / 150;
                    const yScale = 450 / 100;
                    
                    const originalPointX = chartLeft + dataPoint.x * xScale;
                    const originalPointY = chartBottom - dataPoint.y * yScale;

                    return (
                      <g>
                        {/* Connector line from original point to adjusted label when repositioned */}
                        {wasAdjusted && (
                          <line
                            x1={originalPointX}
                            y1={originalPointY}
                            x2={cx}
                            y2={cy - 12}
                            stroke="hsl(var(--muted-foreground))"
                            strokeWidth={1}
                            strokeDasharray="2,2"
                            opacity={0.4}
                            style={{ pointerEvents: 'none' }}
                          />
                        )}
                        {/* Label text at adjusted position */}
                        <text
                          x={cx}
                          y={cy - 12} // offset above the adjusted position
                          textAnchor="middle"
                          className="fill-foreground text-[10px] font-medium"
                          style={{ pointerEvents: 'none', userSelect: 'none' }}
                        >
                          {payload.text}
                        </text>
                      </g>
                    );
                  }}
                  isAnimationActive={false}
                />
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
