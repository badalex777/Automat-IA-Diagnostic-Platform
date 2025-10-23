import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { Home, BookOpen, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Documentation() {
  const { t, language } = useLanguage();
  const [activeSection, setActiveSection] = useState("platform-overview");
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isScrollingToSection = useRef(false);

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

  const handleDownload = () => {
    const doc = t.documentation;
    const filename = language === 'es' 
      ? 'Automat-IA_Manual_de_Documentacion.html'
      : 'Automat-IA_Documentation_Handbook.html';

    const htmlContent = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6; 
      color: #1a1a1a; 
      background: #ffffff;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    h1 { font-size: 32px; margin: 40px 0 16px; color: #000; border-bottom: 3px solid #10b981; padding-bottom: 12px; }
    h2 { font-size: 24px; margin: 32px 0 12px; color: #000; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
    h3 { font-size: 20px; margin: 24px 0 8px; color: #374151; }
    h4 { font-size: 16px; margin: 16px 0 8px; color: #4b5563; font-weight: 600; }
    p { margin: 12px 0; color: #374151; }
    ul, ol { margin: 12px 0 12px 24px; color: #374151; }
    li { margin: 6px 0; }
    .section { margin: 40px 0; page-break-inside: avoid; }
    .subsection { margin: 24px 0; page-break-inside: avoid; }
    .formula { 
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      background: #f9fafb; 
      padding: 16px; 
      border-left: 4px solid #10b981; 
      margin: 16px 0;
      font-size: 14px;
      overflow-x: auto;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      margin: 4px 4px 4px 0;
    }
    .badge-very-high { background: #d1fae5; color: #065f46; }
    .badge-high { background: #dbeafe; color: #1e40af; }
    .badge-moderate { background: #fef3c7; color: #92400e; }
    .badge-low { background: #fed7aa; color: #9a3412; }
    .badge-very-low { background: #fecaca; color: #991b1b; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
    th { background: #f9fafb; font-weight: 600; color: #000; }
    .toc { background: #f9fafb; padding: 24px; border-radius: 8px; margin: 24px 0; }
    .toc ul { list-style: none; margin: 0; }
    .toc li { margin: 8px 0; }
    .toc a { color: #10b981; text-decoration: none; }
    .toc a:hover { text-decoration: underline; }
    @media print {
      body { padding: 20px; }
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
      <li><a href="#roi-calculations">${doc.roiCalculations.title}</a></li>
      <li><a href="#formulas-reference">${doc.formulasReference.title}</a></li>
    </ul>
  </div>

  <div class="section" id="platform-overview">
    <h2>${doc.platformOverview.title}</h2>
    <p>${doc.platformOverview.purpose}</p>
    <h3>${doc.platformOverview.keyBenefitsTitle}</h3>
    <ul>
      <li><strong>${doc.platformOverview.benefit1Title}:</strong> ${doc.platformOverview.benefit1Desc}</li>
      <li><strong>${doc.platformOverview.benefit2Title}:</strong> ${doc.platformOverview.benefit2Desc}</li>
      <li><strong>${doc.platformOverview.benefit3Title}:</strong> ${doc.platformOverview.benefit3Desc}</li>
      <li><strong>${doc.platformOverview.benefit4Title}:</strong> ${doc.platformOverview.benefit4Desc}</li>
    </ul>
  </div>

  <div class="section" id="user-journey">
    <h2>${doc.userJourney.title}</h2>
    <p>${doc.userJourney.intro}</p>
    <ol>
      <li><strong>${doc.userJourney.step1Title}:</strong> ${doc.userJourney.step1Desc}</li>
      <li><strong>${doc.userJourney.step2Title}:</strong> ${doc.userJourney.step2Desc}</li>
      <li><strong>${doc.userJourney.step3Title}:</strong> ${doc.userJourney.step3Desc}</li>
      <li><strong>${doc.userJourney.step4Title}:</strong> ${doc.userJourney.step4Desc}</li>
      <li><strong>${doc.userJourney.step5Title}:</strong> ${doc.userJourney.step5Desc}</li>
      <li><strong>${doc.userJourney.step6Title}:</strong> ${doc.userJourney.step6Desc}</li>
    </ol>
  </div>

  <div class="section" id="tfa-methodology">
    <h2>${doc.tfaMethodology.title}</h2>
    <p>${doc.tfaMethodology.overview}</p>
    <h3>${doc.tfaMethodology.sectionsTitle}</h3>
    <ul>
      <li><strong>${doc.tfaMethodology.section1}:</strong> 25% ${doc.tfaMethodology.weight} (6 ${doc.tfaMethodology.questions})</li>
      <li><strong>${doc.tfaMethodology.section2}:</strong> 30% ${doc.tfaMethodology.weight} (5 ${doc.tfaMethodology.questions})</li>
      <li><strong>${doc.tfaMethodology.section3}:</strong> 30% ${doc.tfaMethodology.weight} (6 ${doc.tfaMethodology.questions})</li>
      <li><strong>${doc.tfaMethodology.section4}:</strong> 15% ${doc.tfaMethodology.weight} (4 ${doc.tfaMethodology.questions})</li>
    </ul>
    <h3>${doc.tfaMethodology.scoringTitle}</h3>
    <p>${doc.tfaMethodology.scoringDesc}</p>
    <h3>${doc.tfaMethodology.bandsTitle}</h3>
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
    <p>${doc.pifMethodology.overview}</p>
    <h3>${doc.pifMethodology.sectionsTitle}</h3>
    <ul>
      <li><strong>${doc.pifMethodology.section1}:</strong> ${doc.pifMethodology.section1Desc}</li>
      <li><strong>${doc.pifMethodology.section2}:</strong> ${doc.pifMethodology.section2Desc}</li>
      <li><strong>${doc.pifMethodology.section3}:</strong> ${doc.pifMethodology.section3Desc}</li>
      <li><strong>${doc.pifMethodology.section4}:</strong> ${doc.pifMethodology.section4Desc}</li>
      <li><strong>${doc.pifMethodology.section5}:</strong> ${doc.pifMethodology.section5Desc}</li>
      <li><strong>${doc.pifMethodology.section6}:</strong> ${doc.pifMethodology.section6Desc}</li>
      <li><strong>${doc.pifMethodology.section7}:</strong> ${doc.pifMethodology.section7Desc}</li>
      <li><strong>${doc.pifMethodology.section8}:</strong> ${doc.pifMethodology.section8Desc}</li>
    </ul>
  </div>

  <div class="section" id="readiness-rubric">
    <h2>${doc.readinessRubric.title}</h2>
    <p>${doc.readinessRubric.overview}</p>
    <div class="formula">${doc.readinessRubric.formula}</div>
    <h3>${doc.readinessRubric.componentsTitle}</h3>
    <ul>
      <li>${doc.readinessRubric.component1}</li>
      <li>${doc.readinessRubric.component2}</li>
      <li>${doc.readinessRubric.component3}</li>
      <li>${doc.readinessRubric.component4}</li>
      <li>${doc.readinessRubric.component5}</li>
      <li>${doc.readinessRubric.component6}</li>
      <li>${doc.readinessRubric.component7}</li>
    </ul>
  </div>

  <div class="section" id="opportunity-matrix">
    <h2>${doc.opportunityMatrix.title}</h2>
    <p>${doc.opportunityMatrix.overview}</p>
    <h3>${doc.opportunityMatrix.scoringTitle}</h3>
    <p>${doc.opportunityMatrix.scoringDesc}</p>
    <div class="formula">
${doc.opportunityMatrix.roiFormula}<br/>
${doc.opportunityMatrix.fteFormula}<br/>
${doc.opportunityMatrix.capFormula}
    </div>
    <h3>${doc.opportunityMatrix.filterViewsTitle}</h3>
    <ul>
      <li><strong>${doc.opportunityMatrix.view1}:</strong> ${doc.opportunityMatrix.view1Desc}</li>
      <li><strong>${doc.opportunityMatrix.view2}:</strong> ${doc.opportunityMatrix.view2Desc}</li>
      <li><strong>${doc.opportunityMatrix.view3}:</strong> ${doc.opportunityMatrix.view3Desc}</li>
      <li><strong>${doc.opportunityMatrix.view4}:</strong> ${doc.opportunityMatrix.view4Desc}</li>
    </ul>
  </div>

  <div class="section" id="roi-calculations">
    <h2>${doc.roiCalculations.title}</h2>
    <h3>${doc.roiCalculations.annualRoiTitle}</h3>
    <div class="formula">${doc.roiCalculations.annualRoiFormula}</div>
    <h3>${doc.roiCalculations.fteSavingsTitle}</h3>
    <div class="formula">${doc.roiCalculations.fteSavingsFormula}</div>
    <h3>${doc.roiCalculations.impactScoreTitle}</h3>
    <div class="formula">
${doc.roiCalculations.impactScoreFormula1}<br/>
${doc.roiCalculations.impactScoreFormula2}
    </div>
  </div>

  <div class="section" id="formulas-reference">
    <h2>${doc.formulasReference.title}</h2>
    <h3>${doc.formulasReference.tfaScoreTitle}</h3>
    <div class="formula">${doc.formulasReference.tfaScoreFormula}</div>
    <h3>${doc.formulasReference.pifScoreTitle}</h3>
    <div class="formula">${doc.formulasReference.pifScoreFormula}</div>
    <h3>${doc.formulasReference.readinessScoreTitle}</h3>
    <div class="formula">${doc.formulasReference.readinessScoreFormula}</div>
    <h3>${doc.formulasReference.businessImpactTitle}</h3>
    <div class="formula">
${doc.formulasReference.businessImpactFormula1}<br/>
${doc.formulasReference.businessImpactFormula2}<br/>
${doc.formulasReference.businessImpactFormula3}
    </div>
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
                        <h3 className="text-lg font-semibold mb-3">{t.documentation.opportunityMatrix.dualMatrixSystem}</h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {t.documentation.opportunityMatrix.dualMatrixIntro}
                        </p>
                        <div className="space-y-4">
                          <div className="border border-border rounded-md p-4 bg-accent/5">
                            <h4 className="font-semibold mb-2 text-primary">{t.documentation.opportunityMatrix.baseMatrixTitle}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-2">{t.documentation.opportunityMatrix.baseMatrixContent}</p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs">
                              Base Impact = (ROI × 0.60) + (Hours × 0.40)
                            </div>
                          </div>
                          <div className="border border-border rounded-md p-4 bg-primary/5">
                            <h4 className="font-semibold mb-2 text-primary">{t.documentation.opportunityMatrix.enhancedMatrixTitle}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-2">{t.documentation.opportunityMatrix.enhancedMatrixContent}</p>
                            <div className="bg-muted p-3 rounded-md font-mono text-xs">
                              Enhanced Impact = Base Impact + Error Bonus + Revenue Bonus
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-2 text-primary">{t.documentation.opportunityMatrix.bonusCalculationTitle}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{t.documentation.opportunityMatrix.bonusCalculationContent}</p>
                          </div>
                          <div className="border-l-4 border-primary pl-4 py-2 bg-primary/5">
                            <h4 className="font-semibold text-sm mb-1 text-primary">{t.documentation.opportunityMatrix.matrixGuaranteeTitle}</h4>
                            <p className="text-muted-foreground text-sm leading-relaxed">{t.documentation.opportunityMatrix.matrixGuaranteeContent}</p>
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
                      
                      <div className="border border-border rounded-md p-4 bg-accent/5">
                        <h3 className="text-base font-semibold mb-2 text-primary">{t.documentation.formulasReference.baseImpactMatrix}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.baseImpactMatrixFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="border border-border rounded-md p-4 bg-primary/5">
                        <h3 className="text-base font-semibold mb-2 text-primary">{t.documentation.formulasReference.enhancedImpactMatrix}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.enhancedImpactMatrixFormula}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h3 className="text-base font-semibold mb-2 text-primary">{t.documentation.formulasReference.bonusFormulas}</h3>
                        <div className="bg-muted p-3 rounded-md font-mono text-xs">
                          {t.documentation.formulasReference.bonusFormulasExplanation}
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
