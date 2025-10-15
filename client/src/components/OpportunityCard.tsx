import type { ImplementationOpportunity } from "@shared/schema";
import { calculateOpportunityScore, type ToggleState } from "@shared/opportunityCalculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, DollarSign, Clock, Users } from "lucide-react";

interface OpportunityCardProps {
  opportunity: ImplementationOpportunity;
  readinessScore: number;
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
  onEdit,
  onDelete,
}: OpportunityCardProps) {
  // Use per-opportunity toggle state
  const toggles: ToggleState = {
    errorMetrics: opportunity.errorMetricsEnabled ?? false,
    revenueMetrics: opportunity.revenueMetricsEnabled ?? false,
  };
  
  const score = calculateOpportunityScore(opportunity, readinessScore, toggles);
  
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
              <span className="text-xs">Hours Saved</span>
            </div>
            <p className="text-sm font-semibold" data-testid={`text-hours-${opportunity.id}`}>
              {formatNumber(opportunity.annualHoursSaved, 0)}
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span className="text-xs">FTE Savings</span>
            </div>
            <p className="text-sm font-semibold" data-testid={`text-fte-${opportunity.id}`}>
              {formatNumber(opportunity.fteSavings)}
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
            <p className="text-xs text-muted-foreground">Ease of Implementation</p>
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
