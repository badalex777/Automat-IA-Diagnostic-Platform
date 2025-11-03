import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, TrendingDown, Minus, AlertTriangle, FileText } from "lucide-react";
import type { ReadinessRubricScore } from "@shared/pifCalculations";
import { generateSWOTAnalysis } from "@shared/pifCalculations";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, PieChart, Pie, Tooltip, Legend, Cell } from "recharts";
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
  processClarity: '15%',
  changeMagnitude: '15%',
  workflowBrittleness: '10%',
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
// Keys must match TFA_SECTIONS names exactly
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
  // Use exact same precision as backend calculations to avoid rounding discrepancies
  const componentWeightValues: Record<keyof ReadinessRubricScore['components'], number> = {
    systemEnvironment: 0.15,
    dataQuality: 0.18,
    integrationFeasibility: 0.18,
    securityCompliance: 0.09,
    processClarity: 0.15,
    changeMagnitude: 0.15,
    workflowBrittleness: 0.10,
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
    { key: 'processClarity', weight: 15, color: 'hsl(var(--chart-5))' },
    { key: 'changeMagnitude', weight: 15, color: 'hsl(140 60% 45%)' },
    { key: 'workflowBrittleness', weight: 10, color: 'hsl(200 60% 45%)' },
    { key: 'securityCompliance', weight: 9, color: 'hsl(var(--chart-4))' },
  ] as const).map(item => ({
    name: componentLabels[item.key],
    value: item.weight,
    color: item.color,
  }));

  // Generate SWOT analysis using data-driven function with internal calculations
  const pifResponses = pifData?.responses || [];
  
  // Calculate TFA section scores for SWOT generation
  const tfaResponses = (tfaAssessment?.responses as Record<string, string | number>) || {};
  const tfaSectionScores = {
    systemEnvironment: rubric.componentScores.systemEnvironment,
    dataQuality: rubric.componentScores.dataQuality,
    integrationFeasibility: rubric.componentScores.integrationFeasibility,
    securityCompliance: rubric.componentScores.securityCompliance,
  };

  const swotAnalysis = generateSWOTAnalysis(rubric, pifResponses, tfaSectionScores, tfaResponses);

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
            <p className="text-sm text-muted-foreground mb-1">Technical Foundation (60%)</p>
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

      {/* Executive Summary - Strategic Synthesis */}
      <Card data-testid="card-executive-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-md p-4">
            <p className="text-sm leading-relaxed" data-testid="text-executive-summary">
              {swotAnalysis.executiveSummary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SWOT Analysis - Detailed Strategic Insights */}
      <Card data-testid="card-swot-analysis">
        <CardHeader>
          <CardTitle>SWOT Analysis</CardTitle>
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
                <p>Data Quality (18%) and Integration Feasibility (18%) carry the most weight because they directly determine whether the AI can connect to existing systems and work with available data - the fundamental building blocks of any AI implementation.</p>
                
                <p>System Environment (15%) is critical as it encompasses the technical infrastructure, scalability, and backup capabilities that ensure the AI solution can run reliably.</p>
                
                <p>Security & Compliance (9%) addresses regulatory and security requirements that, while essential, are often more about verification than technical capability.</p>
                
                <p>Process Clarity (15%) and Change Magnitude (15%) reflect operational readiness - clear processes reduce implementation complexity, while understanding change magnitude helps plan adoption strategies.</p>
                
                <p>Workflow Brittleness (10%) has the lowest weight as it indicates risk rather than capability, and can often be mitigated through careful design even in brittle workflows.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
