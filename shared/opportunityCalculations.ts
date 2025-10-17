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
 * - FTE savings as % of total employees
 * - Hours saved as % of annual labor costs (converted to $)
 * 
 * REDISTRIBUTIVE FORMULA (weights change based on active toggles):
 * 
 * Base Case (both toggles OFF):
 * - Annual ROI: 40%
 * - FTE Savings: 30%
 * - Annual Hours Saved: 30%
 * Total: 100%
 * 
 * Error Toggle ON (revenue OFF):
 * - Annual ROI: 30%
 * - FTE Savings: 20%
 * - Annual Hours Saved: 20%
 * - Error Impact: 30%
 * Total: 100%
 * 
 * Revenue Toggle ON (error OFF):
 * - Annual ROI: 30%
 * - FTE Savings: 20%
 * - Annual Hours Saved: 20%
 * - Revenue Impact: 30%
 * Total: 100%
 * 
 * Both Toggles ON:
 * - Annual ROI: 25%
 * - FTE Savings: 15%
 * - Annual Hours Saved: 15%
 * - Error Impact: 25%
 * - Revenue Impact: 20%
 * Total: 100%
 */
export function calculateBusinessImpact(
  opportunity: ImplementationOpportunity,
  toggles: ToggleState,
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

  // Determine weights based on active toggles
  let roiWeight = 0.40;
  let fteWeight = 0.30;
  let hoursWeight = 0.30;
  let errorWeight = 0;
  let revenueWeight = 0;

  const errorActive = toggles.errorMetrics;
  const revenueActive = toggles.revenueMetrics;

  if (errorActive && revenueActive) {
    // Both toggles ON
    roiWeight = 0.25;
    fteWeight = 0.15;
    hoursWeight = 0.15;
    errorWeight = 0.25;
    revenueWeight = 0.20;
  } else if (errorActive) {
    // Only error toggle ON
    roiWeight = 0.30;
    fteWeight = 0.20;
    hoursWeight = 0.20;
    errorWeight = 0.30;
  } else if (revenueActive) {
    // Only revenue toggle ON
    roiWeight = 0.30;
    fteWeight = 0.20;
    hoursWeight = 0.20;
    revenueWeight = 0.30;
  }
  // else: base case with default weights (40/30/30)

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

  // Calculate total impact with redistributed weights
  const totalImpact = 
    (roiScore * roiWeight) +
    (fteScore * fteWeight) +
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
  companyContext?: CompanyContext
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
    companyContext
  );

  const quadrant = getQuadrant(implementationEffort, businessImpact);

  return {
    implementationEffort,
    businessImpact,
    quadrant
  };
}
