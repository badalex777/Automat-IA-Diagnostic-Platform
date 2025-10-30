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
import { AlertTriangle, User, FileQuestion } from "lucide-react";
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
  gapMetadata = {}
}: KnowledgeGapWarningProps) {
  const { toast } = useToast();
  
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
        answeredBy: leadAnalystName,
        answeredByRole: 'Lead Analyst',
        reason: 'Marked as knowledge gap - information unavailable from any identified source',
        isKnowledgeGap: true,
      },
    }));

    toast({
      title: "Knowledge gap marked",
      description: "Question auto-filled with middle score (3) by Lead Analyst.",
    });
  };

  const handleSubmit = () => {
    // Validate all gaps have answer, answeredBy, and answeredByRole
    const allGapsFilled = gaps.every(gap => {
      const response = gapResponses[gap.questionId.toString()];
      return response?.value && response?.value !== "0" && response?.answeredBy && response?.answeredByRole;
    });

    if (!allGapsFilled) {
      toast({
        title: "Incomplete information",
        description: "Please select an answer, specify who provided it, and their role for each question.",
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
                    {!isMarkedAsGap && leadAnalystName && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsKnowledgeGap(gap.questionId.toString())}
                        data-testid={`button-mark-gap-${gap.questionId}`}
                        className="ml-4"
                      >
                        Mark as Knowledge Gap
                      </Button>
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
    </div>
  );
}
