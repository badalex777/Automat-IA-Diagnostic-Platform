import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAllPIFQuestions, PIF_SECTIONS } from "@shared/pifQuestions";
import type { Workflow, Company } from "@shared/schema";

interface PIFData {
  workflow: Workflow;
  company: Company;
  shareableId: string;
}

export default function PIFForm() {
  const [, params] = useRoute("/pif/:shareableId");
  const [, setLocation] = useLocation();
  const shareableId = params?.shareableId || '';
  const { toast } = useToast();
  
  const ALL_PIF_QUESTIONS = getAllPIFQuestions();
  
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentRole, setRespondentRole] = useState("");
  const [respondentResponsibilities, setRespondentResponsibilities] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const { data: pifData, isLoading, error } = useQuery<PIFData>({
    queryKey: [`/api/pif/shareable/${shareableId}`],
    enabled: !!shareableId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading survey",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const submitMutation = useMutation({
    mutationFn: async (data: { 
      respondentName: string;
      respondentRole: string;
      respondentResponsibilities?: string;
      responses: Record<string, string>;
    }) => {
      if (!pifData?.workflow?.id) throw new Error("Workflow not found");
      return await apiRequest('POST', `/api/workflows/${pifData.workflow.id}/pif/submit`, data);
    },
    onSuccess: () => {
      if (pifData?.workflow?.id) {
        // Invalidate PIF responses cache
        queryClient.invalidateQueries({ queryKey: [`/api/workflows/${pifData.workflow.id}/pif`] });
        // Invalidate workflow detail cache so consultants see updated responses immediately
        queryClient.invalidateQueries({ queryKey: [`/api/workflows/${pifData.workflow.id}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      }
      setLocation(`/pif/${shareableId}/thank-you`);
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
    if (!respondentName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!respondentRole.trim()) {
      toast({
        title: "Role required",
        description: "Please enter your role before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!respondentResponsibilities.trim()) {
      toast({
        title: "Responsibilities required",
        description: "Please describe your responsibilities before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Check all required questions are answered
    const q32Answer = answers['32'];
    const isErrorProne = q32Answer === 'yes';
    
    const requiredQuestions = ALL_PIF_QUESTIONS.filter(q => {
      // Only Q17, Q18, Q19 are mandatory in Experience & Insights
      if (q.id === 17 || q.id === 18 || q.id === 19) return true;
      // Other text/textarea are optional
      if (q.type === 'text' || q.type === 'textarea') return false;
      // Quality Impact questions only required if error-prone
      if (q.id >= 33 && q.id <= 40 && !isErrorProne) return false;
      return true;
    });
    
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id.toString()]);

    if (missingAnswers.length > 0) {
      toast({
        title: "Incomplete survey",
        description: `Please answer all required questions. ${missingAnswers.length} question(s) remaining.`,
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({ 
      respondentName: respondentName.trim(),
      respondentRole: respondentRole.trim(),
      respondentResponsibilities: respondentResponsibilities.trim(),
      responses: answers,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading survey...</p>
      </div>
    );
  }

  if (!pifData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Survey not found</p>
      </div>
    );
  }

  const { company, workflow } = pifData;

  // Section definitions: 0 = Disclaimer, 1 = Respondent Info, 2-9 = PIF sections
  const sections = PIF_SECTIONS;

  const totalSections = sections.length + 2; // +2 for disclaimer and respondent info
  const isDisclaimerSection = currentSection === 0;
  const isRespondentInfoSection = currentSection === 1;
  const currentPIFSection = (isDisclaimerSection || isRespondentInfoSection) ? null : sections[currentSection - 2];

  // Check if Q32 indicates quality impact (yes means show Quality Impact module)
  const isErrorProne = answers['32'] === 'yes';

  // Calculate progress - include required questions only
  const requiredQuestionsCount = ALL_PIF_QUESTIONS.filter(q => {
    // Only Q17, Q18, Q19 are mandatory in Experience & Insights
    if (q.id === 17 || q.id === 18 || q.id === 19) return true;
    // Other text/textarea are optional
    if (q.type === 'text' || q.type === 'textarea') return false;
    // Quality Impact questions (33-40) only required if error-prone
    if (q.id >= 33 && q.id <= 40 && !isErrorProne) return false;
    return true;
  }).length;
  const answeredCount = Object.keys(answers).filter(id => {
    const q = ALL_PIF_QUESTIONS.find(q => q.id.toString() === id);
    if (!q) return false;
    // Only Q17, Q18, Q19 are mandatory in Experience & Insights
    if (q.id === 17 || q.id === 18 || q.id === 19) return true;
    // Other text/textarea are optional
    if (q.type === 'text' || q.type === 'textarea') return false;
    // Quality Impact questions (33-40) only required if error-prone
    if (q.id >= 33 && q.id <= 40 && !isErrorProne) return false;
    return true;
  }).length;
  const progress = requiredQuestionsCount > 0 ? (answeredCount / requiredQuestionsCount) * 100 : 0;

  const handleNext = () => {
    if (currentSection === 0) {
      // Disclaimer section
      if (!disclaimerAccepted) {
        toast({
          title: "Acceptance required",
          description: "Please check 'I understand' to continue.",
          variant: "destructive",
        });
        return;
      }
    } else if (currentSection === 1) {
      // Respondent Info section
      if (!respondentName.trim() || !respondentRole.trim() || !respondentResponsibilities.trim()) {
        toast({
          title: "Required fields",
          description: "Please enter your name, role, and responsibilities before continuing.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Validate required questions in current section before proceeding
      const currentPIFSection = sections[currentSection - 2]; // -2 because section 0 is disclaimer, section 1 is respondent info
      if (currentPIFSection) {
        const sectionRequiredQuestions = currentPIFSection.questions.filter(q => {
          // Only Q17, Q18, Q19 are mandatory in Experience & Insights
          if (q.id === 17 || q.id === 18 || q.id === 19) return true;
          // Other text/textarea are optional
          if (q.type === 'text' || q.type === 'textarea') return false;
          // Quality Impact questions only required if quality impact exists
          if (q.id >= 33 && q.id <= 40) {
            const q32Answer = answers['32'];
            const isErrorProne = q32Answer === 'yes';
            return isErrorProne;
          }
          return true;
        });
        
        const missingSectionAnswers = sectionRequiredQuestions.filter(q => !answers[q.id.toString()]);
        
        if (missingSectionAnswers.length > 0) {
          toast({
            title: "Required questions",
            description: `Please answer all required questions in this section before continuing. ${missingSectionAnswers.length} question(s) remaining.`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    setCurrentSection(prev => Math.min(prev + 1, totalSections - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentSection(prev => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLastSection = currentSection === totalSections - 1;
  
  // Filter questions based on Q32 (conditional Quality Impact)
  const getVisibleQuestions = (questions: typeof ALL_PIF_QUESTIONS) => {
    return questions.filter(q => {
      // Quality Impact questions (33-41) only shown if quality impact exists (Q32 = yes)
      if (q.id >= 33 && q.id <= 41) {
        return isErrorProne;
      }
      return true;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-pif-title">Process Insight Form</h1>
              <p className="text-sm text-muted-foreground mt-1">{company.name} • {workflow.name}</p>
              {workflow.description && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-workflow-description">{workflow.description}</p>
              )}
            </div>
            <ThemeToggle />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Section {currentSection + 1} of {totalSections}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {isDisclaimerSection ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Welcome to the Process Insight Form</h2>
              <div className="bg-muted/50 border rounded-lg p-6 space-y-4 text-sm">
                <p>
                  This form is part of Automat-IA's diagnostic process for identifying workflows that can benefit from artificial intelligence (AI) implementations.
                </p>
                <p>
                  Its purpose is to collect your direct insights about how specific tasks are currently performed — including time spent, frequency, and common challenges — so we can model realistic improvements and prioritize solutions that truly make your work easier.
                </p>
                <p className="font-semibold">
                  AI at Automat-IA is not about replacing people. It's about augmenting human work — reducing repetitive tasks, minimizing errors, and freeing time for higher-value activities.
                </p>
                <p>
                  Your input is essential to ensure any AI solution we propose genuinely supports you and your team.
                </p>
                <p>
                  All information you share will be treated as confidential, used only for analysis within the current project between Automat-IA and your company, and aggregated where possible before inclusion in any report. It will never be used to evaluate individual performance or shared outside this collaboration.
                </p>
                <p className="font-semibold">
                  There are no right or wrong answers — we're looking for realism, not perfection.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 mt-6">
              <Checkbox 
                id="disclaimer-accept" 
                checked={disclaimerAccepted}
                onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
                data-testid="checkbox-disclaimer"
              />
              <Label 
                htmlFor="disclaimer-accept" 
                className="text-base font-medium cursor-pointer leading-relaxed"
              >
                I understand and agree to proceed with the survey
              </Label>
            </div>
          </div>
        ) : isRespondentInfoSection ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">About You</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Your insights about this workflow are valuable. Please tell us about yourself and your experience with this process.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="respondent-name">Your Name *</Label>
                <Input
                  id="respondent-name"
                  data-testid="input-respondent-name"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="respondent-role">Your Role *</Label>
                <Input
                  id="respondent-role"
                  data-testid="input-respondent-role"
                  value={respondentRole}
                  onChange={(e) => setRespondentRole(e.target.value)}
                  placeholder="e.g., Operations Manager, Team Lead, Process Owner"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="respondent-responsibilities">Your Responsibilities on {workflow.name} *</Label>
                <Textarea
                  id="respondent-responsibilities"
                  data-testid="input-respondent-responsibilities"
                  value={respondentResponsibilities}
                  onChange={(e) => setRespondentResponsibilities(e.target.value)}
                  placeholder="Briefly describe your involvement with this workflow..."
                  className="mt-1.5 min-h-24"
                />
              </div>
            </div>
          </div>
        ) : currentPIFSection ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">{currentPIFSection.section}</h2>
              {currentPIFSection.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {currentPIFSection.description}
                </p>
              )}
              {currentPIFSection.section === "Quality Impact Module" && !isErrorProne && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This section is not applicable based on your previous response. The workflow was not indicated as error-prone.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-8">
              {getVisibleQuestions(currentPIFSection.questions).map((question) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base">
                    Q{question.id}. {question.question}
                    {(question.type === 'text' || question.type === 'textarea') && question.id < 17 && <span className="text-muted-foreground ml-1">(Optional)</span>}
                    {(question.id === 17 || question.id === 18 || question.id === 19) && <span className="text-destructive ml-1">*</span>}
                    {(question.type === 'text' || question.type === 'textarea') && question.id >= 17 && question.id <= 27 && question.id !== 17 && question.id !== 18 && question.id !== 19 && <span className="text-muted-foreground ml-1">(Optional)</span>}
                  </Label>

                  {question.type === 'radio' && question.options && (
                    <RadioGroup
                      value={answers[question.id.toString()] || ""}
                      onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id.toString()]: value }))}
                    >
                      {question.options.map((option) => (
                        <div key={option.value} className="flex items-start space-x-2">
                          <RadioGroupItem 
                            value={option.value.toString()} 
                            id={`q${question.id}-${option.value}`}
                            data-testid={`radio-q${question.id}-${option.value}`}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label 
                              htmlFor={`q${question.id}-${option.value}`}
                              className="font-normal cursor-pointer"
                            >
                              {option.label}
                            </Label>
                            {option.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {option.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === 'number' && (
                    <Input
                      type="number"
                      data-testid={`input-q${question.id}`}
                      value={answers[question.id.toString()] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [question.id.toString()]: e.target.value }))}
                      placeholder={question.placeholder || "Enter a number"}
                    />
                  )}

                  {(question.type === 'text' || question.type === 'textarea') && (
                    <Textarea
                      data-testid={`textarea-q${question.id}`}
                      value={answers[question.id.toString()] || ""}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [question.id.toString()]: e.target.value }))}
                      placeholder={question.placeholder || "Enter your response..."}
                      className="min-h-24"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentSection === 0}
            data-testid="button-back"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {isLastSection ? (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              data-testid="button-submit"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Survey"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              data-testid="button-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
