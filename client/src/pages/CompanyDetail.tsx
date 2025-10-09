import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search } from "lucide-react";
import WorkflowListItem from "@/components/WorkflowListItem";
import OpportunityMatrix from "@/components/OpportunityMatrix";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Company, Workflow } from "@shared/schema";
import CreateWorkflowDialog from "@/components/CreateWorkflowDialog";

export default function CompanyDetail() {
  const [, params] = useRoute("/company/:id");
  const companyId = params?.id || '';
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

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

  const createWorkflowMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await apiRequest('POST', '/api/workflows', {
        ...data,
        companyId,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/workflows`] });
      toast({
        title: "Workflow created",
        description: "The workflow has been successfully added.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (workflow.description && workflow.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
              <CreateWorkflowDialog 
                onSubmit={(data) => createWorkflowMutation.mutate(data)}
              />
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
            {workflows.length > 0 && (
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-workflows"
                />
              </div>
            )}
            <div className="bg-card rounded-lg border border-card-border p-6">
              {workflowsLoading ? (
                <p className="text-muted-foreground text-center py-4">Loading workflows...</p>
              ) : workflows.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No workflows yet. Create one to get started.</p>
              ) : filteredWorkflows.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No workflows match your search.</p>
              ) : (
                filteredWorkflows.map((workflow) => (
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
