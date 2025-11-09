import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ImplementationOpportunity, Workflow, WorkflowStep, WorkflowConsolidation } from "@shared/schema";
import { calculateBaseImpact, calculateEnhancedImpact, calculateImplementationEffort } from "@shared/opportunityCalculations";
import type { CompanyContext } from "@shared/opportunityCalculations";
import {
  calculateConsolidatedMetrics,
  calculateConsolidationBusinessImpact,
  calculateConsolidatedBaseImpact,
  type ConsolidatedMetrics,
} from "@shared/consolidationCalculations";
import { type TableViewMode, TABLE_VIEW_OPTIONS } from "@/lib/opportunityViewMode";

interface OpportunitiesDataTableProps {
  opportunities: ImplementationOpportunity[];
  workflows: Workflow[];
  workflowSteps?: WorkflowStep[];
  readinessScores: Record<string, number>;
  companyContext: CompanyContext;
  matrixType: 'base' | 'enhanced';
  consolidations?: WorkflowConsolidation[];
  viewMode: TableViewMode;
  onViewModeChange: (mode: TableViewMode) => void;
}

// Discriminated union for unified table rows
type TableRow =
  | {
      kind: 'opportunity';
      id: string;
      name: string;
      workflowId: string;
      workflow?: Workflow;
      linkedStep?: WorkflowStep;
      displayImpact: number;
      effortScore: number;
      readinessScore: number;
      opportunity: ImplementationOpportunity;
    }
  | {
      kind: 'consolidation';
      id: string;
      name: string;
      workflowId: string;
      workflow?: Workflow;
      displayImpact: number;
      effortScore: number;
      readinessScore: number;
      constituentCount: number;
      consolidation: WorkflowConsolidation;
      constituentOpportunities: ImplementationOpportunity[];
    }
  | {
      kind: 'constituent';
      id: string;
      parentId: string;
      name: string;
      workflowId: string;
      workflow?: Workflow;
      linkedStep?: WorkflowStep;
      displayImpact: number;
      effortScore: number;
      opportunity: ImplementationOpportunity;
    };

export function OpportunitiesDataTable({
  opportunities,
  workflows,
  workflowSteps = [],
  readinessScores,
  companyContext,
  matrixType,
  consolidations = [],
  viewMode,
  onViewModeChange,
}: OpportunitiesDataTableProps) {
  const [expandedConsolidations, setExpandedConsolidations] = useState<Set<string>>(new Set());

  // Workflow colors for visual coding - professional palette
  const workflowColors = useMemo(() => {
    const colors = [
      { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-l-blue-500' },
      { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-l-purple-500' },
      { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-l-emerald-500' },
      { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-l-amber-500' },
      { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-l-rose-500' },
      { bg: 'bg-cyan-50 dark:bg-cyan-950/30', border: 'border-l-cyan-500' },
    ];
    
    const workflowColorMap: Record<string, typeof colors[0]> = {};
    workflows.forEach((workflow, index) => {
      workflowColorMap[workflow.id] = colors[index % colors.length];
    });
    
    return workflowColorMap;
  }, [workflows]);

  // Build unified row array based on viewMode
  const unifiedRows = useMemo((): TableRow[] => {
    const rows: TableRow[] = [];
    
    // Add opportunity rows if viewMode is 'opportunities-only'
    if (viewMode === 'opportunities-only') {
      opportunities.forEach(opp => {
        const readinessScore = opp.stepId ? (readinessScores[opp.stepId] || 0) : 0;
        const baseImpact = calculateBaseImpact(opp, companyContext);
        const enhancedImpact = calculateEnhancedImpact(
          opp, 
          { errorMetrics: true, revenueMetrics: true }, 
          companyContext
        );
        const effortScore = calculateImplementationEffort(
          readinessScore,
          parseFloat(opp.rampupPeriodMonths || "0"),
          parseFloat(opp.paybackPeriodMonths || "0"),
          parseFloat(opp.trainingHoursPerEmployee || "0")
        );
        const workflow = workflows.find(w => w.id === opp.workflowId);
        const linkedStep = workflowSteps.find(s => s.id === opp.stepId);
        const displayImpact = matrixType === 'enhanced' ? enhancedImpact : baseImpact;
        
        rows.push({
          kind: 'opportunity',
          id: opp.id,
          name: opp.name,
          workflowId: opp.workflowId,
          workflow,
          linkedStep,
          displayImpact,
          effortScore,
          readinessScore,
          opportunity: opp,
        });
      });
    }
    
    // Add consolidation rows if viewMode is 'consolidations-only'
    if (viewMode === 'consolidations-only') {
      consolidations.forEach(consolidation => {
        // Get constituent opportunities
        const constituentOpps = opportunities.filter(opp => 
          consolidation.opportunityIds.includes(opp.id)
        );
        
        if (constituentOpps.length === 0) return; // Skip empty consolidations
        
        const workflow = workflows.find(w => w.id === consolidation.workflowId);
        
        // Calculate consolidation metrics using shared calculations
        const metrics = calculateConsolidatedMetrics(constituentOpps);
        
        // Calculate weighted average readiness from constituents
        let totalReadinessWeight = 0;
        let weightedReadinessSum = 0;
        constituentOpps.forEach(opp => {
          if (opp.stepId) {
            const readiness = readinessScores[opp.stepId] || 0;
            const weight = parseFloat(opp.fteSavings?.toString() || '0');
            if (weight > 0) {
              weightedReadinessSum += readiness * weight;
              totalReadinessWeight += weight;
            }
          }
        });
        const consolidationReadiness = totalReadinessWeight > 0 
          ? weightedReadinessSum / totalReadinessWeight 
          : 0;
        
        // Calculate business impact from consolidated metrics (both base and enhanced)
        const baseImpact = calculateConsolidatedBaseImpact(metrics, companyContext);
        const enhancedImpact = calculateConsolidationBusinessImpact(metrics, companyContext);
        const displayImpact = matrixType === 'enhanced' ? enhancedImpact : baseImpact;
        
        // Calculate implementation effort using weighted periods from metrics
        const consolidationEffort = calculateImplementationEffort(
          consolidationReadiness,
          metrics.weightedAvgRampupPeriodMonths,
          metrics.weightedAvgPaybackPeriodMonths,
          metrics.weightedAvgTrainingHoursPerEmployee
        );
        
        rows.push({
          kind: 'consolidation',
          id: consolidation.id,
          name: consolidation.name,
          workflowId: consolidation.workflowId,
          workflow,
          displayImpact,
          effortScore: consolidationEffort,
          readinessScore: consolidationReadiness,
          constituentCount: constituentOpps.length,
          consolidation,
          constituentOpportunities: constituentOpps,
        });
      });
    }
    
    return rows;
  }, [opportunities, consolidations, readinessScores, workflows, workflowSteps, companyContext, matrixType, viewMode]);

  // Sort unified rows using roadmap priority (always)
  const sortedRows = useMemo(() => {
    const sorted = [...unifiedRows];
    
    // Calculate max values with zero-protection for roadmap sorting
    const maxImpact = sorted.length > 0 
      ? Math.max(...sorted.map(r => r.displayImpact), 0.001) // Guard against zero
      : 1;
    const maxEffort = sorted.length > 0 
      ? Math.max(...sorted.map(r => r.effortScore), 0.001) // Guard against zero
      : 1;
    
    // Roadmap prioritization: high impact + low effort = quick wins (higher priority)
    // Priority score = (normalized impact) - (normalized effort)
    // Higher score = better opportunity (quick win)
    return sorted.sort((a, b) => {
      const aPriority = (a.displayImpact / maxImpact) - (a.effortScore / maxEffort);
      const bPriority = (b.displayImpact / maxImpact) - (b.effortScore / maxEffort);
      return bPriority - aPriority;
    });
  }, [unifiedRows]);

  // Get color for business impact score (green = good, red = bad)
  const getImpactColor = (score: number) => {
    // Use displayImpact for max calculation from current rows
    const maxImpact = Math.max(...sortedRows.map(r => r.displayImpact), 0.001);
    const normalized = maxImpact > 0 ? (score / maxImpact) * 100 : 0;
    
    if (normalized >= 75) return 'text-green-700 dark:text-green-400 font-semibold';
    if (normalized >= 50) return 'text-green-600 dark:text-green-500';
    if (normalized >= 25) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-red-600 dark:text-red-500';
  };

  // Get color for implementation effort score (green = low effort/good, red = high effort/bad)
  const getEffortColor = (score: number) => {
    const maxEffort = Math.max(...sortedRows.map(r => r.effortScore), 0.001);
    const normalized = maxEffort > 0 ? (score / maxEffort) * 100 : 0;
    
    // Inverse: lower effort is better (green), higher effort is worse (red)
    if (normalized >= 75) return 'text-red-600 dark:text-red-500';
    if (normalized >= 50) return 'text-yellow-600 dark:text-yellow-500';
    if (normalized >= 25) return 'text-green-600 dark:text-green-500';
    return 'text-green-700 dark:text-green-400 font-semibold';
  };

  // Toggle consolidation expansion
  const toggleConsolidationExpansion = (consolidationId: string) => {
    setExpandedConsolidations(prev => {
      const next = new Set(prev);
      if (next.has(consolidationId)) {
        next.delete(consolidationId);
      } else {
        next.add(consolidationId);
      }
      return next;
    });
  };

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Opportunities Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {matrixType === 'base' ? 'Base Impact' : 'Enhanced Impact'} analysis with {sortedRows.length} items
          </p>
        </div>
        
        {consolidations.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View:</span>
            <Select value={viewMode} onValueChange={(value) => onViewModeChange(value as TableViewMode)}>
              <SelectTrigger className="w-[200px]" data-testid="select-table-view">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TABLE_VIEW_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Source Workflow</TableHead>
              <TableHead>Source Step</TableHead>
              <TableHead className="text-right">Business Impact</TableHead>
              <TableHead className="text-right">Implementation Effort</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.flatMap((row) => {
              const colors = row.workflow ? workflowColors[row.workflow.id] : null;
              const rows: JSX.Element[] = [];
              
              if (row.kind === 'opportunity') {
                rows.push(
                  <TableRow 
                    key={row.id} 
                    className={`${colors?.bg || ''} border-l-4 ${colors?.border || 'border-l-transparent'}`}
                    data-testid={`table-row-opportunity-${row.id}`}
                  >
                    <TableCell className="text-sm text-muted-foreground">Opportunity</TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.workflow?.name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.linkedStep?.stepName || 'N/A'}
                    </TableCell>
                    <TableCell className={`text-right font-mono tabular-nums ${getImpactColor(row.displayImpact)}`}>
                      {row.displayImpact.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right font-mono tabular-nums ${getEffortColor(row.effortScore)}`}>
                      {row.effortScore.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              } else if (row.kind === 'consolidation') {
                const isExpanded = expandedConsolidations.has(row.id);
                
                rows.push(
                  <TableRow 
                    key={row.id} 
                    className={`${colors?.bg || ''} border-l-4 ${colors?.border || 'border-l-transparent'} font-semibold`}
                    data-testid={`table-row-consolidation-${row.id}`}
                  >
                    <TableCell>
                      <button
                        onClick={() => toggleConsolidationExpansion(row.id)}
                        className="flex items-center gap-1 text-sm hover-elevate active-elevate-2"
                        data-testid={`button-expand-consolidation-${row.id}`}
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span>Consolidation ({row.constituentCount})</span>
                      </button>
                    </TableCell>
                    <TableCell className="font-semibold">{row.name}</TableCell>
                    <TableCell>{row.workflow?.name || 'N/A'}</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell className={`text-right font-mono tabular-nums ${getImpactColor(row.displayImpact)}`}>
                      {row.displayImpact.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right font-mono tabular-nums ${getEffortColor(row.effortScore)}`}>
                      {row.effortScore.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
                
                // Render constituent rows if expanded
                if (isExpanded) {
                  row.constituentOpportunities.forEach(opp => {
                    const oppReadiness = opp.stepId ? (readinessScores[opp.stepId] || 0) : 0;
                    const oppBaseImpact = calculateBaseImpact(opp, companyContext);
                    const oppEnhancedImpact = calculateEnhancedImpact(
                      opp,
                      { errorMetrics: true, revenueMetrics: true },
                      companyContext
                    );
                    const oppDisplayImpact = matrixType === 'enhanced' ? oppEnhancedImpact : oppBaseImpact;
                    const oppEffort = calculateImplementationEffort(
                      oppReadiness,
                      parseFloat(opp.rampupPeriodMonths || "0"),
                      parseFloat(opp.paybackPeriodMonths || "0"),
                      parseFloat(opp.trainingHoursPerEmployee || "0")
                    );
                    const linkedStep = workflowSteps.find(s => s.id === opp.stepId);
                    
                    rows.push(
                      <TableRow 
                        key={`constituent-${row.id}-${opp.id}`} 
                        className={`${colors?.bg || 'bg-muted/30'} border-l-4 ${colors?.border || 'border-l-transparent'} opacity-80`}
                        data-testid={`table-row-constituent-${opp.id}`}
                      >
                        <TableCell className="text-sm text-muted-foreground pl-6">Individual Opportunity</TableCell>
                        <TableCell className="pl-6">{opp.name}</TableCell>
                        <TableCell>{row.workflow?.name || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {linkedStep?.stepName || 'N/A'}
                        </TableCell>
                        <TableCell className={`text-right font-mono tabular-nums ${getImpactColor(oppDisplayImpact)}`}>
                          {oppDisplayImpact.toFixed(2)}
                        </TableCell>
                        <TableCell className={`text-right font-mono tabular-nums ${getEffortColor(oppEffort)}`}>
                          {oppEffort.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  });
                }
              }
              
              return rows;
            })}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">18-Month Roadmap:</span> Opportunities prioritized by quick wins (high impact, low effort) first, followed by strategic implementations. 
          Top items are recommended for immediate action.
        </p>
      </div>
    </Card>
  );
}
