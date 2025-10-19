import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, CheckCircle2, Clock, Circle, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function WorkflowListItem({
  id,
  name,
  description,
  status,
  tfaScore,
  annualBenefits,
  companyId,
}: WorkflowListItemProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const statusConfig = {
    tfa_only: { label: t.workflow.tfaOnly, variant: "outline" as const, icon: Circle },
    tfa_readiness: { label: t.workflow.tfaReadiness, variant: "secondary" as const, icon: Clock },
    complete: { label: t.workflow.complete, variant: "default" as const, icon: CheckCircle2 },
  };

  const getFeasibilityBand = (score: number) => {
    if (score >= 75) return { label: t.tfa.feasibilityBands.high, variant: "default" as const };
    if (score >= 50) return { label: t.tfa.feasibilityBands.moderate, variant: "secondary" as const };
    return { label: t.tfa.feasibilityBands.low, variant: "destructive" as const };
  };

  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const feasibility = tfaScore !== undefined ? getFeasibilityBand(tfaScore) : null;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/workflows/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/workflows`] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}`] });
      toast({
        title: t.toast.workflowDeleted,
        description: t.toast.workflowDeletedDesc,
      });
    },
    onError: (error: Error) => {
      toast({
        title: t.toast.errorDeleting,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  return (
    <>
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
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t.tfa.score}</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono font-semibold" data-testid={`text-tfa-score-${id}`}>{tfaScore}</p>
                  {feasibility && <Badge variant={feasibility.variant} className="text-xs">{feasibility.label}</Badge>}
                </div>
              </div>
            )}

            {annualBenefits !== undefined && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{t.labels.annualBenefitsValue}</p>
                <p className="text-lg font-mono font-semibold" data-testid={`text-annual-benefits-${id}`}>
                  ${(annualBenefits / 1000).toFixed(0)}K
                </p>
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid={`button-workflow-menu-${id}`}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  data-testid={`menuitem-delete-workflow-${id}`}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t.company.deleteWorkflow}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogs.deleteWorkflow}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.dialogs.deleteWorkflowDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
