import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, AlertCircle, Pencil } from 'lucide-react';
import ProcessInfoForm from './ProcessInfoForm';
import PeopleAndCostForm from './PeopleAndCostForm';
import OptionalModulesForm from './OptionalModulesForm';
import CostsAndRampupForm from './CostsAndRampupForm';
import ScenarioSelector from './ScenarioSelector';
import ResultsDashboard from './ResultsDashboard';
import { generateROICalculatorState } from '@shared/pifToRoiMapping';
import { calculateROI, ROIResults } from '@shared/roiCalculations';
import { 
  ROICalculation, 
  ScenarioType, 
  scenarioMultipliers,
  InsertImplementationOpportunity,
  ImplementationOpportunity,
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
  editOpportunity?: ImplementationOpportunity | null;
  onUpdate?: (opportunityId: string, updates: InsertImplementationOpportunity & { roiCalculationData: ROICalculation }) => Promise<void>;
}

interface AllData {
  processInfo: ProcessInfo;
  peopleAndCost: PeopleAndCost;
  timeSavings: TimeSavings;
  qualityImpact: QualityImpact;
  revenueUplift: RevenueUplift;
  costsAndRampup: CostsAndRampup;
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
  editOpportunity,
  onUpdate,
}: ROICalculatorDialogProps) {
  const isEditMode = !!editOpportunity;
  
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

  // Auto-populate from PIF response when dialog opens (create mode)
  // Or load existing roiCalculationData when editing
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && editOpportunity.roiCalculationData) {
        // Edit mode: Load existing ROI calculation data
        setCalculatorState(editOpportunity.roiCalculationData as ROICalculation);
      } else if (pifResponse) {
        // Create mode: Generate fresh state from PIF data
        const initialState = generateROICalculatorState(stepName, workflowName, pifResponse);
        setCalculatorState(initialState);
      }
    } else {
      // Reset state when dialog closes (after delay to avoid race with save)
      const timeoutId = setTimeout(() => setCalculatorState(null), 300);
      return () => clearTimeout(timeoutId);
    }
  }, [pifResponse, stepName, workflowName, isOpen, isEditMode, editOpportunity]);

  // Calculate current results
  const results = calculatorState ? calculateROI(calculatorState, calculatorState.selectedScenario) : null;

  // Handle save (both create and update)
  const handleSave = async () => {
    if (!calculatorState || !results) return;

    setIsSaving(true);
    try {
      const opportunityData: InsertImplementationOpportunity & { roiCalculationData: ROICalculation } = {
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

      if (isEditMode && onUpdate && editOpportunity) {
        // Update existing opportunity
        await onUpdate(editOpportunity.id, opportunityData);
      } else {
        // Create new opportunity
        await onSave(opportunityData);
      }
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
          <DialogTitle className="text-2xl flex items-center gap-2">
            {isEditMode && <Pencil className="h-5 w-5" />}
            {isEditMode ? 'Edit Opportunity' : 'ROI Calculator'} - {stepName}
          </DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? 'Modify the ROI inputs and recalculate financial projections for this opportunity'
              : 'Calculate the financial impact and ROI for implementing AI automation in this workflow step'
            }
          </DialogDescription>
        </DialogHeader>

        {isPifLoading && !isEditMode ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !pifResponse && !isEditMode ? (
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
            <ScrollArea className="flex-1 px-6 max-h-[calc(90vh-180px)]">
              <div className="space-y-6 pb-6">
                {/* Step 1: Process Information */}
                <ProcessInfoForm
                  data={calculatorState.processInfo}
                  onChange={handleProcessInfoChange}
                  showFromPIFBadge={true}
                />

                {/* Step 2: People & Cost */}
                <PeopleAndCostForm
                  data={calculatorState.peopleAndCost}
                  onChange={handlePeopleAndCostChange}
                  showPartialPIFBadge={true}
                  showManualRequiredBadge={
                    calculatorState.peopleAndCost.averageAnnualSalary === 0 || 
                    calculatorState.peopleAndCost.annualWorkingHours === 0
                  }
                />

                {/* Steps 3-5: Optional Modules */}
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
                  showFromPIFBadge={true}
                />

                {/* Step 6: Costs & Rampup */}
                <CostsAndRampupForm
                  data={calculatorState.costsAndRampup}
                  onChange={handleCostsAndRampupChange}
                />

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
                    data-testid={isEditMode ? "button-update-opportunity" : "button-save-opportunity"}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditMode ? 'Update Opportunity' : 'Save Opportunity'}
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
