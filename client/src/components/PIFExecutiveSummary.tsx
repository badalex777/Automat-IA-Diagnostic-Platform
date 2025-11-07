import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Target,
  Users,
  Layers
} from "lucide-react";
import type { AggregatedPIFScores } from "@shared/pifCalculations";

interface PIFExecutiveSummaryProps {
  aggregatedScores: AggregatedPIFScores;
  stepName?: string;
}

interface OperationalInsight {
  dimension: string;
  score: number;
  variance: number;
  category: 'strength' | 'moderate' | 'concern' | 'critical';
  analysis: string;
  recommendation: string;
}

const analyzeOperationalDimension = (
  dimension: string,
  average: number,
  variance: number,
  min: number,
  max: number,
  respondentCount: number
): OperationalInsight => {
  let category: 'strength' | 'moderate' | 'concern' | 'critical';
  let analysis: string;
  let recommendation: string;

  // Determine category based on average score
  if (average >= 75) category = 'strength';
  else if (average >= 60) category = 'moderate';
  else if (average >= 40) category = 'concern';
  else category = 'critical';

  // Build analysis considering both score and variance
  const varianceLevel = variance > 15 ? 'high' : variance > 8 ? 'moderate' : 'low';
  const agreement = variance < 8 ? 'Strong consensus' : variance < 15 ? 'Moderate agreement' : 'Significant disagreement';
  
  if (dimension === 'Process Clarity') {
    if (category === 'strength') {
      analysis = `${agreement} (variance: ${variance.toFixed(1)}) that this process is well-defined and understood. ${respondentCount > 1 ? 'Multiple respondents confirm' : 'Respondent confirms'} clear procedures and documentation.`;
      recommendation = 'Leverage this clarity during automation design - process is ready for systematic automation';
    } else if (category === 'moderate') {
      analysis = `Process definition is adequate but has areas of ambiguity (variance: ${variance.toFixed(1)}). ${varianceLevel === 'high' ? 'Disagreement among respondents suggests' : 'Responses indicate'} some steps lack standardization.`;
      recommendation = 'Document edge cases and exception handling before automation - clarify ambiguous steps with process owners';
    } else if (category === 'concern') {
      analysis = `Process lacks clear definition in multiple areas (variance: ${variance.toFixed(1)}). ${varianceLevel === 'high' ? 'Respondent disagreement highlights' : 'Responses show'} inconsistent understanding of procedures.`;
      recommendation = 'PRIORITY: Standardize and document process before automation - map all variations and establish single source of truth';
    } else {
      analysis = `Critical gaps in process definition (variance: ${variance.toFixed(1)}). ${respondentCount > 1 ? 'Respondents' : 'Respondent'} indicate${respondentCount === 1 ? 's' : ''} tribal knowledge, undocumented steps, or ad-hoc handling.`;
      recommendation = 'BLOCKER: Cannot automate undefined process - conduct process discovery workshops and create detailed documentation first';
    }
  } else if (dimension === 'Change Magnitude') {
    if (category === 'strength') {
      analysis = `${agreement} (variance: ${variance.toFixed(1)}) that process is stable with minimal changes. Low change frequency reduces automation complexity and maintenance burden.`;
      recommendation = 'Build automation with standard change management - stable process supports long-term ROI';
    } else if (category === 'moderate') {
      analysis = `Process undergoes regular but manageable changes (variance: ${variance.toFixed(1)}). ${varianceLevel === 'high' ? 'Varying perspectives on change frequency' : 'Responses indicate'} semi-regular adjustments.`;
      recommendation = 'Design automation with configuration flexibility - build in modular logic to accommodate routine changes';
    } else if (category === 'concern') {
      analysis = `High change frequency or major modifications (variance: ${variance.toFixed(1)}). ${varianceLevel === 'high' ? 'Disagreement suggests' : 'Responses show'} process instability.`;
      recommendation = 'CAUTION: Document change patterns first - may need to stabilize process before automation or build highly flexible solution';
    } else {
      analysis = `Process is highly volatile or undergoing transformation (variance: ${variance.toFixed(1)}). ${respondentCount > 1 ? 'Respondents report' : 'Respondent reports'} constant changes or upcoming redesign.`;
      recommendation = 'BLOCKER: Do not automate moving target - wait for process stabilization or redesign completion';
    }
  } else if (dimension === 'Workflow Brittleness') {
    if (category === 'strength') {
      analysis = `${agreement} (variance: ${variance.toFixed(1)}) that workflow is resilient with clear exception handling. Process operates smoothly even when disruptions occur.`;
      recommendation = 'Automation can replicate existing exception patterns - document current resilience mechanisms';
    } else if (category === 'moderate') {
      analysis = `Workflow handles most scenarios but has known failure points (variance: ${variance.toFixed(1)}). ${varianceLevel === 'high' ? 'Varying views on brittleness' : 'Responses indicate'} some dependency risks.`;
      recommendation = 'Identify and test failure scenarios before automation - build in error handling and alerting for known edge cases';
    } else if (category === 'concern') {
      analysis = `Workflow is fragile with frequent breakdowns (variance: ${variance.toFixed(1)}). ${varianceLevel === 'high' ? 'Respondent disagreement highlights' : 'Responses show'} dependency on specific people or systems.`;
      recommendation = 'PRIORITY: Strengthen process resilience first - reduce dependencies, formalize workarounds, establish backup procedures';
    } else {
      analysis = `Critical brittleness - workflow regularly fails (variance: ${variance.toFixed(1)}). ${respondentCount > 1 ? 'Respondents report' : 'Respondent reports'} high dependency on individuals or unreliable systems.`;
      recommendation = 'BLOCKER: Fix fundamental process issues before automation - automation will amplify brittleness without resilience improvements';
    }
  }

  return {
    dimension,
    score: average,
    variance,
    category,
    analysis: analysis!,
    recommendation: recommendation!
  };
};

const getOverallRecommendation = (insights: OperationalInsight[]): {
  decision: 'Ready' | 'Prepare' | 'Not Ready';
  variant: 'default' | 'secondary' | 'destructive';
  icon: typeof CheckCircle2;
  reasoning: string;
  timeframe: string;
} => {
  const critical = insights.filter(i => i.category === 'critical');
  const concerns = insights.filter(i => i.category === 'concern');
  const moderate = insights.filter(i => i.category === 'moderate');
  const strengths = insights.filter(i => i.category === 'strength');

  // Calculate average score
  const avgScore = insights.reduce((sum, i) => sum + i.score, 0) / insights.length;

  // Not Ready: Any critical issues or multiple concerns
  if (critical.length > 0 || concerns.length >= 2 || avgScore < 50) {
    const criticalAreas = critical.map(c => c.dimension).join(', ');
    const concernAreas = concerns.map(c => c.dimension).join(', ');
    
    let reasoning = '';
    if (critical.length > 0) {
      reasoning = `Critical operational gaps in ${criticalAreas} create fundamental barriers. `;
    }
    if (concerns.length > 0) {
      reasoning += `${concerns.length} major concern${concerns.length > 1 ? 's' : ''} in ${concernAreas} require resolution. `;
    }
    reasoning += strengths.length > 0
      ? `While ${strengths.map(s => s.dimension).join(' and ')} show promise, operational foundation must be strengthened before automation.`
      : 'Current process maturity insufficient for automation ROI.';

    return {
      decision: 'Not Ready',
      variant: 'destructive',
      icon: XCircle,
      reasoning,
      timeframe: '2-4 months operational improvements before automation feasible'
    };
  }

  // Ready: High scores, no major concerns
  if (avgScore >= 70 && critical.length === 0 && concerns.length === 0) {
    const strengthAreas = strengths.map(s => s.dimension).join(', ');
    let reasoning = `Strong operational foundation across ${strengths.length} dimension${strengths.length > 1 ? 's' : ''}: ${strengthAreas}. `;
    
    if (moderate.length > 0) {
      reasoning += `Minor optimizations in ${moderate.map(m => m.dimension).join(', ')} can be addressed during implementation. `;
    }
    reasoning += 'Process clarity, stability, and resilience support immediate automation development.';

    return {
      decision: 'Ready',
      variant: 'default',
      icon: CheckCircle2,
      reasoning,
      timeframe: 'Operationally ready - proceed to implementation planning'
    };
  }

  // Prepare: Moderate scores, manageable risks
  let reasoning = `Viable automation opportunity requiring targeted preparation (avg: ${avgScore.toFixed(0)}/100). `;
  
  if (strengths.length > 0) {
    reasoning += `Leverage ${strengths.map(s => s.dimension).join(' and ')} as foundation. `;
  }
  
  if (concerns.length > 0) {
    reasoning += `Address ${concerns.map(c => c.dimension).join(', ')} gaps before implementation. `;
  } else if (moderate.length > 0) {
    reasoning += `Optimize ${moderate.map(m => m.dimension).join(', ')} during planning phase. `;
  }
  
  reasoning += 'Preparation timeline is manageable with focused operational improvements.';

  const prepWeeks = concerns.length * 6 + moderate.length * 3;

  return {
    decision: 'Prepare',
    variant: 'secondary',
    icon: AlertTriangle,
    reasoning,
    timeframe: `${prepWeeks}-${prepWeeks + 4} weeks operational preparation recommended`
  };
};

export default function PIFExecutiveSummary({ aggregatedScores, stepName }: PIFExecutiveSummaryProps) {
  // Generate insights for each operational dimension
  const insights: OperationalInsight[] = [
    analyzeOperationalDimension(
      'Process Clarity',
      aggregatedScores.processClarity.average,
      aggregatedScores.processClarity.variance,
      aggregatedScores.processClarity.min,
      aggregatedScores.processClarity.max,
      aggregatedScores.respondentCount
    ),
    analyzeOperationalDimension(
      'Change Magnitude',
      aggregatedScores.changeMagnitude.average,
      aggregatedScores.changeMagnitude.variance,
      aggregatedScores.changeMagnitude.min,
      aggregatedScores.changeMagnitude.max,
      aggregatedScores.respondentCount
    ),
    analyzeOperationalDimension(
      'Workflow Brittleness',
      aggregatedScores.workflowBrittleness.average,
      aggregatedScores.workflowBrittleness.variance,
      aggregatedScores.workflowBrittleness.min,
      aggregatedScores.workflowBrittleness.max,
      aggregatedScores.respondentCount
    ),
  ];

  const recommendation = getOverallRecommendation(insights);
  const RecommendationIcon = recommendation.icon;

  // Categorize insights
  const strengths = insights.filter(i => i.category === 'strength');
  const concerns = insights.filter(i => i.category === 'concern' || i.category === 'critical');
  const moderate = insights.filter(i => i.category === 'moderate');

  // Calculate average score
  const avgScore = insights.reduce((sum, i) => sum + i.score, 0) / insights.length;

  return (
    <Card className="p-6 border-2" data-testid="card-pif-executive-summary">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">
            Layer 2: Operational Readiness Analysis
            {stepName && <span className="text-muted-foreground"> - {stepName}</span>}
          </h2>
          <p className="text-sm text-muted-foreground">
            Executive summary based on {aggregatedScores.respondentCount} respondent{aggregatedScores.respondentCount > 1 ? 's' : ''} across 40-question Process Insight Form
          </p>
        </div>

        {/* Overall Recommendation */}
        <Alert variant={recommendation.variant === 'destructive' ? 'destructive' : 'default'} className="border-2">
          <div className="flex items-start gap-3">
            <RecommendationIcon className="h-6 w-6 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h3 className="font-bold text-lg">Operational Status: {recommendation.decision}</h3>
                <Badge variant={recommendation.variant} className="text-xs">
                  {recommendation.timeframe}
                </Badge>
              </div>
              <AlertDescription>
                <p className="text-sm mb-2">{recommendation.reasoning}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3 flex-wrap">
                  <span>Avg Operational Score: <strong>{avgScore.toFixed(0)}/100</strong></span>
                  <span>•</span>
                  <span>Respondents: <strong>{aggregatedScores.respondentCount}</strong></span>
                  <span>•</span>
                  <span>Strengths: <strong>{strengths.length}/3</strong></span>
                  <span>•</span>
                  <span>Concerns: <strong>{concerns.length}/3</strong></span>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Operational Dimensions Analysis */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              <h4 className="font-semibold text-sm">Operational Strengths</h4>
            </div>
            {strengths.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {strengths.map(insight => (
                  <li key={insight.dimension} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-chart-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-medium text-xs">{insight.dimension}</span>
                        <Badge variant="default" className="text-xs">{insight.score.toFixed(0)}/100</Badge>
                        <span className="text-xs text-muted-foreground">
                          (σ²: {insight.variance.toFixed(1)})
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 text-muted-foreground">{insight.analysis}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No clear strengths identified - all operational dimensions need improvement</p>
            )}
          </Card>

          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h4 className="font-semibold text-sm">Operational Concerns</h4>
            </div>
            {concerns.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {concerns.map(insight => (
                  <li key={insight.dimension} className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-medium text-xs">{insight.dimension}</span>
                        <Badge variant="destructive" className="text-xs">{insight.score.toFixed(0)}/100</Badge>
                        <span className="text-xs text-muted-foreground">
                          (σ²: {insight.variance.toFixed(1)})
                        </span>
                      </div>
                      <p className="text-xs mt-0.5 text-muted-foreground">{insight.analysis}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No critical concerns - operational foundation is solid</p>
            )}
          </Card>
        </div>

        {/* Detailed Recommendations */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4" />
            <h4 className="font-semibold text-sm">Action Recommendations</h4>
          </div>
          <div className="space-y-3">
            {insights.map(insight => (
              <div key={insight.dimension} className="flex items-start gap-2">
                <Layers className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-xs">{insight.dimension}</span>
                    <Badge 
                      variant={
                        insight.category === 'strength' ? 'default' : 
                        insight.category === 'moderate' ? 'secondary' : 
                        'destructive'
                      } 
                      className="text-xs"
                    >
                      {insight.category === 'critical' ? 'BLOCKER' : 
                       insight.category === 'concern' ? 'PRIORITY' : 
                       insight.category === 'moderate' ? 'Optimize' : 'Leverage'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Respondent Context */}
        {aggregatedScores.respondentCount > 1 && (
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Multi-Respondent Analysis:</strong> Variance (σ²) indicates agreement level among {aggregatedScores.respondentCount} respondents. 
              Low variance (&lt;8) shows consensus, moderate (8-15) shows some disagreement, high (&gt;15) suggests significant divergence in perspectives.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </Card>
  );
}
