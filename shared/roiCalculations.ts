import { ROICalculation, ScenarioType, scenarioMultipliers } from './schema';
import { calculateMultiYearROI, MultiYearResults } from './multiYearCalculations';

export interface ROIResults {
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
  multiYear?: MultiYearResults;
}

/**
 * Calculate ROI results from calculator state and scenario
 * Uses specification formulas with proper capping and multiplier application
 */
export function calculateROI(
  state: ROICalculation,
  scenario: ScenarioType
): ROIResults | null {
  if (!state) return null;

  const { peopleAndCost, timeSavings, qualityImpact, revenueUplift, costsAndRampup } = state;
  const multipliers = scenarioMultipliers[scenario];

  // Calculate annual working hours per employee
  const annualWorkingHours = peopleAndCost.annualWorkingHours || 2080;
  
  // Step 1: Effective Hourly Rate (per spec)
  // effectiveHourlyRate = (averageAnnualSalary / annualWorkingHours) * overheadMultiplier
  const effectiveHourlyRate = annualWorkingHours > 0 
    ? (peopleAndCost.averageAnnualSalary / annualWorkingHours) * peopleAndCost.overheadMultiplier
    : 0;

  // Calculate total weekly hours
  // If process-based calculation is enabled, calculate from process data
  let hoursPerWeekPerEmployee = peopleAndCost.hoursPerWeekPerEmployee;
  if (peopleAndCost.useProcessBasedCalculation && 
      peopleAndCost.processesPerPeriod > 0 && 
      peopleAndCost.timePerProcessMinutes > 0) {
    const hoursPerProcess = peopleAndCost.timePerProcessMinutes / 60;
    const totalHoursPerPeriod = peopleAndCost.processesPerPeriod * hoursPerProcess;
    
    if (peopleAndCost.processFrequency === 'daily') {
      hoursPerWeekPerEmployee = totalHoursPerPeriod * 5; // 5 working days
    } else if (peopleAndCost.processFrequency === 'weekly') {
      hoursPerWeekPerEmployee = totalHoursPerPeriod;
    } else { // monthly
      hoursPerWeekPerEmployee = totalHoursPerPeriod / 4.33; // ~4.33 weeks per month
    }
  }
  
  // Step 2: Time Savings Benefits (per spec)
  // totalHoursPerWeek = employees * hoursPerWeekPerEmployee
  // adjustedTimeSavingsPercent = MIN(percentTimeSaved * scenario.timeSavingsMultiplier, 100)
  // hoursSavedWeekly = totalHoursPerWeek * (adjustedTimeSavingsPercent / 100)
  // timeSavingsAnnual = hoursSavedWeekly * 52 * effectiveHourlyRate
  const totalWeeklyHours = hoursPerWeekPerEmployee * peopleAndCost.employees;

  let timeSavingsAmount = 0;
  let hoursSavedAnnually = 0;
  let adjustedTimeSavingsPercent = 0;
  let hoursSavedWeekly = 0;

  if (timeSavings.enabled) {
    adjustedTimeSavingsPercent = Math.min(
      timeSavings.percentTimeSaved * multipliers.timeSavingsMultiplier, 
      100
    );
    hoursSavedWeekly = totalWeeklyHours * (adjustedTimeSavingsPercent / 100);
    hoursSavedAnnually = hoursSavedWeekly * 52;
    timeSavingsAmount = hoursSavedAnnually * effectiveHourlyRate;
  }

  const ftesSaved = annualWorkingHours > 0 ? hoursSavedAnnually / annualWorkingHours : 0;

  // Step 3: Quality Impact Benefits (per spec)
  // If calculationMethod = "manual":
  //   rawErrorReduction = currentErrorRate - postAIErrorRate
  //   errorRateReduction = MIN(rawErrorReduction * scenario.errorReductionMultiplier, currentErrorRate)
  //   calculatedPostAIErrorRate = currentErrorRate - errorRateReduction
  // errorsAvoidedAnnually = errorRateReduction * transactionsPerWeek * 52 / 100
  // qualitySavingsAnnual = errorsAvoidedAnnually * (reworkHours * effectiveHourlyRate + financialCostPerError)
  let qualitySavingsAmount = 0;
  let errorsAvoidedAnnually = 0;
  let errorRateReduction = 0;
  let adjustedPostAIErrorRate = qualityImpact.postAIErrorRate;

  if (qualityImpact.enabled) {
    if (qualityImpact.calculationMethod === 'rubric') {
      // Rubric method: adjustedQualityImprovement = MIN(percentQualityImprovement * multiplier, 100)
      const adjustedQualityImprovement = Math.min(
        qualityImpact.percentQualityImprovement * multipliers.errorReductionMultiplier,
        100
      );
      errorRateReduction = qualityImpact.currentErrorRate * (adjustedQualityImprovement / 100);
    } else {
      // Manual method: rawErrorReduction = currentErrorRate - postAIErrorRate
      const rawErrorReduction = qualityImpact.currentErrorRate - qualityImpact.postAIErrorRate;
      errorRateReduction = Math.min(
        rawErrorReduction * multipliers.errorReductionMultiplier,
        qualityImpact.currentErrorRate
      );
    }
    
    adjustedPostAIErrorRate = qualityImpact.currentErrorRate - errorRateReduction;
    
    // errorsAvoidedAnnually = errorRateReduction * transactionsPerWeek * 52 / 100
    errorsAvoidedAnnually = Math.round(
      errorRateReduction * qualityImpact.transactionsPerWeek * 52 / 100
    );

    // qualitySavingsAnnual = errorsAvoidedAnnually * (reworkHours * effectiveHourlyRate + financialCostPerError)
    const reworkHours = qualityImpact.reworkMinutesPerError / 60;
    qualitySavingsAmount = errorsAvoidedAnnually * (
      reworkHours * effectiveHourlyRate + qualityImpact.financialCostPerError
    );
  }

  // Step 4: Revenue Uplift Benefits (per spec)
  // adjustedReallocationPercent = MIN(percentReallocated * scenario.reallocationMultiplier, 100)
  // hoursReallocatedAnnually = hoursSavedWeekly * 52 * (adjustedReallocationPercent / 100)
  // revenueSavingsAnnual = hoursReallocatedAnnually * revenueValuePerHour
  // Note: revenueValuePerHour defaults to $85 if not set (spec default)
  let revenueSavingsAmount = 0;
  let hoursReallocatedAnnually = 0;
  let adjustedReallocationPercent = 0;

  if (revenueUplift.enabled && timeSavings.enabled) {
    adjustedReallocationPercent = Math.min(
      revenueUplift.percentReallocated * multipliers.reallocationMultiplier,
      100
    );
    hoursReallocatedAnnually = hoursSavedWeekly * 52 * (adjustedReallocationPercent / 100);
    
    // Per spec: revenueValuePerHour falls back to effectiveHourlyRate if not set
    const revenuePerHour = revenueUplift.revenueValuePerHour > 0 
      ? revenueUplift.revenueValuePerHour 
      : effectiveHourlyRate;
    
    revenueSavingsAmount = hoursReallocatedAnnually * revenuePerHour;
  }

  // Step 5: Total Benefits and Costs (per spec)
  // annualBenefits = timeSavingsAnnual + qualitySavingsAnnual + revenueSavingsAnnual
  // trainingCosts = employees * trainingHoursPerEmployee * effectiveHourlyRate
  // annualCosts = (implementationCost + annualSoftwareCost + trainingCosts + changeMgmtCosts) * scenario.costOverrunMultiplier
  const annualBenefits = timeSavingsAmount + qualitySavingsAmount + revenueSavingsAmount;

  const trainingCost = costsAndRampup.trainingHoursPerEmployee * peopleAndCost.employees * effectiveHourlyRate;
  
  // Per spec: costOverrunMultiplier applies to ALL costs including annualSoftwareCost
  const totalOneTimeCosts = (
    costsAndRampup.implementationCost + 
    trainingCost + 
    costsAndRampup.changeMgmtCosts
  ) * multipliers.costOverrunMultiplier;
  
  const annualRecurringCosts = costsAndRampup.annualSoftwareCost * multipliers.costOverrunMultiplier;

  // Multi-year calculations with spec-compliant formulas
  const multiYear = calculateMultiYearROI(
    annualBenefits,
    totalOneTimeCosts,
    annualRecurringCosts,
    costsAndRampup.rampUpMonths,
    costsAndRampup.rampUpEfficiencyPercent,
    multipliers.rampUpEfficiencyMultiplier
  );

  // ROI Metrics from multi-year calculations
  const year1NetBenefit = multiYear.year1NetBenefit;
  const year1ActualROI = multiYear.year1ActualROI;

  // Run-rate ROI (Steady-State) - per spec lines 114-118:
  // netBenefit = annualBenefits - annualCosts
  // runRateROI = (netBenefit / annualCosts) * 100
  // where annualCosts = Year 1 total costs (implementation + software + training + change mgmt) × costOverrun
  // Example: (($138,154 - $42,825) / $42,825) * 100 = 222.6%
  const annualCosts = totalOneTimeCosts + annualRecurringCosts;
  const netBenefit = annualBenefits - annualCosts;
  const runRateROI = annualCosts > 0 ? (netBenefit / annualCosts) * 100 : 0;

  // Overall ROI percentage (Year 1)
  const roiPercentage = year1ActualROI;

  // Calculate error reduction percent for display
  const adjustedErrorReductionPercent = qualityImpact.currentErrorRate > 0
    ? (errorRateReduction / qualityImpact.currentErrorRate) * 100
    : 0;

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
}

/**
 * Calculate ROI results for all scenarios
 * Used by ROIDetailsDialog to show comparison across scenarios
 */
export function calculateAllScenarioResults(state: ROICalculation): Record<ScenarioType, ROIResults | null> {
  return {
    best: calculateROI(state, 'best'),
    base: calculateROI(state, 'base'),
    conservative: calculateROI(state, 'conservative'),
    worst: calculateROI(state, 'worst'),
  };
}
