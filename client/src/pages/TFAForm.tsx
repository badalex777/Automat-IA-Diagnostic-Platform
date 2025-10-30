import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TFAQuestionCard from "@/components/TFAQuestionCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { tfaSections } from "@shared/tfaQuestions";
import { getUITranslation, getSectionTranslation, getQuestionTranslation, getGapMetadataTranslation } from "@shared/tfaTranslations";
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
  const [respondentName, setRespondentName] = useState("");
  const [respondentRole, setRespondentRole] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const [gapDetails, setGapDetails] = useState<Record<string, { why: string; whoMightKnow: string }>>({});
  
  // TFA-specific language state (independent from admin UI)
  const [language, setLanguage] = useState<'en' | 'es'>(() => {
    const saved = localStorage.getItem('tfa-language');
    return (saved === 'es' || saved === 'en') ? saved : 'en';
  });
  
  // Persist language choice to localStorage
  useEffect(() => {
    localStorage.setItem('tfa-language', language);
  }, [language]);
  
  // Get translations
  const t = getUITranslation(language);
  const gapMeta = getGapMetadataTranslation(language);

  const { data: tfaData, isLoading, error } = useQuery<TFAData>({
    queryKey: [`/api/tfa/shareable/${shareableLink}`],
    enabled: !!shareableLink,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: t.errorLoadingAssessment,
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast, t.errorLoadingAssessment]);

  const totalQuestions = tfaSections.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const submitMutation = useMutation({
    mutationFn: async (data: { 
      responses: Record<string, string>; 
      comments?: string; 
      initialRespondent?: string;
      initialRespondentRole?: string;
      gapMetadata?: Record<string, { why: string; whoMightKnow: string }>;
    }) => {
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
        title: t.submissionFailed,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!respondentName.trim()) {
      toast({
        title: t.nameRequired,
        description: t.nameRequiredDescription,
        variant: "destructive",
      });
      return;
    }
    if (!respondentRole.trim()) {
      toast({
        title: language === 'en' ? "Role required" : "Rol requerido",
        description: language === 'en' ? "Please provide your role or title" : "Por favor proporcione su rol o título",
        variant: "destructive",
      });
      return;
    }
    if (answeredQuestions < totalQuestions) {
      toast({
        title: t.incompleteAssessment,
        description: t.incompleteAssessmentDescription,
        variant: "destructive",
      });
      return;
    }
    
    // Check if gaps exist and require gap details
    const gapsExist = Object.values(answers).some(v => v === "0");
    if (gapsExist) {
      const gapQuestionIds = Object.entries(answers)
        .filter(([, value]) => value === "0")
        .map(([id]) => id);
      
      const missingGapDetails = gapQuestionIds.some(id => 
        !gapDetails[id] || !gapDetails[id].why.trim() || !gapDetails[id].whoMightKnow.trim()
      );
      
      if (missingGapDetails) {
        toast({
          title: t.gapDetailsRequired,
          description: t.gapDetailsRequiredDescription,
          variant: "destructive",
        });
        return;
      }
    }
    
    submitMutation.mutate({ 
      responses: answers, 
      comments: comments || undefined,
      initialRespondent: respondentName.trim(),
      initialRespondentRole: respondentRole.trim(),
      gapMetadata: gapsExist ? gapDetails : undefined,
    });
  };

  const handleSectionChange = (newSection: number) => {
    setCurrentSection(newSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    // Validate respondent name and role if on first section
    if (currentSection === 0 && !respondentName.trim()) {
      toast({
        title: t.nameRequired,
        description: t.nameRequiredDescription,
        variant: "destructive",
      });
      return;
    }
    if (currentSection === 0 && !respondentRole.trim()) {
      toast({
        title: language === 'en' ? "Role required" : "Rol requerido",
        description: language === 'en' ? "Please provide your role or title" : "Por favor proporcione su rol o título",
        variant: "destructive",
      });
      return;
    }

    // Validate required questions in current section before proceeding
    if (currentSection < tfaSections.length) {
      const currentTFASection = tfaSections[currentSection];
      const sectionQuestions = currentTFASection.questions;
      const missingSectionAnswers = sectionQuestions.filter(q => !answers[q.id.toString()]);
      
      if (missingSectionAnswers.length > 0) {
        toast({
          title: t.requiredQuestions,
          description: t.requiredQuestionsDescription.replace('{count}', missingSectionAnswers.length.toString()),
          variant: "destructive",
        });
        return;
      }
    }

    // Validate gap details if on gap details section
    if (isGapDetailsSection) {
      const gapQuestionIds = Object.entries(answers)
        .filter(([, value]) => value === "0")
        .map(([id]) => id);
      
      const missingGapDetails = gapQuestionIds.some(id => 
        !gapDetails[id] || !gapDetails[id].why.trim() || !gapDetails[id].whoMightKnow.trim()
      );
      
      if (missingGapDetails) {
        toast({
          title: t.gapDetailsRequired,
          description: t.gapDetailsRequiredDescription,
          variant: "destructive",
        });
        return;
      }
    }

    setCurrentSection(prev => Math.min(prev + 1, totalSections - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t.loadingAssessment}</p>
      </div>
    );
  }

  if (!tfaData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t.assessmentNotFound}</p>
      </div>
    );
  }

  const { company, workflow } = tfaData;
  
  // Determine if we have knowledge gaps
  const hasKnowledgeGaps = Object.values(answers).some(v => v === "0");
  const gapQuestions = hasKnowledgeGaps 
    ? Object.entries(answers)
        .filter(([, value]) => value === "0")
        .map(([id]) => {
          const allQuestions = tfaSections.flatMap(s => s.questions);
          return allQuestions.find(q => q.id.toString() === id);
        })
        .filter(Boolean)
    : [];
  
  // Section flow: 0-5 (questions) → 6 (gap details if exists) → 7/6 (final comments)
  const totalSections = tfaSections.length + (hasKnowledgeGaps ? 1 : 0) + 1; // questions + gap details (conditional) + comments
  const isGapDetailsSection = hasKnowledgeGaps && currentSection === tfaSections.length;
  const isFinalCommentsSection = currentSection === totalSections - 1;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Select value={language} onValueChange={(value: 'en' | 'es') => setLanguage(value)}>
                  <SelectTrigger className="w-[180px]" data-testid="select-language">
                    <Languages className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <h1 className="text-2xl font-semibold" data-testid="text-tfa-title">{t.title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{company.name} • {workflow.name}</p>
              {workflow.description && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-workflow-description">{workflow.description}</p>
              )}
            </div>
            <ThemeToggle />
          </div>

          <div className="bg-muted/50 rounded-lg p-4 mb-4 space-y-2">
            <p className="text-sm font-medium">{t.aboutAssessment}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t.aboutDescription}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>{language === 'en' ? 'Important:' : 'Importante:'}</strong> {t.importantNotice}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.progress}</span>
              <span className="font-mono">{answeredQuestions} / {totalQuestions}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {currentSection === 0 && (
          <div className="mb-8 p-4 bg-muted/50 rounded-lg border border-border space-y-4">
            <div>
              <Label htmlFor="respondent-name" className="text-sm font-medium">{t.yourName}</Label>
              <Input
                id="respondent-name"
                placeholder={t.enterFullName}
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                className="mt-2"
                data-testid="input-respondent-name"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {t.nameHelperText}
              </p>
            </div>
            <div>
              <Label htmlFor="respondent-role" className="text-sm font-medium">
                {language === 'en' ? 'Your Role/Title' : 'Su Rol/Título'}
              </Label>
              <Input
                id="respondent-role"
                placeholder={language === 'en' ? 'e.g., IT Director, Operations Manager' : 'ej., Director de TI, Gerente de Operaciones'}
                value={respondentRole}
                onChange={(e) => setRespondentRole(e.target.value)}
                className="mt-2"
                data-testid="input-respondent-role"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {language === 'en' 
                  ? 'Your role helps us understand your perspective on technical capabilities' 
                  : 'Su rol nos ayuda a comprender su perspectiva sobre las capacidades técnicas'}
              </p>
            </div>
          </div>
        )}

        {currentSection < tfaSections.length ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold" data-testid="text-section-title">
                {t.section} {currentSection + 1}: {getSectionTranslation(tfaSections[currentSection].section, language).name}
              </h2>
              {tfaSections[currentSection].description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {getSectionTranslation(tfaSections[currentSection].section, language).description}
                </p>
              )}
            </div>
            
            <div className="space-y-8">
              {tfaSections[currentSection].questions.map((q) => {
                const questionTranslation = getQuestionTranslation(q.id, language);
                return (
                  <TFAQuestionCard
                    key={q.id}
                    questionNumber={q.id}
                    question={questionTranslation.question}
                    weight={q.weight}
                    options={q.options.map(opt => ({
                      ...opt,
                      label: questionTranslation.options[opt.value]?.label || opt.label,
                      description: questionTranslation.options[opt.value]?.description || opt.description
                    }))}
                    value={answers[q.id.toString()]}
                    onChange={(value) => setAnswers({ ...answers, [q.id.toString()]: value })}
                  />
                );
              })}
            </div>
          </>
        ) : isGapDetailsSection ? (
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{t.knowledgeGapDetails}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'en' ? `You selected "Don't Know/Not Sure" for ${gapQuestions.length} ` : `Seleccionó "No sé / No estoy seguro" para ${gapQuestions.length} `}
                {t.knowledgeGapDescription.replace('{s}', gapQuestions.length > 1 ? 's' : '')}
              </p>
            </div>

            <div className="space-y-6">
              {gapQuestions.map((q) => {
                if (!q) return null;
                const questionId = q.id.toString();
                const questionTranslation = getQuestionTranslation(q.id, language);
                return (
                  <div key={questionId} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="font-medium text-sm">
                      {t.question} {q.id}: {questionTranslation.question}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`gap-why-${questionId}`}>
                          {gapMeta.whyCantAnswer}
                        </Label>
                        <Textarea
                          id={`gap-why-${questionId}`}
                          placeholder={t.dontKnowGapPlaceholder}
                          value={gapDetails[questionId]?.why || ''}
                          onChange={(e) => setGapDetails({
                            ...gapDetails,
                            [questionId]: {
                              ...gapDetails[questionId],
                              why: e.target.value,
                              whoMightKnow: gapDetails[questionId]?.whoMightKnow || '',
                            }
                          })}
                          className="mt-2 min-h-[80px]"
                          data-testid={`input-gap-why-${questionId}`}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`gap-who-${questionId}`}>
                          {gapMeta.whoMightKnow}
                        </Label>
                        <Input
                          id={`gap-who-${questionId}`}
                          placeholder={t.whoMightKnowPlaceholder}
                          value={gapDetails[questionId]?.whoMightKnow || ''}
                          onChange={(e) => setGapDetails({
                            ...gapDetails,
                            [questionId]: {
                              ...gapDetails[questionId],
                              why: gapDetails[questionId]?.why || '',
                              whoMightKnow: e.target.value,
                            }
                          })}
                          className="mt-2"
                          data-testid={`input-gap-who-${questionId}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isFinalCommentsSection ? (
          <div className="space-y-6">
            {!respondentName.trim() && (
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <Label htmlFor="respondent-name-final" className="text-sm font-medium">{t.yourName}</Label>
                <Input
                  id="respondent-name-final"
                  placeholder={t.enterFullName}
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="mt-2"
                  data-testid="input-respondent-name-final"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {t.pleaseEnterNameBeforeSubmitting}
                </p>
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-2">{t.additionalComments}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t.additionalCommentsDescription}
              </p>
              <div className="space-y-2">
                <Label htmlFor="comments">{t.commentsOptional}</Label>
                <Textarea
                  id="comments"
                  placeholder={t.commentsPlaceholder}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="min-h-[150px]"
                  data-testid="input-tfa-comments"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <Button 
            variant="outline" 
            disabled={currentSection === 0}
            onClick={() => handleSectionChange(currentSection - 1)}
            data-testid="button-previous-section"
          >
            {t.previous}
          </Button>
          <div className="flex gap-3">
            {!isFinalCommentsSection ? (
              <Button 
                onClick={handleNext}
                data-testid="button-next-section"
              >
                {t.next}
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={submitMutation.isPending}
                data-testid="button-submit-tfa"
              >
                {submitMutation.isPending ? t.submitting : t.submitAssessment}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
