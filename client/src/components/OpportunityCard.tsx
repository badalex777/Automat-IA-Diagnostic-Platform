import type { ImplementationOpportunity } from "@shared/schema";
import { calculateOpportunityScore, normalizeBusinessImpactToDisplay, type ToggleState, type CompanyContext } from "@shared/opportunityCalculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, DollarSign, Clock, Users, TrendingUp, AlertTriangle } from "lucide-react";

interface OpportunityCardProps {
  opportunity: ImplementationOpportunity;
  readinessScore: number;
  companyId?: string;
  companyContext?: CompanyContext;
  onEdit?: () => void;
  onDelete?: () => void;
}

const quadrantColors = {
  "Quick Wins": "bg-green-500/10 text-green-700 dark:text-green-400",
  "Strategic Goals": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "Nice-To-Haves": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "Deprioritize": "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function OpportunityCard({
  opportunity,
  readinessScore,
  companyId,
  companyContext,
  onEdit,
  onDelete,
}: OpportunityCardProps) {
  const { toast } = useToast();
  
  // Use per-opportunity toggle state
  const toggles: ToggleState = {
    errorMetrics: opportunity.errorMetricsEnabled ?? false,
    revenueMetrics: opportunity.revenueMetricsEnabled ?? false,
  };
  
  // Calculate raw score (0-160 internal range)
  const rawScore = calculateOpportunityScore(opportunity, readinessScore, toggles, companyContext, true);
  
  // Normalize business impact for display (0-100 range)
  const normalizedBusinessImpact = normalizeBusinessImpactToDisplay(rawScore.businessImpact);
  
  // Final score with normalized business impact
  const score = {
    ...rawScore,
    businessImpact: normalizedBusinessImpact,
  };
  
  // Mutation to update toggle states
  const updateToggleMutation = useMutation({
    mutationFn: async (updates: { errorMetricsEnabled?: boolean; revenueMetricsEnabled?: boolean }) => {
      return apiRequest("PATCH", `/api/opportunities/${opportunity.id}`, updates);
    },
    onSuccess: () => {
      // Invalidate company opportunities query
      if (companyId) {
        queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/opportunities`] });
      }
      // Invalidate workflow opportunities query
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${opportunity.workflowId}/opportunities`] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error saving changes",
      });
    },
  });
  
  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return "-";
    const num = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (value: string | null | undefined, decimals = 1) => {
    if (!value) return "-";
    return parseFloat(value).toFixed(decimals);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-opportunity-${opportunity.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base line-clamp-1">{opportunity.name}</CardTitle>
            {opportunity.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {opportunity.description}
              </CardDescription>
            )}
          </div>
          <Badge 
            className={quadrantColors[score.quadrant]}
            data-testid={`badge-quadrant-${opportunity.id}`}
          >
            {score.quadrant}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="w-3 h-3" />
              <span className="text-xs">Annual ROI</span>
            </div>
            <p className="text-sm font-semibold" data-testid={`text-roi-${opportunity.id}`}>
              {formatCurrency(opportunity.annualRoi)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="text-xs">Hours/Week</span>
            </div>
            <p className="text-sm font-semibold" data-testid={`text-hours-${opportunity.id}`}>
              {formatNumber(opportunity.hoursSavedPerWeek, 1)} hrs
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span className="text-xs">FTE Saved</span>
            </div>
            <p className="text-sm font-semibold" data-testid={`text-fte-${opportunity.id}`}>
              {formatNumber(opportunity.fteSavings, 2)} FTE
            </p>
          </div>
        </div>

        {/* Scores */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Business Impact</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${score.businessImpact}%` }}
                />
              </div>
              <span className="text-xs font-medium" data-testid={`text-impact-score-${opportunity.id}`}>
                {score.businessImpact.toFixed(0)}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Implementation Effort</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${100 - score.implementationEffort}%` }}
                />
              </div>
              <span className="text-xs font-medium" data-testid={`text-effort-score-${opportunity.id}`}>
                {(100 - score.implementationEffort).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Metric Toggles */}
        {(opportunity.errorReductionPct || opportunity.revenueUpliftAnnual) && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground">Enable Error Metrics</p>
            
            {opportunity.errorReductionPct && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs">Error Reduction</span>
                </div>
                <Switch
                  checked={opportunity.errorMetricsEnabled ?? false}
                  onCheckedChange={(checked) => 
                    updateToggleMutation.mutate({ errorMetricsEnabled: checked })
                  }
                  disabled={updateToggleMutation.isPending}
                  data-testid={`switch-error-${opportunity.id}`}
                />
              </div>
            )}
            
            {opportunity.revenueUpliftAnnual && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs">Revenue Uplift</span>
                </div>
                <Switch
                  checked={opportunity.revenueMetricsEnabled ?? false}
                  onCheckedChange={(checked) => 
                    updateToggleMutation.mutate({ revenueMetricsEnabled: checked })
                  }
                  disabled={updateToggleMutation.isPending}
                  data-testid={`switch-revenue-${opportunity.id}`}
                />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex-1"
                data-testid={`button-edit-${opportunity.id}`}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="flex-1"
                data-testid={`button-delete-${opportunity.id}`}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
