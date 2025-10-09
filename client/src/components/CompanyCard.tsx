import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronRight } from "lucide-react";
import { Link } from "wouter";

interface CompanyCardProps {
  id: string;
  name: string;
  industry: string;
  workflowCount: number;
  completedCount: number;
}

export default function CompanyCard({
  id,
  name,
  industry,
  workflowCount,
  completedCount,
}: CompanyCardProps) {
  const completionRate = workflowCount > 0 ? Math.round((completedCount / workflowCount) * 100) : 0;

  return (
    <Link href={`/company/${id}`}>
      <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all" data-testid={`card-company-${id}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-md bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate" data-testid={`text-company-name-${id}`}>
                {name}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{industry}</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Workflows</p>
              <p className="text-lg font-mono font-semibold" data-testid={`text-workflow-count-${id}`}>
                {workflowCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Complete</p>
              <p className="text-lg font-mono font-semibold" data-testid={`text-completed-count-${id}`}>
                {completedCount}
              </p>
            </div>
          </div>
          <Badge variant={completionRate === 100 ? "default" : completionRate > 0 ? "secondary" : "outline"} data-testid={`badge-completion-${id}`}>
            {completionRate}%
          </Badge>
        </div>
      </Card>
    </Link>
  );
}
