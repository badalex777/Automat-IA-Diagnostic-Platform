import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { AlertTriangle, User, FileQuestion, RotateCcw, CheckCircle2, HelpCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { groupGapsBySection, type KnowledgeGap } from "@shared/knowledgeGaps";
import { TFA_QUESTIONS } from "@shared/tfaQuestions";

interface KnowledgeGapWarningProps {
  assessmentId: string;
  workflowId: string;
  gaps: KnowledgeGap[];
  initialRespondent?: string;
  leadAnalystName?: string | null;
  gapMetadata?: Record<string, { why: string; whoMightKnow: string }>;
  responseSources?: Record<string, any>;
}

interface GapFormData {
  value: string;
  answeredBy: string;
  answeredByRole: string;
  reason: string;
  isKnowledgeGap?: boolean;
}

export default function KnowledgeGapWarning({ 
  assessmentId, 
  workflowId,
  gaps, 
  initialRespondent,
  leadAnalystName,
  gapMetadata = {},
  responseSources = {}
}: KnowledgeGapWarningProps) {
  const { toast } = useToast();
  
  // State for reset confirmation dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [questionToReset, setQuestionToReset] = useState<string | null>(null);
  
  // Initialize gapResponses with whoMightKnow from gapMetadata as answeredBy
  const [gapResponses, setGapResponses] = useState<Record<string, GapFormData>>(() => {
    const initial: Record<string, GapFormData> = {};
    gaps.forEach(gap => {
      const questionId = gap.questionId.toString();
      const metadata = gapMetadata[questionId];
      if (metadata) {
        initial[questionId] = {
          value: '',
          answeredBy: metadata.whoMightKnow || '', // Pre-fill with whoMightKnow
          answeredByRole: '',
          reason: metadata.why || '', // We'll show this as read-only
        };
      }
    });
    return initial;
  });
  
  const groupedGaps = groupGapsBySection(gaps);

  const fillGapsMutation = useMutation({
    mutationFn: async (data: { gapResponses: Record<string, GapFormData> }) => {
      const res = await apiRequest('PATCH', `/api/tfa/${assessmentId}/fill-gaps`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/tfa`] });
      toast({
        title: "Knowledge gaps filled",
        description: "Assessment updated successfully with complete information.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error filling gaps",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unmarkGapMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const res = await apiRequest('PATCH', `/api/tfa/${assessmentId}/unmark-gap`, { questionId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/tfa`] });
      setResetDialogOpen(false);
      setQuestionToReset(null);
      toast({
        title: "Response reset",
        description: "The question has been restored to 'Don't Know' status and can be filled again.",
      });
    },
    onError: (error: Error) => {
      setResetDialogOpen(false);
      setQuestionToReset(null);
      toast({
        title: "Error resetting response",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle reset confirmation
  const handleResetClick = (questionId: string) => {
    setQuestionToReset(questionId);
    setResetDialogOpen(true);
  };

  const handleConfirmReset = () => {
    if (questionToReset) {
      unmarkGapMutation.mutate(questionToReset);
    }
  };

  const handleGapUpdate = (questionId: string, field: keyof GapFormData, value: string | boolean) => {
    setGapResponses(prev => {
      const currentData = prev[questionId] || { value: '', answeredBy: '', answeredByRole: '', reason: '' };
      return {
        ...prev,
        [questionId]: {
          ...currentData,
          [field]: value,
        },
      };
    });
  };

  const markAsKnowledgeGap = (questionId: string) => {
    if (!leadAnalystName) {
      toast({
        title: "Lead Analyst not set",
        description: "Cannot mark as knowledge gap without a Lead Analyst assigned to this company.",
        variant: "destructive",
      });
      return;
    }

    setGapResponses(prev => ({
      ...prev,
      [questionId]: {
        value: '3', // Middle score
        answeredBy: '', // No respondent for actual knowledge gaps
        answeredByRole: '', // No respondent role for actual knowledge gaps
        reason: `Knowledge gap identified by ${leadAnalystName}`,
        isKnowledgeGap: true,
      },
    }));

    toast({
      title: "Knowledge gap marked",
      description: `Question auto-filled with middle score (3). Gap identified by ${leadAnalystName}.`,
    });
  };

  const handleSubmit = () => {
    // Validate all gaps have answer
    // For actual knowledge gaps (isKnowledgeGap=true), answeredBy/answeredByRole not required
    // For resolved gaps, answeredBy and answeredByRole are required
    const allGapsFilled = gaps.every(gap => {
      const response = gapResponses[gap.questionId.toString()];
      if (!response?.value || response?.value === "0") {
        return false; // Must have an answer
      }
      // If it's a knowledge gap, no respondent data needed
      if (response.isKnowledgeGap) {
        return true;
      }
      // For resolved gaps, require respondent info
      return response?.answeredBy && response?.answeredByRole;
    });

    if (!allGapsFilled) {
      toast({
        title: "Incomplete information",
        description: "Please select an answer for each question. For resolved gaps, specify who provided it and their role, or mark as knowledge gap.",
        variant: "destructive",
      });
      return;
    }

    fillGapsMutation.mutate({ gapResponses });
  };

  const getQuestionOptions = (questionId: number) => {
    const question = TFA_QUESTIONS.find(q => q.id === questionId);
    return question?.options.filter(opt => opt.value !== "0") || [];
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="border-2">
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-semibold text-base">Assessment Incomplete - Knowledge Gaps Detected</p>
            <p className="text-sm">
              This assessment has <strong>{gaps.length} unanswered question{gaps.length > 1 ? 's' : ''}</strong> marked as "Don't Know/Not Sure". 
              Accurate results cannot be displayed until all questions are answered with valid responses.
            </p>
            {initialRespondent && (
              <p className="text-sm flex items-center gap-2 mt-2">
                <User className="h-4 w-4" />
                <span>Initial respondent: <strong>{initialRespondent}</strong></span>
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileQuestion className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Fill Knowledge Gaps</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          For each unanswered question below, please provide the correct answer along with who provided it and why the original respondent couldn't answer.
        </p>

        {/* Show all resolved "Don't Know" responses (both knowledge gaps and filled answers) */}
        {Object.entries(responseSources).length > 0 && (
          <div className="mb-8">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Previously Resolved (Originally "Don't Know")</h4>
            <p className="text-xs text-muted-foreground mb-4">
              These questions were originally marked as "Don't Know" and have been resolved. You can reset them back to "Don't Know" if needed.
            </p>
            <div className="space-y-3">
              {Object.entries(responseSources)
                .map(([questionId, data]) => {
                  const question = TFA_QUESTIONS.find(q => q.id.toString() === questionId);
                  if (!question) return null;
                  const isKnowledgeGap = data?.isKnowledgeGap === true;
                  
                  return (
                    <Card 
                      key={questionId} 
                      className={`p-4 ${
                        isKnowledgeGap 
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800' 
                          : 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isKnowledgeGap ? (
                              <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                            <span className={`text-xs font-medium ${
                              isKnowledgeGap 
                                ? 'text-amber-600 dark:text-amber-400' 
                                : 'text-green-600 dark:text-green-400'
                            }`}>
                              {isKnowledgeGap ? 'Marked as Knowledge Gap' : 'Resolved with Answer'}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-2">{question.question}</p>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {isKnowledgeGap ? (
                              <p>Score: 3/5 (auto-assigned)</p>
                            ) : (
                              <>
                                {data.answeredBy && <p>Answered by: {data.answeredBy}{data.answeredByRole ? ` (${data.answeredByRole})` : ''}</p>}
                              </>
                            )}
                            {data.reason && <p>{data.reason}</p>}
                            {data.answeredAt && (
                              <p className="text-muted-foreground/70">
                                Resolved: {new Date(data.answeredAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResetClick(questionId)}
                          disabled={unmarkGapMutation.isPending}
                          data-testid={`button-reset-response-${questionId}`}
                          className="ml-4 gap-1"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reset
                        </Button>
                      </div>
                    </Card>
                  );
                })}
            </div>
          </div>
        )}

        <div className="space-y-8">
          {Object.entries(groupedGaps).map(([section, sectionGaps]) => (
            <div key={section} className="space-y-4">
              <h4 className="font-medium text-sm text-primary">{section}</h4>
              {sectionGaps.map(gap => {
                const isMarkedAsGap = gapResponses[gap.questionId.toString()]?.isKnowledgeGap;
                return (
                <Card key={gap.questionId} className="p-4 bg-muted/30">
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-sm font-medium flex-1">{gap.question}</p>
                    {leadAnalystName && (
                      <>
                        {!isMarkedAsGap ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsKnowledgeGap(gap.questionId.toString())}
                            data-testid={`button-mark-gap-${gap.questionId}`}
                            className="ml-4"
                          >
                            Mark as Knowledge Gap
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Clear the local marking
                              setGapResponses(prev => {
                                const updated = { ...prev };
                                delete updated[gap.questionId.toString()];
                                return updated;
                              });
                              toast({
                                title: "Marking removed",
                                description: "The knowledge gap marking has been removed. You can now fill this gap normally.",
                              });
                            }}
                            data-testid={`button-unmark-gap-${gap.questionId}`}
                            className="ml-4"
                          >
                            Unmark Knowledge Gap
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {isMarkedAsGap && (
                    <Alert className="mb-4 bg-muted">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Marked as knowledge gap - auto-filled with middle score (3) by {leadAnalystName}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid gap-4">
                    {/* Show "why" from initial respondent as read-only context */}
                    {gapMetadata[gap.questionId.toString()]?.why && (
                      <div className="p-3 bg-muted/50 rounded-md border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Why {initialRespondent || 'the respondent'} couldn't answer:
                        </p>
                        <p className="text-sm">{gapMetadata[gap.questionId.toString()].why}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`answer-${gap.questionId}`}>Answer *</Label>
                      <Select
                        value={gapResponses[gap.questionId.toString()]?.value || ""}
                        onValueChange={(value) => handleGapUpdate(gap.questionId.toString(), 'value', value)}
                      >
                        <SelectTrigger id={`answer-${gap.questionId}`} data-testid={`select-gap-answer-${gap.questionId}`}>
                          <SelectValue placeholder="Select an answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {getQuestionOptions(gap.questionId).map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`answered-by-${gap.questionId}`}>
                        Answered by (Name) *
                        {gapMetadata[gap.questionId.toString()]?.whoMightKnow && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Suggested: {gapMetadata[gap.questionId.toString()].whoMightKnow})
                          </span>
                        )}
                      </Label>
                      <Input
                        id={`answered-by-${gap.questionId}`}
                        placeholder="e.g., John Smith"
                        value={gapResponses[gap.questionId.toString()]?.answeredBy || ""}
                        onChange={(e) => handleGapUpdate(gap.questionId.toString(), 'answeredBy', e.target.value)}
                        data-testid={`input-gap-answeredby-${gap.questionId}`}
                        disabled={isMarkedAsGap}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`answered-by-role-${gap.questionId}`}>
                        Resolver Role *
                      </Label>
                      <Input
                        id={`answered-by-role-${gap.questionId}`}
                        placeholder="e.g., IT Manager, Lead Analyst"
                        value={gapResponses[gap.questionId.toString()]?.answeredByRole || ""}
                        onChange={(e) => handleGapUpdate(gap.questionId.toString(), 'answeredByRole', e.target.value)}
                        data-testid={`input-gap-answeredbyrole-${gap.questionId}`}
                        disabled={isMarkedAsGap}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`reason-${gap.questionId}`}>Additional context or reason (Optional)</Label>
                      <Textarea
                        id={`reason-${gap.questionId}`}
                        placeholder="e.g., Confirmed with IT department, This aligns with system documentation..."
                        value={gapResponses[gap.questionId.toString()]?.reason || ""}
                        onChange={(e) => handleGapUpdate(gap.questionId.toString(), 'reason', e.target.value)}
                        className="min-h-[60px]"
                        data-testid={`input-gap-reason-${gap.questionId}`}
                        disabled={isMarkedAsGap}
                      />
                    </div>
                  </div>
                </Card>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 pt-6 border-t">
          <Button
            onClick={handleSubmit}
            disabled={fillGapsMutation.isPending}
            data-testid="button-submit-gaps"
          >
            {fillGapsMutation.isPending ? 'Updating...' : 'Update Assessment'}
          </Button>
        </div>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Response?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the question to "Don't Know" status. The current answer will be removed and you'll need to fill it again. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-reset">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmReset}
              disabled={unmarkGapMutation.isPending}
              data-testid="button-confirm-reset"
            >
              {unmarkGapMutation.isPending ? 'Resetting...' : 'Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
