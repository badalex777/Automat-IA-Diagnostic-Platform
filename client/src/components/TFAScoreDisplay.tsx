import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TFAScoreDisplayProps {
  score: number;
  sections?: {
    name: string;
    score: number;
    weight: number;
  }[];
}

const getFeasibilityBand = (score: number) => {
  if (score >= 75) return { label: "High Feasibility", variant: "default" as const, color: "text-chart-2" };
  if (score >= 50) return { label: "Moderate Feasibility", variant: "secondary" as const, color: "text-chart-3" };
  return { label: "Low Feasibility", variant: "destructive" as const, color: "text-destructive" };
};

export default function TFAScoreDisplay({ score, sections }: TFAScoreDisplayProps) {
  const feasibility = getFeasibilityBand(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
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
            <h3 className="font-semibold text-lg mb-1">Technical Feasibility Score</h3>
            <Badge variant={feasibility.variant} data-testid="badge-feasibility">
              {feasibility.label}
            </Badge>
          </div>

          {sections && sections.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Section Breakdown:</p>
              {sections.map((section) => (
                <div key={section.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{section.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{section.score.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({section.weight}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
