import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Pencil, Check, X, ChevronDown, Plus } from "lucide-react";
import TFAExecutiveSummary from "@/components/TFAExecutiveSummary";
import TFAScoreDisplay from "@/components/TFAScoreDisplay";
import TFAVisualAnalytics from "@/components/TFAVisualAnalytics";
import { TFAQuestionDetails } from "@/components/TFAQuestionDetails";
import ShareableLinkCard from "@/components/ShareableLinkCard";
import BusinessImpactForm from "@/components/BusinessImpactForm";
import KnowledgeGapWarning from "@/components/KnowledgeGapWarning";
import ResponseSourcesDisclaimer from "@/components/ResponseSourcesDisclaimer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Workflow, Company, TFAAssessment, BusinessImpact, ImplementationOpportunity, WorkflowStep } from "@shared/schema";
import { tfaSections as allSections } from "@shared/tfaQuestions";
import { detectKnowledgeGaps, hasKnowledgeGaps } from "@shared/knowledgeGaps";
import { aggregateWorkflowSWOT, aggregateExecutiveSummaries } from "@shared/pifCalculations";
import type { ReadinessRubricScore, AggregatedPIFScores } from "@shared/pifCalculations";
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
  const [stepDescription, setStepDescription] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantRole, setParticipantRole] = useState("");

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
    
    return allSections.map(section => {
      const sectionQuestions = section.questions;
      const sectionResponses = sectionQuestions.filter(q => 
        tfaAssessment.responses[q.id.toString()]
      );
      
      const totalWeight = sectionQuestions.reduce((acc, q) => acc + q.weight, 0);
      const weightedScore = sectionQuestions.reduce((acc, q) => {
        const response = tfaAssessment.responses[q.id.toString()];
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
      stepDescription?: string; 
      participantName?: string; 
      participantRole?: string; 
    }) => {
      // Get the current steps to determine the next step order
      const currentSteps = workflowSteps || [];
      const maxOrder = currentSteps.length > 0 
        ? Math.max(...currentSteps.map(s => s.stepOrder || 0)) 
        : 0;
      
      const res = await apiRequest('POST', `/api/workflows/${workflowId}/steps`, {
        ...data,
        stepOrder: maxOrder + 1,
      });
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
        <Tabs defaultValue="tfa" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tfa" data-testid="tab-tfa">Technical Feasibility</TabsTrigger>
            <TabsTrigger value="steps" data-testid="tab-steps">Workflow Steps</TabsTrigger>
            <TabsTrigger value="opportunities" data-testid="tab-opportunities">Opportunities</TabsTrigger>
            {/* Workflow Readiness tab - hidden until step assessment completion checking is implemented */}
            {false && workflowSteps.length > 0 && (
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
                    <ShareableLinkCard
                      workflowId={workflowId}
                      companyName={company?.name || ''}
                      workflowTitle={workflow?.name || ''}
                    />
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
            <Card className="p-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Implementation Opportunities</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Opportunities are created within workflow steps once TFA and PIF assessments are complete
                </p>
              </div>

              {opportunitiesError ? (
                <div className="bg-destructive/10 rounded-lg border border-destructive/30 p-4">
                  <p className="text-destructive text-sm">Error loading opportunities: {opportunitiesError.message}</p>
                </div>
              ) : opportunitiesLoading ? (
                <p className="text-muted-foreground text-sm">Loading opportunities...</p>
              ) : opportunities.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                  <h4 className="font-medium text-base mb-2">No Opportunities Yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Opportunities will appear here once created within workflow steps
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {opportunities.map((opportunity) => {
                    // Find the step this opportunity is linked to
                    const linkedStep = workflowSteps.find(s => s.id === opportunity.stepId);
                    
                    return (
                      <Card key={opportunity.id} className="p-4" data-testid={`card-opportunity-${opportunity.id}`}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base" data-testid={`text-opportunity-name-${opportunity.id}`}>
                                {opportunity.name}
                              </h3>
                              {linkedStep && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Linked to: {linkedStep.stepName}
                                </p>
                              )}
                              {opportunity.description && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  {opportunity.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                            {opportunity.annualRoi && (
                              <div>
                                <div className="text-xs text-muted-foreground">Annual ROI</div>
                                <div className="font-semibold">${parseFloat(opportunity.annualRoi).toLocaleString()}</div>
                              </div>
                            )}
                            {opportunity.fteSavings && (
                              <div>
                                <div className="text-xs text-muted-foreground">FTE Savings</div>
                                <div className="font-semibold">{parseFloat(opportunity.fteSavings).toFixed(2)}</div>
                              </div>
                            )}
                            {opportunity.hoursSavedPerWeek && (
                              <div>
                                <div className="text-xs text-muted-foreground">Hours/Week Saved</div>
                                <div className="font-semibold">{parseFloat(opportunity.hoursSavedPerWeek).toFixed(1)}</div>
                              </div>
                            )}
                            {opportunity.paybackPeriodMonths && (
                              <div>
                                <div className="text-xs text-muted-foreground">Payback Period</div>
                                <div className="font-semibold">{parseFloat(opportunity.paybackPeriodMonths).toFixed(1)} mo</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="workflow-readiness" className="space-y-6">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">Workflow-Level Readiness Assessment</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Aggregated readiness analysis combining all workflow step assessments
                </p>
              </div>

              <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-md p-4 border border-blue-500/20">
                <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Feature In Development</h3>
                <p className="text-sm">
                  Workflow-level aggregated readiness scores and SWOT analysis will appear here once all process steps have completed both TFA (Technical Feasibility Assessment) and PIF (Process Insight Form) assessments.
                </p>
                <p className="text-sm mt-2">
                  Navigate to individual workflow steps to complete their assessments and create implementation opportunities.
                </p>
              </div>

              {workflowSteps.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Step Assessment Progress</h3>
                  <div className="space-y-2">
                    {workflowSteps.map(step => (
                      <div key={step.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                        <span className="font-medium">{step.stepName}</span>
                        <span className="text-sm text-muted-foreground">
                          Assessment status available in step details
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    if (stepName.trim()) {
                      createStepMutation.mutate({
                        stepName: stepName.trim(),
                        stepDescription: stepDescription.trim() || undefined,
                        participantName: participantName.trim() || undefined,
                        participantRole: participantRole.trim() || undefined,
                      });
                    }
                  }}
                  disabled={!stepName.trim() || createStepMutation.isPending}
                  data-testid="button-save-step"
                >
                  {createStepMutation.isPending ? "Creating..." : "Create Step"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
