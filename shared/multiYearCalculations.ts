/**
 * Multi-Year ROI Projection Calculations
 * Calculates ROI projections across 1, 3, and 5 year periods with Year 1 ramp-up modeling
 * 
 * Per specification formulas:
 * - baseRampFactor = (12 - rampUpMonths + (rampUpMonths / 2)) / 12
 * - scenarioAdjustedEfficiency = MAX(20, MIN(150, baseEfficiency * scenario.rampUpEfficiencyMultiplier))
 * - year1RampFactor = baseRampFactor * (scenarioAdjustedEfficiency / 100)
 */

export interface YearlyProjection {
  year: number;
  benefits: number;
  costs: number;
  netBenefit: number;
  cumulativeBenefits: number;
  cumulativeCosts: number;
  cumulativeNetBenefit: number;
  cumulativeROI: number;
}

export interface SingleYearResults {
  year1RampFactor: number;
  year1Benefits: number;
  year1Costs: number;
  year1NetBenefit: number;
  year1ActualROI: number;
}

export interface MultiYearResults extends SingleYearResults {
  paybackMonths: number;
  yearlyProjections: YearlyProjection[];
}

/**
 * Calculate ramp-up factor for Year 1 based on implementation period
 * 
 * Per spec formula:
 * Step 1: baseRampFactor = (12 - rampUpMonths + (rampUpMonths / 2)) / 12
 * Step 2: baseEfficiency = rampUpEfficiencyPercent (or 100 if not set)
 * Step 3: scenarioAdjustedEfficiency = MAX(20, MIN(150, baseEfficiency * scenario.rampUpEfficiencyMultiplier))
 * Step 4: year1RampFactor = baseRampFactor * (scenarioAdjustedEfficiency / 100)
 * 
 * @param rampUpMonths - Implementation ramp-up period (1-12 months)
 * @param rampUpEfficiencyPercent - Efficiency percentage (20-150%, default 100%)
 * @param scenarioRampUpMultiplier - Scenario-specific ramp-up multiplier
 * @returns Ramp-up factor (0-1) representing percentage of full benefits achieved in Year 1
 */
export function calculateYear1RampFactor(
  rampUpMonths: number,
  rampUpEfficiencyPercent: number = 100,
  scenarioRampUpMultiplier: number = 1.0
): number {
  // Step 1: Base ramp factor from months
  // Per spec: baseRampFactor = (12 - rampUpMonths + (rampUpMonths / 2)) / 12
  // This simplifies to: (12 - rampUpMonths/2) / 12
  const baseRampFactor = (12 - rampUpMonths + (rampUpMonths / 2)) / 12;
  
  // Step 2: Get efficiency percentage (default 100)
  const baseEfficiency = rampUpEfficiencyPercent || 100;
  
  // Step 3: Apply scenario multiplier, then cap between 20-150%
  const scenarioAdjustedEfficiency = Math.max(20, Math.min(150, 
    baseEfficiency * scenarioRampUpMultiplier
  ));
  
  // Step 4: Combine base factor with efficiency
  const year1RampFactor = baseRampFactor * (scenarioAdjustedEfficiency / 100);
  
  // Final capping - factor should be between 0 and 1
  return Math.max(0, Math.min(1.0, year1RampFactor));
}

/**
 * Calculate payback period using month-by-month tracking with scenario-adjusted ramp-up efficiency
 * 
 * Per validation spec, with scenario adjustment:
 * For each month 1-12:
 *   baseMonthEfficiency = (month <= rampUpMonths) ? 0.5 : 1.0
 *   scenarioAdjustedEfficiency = MAX(20, MIN(150, baseEfficiency * scenarioRampUpMultiplier)) / 100
 *   monthEfficiency = baseMonthEfficiency × scenarioAdjustedEfficiency
 *   monthlyBenefit = (annualBenefits / 12) × monthEfficiency
 *   cumulativeBenefits += monthlyBenefit
 *   if (cumulativeBenefits >= year1TotalCosts) → paybackMonth found
 * 
 * This ensures payback month-by-month cash flows match Year 1 ramped totals for consistency.
 * Years 2+ operate at full steady-state efficiency (no scenario adjustment).
 * 
 * @param year1Costs - Total Year 1 costs (one-time + recurring)
 * @param year1Benefits - Year 1 benefits (with ramp-up applied) - not used for payback
 * @param annualRunRateBenefits - Steady-state annual benefits (100% capacity)
 * @param annualRecurringCosts - Recurring costs for Years 2+ 
 * @param rampUpMonths - Number of months in ramp-up period (default 6)
 * @param rampUpEfficiencyPercent - Base efficiency percentage from rubric (20-150%, default 100%)
 * @param scenarioRampUpMultiplier - Scenario-specific ramp-up multiplier (e.g., 0.8 for conservative)
 * @returns Payback period in months
 */
export function calculatePaybackPeriod(
  year1Costs: number,
  year1Benefits: number, // NOT used - kept for backwards compatibility
  annualRunRateBenefits: number,
  annualRecurringCosts: number = 0,
  rampUpMonths: number = 6,
  rampUpEfficiencyPercent: number = 100,
  scenarioRampUpMultiplier: number = 1.0
): number {
  const monthlyRunRateBenefit = annualRunRateBenefits / 12;
  
  if (monthlyRunRateBenefit <= 0) {
    return 999; // Effectively never if no benefits
  }
  
  // Calculate scenario-adjusted efficiency factor (same formula as calculateYear1RampFactor)
  // This ensures payback cash flows match Year 1 ramped totals
  const baseEfficiency = rampUpEfficiencyPercent || 100;
  const scenarioAdjustedEfficiency = Math.max(20, Math.min(150, 
    baseEfficiency * scenarioRampUpMultiplier
  )) / 100; // Convert to 0-1 range
  
  // Month-by-month tracking with scenario-adjusted efficiency during Year 1
  let cumulativeBenefits = 0;
  
  // Check Year 1 (months 1-12) - apply scenario adjustment
  for (let month = 1; month <= 12; month++) {
    // Base efficiency: 50% during ramp-up, 100% after
    const baseMonthEfficiency = month <= rampUpMonths ? 0.5 : 1.0;
    // Apply scenario adjustment to Year 1
    const monthEfficiency = baseMonthEfficiency * scenarioAdjustedEfficiency;
    const monthlyBenefit = monthlyRunRateBenefit * monthEfficiency;
    cumulativeBenefits += monthlyBenefit;
    
    if (cumulativeBenefits >= year1Costs) {
      // Interpolate to find exact payback month
      const prevCumulative = cumulativeBenefits - monthlyBenefit;
      const remainingCost = year1Costs - prevCumulative;
      const fractionOfMonth = remainingCost / monthlyBenefit;
      return month - 1 + fractionOfMonth;
    }
  }
  
  // If not paid back in Year 1, continue into Years 2-5 at full steady-state efficiency
  // Years 2+ operate at 100% capacity with only recurring costs
  const monthlyNetBenefitYears2Plus = monthlyRunRateBenefit - (annualRecurringCosts / 12);
  
  if (monthlyNetBenefitYears2Plus <= 0) {
    return 999; // Never pays back if recurring costs exceed benefits
  }
  
  // Continue from month 13 - deficit carried from Year 1
  let cumulativeNetFromYear2 = cumulativeBenefits - year1Costs;
  
  for (let month = 13; month <= 60; month++) {
    cumulativeNetFromYear2 += monthlyNetBenefitYears2Plus;
    
    if (cumulativeNetFromYear2 >= 0) {
      // Found payback in Years 2-5
      const prevNet = cumulativeNetFromYear2 - monthlyNetBenefitYears2Plus;
      const remainingDeficit = Math.abs(prevNet);
      const fractionOfMonth = remainingDeficit / monthlyNetBenefitYears2Plus;
      return month - 1 + fractionOfMonth;
    }
  }
  
  // Cap at 60 months (5 years)
  return 60;
}

/**
 * Format payback period for display
 */
export function formatPaybackPeriod(months: number): string {
  if (months < 0 || months >= 999) return 'Never';
  if (months < 1) return '< 1 month';
  if (months <= 12) return `${Math.round(months)} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);
  
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years}y ${remainingMonths}m`;
}

/**
 * Calculate multi-year ROI projections with Year 1 ramp-up modeling
 * 
 * Cost Distribution (per spec):
 * - Year 1: Implementation + Annual Software + Training + Change Management
 * - Years 2-5: Annual Software only (recurring)
 */
export function calculateMultiYearROI(
  annualBenefits: number, // Steady-state annual benefits (100% capacity)
  implementationCost: number, // One-time costs (implementation + training + change mgmt, already multiplied)
  annualRecurringCosts: number, // Annual software/subscription costs (already multiplied by costOverrunMultiplier)
  rampUpMonths: number,
  rampUpEfficiencyPercent: number = 100,
  scenarioRampUpMultiplier: number = 1.0
): MultiYearResults {
  // Calculate Year 1 ramp-up factor using spec formula
  const year1RampFactor = calculateYear1RampFactor(
    rampUpMonths,
    rampUpEfficiencyPercent,
    scenarioRampUpMultiplier
  );
  
  // Year 1 calculations (with ramp-up applied)
  // Per spec: year1Benefits = annualBenefits * year1RampFactor
  const year1Benefits = annualBenefits * year1RampFactor;
  
  // Per spec: Year 1 costs = Implementation + Annual Software + Training + Change Management
  // (implementation cost already includes training and change mgmt multiplied)
  const year1Costs = implementationCost + annualRecurringCosts;
  
  // year1NetBenefit = year1Benefits - year1Costs
  const year1NetBenefit = year1Benefits - year1Costs;
  
  // year1ActualROI = ((year1Benefits - year1Costs) / year1Costs) * 100
  const year1ActualROI = year1Costs > 0 ? ((year1Benefits - year1Costs) / year1Costs) * 100 : 0;
  
  // Yearly projections
  const yearlyProjections: YearlyProjection[] = [];
  
  // Year 1
  yearlyProjections.push({
    year: 1,
    benefits: year1Benefits,
    costs: year1Costs,
    netBenefit: year1NetBenefit,
    cumulativeBenefits: year1Benefits,
    cumulativeCosts: year1Costs,
    cumulativeNetBenefit: year1NetBenefit,
    cumulativeROI: year1ActualROI,
  });
  
  // Years 2-5 (full capacity, only recurring costs)
  for (let year = 2; year <= 5; year++) {
    const benefits = annualBenefits;
    const costs = annualRecurringCosts;
    const netBenefit = benefits - costs;
    
    const prevProjection = yearlyProjections[yearlyProjections.length - 1];
    const cumulativeBenefits = prevProjection.cumulativeBenefits + benefits;
    const cumulativeCosts = prevProjection.cumulativeCosts + costs;
    const cumulativeNetBenefit = cumulativeBenefits - cumulativeCosts;
    const cumulativeROI = cumulativeCosts > 0 
      ? ((cumulativeBenefits - cumulativeCosts) / cumulativeCosts) * 100 
      : 0;
    
    yearlyProjections.push({
      year,
      benefits,
      costs,
      netBenefit,
      cumulativeBenefits,
      cumulativeCosts,
      cumulativeNetBenefit,
      cumulativeROI,
    });
  }
  
  // Calculate payback period using month-by-month tracking with scenario-adjusted ramp-up efficiency
  const paybackMonths = calculatePaybackPeriod(
    year1Costs,
    year1Benefits,
    annualBenefits,
    annualRecurringCosts,
    rampUpMonths,
    rampUpEfficiencyPercent,
    scenarioRampUpMultiplier
  );
  
  return {
    year1RampFactor,
    year1Benefits,
    year1Costs,
    year1NetBenefit,
    year1ActualROI,
    paybackMonths,
    yearlyProjections,
  };
}
