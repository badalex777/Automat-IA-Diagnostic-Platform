import type { ImplementationOpportunity } from "./schema";

export interface OpportunityScore {
  implementationEffort: number; // 0-100, lower = easier
  businessImpact: number; // 0-100, higher = better
  quadrant: "Quick Wins" | "Strategic Goals" | "Nice-To-Haves" | "Deprioritize";
}

export interface ToggleState {
  errorMetrics: boolean;
  revenueMetrics: boolean;
}

/**
 * Normalize ramp-up period to 0-100 scale
 * 3 months or less = 0 (lowest effort)
 * 18+ months = 100 (highest effort)
 */
function normalizeRampupPeriod(months: number | null | undefined): number {
  if (!months || months <= 0) return 0;
  if (months <= 3) return 0;
  if (months >= 18) return 100;
  // Linear scale between 3 and 18 months
  return ((months - 3) / (18 - 3)) * 100;
}

/**
 * Normalize payback period to 0-100 scale
 * 6 months or less = 0 (lowest effort)
 * 36+ months = 100 (highest effort)
 */
function normalizePaybackPeriod(months: number | null | undefined): number {
  if (!months || months <= 0) return 0;
  if (months <= 6) return 0;
  if (months >= 36) return 100;
  // Linear scale between 6 and 36 months
  return ((months - 6) / (36 - 6)) * 100;
}

/**
 * Normalize training hours per employee to 0-100 scale
 * 2 hours or less = 0 (lowest effort)
 * 40+ hours = 100 (highest effort)
 */
function normalizeTrainingHours(hours: number | null | undefined): number {
  if (!hours || hours <= 0) return 0;
  if (hours <= 2) return 0;
  if (hours >= 40) return 100;
  // Linear scale between 2 and 40 hours
  return ((hours - 2) / (40 - 2)) * 100;
}

/**
 * Calculate Implementation Effort Score (Y-axis)
 * Lower score = easier implementation
 * 
 * Formula:
 * - Readiness Score (inverted): 40%
 * - Ramp-up Period: 25%
 * - Payback Period: 25%
 * - Training Hours: 10%
 */
export function calculateImplementationEffort(
  readinessScore: number, // 0-100 from Readiness Rubric
  rampupPeriodMonths: number | null | undefined,
  paybackPeriodMonths: number | null | undefined,
  trainingHoursPerEmployee: number | null | undefined
): number {
  // Invert readiness: higher readiness = lower effort
  const readinessEffort = 100 - readinessScore;
  const rampupEffort = normalizeRampupPeriod(rampupPeriodMonths);
  const paybackEffort = normalizePaybackPeriod(paybackPeriodMonths);
  const trainingEffort = normalizeTrainingHours(trainingHoursPerEmployee);

  const effort = 
    (readinessEffort * 0.40) +
    (rampupEffort * 0.25) +
    (paybackEffort * 0.25) +
    (trainingEffort * 0.10);

  return Math.round(effort * 100) / 100; // Round to 2 decimals
}

/**
 * Normalize a value to 0-100 scale based on max reference
 */
function normalizeToScale(value: number | null | undefined, maxReference: number): number {
  if (!value || value <= 0) return 0;
  if (maxReference <= 0) return 0;
  const normalized = (value / maxReference) * 100;
  return Math.min(normalized, 100);
}

export interface CompanyContext {
  annualRevenue?: number | string | null;
  totalEmployees?: number | string | null;
  annualLaborCosts?: number | string | null;
}

/**
 * Calculate actual hourly rate from employee salary and overhead
 * Matches ROI Calculator methodology: (Annual Salary × Overhead) ÷ 2,080 hours
 * 
 * @param employeeAnnualSalary - Yearly compensation for employees performing this work
 * @param overheadMultiplier - Cost multiplier (typically 1.2-1.5), defaults to 1.3
 * @returns Hourly rate in dollars, or 50 as fallback if salary not provided
 */
function calculateHourlyRate(
  employeeAnnualSalary?: number | string | null,
  overheadMultiplier?: number | string | null
): number {
  const salary = parseFloat(employeeAnnualSalary?.toString() || "0");
  const overhead = parseFloat(overheadMultiplier?.toString() || "1.3");
  
  if (salary <= 0) {
    // Fallback to $50/hour if no salary data provided
    return 50;
  }
  
  // ROI Calculator formula: (Annual Salary × Overhead) ÷ 2,080 annual hours
  const ANNUAL_WORKING_HOURS = 2080;
  return (salary * overhead) / ANNUAL_WORKING_HOURS;
}

/**
 * Calculate Business Impact Score (X-axis) - COMPANY-RELATIVE
 * Higher score = better business impact
 * 
 * Uses company financial context to calculate relative impact:
 * - ROI as % of annual revenue
 * - Hours saved as % of annual labor costs (converted to $ using actual hourly rate)
 * 
 * Note: FTE removed from scoring (it's just hours/40, redundant metric)
 * 
 * TWO CALCULATION MODES:
 * 
 * 1. ADDITIVE MODE (useAdditiveBonus=true, for "all-opportunities" view):
 *    - Base: ROI 60% + Hours 40% = 100%
 *    - Error bonus (if active): + Error 25% on top
 *    - Revenue bonus (if active): + Revenue 25% on top
 *    - Max possible: 150% (when both bonuses active)
 *    - Ensures toggling ON always increases score
 * 
 * 2. REDISTRIBUTIVE MODE (useAdditiveBonus=false, for filtered category views):
 *    Base Case (both toggles OFF):
 *    - Annual ROI: 60%
 *    - Annual Hours Saved: 40%
 *    Total: 100%
 * 
 *    Error Toggle ON (revenue OFF):
 *    - Annual ROI: 45%
 *    - Annual Hours Saved: 30%
 *    - Error Impact: 25%
 *    Total: 100%
 * 
 *    Revenue Toggle ON (error OFF):
 *    - Annual ROI: 45%
 *    - Annual Hours Saved: 30%
 *    - Revenue Impact: 25%
 *    Total: 100%
 * 
 *    Both Toggles ON:
 *    - Annual ROI: 40%
 *    - Annual Hours Saved: 25%
 *    - Error Impact: 20%
 *    - Revenue Impact: 15%
 *    Total: 100%
 */
export function calculateBusinessImpact(
  opportunity: ImplementationOpportunity,
  toggles: ToggleState,
  companyContext?: CompanyContext,
  useAdditiveBonus: boolean = false
): number {
  const annualRoi = parseFloat(opportunity.annualRoi || "0");
  const fteSavings = parseFloat(opportunity.fteSavings || "0");
  const annualHours = parseFloat(opportunity.annualHoursSaved || "0");
  
  // Parse company context
  const companyRevenue = parseFloat(companyContext?.annualRevenue?.toString() || "0");
  const companyEmployees = parseFloat(companyContext?.totalEmployees?.toString() || "0");
  const companyLaborCosts = parseFloat(companyContext?.annualLaborCosts?.toString() || "0");
  
  // Calculate company-relative metrics (0-100)
  // If no company context, fall back to absolute normalization
  let roiScore = 0;
  let fteScore = 0;
  let hoursScore = 0;
  
  if (companyRevenue > 0) {
    // ROI as % of annual revenue, capped at 100
    roiScore = Math.min((annualRoi / companyRevenue) * 100, 100);
  } else {
    // Fallback: normalize to $1M
    roiScore = normalizeToScale(annualRoi, 1000000);
  }
  
  if (companyEmployees > 0) {
    // FTE savings as % of total employees, capped at 100
    fteScore = Math.min((fteSavings / companyEmployees) * 100, 100);
  } else {
    // Fallback: normalize to 5 FTE
    fteScore = normalizeToScale(fteSavings, 5);
  }
  
  if (companyLaborCosts > 0) {
    // Convert hours to dollar value using actual hourly rate
    // Then calculate as % of annual labor costs
    const hourlyRate = calculateHourlyRate(opportunity.employeeAnnualSalary, opportunity.overheadMultiplier);
    const hoursDollarValue = annualHours * hourlyRate;
    hoursScore = Math.min((hoursDollarValue / companyLaborCosts) * 100, 100);
  } else {
    // Fallback: normalize to 10k hours
    hoursScore = normalizeToScale(annualHours, 10000);
  }

  // Determine weights based on active toggles and calculation mode
  let roiWeight = 0.60;
  let hoursWeight = 0.40;
  let errorWeight = 0;
  let revenueWeight = 0;

  const errorActive = toggles.errorMetrics;
  const revenueActive = toggles.revenueMetrics;

  if (useAdditiveBonus) {
    // ADDITIVE MODE: Base metrics stay at 100%, bonuses add on top
    roiWeight = 0.60;
    hoursWeight = 0.40;
    // Bonuses are added, not redistributed
    errorWeight = errorActive ? 0.25 : 0;
    revenueWeight = revenueActive ? 0.25 : 0;
  } else {
    // REDISTRIBUTIVE MODE: Weights sum to 100%
    if (errorActive && revenueActive) {
      // Both toggles ON
      roiWeight = 0.40;
      hoursWeight = 0.25;
      errorWeight = 0.20;
      revenueWeight = 0.15;
    } else if (errorActive) {
      // Only error toggle ON
      roiWeight = 0.45;
      hoursWeight = 0.30;
      errorWeight = 0.25;
    } else if (revenueActive) {
      // Only revenue toggle ON
      roiWeight = 0.45;
      hoursWeight = 0.30;
      revenueWeight = 0.25;
    }
    // else: base case with default weights (60/40)
  }

  // Calculate error impact if active
  let errorScore = 0;
  if (errorActive) {
    const errorPct = parseFloat(opportunity.errorReductionPct || "0");
    const errorsAvoided = opportunity.errorsAvoidedAnnually || 0;
    const errorPctScore = errorPct; // Already 0-100
    // Normalize errors avoided to 0-100 (1000 errors = 100)
    const errorsAvoidedScore = normalizeToScale(errorsAvoided, 1000);
    errorScore = (errorPctScore * 0.5) + (errorsAvoidedScore * 0.5);
  }

  // Calculate revenue impact if active
  let revenueScore = 0;
  if (revenueActive) {
    const hoursReallocated = parseFloat(opportunity.hoursReallocatedToRevenue || "0");
    const revenueUplift = parseFloat(opportunity.revenueUpliftAnnual || "0");
    
    // Use company-relative scoring
    let hoursReallocatedScore = 0;
    let revenueUpliftScore = 0;
    
    if (companyLaborCosts > 0) {
      const hourlyRate = calculateHourlyRate(opportunity.employeeAnnualSalary, opportunity.overheadMultiplier);
      const hoursDollarValue = hoursReallocated * hourlyRate;
      hoursReallocatedScore = Math.min((hoursDollarValue / companyLaborCosts) * 100, 100);
    } else {
      hoursReallocatedScore = normalizeToScale(hoursReallocated, 10000);
    }
    
    if (companyRevenue > 0) {
      revenueUpliftScore = Math.min((revenueUplift / companyRevenue) * 100, 100);
    } else {
      revenueUpliftScore = normalizeToScale(revenueUplift, 2000000);
    }
    
    revenueScore = (hoursReallocatedScore * 0.4) + (revenueUpliftScore * 0.6);
  }

  // Calculate total impact with redistributed weights (FTE removed)
  const totalImpact = 
    (roiScore * roiWeight) +
    (hoursScore * hoursWeight) +
    (errorScore * errorWeight) +
    (revenueScore * revenueWeight);

  return Math.round(totalImpact * 100) / 100; // Round to 2 decimals
}

/**
 * Determine which quadrant the opportunity falls into
 */
export function getQuadrant(implementationEffort: number, businessImpact: number): OpportunityScore["quadrant"] {
  // Midpoints at 50
  const isLowEffort = implementationEffort < 50;
  const isHighImpact = businessImpact >= 50;

  if (isLowEffort && isHighImpact) return "Quick Wins";
  if (!isLowEffort && isHighImpact) return "Strategic Goals";
  if (isLowEffort && !isHighImpact) return "Nice-To-Haves";
  return "Deprioritize";
}

/**
 * Calculate full opportunity score with quadrant
 */
export function calculateOpportunityScore(
  opportunity: ImplementationOpportunity,
  readinessScore: number,
  toggles: ToggleState,
  companyContext?: CompanyContext,
  useAdditiveBonus: boolean = false
): OpportunityScore {
  const implementationEffort = calculateImplementationEffort(
    readinessScore,
    parseFloat(opportunity.rampupPeriodMonths || "0"),
    parseFloat(opportunity.paybackPeriodMonths || "0"),
    parseFloat(opportunity.trainingHoursPerEmployee || "0")
  );

  const businessImpact = calculateBusinessImpact(
    opportunity,
    toggles,
    companyContext,
    useAdditiveBonus
  );

  const quadrant = getQuadrant(implementationEffort, businessImpact);

  return {
    implementationEffort,
    businessImpact,
    quadrant
  };
}

// Matrix Filter Types
export type MatrixFilterType = 
  | "time-only"           // No bonuses enabled
  | "time-error"          // Error enabled, revenue disabled
  | "time-revenue"        // Revenue enabled, error disabled
  | "all-three"           // Both error and revenue enabled
  | "all-opportunities";  // Show everything

/**
 * Filter opportunities by their toggle states (errorMetricsEnabled, revenueMetricsEnabled)
 * This controls which filter category an opportunity appears in based on active metrics
 * 
 * IMPORTANT: Only checks toggle state if opportunity actually HAS the metric data
 * This prevents opportunities without metrics from appearing in wrong filter views
 */
export function filterOpportunitiesByMetrics(
  opportunities: ImplementationOpportunity[],
  filterType: MatrixFilterType
): ImplementationOpportunity[] {
  switch (filterType) {
    case "time-only":
      // Only opportunities with both toggles disabled (or no metrics available)
      return opportunities.filter(
        opp => {
          const hasError = hasErrorMetrics(opp);
          const hasRevenue = hasRevenueMetrics(opp);
          const errorEnabled = hasError && opp.errorMetricsEnabled;
          const revenueEnabled = hasRevenue && opp.revenueMetricsEnabled;
          return !errorEnabled && !revenueEnabled;
        }
      );
    
    case "time-error":
      // Only opportunities with error enabled and revenue disabled
      return opportunities.filter(
        opp => {
          const hasError = hasErrorMetrics(opp);
          const hasRevenue = hasRevenueMetrics(opp);
          const errorEnabled = hasError && opp.errorMetricsEnabled;
          const revenueEnabled = hasRevenue && opp.revenueMetricsEnabled;
          return errorEnabled && !revenueEnabled;
        }
      );
    
    case "time-revenue":
      // Only opportunities with revenue enabled and error disabled
      return opportunities.filter(
        opp => {
          const hasError = hasErrorMetrics(opp);
          const hasRevenue = hasRevenueMetrics(opp);
          const errorEnabled = hasError && opp.errorMetricsEnabled;
          const revenueEnabled = hasRevenue && opp.revenueMetricsEnabled;
          return !errorEnabled && revenueEnabled;
        }
      );
    
    case "all-three":
      // Only opportunities with both toggles enabled
      return opportunities.filter(
        opp => {
          const hasError = hasErrorMetrics(opp);
          const hasRevenue = hasRevenueMetrics(opp);
          const errorEnabled = hasError && opp.errorMetricsEnabled;
          const revenueEnabled = hasRevenue && opp.revenueMetricsEnabled;
          return errorEnabled && revenueEnabled;
        }
      );
    
    case "all-opportunities":
      return opportunities; // Return all
    
    default:
      return opportunities;
  }
}

/**
 * Check if opportunity has error reduction metric data
 */
function hasErrorMetrics(opp: ImplementationOpportunity): boolean {
  const errorPct = parseFloat(opp.errorReductionPct || "0");
  return errorPct > 0;
}

/**
 * Check if opportunity has revenue uplift metric data
 */
function hasRevenueMetrics(opp: ImplementationOpportunity): boolean {
  const revenue = parseFloat(opp.revenueUpliftAnnual || "0");
  return revenue > 0;
}

/**
 * Recalculate Business Impact for a specific filter view
 * This redistributes weights to only the relevant metrics for fair comparison
 */
export function calculateBusinessImpactForFilter(
  opportunity: ImplementationOpportunity,
  filterType: MatrixFilterType,
  companyContext?: CompanyContext
): number {
  const annualRoi = parseFloat(opportunity.annualRoi || "0");
  const fteSavings = parseFloat(opportunity.fteSavings || "0");
  const annualHours = parseFloat(opportunity.annualHoursSaved || "0");
  
  // Parse company context
  const companyRevenue = parseFloat(companyContext?.annualRevenue?.toString() || "0");
  const companyEmployees = parseFloat(companyContext?.totalEmployees?.toString() || "0");
  const companyLaborCosts = parseFloat(companyContext?.annualLaborCosts?.toString() || "0");
  
  // Calculate company-relative metrics (0-100)
  let roiScore = 0;
  let fteScore = 0;
  let hoursScore = 0;
  
  if (companyRevenue > 0) {
    roiScore = Math.min((annualRoi / companyRevenue) * 100, 100);
  } else {
    roiScore = normalizeToScale(annualRoi, 1000000);
  }
  
  if (companyEmployees > 0) {
    fteScore = Math.min((fteSavings / companyEmployees) * 100, 100);
  } else {
    fteScore = normalizeToScale(fteSavings, 5);
  }
  
  if (companyLaborCosts > 0) {
    const hourlyRate = calculateHourlyRate(opportunity.employeeAnnualSalary, opportunity.overheadMultiplier);
    const hoursDollarValue = annualHours * hourlyRate;
    hoursScore = Math.min((hoursDollarValue / companyLaborCosts) * 100, 100);
  } else {
    hoursScore = normalizeToScale(annualHours, 10000);
  }

  // Calculate error impact
  let errorScore = 0;
  const errorPct = parseFloat(opportunity.errorReductionPct || "0");
  const errorsAvoided = opportunity.errorsAvoidedAnnually || 0;
  const errorPctScore = errorPct; // Already 0-100
  const errorsAvoidedScore = normalizeToScale(errorsAvoided, 1000);
  errorScore = (errorPctScore * 0.5) + (errorsAvoidedScore * 0.5);

  // Calculate revenue impact
  let revenueScore = 0;
  const hoursReallocated = parseFloat(opportunity.hoursReallocatedToRevenue || "0");
  const revenueUplift = parseFloat(opportunity.revenueUpliftAnnual || "0");
  
  let hoursReallocatedScore = 0;
  let revenueUpliftScore = 0;
  
  if (companyLaborCosts > 0) {
    const hourlyRate = calculateHourlyRate(opportunity.employeeAnnualSalary, opportunity.overheadMultiplier);
    const hoursDollarValue = hoursReallocated * hourlyRate;
    hoursReallocatedScore = Math.min((hoursDollarValue / companyLaborCosts) * 100, 100);
  } else {
    hoursReallocatedScore = normalizeToScale(hoursReallocated, 10000);
  }
  
  if (companyRevenue > 0) {
    revenueUpliftScore = Math.min((revenueUplift / companyRevenue) * 100, 100);
  } else {
    revenueUpliftScore = normalizeToScale(revenueUplift, 2000000);
  }
  
  revenueScore = (hoursReallocatedScore * 0.4) + (revenueUpliftScore * 0.6);

  // Redistribute weights based on filter type (FTE removed - it's just hours/40)
  let totalImpact = 0;

  switch (filterType) {
    case "time-only":
      // Only time savings metrics: ROI + Hours (FTE removed as redundant)
      totalImpact = 
        (roiScore * 0.60) +
        (hoursScore * 0.40);
      break;
    
    case "time-error":
      // Time + Error: keep time savings dominant (75% for ROI+Hours)
      totalImpact = 
        (roiScore * 0.45) +
        (hoursScore * 0.30) +
        (errorScore * 0.25);
      break;
    
    case "time-revenue":
      // Time + Revenue: keep time savings dominant (75% for ROI+Hours)
      totalImpact = 
        (roiScore * 0.45) +
        (hoursScore * 0.30) +
        (revenueScore * 0.25);
      break;
    
    case "all-three":
      // All metrics: time savings still dominant (65% for ROI+Hours)
      totalImpact = 
        (roiScore * 0.40) +
        (hoursScore * 0.25) +
        (errorScore * 0.20) +
        (revenueScore * 0.15);
      break;
    
    case "all-opportunities":
      // Use the opportunity's own toggle state with ADDITIVE bonuses
      // This ensures toggling metrics ON always increases business impact
      const toggles: ToggleState = {
        errorMetrics: opportunity.errorMetricsEnabled || false,
        revenueMetrics: opportunity.revenueMetricsEnabled || false
      };
      return calculateBusinessImpact(opportunity, toggles, companyContext, true);
    
    default:
      totalImpact = 0;
  }

  return Math.round(totalImpact * 100) / 100; // Round to 2 decimals
}
