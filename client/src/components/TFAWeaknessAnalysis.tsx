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
    "Data Structure": {
      rootCauses: [
        "Inconsistent data formats across systems",
        "High degree of manual data entry",
        "Lack of standardized data fields",
        "Poor data quality and validation"
      ],
      mitigations: [
        "Implement data standardization protocols and master data management",
        "Create data validation rules and automated quality checks",
        "Establish data governance policies with clear ownership",
        "Build data cleaning and normalization pipelines",
        "Consider API integration to eliminate manual entry"
      ]
    },
    "Process Definition": {
      rootCauses: [
        "Undocumented or poorly documented workflows",
        "Process variations across teams or individuals",
        "Unclear decision criteria and business rules",
        "Lack of process ownership"
      ],
      mitigations: [
        "Conduct process mining and documentation workshops",
        "Create standardized SOPs (Standard Operating Procedures)",
        "Map decision trees and business logic flows",
        "Implement process governance with assigned owners",
        "Use BPMN or flowcharts to visualize workflows"
      ]
    },
    "Volume & Frequency": {
      rootCauses: [
        "Irregular or unpredictable processing schedules",
        "Low transaction volumes not justifying automation ROI",
        "Seasonal or sporadic activity patterns",
        "Unclear processing triggers"
      ],
      mitigations: [
        "Analyze historical patterns to identify optimal automation windows",
        "Batch low-volume tasks to improve automation efficiency",
        "Set up event-driven triggers for irregular processes",
        "Consider hybrid automation for variable workloads",
        "Document volume trends for 6-12 months before automating"
      ]
    },
    "Exception Handling": {
      rootCauses: [
        "High exception rates with manual intervention required",
        "Undefined escalation procedures",
        "Complex edge cases without clear resolution paths",
        "Lack of exception logging and tracking"
      ],
      mitigations: [
        "Categorize exceptions by type and frequency",
        "Create decision matrices for common exception scenarios",
        "Design fallback procedures and escalation workflows",
        "Implement exception logging and analytics dashboard",
        "Start with straight-through processing, add exception handling iteratively"
      ]
    },
    "System Access": {
      rootCauses: [
        "Legacy systems without API capabilities",
        "Security restrictions limiting integration",
        "Lack of technical documentation",
        "Complex authentication requirements"
      ],
      mitigations: [
        "Evaluate RPA tools for systems without APIs",
        "Work with IT security to establish integration protocols",
        "Document existing system interfaces and limitations",
        "Consider middleware or integration platforms (iPaaS)",
        "Prioritize vendor discussions for API access"
      ]
    },
    "Stakeholder Buy-in": {
      rootCauses: [
        "Fear of job displacement among staff",
        "Previous failed automation attempts",
        "Lack of understanding of automation benefits",
        "Insufficient leadership support"
      ],
      mitigations: [
        "Run stakeholder education sessions on automation value",
        "Start with pilot projects to demonstrate quick wins",
        "Position automation as augmentation, not replacement",
        "Establish change management program with clear communication",
        "Involve end users in solution design process"
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
