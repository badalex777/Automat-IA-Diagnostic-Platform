import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Target, TrendingUp } from "lucide-react";

interface SectionScore {
  name: string;
  score: number;
  weight: number;
}

interface TFAWeaknessAnalysisProps {
  sections: SectionScore[];
  weaknessThreshold?: number;
}

interface WeaknessDetail {
  rootCauses: string[];
  mitigations: string[];
  priority: 'Critical' | 'High' | 'Medium';
  estimatedEffort: string;
}

const getWeaknessDetails = (sectionName: string, score: number): WeaknessDetail => {
  const isCritical = score < 1.5;
  const isHigh = score >= 1.5 && score < 2.0;
  
  const weaknessMap: Record<string, Omit<WeaknessDetail, 'priority' | 'estimatedEffort'>> = {
    "System Environment": {
      rootCauses: [
        "Legacy on-premises infrastructure with limited cloud integration",
        "APIs unavailable or poorly documented",
        "Programmatic access restricted to manual UI interactions",
        "System performance issues with frequent timeouts or failures",
        "Insufficient monitoring and logging capabilities",
        "Inadequate backup and disaster recovery systems"
      ],
      mitigations: [
        "Evaluate cloud migration strategy or hybrid infrastructure approach",
        "Work with vendors to enable REST API access or consider RPA for UI automation",
        "Establish service accounts and API keys for programmatic access",
        "Implement performance monitoring and identify bottlenecks",
        "Deploy centralized logging and alerting infrastructure",
        "Establish automated backup procedures and test recovery protocols"
      ]
    },
    "Data Quality": {
      rootCauses: [
        "Unstructured or inconsistent data formats across systems",
        "High error rates with frequent missing or invalid fields",
        "Insufficient historical data for pattern recognition",
        "Data inconsistency across sources and time periods",
        "Weak or absent data validation rules"
      ],
      mitigations: [
        "Implement data standardization protocols and schema enforcement",
        "Create automated data validation and quality check pipelines",
        "Collect additional historical data over 3-6 months for baseline",
        "Establish single source of truth and data governance policies",
        "Deploy validation frameworks with multi-layer error detection",
        "Build data cleaning and normalization processes"
      ]
    },
    "Integration Feasibility": {
      rootCauses: [
        "Complex integration landscape with 6+ systems",
        "Incompatible systems lacking modern integration connectors",
        "Complex authentication requirements with frequent re-authorization",
        "Severe API rate limits restricting automation throughput",
        "Poor error handling with no retry or failover mechanisms",
        "Unstable APIs with frequent breaking changes"
      ],
      mitigations: [
        "Prioritize critical integrations and establish middleware layer",
        "Evaluate integration platforms (Zapier, MuleSoft, custom iPaaS)",
        "Work with IT security to streamline authentication protocols",
        "Implement request throttling, caching, and batch processing strategies",
        "Build robust error handling with circuit breakers and retry logic",
        "Engage with vendors for API stability guarantees and long-term support"
      ]
    },
    "Security/Compliance": {
      rootCauses: [
        "Highly sensitive regulated data requiring strict controls (HIPAA, PCI-DSS)",
        "Stringent compliance requirements with heavy audit obligations",
        "Long security approval cycles (6+ months for new tools)",
        "Complex data retention and archival requirements"
      ],
      mitigations: [
        "Engage compliance team early to define automation security requirements",
        "Select pre-approved vendors or SOC 2 certified platforms",
        "Implement data encryption, access controls, and audit logging from day one",
        "Accelerate approval by demonstrating compliance alignment and security posture",
        "Design retention policies into automation architecture with automated archival",
        "Consider starting with less sensitive workflows to build trust"
      ]
    }
  };

  const details = weaknessMap[sectionName] || {
    rootCauses: ["Insufficient data to determine specific issues"],
    mitigations: ["Conduct detailed assessment of this area"]
  };

  return {
    ...details,
    priority: isCritical ? 'Critical' : isHigh ? 'High' : 'Medium',
    estimatedEffort: isCritical ? '4-8 weeks' : isHigh ? '2-4 weeks' : '1-2 weeks'
  };
};

export default function TFAWeaknessAnalysis({ sections, weaknessThreshold = 2.5 }: TFAWeaknessAnalysisProps) {
  const weakSections = sections.filter(s => s.score < weaknessThreshold);
  
  if (weakSections.length === 0) {
    return null;
  }

  // Sort by score (lowest first) and weight (highest first)
  const prioritizedWeaknesses = weakSections.sort((a, b) => {
    if (a.score !== b.score) return a.score - b.score;
    return b.weight - a.weight;
  });

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-lg">Detailed Weakness Analysis</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {prioritizedWeaknesses.length} {prioritizedWeaknesses.length === 1 ? 'area' : 'areas'} scored below {weaknessThreshold} and require attention before automation. Priority is based on score severity and impact weight.
          </p>
        </div>

        <div className="space-y-4">
          {prioritizedWeaknesses.map((section) => {
            const details = getWeaknessDetails(section.name, section.score);
            const priorityColor = details.priority === 'Critical' ? 'destructive' : details.priority === 'High' ? 'destructive' : 'secondary';
            
            return (
              <Alert key={section.name} variant={details.priority === 'Critical' ? 'destructive' : 'default'} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <h4 className="font-semibold">{section.name}</h4>
                      <Badge variant={priorityColor} className="ml-2">
                        {details.priority} Priority
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Score: {section.score.toFixed(1)} | Weight: {section.weight}% | Effort: {details.estimatedEffort}
                      </span>
                    </div>
                  </div>
                </div>

                <AlertDescription className="space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-3.5 w-3.5 text-destructive" />
                      <p className="text-sm font-medium">Root Causes:</p>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-5">
                      {details.rootCauses.map((cause, idx) => (
                        <li key={idx} className="text-muted-foreground">{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-3.5 w-3.5 text-chart-2" />
                      <p className="text-sm font-medium">Recommended Mitigations:</p>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-5">
                      {details.mitigations.map((mitigation, idx) => (
                        <li key={idx} className="text-muted-foreground">{mitigation}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>

        <Alert>
          <AlertDescription className="text-sm">
            <p className="font-medium mb-2">Next Steps:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Address {prioritizedWeaknesses[0]?.name} first (highest priority weakness)</li>
              <li>Allocate {prioritizedWeaknesses.reduce((sum, w) => {
                const effort = getWeaknessDetails(w.name, w.score).estimatedEffort;
                const weeks = parseInt(effort.split('-')[1] || '2');
                return sum + weeks;
              }, 0)} weeks total for remediation efforts</li>
              <li>Re-assess feasibility after implementing mitigations</li>
              <li>Consider pilot automation in strong areas while addressing weaknesses</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}
