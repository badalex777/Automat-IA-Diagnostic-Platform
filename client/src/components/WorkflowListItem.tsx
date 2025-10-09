import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, CheckCircle2, Clock, Circle } from "lucide-react";
import { Link } from "wouter";

type WorkflowStatus = "tfa_only" | "tfa_readiness" | "complete";

interface WorkflowListItemProps {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  tfaScore?: number;
  annualBenefits?: number;
  companyId: string;
}

const statusConfig = {
  tfa_only: { label: "TFA Only", variant: "outline" as const, icon: Circle },
  tfa_readiness: { label: "TFA + Readiness", variant: "secondary" as const, icon: Clock },
  complete: { label: "Complete", variant: "default" as const, icon: CheckCircle2 },
};

const getFeasibilityBand = (score: number) => {
  if (score >= 75) return { label: "High", variant: "default" as const };
  if (score >= 50) return { label: "Moderate", variant: "secondary" as const };
  return { label: "Low", variant: "destructive" as const };
};

export default function WorkflowListItem({
  id,
  name,
  description,
  status,
  tfaScore,
  annualBenefits,
  companyId,
}: WorkflowListItemProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const feasibility = tfaScore !== undefined ? getFeasibilityBand(tfaScore) : null;

  return (
    <div className="border-b border-border last:border-0 py-4" data-testid={`row-workflow-${id}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/company/${companyId}/workflow/${id}`}>
              <h3 className="font-semibold text-base hover:text-primary transition-colors cursor-pointer" data-testid={`text-workflow-name-${id}`}>
                {name}
              </h3>
            </Link>
            <Badge variant={statusInfo.variant} className="gap-1" data-testid={`badge-status-${id}`}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {tfaScore !== undefined && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">TFA Score</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-mono font-semibold" data-testid={`text-tfa-score-${id}`}>{tfaScore}</p>
                {feasibility && <Badge variant={feasibility.variant} className="text-xs">{feasibility.label}</Badge>}
              </div>
            </div>
          )}

          {annualBenefits !== undefined && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Annual Benefits</p>
              <p className="text-lg font-mono font-semibold" data-testid={`text-annual-benefits-${id}`}>
                ${(annualBenefits / 1000).toFixed(0)}K
              </p>
            </div>
          )}

          <Button variant="ghost" size="icon" data-testid={`button-workflow-menu-${id}`}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
