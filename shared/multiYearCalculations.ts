/**
 * Multi-Year ROI Projection Calculations
 * Calculates ROI projections across 1, 3, and 5 year periods with Year 1 ramp-up modeling
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
  // Base ramp-up factor calculation
  // Linear ramp: 1 month = 96% (11/12), 6 months = 75% (9/12), 12 months = 54% (6.5/12)
  const monthsAtFullCapacity = Math.max(0, 12 - (rampUpMonths / 2));
  let baseFactor = monthsAtFullCapacity / 12;
  
  // Apply efficiency modifier (100% = normal, 150% = 1.5x faster, 20% = 5x slower)
  const efficiencyMultiplier = rampUpEfficiencyPercent / 100;
  baseFactor = baseFactor * efficiencyMultiplier;
  
  // Apply scenario-specific multiplier
  baseFactor = baseFactor * scenarioRampUpMultiplier;
  
  // Clamp between 20% (worst case delayed rollout) and 100% (immediate full benefits)
  return Math.max(0.2, Math.min(1.0, baseFactor));
}

/**
 * Calculate payback period accounting for Year 1 ramp-up
 * @param implementationCost - One-time implementation cost
 * @param year1Benefits - Year 1 benefits (with ramp-up applied)
 * @param annualRunRateBenefits - Annual steady-state benefits (Years 2+)
 * @param annualRecurringCosts - Annual recurring costs (software, etc.)
 * @returns Payback period in months
 */
export function calculatePaybackPeriod(
  implementationCost: number,
  year1Benefits: number,
  annualRunRateBenefits: number,
  annualRecurringCosts: number
): number {
  const year1NetBenefit = year1Benefits - annualRecurringCosts;
  const annualRunRateNetBenefit = annualRunRateBenefits - annualRecurringCosts;
  
  // If Year 1 net benefit covers implementation cost
  if (year1NetBenefit >= implementationCost) {
    return (implementationCost / year1NetBenefit) * 12;
  }
  
  // Otherwise, Year 1 partially pays, then Year 2+ pays remainder
  const remainingAfterYear1 = implementationCost - year1NetBenefit;
  const monthsInYear2Plus = (remainingAfterYear1 / annualRunRateNetBenefit) * 12;
  
  return 12 + monthsInYear2Plus;
}

/**
 * Format payback period for display
 */
export function formatPaybackPeriod(months: number): string {
  if (months < 0) return 'Never';
  if (months < 1) return '< 1 month';
  if (months <= 12) return `${months.toFixed(1)} months`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = Math.round(months % 12);
  
  if (remainingMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years}y ${remainingMonths}m`;
}

/**
 * Calculate multi-year ROI projections with Year 1 ramp-up modeling
 */
export function calculateMultiYearROI(
  annualBenefits: number, // Steady-state annual benefits (100% capacity)
  implementationCost: number,
  annualRecurringCosts: number, // Annual software, subscription costs
  rampUpMonths: number,
  rampUpEfficiencyPercent: number = 100,
  scenarioRampUpMultiplier: number = 1.0
): MultiYearResults {
  // Calculate Year 1 ramp-up factor
  const year1RampFactor = calculateYear1RampFactor(
    rampUpMonths,
    rampUpEfficiencyPercent,
    scenarioRampUpMultiplier
  );
  
  // Year 1 calculations (with ramp-up applied)
  const year1Benefits = annualBenefits * year1RampFactor;
  const year1Costs = implementationCost + annualRecurringCosts;
  const year1NetBenefit = year1Benefits - year1Costs;
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
  
  // Calculate payback period
  const paybackMonths = calculatePaybackPeriod(
    implementationCost,
    year1Benefits,
    annualBenefits,
    annualRecurringCosts
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
