import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, Info, Calendar } from "lucide-react";
import { format } from "date-fns";

interface TFAScoreDisplayProps {
  score: number;
  sections?: {
    name: string;
    score: number;
    weight: number;
  }[];
  completedAt?: string | Date | null;
}

const getFeasibilityBand = (score: number) => {
  if (score >= 90) return { 
    label: "Very High Feasibility", 
    variant: "default" as const, 
    color: "text-chart-2",
    description: "Excellent automation candidate. All systems and processes are well-structured with minimal barriers. Proceed with implementation planning.",
    icon: CheckCircle2
  };
  if (score >= 80) return { 
    label: "High Feasibility", 
    variant: "default" as const, 
    color: "text-chart-2",
    description: "Strong automation potential. Most requirements are met with minor gaps. Address identified weaknesses before implementation.",
    icon: CheckCircle2
  };
  if (score >= 60) return { 
    label: "Moderate Feasibility", 
    variant: "secondary" as const, 
    color: "text-chart-3",
    description: "Feasible with preparation. Several areas need improvement before automation. Focus on strengthening weak sections first.",
    icon: Info
  };
  if (score >= 40) return { 
    label: "Low Feasibility", 
    variant: "destructive" as const, 
    color: "text-destructive",
    description: "Challenging automation case. Significant gaps exist in multiple areas. Consider manual process improvements before automation.",
    icon: AlertTriangle
  };
  return { 
    label: "Very Low Feasibility", 
    variant: "destructive" as const, 
    color: "text-destructive",
    description: "Not recommended for automation at this time. Fundamental process and data structure issues must be resolved first.",
    icon: AlertTriangle
  };
};

const WEAKNESS_THRESHOLD = 2.5; // Scores below 2.5 are considered weak

export default function TFAScoreDisplay({ score, sections, completedAt }: TFAScoreDisplayProps) {
  const feasibility = getFeasibilityBand(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const FeasibilityIcon = feasibility.icon;

  // Identify weak sections
  const weakSections = sections?.filter(s => s.score < WEAKNESS_THRESHOLD) || [];
  const hasWeaknesses = weakSections.length > 0;

  // Format submission date
  const formattedDate = completedAt 
    ? format(new Date(completedAt), 'MMM d, yyyy')
    : null;

  const getImprovementSuggestion = (sectionName: string) => {
    const suggestions: Record<string, string> = {
      "System Environment": "Upgrade infrastructure to cloud-based systems, enable API access, establish programmatic authentication, and implement monitoring and backup systems.",
      "Data Quality": "Standardize data formats, implement validation rules, collect historical data for training, and establish data governance policies.",
      "Integration Feasibility": "Simplify integration landscape, evaluate modern integration platforms, streamline authentication, implement robust error handling and retry logic.",
      "Security/Compliance": "Engage compliance team early, select pre-approved vendors, accelerate security approval cycles, and design retention policies into architecture."
    };
    return suggestions[sectionName] || "Review and strengthen this area before proceeding with automation.";
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold font-mono" data-testid="text-tfa-score">{score}</p>
                <p className="text-xs text-muted-foreground">/ 100</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-lg mb-2">Technical Feasibility Score</h3>
              <Badge variant={feasibility.variant} className="gap-1" data-testid="badge-feasibility">
                <FeasibilityIcon className="h-3 w-3" />
                {feasibility.label}
              </Badge>
              {formattedDate && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="text-tfa-submission-date">Submitted {formattedDate}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-3" data-testid="text-feasibility-description">
                {feasibility.description}
              </p>
            </div>

            {sections && sections.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-sm font-medium text-muted-foreground">Section Breakdown:</p>
                {sections.map((section) => {
                  const isWeak = section.score < WEAKNESS_THRESHOLD;
                  return (
                    <div 
                      key={section.name} 
                      className={`flex items-center justify-between text-sm p-2 rounded ${isWeak ? 'bg-destructive/10' : ''}`}
                      data-testid={isWeak ? `weak-section-${section.name.toLowerCase().replace(/\s+/g, '-')}` : undefined}
                    >
                      <span className={`flex items-center gap-2 ${isWeak ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
                        {section.name}
                        {isWeak && <AlertTriangle className="h-3 w-3" />}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono ${isWeak ? 'text-destructive font-semibold' : ''}`}>
                          {section.score.toFixed(1)}
                        </span>
                        <span className="text-xs text-muted-foreground">({section.weight}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      {hasWeaknesses && (
        <Alert variant="destructive" data-testid="alert-weaknesses">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-2">Identified Weaknesses</p>
            <p className="text-sm mb-3">The following areas scored below {WEAKNESS_THRESHOLD} and need improvement:</p>
            <ul className="space-y-2 text-sm">
              {weakSections.map((section) => (
                <li key={section.name} className="pl-4 border-l-2 border-destructive" data-testid={`weakness-${section.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <span className="font-medium">{section.name}:</span> {getImprovementSuggestion(section.name)}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
