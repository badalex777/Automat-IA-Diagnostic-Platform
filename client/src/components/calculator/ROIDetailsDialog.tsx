import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, X, Eye, TrendingUp, DollarSign, Clock, Zap } from 'lucide-react';
import { ImplementationOpportunity } from '@shared/schema';

interface ROIDetailsDialogProps {
  opportunityId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ROIDetailsDialog({
  opportunityId,
  isOpen,
  onClose,
}: ROIDetailsDialogProps) {
  const { data: opportunity, isLoading } = useQuery<ImplementationOpportunity>({
    queryKey: [`/api/opportunities/${opportunityId}`],
    enabled: isOpen && !!opportunityId,
  });

  if (!isOpen) return null;

  const formatCurrency = (amount: number | string | null) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0" data-testid="dialog-roi-details">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2" data-testid="text-roi-details-title">
                <Eye className="h-5 w-5" />
                ROI Calculation Details
              </DialogTitle>
              <DialogDescription data-testid="text-roi-details-description">
                {opportunity?.name || 'Loading...'}
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-roi-details"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12" data-testid="loader-roi-details">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && opportunity && (
              <>
                {/* ROI Metrics Grid */}
                <div className="grid grid-cols-2 gap-4" data-testid="section-roi-metrics">
                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Annual ROI (Year 1)</span>
                    </div>
                    <p className="text-2xl font-bold">{opportunity.annualRoi ? formatPercent(opportunity.annualRoi) : 'N/A'}</p>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">Run-Rate ROI (Year 2+)</span>
                    </div>
                    <p className="text-2xl font-bold">{opportunity.annualRunRateRoi ? formatPercent(opportunity.annualRunRateRoi) : 'N/A'}</p>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">Implementation Cost</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(opportunity.implementationCost)}</p>
                  </div>

                  <div className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Payback Period</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {opportunity.paybackPeriodMonths ? `${opportunity.paybackPeriodMonths.toFixed(1)} months` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Multi-Year Cumulative Benefits */}
                {(opportunity.cumulativeNetBenefit3Year || opportunity.cumulativeNetBenefit5Year) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Multi-Year Projections</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {opportunity.cumulativeNetBenefit3Year && (
                        <div className="p-4 border rounded-lg space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">3-Year Cumulative Net Benefit</div>
                          <p className="text-xl font-bold">{formatCurrency(opportunity.cumulativeNetBenefit3Year)}</p>
                        </div>
                      )}
                      {opportunity.cumulativeNetBenefit5Year && (
                        <div className="p-4 border rounded-lg space-y-2">
                          <div className="text-sm font-medium text-muted-foreground">5-Year Cumulative Net Benefit</div>
                          <p className="text-xl font-bold">{formatCurrency(opportunity.cumulativeNetBenefit5Year)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Time Savings */}
                {(opportunity.hoursSavedPerWeek || opportunity.fteSavings) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Time Savings
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      {opportunity.hoursSavedPerWeek && (
                        <div>
                          <div className="text-muted-foreground">Hours Saved per Week</div>
                          <p className="text-lg font-semibold">{opportunity.hoursSavedPerWeek.toFixed(1)}</p>
                        </div>
                      )}
                      {opportunity.annualHoursSaved && (
                        <div>
                          <div className="text-muted-foreground">Annual Hours Saved</div>
                          <p className="text-lg font-semibold">{opportunity.annualHoursSaved.toFixed(0)}</p>
                        </div>
                      )}
                      {opportunity.fteSavings && (
                        <div>
                          <div className="text-muted-foreground">FTE Savings</div>
                          <p className="text-lg font-semibold">{opportunity.fteSavings.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quality Impact */}
                {opportunity.errorMetricsEnabled && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quality Impact</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {opportunity.errorReductionPct && (
                        <div>
                          <div className="text-muted-foreground">Error Reduction</div>
                          <p className="text-lg font-semibold">{formatPercent(opportunity.errorReductionPct)}</p>
                        </div>
                      )}
                      {opportunity.errorsAvoidedAnnually && (
                        <div>
                          <div className="text-muted-foreground">Errors Avoided Annually</div>
                          <p className="text-lg font-semibold">{opportunity.errorsAvoidedAnnually.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Revenue Uplift */}
                {opportunity.revenueMetricsEnabled && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Revenue Uplift</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {opportunity.hoursReallocatedToRevenue && (
                        <div>
                          <div className="text-muted-foreground">Hours Reallocated to Revenue Activities</div>
                          <p className="text-lg font-semibold">{opportunity.hoursReallocatedToRevenue.toFixed(0)}</p>
                        </div>
                      )}
                      {opportunity.revenueUpliftAnnual && (
                        <div>
                          <div className="text-muted-foreground">Annual Revenue Uplift</div>
                          <p className="text-lg font-semibold">{formatCurrency(opportunity.revenueUpliftAnnual)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Implementation Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Implementation Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {opportunity.rampupPeriodMonths && (
                      <div>
                        <div className="text-muted-foreground">Ramp-Up Period</div>
                        <p className="text-lg font-semibold">{opportunity.rampupPeriodMonths} months</p>
                      </div>
                    )}
                    {opportunity.trainingHoursPerEmployee && (
                      <div>
                        <div className="text-muted-foreground">Training Hours per Employee</div>
                        <p className="text-lg font-semibold">{opportunity.trainingHoursPerEmployee}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {opportunity.description && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="text-sm">{opportunity.description}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
