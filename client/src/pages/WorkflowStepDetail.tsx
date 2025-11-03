import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import ShareableLinkCard from "@/components/ShareableLinkCard";
import { OpportunityForm } from "@/components/OpportunityForm";
import ReadinessRubric from "@/components/ReadinessRubric";
import { PIFRespondentDetail } from "@/components/PIFRespondentDetail";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { WorkflowStep, Workflow, Company, TFAAssessment, PIFResponse, InsertImplementationOpportunity } from "@shared/schema";
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
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: InsertImplementationOpportunity) => {
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

  if (stepError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Step</h2>
          <p className="text-sm text-muted-foreground mb-4">{stepError.message}</p>
          <Link href={`/company/${companyId}/workflow/${workflowId}`}>
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
          <Link href={`/company/${companyId}/workflow/${workflowId}`}>
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

  // Calculate step-specific aggregated PIF scores
  let stepAggregatedPIF: AggregatedPIFScores | null = null;
  let stepReadinessRubric = null;
  let stepReadiness: number | null = null;

  if (hasTFA && hasStepPIF) {
    // Use the same aggregation function as workflow-level
    stepAggregatedPIF = calculateAggregatedPIFScores(stepPIFs);

    // Calculate TFA section scores
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
          <Link href={`/company/${companyId}/workflow/${workflowId}`}>
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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

        {/* Create Opportunity Button - Only show when readiness rubric is available */}
        {hasStepPIF && stepReadinessRubric && (
          <div className="flex justify-center">
            <Button
              onClick={() => setIsOpportunityDialogOpen(true)}
              size="lg"
              data-testid="button-create-opportunity"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Implementation Opportunity
            </Button>
          </div>
        )}

        {/* Generate PIF Link for this specific step */}
        {!hasStepPIF && (
          <ShareableLinkCard
            workflowId={workflowId}
            companyName={company?.name || ''}
            workflowTitle={workflow?.name || ''}
            type="pif"
            stepId={stepId}
            stepName={step.stepName}
          />
        )}

        {hasStepPIF && stepReadinessRubric && (
          <>
            {/* Full Readiness Rubric Component */}
            <ReadinessRubric rubric={stepReadinessRubric} workflowId={workflowId} />

            {/* PIF Respondent Answers */}
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
          </>
        )}
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
    </div>
  );
}
