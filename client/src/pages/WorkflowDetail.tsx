import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Pencil, Check, X, ChevronDown, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TFAExecutiveSummary from "@/components/TFAExecutiveSummary";
import TFAScoreDisplay from "@/components/TFAScoreDisplay";
import TFAVisualAnalytics from "@/components/TFAVisualAnalytics";
import { TFAQuestionDetails } from "@/components/TFAQuestionDetails";
import ShareableLinkCard from "@/components/ShareableLinkCard";
import BusinessImpactForm from "@/components/BusinessImpactForm";
import KnowledgeGapWarning from "@/components/KnowledgeGapWarning";
import ResponseSourcesDisclaimer from "@/components/ResponseSourcesDisclaimer";
import { OpportunityForm } from "@/components/OpportunityForm";
import { ConsolidationDialog } from "@/components/ConsolidationDialog";
import OpportunityMatrix from "@/components/OpportunityMatrix";
import OpportunitiesTable from "@/components/OpportunitiesTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Workflow, Company, TFAAssessment, BusinessImpact, ImplementationOpportunity, WorkflowStep, PIFResponse, WorkflowConsolidation, InsertWorkflowConsolidation } from "@shared/schema";
import { tfaSections as allSections, TFA_QUESTIONS, TFA_SECTIONS } from "@shared/tfaQuestions";
import { detectKnowledgeGaps, hasKnowledgeGaps } from "@shared/knowledgeGaps";
import { aggregateWorkflowSWOT, aggregateExecutiveSummaries, generateSWOTAnalysis, calculateReadinessRubric, calculateAggregatedPIFScores } from "@shared/pifCalculations";
import type { ReadinessRubricScore, AggregatedPIFScores, SWOTAnalysis } from "@shared/pifCalculations";
import { calculateImplementationEffort, calculateBaseImpact } from "@shared/opportunityCalculations";
import type { CompanyContext } from "@shared/opportunityCalculations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WorkflowDetail() {
  const [, params] = useRoute("/company/:companyId/workflow/:workflowId");
  const companyId = params?.companyId || '';
  const workflowId = params?.workflowId || '';
  const { toast } = useToast();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isQuestionDetailsOpen, setIsQuestionDetailsOpen] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [stepName, setStepName] = useState("");
  const [stepOrder, setStepOrder] = useState<number>(1);
  const [stepDescription, setStepDescription] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantRole, setParticipantRole] = useState("");
  const [editOpportunity, setEditOpportunity] = useState<ImplementationOpportunity | null>(null);
  const [oppSortBy, setOppSortBy] = useState<'impact-high' | 'impact-low' | 'effort-high' | 'effort-low' | 'name' | 'roadmap'>('roadmap');
  const [isConsolidationDialogOpen, setIsConsolidationDialogOpen] = useState(false);
  const [editConsolidation, setEditConsolidation] = useState<WorkflowConsolidation | null>(null);

  // Read tab query parameter for navigation from step detail page
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const defaultTab = tabParam || 'tfa';

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery<Company>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  const { data: workflow, isLoading: workflowLoading, error: workflowError } = useQuery<Workflow>({
    queryKey: [`/api/workflows/${workflowId}`],
    enabled: !!workflowId,
    refetchInterval: 10000, // Refetch every 10 seconds to catch new PIF submissions
    refetchOnWindowFocus: true,
  });

  const { data: tfaAssessment, isLoading: tfaLoading, error: tfaError } = useQuery<TFAAssessment>({
    queryKey: [`/api/workflows/${workflowId}/tfa`],
    enabled: !!workflowId,
    refetchOnWindowFocus: true,
  });

  const { data: businessImpact, isLoading: impactLoading, error: impactError } = useQuery<BusinessImpact>({
    queryKey: [`/api/workflows/${workflowId}/business-impact`],
    enabled: !!workflowId,
  });

  const { data: opportunities = [], isLoading: opportunitiesLoading, error: opportunitiesError } = useQuery<ImplementationOpportunity[]>({
    queryKey: [`/api/workflows/${workflowId}/opportunities`],
    enabled: !!workflowId,
  });

  const { data: workflowSteps = [], isLoading: stepsLoading, error: stepsError } = useQuery<WorkflowStep[]>({
    queryKey: [`/api/workflows/${workflowId}/steps`],
    enabled: !!workflowId,
  });

  const { data: consolidations = [], isLoading: consolidationsLoading } = useQuery<WorkflowConsolidation[]>({
    queryKey: [`/api/workflows/${workflowId}/consolidations`],
    enabled: !!workflowId,
  });

  // Assessment status for Workflow Readiness tab
  interface AssessmentStatus {
    workflowId: string;
    hasTFA: boolean;
    steps: Array<{
      stepId: string;
      stepName: string;
      stepOrder: number;
      hasPIF: boolean;
      isComplete: boolean;
    }>;
  }

  const { data: assessmentStatus, isLoading: assessmentStatusLoading } = useQuery<AssessmentStatus>({
    queryKey: [`/api/workflows/${workflowId}/assessment-status`],
    enabled: !!workflowId,
    refetchOnWindowFocus: true,
  });

  // Fetch all PIF responses for aggregated readiness analysis
  interface WorkflowPIFData {
    responses: PIFResponse[];
    aggregated: AggregatedPIFScores;
  }
  
  const { data: workflowPIFData } = useQuery<WorkflowPIFData>({
    queryKey: [`/api/workflows/${workflowId}/pif`],
    enabled: !!workflowId,
    refetchInterval: 10000, // Refetch every 10 seconds like TFA
    refetchOnWindowFocus: true,
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
    if (workflowError) {
      toast({
        title: "Error loading data",
        description: workflowError.message,
        variant: "destructive",
      });
    }
  }, [workflowError, toast]);

  useEffect(() => {
    if (tfaError) {
      toast({
        title: "Error loading data",
        description: tfaError.message,
        variant: "destructive",
      });
    }
  }, [tfaError, toast]);

  useEffect(() => {
    if (impactError) {
      toast({
        title: "Error loading data",
        description: impactError.message,
        variant: "destructive",
      });
    }
  }, [impactError, toast]);

  const calculateSectionScores = () => {
    if (!tfaAssessment?.responses) return [];
    
    const responses = tfaAssessment.responses as Record<string, string | number>;
    
    return allSections.map(section => {
      const sectionQuestions = section.questions;
      const sectionResponses = sectionQuestions.filter(q => 
        responses[q.id.toString()]
      );
      
      const totalWeight = sectionQuestions.reduce((acc, q) => acc + q.weight, 0);
      const weightedScore = sectionQuestions.reduce((acc, q) => {
        const response = responses[q.id.toString()];
        if (!response) return acc;
        return acc + (parseInt(response.toString()) * q.weight);
      }, 0);
      
      const score = totalWeight > 0 ? (weightedScore / totalWeight) : 0;
      
      return {
        name: section.section,
        score: parseFloat(score.toFixed(1)),
        weight: section.weight,
      };
    });
  };

  const updateWorkflowMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const res = await apiRequest('PATCH', `/api/workflows/${workflowId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/companies/${companyId}/workflows`] });
      toast({
        title: "Workflow updated",
        description: "Workflow has been updated successfully.",
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

  const createStepMutation = useMutation({
    mutationFn: async (data: { 
      stepName: string;
      stepOrder: number;
      stepDescription?: string; 
      participantName?: string; 
      participantRole?: string; 
    }) => {
      const res = await apiRequest('POST', `/api/workflows/${workflowId}/steps`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/steps`] });
      toast({
        title: "Step created",
        description: "Workflow step created successfully.",
      });
      setIsStepDialogOpen(false);
      setStepName("");
      setStepOrder(1);
      setStepDescription("");
      setParticipantName("");
      setParticipantRole("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating step",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOpportunityMutation = useMutation({
    mutationFn: async (data: { opportunityId: string; updates: any }) => {
      const res = await apiRequest('PATCH', `/api/opportunities/${data.opportunityId}`, data.updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/opportunities`] });
      toast({
        title: "Opportunity updated",
        description: "Opportunity has been updated successfully.",
      });
      setEditOpportunity(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating opportunity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createConsolidationMutation = useMutation({
    mutationFn: async (data: InsertWorkflowConsolidation) => {
      const res = await apiRequest('POST', `/api/workflows/${workflowId}/consolidations`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/consolidations`] });
      if (workflow?.companyId) {
        queryClient.invalidateQueries({ queryKey: [`/api/companies/${workflow.companyId}/consolidations`] });
      }
      toast({
        title: "Consolidation created",
        description: "Workflow consolidation has been created successfully.",
      });
      setIsConsolidationDialogOpen(false);
      setEditConsolidation(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create consolidation",
        variant: "destructive",
      });
    },
  });

  const updateConsolidationMutation = useMutation({
    mutationFn: async (data: { consolidationId: string; updates: Partial<InsertWorkflowConsolidation> }) => {
      const res = await apiRequest('PATCH', `/api/consolidations/${data.consolidationId}`, data.updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/consolidations`] });
      if (workflow?.companyId) {
        queryClient.invalidateQueries({ queryKey: [`/api/companies/${workflow.companyId}/consolidations`] });
      }
      toast({
        title: "Consolidation updated",
        description: "Workflow consolidation has been updated successfully.",
      });
      setIsConsolidationDialogOpen(false);
      setEditConsolidation(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update consolidation",
        variant: "destructive",
      });
    },
  });

  const deleteConsolidationMutation = useMutation({
    mutationFn: async (consolidationId: string) => {
      await apiRequest('DELETE', `/api/consolidations/${consolidationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/consolidations`] });
      if (workflow?.companyId) {
        queryClient.invalidateQueries({ queryKey: [`/api/companies/${workflow.companyId}/consolidations`] });
      }
      toast({
        title: "Consolidation deleted",
        description: "Workflow consolidation has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete consolidation",
        variant: "destructive",
      });
    },
  });

  const handleStartEdit = () => {
    setEditedName(workflow?.name || '');
    setIsEditingName(true);
  };

  const handleSaveEdit = () => {
    if (updateWorkflowMutation.isPending) return; // Prevent double submission
    if (editedName.trim() && editedName !== workflow?.name) {
      updateWorkflowMutation.mutate({ name: editedName.trim() });
    } else {
      setIsEditingName(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const sectionScores = calculateSectionScores();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href={`/company/${companyId}`}>
            <Button variant="ghost" size="sm" className="mb-3" data-testid="button-back-company">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Company
            </Button>
          </Link>
          <div className="flex items-center justify-between w-full">
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
                    data-testid="input-edit-workflow-name"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    disabled={updateWorkflowMutation.isPending}
                    data-testid="button-save-workflow-name"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={updateWorkflowMutation.isPending}
                    data-testid="button-cancel-edit-workflow-name"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold" data-testid="text-workflow-title">
                    {workflowError ? "Error loading workflow" : workflowLoading ? "Loading..." : workflow?.name || "Unknown Workflow"}
                  </h1>
                  {!workflowLoading && workflow && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleStartEdit}
                      className="h-8 w-8"
                      data-testid="button-edit-workflow-name"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {companyError ? "Error loading company" : company?.name || (companyLoading ? "Loading..." : "Unknown")} • {workflow?.status || 'pending'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {(companyError || workflowError) && (
          <div className="bg-card rounded-lg border border-destructive p-6 mb-6">
            <p className="text-destructive font-semibold mb-2">Error Loading Data</p>
            {companyError && <p className="text-sm text-destructive">Company: {companyError.message}</p>}
            {workflowError && <p className="text-sm text-destructive">Workflow: {workflowError.message}</p>}
          </div>
        )}
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="tfa" data-testid="tab-tfa">Technical Feasibility</TabsTrigger>
            <TabsTrigger value="steps" data-testid="tab-steps">Workflow Steps</TabsTrigger>
            <TabsTrigger value="opportunities" data-testid="tab-opportunities">Opportunities</TabsTrigger>
            {workflowSteps.length > 0 && (
              <TabsTrigger value="workflow-readiness" data-testid="tab-workflow-readiness">Workflow Readiness</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="tfa" className="space-y-6">
            {tfaError ? (
              <div className="bg-card rounded-lg border border-destructive p-6">
                <p className="text-destructive">Error loading TFA assessment: {tfaError.message}</p>
              </div>
            ) : tfaLoading ? (
              <p className="text-muted-foreground">Loading TFA assessment...</p>
            ) : tfaAssessment?.completedAt ? (
              (() => {
                const responses = tfaAssessment.responses as Record<string, string>;
                const gaps = detectKnowledgeGaps(responses);
                const hasGaps = gaps.length > 0;
                const responseSources = (tfaAssessment.responseSources as Record<string, any>) || {};
                const hasMarkedGaps = Object.values(responseSources).some((data: any) => data && data.isKnowledgeGap === true);
                const answeredCount = Object.keys(responses).filter(key => {
                  const value = responses[key];
                  return value && value !== '0'; // Exclude "Don't Know" (value "0")
                }).length;

                return (
                  <>
                    {(hasGaps || hasMarkedGaps) && (
                      <KnowledgeGapWarning
                        assessmentId={tfaAssessment.id}
                        workflowId={workflowId}
                        gaps={gaps}
                        initialRespondent={tfaAssessment.initialRespondent || undefined}
                        leadAnalystName={company?.leadAnalystName}
                        gapMetadata={tfaAssessment.gapMetadata as Record<string, { why: string; whoMightKnow: string }> | undefined}
                        responseSources={responseSources}
                      />
                    )}

                    {!hasGaps && !hasMarkedGaps && (
                      <>
                        <ResponseSourcesDisclaimer
                          initialRespondent={tfaAssessment.initialRespondent || undefined}
                          responseSources={tfaAssessment.responseSources as Record<string, any> || undefined}
                        />
                        <TFAExecutiveSummary
                          score={tfaAssessment.score || 0}
                          sections={sectionScores}
                          responses={responses}
                        />
                        <TFAScoreDisplay 
                          score={tfaAssessment.score || 0} 
                          sections={sectionScores}
                          completedAt={tfaAssessment.completedAt}
                        />
                        <TFAVisualAnalytics sections={sectionScores} />
                      </>
                    )}
                    
                    <Collapsible 
                      open={isQuestionDetailsOpen} 
                      onOpenChange={setIsQuestionDetailsOpen}
                    >
                      <Card>
                        <CollapsibleTrigger className="w-full" data-testid="button-toggle-question-details">
                          <div className="p-6 flex items-center justify-between hover-elevate">
                            <div className="text-left">
                              <h3 className="font-semibold text-lg">Question-Level Analysis</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {hasGaps 
                                  ? `Showing ${answeredCount} answered questions - Complete all questions to unlock full analysis`
                                  : 'Detailed responses and recommendations for each question'
                                }
                              </p>
                            </div>
                            <ChevronDown 
                              className={`h-5 w-5 text-muted-foreground transition-transform ${
                                isQuestionDetailsOpen ? 'rotate-180' : ''
                              }`} 
                            />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-6 pb-6 border-t border-border pt-6">
                            <TFAQuestionDetails
                              responses={responses}
                              respondents={(() => {
                                const sources = tfaAssessment.responseSources as Record<string, any> || {};
                                const respondentsArray: Array<{
                                  questionId: number;
                                  respondentName: string;
                                  respondentRole?: string;
                                  source?: string;
                                  isKnowledgeGap?: boolean;
                                }> = [];
                                
                                // For each answered question, determine respondent info
                                Object.keys(responses).forEach(questionId => {
                                  const questionIdNum = parseInt(questionId);
                                  const sourceData = sources[questionId];
                                  
                                  if (sourceData) {
                                    // Question has gap resolution data (filled gap or knowledge gap)
                                    respondentsArray.push({
                                      questionId: questionIdNum,
                                      respondentName: sourceData.answeredBy || '',
                                      respondentRole: sourceData.answeredByRole || undefined,
                                      source: sourceData.source,
                                      isKnowledgeGap: sourceData.isKnowledgeGap || false,
                                    });
                                  } else {
                                    // Question was answered initially (no gap resolution)
                                    respondentsArray.push({
                                      questionId: questionIdNum,
                                      respondentName: tfaAssessment.initialRespondent || '',
                                      respondentRole: tfaAssessment.initialRespondentRole || undefined,
                                      source: 'Initial assessment',
                                      isKnowledgeGap: false,
                                    });
                                  }
                                });
                                
                                return respondentsArray;
                              })()}
                            />
                          </div>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>

                    {!hasGaps && tfaAssessment.comments && (
                      <Card className="p-6">
                        <h3 className="font-semibold text-lg mb-3">Assessment Notes</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-tfa-comments">
                          {tfaAssessment.comments}
                        </p>
                      </Card>
                    )}
                  </>
                );
              })()
            ) : tfaAssessment ? (
              <div className="bg-card rounded-lg border border-border p-6" data-testid="card-waiting-tfa">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">Waiting for TFA Results</h3>
                  <p className="text-muted-foreground mb-6">
                    The assessment link has been created but hasn't been submitted yet.
                  </p>
                  <ShareableLinkCard
                    workflowId={workflowId}
                    companyName={company?.name || ''}
                    workflowTitle={workflow?.name || ''}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border border-border p-6" data-testid="card-no-tfa">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">No TFA Assessment Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate a shareable link below to begin the technical feasibility assessment.
                  </p>
                  <ShareableLinkCard
                    workflowId={workflowId}
                    companyName={company?.name || ''}
                    workflowTitle={workflow?.name || ''}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="steps" className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Workflow Process Steps</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage individual steps in this workflow. Each step can have its own readiness assessment and opportunities.
                  </p>
                </div>
                <Button
                  onClick={() => setIsStepDialogOpen(true)}
                  data-testid="button-add-step"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>

              {stepsError ? (
                <div className="bg-destructive/10 rounded-lg border border-destructive/30 p-4">
                  <p className="text-destructive text-sm">Error loading steps: {stepsError.message}</p>
                </div>
              ) : stepsLoading ? (
                <p className="text-muted-foreground text-sm">Loading process steps...</p>
              ) : workflowSteps.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-medium text-base mb-2">No Process Steps Yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add steps to break down this workflow into individual tasks for assessment.
                  </p>
                  <Button
                    onClick={() => setIsStepDialogOpen(true)}
                    data-testid="button-add-first-step"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Step
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => {
                    // Readiness is calculated on the step detail page
                    // No need to calculate it here

                    return (
                      <Card key={step.id} className="hover-elevate" data-testid={`card-step-${step.id}`}>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                                  Step {step.stepOrder !== null && step.stepOrder !== undefined ? step.stepOrder : index + 1}
                                </span>
                                <h4 className="font-semibold text-base truncate" data-testid={`text-step-name-${step.id}`}>
                                  {step.stepName}
                                </h4>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Participant:</span>
                                  <span className="ml-2 font-medium" data-testid={`text-participant-${step.id}`}>
                                    {step.participantName || 'Not specified'}
                                  </span>
                                </div>
                                {step.participantRole && (
                                  <div>
                                    <span className="text-muted-foreground">Role:</span>
                                    <span className="ml-2 font-medium" data-testid={`text-role-${step.id}`}>
                                      {step.participantRole}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              {step.stepDescription && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2" data-testid={`text-description-${step.id}`}>
                                  {step.stepDescription}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Link href={`/company/${companyId}/workflow/${workflowId}/step/${step.id}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  data-testid={`button-view-step-${step.id}`}
                                >
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-6">
            {opportunitiesError ? (
              <div className="bg-destructive/10 rounded-lg border border-destructive/30 p-4">
                <p className="text-destructive text-sm">Error loading opportunities: {opportunitiesError.message}</p>
              </div>
            ) : opportunitiesLoading ? (
              <p className="text-muted-foreground text-sm">Loading opportunities...</p>
            ) : opportunities.length === 0 ? (
              <Card className="p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Implementation Opportunities</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Opportunities are created within workflow steps once TFA and PIF assessments are complete
                  </p>
                </div>
                <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-medium text-base mb-2">No Opportunities Yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Opportunities will appear here once created within workflow steps
                  </p>
                </div>
              </Card>
            ) : (() => {
              // Helper function to calculate step readiness scores
              const getStepReadinessScore = (stepId: string | null | undefined): number => {
                if (!stepId || !tfaAssessment || !workflowPIFData) return 50; // Default placeholder
                
                // Get PIF responses for this specific step
                const stepPIFs = workflowPIFData.responses.filter(
                  pif => pif.stepId === stepId && !!pif.completedAt
                );
                
                if (stepPIFs.length === 0) return 50; // No PIF data, use placeholder
                
                // Calculate TFA section scores
                const tfaResponses = (tfaAssessment.responses as Record<string, string | number>) || {};
                const tfaSectionScores = {
                  systemEnvironment: 0,
                  dataQuality: 0,
                  integrationFeasibility: 0,
                  securityCompliance: 0,
                };
                
                let sysEnvCount = 0, dataCount = 0, integCount = 0, secCount = 0;
                
                Object.entries(tfaResponses).forEach(([qidStr, response]) => {
                  const qid = parseInt(qidStr);
                  const numResponse = typeof response === 'number' ? response : Number(response);
                  if (isNaN(numResponse) || numResponse === 0) return;
                  
                  const question = TFA_QUESTIONS.find(q => q.id === qid);
                  if (!question) return;
                  
                  const value = ((numResponse - 1) / 4) * 100;
                  
                  switch (question.section) {
                    case 'System Environment':
                      tfaSectionScores.systemEnvironment += value;
                      sysEnvCount++;
                      break;
                    case 'Data Quality':
                      tfaSectionScores.dataQuality += value;
                      dataCount++;
                      break;
                    case 'Integration Feasibility':
                      tfaSectionScores.integrationFeasibility += value;
                      integCount++;
                      break;
                    case 'Security/Compliance':
                      tfaSectionScores.securityCompliance += value;
                      secCount++;
                      break;
                  }
                });
                
                if (sysEnvCount > 0) tfaSectionScores.systemEnvironment /= sysEnvCount;
                if (dataCount > 0) tfaSectionScores.dataQuality /= dataCount;
                if (integCount > 0) tfaSectionScores.integrationFeasibility /= integCount;
                if (secCount > 0) tfaSectionScores.securityCompliance /= secCount;
                
                const tfaScore = Math.round(
                  (tfaSectionScores.systemEnvironment * 0.25) +
                  (tfaSectionScores.dataQuality * 0.30) +
                  (tfaSectionScores.integrationFeasibility * 0.30) +
                  (tfaSectionScores.securityCompliance * 0.15)
                );
                
                // Calculate aggregated PIF scores for this step
                const aggregatedPIF = calculateAggregatedPIFScores(stepPIFs);
                
                // Calculate readiness rubric
                const rubric = calculateReadinessRubric(tfaScore, tfaSectionScores, aggregatedPIF);
                
                return rubric.totalScore;
              };
              
              // Prepare company context for calculations
              const companyContext: CompanyContext = {
                annualRevenue: company?.annualRevenue,
                totalEmployees: company?.totalEmployees,
              };
              
              // Calculate scores for each opportunity
              const opportunitiesWithScores = opportunities.map(opp => {
                const linkedStep = workflowSteps.find(s => s.id === opp.stepId);
                const readinessScore = getStepReadinessScore(opp.stepId);
                const baseImpact = calculateBaseImpact(opp, companyContext);
                const effortScore = calculateImplementationEffort(
                  readinessScore,
                  parseFloat(opp.rampupPeriodMonths || "0"),
                  parseFloat(opp.paybackPeriodMonths || "0"),
                  parseFloat(opp.trainingHoursPerEmployee || "0")
                );
                
                return {
                  ...opp,
                  linkedStep,
                  readinessScore,
                  baseImpact,
                  effortScore,
                };
              });

              // Sort opportunities based on selected sort option
              const maxImpact = opportunitiesWithScores.length > 0 
                ? Math.max(...opportunitiesWithScores.map(o => o.baseImpact), 0.001) // Guard against zero
                : 1;
              const maxEffort = opportunitiesWithScores.length > 0 
                ? Math.max(...opportunitiesWithScores.map(o => o.effortScore), 0.001) // Guard against zero
                : 1;
              
              const sortedOpportunities = [...opportunitiesWithScores].sort((a, b) => {
                switch (oppSortBy) {
                  case 'impact-high':
                    return b.baseImpact - a.baseImpact;
                  case 'impact-low':
                    return a.baseImpact - b.baseImpact;
                  case 'effort-high':
                    return b.effortScore - a.effortScore;
                  case 'effort-low':
                    return a.effortScore - b.effortScore;
                  case 'name':
                    return a.name.localeCompare(b.name);
                  case 'roadmap': {
                    // Roadmap prioritization: high impact + low effort = quick wins
                    const aPriority = (a.baseImpact / maxImpact) - (a.effortScore / maxEffort);
                    const bPriority = (b.baseImpact / maxImpact) - (b.effortScore / maxEffort);
                    return bPriority - aPriority;
                  }
                  default:
                    return 0;
                }
              });
              
              // Calculate aggregated summary
              const totalOpps = opportunitiesWithScores.length;
              const avgBaseImpact = totalOpps > 0 
                ? opportunitiesWithScores.reduce((sum, o) => sum + o.baseImpact, 0) / totalOpps 
                : 0;
              const avgEffort = totalOpps > 0 
                ? opportunitiesWithScores.reduce((sum, o) => sum + o.effortScore, 0) / totalOpps 
                : 0;
              const totalAnnualRoi = opportunitiesWithScores.reduce(
                (sum, o) => sum + parseFloat(o.annualRoi || "0"), 
                0
              );
              const totalFteSavings = opportunitiesWithScores.reduce(
                (sum, o) => sum + parseFloat(o.fteSavings || "0"), 
                0
              );
              
              // Build readiness scores map for matrix and table
              const stepReadinessScores: Record<string, number> = {};
              workflowSteps.forEach(step => {
                stepReadinessScores[step.id] = getStepReadinessScore(step.id);
              });
              
              return (
                <>
                  {/* All Opportunities Cards */}
                  <Card className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-semibold">All Opportunities</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          Detailed view of each implementation opportunity with raw input metrics
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsConsolidationDialogOpen(true)}
                        size="sm"
                        data-testid="button-create-consolidation"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Create Consolidation
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {opportunitiesWithScores.map((opportunity) => (
                        <Card key={opportunity.id} className="p-4" data-testid={`card-opportunity-${opportunity.id}`}>
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-base" data-testid={`text-opportunity-name-${opportunity.id}`}>
                                    {opportunity.name}
                                  </h3>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={() => setEditOpportunity(opportunity)}
                                    data-testid={`button-edit-opportunity-${opportunity.id}`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                                {opportunity.linkedStep && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Linked to: {opportunity.linkedStep.stepName}
                                  </p>
                                )}
                                {opportunity.description && (
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {opportunity.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Raw Metrics Grid */}
                            <div className="space-y-3 pt-3 border-t">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Business Impact Inputs</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  <div>
                                    <div className="text-xs text-muted-foreground">Annual ROI</div>
                                    <div className="font-semibold">${parseFloat(opportunity.annualRoi || "0").toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs text-muted-foreground">FTE Saved</div>
                                    <div className="font-semibold">{parseFloat(opportunity.fteSavings || "0").toFixed(2)}</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-sm font-medium mb-2">Implementation Effort Inputs</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {opportunity.rampupPeriodMonths && (
                                    <div>
                                      <div className="text-xs text-muted-foreground">Ramp-up Period</div>
                                      <div className="font-semibold">{parseFloat(opportunity.rampupPeriodMonths).toFixed(1)} months</div>
                                    </div>
                                  )}
                                  {opportunity.paybackPeriodMonths && (
                                    <div>
                                      <div className="text-xs text-muted-foreground">Payback Period</div>
                                      <div className="font-semibold">{parseFloat(opportunity.paybackPeriodMonths).toFixed(1)} months</div>
                                    </div>
                                  )}
                                  {opportunity.trainingHoursPerEmployee && (
                                    <div>
                                      <div className="text-xs text-muted-foreground">Training Hours per Employee</div>
                                      <div className="font-semibold">{parseFloat(opportunity.trainingHoursPerEmployee).toFixed(1)} hours</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>

                  {/* Aggregated Metrics Summary */}
                  <Card className="p-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold">Aggregated Metrics Summary</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Combined totals and averages across all opportunities
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Average Business Impact</div>
                        <div className="text-2xl font-bold font-mono">{avgBaseImpact.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Average Implementation Effort</div>
                        <div className="text-2xl font-bold font-mono">{avgEffort.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Total Annual ROI</div>
                        <div className="text-2xl font-bold">${totalAnnualRoi.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Total FTE Saved</div>
                        <div className="text-2xl font-bold">{totalFteSavings.toFixed(2)}</div>
                      </div>
                    </div>
                  </Card>
                </>
              );
            })()}
          </TabsContent>

          <TabsContent value="workflow-readiness" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Workflow-Level Readiness Assessment</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Aggregated readiness analysis combining workflow step assessments
                </p>
              </div>

              {assessmentStatusLoading ? (
                <p className="text-sm text-muted-foreground">Loading assessment status...</p>
              ) : !assessmentStatus ? (
                <div className="bg-muted/30 rounded-md p-4">
                  <p className="text-sm text-muted-foreground">Unable to load assessment status</p>
                </div>
              ) : (() => {
                const completedSteps = assessmentStatus.steps.filter(s => s.isComplete);
                const totalSteps = assessmentStatus.steps.length;
                const completedCount = completedSteps.length;

                // No completed steps - show guidance
                if (completedCount === 0) {
                  return (
                    <>
                      <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-md p-4 border border-blue-500/20">
                        <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Complete Assessments to See Workflow Readiness</h3>
                        <p className="text-sm mb-2">
                          This tab will display aggregated readiness analysis once workflow steps have completed both TFA (Technical Feasibility Assessment) and PIF (Process Insight Form) assessments.
                        </p>
                        <p className="text-sm">
                          Navigate to individual workflow steps to complete their assessments.
                        </p>
                      </div>

                      {totalSteps > 0 && (
                        <div className="mt-6">
                          <h3 className="font-semibold mb-3">Step Assessment Progress ({completedCount}/{totalSteps} Complete)</h3>
                          <div className="space-y-2">
                            {assessmentStatus.steps.map(step => (
                              <div key={step.stepId} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                <span className="font-medium">{step.stepName}</span>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className={step.hasPIF ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                    PIF: {step.hasPIF ? '✓' : '—'}
                                  </span>
                                  <span className={assessmentStatus.hasTFA ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                    TFA: {assessmentStatus.hasTFA ? '✓' : '—'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                }

                // Some steps completed - show aggregated data with progress indicator
                return (
                  <>
                    <div className="bg-green-500/10 dark:bg-green-500/20 rounded-md p-4 border border-green-500/20 mb-6">
                      <h3 className="font-semibold text-green-600 dark:text-green-400 mb-1">
                        Showing Readiness Analysis for {completedCount} of {totalSteps} Steps
                      </h3>
                      <p className="text-sm">
                        {completedCount === totalSteps 
                          ? "All workflow steps have completed assessments" 
                          : `${totalSteps - completedCount} step${totalSteps - completedCount > 1 ? 's' : ''} pending completion`
                        }
                      </p>
                    </div>

                    {/* Calculate aggregated SWOT and Executive Summary */}
                    {(() => {
                      if (!tfaAssessment || !workflowPIFData || !workflowPIFData.responses.length) {
                        return (
                          <div className="bg-muted/30 rounded-md p-4">
                            <h3 className="font-semibold mb-2">Aggregated Workflow Analysis</h3>
                            <p className="text-sm text-muted-foreground">
                              Loading assessment data...
                            </p>
                          </div>
                        );
                      }

                      // Calculate TFA score and section scores
                      const tfaResponsesRaw = (tfaAssessment.responses as Record<string, string | number>) || {};
                      
                      // Parse responses to numbers, excluding "Don't Know" (value 0)
                      const tfaResponses: Record<string, number> = {};
                      Object.entries(tfaResponsesRaw).forEach(([key, val]) => {
                        const numVal = typeof val === 'number' ? val : Number(val);
                        if (!isNaN(numVal) && numVal > 0) { // Exclude "Don't Know" responses (value 0)
                          tfaResponses[key] = numVal;
                        }
                      });
                      
                      // Calculate TFA section scores
                      const tfaSectionScores = {
                        systemEnvironment: 0,
                        dataQuality: 0,
                        integrationFeasibility: 0,
                        securityCompliance: 0,
                      };
                      
                      // Aggregate section scores from TFA responses
                      let sysEnvCount = 0, dataCount = 0, integCount = 0, secCount = 0;
                      
                      Object.entries(tfaResponses).forEach(([qidStr, response]) => {
                        const qid = parseInt(qidStr);
                        const question = TFA_QUESTIONS.find(q => q.id === qid);
                        if (!question) return;
                        
                        // Convert score (1-5) to 0-100 scale: (score - 1) / 4 * 100
                        const value = ((response - 1) / 4) * 100;
                        
                        switch (question.section) {
                          case 'System Environment':
                            tfaSectionScores.systemEnvironment += value;
                            sysEnvCount++;
                            break;
                          case 'Data Quality':
                            tfaSectionScores.dataQuality += value;
                            dataCount++;
                            break;
                          case 'Integration Feasibility':
                            tfaSectionScores.integrationFeasibility += value;
                            integCount++;
                            break;
                          case 'Security/Compliance':
                            tfaSectionScores.securityCompliance += value;
                            secCount++;
                            break;
                        }
                      });
                      
                      // Average section scores
                      if (sysEnvCount > 0) tfaSectionScores.systemEnvironment /= sysEnvCount;
                      if (dataCount > 0) tfaSectionScores.dataQuality /= dataCount;
                      if (integCount > 0) tfaSectionScores.integrationFeasibility /= integCount;
                      if (secCount > 0) tfaSectionScores.securityCompliance /= secCount;
                      
                      // Calculate overall TFA score (weighted average of sections)
                      const tfaScore = Math.round(
                        (tfaSectionScores.systemEnvironment * 0.25) +
                        (tfaSectionScores.dataQuality * 0.30) +
                        (tfaSectionScores.integrationFeasibility * 0.30) +
                        (tfaSectionScores.securityCompliance * 0.15)
                      );

                      // Calculate step-level SWOT analyses for completed steps
                      const stepSWOTs: Array<{
                        stepNumber: number;
                        stepName: string;
                        swot: SWOTAnalysis;
                      }> = [];
                      
                      const stepSummaries: Array<{
                        stepNumber: number;
                        stepName: string;
                        summary: string;
                        readinessScore: number;
                        feasibilityBand: string;
                      }> = [];

                      completedSteps.forEach(step => {
                        const fullStep = workflowSteps.find(s => s.id === step.stepId);
                        if (!fullStep) return;

                        // Get PIF responses for this step (filter to completed only)
                        const stepPIFs = workflowPIFData.responses.filter(
                          pif => pif.stepId === step.stepId && !!pif.completedAt
                        );
                        
                        if (stepPIFs.length === 0) return;

                        // Calculate aggregated PIF scores for this step
                        const aggregatedPIF = calculateAggregatedPIFScores(stepPIFs);
                        
                        // Calculate readiness rubric for this step
                        const rubric = calculateReadinessRubric(tfaScore, tfaSectionScores, aggregatedPIF);
                        
                        // Generate SWOT for this step
                        const swot = generateSWOTAnalysis(rubric, stepPIFs, tfaSectionScores, tfaResponses);
                        
                        stepSWOTs.push({
                          stepNumber: fullStep.stepOrder,
                          stepName: fullStep.stepName,
                          swot,
                        });
                        
                        stepSummaries.push({
                          stepNumber: fullStep.stepOrder,
                          stepName: fullStep.stepName,
                          summary: swot.executiveSummary,
                          readinessScore: rubric.totalScore,
                          feasibilityBand: rubric.feasibilityBand,
                        });
                      });

                      // Aggregate SWOTs and summaries
                      const aggregatedSWOT = aggregateWorkflowSWOT(stepSWOTs);
                      const executiveSummary = aggregateExecutiveSummaries(stepSummaries);
                      
                      // Calculate overall workflow readiness
                      const avgReadiness = stepSummaries.length > 0
                        ? Math.round(stepSummaries.reduce((sum, s) => sum + s.readinessScore, 0) / stepSummaries.length)
                        : 0;

                      return (
                        <div className="space-y-6">
                          {/* Executive Summary */}
                          <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-3">Workflow-Level Executive Summary</h3>
                            <div className="mb-4">
                              <div className="flex items-center gap-4 mb-2">
                                <div>
                                  <span className="text-3xl font-bold">{avgReadiness}/100</span>
                                  <span className="text-sm text-muted-foreground ml-2">Overall Readiness</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{executiveSummary}</p>
                          </Card>

                          {/* Aggregated SWOT Analysis */}
                          <Card className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Aggregated Workflow SWOT Analysis</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Combined step-level insights with attribution labels showing which process step contributed each insight
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Strengths */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-green-600 dark:text-green-400">Strengths</h4>
                                <ul className="space-y-2 text-sm">
                                  {aggregatedSWOT.strengths.map((strength, idx) => (
                                    <li key={idx} className="flex gap-2">
                                      <span className="text-green-600 dark:text-green-400 shrink-0">•</span>
                                      <span>{strength}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Weaknesses */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-amber-600 dark:text-amber-400">Weaknesses</h4>
                                <ul className="space-y-2 text-sm">
                                  {aggregatedSWOT.weaknesses.map((weakness, idx) => (
                                    <li key={idx} className="flex gap-2">
                                      <span className="text-amber-600 dark:text-amber-400 shrink-0">•</span>
                                      <span>{weakness}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Opportunities */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Opportunities</h4>
                                <ul className="space-y-2 text-sm">
                                  {aggregatedSWOT.opportunities.map((opportunity, idx) => (
                                    <li key={idx} className="flex gap-2">
                                      <span className="text-blue-600 dark:text-blue-400 shrink-0">•</span>
                                      <span>{opportunity}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Threats */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-red-600 dark:text-red-400">Threats</h4>
                                <ul className="space-y-2 text-sm">
                                  {aggregatedSWOT.threats.map((threat, idx) => (
                                    <li key={idx} className="flex gap-2">
                                      <span className="text-red-600 dark:text-red-400 shrink-0">•</span>
                                      <span>{threat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    })()}

                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Completed Steps ({completedCount}/{totalSteps})</h3>
                      <div className="space-y-2">
                        {completedSteps.map(step => {
                          const fullStep = workflowSteps.find(s => s.id === step.stepId);
                          return (
                            <div key={step.stepId} className="flex items-center justify-between p-3 bg-green-500/10 dark:bg-green-500/20 rounded-md border border-green-500/20">
                              <span className="font-medium">{step.stepName}</span>
                              {fullStep && (
                                <Link href={`/company/${companyId}/workflow/${workflowId}/step/${step.stepId}`}>
                                  <Button variant="outline" size="sm">View Details</Button>
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {completedCount < totalSteps && (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-3">Pending Steps ({totalSteps - completedCount})</h3>
                        <div className="space-y-2">
                          {assessmentStatus.steps.filter(s => !s.isComplete).map(step => {
                            const fullStep = workflowSteps.find(s => s.id === step.stepId);
                            return (
                              <div key={step.stepId} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                                <div>
                                  <span className="font-medium block">{step.stepName}</span>
                                  <span className="text-sm text-muted-foreground">
                                    Missing: {!step.hasPIF ? 'PIF' : ''}{!step.hasPIF && !assessmentStatus.hasTFA ? ', ' : ''}{!assessmentStatus.hasTFA ? 'TFA' : ''}
                                  </span>
                                </div>
                                {fullStep && (
                                  <Link href={`/company/${companyId}/workflow/${workflowId}/step/${step.stepId}`}>
                                    <Button variant="outline" size="sm">Complete Assessment</Button>
                                  </Link>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Workflow Step Dialog */}
        <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
          <DialogContent className="max-w-2xl" data-testid="dialog-create-step">
            <DialogHeader>
              <DialogTitle>Create Workflow Step</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="step-name" className="text-sm font-medium mb-2 block">
                  Step Name
                </label>
                <Input
                  id="step-name"
                  value={stepName}
                  onChange={(e) => setStepName(e.target.value)}
                  placeholder="e.g., Review and approve invoice"
                  data-testid="input-step-name"
                />
              </div>
              <div>
                <label htmlFor="step-order" className="text-sm font-medium mb-2 block">
                  Step Number <span className="text-destructive">*</span>
                </label>
                <Input
                  id="step-order"
                  type="number"
                  min={1}
                  value={stepOrder}
                  onChange={(e) => setStepOrder(Math.max(1, parseInt(e.target.value) || 1))}
                  placeholder="1"
                  data-testid="input-step-order"
                />
              </div>
              <div>
                <label htmlFor="step-description" className="text-sm font-medium mb-2 block">
                  Step Description
                </label>
                <textarea
                  id="step-description"
                  value={stepDescription}
                  onChange={(e) => setStepDescription(e.target.value)}
                  placeholder="Brief description from stakeholder interviews..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid="input-step-description"
                />
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Participant Information (Optional)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="participant-name" className="text-sm font-medium mb-2 block">
                      Participant Name
                    </label>
                    <Input
                      id="participant-name"
                      value={participantName}
                      onChange={(e) => setParticipantName(e.target.value)}
                      placeholder="e.g., John Smith"
                      data-testid="input-participant-name"
                    />
                  </div>
                  <div>
                    <label htmlFor="participant-role" className="text-sm font-medium mb-2 block">
                      Participant Role
                    </label>
                    <Input
                      id="participant-role"
                      value={participantRole}
                      onChange={(e) => setParticipantRole(e.target.value)}
                      placeholder="e.g., Finance Manager"
                      data-testid="input-participant-role"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsStepDialogOpen(false);
                    setStepName("");
                    setStepOrder(1);
                    setStepDescription("");
                    setParticipantName("");
                    setParticipantRole("");
                  }}
                  disabled={createStepMutation.isPending}
                  data-testid="button-cancel-step"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (stepName.trim() && stepOrder >= 1) {
                      // Check if step number already exists
                      const existingStep = workflowSteps.find(s => s.stepOrder === stepOrder);
                      if (existingStep) {
                        toast({
                          title: "Duplicate Step Number",
                          description: `Step number ${stepOrder} already exists for "${existingStep.stepName}". Please choose a different number.`,
                          variant: "destructive",
                        });
                        return;
                      }

                      createStepMutation.mutate({
                        stepName: stepName.trim(),
                        stepOrder: stepOrder,
                        stepDescription: stepDescription.trim() || undefined,
                        participantName: participantName.trim() || undefined,
                        participantRole: participantRole.trim() || undefined,
                      });
                    }
                  }}
                  disabled={!stepName.trim() || stepOrder < 1 || createStepMutation.isPending}
                  data-testid="button-save-step"
                >
                  {createStepMutation.isPending ? "Creating..." : "Create Step"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Opportunity Dialog */}
        <Dialog open={!!editOpportunity} onOpenChange={(open) => !open && setEditOpportunity(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-opportunity">
            <DialogHeader>
              <DialogTitle>Edit Opportunity</DialogTitle>
            </DialogHeader>
            {editOpportunity && (
              <OpportunityForm
                workflowId={workflowId}
                initialData={{
                  ...editOpportunity,
                  annualRoi: editOpportunity.annualRoi ? parseFloat(editOpportunity.annualRoi.toString()) : undefined,
                  implementationCost: editOpportunity.implementationCost ? parseFloat(editOpportunity.implementationCost.toString()) : undefined,
                  annualRunRateRoi: editOpportunity.annualRunRateRoi ? parseFloat(editOpportunity.annualRunRateRoi.toString()) : undefined,
                  cumulativeNetBenefit3Year: editOpportunity.cumulativeNetBenefit3Year ? parseFloat(editOpportunity.cumulativeNetBenefit3Year.toString()) : undefined,
                  cumulativeNetBenefit5Year: editOpportunity.cumulativeNetBenefit5Year ? parseFloat(editOpportunity.cumulativeNetBenefit5Year.toString()) : undefined,
                  hoursSavedPerWeek: editOpportunity.hoursSavedPerWeek ? parseFloat(editOpportunity.hoursSavedPerWeek.toString()) : undefined,
                  annualHoursSaved: editOpportunity.annualHoursSaved ? parseFloat(editOpportunity.annualHoursSaved.toString()) : undefined,
                  fteSavings: editOpportunity.fteSavings ? parseFloat(editOpportunity.fteSavings.toString()) : undefined,
                  errorReductionPct: editOpportunity.errorReductionPct ? parseFloat(editOpportunity.errorReductionPct.toString()) : undefined,
                  hoursReallocatedToRevenue: editOpportunity.hoursReallocatedToRevenue ? parseFloat(editOpportunity.hoursReallocatedToRevenue.toString()) : undefined,
                  revenueUpliftAnnual: editOpportunity.revenueUpliftAnnual ? parseFloat(editOpportunity.revenueUpliftAnnual.toString()) : undefined,
                  rampupPeriodMonths: editOpportunity.rampupPeriodMonths ? parseFloat(editOpportunity.rampupPeriodMonths.toString()) : undefined,
                  paybackPeriodMonths: editOpportunity.paybackPeriodMonths ? parseFloat(editOpportunity.paybackPeriodMonths.toString()) : undefined,
                  trainingHoursPerEmployee: editOpportunity.trainingHoursPerEmployee ? parseFloat(editOpportunity.trainingHoursPerEmployee.toString()) : undefined,
                }}
                onSubmit={(data) => {
                  updateOpportunityMutation.mutate({
                    opportunityId: editOpportunity.id,
                    updates: data,
                  });
                }}
                onCancel={() => setEditOpportunity(null)}
                isLoading={updateOpportunityMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Consolidation Dialog */}
        <ConsolidationDialog
          workflowId={workflowId}
          opportunities={opportunities}
          steps={workflowSteps}
          open={isConsolidationDialogOpen}
          onOpenChange={setIsConsolidationDialogOpen}
          onSubmit={(data) => {
            if (editConsolidation) {
              updateConsolidationMutation.mutate({
                consolidationId: editConsolidation.id,
                updates: data,
              });
            } else {
              createConsolidationMutation.mutate(data);
            }
          }}
          isLoading={createConsolidationMutation.isPending || updateConsolidationMutation.isPending}
          initialData={editConsolidation ? {
            id: editConsolidation.id,
            name: editConsolidation.name,
            opportunityIds: editConsolidation.opportunityIds,
          } : undefined}
        />
      </div>
    </div>
  );
}
