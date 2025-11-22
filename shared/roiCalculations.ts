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
 * Used by both ROICalculatorDialog (live calculations) and ROIDetailsDialog (historical view)
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
  
  // Calculate hourly cost (salary + overhead)
  const hourlyCost = annualWorkingHours > 0 
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
  
  const totalWeeklyHours = hoursPerWeekPerEmployee * peopleAndCost.employees;
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
