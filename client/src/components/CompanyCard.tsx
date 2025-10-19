import { useState } from "react";
import { Card } from "@/components/ui/card";
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
import { Building2, ChevronRight, MoreVertical, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { toast } = useToast();
  const { t } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const completionRate = workflowCount > 0 ? Math.round((completedCount / workflowCount) * 100) : 0;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.removeQueries({ queryKey: [`/api/companies/${id}`] });
      queryClient.removeQueries({ queryKey: [`/api/companies/${id}/workflows`] });
      toast({
        title: t.toast.companyDeleted,
        description: t.toast.companyDeletedDesc,
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

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate();
    setDeleteDialogOpen(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <Card className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all relative" data-testid={`card-company-${id}`}>
        <Link href={`/company/${id}`}>
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
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    data-testid={`button-company-menu-${id}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={handleMenuClick}>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialogOpen(true);
                    }}
                    data-testid={`menuitem-delete-company-${id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t.company.deleteCompany}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.company.workflows}</p>
                <p className="text-lg font-mono font-semibold" data-testid={`text-workflow-count-${id}`}>
                  {workflowCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{t.workflow.complete}</p>
                <p className="text-lg font-mono font-semibold" data-testid={`text-completed-count-${id}`}>
                  {completedCount}
                </p>
              </div>
            </div>
            <Badge variant={completionRate === 100 ? "default" : completionRate > 0 ? "secondary" : "outline"} data-testid={`badge-completion-${id}`}>
              {completionRate}%
            </Badge>
          </div>
        </Link>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dialogs.deleteCompany}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.dialogs.deleteCompanyDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-company"
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
