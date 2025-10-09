import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import TFAExecutiveSummary from "@/components/TFAExecutiveSummary";
import TFAScoreDisplay from "@/components/TFAScoreDisplay";
import TFAVisualAnalytics from "@/components/TFAVisualAnalytics";
import TFAWeaknessAnalysis from "@/components/TFAWeaknessAnalysis";
import ShareableLinkCard from "@/components/ShareableLinkCard";
import BusinessImpactForm from "@/components/BusinessImpactForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import type { Workflow, Company, TFAAssessment, BusinessImpact } from "@shared/schema";
import { tfaSections as allSections } from "@shared/tfaQuestions";

export default function WorkflowDetail() {
  const [, params] = useRoute("/company/:companyId/workflow/:workflowId");
  const companyId = params?.companyId || '';
  const workflowId = params?.workflowId || '';
  const { toast } = useToast();

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery<Company>({
    queryKey: [`/api/companies/${companyId}`],
    enabled: !!companyId,
  });

  const { data: workflow, isLoading: workflowLoading, error: workflowError } = useQuery<Workflow>({
    queryKey: [`/api/workflows/${workflowId}`],
    enabled: !!workflowId,
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
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-workflow-title">
                {workflowError ? 'Error loading workflow' : workflowLoading ? 'Loading...' : workflow?.name || 'Unknown Workflow'}
              </h1>
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
              <>
                <TFAExecutiveSummary
                  score={tfaAssessment.score || 0}
                  sections={sectionScores}
                />
                <TFAScoreDisplay 
                  score={tfaAssessment.score || 0} 
                  sections={sectionScores} 
                />
                <TFAVisualAnalytics sections={sectionScores} />
                <TFAWeaknessAnalysis sections={sectionScores} />
                {tfaAssessment.comments && (
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

          <TabsContent value="readiness" className="space-y-6">
            <div className="bg-card rounded-lg border border-card-border p-6">
              <h2 className="text-lg font-semibold mb-4">Readiness Rubric</h2>
              <p className="text-muted-foreground">
                Readiness data entry interface would go here (prefilled from TFA where applicable, fully editable)
              </p>
            </div>
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
