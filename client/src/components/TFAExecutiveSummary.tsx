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
  Target,
  Zap
} from "lucide-react";
import { TFA_QUESTIONS } from "@shared/tfaQuestions";

interface SectionScore {
  name: string;
  score: number;
  weight: number;
}

interface TFAExecutiveSummaryProps {
  score: number;
  sections: SectionScore[];
  responses: Record<string, string>;
}

interface RecommendationResult {
  decision: 'Proceed' | 'Proceed with Caution' | 'Not Recommended';
  variant: 'default' | 'secondary' | 'destructive';
  icon: typeof CheckCircle2;
  reasoning: string;
  timeframe: string;
}

interface SectionInsight {
  name: string;
  score: number;
  category: 'strength' | 'opportunity' | 'risk' | 'critical';
  specificIssues: string[];
  recommendations: string[];
}

// Analyze specific responses for each section to generate insights
const analyzeSectionResponses = (
  sectionName: string, 
  sectionScore: number,
  responses: Record<string, string>
): SectionInsight => {
  const sectionQuestions = TFA_QUESTIONS.filter(q => q.section === sectionName);
  const specificIssues: string[] = [];
  const recommendations: string[] = [];
  
  // Analyze each question response
  sectionQuestions.forEach(question => {
    const responseValue = responses[question.id.toString()];
    if (!responseValue) return;
    
    const selectedOption = question.options.find(opt => opt.value === responseValue);
    if (!selectedOption) return;
    
    const score = selectedOption.score;
    
    // Critical issues (score 1-2)
    if (score <= 2) {
      specificIssues.push(`${question.question.split(':')[0]}: ${selectedOption.label}`);
      
      // Generate context-specific recommendations based on the question
      if (question.id === 1) { // Deployment model
        recommendations.push("Develop cloud migration strategy or hybrid integration approach");
      } else if (question.id === 2) { // API availability
        recommendations.push("Invest in API development or consider RPA for UI automation");
      } else if (question.id === 3) { // System access
        recommendations.push("Work with IT to enable service account access and programmatic authentication");
      } else if (question.id === 4) { // Data structure
        recommendations.push("Implement data standardization and ETL preprocessing pipeline");
      } else if (question.id === 5) { // Data quality
        recommendations.push("Deploy data validation rules and quality monitoring before automation");
      } else if (question.id === 6) { // Data availability
        recommendations.push("Begin collecting training data; consider starting with rule-based approach initially");
      } else if (question.id === 7) { // Integration complexity
        recommendations.push("Break down integration into phases; prioritize core system connections");
      } else if (question.id === 8) { // System compatibility
        recommendations.push("Evaluate middleware platforms (MuleSoft, Zapier) or custom integration layer");
      } else if (question.id === 9) { // Authentication
        recommendations.push("Simplify auth flow or allocate extra time for complex credential management");
      } else if (question.id === 10) { // Data sensitivity
        recommendations.push("Engage security/compliance team early; plan for data encryption and access controls");
      } else if (question.id === 11) { // Compliance
        recommendations.push("Complete compliance review and security assessment before proceeding");
      } else if (question.id === 12) { // Security approval
        recommendations.push("Start security review process immediately; parallelize with design phase");
      } else if (question.id === 13) { // Process definition
        recommendations.push("Document current process in detail; map decision trees and exceptions");
      } else if (question.id === 14) { // Process changes
        recommendations.push("Stabilize process or build flexibility into automation logic");
      } else if (question.id === 15) { // Business sponsorship
        recommendations.push("Secure executive sponsor; develop business case to gain leadership support");
      } else if (question.id === 16) { // Technical ownership
        recommendations.push("Assign dedicated technical lead with clear responsibilities and allocated time");
      }
    }
    
    // Mid-range optimization opportunities (score 3-4)
    else if (score >= 3 && score <= 4) {
      if (question.id === 1 && score === 3) {
        recommendations.push("Leverage hybrid architecture; prioritize cloud-based components for new development");
      } else if (question.id === 2 && score === 3) {
        recommendations.push("Expand API coverage for critical functions; document workarounds for limited areas");
      } else if (question.id === 4 && score === 3) {
        recommendations.push("Apply data transformation layer; consider semi-structured data parsing tools");
      } else if (question.id === 5 && score === 4) {
        recommendations.push("Add validation checkpoints; monitor data quality metrics post-implementation");
      } else if (question.id === 7 && score === 4) {
        recommendations.push("Use integration patterns to simplify two-system connection");
      } else if (question.id === 13 && score === 4) {
        recommendations.push("Review edge cases with process owners; enhance documentation with examples");
      }
    }
  });
  
  // Determine category
  let category: 'strength' | 'opportunity' | 'risk' | 'critical';
  if (sectionScore >= 4.0) category = 'strength';
  else if (sectionScore >= 2.5 && sectionScore < 4.0) category = 'opportunity';
  else if (sectionScore >= 1.5 && sectionScore < 2.5) category = 'risk';
  else category = 'critical';
  
  return {
    name: sectionName,
    score: sectionScore,
    category,
    specificIssues,
    recommendations
  };
};

const getRecommendation = (
  score: number, 
  insights: SectionInsight[]
): RecommendationResult => {
  const critical = insights.filter(i => i.category === 'critical');
  const risks = insights.filter(i => i.category === 'risk');
  const opportunities = insights.filter(i => i.category === 'opportunity');
  const strengths = insights.filter(i => i.category === 'strength');
  
  // Build comprehensive reasoning
  let reasoning = '';
  
  // Not Recommended: Multiple critical issues or very low score
  if (critical.length >= 2 || score < 40) {
    const criticalAreas = critical.map(c => c.name).join(', ');
    reasoning = `Multiple fundamental barriers in ${criticalAreas || 'core areas'} prevent successful automation. `;
    reasoning += `With ${critical.length + risks.length} areas requiring significant remediation, focus on foundational improvements first. `;
    reasoning += strengths.length > 0 
      ? `While ${strengths.map(s => s.name).join(' and ')} show promise, critical gaps must be addressed before proceeding.`
      : 'Current infrastructure and process maturity are insufficient for automation ROI.';
    
    return {
      decision: 'Not Recommended',
      variant: 'destructive',
      icon: XCircle,
      reasoning,
      timeframe: '3-6 months of foundational work before re-assessment'
    };
  }
  
  // Proceed: High score with strong foundation
  if (score >= 75 && critical.length === 0 && risks.length <= 1) {
    reasoning = `Strong feasibility across ${strengths.length} key dimension${strengths.length > 1 ? 's' : ''}: ${strengths.map(s => s.name).join(', ')}. `;
    if (opportunities.length > 0) {
      reasoning += `Minor optimizations in ${opportunities.map(o => o.name).join(', ')} can be addressed during implementation. `;
    }
    reasoning += 'Technical foundation, data quality, and organizational readiness support immediate automation planning.';
    
    return {
      decision: 'Proceed',
      variant: 'default',
      icon: CheckCircle2,
      reasoning,
      timeframe: 'Ready for immediate planning and implementation'
    };
  }
  
  // Proceed with Caution: Moderate score, manageable risks
  if (score >= 60 && critical.length === 0) {
    reasoning = `Viable automation opportunity with ${risks.length + opportunities.length} areas requiring attention. `;
    if (strengths.length > 0) {
      reasoning += `Strong ${strengths.map(s => s.name).join(' and ')} provide solid foundation. `;
    }
    if (risks.length > 0) {
      reasoning += `Address ${risks.map(r => r.name).join(', ')} gaps before full implementation. `;
    }
    reasoning += opportunities.length > 0
      ? `Optimize ${opportunities.map(o => o.name).join(', ')} during planning phase for better outcomes.`
      : 'Remediation timeline is manageable with focused preparation.';
    
    const prepWeeks = risks.length * 2 + opportunities.length;
    return {
      decision: 'Proceed with Caution',
      variant: 'secondary',
      icon: AlertTriangle,
      reasoning,
      timeframe: `${prepWeeks}-${prepWeeks + 4} weeks preparation before automation development`
    };
  }
  
  // Proceed with Caution: Lower scores but still viable
  reasoning = `Feasibility score of ${score}/100 indicates significant preparation required. `;
  reasoning += critical.length === 1 
    ? `Critical issue in ${critical[0].name} must be resolved first. `
    : `${risks.length} risk area${risks.length > 1 ? 's' : ''} need remediation: ${risks.map(r => r.name).join(', ')}. `;
  if (strengths.length > 0) {
    reasoning += `Leverage strengths in ${strengths.map(s => s.name).join(', ')} for early wins and momentum. `;
  }
  reasoning += 'Automation remains viable but requires substantial groundwork and risk mitigation planning.';
  
  const totalWeeks = critical.length * 8 + risks.length * 4 + opportunities.length * 2;
  return {
    decision: 'Proceed with Caution',
    variant: 'secondary',
    icon: AlertTriangle,
    reasoning,
    timeframe: `${totalWeeks}-${totalWeeks + 4} weeks preparation before automation development`
  };
};

const generateActionPlan = (
  decision: string,
  insights: SectionInsight[],
  score: number
): string[] => {
  const critical = insights.filter(i => i.category === 'critical');
  const risks = insights.filter(i => i.category === 'risk');
  const opportunities = insights.filter(i => i.category === 'opportunity');
  const strengths = insights.filter(i => i.category === 'strength');
  
  const actions: string[] = [];
  
  if (decision === 'Proceed') {
    actions.push(`Initiate solution design focusing on ${strengths.map(s => s.name).join(' and ')} as primary automation targets`);
    
    if (opportunities.length > 0) {
      const topOpportunity = opportunities[0];
      actions.push(`Optimize ${topOpportunity.name}: ${topOpportunity.recommendations[0] || 'Enhance current capabilities during implementation'}`);
    } else {
      actions.push('Build proof-of-concept for highest-impact workflow components');
    }
    
    actions.push('Develop phased implementation roadmap with quick wins in first 30 days');
    
    if (insights.some(i => i.name === 'Security/Compliance' && i.score < 4.5)) {
      actions.push('Begin security review in parallel to avoid delays in deployment phase');
    }
  }
  
  else if (decision === 'Proceed with Caution') {
    // Address critical first
    if (critical.length > 0) {
      const topCritical = critical[0];
      actions.push(`PRIORITY: Resolve ${topCritical.name} gap - ${topCritical.recommendations[0] || 'Focus on critical remediation'}`);
    }
    
    // Address top risks
    if (risks.length > 0) {
      const topRisk = risks[0];
      actions.push(`Address ${topRisk.name} weakness: ${topRisk.recommendations[0] || 'Implement improvement plan'}`);
    }
    
    // Leverage strengths
    if (strengths.length > 0) {
      actions.push(`Pilot automation in strong area (${strengths[0].name}) to build confidence and demonstrate value`);
    } else if (opportunities.length > 0) {
      actions.push(`Start with ${opportunities[0].name} optimization to create foundation for automation`);
    }
    
    // Re-assessment
    const allWeaknesses = [...critical, ...risks];
    if (allWeaknesses.length > 2) {
      actions.push(`Remediate remaining ${allWeaknesses.length - 1} gap${allWeaknesses.length > 2 ? 's' : ''}, then re-assess feasibility before full implementation`);
    } else {
      actions.push('Re-validate technical feasibility after remediation work completes');
    }
    
    // Risk mitigation
    actions.push('Develop contingency plans for identified risks; establish success metrics and monitoring');
  }
  
  else { // Not Recommended
    actions.push('Halt automation planning; focus resources on foundational improvements');
    
    // Address critical gaps
    critical.forEach(c => {
      if (actions.length < 4 && c.recommendations[0]) {
        actions.push(`${c.name}: ${c.recommendations[0]}`);
      }
    });
    
    // Fill with top risks if needed
    if (actions.length < 3) {
      risks.forEach(r => {
        if (actions.length < 4 && r.recommendations[0]) {
          actions.push(`${r.name}: ${r.recommendations[0]}`);
        }
      });
    }
    
    // Add re-assessment
    if (actions.length < 4) {
      actions.push('Schedule re-assessment after completing critical remediation work (3-6 months)');
    }
  }
  
  return actions.slice(0, 4);
};

export default function TFAExecutiveSummary({ score, sections, responses }: TFAExecutiveSummaryProps) {
  // Generate deep insights for each section
  const insights = sections.map(section => 
    analyzeSectionResponses(section.name, section.score, responses)
  );
  
  const recommendation = getRecommendation(score, insights);
  const actionPlan = generateActionPlan(recommendation.decision, insights, score);
  const RecommendationIcon = recommendation.icon;
  
  // Categorize insights
  const strengths = insights.filter(i => i.category === 'strength');
  const opportunities = insights.filter(i => i.category === 'opportunity');
  const risks = insights.filter(i => i.category === 'risk');
  const critical = insights.filter(i => i.category === 'critical');
  
  // Calculate metrics
  const avgScore = sections.reduce((sum, s) => sum + s.score, 0) / sections.length;
  const consistency = Math.max(...sections.map(s => s.score)) - Math.min(...sections.map(s => s.score));
  const isBalanced = consistency < 2.0;

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

        {/* Key Findings - Enhanced with all categories */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              <h4 className="font-semibold text-sm">Strengths & Opportunities</h4>
            </div>
            {strengths.length > 0 || opportunities.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {strengths.map(s => (
                  <li key={s.name} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-chart-2 flex-shrink-0" />
                    <span><strong>{s.name}</strong> ({s.score.toFixed(1)}/5.0)</span>
                  </li>
                ))}
                {opportunities.map(o => (
                  <li key={o.name} className="flex items-start gap-2">
                    <Zap className="h-3 w-3 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span><strong>{o.name}</strong> ({o.score.toFixed(1)}/5.0)</span>
                      {o.recommendations[0] && (
                        <p className="text-xs text-muted-foreground mt-0.5">{o.recommendations[0]}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">All sections require improvement</p>
            )}
          </Card>

          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-destructive" />
              <h4 className="font-semibold text-sm">Risks & Critical Issues</h4>
            </div>
            {critical.length > 0 || risks.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {critical.map(c => (
                  <li key={c.name} className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{c.name}</span>
                        <Badge variant="destructive" className="text-xs">Critical</Badge>
                      </div>
                      {c.specificIssues[0] && (
                        <p className="text-xs text-muted-foreground mt-0.5">{c.specificIssues[0]}</p>
                      )}
                    </div>
                  </li>
                ))}
                {risks.map(r => (
                  <li key={r.name} className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{r.name}</span>
                        <Badge variant="secondary" className="text-xs">Risk</Badge>
                      </div>
                      {r.specificIssues[0] && (
                        <p className="text-xs text-muted-foreground mt-0.5">{r.specificIssues[0]}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No significant risks identified</p>
            )}
          </Card>
        </div>

        {/* Prioritized Actions - Now fully dynamic */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4" />
            <h4 className="font-semibold">Prioritized Action Plan</h4>
          </div>
          <div className="space-y-2">
            {actionPlan.map((action, index) => (
              <div key={index} className="flex items-start gap-2 text-sm p-3 bg-muted/50 rounded-lg">
                <span className="font-bold text-primary">{index + 1}.</span>
                <p>{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Indicator */}
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm">
              <strong>Estimated Timeline:</strong> {recommendation.timeframe}
              {(critical.length > 0 || risks.length > 0) && (
                <span className="ml-2 text-muted-foreground">
                  (includes {critical.length * 8 + risks.length * 4 + opportunities.length * 2} weeks remediation)
                </span>
              )}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
