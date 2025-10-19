import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Home, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Documentation() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("platform-overview");

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const tocSections = [
    { id: "platform-overview", label: t.documentation.platformOverview.title },
    { id: "user-journey", label: t.documentation.userJourney.title },
    { id: "tfa-methodology", label: t.documentation.tfaMethodology.title },
    { id: "pif-methodology", label: t.documentation.pifMethodology.title },
    { id: "readiness-rubric", label: t.documentation.readinessRubric.title },
    { id: "opportunity-matrix", label: t.documentation.opportunityMatrix.title },
    { id: "roi-calculations", label: t.documentation.roiCalculations.title },
    { id: "formulas-reference", label: t.documentation.formulasReference.title },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border sticky top-0 z-50 bg-background">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-home">
                  <Home className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-semibold" data-testid="text-page-title">
                  {t.documentation.title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-full mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t.documentation.tableOfContents}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <nav className="space-y-1 p-4">
                      {tocSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover-elevate ${
                            activeSection === section.id
                              ? "bg-accent text-accent-foreground font-medium"
                              : "text-muted-foreground"
                          }`}
                          data-testid={`button-toc-${section.id}`}
                        >
                          {section.label}
                        </button>
                      ))}
                    </nav>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main Documentation Content */}
          <div className="flex-1 max-w-4xl">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="space-y-8 pb-12">
                
                {/* Platform Overview */}
                <section id="platform-overview" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.platformOverview.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.platformOverview.purpose}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.platformOverview.purposeContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.platformOverview.targetUsers}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.platformOverview.targetUsersContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.platformOverview.keyBenefits}</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">{t.documentation.platformOverview.benefit1}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">{t.documentation.platformOverview.benefit2}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">{t.documentation.platformOverview.benefit3}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span className="text-muted-foreground">{t.documentation.platformOverview.benefit4}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.platformOverview.workflowProgression}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.platformOverview.workflowProgressionContent}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* User Journey */}
                <section id="user-journey" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.userJourney.title}</CardTitle>
                      <CardDescription>{t.documentation.userJourney.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-primary">{t.documentation.userJourney.step1Title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.userJourney.step1Content}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-primary">{t.documentation.userJourney.step2Title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.userJourney.step2Content}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-primary">{t.documentation.userJourney.step3Title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.userJourney.step3Content}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-primary">{t.documentation.userJourney.step4Title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.userJourney.step4Content}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-primary">{t.documentation.userJourney.step5Title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.userJourney.step5Content}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-primary">{t.documentation.userJourney.step6Title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.userJourney.step6Content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* TFA Methodology */}
                <section id="tfa-methodology" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.tfaMethodology.title}</CardTitle>
                      <CardDescription>{t.documentation.tfaMethodology.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.tfaMethodology.questionsStructure}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.tfaMethodology.questionsStructureContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.tfaMethodology.sectionWeights}</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1 font-mono text-sm">25%</span>
                            <span className="text-muted-foreground">{t.documentation.tfaMethodology.systemEnvironment}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1 font-mono text-sm">30%</span>
                            <span className="text-muted-foreground">{t.documentation.tfaMethodology.dataQuality}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1 font-mono text-sm">30%</span>
                            <span className="text-muted-foreground">{t.documentation.tfaMethodology.integrationFeasibility}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1 font-mono text-sm">15%</span>
                            <span className="text-muted-foreground">{t.documentation.tfaMethodology.securityCompliance}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.tfaMethodology.scoringAlgorithm}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {t.documentation.tfaMethodology.scoringAlgorithmContent}
                        </p>
                        <div className="bg-muted p-4 rounded-md font-mono text-sm">
                          TFA = [(System Environment × 0.25) + (Data Quality × 0.30) + (Integration × 0.30) + (Security × 0.15)]
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.tfaMethodology.feasibilityBands}</h3>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <span className="bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">80-100</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.tfaMethodology.veryHigh}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">65-79</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.tfaMethodology.high}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">50-64</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.tfaMethodology.moderate}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">35-49</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.tfaMethodology.low}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">&lt;35</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.tfaMethodology.veryLow}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.tfaMethodology.gapDetection}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.tfaMethodology.gapDetectionContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.tfaMethodology.executiveSummary}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.tfaMethodology.executiveSummaryContent}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* PIF Methodology */}
                <section id="pif-methodology" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.pifMethodology.title}</CardTitle>
                      <CardDescription>{t.documentation.pifMethodology.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.pifMethodology.questionsStructure}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.pifMethodology.questionsStructureContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.pifMethodology.sections}</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">1.</span>
                            <span className="text-muted-foreground">{t.documentation.pifMethodology.section1}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">2.</span>
                            <span className="text-muted-foreground">{t.documentation.pifMethodology.section2}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">3.</span>
                            <span className="text-muted-foreground">{t.documentation.pifMethodology.section3}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">4.</span>
                            <span className="text-muted-foreground">{t.documentation.pifMethodology.section4}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">5.</span>
                            <span className="text-muted-foreground">{t.documentation.pifMethodology.section5}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">6.</span>
                            <span className="text-muted-foreground">{t.documentation.pifMethodology.section6}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">7.</span>
                            <span className="text-muted-foreground">{t.documentation.pifMethodology.section7}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-primary mt-1">8.</span>
                            <span className="text-muted-foreground">{t.documentation.pifMethodology.section8}</span>
                          </li>
                        </ul>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.pifMethodology.operationalScores}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.pifMethodology.operationalScoresContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.pifMethodology.roiDataExtraction}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.pifMethodology.roiDataExtractionContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.pifMethodology.qualitativeInsights}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.pifMethodology.qualitativeInsightsContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.pifMethodology.multiRespondent}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.pifMethodology.multiRespondentContent}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Readiness Rubric */}
                <section id="readiness-rubric" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.readinessRubric.title}</CardTitle>
                      <CardDescription>{t.documentation.readinessRubric.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.readinessRubric.weightingFormula}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {t.documentation.readinessRubric.weightingFormulaContent}
                        </p>
                        <div className="bg-muted p-4 rounded-md font-mono text-sm">
                          Readiness = (TFA × 0.60) + (PIF × 0.40)
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.readinessRubric.componentBreakdown}</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">18%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component1}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">18%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component2}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">15%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component3}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">12%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component4}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">12%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component5}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">9%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component6}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">6%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component7}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.readinessRubric.feasibilityBanding}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.readinessRubric.feasibilityBandingContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.readinessRubric.swotAnalysis}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.readinessRubric.swotAnalysisContent}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Opportunity Matrix */}
                <section id="opportunity-matrix" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.opportunityMatrix.title}</CardTitle>
                      <CardDescription>{t.documentation.opportunityMatrix.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.businessImpactScoring}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.opportunityMatrix.businessImpactScoringContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.multiplierExplanation}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.opportunityMatrix.multiplierExplanationContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.opportunityMatrix.filterViews}</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-sm mb-1 text-primary">{t.documentation.opportunityMatrix.filter1Title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{t.documentation.opportunityMatrix.filter1Content}</p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs mt-2">
                              Impact = (ROI × 0.60) + (Hours × 0.40)
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1 text-primary">{t.documentation.opportunityMatrix.filter2Title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{t.documentation.opportunityMatrix.filter2Content}</p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs mt-2">
                              Impact = (ROI × 0.45) + (Hours × 0.30) + (Error × 0.25)
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1 text-primary">{t.documentation.opportunityMatrix.filter3Title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{t.documentation.opportunityMatrix.filter3Content}</p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs mt-2">
                              Impact = (ROI × 0.45) + (Hours × 0.30) + (Revenue × 0.25)
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1 text-primary">{t.documentation.opportunityMatrix.filter4Title}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{t.documentation.opportunityMatrix.filter4Content}</p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs mt-2">
                              Impact = (ROI × 0.40) + (Hours × 0.30) + (Error × 0.15) + (Revenue × 0.15)
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.scatterPlotInterpretation}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {t.documentation.opportunityMatrix.scatterPlotInterpretationContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.opportunityMatrix.quadrants}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 border border-border rounded-md bg-green-500/5">
                            <h4 className="font-semibold text-sm mb-1 text-green-600 dark:text-green-400">Quick Wins</h4>
                            <p className="text-muted-foreground text-xs">{t.documentation.opportunityMatrix.quadrant1}</p>
                          </div>
                          <div className="p-3 border border-border rounded-md bg-blue-500/5">
                            <h4 className="font-semibold text-sm mb-1 text-blue-600 dark:text-blue-400">Strategic Bets</h4>
                            <p className="text-muted-foreground text-xs">{t.documentation.opportunityMatrix.quadrant2}</p>
                          </div>
                          <div className="p-3 border border-border rounded-md bg-yellow-500/5">
                            <h4 className="font-semibold text-sm mb-1 text-yellow-600 dark:text-yellow-400">Nice-to-Haves</h4>
                            <p className="text-muted-foreground text-xs">{t.documentation.opportunityMatrix.quadrant3}</p>
                          </div>
                          <div className="p-3 border border-border rounded-md bg-red-500/5">
                            <h4 className="font-semibold text-sm mb-1 text-red-600 dark:text-red-400">Deprioritize</h4>
                            <p className="text-muted-foreground text-xs">{t.documentation.opportunityMatrix.quadrant4}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* ROI Calculations */}
                <section id="roi-calculations" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.roiCalculations.title}</CardTitle>
                      <CardDescription>{t.documentation.roiCalculations.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.roiCalculations.annualRoiFormula}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {t.documentation.roiCalculations.annualRoiFormulaContent}
                        </p>
                        <div className="bg-muted p-4 rounded-md font-mono text-xs space-y-1">
                          <div>Annual ROI = (Annual Hours Saved × Hourly Labor Cost) - Implementation Costs</div>
                          <div className="text-muted-foreground">Where:</div>
                          <div className="text-muted-foreground ml-4">Annual Hours Saved = Hours per Week × 52</div>
                          <div className="text-muted-foreground ml-4">Hourly Labor Cost = (Total Labor Costs / Total Employees) / 2080</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.roiCalculations.fteSavingsFormula}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {t.documentation.roiCalculations.fteSavingsFormulaContent}
                        </p>
                        <div className="bg-muted p-4 rounded-md font-mono text-xs">
                          FTE Savings = Annual Hours Saved / 2080 hours
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.roiCalculations.businessImpactScoring}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {t.documentation.roiCalculations.businessImpactScoringContent}
                        </p>
                        <div className="bg-muted p-4 rounded-md font-mono text-xs space-y-2">
                          <div>ROI Score = MIN(100, (Annual ROI / Company Revenue) × 1000)</div>
                          <div>Hours Score = MIN(100, (FTE Savings / Total Employees) × 1000)</div>
                          <div className="text-muted-foreground mt-2">Scoring Guide:</div>
                          <div className="text-muted-foreground ml-4">10% impact = score 100 (exceptional)</div>
                          <div className="text-muted-foreground ml-4">5% impact = score 50 (very good)</div>
                          <div className="text-muted-foreground ml-4">2% impact = score 20 (good)</div>
                          <div className="text-muted-foreground ml-4">1% impact = score 10 (notable)</div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.roiCalculations.implementationEffort}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {t.documentation.roiCalculations.implementationEffortContent}
                        </p>
                        <div className="bg-muted p-4 rounded-md font-mono text-xs space-y-1">
                          <div>Effort = (Inv.Readiness × 0.40) + (Rampup × 0.25) + (Payback × 0.25) + (Training × 0.10)</div>
                          <div className="text-muted-foreground mt-2">Normalization:</div>
                          <div className="text-muted-foreground ml-4">Rampup: 3mo=0, 18mo+=100, linear</div>
                          <div className="text-muted-foreground ml-4">Payback: 6mo=0, 36mo+=100, linear</div>
                          <div className="text-muted-foreground ml-4">Training: 2hr=0, 40hr+=100, linear</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Formulas Reference */}
                <section id="formulas-reference" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.formulasReference.title}</CardTitle>
                      <CardDescription>{t.documentation.formulasReference.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.tfaScore}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.tfaScoreFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.readinessScore}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.readinessScoreFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.roiScore}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.roiScoreFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.hoursScore}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.hoursScoreFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.errorScore}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.errorScoreFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.revenueScore}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.revenueScoreFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.businessImpactBase}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.businessImpactBaseFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.businessImpactError}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.businessImpactErrorFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.businessImpactRevenue}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.businessImpactRevenueFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.businessImpactAll}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.businessImpactAllFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.implementationEffort}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.implementationEffortFormula}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
