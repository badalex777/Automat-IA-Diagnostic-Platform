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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ChevronLeft, ChevronRight, Languages } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAllPIFQuestions, PIF_SECTIONS } from "@shared/pifQuestions";
import { pifTranslations } from "@shared/pifTranslations";
import type { Workflow, Company, PIFResponse } from "@shared/schema";

interface PIFData {
  shareableId: string;
  companyName: string;
  workflowName: string;
  stepId: string;
}

export default function PIFForm() {
  const [, params] = useRoute("/pif/:shareableId");
  const [, setLocation] = useLocation();
  const shareableId = params?.shareableId || '';
  const { toast } = useToast();
  
  const ALL_PIF_QUESTIONS = getAllPIFQuestions();
  
  // Language state with localStorage persistence (independent from admin UI)
  const [language, setLanguage] = useState<'en' | 'es'>(() => {
    const saved = localStorage.getItem("pif-language");
    return (saved === 'en' || saved === 'es') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem("pif-language", language);
  }, [language]);

  const t = pifTranslations[language];
  
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentRole, setRespondentRole] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [respondentResponsibilities, setRespondentResponsibilities] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [codeValidated, setCodeValidated] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);

  // Fetch basic metadata (no code validation required)
  const { data: pifData, isLoading, error } = useQuery<PIFData>({
    queryKey: [`/api/pif/shareable/${shareableId}`],
    enabled: !!shareableId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: t.ui.errorLoadingSurvey,
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [error, toast, t]);

  // Function to validate access code
  const validateAccessCode = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: language === 'en' ? 'Verification Code Required' : 'Código de Verificación Requerido',
        description: language === 'en' 
          ? 'Please enter the verification code to continue.' 
          : 'Por favor ingrese el código de verificación para continuar.',
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }

    setIsValidatingCode(true);
    try {
      await apiRequest('POST', `/api/pif/shareable/${shareableId}/validate-code`, {
        verificationCode: verificationCode.trim()
      });
      setCodeValidated(true);
      return true;
    } catch (error: any) {
      toast({
        title: language === 'en' ? 'Invalid Verification Code' : 'Código de Verificación Inválido',
        description: error.message || (language === 'en' 
          ? 'The verification code you entered is incorrect. Please check and try again.' 
          : 'El código de verificación que ingresó es incorrecto. Por favor verifique e intente nuevamente.'),
        variant: "destructive",
        duration: 5000,
      });
      return false;
    } finally {
      setIsValidatingCode(false);
    }
  };

  const submitMutation = useMutation({
    mutationFn: async (data: { 
      respondentName: string;
      respondentRole: string;
      respondentResponsibilities?: string;
      verificationCode: string;
      responses: Record<string, string>;
      stepId?: string;
      shareableId: string;
    }) => {
      return await apiRequest('POST', `/api/pif/shareable/${data.shareableId}/submit`, data);
    },
    onSuccess: () => {
      setLocation(`/pif/${shareableId}/thank-you`);
    },
    onError: (error: Error) => {
      toast({
        title: t.ui.submissionFailed,
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSubmit = () => {
    if (!respondentName.trim()) {
      toast({
        title: t.ui.nameRequired,
        description: t.ui.nameRequiredDescription,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (!respondentRole.trim()) {
      toast({
        title: t.ui.roleRequired,
        description: t.ui.roleRequiredDescription,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (!respondentResponsibilities.trim()) {
      toast({
        title: t.ui.responsibilitiesRequired,
        description: t.ui.responsibilitiesRequiredDescription,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    if (!verificationCode.trim()) {
      toast({
        title: language === 'en' ? 'Verification Code Required' : 'Código de Verificación Requerido',
        description: language === 'en' 
          ? 'Please enter the verification code provided by your consultant.' 
          : 'Por favor ingrese el código de verificación proporcionado por su consultor.',
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Check all required questions are answered
    const q21Answer = answers['21']; // Q21 is now the Quality Impact yes/no question
    const isErrorProne = q21Answer === 'yes';
    
    const requiredQuestions = ALL_PIF_QUESTIONS.filter(q => {
      // All text/textarea are optional (no qualitative questions anymore)
      if (q.type === 'text' || q.type === 'textarea') return false;
      // Quality Impact questions (Q22-Q29) only required if Q21 = yes
      if (q.id >= 22 && q.id <= 29 && !isErrorProne) return false;
      return true;
    });
    
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id.toString()]);

    if (missingAnswers.length > 0) {
      toast({
        title: t.ui.incompleteSurvey,
        description: `${t.ui.incompleteSurveyDescription} ${missingAnswers.length} ${t.ui.requiredQuestionsDescription.split('.')[0]}.`,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    submitMutation.mutate({ 
      respondentName: respondentName.trim(),
      respondentRole: respondentRole.trim(),
      respondentResponsibilities: respondentResponsibilities.trim(),
      verificationCode: verificationCode.trim().toUpperCase(),
      shareableId,
      responses: answers,
      stepId: pifData?.stepId, // Include stepId from metadata
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t.ui.loadingSurvey}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-semibold">Survey Not Found</h1>
          <p className="text-muted-foreground">
            {error.message || "This survey link is invalid or has expired."}
          </p>
        </div>
      </div>
    );
  }

  if (!pifData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">{t.ui.surveyNotFound}</p>
      </div>
    );
  }

  // Section definitions: 0 = Disclaimer, 1 = Respondent Info, 2-9 = PIF sections
  const sections = PIF_SECTIONS;

  const totalSections = sections.length + 2; // +2 for disclaimer and respondent info
  const isDisclaimerSection = currentSection === 0;
  const isRespondentInfoSection = currentSection === 1;
  const currentPIFSection = (isDisclaimerSection || isRespondentInfoSection) ? null : sections[currentSection - 2];

  // Check if Q21 indicates quality impact (yes means show Quality Impact module)
  const isErrorProne = answers['21'] === 'yes';

  // Calculate progress - include required questions only
  const requiredQuestionsCount = ALL_PIF_QUESTIONS.filter(q => {
    // All text/textarea are optional (no qualitative questions)
    if (q.type === 'text' || q.type === 'textarea') return false;
    // Quality Impact questions (Q22-Q29) only required if Q21 = yes
    if (q.id >= 22 && q.id <= 29 && !isErrorProne) return false;
    return true;
  }).length;
  const answeredCount = Object.keys(answers).filter(id => {
    const q = ALL_PIF_QUESTIONS.find(q => q.id.toString() === id);
    if (!q) return false;
    // All text/textarea are optional (no qualitative questions)
    if (q.type === 'text' || q.type === 'textarea') return false;
    // Quality Impact questions (Q22-Q29) only required if Q21 = yes
    if (q.id >= 22 && q.id <= 29 && !isErrorProne) return false;
    return true;
  }).length;
  const progress = requiredQuestionsCount > 0 ? (answeredCount / requiredQuestionsCount) * 100 : 0;

  const handleNext = async () => {
    // Block progression beyond disclaimer if code hasn't been validated
    if (currentSection === 0) {
      // Disclaimer section - require disclaimer acceptance and validate code
      if (!disclaimerAccepted) {
        toast({
          title: t.ui.acceptanceRequired,
          description: t.ui.acceptanceRequiredDescription,
          variant: "destructive",
        duration: 5000,
        });
        return;
      }
      // Validate access code before allowing progression
      const isValid = await validateAccessCode();
      if (!isValid) {
        return; // Stay on disclaimer section if code is invalid
      }
    } else if (!codeValidated) {
      // Safety check: prevent navigation beyond disclaimer if code not validated
      toast({
        title: language === 'en' ? 'Access Restricted' : 'Acceso Restringido',
        description: language === 'en' 
          ? 'Please complete the disclaimer section first.' 
          : 'Por favor complete la sección de descargo de responsabilidad primero.',
        variant: "destructive",
        duration: 5000,
      });
      setCurrentSection(0); // Force back to disclaimer
      return;
    }
    
    if (currentSection === 1) {
      // Respondent Info section
      if (!respondentName.trim() || !respondentRole.trim() || !respondentResponsibilities.trim()) {
        toast({
          title: t.ui.requiredFields,
          description: t.ui.requiredFieldsDescription,
          variant: "destructive",
        duration: 5000,
        });
        return;
      }
    } else {
      // Validate required questions in current section before proceeding
      const currentPIFSection = sections[currentSection - 2]; // -2 because section 0 is disclaimer, section 1 is respondent info
      if (currentPIFSection) {
        const sectionRequiredQuestions = currentPIFSection.questions.filter(q => {
          // All text/textarea are optional (no qualitative questions)
          if (q.type === 'text' || q.type === 'textarea') return false;
          // Quality Impact questions (Q22-Q29) only required if Q21 = yes
          if (q.id >= 22 && q.id <= 29) {
            const q21Answer = answers['21'];
            const isErrorProne = q21Answer === 'yes';
            return isErrorProne;
          }
          return true;
        });
        
        const missingSectionAnswers = sectionRequiredQuestions.filter(q => !answers[q.id.toString()]);
        
        if (missingSectionAnswers.length > 0) {
          toast({
            title: t.ui.requiredQuestions,
            description: `${t.ui.requiredQuestionsDescription} ${missingSectionAnswers.length} question(s) remaining.`,
            variant: "destructive",
        duration: 5000,
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
  
  // Filter questions based on Q21 (conditional Quality Impact)
  const getVisibleQuestions = (questions: typeof ALL_PIF_QUESTIONS) => {
    return questions.filter(q => {
      // Quality Impact questions (Q22-Q29) only shown if quality impact exists (Q21 = yes)
      if (q.id >= 22 && q.id <= 29) {
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
            <div className="flex-1">
              <h1 className="text-2xl font-semibold" data-testid="text-pif-title">{t.ui.title}</h1>
              {pifData && (
                <p className="text-sm text-muted-foreground mt-1">{pifData.companyName} • {pifData.workflowName}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <Select value={language} onValueChange={(value: 'en' | 'es') => setLanguage(value)}>
                  <SelectTrigger className="w-32" data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <ThemeToggle />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t.ui.section} {currentSection + 1} {t.ui.of} {totalSections}</span>
              <span className="text-muted-foreground">{Math.round(progress)}% {t.ui.complete}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {isDisclaimerSection ? (
          <div className="space-y-6">
            {/* Verification Code Section */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-2">
                {language === 'en' ? 'Verification Code Required' : 'Código de Verificación Requerido'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {language === 'en' 
                  ? 'Enter the verification code provided with this survey link. This code was shared by your consultant.' 
                  : 'Ingrese el código de verificación proporcionado con este enlace de encuesta. Este código fue compartido por su consultor.'}
              </p>
              <div className="max-w-md">
                <Label htmlFor="verification-code">
                  {language === 'en' ? 'Verification Code' : 'Código de Verificación'}
                </Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder={language === 'en' ? 'PIF-XXXXX' : 'PIF-XXXXX'}
                  className="font-mono text-lg tracking-wider"
                  data-testid="input-verification-code"
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">{t.disclaimer.welcome}</h2>
              <div className="bg-muted/50 border rounded-lg p-6 space-y-4 text-sm">
                <p>
                  {t.disclaimer.paragraph1}
                </p>
                <p>
                  {t.disclaimer.paragraph2}
                </p>
                <p className="font-semibold">
                  {t.disclaimer.paragraph3}
                </p>
                <p>
                  {t.disclaimer.paragraph4}
                </p>
                <p>
                  {t.disclaimer.paragraph5}
                </p>
                <p className="font-semibold">
                  {t.disclaimer.paragraph6}
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
                {t.disclaimer.checkboxLabel}
              </Label>
            </div>
          </div>
        ) : isRespondentInfoSection ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">{t.respondentInfo.title}</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {t.respondentInfo.description}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="respondent-name">{t.respondentInfo.nameLabel} *</Label>
                <Input
                  id="respondent-name"
                  data-testid="input-respondent-name"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder={t.respondentInfo.namePlaceholder}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="respondent-role">{t.respondentInfo.roleLabel} *</Label>
                <Input
                  id="respondent-role"
                  data-testid="input-respondent-role"
                  value={respondentRole}
                  onChange={(e) => setRespondentRole(e.target.value)}
                  placeholder={t.respondentInfo.rolePlaceholder}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="respondent-responsibilities">{t.respondentInfo.responsibilitiesLabel} *</Label>
                <Textarea
                  id="respondent-responsibilities"
                  data-testid="input-respondent-responsibilities"
                  value={respondentResponsibilities}
                  onChange={(e) => setRespondentResponsibilities(e.target.value)}
                  placeholder={t.respondentInfo.responsibilitiesPlaceholder}
                  className="mt-1.5 min-h-24"
                />
              </div>
            </div>
          </div>
        ) : currentPIFSection ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold">
                {currentPIFSection.section === "Process Clarity" && t.sections.processClarity.name}
                {currentPIFSection.section === "Change Magnitude" && t.sections.changeMagnitude.name}
                {currentPIFSection.section === "Workflow Brittleness" && t.sections.workflowBrittleness.name}
                {currentPIFSection.section === "Time Savings" && t.sections.timeSavings.name}
                {currentPIFSection.section === "Revenue Uplift" && t.sections.revenueUplift.name}
                {currentPIFSection.section === "Your Experience & Insights" && t.sections.experienceInsights.name}
                {currentPIFSection.section === "Time & Volume Data" && t.sections.timeVolumeData.name}
                {currentPIFSection.section === "Quality Improvement Potential" && t.sections.qualityImprovementPotential.name}
              </h2>
              {currentPIFSection.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {currentPIFSection.section === "Process Clarity" && t.sections.processClarity.description}
                  {currentPIFSection.section === "Change Magnitude" && t.sections.changeMagnitude.description}
                  {currentPIFSection.section === "Workflow Brittleness" && t.sections.workflowBrittleness.description}
                  {currentPIFSection.section === "Time Savings" && t.sections.timeSavings.description}
                  {currentPIFSection.section === "Revenue Uplift" && t.sections.revenueUplift.description}
                  {currentPIFSection.section === "Your Experience & Insights" && t.sections.experienceInsights.description}
                  {currentPIFSection.section === "Time & Volume Data" && t.sections.timeVolumeData.description}
                  {currentPIFSection.section === "Quality Improvement Potential" && t.sections.qualityImprovementPotential.description}
                </p>
              )}
            </div>

            <div className="space-y-8">
              {getVisibleQuestions(currentPIFSection.questions).map((question) => {
                const questionTranslation = t.questions[question.id];
                return (
                  <div key={question.id} className="space-y-3">
                    <Label className="text-base">
                      Q{question.id}. {questionTranslation?.question || question.question}
                      {(question.type === 'text' || question.type === 'textarea') && <span className="text-muted-foreground ml-1">(Optional)</span>}
                    </Label>

                    {question.type === 'radio' && question.options && (
                      <RadioGroup
                        value={answers[question.id.toString()] || ""}
                        onValueChange={(value) => setAnswers(prev => ({ ...prev, [question.id.toString()]: value }))}
                      >
                        {question.options.map((option, index) => {
                          // For Q11, detect department headers from description prefix
                          const optionTranslation = questionTranslation?.options?.[option.value];
                          const isDepartmentHeader = question.id === 11 && 
                            option.description && 
                            option.description.includes(':') && 
                            (index === 0 || 
                             (question.options?.[index - 1]?.description?.split(':')[0] !== option.description.split(':')[0]));
                          
                          const departmentName = question.id === 11 && optionTranslation?.description 
                            ? optionTranslation.description.split(':')[0] 
                            : (question.id === 11 && option.description ? option.description.split(':')[0] : null);
                          
                          return (
                            <div key={option.value}>
                              {isDepartmentHeader && departmentName && (
                                <div className="font-semibold text-sm text-foreground mt-4 mb-2 first:mt-0">
                                  {departmentName}
                                </div>
                              )}
                              <div className="flex items-start space-x-2">
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
                                    {optionTranslation?.label || option.label}
                                  </Label>
                                  {(optionTranslation?.description || option.description) && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                      {question.id === 11 
                                        ? (optionTranslation?.description || option.description)?.split(':')[1]?.trim() || ''
                                        : (optionTranslation?.description || option.description)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}

                    {question.type === 'number' && (
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        data-testid={`input-q${question.id}`}
                        value={answers[question.id.toString()] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [question.id.toString()]: e.target.value }))}
                        placeholder={questionTranslation?.placeholder || question.placeholder || "Enter a number"}
                      />
                    )}

                    {(question.type === 'text' || question.type === 'textarea') && (
                      <Textarea
                        data-testid={`textarea-q${question.id}`}
                        value={answers[question.id.toString()] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [question.id.toString()]: e.target.value }))}
                        placeholder={questionTranslation?.placeholder || question.placeholder || "Enter your response..."}
                        className="min-h-24"
                      />
                    )}
                  </div>
                );
              })}
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
            {t.ui.previous}
          </Button>

          {isLastSection ? (
            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              data-testid="button-submit"
            >
              {submitMutation.isPending ? t.ui.submitting : t.ui.submit}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              data-testid="button-next"
            >
              {t.ui.next}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
