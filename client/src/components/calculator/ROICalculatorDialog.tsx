import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import ProcessInfoForm from './ProcessInfoForm';
import PeopleAndCostForm from './PeopleAndCostForm';
import OptionalModulesForm from './OptionalModulesForm';
import CostsAndRampupForm from './CostsAndRampupForm';
import ScenarioSelector from './ScenarioSelector';
import ResultsDashboard from './ResultsDashboard';
import { generateROICalculatorState } from '@shared/pifToRoiMapping';
import { calculateMultiYearROI } from '@shared/multiYearCalculations';
import { 
  ROICalculation, 
  ScenarioType, 
  scenarioMultipliers,
  InsertImplementationOpportunity,
  PIFResponse,
  ProcessInfo,
  PeopleAndCost,
  TimeSavings,
  QualityImpact,
  RevenueUplift,
  CostsAndRampup
} from '@shared/schema';

interface ROICalculatorDialogProps {
  stepId: string;
  stepName: string;
  workflowId: string;
  workflowName: string;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (opportunity: InsertImplementationOpportunity & { roiCalculationData: ROICalculation }) => Promise<void>;
}

interface ROIResults {
  roiPercentage: number;
  runRateROI: number;
  year1ActualROI: number;
  year1RampFactor: number;
  year1Benefits: number;
  year1NetBenefit: number;
  paybackMonths: number;
  annualBenefits: number;
  annualCosts: number;
  netBenefit: number;
  hoursSavedWeekly: number;
  hoursSavedAnnually: number;
  ftesSaved: number;
  timeSavings: number;
  qualitySavings: number;
  revenueSavings: number;
  errorReductionPercent: number;
  errorsAvoidedAnnually: number;
  qualityImprovementPercent: number;
  currentErrorRate: number;
  postAIErrorRate: number;
  hoursReallocatedAnnually: number;
  revenueReallocationPercent: number;
  timeSavingsPercent: number;
  multiYear?: {
    year1RampFactor: number;
    year1Benefits: number;
    year1Costs: number;
    year1NetBenefit: number;
    year1ActualROI: number;
    paybackMonths: number;
    yearlyProjections: Array<{
      year: number;
      benefits: number;
      costs: number;
      netBenefit: number;
      cumulativeBenefits: number;
      cumulativeCosts: number;
      cumulativeNetBenefit: number;
      cumulativeROI: number;
    }>;
  };
}

export default function ROICalculatorDialog({
  stepId,
  stepName,
  workflowId,
  workflowName,
  companyId,
  isOpen,
  onClose,
  onSave,
}: ROICalculatorDialogProps) {
  // Fetch PIF responses for this workflow
  const { data: pifListData, isLoading: isPifLoading } = useQuery<{ responses: PIFResponse[] }>({
    queryKey: [`/api/workflows/${workflowId}/pif`],
    enabled: isOpen && !!workflowId,
  });
  
  // Filter to get this step's PIF response
  const pifResponse = pifListData?.responses.find(pif => pif.stepId === stepId);

  // Local state for ROI calculation (all 6 modules)
  const [calculatorState, setCalculatorState] = useState<ROICalculation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-populate from PIF response when dialog opens
  // Always regenerate fresh state from latest PIF data when dialog opens
  useEffect(() => {
    if (pifResponse && isOpen) {
      const initialState = generateROICalculatorState(stepName, workflowName, pifResponse);
      setCalculatorState(initialState);
    } else if (!isOpen) {
      // Reset state when dialog closes (after delay to avoid race with save)
      const timeoutId = setTimeout(() => setCalculatorState(null), 300);
      return () => clearTimeout(timeoutId);
    }
  }, [pifResponse, stepName, workflowName, isOpen]);

  // Calculate ROI results with scenario multipliers
  const calculateROI = (
    state: ROICalculation,
    scenario: ScenarioType
  ): ROIResults | null => {
    if (!state) return null;

    const { peopleAndCost, timeSavings, qualityImpact, revenueUplift, costsAndRampup } = state;
    const multipliers = scenarioMultipliers[scenario];

    // Calculate annual working hours per employee
    const annualWorkingHours = peopleAndCost.annualWorkingHours || 2080;
    
    // Calculate hourly cost (salary + overhead)
    const hourlyCost = annualWorkingHours > 0 
      ? (peopleAndCost.averageAnnualSalary / annualWorkingHours) * peopleAndCost.overheadMultiplier
      : 0;

    // Calculate total weekly hours
    const totalWeeklyHours = peopleAndCost.hoursPerWeekPerEmployee * peopleAndCost.employees;
    const annualHours = totalWeeklyHours * 52;

    // === TIME SAVINGS MODULE ===
    let timeSavingsAmount = 0;
    let hoursSavedAnnually = 0;
    let adjustedTimeSavingsPercent = 0;

    if (timeSavings.enabled) {
      adjustedTimeSavingsPercent = timeSavings.percentTimeSaved * multipliers.timeSavingsMultiplier;
      hoursSavedAnnually = (annualHours * adjustedTimeSavingsPercent) / 100;
      timeSavingsAmount = hoursSavedAnnually * hourlyCost;
    }

    const hoursSavedWeekly = hoursSavedAnnually / 52;
    const ftesSaved = annualWorkingHours > 0 ? hoursSavedAnnually / annualWorkingHours : 0;

    // === QUALITY IMPACT MODULE ===
    let qualitySavingsAmount = 0;
    let errorsAvoidedAnnually = 0;
    let adjustedErrorReductionPercent = 0;
    let adjustedPostAIErrorRate = qualityImpact.postAIErrorRate;

    if (qualityImpact.enabled) {
      const errorReductionPercent = 
        ((qualityImpact.currentErrorRate - qualityImpact.postAIErrorRate) / qualityImpact.currentErrorRate) * 100;
      
      adjustedErrorReductionPercent = errorReductionPercent * multipliers.errorReductionMultiplier;
      
      // Recalculate post-AI error rate with scenario adjustment
      const adjustedReductionFactor = adjustedErrorReductionPercent / 100;
      adjustedPostAIErrorRate = qualityImpact.currentErrorRate * (1 - adjustedReductionFactor);

      // Calculate transactions per year
      const transactionsPerYear = qualityImpact.transactionsPerWeek * 52;
      
      // Errors avoided
      const currentErrors = (transactionsPerYear * qualityImpact.currentErrorRate) / 100;
      const postAIErrors = (transactionsPerYear * adjustedPostAIErrorRate) / 100;
      errorsAvoidedAnnually = Math.round(currentErrors - postAIErrors);

      // Financial impact from avoided errors
      const reworkHoursSaved = errorsAvoidedAnnually * (qualityImpact.reworkMinutesPerError / 60);
      const reworkCostSaved = reworkHoursSaved * hourlyCost;
      const financialCostSaved = errorsAvoidedAnnually * qualityImpact.financialCostPerError;
      
      qualitySavingsAmount = reworkCostSaved + financialCostSaved;
    }

    // === REVENUE UPLIFT MODULE ===
    let revenueSavingsAmount = 0;
    let hoursReallocatedAnnually = 0;
    let adjustedReallocationPercent = 0;

    if (revenueUplift.enabled && timeSavings.enabled) {
      adjustedReallocationPercent = revenueUplift.percentReallocated * multipliers.reallocationMultiplier;
      hoursReallocatedAnnually = (hoursSavedAnnually * adjustedReallocationPercent) / 100;
      
      // Use revenue value per hour (calculated from salary + overhead)
      const revenuePerHour = revenueUplift.revenueValuePerHour > 0 
        ? revenueUplift.revenueValuePerHour 
        : hourlyCost;
      
      revenueSavingsAmount = hoursReallocatedAnnually * revenuePerHour;
    }

    // === TOTAL BENEFITS ===
    const annualBenefits = timeSavingsAmount + qualitySavingsAmount + revenueSavingsAmount;

    // === COSTS ===
    const trainingCost = costsAndRampup.trainingHoursPerEmployee * peopleAndCost.employees * hourlyCost;
    const implementationCost = 
      (costsAndRampup.implementationCost + trainingCost + costsAndRampup.changeMgmtCosts) * 
      multipliers.costOverrunMultiplier;
    
    const annualRecurringCosts = costsAndRampup.annualSoftwareCost;

    // === MULTI-YEAR CALCULATIONS ===
    const multiYear = calculateMultiYearROI(
      annualBenefits,
      implementationCost,
      annualRecurringCosts,
      costsAndRampup.rampUpMonths,
      costsAndRampup.rampUpEfficiencyPercent,
      multipliers.rampUpEfficiencyMultiplier
    );

    // === ROI METRICS ===
    const year1Costs = multiYear.year1Costs;
    const year1NetBenefit = multiYear.year1NetBenefit;
    const year1ActualROI = multiYear.year1ActualROI;

    // Run-rate ROI (steady state, Years 2+)
    const annualCosts = annualRecurringCosts;
    const netBenefit = annualBenefits - annualCosts;
    const runRateROI = annualCosts > 0 ? ((annualBenefits - annualCosts) / annualCosts) * 100 : 0;

    // Overall ROI percentage (Year 1)
    const roiPercentage = year1ActualROI;

    return {
      roiPercentage,
      runRateROI,
      year1ActualROI,
      year1RampFactor: multiYear.year1RampFactor,
      year1Benefits: multiYear.year1Benefits,
      year1NetBenefit,
      paybackMonths: multiYear.paybackMonths,
      annualBenefits,
      annualCosts,
      netBenefit,
      hoursSavedWeekly,
      hoursSavedAnnually,
      ftesSaved,
      timeSavings: timeSavingsAmount,
      qualitySavings: qualitySavingsAmount,
      revenueSavings: revenueSavingsAmount,
      errorReductionPercent: adjustedErrorReductionPercent,
      errorsAvoidedAnnually,
      qualityImprovementPercent: qualityImpact.percentQualityImprovement,
      currentErrorRate: qualityImpact.currentErrorRate,
      postAIErrorRate: adjustedPostAIErrorRate,
      hoursReallocatedAnnually,
      revenueReallocationPercent: adjustedReallocationPercent,
      timeSavingsPercent: adjustedTimeSavingsPercent,
      multiYear,
    };
  };

  // Calculate current results
  const results = calculatorState ? calculateROI(calculatorState, calculatorState.selectedScenario) : null;

  // Handle save
  const handleSave = async () => {
    if (!calculatorState || !results) return;

    setIsSaving(true);
    try {
      const opportunity: InsertImplementationOpportunity & { roiCalculationData: ROICalculation } = {
        workflowId,
        stepId,
        name: calculatorState.processInfo.processName,
        description: `${calculatorState.processInfo.businessUnit} - ${calculatorState.processInfo.dataSource}`,
        annualRoi: results.year1ActualROI,
        implementationCost: calculatorState.costsAndRampup.implementationCost,
        annualRunRateRoi: results.runRateROI,
        cumulativeNetBenefit3Year: results.multiYear?.yearlyProjections[2]?.cumulativeNetBenefit || 0,
        cumulativeNetBenefit5Year: results.multiYear?.yearlyProjections[4]?.cumulativeNetBenefit || 0,
        hoursSavedPerWeek: results.hoursSavedWeekly,
        annualHoursSaved: results.hoursSavedAnnually,
        fteSavings: results.ftesSaved,
        errorReductionPct: results.errorReductionPercent,
        errorsAvoidedAnnually: results.errorsAvoidedAnnually,
        hoursReallocatedToRevenue: results.hoursReallocatedAnnually,
        revenueUpliftAnnual: results.revenueSavings,
        rampupPeriodMonths: calculatorState.costsAndRampup.rampUpMonths,
        paybackPeriodMonths: results.paybackMonths,
        trainingHoursPerEmployee: calculatorState.costsAndRampup.trainingHoursPerEmployee,
        errorMetricsEnabled: calculatorState.qualityImpact.enabled,
        revenueMetricsEnabled: calculatorState.revenueUplift.enabled,
        roiCalculationData: calculatorState,
      };

      await onSave(opportunity);
      onClose();
    } catch (error) {
      console.error('Failed to save opportunity:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Update handlers for each module
  const handleProcessInfoChange = (data: ProcessInfo) => {
    if (!calculatorState) return;
    setCalculatorState({ ...calculatorState, processInfo: data });
  };

  const handlePeopleAndCostChange = (data: PeopleAndCost) => {
    if (!calculatorState) return;
    setCalculatorState({ ...calculatorState, peopleAndCost: data });
  };

  const handleTimeSavingsChange = (data: TimeSavings) => {
    if (!calculatorState) return;
    setCalculatorState({ ...calculatorState, timeSavings: data });
  };

  const handleQualityImpactChange = (data: QualityImpact) => {
    if (!calculatorState) return;
    setCalculatorState({ ...calculatorState, qualityImpact: data });
  };

  const handleRevenueUpliftChange = (data: RevenueUplift) => {
    if (!calculatorState) return;
    setCalculatorState({ ...calculatorState, revenueUplift: data });
  };

  const handleCostsAndRampupChange = (data: CostsAndRampup) => {
    if (!calculatorState) return;
    setCalculatorState({ ...calculatorState, costsAndRampup: data });
  };

  const handleScenarioChange = (scenario: ScenarioType) => {
    if (!calculatorState) return;
    setCalculatorState({ ...calculatorState, selectedScenario: scenario });
  };

  // Validation: Check if required manual fields are filled
  const canSave = calculatorState && 
    calculatorState.peopleAndCost.averageAnnualSalary > 0 &&
    calculatorState.peopleAndCost.annualWorkingHours >= 1500 &&
    calculatorState.processInfo.processName.length > 0 &&
    calculatorState.processInfo.dataSource.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl">ROI Calculator - {stepName}</DialogTitle>
          <DialogDescription>
            Calculate the financial impact and ROI for implementing AI automation in this workflow step
          </DialogDescription>
        </DialogHeader>

        {isPifLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !pifResponse ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <AlertCircle className="h-12 w-12" />
            <p>No PIF response found for this step. Please complete the PIF first.</p>
          </div>
        ) : !calculatorState ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                {/* Step 1: Process Information */}
                <div className="relative">
                  <ProcessInfoForm
                    data={calculatorState.processInfo}
                    onChange={handleProcessInfoChange}
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-4 right-4 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                  >
                    From PIF
                  </Badge>
                </div>

                {/* Step 2: People & Cost */}
                <div className="relative">
                  <PeopleAndCostForm
                    data={calculatorState.peopleAndCost}
                    onChange={handlePeopleAndCostChange}
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                    >
                      Partial PIF
                    </Badge>
                    {(calculatorState.peopleAndCost.averageAnnualSalary === 0 || 
                      calculatorState.peopleAndCost.annualWorkingHours === 0) && (
                      <Badge 
                        variant="secondary" 
                        className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                      >
                        Manual Required
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Steps 3-5: Optional Modules */}
                <div className="relative">
                  <OptionalModulesForm
                    timeSavings={calculatorState.timeSavings}
                    qualityImpact={calculatorState.qualityImpact}
                    revenueUplift={calculatorState.revenueUplift}
                    onTimeSavingsChange={handleTimeSavingsChange}
                    onQualityImpactChange={handleQualityImpactChange}
                    onRevenueUpliftChange={handleRevenueUpliftChange}
                    averageAnnualSalary={calculatorState.peopleAndCost.averageAnnualSalary}
                    annualWorkingHours={calculatorState.peopleAndCost.annualWorkingHours}
                    overheadMultiplier={calculatorState.peopleAndCost.overheadMultiplier}
                    employees={calculatorState.peopleAndCost.employees}
                    processesPerPeriod={calculatorState.peopleAndCost.processesPerPeriod}
                    processFrequency={calculatorState.peopleAndCost.processFrequency}
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-4 right-4 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                  >
                    From PIF
                  </Badge>
                </div>

                {/* Step 6: Costs & Rampup */}
                <div className="relative">
                  <CostsAndRampupForm
                    data={calculatorState.costsAndRampup}
                    onChange={handleCostsAndRampupChange}
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute top-4 right-4 bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20"
                  >
                    Manual Required
                  </Badge>
                </div>

                {/* Scenario Selector */}
                <ScenarioSelector
                  selectedScenario={calculatorState.selectedScenario}
                  onScenarioChange={handleScenarioChange}
                />

                {/* Results Dashboard */}
                {results && (
                  <ResultsDashboard
                    results={results}
                    selectedScenario={calculatorState.selectedScenario}
                    allData={calculatorState}
                  />
                )}
              </div>
            </ScrollArea>

            {/* Footer with Save Button */}
            <div className="px-6 py-4 border-t bg-background">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {!canSave && (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Please fill in all required fields to save
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSaving}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!canSave || isSaving}
                    data-testid="button-save-opportunity"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Opportunity
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
