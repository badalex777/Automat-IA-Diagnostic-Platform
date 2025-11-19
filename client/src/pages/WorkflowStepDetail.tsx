import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ChevronLeft, Plus, FileText, BarChart3, Target, Info, Pencil, Trash2, Calculator, Eye } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import ShareableLinkCard from "@/components/ShareableLinkCard";
import { OpportunityForm } from "@/components/OpportunityForm";
import ReadinessRubric from "@/components/ReadinessRubric";
import { PIFRespondentDetail } from "@/components/PIFRespondentDetail";
import PIFExecutiveSummary from "@/components/PIFExecutiveSummary";
import ROICalculatorDialog from "@/components/calculator/ROICalculatorDialog";
import ROIDetailsDialog from "@/components/calculator/ROIDetailsDialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WorkflowStep, Workflow, Company, TFAAssessment, PIFResponse, InsertImplementationOpportunity, ImplementationOpportunity } from "@shared/schema";
import type { AggregatedPIFScores } from "@shared/pifCalculations";
import { calculateReadinessRubric, calculateAggregatedPIFScores } from "@shared/pifCalculations";
import { tfaSections as allSections } from "@shared/tfaQuestions";
export default function WorkflowStepDetail() {
  const [, params] = useRoute("/company/:companyId/workflow/:workflowId/step/:stepId");
  const companyId = params?.companyId || '';
  const workflowId = params?.workflowId || '';
  const stepId = params?.stepId || '';
  const { toast } = useToast();
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);
  const [isROICalculatorOpen, setIsROICalculatorOpen] = useState(false);
  const [editOpportunity, setEditOpportunity] = useState<ImplementationOpportunity | null>(null);
  const [deleteOpportunity, setDeleteOpportunity] = useState<ImplementationOpportunity | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);

  const { data: company, isLoading: companyLoading } = useQuery<Company>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  const { data: workflow, isLoading: workflowLoading } = useQuery<Workflow>({
    queryKey: [`/api/workflows/${workflowId}`],
    enabled: !!workflowId,
  });

  const { data: step, isLoading: stepLoading, error: stepError } = useQuery<WorkflowStep>({
    queryKey: [`/api/steps/${stepId}`],
    enabled: !!stepId,
  });

  const { data: tfaAssessment, isLoading: tfaLoading } = useQuery<TFAAssessment>({
    queryKey: [`/api/workflows/${workflowId}/tfa`],
    enabled: !!workflowId,
  });

  const { data: pifData, isLoading: pifLoading } = useQuery<{ 
    responses: PIFResponse[]; 
  }>({
    queryKey: [`/api/workflows/${workflowId}/pif`],
    enabled: !!workflowId,
    refetchInterval: 10000, // Refetch every 10 seconds like TFA
    refetchOnWindowFocus: true,
  });

  const { data: allOpportunities, isLoading: opportunitiesLoading } = useQuery<ImplementationOpportunity[]>({
    queryKey: [`/api/workflows/${workflowId}/opportunities`],
    enabled: !!workflowId,
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: InsertImplementationOpportunity & { roiCalculationData?: any }) => {
      const res = await apiRequest('POST', `/api/workflows/${workflowId}/opportunities`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/opportunities`] });
      toast({
        title: "Opportunity created",
        description: "Implementation opportunity has been created successfully.",
      });
      setIsOpportunityDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create opportunity",
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

  const deleteOpportunityMutation = useMutation({
    mutationFn: async (opportunityId: string) => {
      const res = await apiRequest('DELETE', `/api/opportunities/${opportunityId}`);
      if (!res.ok) throw new Error('Failed to delete opportunity');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/opportunities`] });
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/consolidations`] });
      if (workflow?.companyId) {
        queryClient.invalidateQueries({ queryKey: [`/api/companies/${workflow.companyId}/consolidations`] });
      }
      toast({
        title: "Opportunity deleted",
        description: "Opportunity has been deleted successfully.",
      });
      setDeleteOpportunity(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting opportunity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (stepError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Step</h2>
          <p className="text-sm text-muted-foreground mb-4">{stepError.message}</p>
          <Link href={`/company/${companyId}/workflow/${workflowId}?tab=steps`}>
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Workflow
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (companyLoading || workflowLoading || stepLoading || tfaLoading || pifLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading step details...</p>
      </div>
    );
  }

  if (!step) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Step Not Found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The requested workflow step could not be found.
          </p>
          <Link href={`/company/${companyId}/workflow/${workflowId}?tab=steps`}>
            <Button variant="outline">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Workflow
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Filter PIFs for this specific step
  const stepPIFs = pifData?.responses.filter(pif => pif.stepId === stepId) || [];
  const hasTFA = tfaAssessment && tfaAssessment.score !== null;
  const hasStepPIF = stepPIFs.length > 0;

  // Filter opportunities for this specific step
  const stepOpportunities = allOpportunities?.filter(opp => opp.stepId === stepId) || [];

  // Calculate step-specific aggregated PIF scores
  // Note: TFA is no longer required for opportunity creation since ROI Calculator only uses PIF data
  let stepAggregatedPIF: AggregatedPIFScores | null = null;
  let stepReadinessRubric = null;
  let stepReadiness: number | null = null;

  if (hasStepPIF) {
    // Use the same aggregation function as workflow-level
    stepAggregatedPIF = calculateAggregatedPIFScores(stepPIFs);

    // Calculate TFA section scores (if TFA exists, otherwise use default/empty scores)
    const sectionScores = {
      systemEnvironment: 0,
      dataQuality: 0,
      integrationFeasibility: 0,
      securityCompliance: 0,
    };

    if (tfaAssessment?.responses) {
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

    // Calculate readiness rubric for this step
    stepReadinessRubric = calculateReadinessRubric(
      tfaAssessment.score || 0,
      sectionScores,
      stepAggregatedPIF
    );
    
    stepReadiness = stepReadinessRubric.totalScore;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href={`/company/${companyId}/workflow/${workflowId}?tab=steps`}>
            <Button variant="ghost" size="sm" className="mb-3" data-testid="button-back-workflow">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Workflow
            </Button>
          </Link>
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  Step {step.stepOrder ?? ''}
                </span>
                <h1 className="text-2xl font-semibold" data-testid="text-step-name">
                  {step.stepName}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                {company?.name} • {workflow?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {stepReadiness !== null && (
                <div className="text-center px-4">
                  <div className="text-3xl font-bold" data-testid="text-readiness-score">
                    {stepReadiness}
                  </div>
                  <div className="text-xs text-muted-foreground">Readiness Score</div>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2" data-testid="tab-overview">
              <Info className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pif-data" className="flex items-center gap-2" data-testid="tab-pif-data">
              <FileText className="h-4 w-4" />
              PIF Data
            </TabsTrigger>
            <TabsTrigger value="readiness" className="flex items-center gap-2" data-testid="tab-readiness" disabled={!hasStepPIF || !stepReadinessRubric}>
              <BarChart3 className="h-4 w-4" />
              Readiness Analysis
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="flex items-center gap-2" data-testid="tab-opportunities">
              <Target className="h-4 w-4" />
              Opportunities
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6">
            {/* Step Information Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Step Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Participant Name</label>
                  <p className="font-medium" data-testid="text-participant-name">
                    {step.participantName || 'Not specified'}
                  </p>
                </div>
                {step.participantRole && (
                  <div>
                    <label className="text-sm text-muted-foreground">Participant Role</label>
                    <p className="font-medium" data-testid="text-participant-role">
                      {step.participantRole}
                    </p>
                  </div>
                )}
                {step.stepDescription && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Description</label>
                    <p className="mt-1 text-sm" data-testid="text-step-description">
                      {step.stepDescription}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Readiness Status Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Assessment Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">TFA Assessment</div>
                  <div className="text-lg font-semibold">
                    {hasTFA ? (
                      <span className="text-green-600 dark:text-green-400">✓ Complete ({tfaAssessment.score})</span>
                    ) : (
                      <span className="text-muted-foreground">Pending</span>
                    )}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">PIF Responses</div>
                  <div className="text-lg font-semibold">
                    {hasStepPIF ? (
                      <span className="text-green-600 dark:text-green-400">
                        ✓ {stepPIFs.length} response{stepPIFs.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Readiness Score</div>
                  <div className="text-lg font-semibold">
                    {stepReadiness !== null ? (
                      <span>{stepReadiness}/100</span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Tab 2: PIF Data */}
          <TabsContent value="pif-data" className="space-y-6">
            {hasStepPIF && stepAggregatedPIF && (
              <PIFExecutiveSummary 
                aggregatedScores={stepAggregatedPIF}
                stepName={step.stepName}
              />
            )}
            
            {hasStepPIF && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  PIF Responses ({stepPIFs.length} respondent{stepPIFs.length > 1 ? 's' : ''})
                </h3>
                <div className="space-y-6">
                  {stepPIFs.map((pif, index) => (
                    <div key={pif.id} className="border-t border-border pt-6 first:border-t-0 first:pt-0">
                      <h4 className="font-medium mb-4">
                        Respondent {index + 1}: {pif.respondentName || 'Anonymous'}
                        {pif.respondentRole && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({pif.respondentRole})
                          </span>
                        )}
                      </h4>
                      <PIFRespondentDetail response={pif} />
                    </div>
                  ))}
                </div>
              </Card>
            )}
            
            <ShareableLinkCard
              workflowId={workflowId}
              companyName={company?.name || ''}
              workflowTitle={workflow?.name || ''}
              type="pif"
              stepId={stepId}
              stepName={step.stepName}
            />
          </TabsContent>

          {/* Tab 3: Readiness Analysis */}
          <TabsContent value="readiness" className="space-y-6">
            {hasStepPIF && stepReadinessRubric ? (
              <ReadinessRubric rubric={stepReadinessRubric} workflowId={workflowId} />
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground text-center">
                  Complete the PIF assessment to view readiness analysis. (Note: TFA provides additional readiness insights but is not required.)
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Tab 4: Opportunities */}
          <TabsContent value="opportunities" className="space-y-6">
            {hasStepPIF && stepReadinessRubric && (
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    // If PIF response exists and complete, open ROI Calculator
                    const stepPif = stepPIFs[0];
                    if (stepPif?.completedAt) {
                      setIsROICalculatorOpen(true);
                    } else {
                      // Fallback to manual form
                      setIsOpportunityDialogOpen(true);
                    }
                  }}
                  data-testid="button-create-opportunity"
                >
                  {stepPIFs[0]?.completedAt ? (
                    <><Calculator className="h-4 w-4 mr-2" />Create Opportunity (ROI Calculator)</>
                  ) : (
                    <><Plus className="h-4 w-4 mr-2" />Create Opportunity (Manual)</>
                  )}
                </Button>
              </div>
            )}

            {stepOpportunities.length > 0 ? (
              <div className="space-y-4">
                {stepOpportunities.map((opp) => {
                  const hasROI = !!opp.roiCalculationData;
                  return (
                  <Card key={opp.id} className="p-6" data-testid={`card-opportunity-${opp.id}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{opp.name}</h3>
                          {hasROI && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => setSelectedOpportunityId(opp.id)}
                              data-testid={`button-view-roi-${opp.id}`}
                              title="View ROI Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditOpportunity(opp)}
                            data-testid={`button-edit-opportunity-${opp.id}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setDeleteOpportunity(opp)}
                            data-testid={`button-delete-opportunity-${opp.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {opp.description && (
                          <p className="text-sm text-muted-foreground mt-1">{opp.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Annual ROI</div>
                        <div className="font-medium">
                          ${Number(opp.annualRoi || 0).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Ramp-up Period</div>
                        <div className="font-medium">
                          {Number(opp.rampupPeriodMonths || 0)} months
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Payback Period</div>
                        <div className="font-medium">
                          {Number(opp.paybackPeriodMonths || 0)} months
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Training Hours</div>
                        <div className="font-medium">
                          {Number(opp.trainingHoursPerEmployee || 0)} hrs
                        </div>
                      </div>
                    </div>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-muted-foreground text-center">
                  {hasStepPIF && stepReadinessRubric
                    ? 'No opportunities created yet. Create one to get started.'
                    : 'Complete the PIF assessment before creating opportunities.'}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Opportunity Dialog */}
      <Dialog open={isOpportunityDialogOpen} onOpenChange={setIsOpportunityDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create-opportunity">
          <DialogHeader>
            <DialogTitle>Create Implementation Opportunity for {step.stepName}</DialogTitle>
          </DialogHeader>
          <OpportunityForm
            workflowId={workflowId}
            stepId={stepId}
            onSubmit={(data) => createOpportunityMutation.mutate(data)}
            onCancel={() => setIsOpportunityDialogOpen(false)}
            isLoading={createOpportunityMutation.isPending}
          />
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
              stepId={stepId}
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
                errorsAvoidedAnnually: editOpportunity.errorsAvoidedAnnually ?? undefined,
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

      {/* Delete Opportunity Confirmation Dialog */}
      <AlertDialog open={!!deleteOpportunity} onOpenChange={(open) => !open && setDeleteOpportunity(null)}>
        <AlertDialogContent data-testid="dialog-delete-opportunity">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteOpportunity?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteOpportunity) {
                  deleteOpportunityMutation.mutate(deleteOpportunity.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteOpportunityMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ROI Calculator Dialog */}
      {step && workflow && company && stepPIFs[0] && (
        <ROICalculatorDialog
          stepId={stepId}
          stepName={step.stepName}
          workflowId={workflowId}
          workflowName={workflow.name}
          companyId={companyId}
          isOpen={isROICalculatorOpen}
          onClose={() => setIsROICalculatorOpen(false)}
          onSave={async (data) => {
            await createOpportunityMutation.mutateAsync(data);
            setIsROICalculatorOpen(false);
          }}
        />
      )}

      {/* ROI Details Dialog */}
      {selectedOpportunityId && (
        <ROIDetailsDialog
          opportunityId={selectedOpportunityId}
          isOpen={!!selectedOpportunityId}
          onClose={() => setSelectedOpportunityId(null)}
        />
      )}
    </div>
  );
}
