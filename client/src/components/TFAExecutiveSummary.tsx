import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Clock,
  Target
} from "lucide-react";

interface SectionScore {
  name: string;
  score: number;
  weight: number;
}

interface TFAExecutiveSummaryProps {
  score: number;
  sections: SectionScore[];
}

interface RecommendationResult {
  decision: 'Proceed' | 'Proceed with Caution' | 'Not Recommended';
  variant: 'default' | 'secondary' | 'destructive';
  icon: typeof CheckCircle2;
  reasoning: string;
  timeframe: string;
}

const getRecommendation = (score: number, weakSections: SectionScore[]): RecommendationResult => {
  const criticalWeaknesses = weakSections.filter(s => s.score < 1.5).length;
  const highWeaknesses = weakSections.filter(s => s.score >= 1.5 && s.score < 2.5).length;
  
  // Not Recommended: Score too low OR multiple critical weaknesses
  if (score < 40 || criticalWeaknesses >= 2) {
    return {
      decision: 'Not Recommended',
      variant: 'destructive',
      icon: XCircle,
      reasoning: 'Fundamental issues prevent successful automation at this time. Focus on process improvement and infrastructure development first.',
      timeframe: '3-6 months of foundational work before re-assessment'
    };
  }
  
  // Proceed: High score AND no critical weaknesses
  if (score >= 75 && criticalWeaknesses === 0) {
    return {
      decision: 'Proceed',
      variant: 'default',
      icon: CheckCircle2,
      reasoning: 'Strong feasibility across all dimensions. Workflow is well-positioned for automation with minimal preparation required.',
      timeframe: 'Ready for immediate planning and implementation'
    };
  }
  
  // Proceed with Caution: Everything else (moderate scores, some weaknesses, but viable)
  if (score >= 60 && criticalWeaknesses === 0) {
    return {
      decision: 'Proceed with Caution',
      variant: 'secondary',
      icon: AlertTriangle,
      reasoning: 'Moderate feasibility with some gaps. Address identified weaknesses during implementation planning phase.',
      timeframe: '2-4 weeks preparation before automation development'
    };
  }
  
  // Proceed with Caution: Lower scores or 1 critical weakness but still viable
  return {
    decision: 'Proceed with Caution',
    variant: 'secondary',
    icon: AlertTriangle,
    reasoning: 'Feasibility concerns exist but automation remains viable. Significant preparation and remediation required before proceeding.',
    timeframe: '4-8 weeks preparation before automation development'
  };
};

export default function TFAExecutiveSummary({ score, sections }: TFAExecutiveSummaryProps) {
  const weakSections = sections.filter(s => s.score < 2.5);
  const strongSections = sections.filter(s => s.score >= 4.0);
  const recommendation = getRecommendation(score, weakSections);
  const RecommendationIcon = recommendation.icon;
  
  // Calculate key metrics
  const avgScore = sections.reduce((sum, s) => sum + s.score, 0) / sections.length;
  const consistency = Math.max(...sections.map(s => s.score)) - Math.min(...sections.map(s => s.score));
  const isBalanced = consistency < 2.0;
  
  // Identify top risks
  const risks = [
    ...weakSections.slice(0, 3).map(s => ({
      area: s.name,
      severity: s.score < 1.5 ? 'High' : 'Medium',
      impact: `${s.weight}% of total score`
    })),
  ];

  return (
    <Card className="p-6 border-2">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Layer 1: Technical Feasibility Assessment</h2>
          <p className="text-sm text-muted-foreground">
            Executive summary and strategic recommendation based on comprehensive 21-point TFA evaluation
          </p>
        </div>

        {/* Go/No-Go Decision */}
        <Alert variant={recommendation.variant === 'destructive' ? 'destructive' : 'default'} className="border-2">
          <div className="flex items-start gap-3">
            <RecommendationIcon className="h-6 w-6 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">Recommendation: {recommendation.decision}</h3>
                <Badge variant={recommendation.variant} className="text-xs">
                  {recommendation.timeframe}
                </Badge>
              </div>
              <AlertDescription>
                <p className="text-sm mb-2">{recommendation.reasoning}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                  <span>Overall Score: <strong>{score}/100</strong></span>
                  <span>•</span>
                  <span>Avg Section Score: <strong>{avgScore.toFixed(1)}/5.0</strong></span>
                  <span>•</span>
                  <span>Balance: <strong>{isBalanced ? 'Good' : 'Uneven'}</strong></span>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>

        {/* Key Findings */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              <h4 className="font-semibold text-sm">Strengths</h4>
            </div>
            {strongSections.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {strongSections.map(s => (
                  <li key={s.name} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-chart-2" />
                    <span>{s.name} ({s.score.toFixed(1)}/5.0)</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No sections scored above 4.0</p>
            )}
          </Card>

          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-destructive" />
              <h4 className="font-semibold text-sm">Risk Factors</h4>
            </div>
            {risks.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {risks.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-destructive mt-0.5" />
                    <div>
                      <span className="font-medium">{risk.area}:</span>{' '}
                      <Badge variant={risk.severity === 'High' ? 'destructive' : 'secondary'} className="text-xs ml-1">
                        {risk.severity}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">{risk.impact}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No significant risks identified</p>
            )}
          </Card>
        </div>

        {/* Prioritized Actions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4" />
            <h4 className="font-semibold">Prioritized Action Plan</h4>
          </div>
          <div className="space-y-2">
            {recommendation.decision === 'Proceed' && (
              <>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">1.</span>
                  <p>Initiate automation planning and solution design phase</p>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">2.</span>
                  <p>Build proof-of-concept focusing on highest-value sections</p>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">3.</span>
                  <p>Develop implementation roadmap with phased rollout strategy</p>
                </div>
              </>
            )}
            {recommendation.decision === 'Proceed with Caution' && (
              <>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">1.</span>
                  <p>Address {weakSections.length} identified weakness{weakSections.length > 1 ? 'es' : ''} following remediation roadmap</p>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">2.</span>
                  <p>Consider pilot automation in strong areas ({strongSections.length > 0 ? strongSections[0].name : 'best performing section'})</p>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">3.</span>
                  <p>Re-assess feasibility after remediation efforts complete</p>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">4.</span>
                  <p>Develop risk mitigation strategies for implementation phase</p>
                </div>
              </>
            )}
            {recommendation.decision === 'Not Recommended' && (
              <>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">1.</span>
                  <p>Halt automation planning and focus on foundational improvements</p>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">2.</span>
                  <p>Implement manual process optimization to improve efficiency</p>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">3.</span>
                  <p>Address critical gaps: {weakSections.filter(s => s.score < 1.5).map(s => s.name).join(', ')}</p>
                </div>
                <div className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                  <span className="font-bold text-primary">4.</span>
                  <p>Schedule re-assessment in {recommendation.timeframe.toLowerCase()}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Timeline Indicator */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm">
              <strong>Estimated Timeline:</strong> {recommendation.timeframe}
              {weakSections.length > 0 && (
                <span className="ml-2 text-muted-foreground">
                  (includes {weakSections.reduce((sum, s) => {
                    const effort = s.score < 1.5 ? 8 : s.score < 2.0 ? 4 : 2;
                    return sum + effort;
                  }, 0)} weeks remediation)
                </span>
              )}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
