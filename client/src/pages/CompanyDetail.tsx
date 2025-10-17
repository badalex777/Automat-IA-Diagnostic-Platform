import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Pencil, Check, X } from "lucide-react";
import WorkflowListItem from "@/components/WorkflowListItem";
import OpportunityMatrix from "@/components/OpportunityMatrix";
import { OpportunityCard } from "@/components/OpportunityCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Company, Workflow, ImplementationOpportunity, TFAAssessment, PIFResponse } from "@shared/schema";
import type { AggregatedPIFScores } from "@shared/pifCalculations";
import { calculateReadinessRubric } from "@shared/pifCalculations";
import { tfaSections } from "@shared/tfaQuestions";
import CreateWorkflowDialog from "@/components/CreateWorkflowDialog";
import EditCompanyContextDialog from "@/components/EditCompanyContextDialog";

export default function CompanyDetail() {
  const [, params] = useRoute("/company/:id");
  const companyId = params?.id || '';
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery<Company>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  const { data: workflows = [], isLoading: workflowsLoading, error: workflowsError } = useQuery<Workflow[]>({
    queryKey: [`/api/companies/${companyId}/workflows`],
    enabled: !!companyId,
  });

  const { data: opportunities = [], isLoading: opportunitiesLoading, error: opportunitiesError } = useQuery<ImplementationOpportunity[]>({
    queryKey: [`/api/companies/${companyId}/opportunities`],
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

  const updateCompanyMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest('PATCH', `/api/companies/${companyId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company renamed",
        description: "The company name has been successfully updated.",
      });
      setIsEditingName(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error renaming company",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCompanyContextMutation = useMutation({
    mutationFn: async (data: {
      annualRevenue?: number;
      totalEmployees?: number;
      annualLaborCosts?: number;
    }) => {
      const res = await apiRequest('PATCH', `/api/companies/${companyId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/opportunities`] });
      toast({
        title: "Company context updated",
        description: "Financial metrics have been updated. Opportunity scores will recalculate automatically.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating company context",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartEdit = () => {
    setEditedName(company?.name || '');
    setIsEditingName(true);
  };

  const handleSaveEdit = () => {
    if (updateCompanyMutation.isPending) return; // Prevent double submission
    if (editedName.trim() && editedName !== company?.name) {
      updateCompanyMutation.mutate({ name: editedName.trim() });
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (workflow.description && workflow.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get unique workflow IDs from opportunities
  const workflowIdsWithOpportunities = useMemo(() => {
    return Array.from(new Set(opportunities.map(opp => opp.workflowId)));
  }, [opportunities]);

  // Fetch TFA and PIF data for all workflows with opportunities using Promise.all
  const { data: workflowAssessments, isLoading: assessmentsLoading, error: assessmentsError } = useQuery({
    queryKey: [`/api/companies/${companyId}/workflow-assessments`, workflowIdsWithOpportunities],
    queryFn: async () => {
      if (workflowIdsWithOpportunities.length === 0) {
        return { tfaData: {}, pifData: {} };
      }

      try {
        // Fetch TFA and PIF data in parallel for all workflows
        const tfaPromises = workflowIdsWithOpportunities.map(async (workflowId) => {
          const response = await fetch(`/api/workflows/${workflowId}/tfa`);
          if (!response.ok) {
            throw new Error(`Failed to fetch TFA for workflow ${workflowId}: ${response.statusText}`);
          }
          return { workflowId, data: await response.json() };
        });

        const pifPromises = workflowIdsWithOpportunities.map(async (workflowId) => {
          const response = await fetch(`/api/workflows/${workflowId}/pif`);
          if (!response.ok) {
            throw new Error(`Failed to fetch PIF for workflow ${workflowId}: ${response.statusText}`);
          }
          return { workflowId, data: await response.json() };
        });

        const [tfaResults, pifResults] = await Promise.all([
          Promise.all(tfaPromises),
          Promise.all(pifPromises)
        ]);

        // Convert arrays to objects keyed by workflowId
        const tfaData: Record<string, TFAAssessment> = {};
        const pifData: Record<string, { responses: PIFResponse[]; aggregated: AggregatedPIFScores }> = {};

        tfaResults.forEach(result => {
          tfaData[result.workflowId] = result.data;
        });

        pifResults.forEach(result => {
          pifData[result.workflowId] = result.data;
        });

        return { tfaData, pifData };
      } catch (error) {
        throw error;
      }
    },
    enabled: workflowIdsWithOpportunities.length > 0,
  });

  useEffect(() => {
    if (assessmentsError) {
      toast({
        title: "Error loading assessment data",
        description: assessmentsError.message,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentsError]);

  // Calculate readiness scores for each workflow
  const readinessScores = useMemo(() => {
    if (!workflowAssessments) return {};
    
    const scores: Record<string, number> = {};
    const { tfaData, pifData } = workflowAssessments;

    workflowIdsWithOpportunities.forEach((workflowId) => {
      const tfa = tfaData[workflowId];
      const pif = pifData[workflowId];

      // Validate TFA: must exist, be completed, and have valid responses object
      if (!tfa || !tfa.completedAt || !tfa.responses || typeof tfa.responses !== 'object') {
        return;
      }

      // Validate PIF: must exist, have responses array, and at least one response
      if (!pif || !pif.responses || !Array.isArray(pif.responses) || pif.responses.length === 0) {
        return;
      }

      // Calculate section scores from TFA
      const responses = tfa.responses as Record<string, string>;
      const sectionScores = tfaSections.map(section => {
        const sectionQuestions = section.questions;
        const totalWeight = sectionQuestions.reduce((acc, q) => acc + q.weight, 0);
        const weightedScore = sectionQuestions.reduce((acc, q) => {
          const response = responses[q.id.toString()];
          if (!response) return acc;
          return acc + (parseInt(response) * q.weight);
        }, 0);
        const score = totalWeight > 0 ? (weightedScore / totalWeight) : 0;
        return {
          name: section.section,
          score: parseFloat(score.toFixed(1)),
          weight: section.weight,
        };
      });

      // Extract section scores for readiness calculation
      const tfaSectionScores = {
        systemEnvironment: sectionScores.find(s => s.name === "System & Environment")?.score || 0,
        dataQuality: sectionScores.find(s => s.name === "Data Quality & Availability")?.score || 0,
        integrationFeasibility: sectionScores.find(s => s.name === "Integration Feasibility")?.score || 0,
        securityCompliance: sectionScores.find(s => s.name === "Security & Compliance")?.score || 0,
      };

      // Calculate readiness score using the same logic as WorkflowDetail
      const readinessRubric = calculateReadinessRubric(
        tfa.score || 0,
        tfaSectionScores,
        pif.aggregated
      );

      // Only add to scores if calculation succeeded
      scores[workflowId] = readinessRubric.totalScore;
    });

    return scores;
  }, [workflowIdsWithOpportunities, workflowAssessments]);

  // Filter opportunities to only show those with completed TFA and at least one PIF response
  const filteredOpportunities = useMemo(() => {
    if (!workflowAssessments) return [];
    
    const { tfaData, pifData } = workflowAssessments;
    
    return opportunities.filter(opp => {
      const tfa = tfaData[opp.workflowId];
      const pif = pifData[opp.workflowId];
      
      // Must have completed TFA assessment
      if (!tfa || !tfa.completedAt) return false;
      
      // Must have at least one PIF response
      if (!pif || !pif.responses || pif.responses.length === 0) return false;
      
      return true;
    });
  }, [opportunities, workflowAssessments]);

  // Group opportunities by workflow
  const workflowsWithOpportunities = useMemo(() => {
    const grouped = filteredOpportunities.reduce((acc, opp) => {
      if (!acc[opp.workflowId]) {
        const workflow = workflows.find(w => w.id === opp.workflowId);
        if (workflow) {
          acc[opp.workflowId] = {
            workflow,
            opportunities: [],
          };
        }
      }
      if (acc[opp.workflowId]) {
        acc[opp.workflowId].opportunities.push(opp);
      }
      return acc;
    }, {} as Record<string, { workflow: Workflow; opportunities: ImplementationOpportunity[] }>);

    return Object.values(grouped);
  }, [filteredOpportunities, workflows]);

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
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="text-2xl font-semibold h-auto py-1 max-w-md"
                    autoFocus
                    data-testid="input-edit-company-name"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    disabled={updateCompanyMutation.isPending}
                    data-testid="button-save-company-name"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={updateCompanyMutation.isPending}
                    data-testid="button-cancel-edit-company-name"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold" data-testid="text-company-name">
                    {companyLoading ? 'Loading...' : company?.name || 'Unknown Company'}
                  </h1>
                  {!companyLoading && company && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleStartEdit}
                      className="h-8 w-8"
                      data-testid="button-edit-company-name"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {company?.industry || 'Unknown'} • {workflows.length} workflows
              </p>
            </div>
            <div className="flex items-center gap-3">
              {company && (
                <EditCompanyContextDialog 
                  company={company}
                  onSubmit={(data) => updateCompanyContextMutation.mutate(data)}
                />
              )}
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
            <TabsTrigger value="opportunity-matrix" data-testid="tab-opportunity-matrix">Opportunity Matrix</TabsTrigger>
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

          <TabsContent value="opportunity-matrix" className="space-y-6">
            {/* Financial Context Prompt */}
            {company && !company.annualRevenue && !company.totalEmployees && !company.annualLaborCosts && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      Add Financial Context for Better Insights
                    </h3>
                    <p className="text-sm text-amber-600/90 dark:text-amber-400/90">
                      Company financial data (revenue, employees, labor costs) enables normalized opportunity scoring relative to company size. Without it, scores use absolute values which may not reflect true business impact.
                    </p>
                  </div>
                  <EditCompanyContextDialog 
                    company={company}
                    onSubmit={(data) => updateCompanyContextMutation.mutate(data)}
                    trigger={
                      <Button variant="outline" size="sm" data-testid="button-add-context">
                        Add Context
                      </Button>
                    }
                  />
                </div>
              </div>
            )}

            {opportunitiesLoading ? (
              <div className="bg-card rounded-lg border border-card-border p-6">
                <p className="text-muted-foreground text-center py-8">Loading opportunities...</p>
              </div>
            ) : opportunitiesError ? (
              <div className="bg-card rounded-lg border border-destructive p-6">
                <p className="text-destructive">Error loading opportunities: {opportunitiesError.message}</p>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="bg-card rounded-lg border border-card-border p-6">
                <p className="text-muted-foreground text-center py-8">
                  {opportunities.length === 0 
                    ? "No opportunities yet. Create opportunities in workflow detail pages." 
                    : "No opportunities with completed TFA and PIF assessments. Complete assessments to see opportunities here."}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-card rounded-lg border border-card-border p-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Opportunity Matrix</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'} across {workflowsWithOpportunities.length} {workflowsWithOpportunities.length === 1 ? 'workflow' : 'workflows'}
                    </p>
                  </div>

                  <OpportunityMatrix
                    opportunities={filteredOpportunities}
                    workflows={workflows}
                    readinessScores={readinessScores}
                    companyContext={{
                      annualRevenue: company?.annualRevenue,
                      totalEmployees: company?.totalEmployees,
                      annualLaborCosts: company?.annualLaborCosts,
                    }}
                  />
                </div>

                <div className="space-y-6">
                  {workflowsWithOpportunities.map(({ workflow, opportunities: workflowOpps }) => (
                    <div key={workflow.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold" data-testid={`text-workflow-name-${workflow.id}`}>
                          {workflow.name}
                        </h3>
                        <Link href={`/company/${companyId}/workflow/${workflow.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-workflow-${workflow.id}`}>
                            View Workflow
                          </Button>
                        </Link>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {workflowOpps.map(opp => (
                          <OpportunityCard
                            key={opp.id}
                            opportunity={opp}
                            readinessScore={readinessScores[opp.workflowId]}
                            companyId={companyId}
                            companyContext={{
                              annualRevenue: company?.annualRevenue,
                              totalEmployees: company?.totalEmployees,
                              annualLaborCosts: company?.annualLaborCosts,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
