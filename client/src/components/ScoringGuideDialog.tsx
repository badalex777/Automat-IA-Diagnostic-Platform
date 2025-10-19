import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateScoringGuide, type ScoringGuideTable } from "@shared/opportunityCalculations";
import { Info } from "lucide-react";

interface ScoringGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyRevenue: number;
  companyEmployees: number;
  companyName: string;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function getFilterExplanation(filterType: string): string | null {
  switch (filterType) {
    case "time-error":
      return "When error reduction metrics are enabled, the scoring weights are redistributed to account for quality improvements. The business impact is calculated as: (ROI Score × 45%) + (Hours Score × 30%) + (Error Score × 25%). This means error reduction contributes 25% to the total score, while time savings (ROI + Hours) still dominates at 75%.";
    case "time-revenue":
      return "When revenue uplift metrics are enabled, the scoring weights are redistributed to account for growth opportunities. The business impact is calculated as: (ROI Score × 45%) + (Hours Score × 30%) + (Revenue Score × 25%). This means revenue uplift contributes 25% to the total score, while time savings (ROI + Hours) still dominates at 75%.";
    case "all-three":
      return "When both error reduction and revenue uplift metrics are enabled, all four components contribute to the score. The business impact is calculated as: (ROI Score × 40%) + (Hours Score × 25%) + (Error Score × 20%) + (Revenue Score × 15%). Time savings remains the largest factor at 65% combined, with quality and growth adding 35%.";
    default:
      return null;
  }
}

function ScoringGuideTable({ guide }: { guide: ScoringGuideTable }) {
  const explanation = getFilterExplanation(guide.filterType);
  
  return (
    <div className="space-y-3">
      {explanation && (
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <Info className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
      
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
        <Info className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-1">Scoring Weights</p>
          <div className="space-y-0.5">
            <p>ROI: {(guide.roiWeight * 100).toFixed(0)}%</p>
            <p>Hours Saved (FTE): {(guide.hoursWeight * 100).toFixed(0)}%</p>
            {guide.errorWeight && <p>Error Reduction: {(guide.errorWeight * 100).toFixed(0)}%</p>}
            {guide.revenueWeight && <p>Revenue Uplift: {(guide.revenueWeight * 100).toFixed(0)}%</p>}
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Score</TableHead>
              <TableHead>ROI Required</TableHead>
              <TableHead>FTE Saved</TableHead>
              <TableHead>Impact Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guide.entries.map((entry) => (
              <TableRow key={entry.targetScore} data-testid={`row-score-${entry.targetScore}`}>
                <TableCell className="font-semibold">{entry.targetScore}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{formatCurrency(entry.requiredRoi)}</span>
                    <span className="text-xs text-muted-foreground">{entry.requiredRoiPct.toFixed(1)}% of revenue</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{entry.requiredFte.toFixed(1)} FTE</span>
                    <span className="text-xs text-muted-foreground">{entry.requiredFtePct.toFixed(1)}% of workforce</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function ScoringGuideDialog({
  open,
  onOpenChange,
  companyRevenue,
  companyEmployees,
  companyName,
}: ScoringGuideDialogProps) {
  const guides = calculateScoringGuide(companyRevenue, companyEmployees);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-scoring-guide">
        <DialogHeader>
          <DialogTitle>Business Impact Scoring Guide</DialogTitle>
          <DialogDescription>
            Understand what ROI and FTE savings produce different business impact scores for {companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold mb-2">Company Context</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Annual Revenue:</span>
                <span className="ml-2 font-medium">{formatCurrency(companyRevenue)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Employees:</span>
                <span className="ml-2 font-medium">{companyEmployees}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Scores shown assume balanced contributions from ROI and FTE savings. 
              Opportunities can achieve these scores through different combinations.
            </p>
          </div>

          <Tabs defaultValue="time-only" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="time-only" data-testid="tab-time-only">Time Only</TabsTrigger>
              <TabsTrigger value="time-error" data-testid="tab-time-error">Time + Error</TabsTrigger>
              <TabsTrigger value="time-revenue" data-testid="tab-time-revenue">Time + Revenue</TabsTrigger>
              <TabsTrigger value="all-three" data-testid="tab-all-three">All 3 Metrics</TabsTrigger>
            </TabsList>
            
            {guides.map((guide) => (
              <TabsContent 
                key={guide.filterType} 
                value={guide.filterType}
                className="mt-4"
              >
                <ScoringGuideTable guide={guide} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
