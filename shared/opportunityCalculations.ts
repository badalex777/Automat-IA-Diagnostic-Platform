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
 * Formula (tightened ranges for more sensitive scoring):
 * - Readiness Score (inverted): 30%
 * - Ramp-up Period: 30%
 * - Payback Period: 25%
 * - Training Hours: 15%
 * 
 * Example: 12mo ramp-up + 20mo payback + 15hrs training + 35% readiness
 * → 100 + 100 + 74 + 65 = 85 effort (Strategic Goals territory)
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
    (readinessEffort * 0.30) +
    (rampupEffort * 0.30) +
    (paybackEffort * 0.25) +
    (trainingEffort * 0.15);

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
 * BUSINESS IMPACT SCORING - ADDITIVE WITH NORMALIZED DISPLAY
 * 
 * Internal Calculation (0-160 range):
 * - Base Score: (ROI 60% + Hours 40%) = 0-100 points from core business value
 * - Error Bonus (if toggle ON): + 0-30 points (errorScore × 0.3, capped at 30)
 * - Revenue Bonus (if toggle ON): + 0-30 points (revenueScore × 0.3, capped at 30)
 * - Max possible: 160 points (exceptional with all metrics strong)
 * 
 * Display Normalization (0-100 range):
 * - All UI displays show: (rawScore / 160) × 100
 * - This ensures familiar 0-100 scale while preserving additive bonuses
 * - Use normalizeBusinessImpactToDisplay() for all UI rendering
 * 
 * Company Context:
 * - ROI as % of annual revenue × 10 multiplier
 * - FTE savings as % of total employees × 10 multiplier
 * - Revenue uplift uses 30x multiplier for meaningful impact
 * 
 * Key Benefits:
 * - Core business value (ROI + FTE) never penalized when bonuses added
 * - Bonuses are truly additive - toggle ON always increases score
 * - Normalized display keeps all scores in familiar 0-100 range
 * - Consistent across all views (matrix, cards, filters)
 */
export function calculateBusinessImpact(
  opportunity: ImplementationOpportunity,
  toggles: ToggleState,
  companyContext?: CompanyContext,
  useAdditiveBonus: boolean = true // Always true now, kept for backwards compatibility
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
    // Fallback: normalize to $1M
    roiScore = normalizeToScale(annualRoi, 1000000);
  }
  
  if (companyEmployees > 0) {
    // FTE savings as % of total employees × 10 multiplier, capped at 100
    // 10% FTE = score 100 (exceptional workforce efficiency)
    hoursScore = Math.min((fteSavings / companyEmployees) * 1000, 100);
  } else {
    // Fallback: normalize to 5 FTE
    hoursScore = normalizeToScale(fteSavings, 5);
  }

  // Base score: ROI 60% + Hours 40% = foundation (0-100 points)
  const baseScore = (roiScore * 0.60) + (hoursScore * 0.40);

  // Calculate error bonus if active (0-30 points, capped)
  let errorBonus = 0;
  if (toggles.errorMetrics) {
    const errorPct = parseFloat(opportunity.errorReductionPct || "0");
    const errorsAvoided = opportunity.errorsAvoidedAnnually || 0;
    const errorPctScore = errorPct; // Already 0-100
    // Normalize errors avoided to 0-100 (1000 errors = 100)
    const errorsAvoidedScore = normalizeToScale(errorsAvoided, 1000);
    const errorScore = (errorPctScore * 0.5) + (errorsAvoidedScore * 0.5);
    // Error bonus: proportional to error score, capped at 30 points
    errorBonus = Math.min(errorScore * 0.3, 30);
  }

  // Calculate revenue bonus if active (0-30 points, capped)
  let revenueBonus = 0;
  if (toggles.revenueMetrics) {
    const hoursReallocated = parseFloat(opportunity.hoursReallocatedToRevenue || "0");
    const revenueUplift = parseFloat(opportunity.revenueUpliftAnnual || "0");
    
    let hoursReallocatedScore = 0;
    let revenueUpliftScore = 0;
    
    // Hours Reallocated: convert to FTE and normalize against total employees with 10x multiplier
    const hoursReallocatedFTE = hoursReallocated / 2080; // Annual hours to FTE
    if (companyEmployees > 0) {
      hoursReallocatedScore = Math.min((hoursReallocatedFTE / companyEmployees) * 1000, 100);
    } else {
      hoursReallocatedScore = normalizeToScale(hoursReallocatedFTE, 5);
    }
    
    // Revenue Uplift: as % of company revenue with 30x multiplier (enhanced for impact)
    if (companyRevenue > 0) {
      revenueUpliftScore = Math.min((revenueUplift / companyRevenue) * 3000, 100);
    } else {
      revenueUpliftScore = normalizeToScale(revenueUplift, 2000000);
    }
    
    const revenueScore = (hoursReallocatedScore * 0.4) + (revenueUpliftScore * 0.6);
    // Revenue bonus: proportional to revenue score, capped at 30 points  
    revenueBonus = Math.min(revenueScore * 0.3, 30);
  }

  // Total impact: base score + bonuses
  const totalImpact = baseScore + errorBonus + revenueBonus;

  return Math.round(totalImpact * 100) / 100; // Round to 2 decimals
}

/**
 * Normalize Business Impact score for display (0-100 range)
 * 
 * Converts internal 0-160 additive score to familiar 0-100 display scale.
 * Use this function for ALL UI rendering of business impact scores.
 * 
 * @param rawScore - Raw business impact score (0-160 range)
 * @returns Normalized score (0-100 range)
 */
export function normalizeBusinessImpactToDisplay(rawScore: number): number {
  const MAX_INTERNAL_SCORE = 160; // Base 100 + Error 30 + Revenue 30
  const normalized = (rawScore / MAX_INTERNAL_SCORE) * 100;
  return Math.round(normalized * 100) / 100; // Round to 2 decimals
}

/**
 * Determine which quadrant the opportunity falls into
 * NOTE: Expects normalized 0-100 scores for both axes
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

export interface ScoringGuideEntry {
  targetScore: number;
  requiredRoi: number;          // Dollar amount
  requiredRoiPct: number;        // Percentage of company revenue
  requiredFte: number;           // FTE count
  requiredFtePct: number;        // Percentage of company employees
  description: string;           // Human-readable description
}

export interface ScoringGuideTable {
  filterName: string;
  filterType: MatrixFilterType;
  roiWeight: number;
  hoursWeight: number;
  errorWeight?: number;
  revenueWeight?: number;
  entries: ScoringGuideEntry[];
}

/**
 * Generate scoring guide tables for a specific company
 * Shows what ROI and FTE combinations produce different business impact scores
 */
export function calculateScoringGuide(
  companyRevenue: number,
  companyEmployees: number
): ScoringGuideTable[] {
  const guides: ScoringGuideTable[] = [];
  
  // Define filter configurations
  const filterConfigs: Array<{
    filterName: string;
    filterType: MatrixFilterType;
    roiWeight: number;
    hoursWeight: number;
    errorWeight?: number;
    revenueWeight?: number;
  }> = [
    {
      filterName: "Time Savings Only",
      filterType: "time-only",
      roiWeight: 0.60,
      hoursWeight: 0.40,
    },
    {
      filterName: "Time + Error Reduction",
      filterType: "time-error",
      roiWeight: 0.45,
      hoursWeight: 0.30,
      errorWeight: 0.25,
    },
    {
      filterName: "Time + Revenue Uplift",
      filterType: "time-revenue",
      roiWeight: 0.45,
      hoursWeight: 0.30,
      revenueWeight: 0.25,
    },
    {
      filterName: "All 3 Metrics",
      filterType: "all-three",
      roiWeight: 0.40,
      hoursWeight: 0.25,
      errorWeight: 0.20,
      revenueWeight: 0.15,
    },
  ];
  
  // For each filter configuration
  for (const config of filterConfigs) {
    const entries: ScoringGuideEntry[] = [];
    
    // Generate entries for scores 10, 20, 30, ..., 100
    for (let targetScore = 10; targetScore <= 100; targetScore += 10) {
      // For balanced scenario: assume equal contribution from ROI and Hours components
      // targetScore = (roiScore × roiWeight) + (hoursScore × hoursWeight)
      // For balanced: roiScore = hoursScore = X
      // targetScore = X × (roiWeight + hoursWeight)
      // X = targetScore / (roiWeight + hoursWeight)
      
      const combinedWeight = config.roiWeight + config.hoursWeight;
      const balancedComponentScore = targetScore / combinedWeight;
      
      // With 10x multiplier:
      // roiScore = (ROI / companyRevenue) × 1000
      // So: ROI = (roiScore / 1000) × companyRevenue
      const requiredRoi = (balancedComponentScore / 1000) * companyRevenue;
      // requiredRoiPct represents the actual % of revenue (not the amplified score)
      const requiredRoiPct = balancedComponentScore / 10;
      
      // hoursScore = (FTE / companyEmployees) × 1000
      // So: FTE = (hoursScore / 1000) × companyEmployees
      const requiredFte = (balancedComponentScore / 1000) * companyEmployees;
      // requiredFtePct represents the actual % of employees (not the amplified score)
      const requiredFtePct = balancedComponentScore / 10;
      
      // Generate description
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
      entries,
    });
  }
  
  return guides;
}

/**
 * Calculate Business Impact for a specific filter view
 * Now uses same ADDITIVE logic as main function for consistency
 * Filter type only determines which opportunities appear, not how they're scored
 */
export function calculateBusinessImpactForFilter(
  opportunity: ImplementationOpportunity,
  filterType: MatrixFilterType,
  companyContext?: CompanyContext
): number {
  // Determine toggle state based on filter type
  let toggles: ToggleState;
  
  switch (filterType) {
    case "time-only":
      // Both toggles OFF
      toggles = { errorMetrics: false, revenueMetrics: false };
      break;
    
    case "time-error":
      // Error ON, revenue OFF
      toggles = { errorMetrics: true, revenueMetrics: false };
      break;
    
    case "time-revenue":
      // Revenue ON, error OFF
      toggles = { errorMetrics: false, revenueMetrics: true };
      break;
    
    case "all-three":
      // Both toggles ON
      toggles = { errorMetrics: true, revenueMetrics: true };
      break;
    
    case "all-opportunities":
      // Use opportunity's own toggle state
      toggles = {
        errorMetrics: opportunity.errorMetricsEnabled || false,
        revenueMetrics: opportunity.revenueMetricsEnabled || false
      };
      break;
    
    default:
      toggles = { errorMetrics: false, revenueMetrics: false };
  }

  // Use the unified ADDITIVE calculation
  return calculateBusinessImpact(opportunity, toggles, companyContext, true);
}
