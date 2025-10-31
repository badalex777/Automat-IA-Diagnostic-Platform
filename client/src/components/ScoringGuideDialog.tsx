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
      return "Additive Bonus Model: Starts with the base impact (ROI × 60% + Hours × 40% = 100 max) and adds an error reduction bonus worth up to 25 points. Total formula: Base Impact (0-100) + Error Bonus (0-25) = Enhanced Impact (0-125). This ensures opportunities with error metrics always score higher than base-only, never lower.";
    case "time-revenue":
      return "Additive Bonus Model: Starts with the base impact (ROI × 60% + Hours × 40% = 100 max) and adds a revenue uplift bonus worth up to 25 points. Total formula: Base Impact (0-100) + Revenue Bonus (0-25) = Enhanced Impact (0-125). This ensures opportunities with revenue metrics always score higher than base-only, never lower.";
    case "all-three":
      return "Additive Bonus Model: Starts with the base impact (ROI × 60% + Hours × 40% = 100 max) and adds both error reduction (up to 25 points) and revenue uplift (up to 25 points) bonuses. Total formula: Base Impact (0-100) + Error Bonus (0-25) + Revenue Bonus (0-25) = Enhanced Impact (0-150). This rewards opportunities that deliver across all three value dimensions.";
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
          <DialogTitle>Opportunity Scoring Guide</DialogTitle>
          <DialogDescription>
            Understanding how business impact is calculated based on company context
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-semibold mb-3 text-primary">Dual-Matrix Scoring System</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-foreground">Base Impact Matrix:</span>
                <span className="ml-2 text-muted-foreground">Fair apples-to-apples comparison using only ROI (60%) + Time Savings (40%). Fixed 0-100 scale for consistent opportunity comparison.</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Enhanced Impact Matrix:</span>
                <span className="ml-2 text-muted-foreground">Starts with base impact, then adds bonuses for error reduction (+25%) and revenue uplift (+25%). Dynamic scale adjusts (0-100, 0-125, or 0-150) based on enabled metrics.</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                The additive bonus model ensures Enhanced Impact is always greater than or equal to Base Impact—bonuses can only increase scores, never decrease them.
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border">
            <h3 className="font-semibold mb-2">Company-Specific Scoring</h3>
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
              Filter Explanation
            </p>
          </div>

          <Tabs defaultValue="time-only" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="time-only" data-testid="tab-time-only">Time Savings Only</TabsTrigger>
              <TabsTrigger value="time-error" data-testid="tab-time-error">Time + Error Reduction</TabsTrigger>
              <TabsTrigger value="time-revenue" data-testid="tab-time-revenue">Time + Revenue Uplift</TabsTrigger>
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
