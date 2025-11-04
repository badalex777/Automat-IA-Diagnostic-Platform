import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
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
import type { ImplementationOpportunity, Workflow, WorkflowStep } from "@shared/schema";
import { calculateBaseImpact, calculateImplementationEffort } from "@shared/opportunityCalculations";
import type { CompanyContext } from "@shared/opportunityCalculations";

interface OpportunitiesDataTableProps {
  opportunities: ImplementationOpportunity[];
  workflows: Workflow[];
  workflowSteps?: WorkflowStep[];
  readinessScores: Record<string, number>;
  companyContext: CompanyContext;
  matrixType: 'base' | 'enhanced';
}

type SortOption = 
  | 'impact-high'
  | 'impact-low'
  | 'effort-high'
  | 'effort-low'
  | 'workflow'
  | 'roadmap';

export function OpportunitiesDataTable({
  opportunities,
  workflows,
  workflowSteps = [],
  readinessScores,
  companyContext,
  matrixType,
}: OpportunitiesDataTableProps) {
  const [sortBy, setSortBy] = useState<SortOption>('roadmap');

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

  // Calculate scores and enrich opportunities
  const enrichedOpportunities = useMemo(() => {
    return opportunities.map(opp => {
      const readinessScore = opp.stepId ? (readinessScores[opp.stepId] || 0) : 0;
      const baseImpact = calculateBaseImpact(opp, companyContext);
      const effortScore = calculateImplementationEffort(
        readinessScore,
        parseFloat(opp.rampupPeriodMonths || "0"),
        parseFloat(opp.paybackPeriodMonths || "0"),
        parseFloat(opp.trainingHoursPerEmployee || "0")
      );
      
      const workflow = workflows.find(w => w.id === opp.workflowId);
      const linkedStep = workflowSteps.find(s => s.id === opp.stepId);
      
      return {
        ...opp,
        workflow,
        linkedStep,
        readinessScore,
        baseImpact,
        effortScore,
      };
    });
  }, [opportunities, readinessScores, workflows, workflowSteps, companyContext]);

  // Sort opportunities
  const sortedOpportunities = useMemo(() => {
    const sorted = [...enrichedOpportunities];
    
    // Calculate max values with zero-protection for roadmap sorting
    const maxImpact = sorted.length > 0 
      ? Math.max(...sorted.map(o => o.baseImpact), 0.001) // Guard against zero
      : 1;
    const maxEffort = sorted.length > 0 
      ? Math.max(...sorted.map(o => o.effortScore), 0.001) // Guard against zero
      : 1;
    
    switch (sortBy) {
      case 'impact-high':
        return sorted.sort((a, b) => b.baseImpact - a.baseImpact);
      case 'impact-low':
        return sorted.sort((a, b) => a.baseImpact - b.baseImpact);
      case 'effort-high':
        return sorted.sort((a, b) => b.effortScore - a.effortScore);
      case 'effort-low':
        return sorted.sort((a, b) => a.effortScore - b.effortScore);
      case 'workflow':
        // Compare each opportunity's associated workflow name, fall back to opportunity name
        return sorted.sort((a, b) => {
          const workflowComparison = (a.workflow?.name || '').localeCompare(b.workflow?.name || '');
          return workflowComparison !== 0 ? workflowComparison : a.name.localeCompare(b.name);
        });
      case 'roadmap':
        // Roadmap prioritization: high impact + low effort = quick wins (higher priority)
        // Priority score = (normalized impact) - (normalized effort)
        // Higher score = better opportunity (quick win)
        return sorted.sort((a, b) => {
          const aPriority = (a.baseImpact / maxImpact) - (a.effortScore / maxEffort);
          const bPriority = (b.baseImpact / maxImpact) - (b.effortScore / maxEffort);
          
          return bPriority - aPriority;
        });
      default:
        return sorted;
    }
  }, [enrichedOpportunities, sortBy]);

  // Get color for business impact score (green = good, red = bad)
  const getImpactColor = (score: number) => {
    const maxImpact = Math.max(...enrichedOpportunities.map(o => o.baseImpact));
    const normalized = maxImpact > 0 ? (score / maxImpact) * 100 : 0;
    
    if (normalized >= 75) return 'text-green-700 dark:text-green-400 font-semibold';
    if (normalized >= 50) return 'text-green-600 dark:text-green-500';
    if (normalized >= 25) return 'text-yellow-600 dark:text-yellow-500';
    return 'text-red-600 dark:text-red-500';
  };

  // Get color for implementation effort score (green = low effort/good, red = high effort/bad)
  const getEffortColor = (score: number) => {
    const maxEffort = Math.max(...enrichedOpportunities.map(o => o.effortScore));
    const normalized = maxEffort > 0 ? (score / maxEffort) * 100 : 0;
    
    // Inverse: lower effort is better (green), higher effort is worse (red)
    if (normalized >= 75) return 'text-red-600 dark:text-red-500';
    if (normalized >= 50) return 'text-yellow-600 dark:text-yellow-500';
    if (normalized >= 25) return 'text-green-600 dark:text-green-500';
    return 'text-green-700 dark:text-green-400 font-semibold';
  };

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Opportunities Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {matrixType === 'base' ? 'Base Impact' : 'Enhanced Impact'} analysis with {sortedOpportunities.length} opportunities
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[220px]" data-testid="select-sort-opportunities">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="roadmap">Roadmap Priority</SelectItem>
              <SelectItem value="impact-high">Highest Business Impact</SelectItem>
              <SelectItem value="impact-low">Lowest Business Impact</SelectItem>
              <SelectItem value="effort-low">Lowest Implementation Effort</SelectItem>
              <SelectItem value="effort-high">Highest Implementation Effort</SelectItem>
              <SelectItem value="workflow">Sort by Workflow</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opportunity Name</TableHead>
              <TableHead>Source Workflow</TableHead>
              <TableHead>Source Step</TableHead>
              <TableHead className="text-right">Business Impact</TableHead>
              <TableHead className="text-right">Implementation Effort</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedOpportunities.map((opp) => {
              const colors = opp.workflow ? workflowColors[opp.workflow.id] : null;
              
              return (
                <TableRow 
                  key={opp.id} 
                  className={`${colors?.bg || ''} border-l-4 ${colors?.border || 'border-l-transparent'}`}
                  data-testid={`table-row-opportunity-${opp.id}`}
                >
                  <TableCell className="font-medium">{opp.name}</TableCell>
                  <TableCell>{opp.workflow?.name || 'N/A'}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {opp.linkedStep?.stepName || 'N/A'}
                  </TableCell>
                  <TableCell className={`text-right font-mono tabular-nums ${getImpactColor(opp.baseImpact)}`}>
                    {opp.baseImpact.toFixed(2)}
                  </TableCell>
                  <TableCell className={`text-right font-mono tabular-nums ${getEffortColor(opp.effortScore)}`}>
                    {opp.effortScore.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      
      {sortBy === 'roadmap' && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold">18-Month Roadmap:</span> Opportunities prioritized by quick wins (high impact, low effort) first, followed by strategic implementations. 
            Top items are recommended for immediate action.
          </p>
        </div>
      )}
    </Card>
  );
}
