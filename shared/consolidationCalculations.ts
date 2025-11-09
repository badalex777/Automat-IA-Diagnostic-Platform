import type { ImplementationOpportunity } from "./schema";

export interface ConsolidatedMetrics {
  // Aggregated Financial Metrics
  totalAnnualRoi: number;
  totalImplementationCost: number;
  totalAnnualRunRateRoi: number;
  totalCumulativeNetBenefit3Year: number;
  totalCumulativeNetBenefit5Year: number;
  
  // Aggregated Efficiency Metrics
  totalHoursSavedPerWeek: number;
  totalAnnualHoursSaved: number;
  totalFteSavings: number;
  
  // Aggregated Impact Metrics
  totalErrorsAvoidedAnnually: number;
  totalHoursReallocatedToRevenue: number;
  totalRevenueUpliftAnnual: number;
  
  // Weighted Average Metrics (with coordination buffer)
  weightedAvgRampupPeriodMonths: number;
  weightedAvgPaybackPeriodMonths: number;
  weightedAvgTrainingHoursPerEmployee: number;
  
  // Constituent Info
  opportunityCount: number;
  stepCount: number;
  hasErrorMetrics: boolean;
  hasRevenueMetrics: boolean;
}

/**
 * Calculate aggregated metrics for a workflow consolidation
 * Applies 20% coordination buffer to rampup and payback periods
 * 
 * @param opportunities - Array of constituent step-level opportunities
 * @returns Consolidated metrics with coordination buffers applied
 */
export function calculateConsolidatedMetrics(
  opportunities: ImplementationOpportunity[]
): ConsolidatedMetrics {
  if (opportunities.length === 0) {
    return {
      totalAnnualRoi: 0,
      totalImplementationCost: 0,
      totalAnnualRunRateRoi: 0,
      totalCumulativeNetBenefit3Year: 0,
      totalCumulativeNetBenefit5Year: 0,
      totalHoursSavedPerWeek: 0,
      totalAnnualHoursSaved: 0,
      totalFteSavings: 0,
      totalErrorsAvoidedAnnually: 0,
      totalHoursReallocatedToRevenue: 0,
      totalRevenueUpliftAnnual: 0,
      weightedAvgRampupPeriodMonths: 0,
      weightedAvgPaybackPeriodMonths: 0,
      weightedAvgTrainingHoursPerEmployee: 0,
      opportunityCount: 0,
      stepCount: 0,
      hasErrorMetrics: false,
      hasRevenueMetrics: false,
    };
  }

  // Sum all additive metrics
  const totalAnnualRoi = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.annualRoi?.toString() || '0')), 0);
  
  const totalImplementationCost = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.implementationCost?.toString() || '0')), 0);
  
  const totalAnnualRunRateRoi = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.annualRunRateRoi?.toString() || '0')), 0);
  
  const totalCumulativeNetBenefit3Year = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.cumulativeNetBenefit3Year?.toString() || '0')), 0);
  
  const totalCumulativeNetBenefit5Year = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.cumulativeNetBenefit5Year?.toString() || '0')), 0);
  
  const totalHoursSavedPerWeek = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.hoursSavedPerWeek?.toString() || '0')), 0);
  
  const totalAnnualHoursSaved = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.annualHoursSaved?.toString() || '0')), 0);
  
  const totalFteSavings = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.fteSavings?.toString() || '0')), 0);
  
  const totalErrorsAvoidedAnnually = opportunities.reduce((sum, opp) => 
    sum + (opp.errorsAvoidedAnnually || 0), 0);
  
  const totalHoursReallocatedToRevenue = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.hoursReallocatedToRevenue?.toString() || '0')), 0);
  
  const totalRevenueUpliftAnnual = opportunities.reduce((sum, opp) => 
    sum + (parseFloat(opp.revenueUpliftAnnual?.toString() || '0')), 0);

  // Calculate weighted averages for time-based metrics
  // Weight by FTE savings (more FTE impact = more weight)
  let weightedRampupSum = 0;
  let weightedPaybackSum = 0;
  let weightedTrainingSum = 0;
  let totalWeight = 0;

  opportunities.forEach(opp => {
    const weight = parseFloat(opp.fteSavings?.toString() || '0');
    if (weight > 0) {
      const rampup = parseFloat(opp.rampupPeriodMonths?.toString() || '0');
      const payback = parseFloat(opp.paybackPeriodMonths?.toString() || '0');
      const training = parseFloat(opp.trainingHoursPerEmployee?.toString() || '0');
      
      weightedRampupSum += rampup * weight;
      weightedPaybackSum += payback * weight;
      weightedTrainingSum += training * weight;
      totalWeight += weight;
    }
  });

  // Calculate base weighted averages
  const baseWeightedRampup = totalWeight > 0 ? weightedRampupSum / totalWeight : 0;
  const baseWeightedPayback = totalWeight > 0 ? weightedPaybackSum / totalWeight : 0;
  const weightedAvgTrainingHoursPerEmployee = totalWeight > 0 ? weightedTrainingSum / totalWeight : 0;

  // Apply 20% coordination buffer for multi-step consolidations
  const coordinationBuffer = 1.20; // 20% overhead
  const weightedAvgRampupPeriodMonths = baseWeightedRampup * coordinationBuffer;
  const weightedAvgPaybackPeriodMonths = baseWeightedPayback * coordinationBuffer;

  // Count unique steps
  const uniqueStepIds = new Set(opportunities.map(opp => opp.stepId).filter(Boolean));
  const stepCount = uniqueStepIds.size;

  // Check if any opportunities have error or revenue metrics enabled
  const hasErrorMetrics = opportunities.some(opp => opp.errorMetricsEnabled);
  const hasRevenueMetrics = opportunities.some(opp => opp.revenueMetricsEnabled);

  // Add 15% integration overhead to implementation cost
  const integrationOverhead = 1.15; // 15% overhead
  const totalImplementationCostWithOverhead = totalImplementationCost * integrationOverhead;

  return {
    totalAnnualRoi,
    totalImplementationCost: totalImplementationCostWithOverhead,
    totalAnnualRunRateRoi,
    totalCumulativeNetBenefit3Year,
    totalCumulativeNetBenefit5Year,
    totalHoursSavedPerWeek,
    totalAnnualHoursSaved,
    totalFteSavings,
    totalErrorsAvoidedAnnually,
    totalHoursReallocatedToRevenue,
    totalRevenueUpliftAnnual,
    weightedAvgRampupPeriodMonths,
    weightedAvgPaybackPeriodMonths,
    weightedAvgTrainingHoursPerEmployee,
    opportunityCount: opportunities.length,
    stepCount,
    hasErrorMetrics,
    hasRevenueMetrics,
  };
}

/**
 * Get a summary description of a consolidation's constituent opportunities
 * 
 * @param opportunities - Array of constituent opportunities
 * @returns Human-readable summary string
 */
export function getConsolidationSummary(opportunities: ImplementationOpportunity[]): string {
  if (opportunities.length === 0) return "No opportunities included";
  
  const stepIds = new Set(opportunities.map(opp => opp.stepId).filter(Boolean));
  const stepCount = stepIds.size;
  
  if (opportunities.length === 1) {
    return "1 opportunity";
  }
  
  return `${opportunities.length} opportunities across ${stepCount} step${stepCount > 1 ? 's' : ''}`;
}
