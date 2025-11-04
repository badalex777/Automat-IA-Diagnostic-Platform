import { useState, useEffect, useRef } from "react";
import { translations } from "@/lib/translations";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Home, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Documentation() {
  // Force English-only for Platform Handbook (internal consultant resource)
  const t = translations.en;
  const language = 'en';
  const [activeSection, setActiveSection] = useState("platform-overview");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingToSection = useRef(false);

  // Helper function to parse structured content with **bold** headers and • bullets
  const parseStructuredContent = (content: string) => {
    return content.split('**').map((part, i) => {
      if (i % 2 === 1) {
        const [heading, ...bullets] = part.split('•').map(s => s.trim());
        return (
          <div key={i} className="mt-3">
            <h4 className="font-semibold mb-1">{heading.replace(':', '')}</h4>
            <ul className="list-disc ml-6 space-y-1">
              {bullets.filter(b => b).map((bullet, j) => <li key={j}>{bullet}</li>)}
            </ul>
          </div>
        );
      }
      return null;
    });
  };

  const scrollToSection = (sectionId: string) => {
    isScrollingToSection.current = true;
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        isScrollingToSection.current = false;
      }, 1000);
    }
  };

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (isScrollingToSection.current) return;
      
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => {
          const aTop = a.boundingClientRect.top;
          const bTop = b.boundingClientRect.top;
          return Math.abs(aTop) - Math.abs(bTop);
        });

      if (visibleSections.length > 0) {
        const topSection = visibleSections[0];
        const sectionId = topSection.target.getAttribute('id');
        if (sectionId) {
          setActiveSection(sectionId);
        }
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '-100px 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(section => {
      observerRef.current?.observe(section);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Helper function to parse structured content into HTML
  const parseStructuredContentToHTML = (content: string) => {
    return content.split('**').filter((_, i) => i % 2 === 1).map(part => {
      const [heading, ...bullets] = part.split('•').map(s => s.trim());
      return `<h4 style="font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem;">${heading.replace(':', '')}</h4><ul style="margin-left: 1.5rem; margin-bottom: 0.5rem;">${bullets.filter(b => b).map(b => `<li>${b}</li>`).join('')}</ul>`;
    }).join('');
  };

  const handleDownload = () => {
    const doc = t.documentation;
    const filename = 'Automat-IA_Platform_Handbook.html';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6; 
      color: #e5e5e5; 
      background: #0a0a0a;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 { font-size: 32px; margin: 40px 0 16px; color: #ffffff; border-bottom: 3px solid #10b981; padding-bottom: 12px; }
    h2 { font-size: 24px; margin: 32px 0 12px; color: #ffffff; border-bottom: 2px solid #27272a; padding-bottom: 8px; }
    h3 { font-size: 20px; margin: 24px 0 8px; color: #ffffff; }
    h4 { font-size: 16px; margin: 16px 0 8px; color: #e5e5e5; font-weight: 600; }
    p { margin: 12px 0; color: #e5e5e5; }
    ul, ol { margin: 12px 0 12px 24px; color: #e5e5e5; }
    li { margin: 6px 0; }
    .section { margin: 40px 0; page-break-inside: avoid; }
    .subsection { margin: 24px 0; page-break-inside: avoid; }
    .formula { 
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      background: #18181b; 
      padding: 16px; 
      border-left: 4px solid #10b981; 
      margin: 16px 0;
      font-size: 14px;
      overflow-x: auto;
      color: #e5e5e5;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      margin: 4px 4px 4px 0;
    }
    .badge-very-high { background: #065f46; color: #d1fae5; }
    .badge-high { background: #1e40af; color: #dbeafe; }
    .badge-moderate { background: #92400e; color: #fef3c7; }
    .badge-low { background: #9a3412; color: #fed7aa; }
    .badge-very-low { background: #991b1b; color: #fecaca; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #27272a; padding: 12px; text-align: left; color: #e5e5e5; }
    th { background: #18181b; font-weight: 600; color: #ffffff; }
    .toc { background: #18181b; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px solid #27272a; }
    .toc ul { list-style: none; margin: 0; }
    .toc li { margin: 8px 0; }
    .toc a { color: #10b981; text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    @media print {
      body { padding: 20px; background: #0a0a0a; }
      .section { page-break-before: auto; }
      h1, h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <h1>Automat-IA ${doc.title}</h1>
  
  <div class="toc">
    <h2>${doc.tableOfContents}</h2>
    <ul>
      <li><a href="#platform-overview">${doc.platformOverview.title}</a></li>
      <li><a href="#user-journey">${doc.userJourney.title}</a></li>
      <li><a href="#tfa-methodology">${doc.tfaMethodology.title}</a></li>
      <li><a href="#pif-methodology">${doc.pifMethodology.title}</a></li>
      <li><a href="#readiness-rubric">${doc.readinessRubric.title}</a></li>
      <li><a href="#opportunity-matrix">${doc.opportunityMatrix.title}</a></li>
      <li><a href="#roi-calculator-integration">${doc.roiCalculatorIntegration.title}</a></li>
      <li><a href="#data-flow">${doc.dataFlow.title}</a></li>
      <li><a href="#roi-calculations">${doc.roiCalculations.title}</a></li>
      <li><a href="#formulas-reference">${doc.formulasReference.title}</a></li>
    </ul>
  </div>

  <div class="section" id="platform-overview">
    <h2>${doc.platformOverview.title}</h2>
    <p>${doc.platformOverview.purposeContent}</p>
    <h3>${doc.platformOverview.keyBenefits}</h3>
    <ul>
      <li>${doc.platformOverview.benefit1}</li>
      <li>${doc.platformOverview.benefit2}</li>
      <li>${doc.platformOverview.benefit3}</li>
      <li>${doc.platformOverview.benefit4}</li>
    </ul>
  </div>

  <div class="section" id="user-journey">
    <h2>${doc.userJourney.title}</h2>
    <p>${doc.userJourney.intro}</p>
    <ol>
      <li><strong>${doc.userJourney.step1Title}:</strong> ${doc.userJourney.step1Content}</li>
      <li><strong>${doc.userJourney.step2Title}:</strong> ${doc.userJourney.step2Content}</li>
      <li><strong>${doc.userJourney.step3Title}:</strong> ${doc.userJourney.step3Content}</li>
      <li><strong>${doc.userJourney.step4Title}:</strong> ${doc.userJourney.step4Content}</li>
      <li><strong>${doc.userJourney.step5Title}:</strong> ${doc.userJourney.step5Content}</li>
      <li><strong>${doc.userJourney.step6Title}:</strong> ${doc.userJourney.step6Content}</li>
    </ol>
  </div>

  <div class="section" id="tfa-methodology">
    <h2>${doc.tfaMethodology.title}</h2>
    <p>${doc.tfaMethodology.intro}</p>
    <h3>${doc.tfaMethodology.sectionWeights}</h3>
    <ul>
      <li>${doc.tfaMethodology.systemEnvironment}</li>
      <li>${doc.tfaMethodology.dataQuality}</li>
      <li>${doc.tfaMethodology.integrationFeasibility}</li>
      <li>${doc.tfaMethodology.securityCompliance}</li>
    </ul>
    <h3>${doc.tfaMethodology.scoringAlgorithm}</h3>
    <p>${doc.tfaMethodology.scoringAlgorithmContent}</p>
    <h3>${doc.tfaMethodology.feasibilityBands}</h3>
    <p>
      <span class="badge badge-very-high">${doc.tfaMethodology.veryHigh}</span>
      <span class="badge badge-high">${doc.tfaMethodology.high}</span>
      <span class="badge badge-moderate">${doc.tfaMethodology.moderate}</span>
      <span class="badge badge-low">${doc.tfaMethodology.low}</span>
      <span class="badge badge-very-low">${doc.tfaMethodology.veryLow}</span>
    </p>
  </div>

  <div class="section" id="pif-methodology">
    <h2>${doc.pifMethodology.title}</h2>
    <p>${doc.pifMethodology.intro}</p>
    <h3>${doc.pifMethodology.sections}</h3>
    <ul>
      <li>${doc.pifMethodology.section1}</li>
      <li>${doc.pifMethodology.section2}</li>
      <li>${doc.pifMethodology.section3}</li>
      <li>${doc.pifMethodology.section4}</li>
      <li>${doc.pifMethodology.section5}</li>
      <li>${doc.pifMethodology.section6}</li>
      <li>${doc.pifMethodology.section7}</li>
      <li>${doc.pifMethodology.section8}</li>
    </ul>
    <h3>${doc.pifMethodology.stepLevelCollection}</h3>
    <p>${doc.pifMethodology.stepLevelCollectionContent}</p>
  </div>

  <div class="section" id="readiness-rubric">
    <h2>${doc.readinessRubric.title}</h2>
    <p>${doc.readinessRubric.intro}</p>
    <h3>${doc.readinessRubric.assessmentArchitecture}</h3>
    <p>${doc.readinessRubric.assessmentArchitectureContent}</p>
    <h3>${doc.readinessRubric.weightingFormula}</h3>
    <div class="formula">${doc.readinessRubric.weightingFormulaContent}</div>
    <h3>${doc.readinessRubric.componentBreakdown}</h3>
    <ul>
      <li>${doc.readinessRubric.component1}</li>
      <li>${doc.readinessRubric.component2}</li>
      <li>${doc.readinessRubric.component3}</li>
      <li>${doc.readinessRubric.component4}</li>
      <li>${doc.readinessRubric.component5}</li>
      <li>${doc.readinessRubric.component6}</li>
      <li>${doc.readinessRubric.component7}</li>
    </ul>
    <h3>${doc.readinessRubric.weightNormalization}</h3>
    <p>${doc.readinessRubric.weightNormalizationContent}</p>
    <div class="subsection">
      <h4>${doc.readinessRubric.tfaComponentsTitle}</h4>
      <p>${doc.readinessRubric.tfaComponentsContent}</p>
      <div class="formula">
        System Environment: 25% × 0.60 = 15%<br>
        Data Quality: 30% × 0.60 = 18%<br>
        Integration Feasibility: 30% × 0.60 = 18%<br>
        Security & Compliance: 15% × 0.60 = 9%
      </div>
    </div>
    <div class="subsection">
      <h4>${doc.readinessRubric.pifComponentsTitle}</h4>
      <p>${doc.readinessRubric.pifComponentsContent}</p>
      <div class="formula">
        Process Clarity: 37.5% × 0.40 = 15%<br>
        Change Magnitude: 37.5% × 0.40 = 15%<br>
        Workflow Brittleness: 25% × 0.40 = 10%
      </div>
    </div>
    <p style="margin-top: 1rem; padding: 0.75rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; font-size: 0.9rem;">${doc.readinessRubric.normalizationNote}</p>
  </div>

  <div class="section" id="opportunity-matrix">
    <h2>${doc.opportunityMatrix.title}</h2>
    <p>${doc.opportunityMatrix.intro}</p>
    <h3>${doc.opportunityMatrix.businessImpactScoring}</h3>
    <p>${doc.opportunityMatrix.businessImpactScoringContent}</p>
    <h3>${doc.opportunityMatrix.implementationEffortScoring}</h3>
    <p>${doc.opportunityMatrix.implementationEffortScoringContent}</p>
    <h3>${doc.opportunityMatrix.quadrants}</h3>
    <ul>
      <li>${doc.opportunityMatrix.quadrant1}</li>
      <li>${doc.opportunityMatrix.quadrant2}</li>
      <li>${doc.opportunityMatrix.quadrant3}</li>
      <li>${doc.opportunityMatrix.quadrant4}</li>
    </ul>
    <h3>${doc.opportunityMatrix.opportunitiesTable}</h3>
    <p>${doc.opportunityMatrix.opportunitiesTableContent}</p>
    <h3>${doc.opportunityMatrix.sortingFunctionality}</h3>
    <p>${doc.opportunityMatrix.sortingFunctionalityContent}</p>
    <h3>${doc.opportunityMatrix.roadmapPriorityAlgorithm}</h3>
    <p>${doc.opportunityMatrix.roadmapPriorityAlgorithmContent}</p>
  </div>

  <div class="section" id="roi-calculator-integration">
    <h2>${doc.roiCalculatorIntegration.title}</h2>
    <p>${doc.roiCalculatorIntegration.intro}</p>
    <h3>${doc.roiCalculatorIntegration.workflowOverview}</h3>
    <p>${doc.roiCalculatorIntegration.workflowOverviewContent}</p>
    <h3>${doc.roiCalculatorIntegration.platformRoles}</h3>
    <p>${doc.roiCalculatorIntegration.platformRolesContent}</p>
  </div>

  <div class="section" id="data-flow">
    <h2>${doc.dataFlow.title}</h2>
    <p>${doc.dataFlow.intro}</p>
    <h3>${doc.dataFlow.pifToCalculator}</h3>
    ${doc.dataFlow.pifToCalculatorContent.split('**').filter((_, i) => i % 2 === 1).map(part => {
      const [heading, ...bullets] = part.split('•').map(s => s.trim());
      return `<h4 style="font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem;">${heading.replace(':', '')}</h4><ul style="margin-left: 1.5rem; margin-bottom: 0.5rem;">${bullets.filter(b => b).map(b => `<li>${b}</li>`).join('')}</ul>`;
    }).join('')}
    <h3>${doc.dataFlow.calculatorToOpportunities}</h3>
    ${doc.dataFlow.calculatorToOpportunitiesContent.split('**').filter((_, i) => i % 2 === 1).map(part => {
      const [heading, ...bullets] = part.split('•').map(s => s.trim());
      return `<h4 style="font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem;">${heading.replace(':', '')}</h4><ul style="margin-left: 1.5rem; margin-bottom: 0.5rem;">${bullets.filter(b => b).map(b => `<li>${b}</li>`).join('')}</ul>`;
    }).join('')}
    <h3>${doc.dataFlow.opportunitiesToMatrix}</h3>
    ${doc.dataFlow.opportunitiesToMatrixContent.split('**').filter((_, i) => i % 2 === 1).map(part => {
      const [heading, ...bullets] = part.split('•').map(s => s.trim());
      return `<h4 style="font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem;">${heading.replace(':', '')}</h4><ul style="margin-left: 1.5rem; margin-bottom: 0.5rem;">${bullets.filter(b => b).map(b => `<li>${b}</li>`).join('')}</ul>`;
    }).join('')}
    <h3>${doc.dataFlow.calculatorToReport}</h3>
    ${doc.dataFlow.calculatorToReportContent.split('**').filter((_, i) => i % 2 === 1).map(part => {
      const [heading, ...bullets] = part.split('•').map(s => s.trim());
      return `<h4 style="font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.5rem;">${heading.replace(':', '')}</h4><ul style="margin-left: 1.5rem; margin-bottom: 0.5rem;">${bullets.filter(b => b).map(b => `<li>${b}</li>`).join('')}</ul>`;
    }).join('')}
  </div>

  <div class="section" id="roi-calculations">
    <h2>${doc.roiCalculations.title}</h2>
    <p>${doc.roiCalculations.intro}</p>
    <h3>${doc.roiCalculations.fteSavingsFormula}</h3>
    ${parseStructuredContentToHTML(doc.roiCalculations.fteSavingsFormulaContent)}
    <h3>${doc.roiCalculations.businessImpactScoring}</h3>
    ${parseStructuredContentToHTML(doc.roiCalculations.businessImpactScoringContent)}
  </div>

  <div class="section" id="formulas-reference">
    <h2>${doc.formulasReference.title}</h2>
    <p>${doc.formulasReference.intro}</p>
    <h3>${doc.formulasReference.tfaScore}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.tfaScoreFormula)}
    <h3>${doc.formulasReference.readinessScore}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.readinessScoreFormula)}
    <h3>${doc.formulasReference.roiScore}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.roiScoreFormula)}
    <h3>${doc.formulasReference.hoursScore}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.hoursScoreFormula)}
    <h3>${doc.formulasReference.errorScore}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.errorScoreFormula)}
    <h3>${doc.formulasReference.revenueScore}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.revenueScoreFormula)}
    <h3>${doc.formulasReference.baseImpactMatrix}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.baseImpactMatrixFormula)}
    <h3>${doc.formulasReference.enhancedImpactMatrix}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.enhancedImpactMatrixFormula)}
    <h3>${doc.formulasReference.bonusFormulas}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.bonusFormulasExplanation)}
    <h3>${doc.formulasReference.implementationEffortScore}</h3>
    ${parseStructuredContentToHTML(doc.formulasReference.implementationEffortScoreFormula)}
  </div>

</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tocSections = [
    { id: "platform-overview", label: t.documentation.platformOverview.title },
    { id: "user-journey", label: t.documentation.userJourney.title },
    { id: "tfa-methodology", label: t.documentation.tfaMethodology.title },
    { id: "pif-methodology", label: t.documentation.pifMethodology.title },
    { id: "readiness-rubric", label: t.documentation.readinessRubric.title },
    { id: "opportunity-matrix", label: t.documentation.opportunityMatrix.title },
    { id: "roi-calculator-integration", label: t.documentation.roiCalculatorIntegration.title },
    { id: "data-flow", label: t.documentation.dataFlow.title },
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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleDownload}
                data-testid="button-download-handbook"
              >
                <Download className="h-5 w-5" />
              </Button>
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
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.pifMethodology.operationalScoresContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.pifMethodology.roiDataExtraction}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.pifMethodology.roiDataExtractionContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.pifMethodology.qualitativeInsights}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.pifMethodology.qualitativeInsightsContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.pifMethodology.stepLevelCollection}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.pifMethodology.stepLevelCollectionContent}
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
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.readinessRubric.assessmentArchitecture}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.readinessRubric.assessmentArchitectureContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.readinessRubric.weightingFormula}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.readinessRubric.weightingFormulaContent)}
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
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">15%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component4}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">15%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component5}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">9%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component6}</span>
                          </div>
                          <div className="flex items-start gap-3">
                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium whitespace-nowrap">10%</span>
                            <span className="text-muted-foreground text-sm">{t.documentation.readinessRubric.component7}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.readinessRubric.weightNormalization}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {t.documentation.readinessRubric.weightNormalizationContent}
                        </p>
                        <div className="space-y-3">
                          <div className="border border-border rounded-md p-4 bg-accent/5">
                            <h4 className="font-semibold text-sm mb-2 text-primary">{t.documentation.readinessRubric.tfaComponentsTitle}</h4>
                            <p className="text-muted-foreground text-xs leading-relaxed mb-2">{t.documentation.readinessRubric.tfaComponentsContent}</p>
                            <div className="bg-muted p-2 rounded-md font-mono text-xs space-y-1">
                              <div>System Environment: 25% × 0.60 = 15%</div>
                              <div>Data Quality: 30% × 0.60 = 18%</div>
                              <div>Integration Feasibility: 30% × 0.60 = 18%</div>
                              <div>Security & Compliance: 15% × 0.60 = 9%</div>
                            </div>
                          </div>
                          <div className="border border-border rounded-md p-4 bg-primary/5">
                            <h4 className="font-semibold text-sm mb-2 text-primary">{t.documentation.readinessRubric.pifComponentsTitle}</h4>
                            <p className="text-muted-foreground text-xs leading-relaxed mb-2">{t.documentation.readinessRubric.pifComponentsContent}</p>
                            <div className="bg-muted p-2 rounded-md font-mono text-xs space-y-1">
                              <div>Process Clarity: 37.5% × 0.40 = 15%</div>
                              <div>Change Magnitude: 37.5% × 0.40 = 15%</div>
                              <div>Workflow Brittleness: 25% × 0.40 = 10%</div>
                            </div>
                          </div>
                          <div className="border-l-4 border-primary pl-4 py-2 bg-primary/5">
                            <p className="text-muted-foreground text-xs leading-relaxed">{t.documentation.readinessRubric.normalizationNote}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.readinessRubric.feasibilityBanding}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.readinessRubric.feasibilityBandingContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.readinessRubric.swotAnalysis}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.readinessRubric.swotAnalysisContent)}
                        </div>
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
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.multiplierExplanationContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.baseMatrixTitle}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.baseMatrixContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.enhancedMatrixTitle}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.enhancedMatrixContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.scatterPlotInterpretation}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.scatterPlotInterpretationContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.opportunityMatrix.quadrants}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 border border-border rounded-md bg-green-500/5">
                            <h4 className="font-semibold text-sm mb-1 text-green-600 dark:text-green-400 text-center">Quick Wins</h4>
                            <p className="text-muted-foreground text-xs">{t.documentation.opportunityMatrix.quadrant1}</p>
                          </div>
                          <div className="p-3 border border-border rounded-md bg-blue-500/5">
                            <h4 className="font-semibold text-sm mb-1 text-blue-600 dark:text-blue-400 text-center">Strategic Bets</h4>
                            <p className="text-muted-foreground text-xs">{t.documentation.opportunityMatrix.quadrant2}</p>
                          </div>
                          <div className="p-3 border border-border rounded-md bg-yellow-500/5">
                            <h4 className="font-semibold text-sm mb-1 text-yellow-600 dark:text-yellow-400 text-center">Nice-to-Have</h4>
                            <p className="text-muted-foreground text-xs">{t.documentation.opportunityMatrix.quadrant3}</p>
                          </div>
                          <div className="p-3 border border-border rounded-md bg-red-500/5">
                            <h4 className="font-semibold text-sm mb-1 text-red-600 dark:text-red-400 text-center">Deprioritize</h4>
                            <p className="text-muted-foreground text-xs">{t.documentation.opportunityMatrix.quadrant4}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.opportunitiesTable}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.opportunitiesTableContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.sortingFunctionality}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.sortingFunctionalityContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.roadmapPriorityAlgorithm}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.roadmapPriorityAlgorithmContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.implementationEffortScoring}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.implementationEffortScoringContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.effortWeightingRationale}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.effortWeightingRationaleContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.opportunityMatrix.effortNormalizationScales}</h3>
                        <div className="text-muted-foreground leading-relaxed">
                          {parseStructuredContent(t.documentation.opportunityMatrix.effortNormalizationScalesContent)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* ROI Calculator Integration */}
                <section id="roi-calculator-integration" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.roiCalculatorIntegration.title}</CardTitle>
                      <CardDescription>{t.documentation.roiCalculatorIntegration.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.roiCalculatorIntegration.workflowOverview}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.roiCalculatorIntegration.workflowOverviewContent}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.roiCalculatorIntegration.platformRoles}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {t.documentation.roiCalculatorIntegration.platformRolesContent}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </section>

                {/* Data Flow & Population Map */}
                <section id="data-flow" className="scroll-mt-24">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">{t.documentation.dataFlow.title}</CardTitle>
                      <CardDescription>{t.documentation.dataFlow.intro}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.dataFlow.pifToCalculator}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {t.documentation.dataFlow.pifToCalculatorContent.split('**').map((part, i) => {
                            if (i % 2 === 1) {
                              const [heading, ...bullets] = part.split('•').map(s => s.trim());
                              return (
                                <div key={i} className="mt-3">
                                  <h4 className="font-semibold mb-1">{heading.replace(':', '')}</h4>
                                  <ul className="list-disc ml-6 space-y-1">
                                    {bullets.filter(b => b).map((bullet, j) => <li key={j}>{bullet}</li>)}
                                  </ul>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.dataFlow.calculatorToOpportunities}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {t.documentation.dataFlow.calculatorToOpportunitiesContent.split('**').map((part, i) => {
                            if (i % 2 === 1) {
                              const [heading, ...bullets] = part.split('•').map(s => s.trim());
                              return (
                                <div key={i} className="mt-3">
                                  <h4 className="font-semibold mb-1">{heading.replace(':', '')}</h4>
                                  <ul className="list-disc ml-6 space-y-1">
                                    {bullets.filter(b => b).map((bullet, j) => <li key={j}>{bullet}</li>)}
                                  </ul>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.dataFlow.opportunitiesToMatrix}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {t.documentation.dataFlow.opportunitiesToMatrixContent.split('**').map((part, i) => {
                            if (i % 2 === 1) {
                              const [heading, ...bullets] = part.split('•').map(s => s.trim());
                              return (
                                <div key={i} className="mt-3">
                                  <h4 className="font-semibold mb-1">{heading.replace(':', '')}</h4>
                                  <ul className="list-disc ml-6 space-y-1">
                                    {bullets.filter(b => b).map((bullet, j) => <li key={j}>{bullet}</li>)}
                                  </ul>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.dataFlow.calculatorToReport}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {t.documentation.dataFlow.calculatorToReportContent.split('**').map((part, i) => {
                            if (i % 2 === 1) {
                              const [heading, ...bullets] = part.split('•').map(s => s.trim());
                              return (
                                <div key={i} className="mt-3">
                                  <h4 className="font-semibold mb-1">{heading.replace(':', '')}</h4>
                                  <ul className="list-disc ml-6 space-y-1">
                                    {bullets.filter(b => b).map((bullet, j) => <li key={j}>{bullet}</li>)}
                                  </ul>
                                </div>
                              );
                            }
                            return null;
                          })}
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
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.roiCalculations.fteSavingsFormula}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.roiCalculations.fteSavingsFormulaContent)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{t.documentation.roiCalculations.businessImpactScoring}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.roiCalculations.businessImpactScoringContent)}
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
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.tfaScoreFormula)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.readinessScore}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.readinessScoreFormula)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.roiScore}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.roiScoreFormula)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.hoursScore}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.hoursScoreFormula)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.errorScore}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.errorScoreFormula)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.revenueScore}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.revenueScoreFormula)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="border border-border rounded-md p-4 bg-accent/5">
                        <h3 className="text-base font-semibold mb-2 text-primary">{t.documentation.formulasReference.baseImpactMatrix}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.baseImpactMatrixFormula)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="border border-border rounded-md p-4 bg-primary/5">
                        <h3 className="text-base font-semibold mb-2 text-primary">{t.documentation.formulasReference.enhancedImpactMatrix}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.enhancedImpactMatrixFormula)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-2 text-primary">{t.documentation.formulasReference.bonusFormulas}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.bonusFormulasExplanation)}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-1">{t.documentation.formulasReference.implementationEffortScore}</h3>
                        <div className="text-muted-foreground leading-relaxed text-sm">
                          {parseStructuredContent(t.documentation.formulasReference.implementationEffortScoreFormula)}
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
