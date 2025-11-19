import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, X, Eye, AlertCircle } from 'lucide-react';
import ScenarioSelector from './ScenarioSelector';
import ResultsDashboard from './ResultsDashboard';
import { calculateAllScenarioResults } from '@shared/roiCalculations';
import { 
  ImplementationOpportunity, 
  ROICalculation, 
  ScenarioType,
  ProcessInfo,
  PeopleAndCost,
  TimeSavings,
  QualityImpact,
  RevenueUplift,
  CostsAndRampup
} from '@shared/schema';

interface ROIDetailsDialogProps {
  opportunityId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface AllData {
  processInfo: ProcessInfo;
  peopleAndCost: PeopleAndCost;
  timeSavings: TimeSavings;
  qualityImpact: QualityImpact;
  revenueUplift: RevenueUplift;
  costsAndRampup: CostsAndRampup;
}

export default function ROIDetailsDialog({
  opportunityId,
  isOpen,
  onClose,
}: ROIDetailsDialogProps) {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('base');

  const { data: opportunity, isLoading } = useQuery<ImplementationOpportunity>({
    queryKey: [`/api/opportunities/${opportunityId}`],
    enabled: isOpen && !!opportunityId,
  });

  if (!isOpen) return null;

  // Extract roiCalculationData from opportunity
  const roiData = opportunity?.roiCalculationData as ROICalculation | null;

  // Calculate results for all scenarios
  const allScenarioResults = roiData ? calculateAllScenarioResults(roiData) : null;
  const currentResults = allScenarioResults?.[selectedScenario] || null;

  // Create AllData object from roiCalculationData
  const allData: AllData | null = roiData ? {
    processInfo: roiData.processInfo,
    peopleAndCost: roiData.peopleAndCost,
    timeSavings: roiData.timeSavings,
    qualityImpact: roiData.qualityImpact,
    revenueUplift: roiData.revenueUplift,
    costsAndRampup: roiData.costsAndRampup,
  } : null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0" data-testid="dialog-roi-details">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl" data-testid="text-roi-details-title">
                <Eye className="h-5 w-5" />
                ROI Calculation Details
              </DialogTitle>
              <DialogDescription className="mt-1" data-testid="text-roi-details-description">
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

        <ScrollArea className="h-[calc(95vh-120px)]">
          <div className="p-6 space-y-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12" data-testid="loader-roi-details">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && !roiData && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No ROI Calculation Data</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  This opportunity was created without detailed ROI calculation data.
                </p>
              </div>
            )}

            {!isLoading && roiData && allData && currentResults && (
              <>
                {/* Scenario Selector */}
                <div className="space-y-4">
                  <ScenarioSelector
                    selectedScenario={selectedScenario}
                    onScenarioChange={setSelectedScenario}
                  />
                </div>

                {/* Results Dashboard */}
                <div className="space-y-4">
                  <ResultsDashboard
                    results={currentResults}
                    selectedScenario={selectedScenario}
                    allData={allData}
                  />
                </div>

                {/* Input Assumptions (Collapsible) */}
                <Accordion type="single" collapsible className="border rounded-lg">
                  <AccordionItem value="assumptions" className="border-none">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">View Input Assumptions</span>
                        <span className="text-sm text-muted-foreground">(Process info, cost data, module settings)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-6">
                      {/* Process Info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Process Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Process Name:</span>
                            <p className="font-medium">{roiData.processInfo.processName}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Business Unit:</span>
                            <p className="font-medium">{roiData.processInfo.businessUnit}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Data Source:</span>
                            <p className="font-medium">{roiData.processInfo.dataSource}</p>
                          </div>
                        </div>
                      </div>

                      {/* People & Cost */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">People & Cost Assumptions</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Employees:</span>
                            <p className="font-medium">{roiData.peopleAndCost.employees}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Hours/Week/Employee:</span>
                            <p className="font-medium">{roiData.peopleAndCost.hoursPerWeekPerEmployee}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Annual Working Hours:</span>
                            <p className="font-medium">{roiData.peopleAndCost.annualWorkingHours}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Average Salary:</span>
                            <p className="font-medium">{formatCurrency(roiData.peopleAndCost.averageAnnualSalary)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Overhead Multiplier:</span>
                            <p className="font-medium">{roiData.peopleAndCost.overheadMultiplier}x</p>
                          </div>
                        </div>
                      </div>

                      {/* Time Savings Module */}
                      {roiData.timeSavings.enabled && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Time Savings Module</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Percent Time Saved:</span>
                              <p className="font-medium">{formatPercent(roiData.timeSavings.percentTimeSaved)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quality Impact Module */}
                      {roiData.qualityImpact.enabled && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Quality Impact Module</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Current Error Rate:</span>
                              <p className="font-medium">{formatPercent(roiData.qualityImpact.currentErrorRate)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Post-AI Error Rate:</span>
                              <p className="font-medium">{formatPercent(roiData.qualityImpact.postAIErrorRate)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Transactions/Week:</span>
                              <p className="font-medium">{roiData.qualityImpact.transactionsPerWeek}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Rework Minutes/Error:</span>
                              <p className="font-medium">{roiData.qualityImpact.reworkMinutesPerError} min</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Financial Cost/Error:</span>
                              <p className="font-medium">{formatCurrency(roiData.qualityImpact.financialCostPerError)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Revenue Uplift Module */}
                      {roiData.revenueUplift.enabled && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Revenue Uplift Module</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Percent Reallocated:</span>
                              <p className="font-medium">{formatPercent(roiData.revenueUplift.percentReallocated)}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Revenue Value/Hour:</span>
                              <p className="font-medium">{formatCurrency(roiData.revenueUplift.revenueValuePerHour)}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Costs & Ramp-Up */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm">Costs & Ramp-Up</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Implementation Cost:</span>
                            <p className="font-medium">{formatCurrency(roiData.costsAndRampup.implementationCost)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Annual Software Cost:</span>
                            <p className="font-medium">{formatCurrency(roiData.costsAndRampup.annualSoftwareCost)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Change Mgmt Costs:</span>
                            <p className="font-medium">{formatCurrency(roiData.costsAndRampup.changeMgmtCosts)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Training Hours/Employee:</span>
                            <p className="font-medium">{roiData.costsAndRampup.trainingHoursPerEmployee} hrs</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ramp-Up Period:</span>
                            <p className="font-medium">{roiData.costsAndRampup.rampUpMonths} months</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Ramp-Up Efficiency:</span>
                            <p className="font-medium">{formatPercent(roiData.costsAndRampup.rampUpEfficiencyPercent)}</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
