import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronLeft, Pencil, Check, X, ChevronDown } from "lucide-react";
import TFAExecutiveSummary from "@/components/TFAExecutiveSummary";
import TFAScoreDisplay from "@/components/TFAScoreDisplay";
import TFAVisualAnalytics from "@/components/TFAVisualAnalytics";
import { TFAQuestionDetails } from "@/components/TFAQuestionDetails";
import ShareableLinkCard from "@/components/ShareableLinkCard";
import BusinessImpactForm from "@/components/BusinessImpactForm";
import KnowledgeGapWarning from "@/components/KnowledgeGapWarning";
import ResponseSourcesDisclaimer from "@/components/ResponseSourcesDisclaimer";
import { PIFAggregatedScores } from "@/components/PIFAggregatedScores";
import { PIFRespondentList } from "@/components/PIFRespondentList";
import { PIFRespondentDetail } from "@/components/PIFRespondentDetail";
import ReadinessRubric from "@/components/ReadinessRubric";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Workflow, Company, TFAAssessment, BusinessImpact, PIFResponse } from "@shared/schema";
import type { AggregatedPIFScores } from "@shared/pifCalculations";
import { tfaSections as allSections } from "@shared/tfaQuestions";
import { detectKnowledgeGaps, hasKnowledgeGaps } from "@shared/knowledgeGaps";
import { calculateReadinessRubric } from "@shared/pifCalculations";
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
  const [selectedPIFResponse, setSelectedPIFResponse] = useState<PIFResponse | null>(null);

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

  const { data: pifData, isLoading: pifLoading, error: pifError } = useQuery<{ 
    responses: PIFResponse[]; 
    aggregated: AggregatedPIFScores 
  }>({
    queryKey: [`/api/workflows/${workflowId}/pif`],
    enabled: !!workflowId,
    refetchInterval: 10000, // Refetch every 10 seconds to catch new submissions
    refetchOnWindowFocus: true,
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
    if (workflowError) {
      toast({
        title: "Error loading workflow",
        description: workflowError.message,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowError]);

  useEffect(() => {
    if (tfaError) {
      toast({
        title: "Error loading TFA assessment",
        description: tfaError.message,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tfaError]);

  useEffect(() => {
    if (impactError) {
      toast({
        title: "Error loading business impact",
        description: impactError.message,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [impactError]);

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
        title: "Workflow renamed",
        description: "The workflow name has been successfully updated.",
      });
      setIsEditingName(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error renaming workflow",
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
                    {workflowError ? 'Error loading workflow' : workflowLoading ? 'Loading...' : workflow?.name || 'Unknown Workflow'}
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
                {companyError ? 'Error loading company' : company?.name || (companyLoading ? 'Loading...' : 'Unknown')} • {workflow?.status || 'pending'}
              </p>
            </div>
            <ThemeToggle />
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
            <TabsTrigger value="pif" data-testid="tab-pif">Process Insights</TabsTrigger>
            <TabsTrigger value="readiness" data-testid="tab-readiness">Readiness Rubric</TabsTrigger>
            <TabsTrigger value="impact" data-testid="tab-impact">Business Impact</TabsTrigger>
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
                const answeredCount = Object.keys(responses).filter(key => {
                  const value = responses[key];
                  return value && value !== '0'; // Exclude "Don't Know" (value "0")
                }).length;

                return (
                  <>
                    {hasGaps && (
                      <KnowledgeGapWarning
                        assessmentId={tfaAssessment.id}
                        workflowId={workflowId}
                        gaps={gaps}
                        initialRespondent={tfaAssessment.initialRespondent || undefined}
                        gapMetadata={tfaAssessment.gapMetadata as Record<string, { why: string; whoMightKnow: string }> | undefined}
                      />
                    )}

                    {!hasGaps && (
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
                                return Object.keys(sources).map(questionId => ({
                                  questionId: parseInt(questionId),
                                  respondentName: sources[questionId].respondentName || tfaAssessment.initialRespondent || 'Unknown',
                                  respondentRole: sources[questionId].respondentRole,
                                  source: sources[questionId].source,
                                }));
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

          <TabsContent value="pif" className="space-y-6">
            {pifError ? (
              <div className="bg-card rounded-lg border border-destructive p-6">
                <p className="text-destructive">Error loading PIF data: {pifError.message}</p>
              </div>
            ) : pifLoading ? (
              <p className="text-muted-foreground">Loading Process Insight Form data...</p>
            ) : pifData && pifData.responses.length > 0 ? (
              <>
                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Aggregated Operational Readiness</h3>
                  <PIFAggregatedScores aggregated={pifData.aggregated} />
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Respondent Insights</h3>
                  <PIFRespondentList
                    responses={pifData.responses}
                    onViewDetail={(response) => setSelectedPIFResponse(response)}
                    onDelete={async (id) => {
                      try {
                        await apiRequest('DELETE', `/api/pif/${id}`, {});
                        queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/pif`] });
                        toast({
                          title: "Response deleted",
                          description: "The PIF response has been deleted successfully.",
                        });
                      } catch (error: any) {
                        toast({
                          title: "Delete failed",
                          description: error.message,
                          variant: "destructive",
                        });
                      }
                    }}
                  />
                </Card>

                <ShareableLinkCard
                  workflowId={workflowId}
                  companyName={company?.name || ''}
                  workflowTitle={workflow?.name || ''}
                  type="pif"
                />
              </>
            ) : (
              <div className="bg-card rounded-lg border border-border p-6" data-testid="card-no-pif">
                <div className="text-center py-8">
                  <h3 className="text-lg font-semibold mb-2">No Process Insights Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate a shareable link below to collect operational insights from end users and process owners.
                  </p>
                  <ShareableLinkCard
                    workflowId={workflowId}
                    companyName={company?.name || ''}
                    workflowTitle={workflow?.name || ''}
                    type="pif"
                  />
                </div>
              </div>
            )}

            {/* PIF Response Detail Dialog */}
            <Dialog open={!!selectedPIFResponse} onOpenChange={() => setSelectedPIFResponse(null)}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Process Insight Form Response</DialogTitle>
                </DialogHeader>
                {selectedPIFResponse && (
                  <PIFRespondentDetail response={selectedPIFResponse} />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="readiness" className="space-y-6">
            {(() => {
              // Check if we have all required data for readiness calculation
              const hasTFA = tfaAssessment && tfaAssessment.score !== null && tfaAssessment.score !== undefined;
              const hasPIF = pifData && pifData.responses.length > 0;
              
              if (!hasTFA || !hasPIF) {
                return (
                  <div className="bg-card rounded-lg border border-border p-6" data-testid="card-readiness-incomplete">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold mb-2">Readiness Rubric</h3>
                      <p className="text-muted-foreground mb-4">
                        The combined readiness assessment requires both Technical Feasibility (TFA) and Process Insight Form (PIF) data.
                      </p>
                      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          {hasTFA ? (
                            <span className="text-green-600 dark:text-green-400">✓ TFA Complete</span>
                          ) : (
                            <span>○ TFA Pending</span>
                          )}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          {hasPIF ? (
                            <span className="text-green-600 dark:text-green-400">✓ PIF Complete ({pifData.responses.length} response{pifData.responses.length > 1 ? 's' : ''})</span>
                          ) : (
                            <span>○ PIF Pending</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Calculate section scores from TFA
              const sectionScores = {
                systemEnvironment: 0,
                dataQuality: 0,
                integrationFeasibility: 0,
                securityCompliance: 0,
              };

              if (tfaAssessment.responses) {
                const responses = tfaAssessment.responses as Record<string, string | number>;
                
                allSections.forEach((section) => {
                  const sectionResponses = section.questions
                    .map(q => {
                      const val = responses[q.id];
                      return typeof val === 'string' ? parseInt(val, 10) : val;
                    })
                    .filter((score): score is number => 
                      score !== null && 
                      score !== undefined && 
                      !isNaN(score) &&
                      score !== 0
                    );
                  
                  if (sectionResponses.length > 0) {
                    const avgScore = sectionResponses.reduce((sum, score) => sum + score, 0) / sectionResponses.length;
                    const normalizedScore = Math.round((avgScore / 5) * 100);
                    
                    if (section.section === 'System Environment') sectionScores.systemEnvironment = normalizedScore;
                    if (section.section === 'Data Quality') sectionScores.dataQuality = normalizedScore;
                    if (section.section === 'Integration Feasibility') sectionScores.integrationFeasibility = normalizedScore;
                    if (section.section === 'Security/Compliance') sectionScores.securityCompliance = normalizedScore;
                  }
                });
              }

              const rubric = calculateReadinessRubric(
                tfaAssessment.score || 0,
                sectionScores,
                pifData.aggregated
              );

              return <ReadinessRubric rubric={rubric} />;
            })()}
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            {impactError ? (
              <div className="bg-card rounded-lg border border-destructive p-6">
                <p className="text-destructive">Error loading business impact: {impactError.message}</p>
              </div>
            ) : impactLoading ? (
              <p className="text-muted-foreground">Loading business impact...</p>
            ) : (
              <BusinessImpactForm 
                workflowId={workflowId}
                initialData={businessImpact || undefined}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
