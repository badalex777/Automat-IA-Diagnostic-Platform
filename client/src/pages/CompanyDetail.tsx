import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Pencil, Check, X, BookOpen, FileText } from "lucide-react";
import WorkflowListItem from "@/components/WorkflowListItem";
import OpportunityMatrix from "@/components/OpportunityMatrix";
import BaseImpactMatrix from "@/components/BaseImpactMatrix";
import { OpportunityCard } from "@/components/OpportunityCard";
import { OpportunitiesDataTable } from "@/components/OpportunitiesDataTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Company, Workflow, WorkflowStep, ImplementationOpportunity, TFAAssessment, PIFResponse, WorkflowConsolidation } from "@shared/schema";
import type { AggregatedPIFScores } from "@shared/pifCalculations";
import { calculateReadinessRubric, calculateAggregatedPIFScores } from "@shared/pifCalculations";
import { tfaSections } from "@shared/tfaQuestions";
import CreateWorkflowDialog from "@/components/CreateWorkflowDialog";
import EditCompanyContextDialog from "@/components/EditCompanyContextDialog";
import ScoringGuideDialog from "@/components/ScoringGuideDialog";
import LanguageSelectionDialog from "@/components/LanguageSelectionDialog";

export default function CompanyDetail() {
  const [, params] = useRoute("/company/:id");
  const companyId = params?.id || '';
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [scoringGuideOpen, setScoringGuideOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);

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

  const { data: consolidations = [], isLoading: consolidationsLoading, error: consolidationsError } = useQuery<WorkflowConsolidation[]>({
    queryKey: [`/api/companies/${companyId}/consolidations`],
    enabled: !!companyId,
  });

  // Fetch all workflow steps for step-level readiness calculation
  const { data: allSteps = [], isLoading: stepsLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/all-steps`, workflows.map(w => w.id)],
    queryFn: async () => {
      if (workflows.length === 0) return [];
      
      try {
        const stepsPromises = workflows.map(async (workflow) => {
          const response = await fetch(`/api/workflows/${workflow.id}/steps`);
          if (!response.ok) return [];
          return await response.json();
        });
        
        const stepsResults = await Promise.all(stepsPromises);
        return stepsResults.flat() as WorkflowStep[];
      } catch (error) {
        return [];
      }
    },
    enabled: workflows.length > 0,
  });

  // Fetch TFA and PIF data for ALL workflows to check if report generation is possible
  const { data: allWorkflowAssessments, isLoading: allAssessmentsLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/all-workflow-assessments`, workflows.map(w => w.id)],
    queryFn: async () => {
      if (workflows.length === 0) {
        return { tfaData: {}, pifData: {} };
      }

      try {
        // Fetch TFA and PIF data in parallel for all workflows
        const tfaPromises = workflows.map(async (workflow) => {
          const response = await fetch(`/api/workflows/${workflow.id}/tfa`);
          if (!response.ok) return { workflowId: workflow.id, data: null };
          return { workflowId: workflow.id, data: await response.json() };
        });

        const pifPromises = workflows.map(async (workflow) => {
          const response = await fetch(`/api/workflows/${workflow.id}/pif`);
          if (!response.ok) return { workflowId: workflow.id, data: null };
          return { workflowId: workflow.id, data: await response.json() };
        });

        const [tfaResults, pifResults] = await Promise.all([
          Promise.all(tfaPromises),
          Promise.all(pifPromises)
        ]);

        // Convert arrays to objects keyed by workflowId
        const tfaData: Record<string, TFAAssessment | null> = {};
        const pifData: Record<string, { responses: PIFResponse[]; aggregated: AggregatedPIFScores } | null> = {};

        tfaResults.forEach(result => {
          tfaData[result.workflowId] = result.data;
        });

        pifResults.forEach(result => {
          pifData[result.workflowId] = result.data;
        });

        return { tfaData, pifData };
      } catch (error) {
        return { tfaData: {}, pifData: {} };
      }
    },
    enabled: workflows.length > 0,
  });

  useEffect(() => {
    if (companyError) {
      toast({
        title: "Error loading data",
        description: companyError.message,
        variant: "destructive",
      });
    }
  }, [companyError, toast]);

  useEffect(() => {
    if (workflowsError) {
      toast({
        title: "Error loading data",
        description: workflowsError.message,
        variant: "destructive",
      });
    }
  }, [workflowsError, toast]);

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
        description: "The workflow has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving",
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
        title: "Company updated",
        description: "Company information has been updated successfully.",
      });
      setIsEditingName(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCompanyContextMutation = useMutation({
    mutationFn: async (data: {
      annualRevenue?: number;
      totalEmployees?: number;
    }) => {
      const res = await apiRequest('PATCH', `/api/companies/${companyId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/opportunities`] });
      toast({
        title: "Company updated",
        description: "Company information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: async (language: 'en' | 'es') => {
      const response = await fetch(`/api/companies/${companyId}/executive-report?lang=${language}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate report');
      }
      return response.blob();
    },
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Executive_Diagnostic_Report_${company?.name.replace(/[^a-z0-9]/gi, '_')}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Close language dialog after successful download
      setLanguageDialogOpen(false);
      
      toast({
        title: "Report generated",
        description: "Executive Diagnostic Report has been downloaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating report",
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
  }, [assessmentsError, toast]);

  // Calculate step-level readiness scores (opportunities are positioned by step readiness)
  const readinessScores = useMemo(() => {
    if (!workflowAssessments || allSteps.length === 0) return {};
    
    const scores: Record<string, number> = {};
    const { tfaData, pifData } = workflowAssessments;

    // Iterate through all steps and calculate their readiness scores
    allSteps.forEach((step) => {
      const tfa = tfaData[step.workflowId];
      const allPifResponses = pifData[step.workflowId];

      // Validate TFA: must exist, be completed, and have valid responses object
      if (!tfa || !tfa.completedAt || !tfa.responses || typeof tfa.responses !== 'object') {
        return;
      }

      // Filter PIFs for this specific step only
      if (!allPifResponses || !allPifResponses.responses) {
        return;
      }
      
      const stepPIFs = allPifResponses.responses.filter((pif: PIFResponse) => pif.stepId === step.id);
      
      // Must have at least one PIF response for this step
      if (stepPIFs.length === 0) {
        return;
      }

      // Calculate TFA section scores (shared across all steps in workflow)
      const responses = tfa.responses as Record<string, string | number>;
      const tfaSectionScores = {
        systemEnvironment: 0,
        dataQuality: 0,
        integrationFeasibility: 0,
        securityCompliance: 0,
      };

      tfaSections.forEach((section) => {
        const sectionQuestions = section.questions;
        const sectionResponses = sectionQuestions
          .map(q => {
            const val = responses[q.id];
            return typeof val === 'string' ? parseInt(val, 10) : val;
          })
          .filter((score): score is number => 
            score !== null && 
            score !== undefined && 
            !isNaN(score) &&
            score !== 0 // Exclude "Don't Know" responses
          );
        
        if (sectionResponses.length > 0) {
          const avgScore = sectionResponses.reduce((sum, score) => sum + score, 0) / sectionResponses.length;
          const normalizedScore = Math.round((avgScore / 5) * 100);
          
          if (section.section === 'System Environment') tfaSectionScores.systemEnvironment = normalizedScore;
          if (section.section === 'Data Quality') tfaSectionScores.dataQuality = normalizedScore;
          if (section.section === 'Integration Feasibility') tfaSectionScores.integrationFeasibility = normalizedScore;
          if (section.section === 'Security/Compliance') tfaSectionScores.securityCompliance = normalizedScore;
        }
      });

      // Calculate step-specific aggregated PIF scores (only from this step's PIFs)
      const stepAggregatedPIF = calculateAggregatedPIFScores(stepPIFs);

      // Calculate step readiness rubric (60% TFA + 40% step PIF)
      const stepReadinessRubric = calculateReadinessRubric(
        tfa.score || 0,
        tfaSectionScores,
        stepAggregatedPIF
      );

      // Store step-level readiness score keyed by stepId
      scores[step.id] = stepReadinessRubric.totalScore;
    });

    return scores;
  }, [allSteps, workflowAssessments]);

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

  // Group opportunities by workflow, then sort chronologically
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

    // Convert to array and sort workflows by createdAt DESC (newest first)
    const workflowArray = Object.values(grouped).sort((a, b) => {
      const dateA = a.workflow.createdAt ? new Date(a.workflow.createdAt).getTime() : 0;
      const dateB = b.workflow.createdAt ? new Date(b.workflow.createdAt).getTime() : 0;
      return dateB - dateA; // DESC order (newest first)
    });

    // Sort opportunities within each workflow by createdAt DESC (newest first)
    workflowArray.forEach(item => {
      item.opportunities.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // DESC order (newest first)
      });
    });

    return workflowArray;
  }, [filteredOpportunities, workflows]);

  // Check if company has at least one complete opportunity (workflow with both TFA and PIF completed)
  const hasCompleteOpportunities = useMemo(() => {
    if (!allWorkflowAssessments) return false;
    
    const { tfaData, pifData } = allWorkflowAssessments;
    
    // Check if ANY workflow has both completed TFA and at least one PIF response
    return workflows.some(workflow => {
      const tfa = tfaData[workflow.id];
      const pif = pifData[workflow.id];
      
      // Must have completed TFA assessment
      if (!tfa || !tfa.completedAt) return false;
      
      // Must have at least one PIF response
      if (!pif || !pif.responses || pif.responses.length === 0) return false;
      
      return true;
    });
  }, [workflows, allWorkflowAssessments]);

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
                    {companyLoading ? "Loading..." : company?.name || "Unknown Company"}
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
                {company?.industry || "Unknown"} • {workflows.length} workflows
              </p>
            </div>
            <div className="flex items-center gap-3">
              {company && company.annualRevenue && company.totalEmployees && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScoringGuideOpen(true)}
                  data-testid="button-scoring-guide"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Scoring Guide
                </Button>
              )}
              {company && hasCompleteOpportunities && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setLanguageDialogOpen(true)}
                  disabled={downloadReportMutation.isPending}
                  data-testid="button-generate-report"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {downloadReportMutation.isPending ? 'Generating...' : 'Generate Executive Report'}
                </Button>
              )}
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
            {company && !company.annualRevenue && !company.totalEmployees && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                      Add Financial Context for Better Insights
                    </h3>
                    <p className="text-sm text-amber-600/90 dark:text-amber-400/90">
                      Company financial data (revenue, employees) enables normalized opportunity scoring relative to company size. Without it, scores use absolute values which may not reflect true business impact.
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
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Opportunity Matrix</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'opportunity' : 'opportunities'} across {workflowsWithOpportunities.length} {workflowsWithOpportunities.length === 1 ? 'workflow' : 'workflows'}
                    </p>
                  </div>

                  <Tabs defaultValue="base-impact" className="w-full">
                    <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                      <TabsTrigger value="base-impact" data-testid="tab-base-impact">
                        Base Impact
                      </TabsTrigger>
                      <TabsTrigger value="enhanced-impact" data-testid="tab-enhanced-impact">
                        Enhanced Impact
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="base-impact" className="mt-4">
                      <BaseImpactMatrix 
                        opportunities={filteredOpportunities}
                        workflows={workflows}
                        readinessScores={readinessScores}
                        companyContext={{
                          annualRevenue: company?.annualRevenue,
                          totalEmployees: company?.totalEmployees,
                        }}
                      />
                      <OpportunitiesDataTable 
                        opportunities={filteredOpportunities}
                        workflows={workflows}
                        workflowSteps={allSteps}
                        readinessScores={readinessScores}
                        companyContext={{
                          annualRevenue: company?.annualRevenue,
                          totalEmployees: company?.totalEmployees,
                        }}
                        matrixType="base"
                      />
                    </TabsContent>
                    
                    <TabsContent value="enhanced-impact" className="mt-4">
                      <OpportunityMatrix 
                        opportunities={filteredOpportunities}
                        workflows={workflows}
                        readinessScores={readinessScores}
                        consolidations={consolidations}
                        companyContext={{
                          annualRevenue: company?.annualRevenue,
                          totalEmployees: company?.totalEmployees,
                        }}
                      />
                      <OpportunitiesDataTable 
                        opportunities={filteredOpportunities}
                        workflows={workflows}
                        workflowSteps={allSteps}
                        readinessScores={readinessScores}
                        companyContext={{
                          annualRevenue: company?.annualRevenue,
                          totalEmployees: company?.totalEmployees,
                        }}
                        matrixType="enhanced"
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">All Opportunities</h2>
                  {workflowsWithOpportunities.map(({ workflow, opportunities: workflowOpps }) => (
                    <div key={workflow.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/company/${companyId}/workflow/${workflow.id}`}>
                          <h3 className="text-lg font-semibold hover:underline cursor-pointer">
                            {workflow.name}
                          </h3>
                        </Link>
                        <span className="text-sm text-muted-foreground">
                          ({workflowOpps.length} {workflowOpps.length === 1 ? 'opportunity' : 'opportunities'})
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {workflowOpps.map((opportunity) => (
                          <OpportunityCard
                            key={opportunity.id}
                            opportunity={opportunity}
                            readinessScore={opportunity.stepId ? (readinessScores[opportunity.stepId] || 0) : 0}
                            companyId={companyId}
                            companyContext={{
                              annualRevenue: company?.annualRevenue,
                              totalEmployees: company?.totalEmployees,
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

      {scoringGuideOpen && company && (
        <ScoringGuideDialog 
          open={scoringGuideOpen}
          onOpenChange={setScoringGuideOpen}
          companyRevenue={parseFloat(company.annualRevenue || '0')}
          companyEmployees={company.totalEmployees || 0}
          companyName={company.name}
        />
      )}
      
      <LanguageSelectionDialog
        open={languageDialogOpen}
        onOpenChange={setLanguageDialogOpen}
        onConfirm={(language) => downloadReportMutation.mutate(language)}
        isPending={downloadReportMutation.isPending}
      />
    </div>
  );
}
