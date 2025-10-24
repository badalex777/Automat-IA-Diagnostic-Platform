import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { ReadinessRubricScore } from "@shared/pifCalculations";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import type { TFAAssessment, PIFResponse } from "@shared/schema";
import { TFA_QUESTIONS, TFA_SECTIONS } from "@shared/tfaQuestions";
import type { AggregatedPIFScores } from "@shared/pifCalculations";

interface ReadinessRubricProps {
  rubric: ReadinessRubricScore;
  workflowId: string;
}

const componentLabels: Record<keyof ReadinessRubricScore['components'], string> = {
  systemEnvironment: 'System Environment',
  dataQuality: 'Data Quality',
  integrationFeasibility: 'Integration Feasibility',
  securityCompliance: 'Security & Compliance',
  processClarity: 'Process Clarity',
  changeMagnitude: 'Change Magnitude',
  workflowBrittleness: 'Workflow Brittleness',
};

const componentWeights: Record<keyof ReadinessRubricScore['components'], string> = {
  systemEnvironment: '15%',
  dataQuality: '18%',
  integrationFeasibility: '18%',
  securityCompliance: '9%',
  processClarity: '8%',
  changeMagnitude: '8%',
  workflowBrittleness: '6%',
};

function getFeasibilityColor(band: ReadinessRubricScore['feasibilityBand']) {
  switch (band) {
    case 'Very High':
      return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/20';
    case 'High':
      return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/20';
    case 'Moderate':
      return 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20';
    case 'Low':
      return 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20';
    case 'Very Low':
      return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20';
  }
}

function getFeasibilityIcon(band: ReadinessRubricScore['feasibilityBand']) {
  switch (band) {
    case 'Very High':
    case 'High':
      return <CheckCircle2 className="h-5 w-5" />;
    case 'Moderate':
      return <AlertCircle className="h-5 w-5" />;
    case 'Low':
    case 'Very Low':
      return <XCircle className="h-5 w-5" />;
  }
}

// Component-specific recommendations based on actual score thresholds
const TFA_RECOMMENDATIONS: Record<string, string[]> = {
  "System Environment": [
    "Conduct comprehensive API availability audit across all integrated systems",
    "Document current tech stack and create cloud migration roadmap with timeline",
    "Establish vendor partnerships for API access and integration support",
    "Implement API gateway for centralized access management and monitoring"
  ],
  "Data Quality": [
    "Implement automated data validation rules at point of entry",
    "Create data standardization procedures and governance framework",
    "Establish master data management (MDM) for critical business entities",
    "Deploy data quality monitoring dashboards with alerts"
  ],
  "Integration Feasibility": [
    "Design integration architecture with robust error handling and fallback mechanisms",
    "Create comprehensive integration testing environment",
    "Implement monitoring for integration health, latency, and failure patterns",
    "Document integration dependencies and establish rollback procedures"
  ],
  "Security/Compliance": [
    "Conduct formal security risk assessment with compliance team",
    "Implement role-based access controls (RBAC) before AI deployment",
    "Establish data classification and handling procedures aligned with regulations",
    "Create audit trails for all AI system interactions and obtain necessary approvals"
  ]
};

const PIF_RECOMMENDATIONS: Record<string, string[]> = {
  "Process Clarity": [
    "Conduct process mapping workshops with actual workflow users",
    "Create detailed standard operating procedures (SOPs) with visual flowcharts",
    "Document process variations across teams and identify standardization opportunities",
    "Establish process ownership and governance for ongoing documentation"
  ],
  "Change Magnitude": [
    "Design phased rollout plan with extensive user training and support",
    "Identify and empower change champions within the user community",
    "Create comprehensive training materials with hands-on practice scenarios",
    "Establish feedback loops and support channels during implementation"
  ],
  "Workflow Brittleness": [
    "Build flexibility into AI solution to gracefully handle process variations",
    "Implement manual override capabilities with clear escalation paths",
    "Create exception handling procedures for edge cases and human escalation",
    "Start with stable process areas and gradually expand automation scope"
  ]
};

export default function ReadinessRubric({ rubric, workflowId }: ReadinessRubricProps) {
  const { t } = useLanguage();
  
  // Fetch TFA assessment with question responses (with guards)
  const { data: tfaAssessment } = useQuery<TFAAssessment>({
    queryKey: [`/api/workflows/${workflowId}/tfa`],
    enabled: !!workflowId,
  });

  // Fetch PIF responses with qualitative data (with guards)
  const { data: pifData } = useQuery<{ responses: PIFResponse[]; aggregated: AggregatedPIFScores }>({
    queryKey: [`/api/workflows/${workflowId}/pif`],
    enabled: !!workflowId,
  });
  
  // Convert weighted contribution scores back to 0-100 scale for display
  const componentWeightValues: Record<keyof ReadinessRubricScore['components'], number> = {
    systemEnvironment: 0.15,
    dataQuality: 0.18,
    integrationFeasibility: 0.18,
    securityCompliance: 0.09,
    processClarity: 0.08,
    changeMagnitude: 0.08,
    workflowBrittleness: 0.06,
  };

  // Prepare data for radar chart
  const radarData = ([
    'systemEnvironment',
    'dataQuality',
    'integrationFeasibility',
    'securityCompliance',
    'processClarity',
    'changeMagnitude',
    'workflowBrittleness'
  ] as const).map((key) => ({
    component: componentLabels[key],
    score: rubric.componentScores[key],
    fullMark: 100,
  }));

  // Prepare data for component weights pie chart
  const pieData = ([
    { key: 'dataQuality', weight: 18, color: 'hsl(var(--chart-1))' },
    { key: 'integrationFeasibility', weight: 18, color: 'hsl(var(--chart-2))' },
    { key: 'systemEnvironment', weight: 15, color: 'hsl(var(--chart-3))' },
    { key: 'securityCompliance', weight: 9, color: 'hsl(var(--chart-4))' },
    { key: 'processClarity', weight: 8, color: 'hsl(var(--chart-5))' },
    { key: 'changeMagnitude', weight: 8, color: 'hsl(140 60% 45%)' },
    { key: 'workflowBrittleness', weight: 6, color: 'hsl(200 60% 45%)' },
  ] as const).map(item => ({
    name: componentLabels[item.key],
    value: item.weight,
    color: item.color,
  }));

  // Generate intelligent SWOT analysis using actual TFA and PIF data
  const generateIntelligentSWOT = () => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // === ANALYZE TFA RESPONSES ===
    const tfaResponses = (tfaAssessment?.responses as Record<string, string | number>) || {};
    
    // Group questions by section using canonical TFA_QUESTIONS
    const sectionData: Record<string, { scores: number[]; questions: Array<{ id: number; text: string; score: number }> }> = {};
    
    TFA_SECTIONS.forEach(section => {
      sectionData[section.name] = { scores: [], questions: [] };
    });

    TFA_QUESTIONS.forEach(q => {
      const answer = tfaResponses[q.id];
      if (answer !== undefined && answer !== null) {
        const selectedOption = q.options.find(opt => opt.value === String(answer));
        if (selectedOption && selectedOption.score !== null) {
          const score = selectedOption.score;
          sectionData[q.section].scores.push(score);
          sectionData[q.section].questions.push({ id: q.id, text: q.question, score });
        }
      }
    });

    // === ANALYZE PIF RESPONSES ===
    const pifResponses = pifData?.responses || [];
    const aggregatedPIF = pifData?.aggregated;

    // Extract qualitative insights with respondent attribution
    interface QualitativeInsight {
      respondent: string;
      role: string;
      insight: string;
    }

    const qualitativeInsights: {
      timeWasters: QualitativeInsight[];
      difficulties: QualitativeInsight[];
      exceptions: QualitativeInsight[];
      improvements: QualitativeInsight[];
    } = {
      timeWasters: [],
      difficulties: [],
      exceptions: [],
      improvements: []
    };

    pifResponses.forEach(response => {
      const qual = (response.qualitativeResponses as Record<string, string>) || {};
      const respondent = response.respondentName;
      const role = response.respondentRole;

      if (qual.timeWasters && qual.timeWasters.trim()) {
        qualitativeInsights.timeWasters.push({ respondent, role, insight: qual.timeWasters });
      }
      if (qual.keyDifficulties && qual.keyDifficulties.trim()) {
        qualitativeInsights.difficulties.push({ respondent, role, insight: qual.keyDifficulties });
      }
      if (qual.exceptions && qual.exceptions.trim()) {
        qualitativeInsights.exceptions.push({ respondent, role, insight: qual.exceptions });
      }
      if (qual.automationWish && qual.automationWish.trim()) {
        qualitativeInsights.improvements.push({ respondent, role, insight: qual.automationWish });
      }
    });

    // === STRENGTHS ===
    // Identify high-scoring TFA sections (>= 70)
    Object.entries(sectionData).forEach(([sectionName, data]) => {
      if (data.scores.length > 0) {
        const avgScore = Math.round((data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length / 5) * 100);
        
        if (avgScore >= 70) {
          const topQuestions = data.questions
            .filter(q => q.score >= 4)
            .slice(0, 2)
            .map(q => q.text.split(':')[0])
            .join(' and ');
          
          if (topQuestions) {
            strengths.push(`${sectionName} (${avgScore}/100): Strong foundation in ${topQuestions} enables smooth AI integration.`);
          }
        }
      }
    });

    // PIF strengths with qualitative support
    if (aggregatedPIF) {
      if (aggregatedPIF.processClarity.average >= 70) {
        const clarityInsight = qualitativeInsights.improvements[0];
        if (clarityInsight) {
          strengths.push(`Process Clarity (${aggregatedPIF.processClarity.average}/100) - Well-documented workflows. ${clarityInsight.respondent} (${clarityInsight.role}): "${clarityInsight.insight}"`);
        } else {
          strengths.push(`Process Clarity (${aggregatedPIF.processClarity.average}/100) - Clear, standardized processes provide predictable foundation for automation.`);
        }
      }

      if (aggregatedPIF.changeMagnitude.average >= 70) {
        strengths.push(`Change Readiness (${aggregatedPIF.changeMagnitude.average}/100) - Users demonstrate comfort with technology changes, enabling faster adoption.`);
      }
    }

    // === WEAKNESSES ===
    // TFA weaknesses with component-specific recommendations
    Object.entries(sectionData).forEach(([sectionName, data]) => {
      if (data.scores.length > 0) {
        const avgScore = Math.round((data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length / 5) * 100);
        
        if (avgScore < 60) {
          const criticalGaps = data.questions.filter(q => q.score <= 2);
          const recommendations = TFA_RECOMMENDATIONS[sectionName] || [];
          
          if (criticalGaps.length > 0 && recommendations.length > 0) {
            weaknesses.push(`${sectionName} (${avgScore}/100) - ${criticalGaps.length} critical gap${criticalGaps.length !== 1 ? 's' : ''}. Next step: ${recommendations[0]}`);
          } else if (recommendations.length > 1) {
            weaknesses.push(`${sectionName} (${avgScore}/100) requires attention. Recommendation: ${recommendations[1]}`);
          }
        }
      }
    });

    // PIF weaknesses with component-specific recommendations
    if (aggregatedPIF) {
      if (aggregatedPIF.processClarity.average < 60) {
        const recommendations = PIF_RECOMMENDATIONS["Process Clarity"];
        weaknesses.push(`Process Clarity (${aggregatedPIF.processClarity.average}/100): ${recommendations[0]}`);
      }

      if (aggregatedPIF.changeMagnitude.average < 60) {
        const recommendations = PIF_RECOMMENDATIONS["Change Magnitude"];
        weaknesses.push(`Change Magnitude (${aggregatedPIF.changeMagnitude.average}/100): ${recommendations[0]}`);
      }

      if (aggregatedPIF.workflowBrittleness.average < 60) {
        const recommendations = PIF_RECOMMENDATIONS["Workflow Brittleness"];
        const exceptionInsight = qualitativeInsights.exceptions[0];
        if (exceptionInsight) {
          weaknesses.push(`Workflow Brittleness (${aggregatedPIF.workflowBrittleness.average}/100): ${recommendations[0]} ${exceptionInsight.respondent} (${exceptionInsight.role}) reports: "${exceptionInsight.insight}"`);
        } else {
          weaknesses.push(`Workflow Brittleness (${aggregatedPIF.workflowBrittleness.average}/100): ${recommendations[0]}`);
        }
      }
    }

    // Fallback if no specific weaknesses identified but overall score is low
    if (weaknesses.length === 0 && rubric.totalScore < 60) {
      weaknesses.push(`Overall readiness (${rubric.totalScore}/100) requires improvement across multiple components before full AI deployment.`);
    }

    // === OPPORTUNITIES ===
    // Strategic synergies
    if (rubric.componentScores.dataQuality >= 70 && rubric.componentScores.integrationFeasibility >= 60) {
      opportunities.push(`Strong data quality (${rubric.componentScores.dataQuality}/100) + solid integration capabilities (${rubric.componentScores.integrationFeasibility}/100) = ideal conditions for data-driven AI deployment.`);
    }

    if (aggregatedPIF && aggregatedPIF.processClarity.average >= 65 && rubric.componentScores.systemEnvironment >= 65) {
      opportunities.push(`Clear processes (${aggregatedPIF.processClarity.average}/100) on modern infrastructure (${rubric.componentScores.systemEnvironment}/100) enable rapid prototyping and iteration.`);
    }

    // User-driven opportunities from qualitative insights
    if (qualitativeInsights.improvements.length > 0) {
      const topWish = qualitativeInsights.improvements[0];
      opportunities.push(`Quick win identified by ${topWish.respondent} (${topWish.role}): "${topWish.insight}" - Address this to demonstrate immediate value.`);
    }

    if (qualitativeInsights.timeWasters.length > 0) {
      const topWaster = qualitativeInsights.timeWasters[0];
      opportunities.push(`Time savings opportunity - ${topWaster.respondent} (${topWaster.role}) identifies: "${topWaster.insight}" - Automating this delivers measurable efficiency gains.`);
    }

    // Fallback opportunity
    if (opportunities.length === 0 && rubric.totalScore >= 50) {
      opportunities.push(`With moderate readiness (${rubric.totalScore}/100), starting with a focused pilot can demonstrate value while addressing gaps.`);
    }

    // === THREATS ===
    // Critical TFA blockers
    Object.entries(sectionData).forEach(([sectionName, data]) => {
      const criticalGaps = data.questions.filter(q => q.score <= 2);
      if (criticalGaps.length >= 2) {
        const mitigation = TFA_RECOMMENDATIONS[sectionName]?.[0] || 'Conduct detailed technical assessment';
        threats.push(`${sectionName}: ${criticalGaps.length} critical technical gaps. Mitigation required: ${mitigation}`);
      }
    });

    // Security/Compliance threats
    if (rubric.componentScores.securityCompliance < 60) {
      const securityRec = TFA_RECOMMENDATIONS["Security/Compliance"]?.[0] || 'Engage compliance team immediately';
      threats.push(`Security & Compliance (${rubric.componentScores.securityCompliance}/100) may delay deployment. ${securityRec}`);
    }

    // User adoption risks from qualitative data
    if (qualitativeInsights.difficulties.length > 0) {
      const topDifficulty = qualitativeInsights.difficulties[0];
      threats.push(`Adoption risk - ${topDifficulty.respondent} (${topDifficulty.role}) highlights: "${topDifficulty.insight}" - Address during design phase.`);
    }

    // Workflow brittleness threats
    if (aggregatedPIF && aggregatedPIF.workflowBrittleness.average < 50 && qualitativeInsights.exceptions.length > 1) {
      threats.push(`High process variability (${aggregatedPIF.workflowBrittleness.average}/100, ${qualitativeInsights.exceptions.length} respondents report exceptions) may require hybrid human-AI approach.`);
    }

    // Fallback threat if score is critically low
    if (threats.length === 0 && rubric.totalScore < 40) {
      threats.push(`Overall low readiness (${rubric.totalScore}/100) indicates proceeding without major improvements will likely result in implementation failure.`);
    }

    return { strengths, weaknesses, opportunities, threats };
  };

  const swotAnalysis = generateIntelligentSWOT();

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="p-6" data-testid="card-readiness-overall">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2" data-testid="text-readiness-score">
              {rubric.totalScore}/100
            </h3>
            <p className="text-sm text-muted-foreground">{t.readiness.combinedScore}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t.rubric.technicalOperational}
            </p>
          </div>
          <Badge 
            className={`${getFeasibilityColor(rubric.feasibilityBand)} flex items-center gap-2 px-3 py-1`}
            data-testid="badge-feasibility-band"
          >
            {getFeasibilityIcon(rubric.feasibilityBand)}
            {rubric.feasibilityBand}
          </Badge>
        </div>

        <Progress value={rubric.totalScore} className="h-3 mb-4" data-testid="progress-readiness" />

        <div className="bg-muted/50 rounded-md p-4">
          <p className="text-sm" data-testid="text-recommendation">
            {rubric.recommendation}
          </p>
        </div>
      </Card>

      {/* Score Breakdown */}
      <Card className="p-6" data-testid="card-readiness-breakdown">
        <h3 className="font-semibold text-lg mb-4">{t.rubric.scoreComponents}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/30 rounded-md p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.rubric.technicalFoundation}</p>
            <p className="text-2xl font-bold" data-testid="text-tfa-score">{rubric.tfaScore}/100</p>
          </div>
          <div className="bg-muted/30 rounded-md p-4">
            <p className="text-sm text-muted-foreground mb-1">{t.rubric.operationalReadiness}</p>
            <p className="text-2xl font-bold" data-testid="text-pif-score">{rubric.pifScore}/100</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-base mb-3">{t.rubric.detailedComponents}</h4>
          
          {/* TFA Components */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{t.rubric.technicalFoundation}</p>
            {(['systemEnvironment', 'dataQuality', 'integrationFeasibility', 'securityCompliance'] as const).map((key) => {
              const displayScore = rubric.componentScores[key];
              return (
                <div key={key} className="space-y-1" data-testid={`component-${key}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{componentLabels[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{componentWeights[key]} {t.labels.weight}</span>
                      <span className="font-medium">{displayScore}/100</span>
                    </div>
                  </div>
                  <Progress value={displayScore} className="h-2" />
                </div>
              );
            })}
          </div>

          {/* PIF Components */}
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground">{t.rubric.operationalReadiness}</p>
            {(['processClarity', 'changeMagnitude', 'workflowBrittleness'] as const).map((key) => {
              const displayScore = rubric.componentScores[key];
              return (
                <div key={key} className="space-y-1" data-testid={`component-${key}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{componentLabels[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{componentWeights[key]} {t.labels.weight}</span>
                      <span className="font-medium">{displayScore}/100</span>
                    </div>
                  </div>
                  <Progress value={displayScore} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Executive Summary - SWOT Analysis */}
      <Card data-testid="card-executive-summary">
        <CardHeader>
          <CardTitle>{t.rubric.executiveSummary}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strengths */}
          {swotAnalysis.strengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                {t.readiness.strengths}
              </h4>
              <div className="space-y-2">
                {swotAnalysis.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-green-500/10 dark:bg-green-500/20">
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses */}
          {swotAnalysis.weaknesses.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-4 w-4" />
                {t.readiness.weaknesses}
              </h4>
              <div className="space-y-2">
                {swotAnalysis.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-orange-500/10 dark:bg-orange-500/20">
                    <p className="text-sm">{weakness}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities */}
          {swotAnalysis.opportunities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-4 w-4" />
                {t.readiness.opportunities}
              </h4>
              <div className="space-y-2">
                {swotAnalysis.opportunities.map((opportunity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-blue-500/10 dark:bg-blue-500/20">
                    <p className="text-sm">{opportunity}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Threats */}
          {swotAnalysis.threats.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                {t.readiness.threats}
              </h4>
              <div className="space-y-2">
                {swotAnalysis.threats.map((threat, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-red-500/10 dark:bg-red-500/20">
                    <p className="text-sm">{threat}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart - Component Comparison */}
        <Card data-testid="card-radar-chart">
          <CardHeader>
            <CardTitle>{t.rubric.componentAnalysis}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="component" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.3} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Component Weights */}
        <Card data-testid="card-component-weights">
          <CardHeader>
            <CardTitle>{t.rubric.componentWeights}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${value}%`}
                  outerRadius={100}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number) => `${value}%`}
                />
                <Legend 
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Weight Explanation */}
            <div className="mt-6 space-y-3 text-sm">
              <h4 className="font-semibold">{t.rubric.whyTheseWeights}</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>{t.rubric.dataQualityWeight}</p>
                
                <p>{t.rubric.systemEnvWeight}</p>
                
                <p>{t.rubric.securityWeight}</p>
                
                <p>{t.rubric.clarityWeight}</p>
                
                <p>{t.rubric.brittlenessWeight}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
