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
import { TFA_QUESTIONS, calculateQuestionImpact, getSectionWeight, type QuestionWithImpact, QUESTION_RECOMMENDATIONS } from "@shared/tfaQuestions";

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
  weight: number;  // Section weight for prioritization
  category: 'strength' | 'opportunity' | 'risk' | 'critical';
  specificIssues: string[];
  recommendations: string[];
  weightedSeverity: number;  // weight × severity for prioritization
}

// Analyze specific responses for each section to generate insights
const analyzeSectionResponses = (
  sectionName: string, 
  sectionScore: number,
  sectionWeight: number,
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
    
    // Skip "Don't Know" responses (score is null)
    if (score === null) return;
    
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
  
  // Calculate weighted severity: weight × (5 - score) so higher weight + lower score = higher priority
  // This ensures Integration (25%) and Data Quality (25%) issues are prioritized
  const weightedSeverity = sectionWeight * (5 - sectionScore);
  
  return {
    name: sectionName,
    score: sectionScore,
    weight: sectionWeight,
    category,
    specificIssues,
    recommendations,
    weightedSeverity
  };
};

const getRecommendation = (
  score: number, 
  insights: SectionInsight[]
): RecommendationResult => {
  // Filter and sort by weighted severity (weight × (5 - score)) for true prioritization
  const critical = insights.filter(i => i.category === 'critical').sort((a, b) => b.weightedSeverity - a.weightedSeverity);
  const risks = insights.filter(i => i.category === 'risk').sort((a, b) => b.weightedSeverity - a.weightedSeverity);
  const opportunities = insights.filter(i => i.category === 'opportunity').sort((a, b) => b.weightedSeverity - a.weightedSeverity);
  const strengths = insights.filter(i => i.category === 'strength').sort((a, b) => b.weight - a.weight);
  
  // Check for high-severity critical/risk issues (weighted severity > threshold)
  const highSeverityCritical = critical.filter(c => c.weightedSeverity >= 40);  // High weight × low score
  const highSeverityRisks = risks.filter(r => r.weightedSeverity >= 30);
  
  // Build comprehensive reasoning
  let reasoning = '';
  
  // Not Recommended: High-severity critical issues OR multiple critical issues
  if (highSeverityCritical.length > 0 || critical.length >= 2 || score < 40) {
    if (highSeverityCritical.length > 0) {
      const criticalHeavy = highSeverityCritical.map(c => `${c.name} (${c.weight}% weight)`).join(', ');
      reasoning = `Critical issues in high-impact areas (${criticalHeavy}) create fundamental barriers to automation. `;
    } else {
      const criticalAreas = critical.map(c => c.name).join(', ');
      reasoning = `Multiple fundamental barriers in ${criticalAreas || 'core areas'} prevent successful automation. `;
    }
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
      timeframe: 'Technically feasible - ready for readiness rubric evaluation'
    };
  }
  
  // Proceed with Caution: Moderate score, manageable risks
  if (score >= 60 && critical.length === 0) {
    reasoning = `Viable automation opportunity with ${risks.length + opportunities.length} areas requiring attention. `;
    if (strengths.length > 0) {
      reasoning += `Strong ${strengths.map(s => s.name).join(' and ')} provide solid foundation. `;
    }
    if (risks.length > 0) {
      // Prioritize high-severity risks in messaging
      if (highSeverityRisks.length > 0) {
        const heavyRisks = highSeverityRisks.map(r => `${r.name} (${r.weight}% weight)`).join(', ');
        reasoning += `Priority focus on high-impact areas: ${heavyRisks}. `;
      } else {
        reasoning += `Address ${risks.map(r => r.name).join(', ')} gaps before full implementation. `;
      }
    }
    reasoning += opportunities.length > 0
      ? `Optimize ${opportunities.map(o => o.name).join(', ')} during planning phase for better outcomes.`
      : 'Remediation timeline is manageable with focused preparation.';
    
    // Calculate prep time weighted by severity
    const prepWeeks = highSeverityRisks.length * 4 + risks.length * 2 + opportunities.length;
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
  if (critical.length === 1) {
    const c = critical[0];
    reasoning += `Critical issue in ${c.name} (${c.weight}% weight) must be resolved first. `;
  } else if (risks.length > 0) {
    const topRisks = risks.slice(0, 2).map(r => `${r.name} (${r.weight}%)`).join(', ');
    reasoning += `${risks.length} risk area${risks.length > 1 ? 's' : ''} need remediation, prioritizing: ${topRisks}. `;
  }
  if (strengths.length > 0) {
    reasoning += `Leverage strengths in ${strengths.map(s => s.name).join(', ')} for early wins and momentum. `;
  }
  reasoning += 'Automation remains viable but requires substantial groundwork and risk mitigation planning.';
  
  // Weight remediation time by section importance  
  const criticalWeeks = critical.reduce((sum, c) => sum + (c.weight / 5), 0);
  const riskWeeks = risks.reduce((sum, r) => sum + (r.weight / 10), 0);
  const totalWeeks = Math.round(criticalWeeks + riskWeeks + opportunities.length);
  return {
    decision: 'Proceed with Caution',
    variant: 'secondary',
    icon: AlertTriangle,
    reasoning,
    timeframe: `${totalWeeks}-${totalWeeks + 4} weeks technical remediation required before feasibility`
  };
};

const generateImplementationRoadmap = (
  responses: Record<string, string>,
  decision: string
): Array<{ priority: string; action: string; impact: number }> => {
  const roadmap: Array<{ priority: string; action: string; impact: number }> = [];
  
  // Build question-level impact list
  const questionImpacts: QuestionWithImpact[] = [];
  
  TFA_QUESTIONS.forEach(question => {
    const responseValue = responses[question.id.toString()];
    if (!responseValue) return;
    
    const selectedOption = question.options.find(opt => opt.value === responseValue);
    if (!selectedOption || selectedOption.score === null) return;
    
    const sectionWeight = getSectionWeight(question.section);
    const impactScore = calculateQuestionImpact(question.id, selectedOption.score, sectionWeight);
    
    questionImpacts.push({
      id: question.id,
      question: question.question,
      section: question.section,
      sectionWeight,
      score: selectedOption.score,
      impactScore
    });
  });
  
  // Sort by impact score descending (highest impact first)
  questionImpacts.sort((a, b) => b.impactScore - a.impactScore);
  
  if (decision === 'Proceed') {
    // Show strengths and any minor optimizations
    const strengths = questionImpacts.filter(q => q.score === 5).slice(0, 2);
    const opportunities = questionImpacts.filter(q => q.score === 4).slice(0, 1);
    
    roadmap.push({
      priority: 'Ready',
      action: 'Technical feasibility confirmed - proceed to implementation readiness evaluation',
      impact: 100
    });
    
    if (strengths.length > 0) {
      roadmap.push({
        priority: 'Strength',
        action: `Leverage ${strengths[0].section} excellence (scored 5/5) as implementation foundation`,
        impact: strengths[0].sectionWeight
      });
    }
    
    if (opportunities.length > 0) {
      const rec = QUESTION_RECOMMENDATIONS[opportunities[0].id]?.[opportunities[0].score];
      roadmap.push({
        priority: 'Optimize',
        action: `${opportunities[0].section}: ${rec || 'Minor optimization opportunity'}`,
        impact: opportunities[0].impactScore
      });
    }
    
    roadmap.push({
      priority: 'Next Phase',
      action: 'Document technical architecture and proceed to readiness rubric assessment',
      impact: 50
    });
  }
  
  else if (decision === 'Proceed with Caution') {
    // Critical gaps (1-2), then risks (3), prioritized by impact
    const critical = questionImpacts.filter(q => q.score <= 2);
    const risks = questionImpacts.filter(q => q.score === 3);
    
    if (critical.length > 0) {
      const top = critical[0];
      const rec = QUESTION_RECOMMENDATIONS[top.id]?.[top.score];
      roadmap.push({
        priority: `CRITICAL (${top.sectionWeight}%)`,
        action: `${top.section}: ${rec || 'Immediate technical remediation required'}`,
        impact: top.impactScore
      });
    }
    
    if (critical.length > 1) {
      const second = critical[1];
      const rec = QUESTION_RECOMMENDATIONS[second.id]?.[second.score];
      roadmap.push({
        priority: `High Priority (${second.sectionWeight}%)`,
        action: `${second.section}: ${rec || 'Address before implementation'}`,
        impact: second.impactScore
      });
    }
    
    if (risks.length > 0) {
      const topRisk = risks[0];
      const rec = QUESTION_RECOMMENDATIONS[topRisk.id]?.[topRisk.score];
      roadmap.push({
        priority: `Risk (${topRisk.sectionWeight}%)`,
        action: `${topRisk.section}: ${rec || 'Mitigate during planning'}`,
        impact: topRisk.impactScore
      });
    }
    
    roadmap.push({
      priority: 'Re-assess',
      action: 'Re-evaluate technical feasibility after addressing top priority gaps',
      impact: 30
    });
  }
  
  else { // Not Recommended
    const criticalGaps = questionImpacts.filter(q => q.score <= 2).slice(0, 3);
    
    roadmap.push({
      priority: 'NOT RECOMMENDED',
      action: 'Technical feasibility insufficient - foundational improvements required',
      impact: 0
    });
    
    criticalGaps.forEach((gap, index) => {
      const rec = QUESTION_RECOMMENDATIONS[gap.id]?.[gap.score];
      roadmap.push({
        priority: `Priority ${index + 1} (${gap.sectionWeight}%)`,
        action: `${gap.section}: ${rec || 'Critical gap must be resolved'}`,
        impact: gap.impactScore
      });
    });
    
    if (roadmap.length < 4) {
      roadmap.push({
        priority: 'Timeline',
        action: '3-6 months foundational work before re-assessment recommended',
        impact: 0
      });
    }
  }
  
  return roadmap.slice(0, 4);
};

export default function TFAExecutiveSummary({ score, sections, responses }: TFAExecutiveSummaryProps) {
  // Generate deep insights for each section with weight-based prioritization
  const insights = sections.map(section => 
    analyzeSectionResponses(section.name, section.score, section.weight, responses)
  );
  
  const recommendation = getRecommendation(score, insights);
  const implementationRoadmap = generateImplementationRoadmap(responses, recommendation.decision);
  const RecommendationIcon = recommendation.icon;
  
  // Build question-level insights with impact scores
  const questionInsights: QuestionWithImpact[] = [];
  TFA_QUESTIONS.forEach(question => {
    const responseValue = responses[question.id.toString()];
    if (!responseValue) return;
    
    const selectedOption = question.options.find(opt => opt.value === responseValue);
    if (!selectedOption || selectedOption.score === null) return;
    
    const sectionWeight = getSectionWeight(question.section);
    const impactScore = calculateQuestionImpact(question.id, selectedOption.score, sectionWeight);
    
    questionInsights.push({
      id: question.id,
      question: question.question,
      section: question.section,
      sectionWeight,
      score: selectedOption.score,
      impactScore
    });
  });
  
  // Categorize by score for display
  const criticalGaps = questionInsights.filter(q => q.score <= 2).sort((a, b) => b.impactScore - a.impactScore).slice(0, 4);
  const strengths = questionInsights.filter(q => q.score === 5).sort((a, b) => b.sectionWeight - a.sectionWeight).slice(0, 3);
  const risks = questionInsights.filter(q => q.score === 3).sort((a, b) => b.impactScore - a.impactScore).slice(0, 2);
  
  // Categorize section insights (for backward compatibility with timeline calc)
  const critical = insights.filter(i => i.category === 'critical');
  const sectionRisks = insights.filter(i => i.category === 'risk');
  const opportunities = insights.filter(i => i.category === 'opportunity');
  
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

        {/* Question-Level Key Findings */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              <h4 className="font-semibold text-sm">Key Strengths</h4>
              <span className="text-xs text-muted-foreground">(Top scoring questions)</span>
            </div>
            {strengths.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {strengths.map(q => (
                  <li key={q.id} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-chart-2 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-medium text-xs">{q.section}</span>
                        <Badge variant="default" className="text-xs">5/5</Badge>
                        <span className="text-xs text-muted-foreground">({q.sectionWeight}% weight)</span>
                      </div>
                      <p className="text-xs mt-0.5">{q.question.split(':')[0]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No perfect scores - opportunities for improvement across all areas</p>
            )}
          </Card>

          <Card className="p-4 bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-destructive" />
              <h4 className="font-semibold text-sm">Critical Technical Gaps</h4>
              <span className="text-xs text-muted-foreground">(Impact-prioritized)</span>
            </div>
            {criticalGaps.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {criticalGaps.map(q => (
                  <li key={q.id} className="flex items-start gap-2">
                    <XCircle className="h-3 w-3 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-medium text-xs">{q.section}</span>
                        <Badge variant="destructive" className="text-xs">{q.score}/5</Badge>
                        <span className="text-xs text-muted-foreground">Impact: {q.impactScore.toFixed(0)}</span>
                      </div>
                      <p className="text-xs mt-0.5">{q.question.split(':')[0]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : risks.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {risks.map(q => (
                  <li key={q.id} className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-orange-600 dark:text-orange-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-medium text-xs">{q.section}</span>
                        <Badge variant="secondary" className="text-xs">3/5 - Risk</Badge>
                        <span className="text-xs text-muted-foreground">({q.sectionWeight}% weight)</span>
                      </div>
                      <p className="text-xs mt-0.5">{q.question.split(':')[0]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No critical gaps - strong technical foundation</p>
            )}
          </Card>
        </div>

        {/* Implementation Roadmap - Data-driven from question-level analysis */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4" />
            <h4 className="font-semibold">Implementation Roadmap</h4>
            <span className="text-xs text-muted-foreground">(Prioritized by impact: section weight × severity)</span>
          </div>
          <div className="space-y-2">
            {implementationRoadmap.map((item, index) => (
              <div key={index} className="flex items-start gap-3 text-sm p-3 bg-muted/50 rounded-lg">
                <Badge 
                  variant={
                    item.priority.includes('CRITICAL') ? 'destructive' : 
                    item.priority.includes('Ready') || item.priority.includes('Strength') ? 'default' :
                    'secondary'
                  }
                  className="text-xs whitespace-nowrap mt-0.5"
                >
                  {item.priority}
                </Badge>
                <p className="flex-1">{item.action}</p>
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
              {(critical.length > 0 || sectionRisks.length > 0) && (
                <span className="ml-2 text-muted-foreground">
                  (includes {critical.length * 8 + sectionRisks.length * 4 + opportunities.length * 2} weeks remediation)
                </span>
              )}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
