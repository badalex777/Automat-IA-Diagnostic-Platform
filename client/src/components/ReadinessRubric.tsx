import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReadinessRubricScore } from "@shared/pifCalculations";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";

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

  // Prepare data for technical vs operational comparison
  const comparisonData = [
    {
      category: 'Technical Foundation',
      score: rubric.tfaScore,
      weight: 60,
      contribution: rubric.tfaScore * 0.6,
    },
    {
      category: 'Operational Readiness',
      score: rubric.pifScore,
      weight: 40,
      contribution: rubric.pifScore * 0.4,
    },
  ];

  // Generate dynamic insights
  const generateInsights = () => {
    const insights: Array<{ type: 'strength' | 'risk' | 'neutral'; text: string }> = [];
    
    // Analyze overall score
    if (rubric.totalScore >= 80) {
      insights.push({
        type: 'strength',
        text: `Excellent readiness score of ${rubric.totalScore}/100 indicates strong potential for successful AI implementation.`
      });
    } else if (rubric.totalScore >= 65) {
      insights.push({
        type: 'neutral',
        text: `Good readiness score of ${rubric.totalScore}/100 suggests viable implementation with moderate preparation needed.`
      });
    } else if (rubric.totalScore >= 50) {
      insights.push({
        type: 'neutral',
        text: `Moderate readiness score of ${rubric.totalScore}/100 indicates significant preparation required before implementation.`
      });
    } else {
      insights.push({
        type: 'risk',
        text: `Low readiness score of ${rubric.totalScore}/100 suggests major challenges that must be addressed before proceeding.`
      });
    }

    // Analyze TFA vs PIF balance
    const diff = Math.abs(rubric.tfaScore - rubric.pifScore);
    if (diff > 20) {
      if (rubric.tfaScore > rubric.pifScore) {
        insights.push({
          type: 'risk',
          text: `Technical capabilities (${rubric.tfaScore}) significantly exceed operational readiness (${rubric.pifScore}). Focus on change management and process clarity.`
        });
      } else {
        insights.push({
          type: 'risk',
          text: `Operational readiness (${rubric.pifScore}) outpaces technical foundation (${rubric.tfaScore}). Address system environment and data quality concerns.`
        });
      }
    } else {
      insights.push({
        type: 'strength',
        text: `Balanced technical (${rubric.tfaScore}) and operational (${rubric.pifScore}) scores indicate well-rounded readiness.`
      });
    }

    // Identify strongest component
    const componentScoresArray = Object.entries(rubric.componentScores).map(([key, value]) => ({
      key: key as keyof ReadinessRubricScore['componentScores'],
      score: value
    }));
    componentScoresArray.sort((a, b) => b.score - a.score);
    
    const strongest = componentScoresArray[0];
    const weakest = componentScoresArray[componentScoresArray.length - 1];

    if (strongest.score >= 80) {
      insights.push({
        type: 'strength',
        text: `${componentLabels[strongest.key]} is a key strength at ${strongest.score}/100, providing a solid foundation for implementation.`
      });
    }

    if (weakest.score < 50) {
      insights.push({
        type: 'risk',
        text: `${componentLabels[weakest.key]} scores ${weakest.score}/100 and requires immediate attention to avoid implementation risks.`
      });
    } else if (weakest.score < 65) {
      insights.push({
        type: 'neutral',
        text: `${componentLabels[weakest.key]} at ${weakest.score}/100 is the weakest area and should be prioritized for improvement.`
      });
    }

    return insights;
  };

  const insights = generateInsights();

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

      {/* Executive Summary */}
      <Card data-testid="card-executive-summary">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index} 
              className={`flex items-start gap-3 p-3 rounded-md ${
                insight.type === 'strength' 
                  ? 'bg-green-500/10 dark:bg-green-500/20' 
                  : insight.type === 'risk'
                  ? 'bg-red-500/10 dark:bg-red-500/20'
                  : 'bg-blue-500/10 dark:bg-blue-500/20'
              }`}
            >
              {insight.type === 'strength' && <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />}
              {insight.type === 'risk' && <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />}
              {insight.type === 'neutral' && <Minus className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />}
              <p className="text-sm">{insight.text}</p>
            </div>
          ))}
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

        {/* Bar Chart - Technical vs Operational */}
        <Card data-testid="card-comparison-chart">
          <CardHeader>
            <CardTitle>Technical vs Operational</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="category" 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'score') return [`${value}/100`, 'Score'];
                    if (name === 'contribution') return [`${value.toFixed(1)}`, 'Contribution to Total'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar dataKey="score" name="Raw Score (0-100)" fill="hsl(var(--primary))" />
                <Bar dataKey="contribution" name="Weighted Contribution" fill="hsl(var(--chart-2))">
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <p>• Technical Foundation contributes 60% to total score ({rubric.tfaScore} × 0.6 = {(rubric.tfaScore * 0.6).toFixed(1)})</p>
              <p>• Operational Readiness contributes 40% to total score ({rubric.pifScore} × 0.4 = {(rubric.pifScore * 0.4).toFixed(1)})</p>
              <p>• <strong>Combined Score: {rubric.totalScore}/100</strong></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
