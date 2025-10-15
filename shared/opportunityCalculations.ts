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
 * - Readiness Score (inverted): 50%
 * - Payback Period: 30%
 * - Training Hours: 20%
 */
export function calculateImplementationEffort(
  readinessScore: number, // 0-100 from Readiness Rubric
  paybackPeriodMonths: number | null | undefined,
  trainingHoursPerEmployee: number | null | undefined
): number {
  // Invert readiness: higher readiness = lower effort
  const readinessEffort = 100 - readinessScore;
  const paybackEffort = normalizePaybackPeriod(paybackPeriodMonths);
  const trainingEffort = normalizeTrainingHours(trainingHoursPerEmployee);

  const effort = 
    (readinessEffort * 0.5) +
    (paybackEffort * 0.3) +
    (trainingEffort * 0.2);

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

/**
 * Calculate Business Impact Score (X-axis)
 * Higher score = better business impact
 * 
 * Base formula (no toggles):
 * - Annual ROI: 40%
 * - FTE Savings: 30%
 * - Annual Hours Saved: 30%
 * 
 * With Error toggle:
 * - Annual ROI: 30%
 * - FTE Savings: 20%
 * - Annual Hours: 20%
 * - Error Impact: 30%
 * 
 * With Revenue toggle:
 * - Annual ROI: 30%
 * - FTE Savings: 20%
 * - Annual Hours: 15%
 * - Revenue Impact: 35%
 * 
 * With both toggles:
 * - Annual ROI: 25%
 * - FTE Savings: 15%
 * - Annual Hours: 15%
 * - Error Impact: 20%
 * - Revenue Impact: 25%
 */
export function calculateBusinessImpact(
  opportunity: ImplementationOpportunity,
  toggles: ToggleState,
  maxAnnualRoi: number = 1000000, // $1M reference
  maxFteSavings: number = 5, // 5 FTE reference
  maxAnnualHours: number = 10000, // 10k hours reference
  maxErrorsAvoided: number = 1000, // 1k errors reference
  maxRevenueUplift: number = 2000000 // $2M reference
): number {
  const annualRoi = parseFloat(opportunity.annualRoi || "0");
  const fteSavings = parseFloat(opportunity.fteSavings || "0");
  const annualHours = parseFloat(opportunity.annualHoursSaved || "0");
  
  // Normalize core metrics
  const roiScore = normalizeToScale(annualRoi, maxAnnualRoi);
  const fteScore = normalizeToScale(fteSavings, maxFteSavings);
  const hoursScore = normalizeToScale(annualHours, maxAnnualHours);

  // Calculate error impact if toggle is on AND has data
  let errorImpact = 0;
  let hasErrorData = false;
  if (toggles.errorMetrics) {
    const errorPct = parseFloat(opportunity.errorReductionPct || "0");
    const errorsAvoided = opportunity.errorsAvoidedAnnually || 0;
    if (errorPct > 0 || errorsAvoided > 0) {
      hasErrorData = true;
      const errorPctScore = errorPct; // Already 0-100
      const errorsScore = normalizeToScale(errorsAvoided, maxErrorsAvoided);
      errorImpact = (errorPctScore * 0.5) + (errorsScore * 0.5);
    }
  }

  // Calculate revenue impact if toggle is on AND has data
  let revenueImpact = 0;
  let hasRevenueData = false;
  if (toggles.revenueMetrics) {
    const hoursReallocated = parseFloat(opportunity.hoursReallocatedToRevenue || "0");
    const revenueUplift = parseFloat(opportunity.revenueUpliftAnnual || "0");
    if (hoursReallocated > 0 || revenueUplift > 0) {
      hasRevenueData = true;
      const hoursReallocatedScore = normalizeToScale(hoursReallocated, maxAnnualHours);
      const revenueScore = normalizeToScale(revenueUplift, maxRevenueUplift);
      revenueImpact = (hoursReallocatedScore * 0.4) + (revenueScore * 0.6);
    }
  }

  // Apply weights based on actual data presence
  let impact = 0;
  if (hasErrorData && hasRevenueData) {
    // Both toggles on with data
    impact = 
      (roiScore * 0.25) +
      (fteScore * 0.15) +
      (hoursScore * 0.15) +
      (errorImpact * 0.20) +
      (revenueImpact * 0.25);
  } else if (hasErrorData) {
    // Error toggle only with data
    impact = 
      (roiScore * 0.30) +
      (fteScore * 0.20) +
      (hoursScore * 0.20) +
      (errorImpact * 0.30);
  } else if (hasRevenueData) {
    // Revenue toggle only with data
    impact = 
      (roiScore * 0.30) +
      (fteScore * 0.20) +
      (hoursScore * 0.15) +
      (revenueImpact * 0.35);
  } else {
    // Base formula - no toggles or no data
    impact = 
      (roiScore * 0.40) +
      (fteScore * 0.30) +
      (hoursScore * 0.30);
  }

  return Math.round(impact * 100) / 100; // Round to 2 decimals
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
  maxValues?: {
    annualRoi?: number;
    fteSavings?: number;
    annualHours?: number;
    errorsAvoided?: number;
    revenueUplift?: number;
  }
): OpportunityScore {
  const implementationEffort = calculateImplementationEffort(
    readinessScore,
    parseFloat(opportunity.paybackPeriodMonths || "0"),
    parseFloat(opportunity.trainingHoursPerEmployee || "0")
  );

  const businessImpact = calculateBusinessImpact(
    opportunity,
    toggles,
    maxValues?.annualRoi,
    maxValues?.fteSavings,
    maxValues?.annualHours,
    maxValues?.errorsAvoided,
    maxValues?.revenueUplift
  );

  const quadrant = getQuadrant(implementationEffort, businessImpact);

  return {
    implementationEffort,
    businessImpact,
    quadrant
  };
}
