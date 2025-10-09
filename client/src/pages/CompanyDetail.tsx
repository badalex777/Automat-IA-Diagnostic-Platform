import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import WorkflowListItem from "@/components/WorkflowListItem";
import OpportunityMatrix from "@/components/OpportunityMatrix";
import { ThemeToggle } from "@/components/ThemeToggle";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Company, Workflow } from "@shared/schema";

export default function CompanyDetail() {
  const [, params] = useRoute("/company/:id");
  const companyId = params?.id || '';
  const { toast } = useToast();

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery<Company>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  const { data: workflows = [], isLoading: workflowsLoading, error: workflowsError } = useQuery<Workflow[]>({
    queryKey: [`/api/companies/${companyId}/workflows`],
    enabled: !!companyId,
  });

  useEffect(() => {
    if (companyError) {
      toast({
        title: "Error loading company",
        description: companyError.message,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyError]);

  useEffect(() => {
    if (workflowsError) {
      toast({
        title: "Error loading workflows",
        description: workflowsError.message,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowsError]);

  const completedWorkflows = workflows.filter(w => w.status === 'completed');
  const matrixData = completedWorkflows.map(w => ({
    id: w.id,
    name: w.name,
    businessImpact: 0,
    effortToImplement: 0,
    status: w.status,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-3" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-company-name">
                {companyLoading ? 'Loading...' : company?.name || 'Unknown Company'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {company?.industry || 'Unknown'} • {workflows.length} workflows
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button data-testid="button-create-workflow">
                <Plus className="h-4 w-4 mr-2" />
                Add Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList>
            <TabsTrigger value="workflows" data-testid="tab-workflows">Workflows</TabsTrigger>
            <TabsTrigger value="matrix" data-testid="tab-matrix">Opportunity Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            <div className="bg-card rounded-lg border border-card-border p-6">
              {workflowsLoading ? (
                <p className="text-muted-foreground text-center py-4">Loading workflows...</p>
              ) : workflows.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No workflows yet. Create one to get started.</p>
              ) : (
                workflows.map((workflow) => (
                  <WorkflowListItem key={workflow.id} {...workflow} companyId={companyId} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-4">
            <div className="bg-card rounded-lg border border-card-border p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Implementation Prioritization</h2>
                <p className="text-sm text-muted-foreground">
                  {matrixData.length} completed workflows positioned for roadmap planning
                </p>
              </div>
              {matrixData.length > 0 ? (
                <OpportunityMatrix 
                  workflows={matrixData}
                  onWorkflowClick={(id) => console.log('Navigate to workflow:', id)}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">No completed workflows yet. Complete TFA and business impact assessments to see workflows here.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
