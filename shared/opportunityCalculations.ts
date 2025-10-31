import type { ImplementationOpportunity } from "./schema";

export interface OpportunityScore {
  implementationEffort: number; // 0-100, lower = easier
  businessImpact: number; // 0-100 or higher for enhanced views
  baseImpact: number; // Always 0-100 for fair comparison
  quadrant: "Quick Wins" | "Strategic Goals" | "Nice-To-Haves" | "Deprioritize";
}

export interface ToggleState {
  errorMetrics: boolean;
  revenueMetrics: boolean;
}

/**
 * Normalize ramp-up period to 0-100 scale
 * 2 months or less = 0 (lowest effort)
 * 12+ months = 100 (highest effort)
 */
function normalizeRampupPeriod(months: number | null | undefined): number {
  if (!months || months <= 0) return 0;
  if (months <= 2) return 0;
  if (months >= 12) return 100;
  // Linear scale between 2 and 12 months
  return ((months - 2) / (12 - 2)) * 100;
}

/**
 * Normalize payback period to 0-100 scale
 * 3 months or less = 0 (lowest effort)
 * 18+ months = 100 (highest effort)
 */
function normalizePaybackPeriod(months: number | null | undefined): number {
  if (!months || months <= 0) return 0;
  if (months <= 3) return 0;
  if (months >= 18) return 100;
  // Linear scale between 3 and 18 months
  return ((months - 3) / (18 - 3)) * 100;
}

/**
 * Normalize training hours per employee to 0-100 scale
 * 1 hour or less = 0 (lowest effort)
 * 20+ hours = 100 (highest effort)
 */
function normalizeTrainingHours(hours: number | null | undefined): number {
  if (!hours || hours <= 0) return 0;
  if (hours <= 1) return 0;
  if (hours >= 20) return 100;
  // Linear scale between 1 and 20 hours
  return ((hours - 1) / (20 - 1)) * 100;
}

/**
 * Calculate Implementation Effort Score (Y-axis)
 * Lower score = easier implementation
 * 
 * Formula:
 * - Readiness Score (inverted): 50% - Primary driver (actual client assessment data)
 * - Ramp-up Period: 20% - Secondary factor (analyst estimate)
 * - Payback Period: 20% - Secondary factor (analyst estimate)
 * - Training Hours: 10% - Minor factor (analyst estimate)
 * 
 * Rationale: Readiness is weighted heaviest because it's derived from comprehensive
 * client assessments (TFA + PIF), while other factors are educated estimates that
 * will be refined during actual scoping.
 * 
 * Example: 12mo ramp-up + 18mo payback + 15hrs training + 38% readiness
 * → readiness_effort=62, ramp=100, payback=100, training=74
 * → (62×0.5)+(100×0.2)+(100×0.2)+(74×0.1) = 31+20+20+7.4 = 78.4
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
    (readinessEffort * 0.50) +
    (rampupEffort * 0.20) +
    (paybackEffort * 0.20) +
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
}

/**
 * Calculate BASE BUSINESS IMPACT (0-100 scale)
 * 
 * This is the FAIR comparison score that NEVER changes based on toggles.
 * Always uses: ROI 60% + FTE Hours 40%
 * 
 * Use this for:
 * - Base Impact Matrix (fair apples-to-apples comparison)
 * - Showing the "true" impact of ROI and time savings
 * - Comparing opportunities that may/may not have error/revenue metrics
 * 
 * Company Context with 10x Multiplier:
 * - ROI as % of annual revenue × 1000 (10% ROI = score 100)
 * - FTE savings as % of total employees × 1000 (10% FTE = score 100)
 * 
 * Example: $80K ROI on $1M revenue = 8% → score 80
 *          5 FTE on 100 employees = 5% → score 50
 *          Base Impact = (80 × 0.6) + (50 × 0.4) = 48 + 20 = 68
 */
export function calculateBaseImpact(
  opportunity: ImplementationOpportunity,
  companyContext?: CompanyContext
): number {
  const annualRoi = parseFloat(opportunity.annualRoi || "0");
  const fteSavings = parseFloat(opportunity.fteSavings || "0");
  
  // Parse company context
  const companyRevenue = parseFloat(companyContext?.annualRevenue?.toString() || "0");
  const companyEmployees = parseFloat(companyContext?.totalEmployees?.toString() || "0");
  
  // Calculate company-relative base metrics (0-100)
  let roiScore = 0;
  let hoursScore = 0;
  
  if (companyRevenue > 0) {
    // ROI as % of annual revenue × 10 multiplier, capped at 100
    // 10% ROI = score 100 (exceptional workflow automation)
    roiScore = Math.min((annualRoi / companyRevenue) * 1000, 100);
  } else {
    // Fallback: assume $1M revenue with same 10x multiplier logic
    roiScore = Math.min((annualRoi / 1000000) * 1000, 100);
  }
  
  if (companyEmployees > 0) {
    // FTE savings as % of total employees × 10 multiplier, capped at 100
    // 10% FTE = score 100 (exceptional workforce efficiency)
    hoursScore = Math.min((fteSavings / companyEmployees) * 1000, 100);
  } else {
    // Fallback: assume 100 employees with same 10x multiplier logic
    hoursScore = Math.min((fteSavings / 100) * 1000, 100);
  }

  // Base score: ROI 60% + Hours 40% (always fixed, 0-100 range)
  const baseScore = (roiScore * 0.60) + (hoursScore * 0.40);

  return Math.round(baseScore * 100) / 100; // Round to 2 decimals
}

/**
 * ENHANCED BUSINESS IMPACT SCORING - ADDITIVE BONUS MODEL
 * 
 * Starts with base impact (ROI 60% + Hours 40%) and adds bonuses on top.
 * This ensures Enhanced Impact is ALWAYS >= Base Impact.
 * 
 * Formula:
 * - Base: ROI 60% + Hours 40% (max 100)
 * - + Error Bonus: 25% when error metrics enabled
 * - + Revenue Bonus: 25% when revenue metrics enabled
 * 
 * Max Scores:
 * - Time Only: 100 (base only)
 * - Time + Error: 125 (base + error bonus)
 * - Time + Revenue: 125 (base + revenue bonus)
 * - All Three: 150 (base + both bonuses)
 * 
 * Dynamic axis scaling adjusts matrix X-axis domain (0-100, 0-125, or 0-150)
 */
export function calculateEnhancedImpact(
  opportunity: ImplementationOpportunity,
  toggles: ToggleState,
  companyContext?: CompanyContext
): number {
  const annualRoi = parseFloat(opportunity.annualRoi || "0");
  const fteSavings = parseFloat(opportunity.fteSavings || "0");
  
  // Parse company context
  const companyRevenue = parseFloat(companyContext?.annualRevenue?.toString() || "0");
  const companyEmployees = parseFloat(companyContext?.totalEmployees?.toString() || "0");
  
  // Calculate base component scores (0-100)
  let roiScore = 0;
  let hoursScore = 0;
  
  if (companyRevenue > 0) {
    roiScore = Math.min((annualRoi / companyRevenue) * 1000, 100);
  } else {
    // Fallback: assume $1M revenue with same 10x multiplier logic
    roiScore = Math.min((annualRoi / 1000000) * 1000, 100);
  }
  
  if (companyEmployees > 0) {
    hoursScore = Math.min((fteSavings / companyEmployees) * 1000, 100);
  } else {
    // Fallback: assume 100 employees with same 10x multiplier logic
    hoursScore = Math.min((fteSavings / 100) * 1000, 100);
  }

  // Start with base impact (same as Base Impact Matrix)
  let totalImpact = (roiScore * 0.60) + (hoursScore * 0.40);

  // Add error bonus if enabled (0-25 points)
  if (toggles.errorMetrics) {
    const errorPct = parseFloat(opportunity.errorReductionPct || "0");
    const errorsAvoided = opportunity.errorsAvoidedAnnually || 0;
    const errorPctScore = errorPct; // Already 0-100
    const errorsAvoidedScore = normalizeToScale(errorsAvoided, 1000);
    const errorScore = (errorPctScore * 0.5) + (errorsAvoidedScore * 0.5);
    
    // Add 25% of error score as bonus
    totalImpact += (errorScore * 0.25);
  }

  // Add revenue bonus if enabled (0-25 points)
  if (toggles.revenueMetrics) {
    const hoursReallocated = parseFloat(opportunity.hoursReallocatedToRevenue || "0");
    const revenueUplift = parseFloat(opportunity.revenueUpliftAnnual || "0");
    
    let hoursReallocatedScore = 0;
    let revenueUpliftScore = 0;
    
    const hoursReallocatedFTE = hoursReallocated / 2080;
    if (companyEmployees > 0) {
      hoursReallocatedScore = Math.min((hoursReallocatedFTE / companyEmployees) * 1000, 100);
    } else {
      // Fallback: assume 100 employees with same 10x multiplier logic
      hoursReallocatedScore = Math.min((hoursReallocatedFTE / 100) * 1000, 100);
    }
    
    if (companyRevenue > 0) {
      revenueUpliftScore = Math.min((revenueUplift / companyRevenue) * 3000, 100);
    } else {
      // Fallback: assume $1M revenue, 3x multiplier for revenue sensitivity
      revenueUpliftScore = Math.min((revenueUplift / 1000000) * 3000, 100);
    }
    
    const revenueScore = (hoursReallocatedScore * 0.4) + (revenueUpliftScore * 0.6);
    
    // Add 25% of revenue score as bonus
    totalImpact += (revenueScore * 0.25);
  }

  return Math.round(totalImpact * 100) / 100;
}

/**
 * Get maximum possible score for a given filter type
 * Used for dynamic axis scaling in Enhanced Impact Matrix
 * 
 * Additive Bonus Model Max Scores:
 * - Time Only: 100 (base: ROI 60% + Hours 40%)
 * - Time + Error: 125 (base 100 + error bonus 25%)
 * - Time + Revenue: 125 (base 100 + revenue bonus 25%)
 * - All Three: 150 (base 100 + error 25% + revenue 25%)
 */
export function getFilterMaxScore(toggles: ToggleState): number {
  if (toggles.errorMetrics && toggles.revenueMetrics) {
    return 150; // Base + both bonuses
  } else if (toggles.errorMetrics || toggles.revenueMetrics) {
    return 125; // Base + single bonus
  } else {
    return 100; // Base only
  }
}

/**
 * Determine which quadrant the opportunity falls into
 * For Enhanced Impact Matrix, uses filter-specific max scale
 */
export function getQuadrant(
  implementationEffort: number, 
  businessImpact: number,
  maxImpactScale: number = 100
): OpportunityScore["quadrant"] {
  // Midpoint calculation respects max scale
  const impactMidpoint = maxImpactScale / 2;
  
  const isLowEffort = implementationEffort < 50;
  const isHighImpact = businessImpact >= impactMidpoint;

  if (isLowEffort && isHighImpact) return "Quick Wins";
  if (!isLowEffort && isHighImpact) return "Strategic Goals";
  if (isLowEffort && !isHighImpact) return "Nice-To-Haves";
  return "Deprioritize";
}

/**
 * Calculate full opportunity score with both base and enhanced impact
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

  // Always calculate base impact (fair comparison)
  const baseImpact = calculateBaseImpact(opportunity, companyContext);
  
  // Calculate enhanced impact based on toggles
  const enhancedImpact = calculateEnhancedImpact(opportunity, toggles, companyContext);
  
  // Get max scale for quadrant calculation
  const maxScale = getFilterMaxScore(toggles);
  
  const quadrant = getQuadrant(implementationEffort, enhancedImpact, maxScale);

  return {
    implementationEffort,
    businessImpact: enhancedImpact,
    baseImpact,
    quadrant
  };
}

// Matrix Filter Types
export type MatrixFilterType = 
  | "time-only"           // No bonuses enabled
  | "time-error"          // Error enabled, revenue disabled
  | "time-revenue"        // Revenue enabled, error disabled
  | "all-three"           // Both error and revenue enabled
  | "all-opportunities";  // Show everything with per-opportunity toggles

/**
 * Filter opportunities by their toggle states
 * Controls which opportunities appear in each filter view
 */
export function filterOpportunitiesByMetrics(
  opportunities: ImplementationOpportunity[],
  filterType: MatrixFilterType
): ImplementationOpportunity[] {
  switch (filterType) {
    case "time-only":
      return opportunities.filter(opp => {
        const hasError = hasErrorMetrics(opp);
        const hasRevenue = hasRevenueMetrics(opp);
        const errorEnabled = hasError && opp.errorMetricsEnabled;
        const revenueEnabled = hasRevenue && opp.revenueMetricsEnabled;
        return !errorEnabled && !revenueEnabled;
      });
    
    case "time-error":
      return opportunities.filter(opp => {
        const hasError = hasErrorMetrics(opp);
        const hasRevenue = hasRevenueMetrics(opp);
        const errorEnabled = hasError && opp.errorMetricsEnabled;
        const revenueEnabled = hasRevenue && opp.revenueMetricsEnabled;
        return errorEnabled && !revenueEnabled;
      });
    
    case "time-revenue":
      return opportunities.filter(opp => {
        const hasError = hasErrorMetrics(opp);
        const hasRevenue = hasRevenueMetrics(opp);
        const errorEnabled = hasError && opp.errorMetricsEnabled;
        const revenueEnabled = hasRevenue && opp.revenueMetricsEnabled;
        return !errorEnabled && revenueEnabled;
      });
    
    case "all-three":
      return opportunities.filter(opp => {
        const hasError = hasErrorMetrics(opp);
        const hasRevenue = hasRevenueMetrics(opp);
        const errorEnabled = hasError && opp.errorMetricsEnabled;
        const revenueEnabled = hasRevenue && opp.revenueMetricsEnabled;
        return errorEnabled && revenueEnabled;
      });
    
    case "all-opportunities":
      return opportunities;
    
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

export interface ScoringGuideEntry {
  targetScore: number;
  requiredRoi: number;
  requiredRoiPct: number;
  requiredFte: number;
  requiredFtePct: number;
  description: string;
}

export interface ScoringGuideTable {
  filterName: string;
  filterType: MatrixFilterType;
  roiWeight: number;
  hoursWeight: number;
  errorWeight?: number;
  revenueWeight?: number;
  maxScore: number;
  entries: ScoringGuideEntry[];
}

/**
 * Generate scoring guide tables for a specific company
 */
export function calculateScoringGuide(
  companyRevenue: number,
  companyEmployees: number
): ScoringGuideTable[] {
  const guides: ScoringGuideTable[] = [];
  
  const filterConfigs: Array<{
    filterName: string;
    filterType: MatrixFilterType;
    roiWeight: number;
    hoursWeight: number;
    errorWeight?: number;
    revenueWeight?: number;
    maxScore: number;
  }> = [
    {
      filterName: "Time Savings Only (Base Impact)",
      filterType: "time-only",
      roiWeight: 0.60,
      hoursWeight: 0.40,
      maxScore: 100,
    },
    {
      filterName: "Time + Error Reduction (Additive Bonus)",
      filterType: "time-error",
      roiWeight: 0.60,
      hoursWeight: 0.40,
      errorWeight: 0.25,
      maxScore: 125,
    },
    {
      filterName: "Time + Revenue Uplift (Additive Bonus)",
      filterType: "time-revenue",
      roiWeight: 0.60,
      hoursWeight: 0.40,
      revenueWeight: 0.25,
      maxScore: 125,
    },
    {
      filterName: "All 3 Metrics (Additive Bonuses)",
      filterType: "all-three",
      roiWeight: 0.60,
      hoursWeight: 0.40,
      errorWeight: 0.25,
      revenueWeight: 0.25,
      maxScore: 150,
    },
  ];
  
  for (const config of filterConfigs) {
    const entries: ScoringGuideEntry[] = [];
    
    for (let targetScore = 10; targetScore <= 100; targetScore += 10) {
      const combinedWeight = config.roiWeight + config.hoursWeight;
      const balancedComponentScore = targetScore / combinedWeight;
      
      const requiredRoi = (balancedComponentScore / 1000) * companyRevenue;
      const requiredRoiPct = balancedComponentScore / 10;
      
      const requiredFte = (balancedComponentScore / 1000) * companyEmployees;
      const requiredFtePct = balancedComponentScore / 10;
      
      let description = "Balanced impact";
      if (targetScore <= 20) {
        description = "Small process improvement";
      } else if (targetScore <= 40) {
        description = "Moderate automation opportunity";
      } else if (targetScore <= 60) {
        description = "Significant workflow transformation";
      } else if (targetScore <= 80) {
        description = "Major workflow optimization";
      } else {
        description = "Exceptional workflow automation";
      }
      
      entries.push({
        targetScore,
        requiredRoi: Math.round(requiredRoi),
        requiredRoiPct: Math.round(requiredRoiPct * 10) / 10,
        requiredFte: Math.round(requiredFte * 10) / 10,
        requiredFtePct: Math.round(requiredFtePct * 10) / 10,
        description,
      });
    }
    
    guides.push({
      filterName: config.filterName,
      filterType: config.filterType,
      roiWeight: config.roiWeight,
      hoursWeight: config.hoursWeight,
      errorWeight: config.errorWeight,
      revenueWeight: config.revenueWeight,
      maxScore: config.maxScore,
      entries,
    });
  }
  
  return guides;
}

/**
 * Calculate Business Impact for a specific filter view in Enhanced Matrix
 * Respects per-opportunity toggle states and applies additive bonuses
 */
export function calculateBusinessImpactForFilter(
  opportunity: ImplementationOpportunity,
  filterType: MatrixFilterType,
  companyContext?: CompanyContext
): number {
  // Build toggle state from opportunity's own settings
  const toggles: ToggleState = {
    errorMetrics: opportunity.errorMetricsEnabled || false,
    revenueMetrics: opportunity.revenueMetricsEnabled || false
  };

  // Use enhanced impact calculation with additive bonuses
  return calculateEnhancedImpact(opportunity, toggles, companyContext);
}
