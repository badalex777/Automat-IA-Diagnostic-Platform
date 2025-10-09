import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import TFAQuestionCard from "@/components/TFAQuestionCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { tfaSections } from "@shared/tfaQuestions";
import type { TFAAssessment, Workflow, Company } from "@shared/schema";

interface TFAData {
  assessment: TFAAssessment;
  workflow: Workflow;
  company: Company;
}

export default function TFAForm() {
  const [, params] = useRoute("/tfa/:shareableLink");
  const [, setLocation] = useLocation();
  const shareableLink = params?.shareableLink || '';
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [comments, setComments] = useState("");
  const [currentSection, setCurrentSection] = useState(0);

  const { data: tfaData, isLoading, error } = useQuery<TFAData>({
    queryKey: [`/api/tfa/shareable/${shareableLink}`],
    enabled: !!shareableLink,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading assessment",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const totalQuestions = tfaSections.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const submitMutation = useMutation({
    mutationFn: async (data: { responses: Record<string, string>; comments?: string }) => {
      return await apiRequest('POST', `/api/tfa/shareable/${shareableLink}/submit`, data);
    },
    onSuccess: () => {
      if (tfaData?.workflow?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/workflows/${tfaData.workflow.id}/tfa`] });
      }
      setLocation(`/tfa/${shareableLink}/thank-you`);
    },
    onError: (error: Error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (answeredQuestions < totalQuestions) {
      toast({
        title: "Incomplete assessment",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate({ responses: answers, comments: comments || undefined });
  };

  const handleSectionChange = (newSection: number) => {
    setCurrentSection(newSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading assessment...</p>
      </div>
    );
  }

  if (!tfaData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Assessment not found</p>
      </div>
    );
  }

  const { company, workflow } = tfaData;
  const isLastSection = currentSection === tfaSections.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-tfa-title">Technical Feasibility Assessment</h1>
              <p className="text-sm text-muted-foreground mt-1">{company.name} • {workflow.name}</p>
              {workflow.description && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-workflow-description">{workflow.description}</p>
              )}
            </div>
            <ThemeToggle />
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
            <p className="text-sm font-medium">About This Assessment</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This assessment is designed to evaluate the technical feasibility of automating the workflow described above. 
              Your responses will help us understand the current state of data structure, process definition, and system capabilities.
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Important:</strong> This data is collected solely for technical feasibility analysis and workflow automation assessment purposes. 
              It is <strong>not</strong> used for employee performance evaluation or any personnel-related decisions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono">{answeredQuestions} / {totalQuestions}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {!isLastSection ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold" data-testid="text-section-title">
                Section {currentSection + 1}: {tfaSections[currentSection].section}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Weight: {tfaSections[currentSection].weight}% of total score
              </p>
            </div>
            
            <div className="space-y-8">
              {tfaSections[currentSection].questions.map((q) => (
                <TFAQuestionCard
                  key={q.id}
                  questionNumber={q.id}
                  question={q.question}
                  weight={q.weight}
                  options={q.options}
                  value={answers[q.id.toString()]}
                  onChange={(value) => setAnswers({ ...answers, [q.id.toString()]: value })}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Additional Comments</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Please share any additional information, disclaimers, or context that might be relevant to this workflow's automation feasibility.
              </p>
              <div className="space-y-2">
                <Label htmlFor="comments">Comments (Optional)</Label>
                <Textarea
                  id="comments"
                  placeholder="Enter any additional information, concerns, or context that might be helpful..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="min-h-[150px]"
                  data-testid="input-tfa-comments"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <Button 
            variant="outline" 
            disabled={currentSection === 0}
            onClick={() => handleSectionChange(currentSection - 1)}
            data-testid="button-previous-section"
          >
            Previous
          </Button>
          <div className="flex gap-3">
            {!isLastSection ? (
              <Button 
                onClick={() => handleSectionChange(currentSection + 1)}
                data-testid="button-next-section"
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={submitMutation.isPending}
                data-testid="button-submit-tfa"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Assessment'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
