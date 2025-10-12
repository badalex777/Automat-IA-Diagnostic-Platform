import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import type { ReadinessRubricScore } from "@shared/pisCalculations";

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

  const getDisplayScore = (key: keyof ReadinessRubricScore['components']) => {
    // Convert weighted contribution back to 0-100 scale
    return Math.round((rubric.components[key] / componentWeightValues[key]));
  };

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
            <p className="text-2xl font-bold" data-testid="text-pis-score">{rubric.pisScore}/100</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-base mb-3">Detailed Components</h4>
          
          {/* TFA Components */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Technical Foundation (60%)</p>
            {(['systemEnvironment', 'dataQuality', 'integrationFeasibility', 'securityCompliance'] as const).map((key) => {
              const displayScore = getDisplayScore(key);
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

          {/* PIS Components */}
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-sm font-medium text-muted-foreground">Operational Readiness (40%)</p>
            {(['processClarity', 'changeMagnitude', 'workflowBrittleness'] as const).map((key) => {
              const displayScore = getDisplayScore(key);
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
    </div>
  );
}
