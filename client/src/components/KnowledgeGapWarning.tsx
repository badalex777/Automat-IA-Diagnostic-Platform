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
}

interface GapFormData {
  value: string;
  answeredBy: string;
  reason: string;
}

export default function KnowledgeGapWarning({ 
  assessmentId, 
  workflowId,
  gaps, 
  initialRespondent 
}: KnowledgeGapWarningProps) {
  const { toast } = useToast();
  const [gapResponses, setGapResponses] = useState<Record<string, GapFormData>>({});
  
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

  const handleGapUpdate = (questionId: string, field: keyof GapFormData, value: string) => {
    setGapResponses(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    // Validate all gaps have complete information
    const allGapsFilled = gaps.every(gap => {
      const response = gapResponses[gap.questionId.toString()];
      return response?.value && response?.value !== "0" && response?.answeredBy && response?.reason;
    });

    if (!allGapsFilled) {
      toast({
        title: "Incomplete information",
        description: "Please fill all fields for each unanswered question.",
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
              {sectionGaps.map(gap => (
                <Card key={gap.questionId} className="p-4 bg-muted/30">
                  <p className="text-sm font-medium mb-4">{gap.question}</p>
                  
                  <div className="grid gap-4">
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
                      <Label htmlFor={`answered-by-${gap.questionId}`}>Answered by (Name & Role) *</Label>
                      <Input
                        id={`answered-by-${gap.questionId}`}
                        placeholder="e.g., John Smith - IT Manager"
                        value={gapResponses[gap.questionId.toString()]?.answeredBy || ""}
                        onChange={(e) => handleGapUpdate(gap.questionId.toString(), 'answeredBy', e.target.value)}
                        data-testid={`input-gap-answeredby-${gap.questionId}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`reason-${gap.questionId}`}>Why couldn't the original respondent answer? *</Label>
                      <Textarea
                        id={`reason-${gap.questionId}`}
                        placeholder="e.g., This information is managed by the IT department"
                        value={gapResponses[gap.questionId.toString()]?.reason || ""}
                        onChange={(e) => handleGapUpdate(gap.questionId.toString(), 'reason', e.target.value)}
                        className="min-h-[60px]"
                        data-testid={`input-gap-reason-${gap.questionId}`}
                      />
                    </div>
                  </div>
                </Card>
              ))}
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
