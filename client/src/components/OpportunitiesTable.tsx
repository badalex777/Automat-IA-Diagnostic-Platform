import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ImplementationOpportunity, WorkflowConsolidation } from "@shared/schema";
import { calculateConsolidatedMetrics, calculateConsolidationBusinessImpact } from "@shared/consolidationCalculations";
import { calculateImplementationEffort, type CompanyContext } from "@shared/opportunityCalculations";

interface OpportunitiesTableProps {
  opportunities: Array<ImplementationOpportunity & {
    baseImpact: number;
    effortScore: number;
    linkedStep?: { stepName: string };
  }>;
  consolidations: WorkflowConsolidation[];
  workflowName: string;
  readinessScores: Record<string, number>;
  companyContext?: CompanyContext;
  onOpportunityClick?: (opportunity: ImplementationOpportunity) => void;
  onConsolidationClick?: (consolidation: WorkflowConsolidation) => void;
}

export default function OpportunitiesTable({
  opportunities,
  consolidations,
  workflowName,
  readinessScores,
  companyContext,
  onOpportunityClick,
  onConsolidationClick
}: OpportunitiesTableProps) {
  const [expandedConsolidations, setExpandedConsolidations] = useState<Set<string>>(new Set());

  const toggleConsolidation = (consolidationId: string) => {
    const newExpanded = new Set(expandedConsolidations);
    if (newExpanded.has(consolidationId)) {
      newExpanded.delete(consolidationId);
    } else {
      newExpanded.add(consolidationId);
    }
    setExpandedConsolidations(newExpanded);
  };

  // Calculate consolidation metrics for display
  const consolidationsWithMetrics = consolidations.map(consolidation => {
    const constituentOpps = opportunities.filter(opp => 
      consolidation.opportunityIds.includes(opp.id)
    );
    
    if (constituentOpps.length === 0) {
      return {
        ...consolidation,
        businessImpact: 0,
        implementationEffort: 0,
        constituentOpps: []
      };
    }

    const metrics = calculateConsolidatedMetrics(constituentOpps);
    
    // Calculate average readiness from constituent opportunities' steps
    const stepReadinessValues = constituentOpps
      .map(opp => opp.stepId ? readinessScores[opp.stepId] || 0 : 0);
    const avgReadiness = stepReadinessValues.length > 0
      ? stepReadinessValues.reduce((sum, score) => sum + score, 0) / stepReadinessValues.length
      : 0;
    
    // Calculate implementation effort using consolidated weighted metrics
    const implementationEffort = calculateImplementationEffort(
      avgReadiness,
      metrics.weightedAvgRampupPeriodMonths,
      metrics.weightedAvgPaybackPeriodMonths,
      metrics.weightedAvgTrainingHoursPerEmployee
    );

    // Calculate business impact using centralized logic for consistency
    const businessImpact = calculateConsolidationBusinessImpact(metrics, companyContext);

    return {
      ...consolidation,
      businessImpact,
      implementationEffort,
      constituentOpps,
      metrics
    };
  });

  // Combine and sort all items by business impact (descending)
  const allItems = [
    ...opportunities.map(opp => ({ type: 'opportunity' as const, data: opp })),
    ...consolidationsWithMetrics.map(cons => ({ type: 'consolidation' as const, data: cons }))
  ].sort((a, b) => {
    const impactA = a.type === 'opportunity' ? a.data.baseImpact : a.data.businessImpact;
    const impactB = b.type === 'opportunity' ? b.data.baseImpact : b.data.businessImpact;
    return impactB - impactA;
  });

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Business Impact</TableHead>
            <TableHead className="text-right">Implementation Effort</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allItems.map((item, index) => {
            if (item.type === 'opportunity') {
              const opp = item.data;
              return (
                <TableRow 
                  key={`opp-${opp.id}`} 
                  data-testid={`table-row-opportunity-${opp.id}`}
                  className="cursor-pointer hover-elevate"
                  onClick={() => onOpportunityClick?.(opp)}
                >
                  <TableCell></TableCell>
                  <TableCell className="font-medium">{opp.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">Opportunity</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {opp.linkedStep?.stepName || 'N/A'}
                  </TableCell>
                  <TableCell className="text-right font-mono">{opp.baseImpact.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-mono">{opp.effortScore.toFixed(2)}</TableCell>
                </TableRow>
              );
            } else {
              const cons = item.data;
              const isExpanded = expandedConsolidations.has(cons.id);
              
              return (
                <>
                  <TableRow 
                    key={`cons-${cons.id}`}
                    data-testid={`table-row-consolidation-${cons.id}`}
                    className="bg-muted/30 hover-elevate cursor-pointer"
                    onClick={() => onConsolidationClick?.(cons)}
                  >
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleConsolidation(cons.id);
                        }}
                        data-testid={`button-toggle-consolidation-${cons.id}`}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-semibold">{cons.name}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="text-xs">Consolidation</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cons.constituentOpps.length} opportunities
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {cons.businessImpact.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {cons.implementationEffort.toFixed(2)}
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded constituent opportunities */}
                  {isExpanded && cons.constituentOpps.map((constOpp, idx) => (
                    <TableRow
                      key={`cons-${cons.id}-opp-${constOpp.id}`}
                      className="bg-muted/10"
                      data-testid={`table-row-constituent-${constOpp.id}`}
                    >
                      <TableCell className="pl-12 text-muted-foreground text-xs">
                        {idx + 1}.
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {constOpp.name}
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {constOpp.linkedStep?.stepName || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {constOpp.baseImpact.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm text-muted-foreground">
                        {constOpp.effortScore.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              );
            }
          })}
          
          {allItems.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No opportunities or consolidations to display
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
