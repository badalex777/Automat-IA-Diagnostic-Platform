import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { ReadinessRubricScore } from "@shared/pifCalculations";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";

interface ReadinessRubricProps {
  rubric: ReadinessRubricScore;
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

export default function ReadinessRubric({ rubric }: ReadinessRubricProps) {
  // Convert weighted contribution scores back to 0-100 scale for display
  // Components are stored as weighted contributions to total score, but we display them as percentages
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

  // Generate detailed SWOT analysis
  const generateSWOTAnalysis = () => {
    const componentScoresArray = Object.entries(rubric.componentScores).map(([key, value]) => ({
      key: key as keyof ReadinessRubricScore['componentScores'],
      score: value,
      label: componentLabels[key as keyof ReadinessRubricScore['componentScores']],
      weight: componentWeightValues[key as keyof ReadinessRubricScore['componentScores']]
    }));
    componentScoresArray.sort((a, b) => b.score - a.score);

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // STRENGTHS: High-scoring components (>= 70)
    const strongComponents = componentScoresArray.filter(c => c.score >= 70);
    if (strongComponents.length > 0) {
      const topStrengths = strongComponents.slice(0, 3).map(c => 
        `${c.label} (${c.score}/100)`
      ).join(', ');
      strengths.push(`Strong foundation in ${topStrengths} provides a solid technical and operational base for AI implementation.`);
      
      if (rubric.tfaScore >= 70 && rubric.pifScore >= 70) {
        strengths.push(`Balanced excellence with Technical Feasibility at ${rubric.tfaScore}/100 and Operational Readiness at ${rubric.pifScore}/100 demonstrates comprehensive preparedness.`);
      } else if (rubric.tfaScore >= 70) {
        strengths.push(`Robust technical foundation (${rubric.tfaScore}/100) indicates systems are well-positioned for AI integration.`);
      } else if (rubric.pifScore >= 70) {
        strengths.push(`Strong operational readiness (${rubric.pifScore}/100) shows teams are prepared for workflow changes and process adoption.`);
      }
    }
    
    if (rubric.totalScore >= 75) {
      strengths.push(`Overall readiness score of ${rubric.totalScore}/100 indicates high likelihood of successful implementation with minimal friction.`);
    }

    // WEAKNESSES: Low-scoring components (< 60)
    const weakComponents = componentScoresArray.filter(c => c.score < 60);
    if (weakComponents.length > 0) {
      weakComponents.forEach(c => {
        if (c.score < 40) {
          weaknesses.push(`Critical deficiency in ${c.label} (${c.score}/100) poses significant implementation barriers and requires immediate remediation.`);
        } else {
          weaknesses.push(`${c.label} scores ${c.score}/100, indicating gaps that need attention before full deployment.`);
        }
      });
    }

    const diff = Math.abs(rubric.tfaScore - rubric.pifScore);
    if (diff > 25) {
      if (rubric.tfaScore > rubric.pifScore) {
        weaknesses.push(`Operational readiness (${rubric.pifScore}/100) lags behind technical capabilities (${rubric.tfaScore}/100) by ${diff} points, creating adoption risk.`);
      } else {
        weaknesses.push(`Technical foundation (${rubric.tfaScore}/100) trails operational readiness (${rubric.pifScore}/100) by ${diff} points, limiting implementation viability.`);
      }
    }

    // OPPORTUNITIES: Where strengths enable progress
    if (rubric.totalScore >= 65 && rubric.totalScore < 80) {
      opportunities.push(`With a moderate-to-good readiness score of ${rubric.totalScore}/100, starting with a pilot program in the strongest areas can demonstrate value while addressing gaps.`);
    } else if (rubric.totalScore >= 80) {
      opportunities.push(`Exceptional readiness score of ${rubric.totalScore}/100 enables immediate full-scale implementation with high confidence.`);
    }

    if (strongComponents.length >= 3) {
      const strongestAreas = strongComponents.slice(0, 2).map(c => c.label).join(' and ');
      opportunities.push(`Leverage excellence in ${strongestAreas} as proof points to build stakeholder confidence and secure buy-in.`);
    }

    if (rubric.componentScores.dataQuality >= 70 && rubric.componentScores.integrationFeasibility >= 70) {
      opportunities.push(`Strong Data Quality (${rubric.componentScores.dataQuality}/100) and Integration Feasibility (${rubric.componentScores.integrationFeasibility}/100) create ideal conditions for rapid AI deployment.`);
    }

    const moderateComponents = componentScoresArray.filter(c => c.score >= 50 && c.score < 70);
    if (moderateComponents.length > 0 && strongComponents.length > 0) {
      opportunities.push(`Moderate components (${moderateComponents.map(c => c.label).join(', ')}) can be improved through targeted initiatives while building on existing strengths.`);
    }

    // THREATS: Blockers and concerns
    const criticalComponents = componentScoresArray.filter(c => c.score < 50);
    if (criticalComponents.length > 0) {
      criticalComponents.forEach(c => {
        threats.push(`${c.label} at ${c.score}/100 represents a critical blocker that could derail implementation if not addressed.`);
      });
    }

    if (rubric.componentScores.securityCompliance < 60) {
      threats.push(`Security & Compliance concerns (${rubric.componentScores.securityCompliance}/100) may trigger regulatory issues or data privacy violations during deployment.`);
    }

    if (rubric.componentScores.workflowBrittleness < 50) {
      threats.push(`High Workflow Brittleness risk (${rubric.componentScores.workflowBrittleness}/100) suggests current processes may break under AI-driven changes.`);
    }

    if (rubric.totalScore < 50) {
      threats.push(`Overall low readiness (${rubric.totalScore}/100) indicates proceeding without major improvements will likely result in implementation failure.`);
    }

    if (rubric.tfaScore < 60 && rubric.pifScore < 60) {
      threats.push(`Both technical and operational scores below 60 create compounding risks that require comprehensive preparation strategy.`);
    }

    return { strengths, weaknesses, opportunities, threats };
  };

  const swotAnalysis = generateSWOTAnalysis();

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card className="p-6" data-testid="card-readiness-overall">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold mb-2" data-testid="text-readiness-score">
              {rubric.totalScore}/100
            </h3>
            <p className="text-sm text-muted-foreground">Combined Readiness Score</p>
            <p className="text-xs text-muted-foreground mt-1">
              Technical (60%) + Operational (40%)
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
        <h3 className="font-semibold text-lg mb-4">Score Components</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-muted/30 rounded-md p-4">
            <p className="text-sm text-muted-foreground mb-1">Technical Feasibility (60%)</p>
            <p className="text-2xl font-bold" data-testid="text-tfa-score">{rubric.tfaScore}/100</p>
          </div>
          <div className="bg-muted/30 rounded-md p-4">
            <p className="text-sm text-muted-foreground mb-1">Operational Readiness (40%)</p>
            <p className="text-2xl font-bold" data-testid="text-pif-score">{rubric.pifScore}/100</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-base mb-3">Detailed Components</h4>
          
          {/* TFA Components */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Technical Foundation (60%)</p>
            {(['systemEnvironment', 'dataQuality', 'integrationFeasibility', 'securityCompliance'] as const).map((key) => {
              const displayScore = rubric.componentScores[key];
              return (
                <div key={key} className="space-y-1" data-testid={`component-${key}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{componentLabels[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{componentWeights[key]} weight</span>
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
            <p className="text-sm font-medium text-muted-foreground">Operational Readiness (40%)</p>
            {(['processClarity', 'changeMagnitude', 'workflowBrittleness'] as const).map((key) => {
              const displayScore = rubric.componentScores[key];
              return (
                <div key={key} className="space-y-1" data-testid={`component-${key}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{componentLabels[key]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">{componentWeights[key]} weight</span>
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
          <CardTitle>Executive Summary: SWOT Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strengths */}
          {swotAnalysis.strengths.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Strengths
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
                Weaknesses
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
                Opportunities
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
                Threats
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
            <CardTitle>Component Analysis</CardTitle>
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
            <CardTitle>Component Weight Distribution</CardTitle>
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
              <h4 className="font-semibold">Why These Weights?</h4>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Data Quality (18%)</strong> and <strong>Integration Feasibility (18%)</strong> carry the most weight because they directly determine whether the AI can connect to existing systems and work with available data - the fundamental building blocks of any AI implementation.</p>
                
                <p><strong>System Environment (15%)</strong> is critical as it encompasses the technical infrastructure, scalability, and backup capabilities that ensure the AI solution can run reliably.</p>
                
                <p><strong>Security & Compliance (9%)</strong> addresses regulatory and security requirements that, while essential, are often more about verification than technical capability.</p>
                
                <p><strong>Process Clarity (8%)</strong> and <strong>Change Magnitude (8%)</strong> reflect operational readiness - clear processes reduce implementation complexity, while understanding change magnitude helps plan adoption strategies.</p>
                
                <p><strong>Workflow Brittleness (6%)</strong> has the lowest weight as it indicates risk rather than capability, and can often be mitigated through careful design even in brittle workflows.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
