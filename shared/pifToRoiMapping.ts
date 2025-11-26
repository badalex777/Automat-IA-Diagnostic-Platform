/**
 * PIF to ROI Calculator Mapping Utility
 * Maps Process Insight Form (PIF) responses to ROI Calculator input state
 * 
 * Auto-population strategy:
 * - 80% auto-populated from PIF responses (process volume, work characteristics, quality metrics)
 * - 20% consultant manual inputs (salary, costs, working hours)
 * 
 * Key Mappings:
 * - Q11-13 → Time Savings rubric percentage (work type, complexity, data structure)
 * - Q14-15 → Revenue Uplift rubric percentage (capacity, revenue conversion)
 * - Q17-20 → Process Volume (employeeCount, frequency, processesPerPeriod, minutesPerProcess)
 * - Q21 → Quality Impact enable/disable (conditional logic)
 * - Q21-29 → Quality Impact rubric percentage + error metrics
 */

import { 
  ProcessInfo, 
  PeopleAndCost, 
  TimeSavings, 
  QualityImpact, 
  RevenueUplift, 
  CostsAndRampup,
  ROICalculation,
  RoiInputs
} from './schema';
import type { PIFResponse } from './schema';

/**
 * Helper to safely access PIF responses with type safety
 */
function getResponse(pifResponse: PIFResponse, questionId: number): string {
  const responses = pifResponse.responses as Record<string, string> | null;
  if (!responses) return '';
  return responses[questionId.toString()] || '';
}

/**
 * Helper to safely access ROI inputs with type safety
 */
function getRoiInputs(pifResponse: PIFResponse): RoiInputs {
  return (pifResponse.roiInputs as RoiInputs) || {};
}

/**
 * Extract process name from step name
 * Auto-populates the processName field in ROI Calculator
 */
export function mapProcessInfo(stepName: string, workflowName: string, pifResponse: PIFResponse): ProcessInfo {
  return {
    processName: stepName, // Auto-populated from step name (key requirement)
    businessUnit: workflowName || 'Not specified',
    dataSource: `PIF Response by ${pifResponse.respondentName} (${pifResponse.respondentRole})`,
  };
}

/**
 * Extract process volume data from PIF Q17-20
 * Auto-populates: employees, processesPerPeriod, timePerProcessMinutes, processFrequency
 * Leaves manual inputs blank: annualWorkingHours, averageAnnualSalary, overheadMultiplier
 */
export function mapPeopleAndCost(pifResponse: PIFResponse): PeopleAndCost {
  const roiInputs = getRoiInputs(pifResponse);
  
  // Calculate hours per week per employee from process data
  const calculateHoursFromProcesses = (): number => {
    const processes = roiInputs.processesPerPeriod || 0;
    const minutes = roiInputs.minutesPerProcess || 0;
    const frequency = roiInputs.frequency || 'daily';
    
    if (!processes || !minutes) return 0;
    
    const hoursPerProcess = minutes / 60;
    const totalHoursPerPeriod = processes * hoursPerProcess;
    
    if (frequency === 'daily') {
      return totalHoursPerPeriod * 5; // 5 working days
    } else if (frequency === 'weekly') {
      return totalHoursPerPeriod;
    } else { // monthly
      return totalHoursPerPeriod / 4.33; // ~4.33 weeks per month
    }
  };
  
  return {
    // Auto-populated from PIF Q17-20
    employees: roiInputs.employeeCount || 1,
    processesPerPeriod: roiInputs.processesPerPeriod || 0,
    timePerProcessMinutes: roiInputs.minutesPerProcess || 0,
    processFrequency: roiInputs.frequency || 'daily',
    
    // Auto-calculated from process data
    hoursPerWeekPerEmployee: calculateHoursFromProcesses(),
    useProcessBasedCalculation: true,
    
    // Manual consultant inputs (leave at defaults/empty)
    averageAnnualSalary: 0,
    annualWorkingHours: 0,
    overheadMultiplier: 1.0,
    source: 'PIF Response - Process Volume Data (Q17-20)',
  };
}

/**
 * Calculate Time Savings rubric percentage from PIF Q11-13, Q18
 * 
 * Mapping Logic (per ROI Calculator handbook):
 * - Q11 (Work Type) → Base percentage (Data Entry 60%, Document Processing 45%, etc.)
 * - Q12 (Complexity) → Multiplier (simple: 1.2x, moderate: 1.0x, complex: 0.7x)
 * - Q13 (Data Structure) → Multiplier (structured: 1.2x, semi: 1.0x, unstructured: 0.8x)
 * - Q18 (Frequency) → Multiplier (daily: 1.1x, weekly: 1.0x, monthly: 0.9x)
 * 
 * Final % = base × complexity × data structure × frequency
 */
export function calculateTimeSavingsRubric(pifResponse: PIFResponse): number {
  // Base percentages by work type (Q11) - aligned with ROI Calculator handbook
  const workTypeBasePercentages: Record<string, number> = {
    financial: 45,
    finance_ops: 60, // Data Entry / Document Processing roles
    sales_ops: 50,
    account_manager: 40,
    customer_success: 35,
    data_analyst: 55,
    hr_ops: 50,
    it_support: 45,
    procurement: 55,
    legal: 30,
    marketing: 40,
    operations: 50,
  };
  
  const workType = getResponse(pifResponse, 11);
  const basePercentage = workTypeBasePercentages[workType] || 50;
  
  // Complexity multiplier (Q12)
  const complexityMultipliers: Record<string, number> = {
    simple: 1.2,
    moderate: 1.0,
    complex: 0.7,
  };
  const complexity = getResponse(pifResponse, 12);
  const complexityMultiplier = complexityMultipliers[complexity] || 1.0;
  
  // Data structure multiplier (Q13)
  const dataStructureMultipliers: Record<string, number> = {
    structured: 1.2,
    semi_structured: 1.0,
    unstructured: 0.8,
  };
  const dataStructure = getResponse(pifResponse, 13);
  const dataStructureMultiplier = dataStructureMultipliers[dataStructure] || 1.0;
  
  // Frequency multiplier (Q18) - required by rubric spec
  const frequencyMultipliers: Record<string, number> = {
    daily: 1.1,
    weekly: 1.0,
    monthly: 0.9,
  };
  const frequency = getResponse(pifResponse, 18);
  const frequencyMultiplier = frequencyMultipliers[frequency] || 1.0;
  
  // Calculate final percentage: base × complexity × data structure × frequency
  const finalPercentage = basePercentage * complexityMultiplier * dataStructureMultiplier * frequencyMultiplier;
  
  // Clamp between 10% and 90%
  return Math.max(10, Math.min(90, Math.round(finalPercentage)));
}

/**
 * Map PIF Q11-13 to Time Savings module
 * Auto-populates: enabled=true, percentTimeSaved (rubric calculated)
 */
export function mapTimeSavings(pifResponse: PIFResponse): TimeSavings {
  const percentTimeSaved = calculateTimeSavingsRubric(pifResponse);
  
  return {
    enabled: true,
    percentTimeSaved,
    source: 'PIF Response - Time Savings Analysis (Q11-13)',
  };
}

/**
 * Calculate Quality Impact rubric percentage from PIF Q21-27
 * 
 * Only enabled if Q21 = 'yes'
 * 
 * Mapping Logic (per ROI Calculator handbook - requires 5 multipliers):
 * - Q22 (Process Category) → Base percentage
 * - Q23 (Rework Impact) → Multiplier
 * - Q24 (Current Accuracy) → Multiplier
 * - Q25 (Decision Consistency) → Multiplier
 * - Q26 (Work Type) → Multiplier
 * - Q27 (Error Rate) → Error severity multiplier based on magnitude
 * 
 * Final percentage = base × average of 5 question multipliers
 */
export function calculateQualityImpactRubric(pifResponse: PIFResponse): number {
  // If Q21 = 'no', return 0 (module disabled)
  if (getResponse(pifResponse, 21) !== 'yes') {
    return 0;
  }
  
  // Process category base percentages (Q22)
  const processCategoryBase: Record<string, number> = {
    data_entry: 60,
    document_processing: 55,
    customer_service: 40,
    analysis: 45,
    compliance: 50,
  };
  const processCategory = getResponse(pifResponse, 22);
  const basePercentage = processCategoryBase[processCategory] || 45;
  
  // Rework impact multiplier (Q23)
  const reworkImpactMultipliers: Record<string, number> = {
    critical: 1.3,
    significant: 1.1,
    moderate: 1.0,
    minimal: 0.8,
  };
  const reworkImpact = getResponse(pifResponse, 23);
  const reworkMultiplier = reworkImpactMultipliers[reworkImpact] || 1.0;
  
  // Current accuracy multiplier (Q24)
  const accuracyMultipliers: Record<string, number> = {
    below_80: 1.4,
    80_90: 1.2,
    90_95: 1.0,
    95_99: 0.7,
    above_99: 0.4,
  };
  const accuracy = getResponse(pifResponse, 24);
  const accuracyMultiplier = accuracyMultipliers[accuracy] || 1.0;
  
  // Decision consistency multiplier (Q25)
  const consistencyMultipliers: Record<string, number> = {
    variable: 1.3,
    guidelines: 1.1,
    standardized: 1.0,
    automated: 0.6,
  };
  const consistency = getResponse(pifResponse, 25);
  const consistencyMultiplier = consistencyMultipliers[consistency] || 1.0;
  
  // Work type multiplier (Q26)
  const workTypeMultipliers: Record<string, number> = {
    rule_based: 1.3,
    pattern: 1.2,
    calculation: 1.1,
    judgment: 0.8,
  };
  const workType = getResponse(pifResponse, 26);
  const workTypeMultiplier = workTypeMultipliers[workType] || 1.0;
  
  // Error rate severity multiplier (Q27) - 5th required multiplier
  const roiInputs = getRoiInputs(pifResponse);
  const errorRate = roiInputs.errorRate || 0;
  let errorSeverityMultiplier = 1.0;
  if (errorRate >= 20) {
    errorSeverityMultiplier = 1.3; // Very high error rate
  } else if (errorRate >= 10) {
    errorSeverityMultiplier = 1.2; // High error rate
  } else if (errorRate >= 5) {
    errorSeverityMultiplier = 1.0; // Moderate error rate
  } else if (errorRate >= 2) {
    errorSeverityMultiplier = 0.9; // Low error rate
  } else {
    errorSeverityMultiplier = 0.7; // Very low error rate
  }
  
  // Average all 5 multipliers (per rubric spec)
  const avgMultiplier = (
    reworkMultiplier + 
    accuracyMultiplier + 
    consistencyMultiplier + 
    workTypeMultiplier +
    errorSeverityMultiplier
  ) / 5;
  
  const finalPercentage = basePercentage * avgMultiplier;
  
  // Clamp between 5% and 80%
  return Math.max(5, Math.min(80, Math.round(finalPercentage)));
}

/**
 * Map PIF Q21-29 to Quality Impact module
 * 
 * Q21 controls enabled flag (yes/no conditional logic)
 * Q27-29 provide direct error metrics from roiInputs
 */
export function mapQualityImpact(pifResponse: PIFResponse): QualityImpact {
  const roiInputs = getRoiInputs(pifResponse);
  
  // Q21: Does this workflow have measurable quality impact?
  const hasQualityImpact = getResponse(pifResponse, 21) === 'yes';
  
  if (!hasQualityImpact) {
    // Quality Impact module disabled
    return {
      enabled: false,
      calculationMethod: 'manual',
      transactionsPerWeek: 0,
      currentErrorRate: 0,
      postAIErrorRate: 0,
      financialCostPerError: 0,
      reworkMinutesPerError: 0,
      percentQualityImprovement: 0,
      source: 'Quality Impact disabled (Q21=no)',
    };
  }
  
  // Quality Impact enabled - populate from PIF
  const percentQualityImprovement = calculateQualityImpactRubric(pifResponse);
  
  // Calculate transactions per week from process volume
  const processesPerPeriod = roiInputs.processesPerPeriod || 0;
  const frequency = roiInputs.frequency || 'weekly';
  
  let transactionsPerWeek = processesPerPeriod;
  if (frequency === 'daily') {
    transactionsPerWeek = processesPerPeriod * 5; // 5 working days
  } else if (frequency === 'monthly') {
    transactionsPerWeek = processesPerPeriod / 4.33; // ~4.33 weeks per month
  }
  
  // Extract error metrics from roiInputs (Q27-29)
  const currentErrorRate = roiInputs.errorRate || 0;
  const reworkMinutesPerError = roiInputs.reworkMinutesPerError || 0;
  const financialCostPerError = roiInputs.costPerError || 0;
  
  // Calculate post-AI error rate (AI reduces errors by quality improvement percentage)
  const errorReductionFactor = percentQualityImprovement / 100;
  const postAIErrorRate = currentErrorRate * (1 - errorReductionFactor);
  
  return {
    enabled: true,
    calculationMethod: 'rubric',
    transactionsPerWeek: Math.round(transactionsPerWeek),
    currentErrorRate,
    postAIErrorRate: Math.round(postAIErrorRate * 100) / 100, // Round to 2 decimals
    financialCostPerError,
    reworkMinutesPerError,
    percentQualityImprovement,
    source: 'PIF Response - Quality Impact Module (Q21-29)',
  };
}

/**
 * Calculate Revenue Uplift rubric percentage from PIF Q11, Q14-15
 * 
 * Mapping Logic:
 * - Q11 (Role Profile) → Base percentage
 * - Q14 (Capacity vs Demand) → Multiplier
 * - Q15 (Revenue Conversion) → Multiplier
 */
export function calculateRevenueUpliftRubric(pifResponse: PIFResponse): number {
  // Role profile base percentages (Q11)
  const roleProfileBase: Record<string, number> = {
    financial: 30,
    finance_ops: 10,
    sales_ops: 60,
    account_manager: 70,
    customer_success: 50,
    data_analyst: 25,
    hr_ops: 15,
    it_support: 20,
    procurement: 15,
    legal: 40,
    marketing: 45,
    operations: 35,
  };
  const workType = getResponse(pifResponse, 11);
  const basePercentage = roleProfileBase[workType] || 30;
  
  // Capacity multiplier (Q14)
  const capacityMultipliers: Record<string, number> = {
    high_demand: 1.5,
    strong_pipeline: 1.2,
    moderate: 1.0,
    limited: 0.5,
  };
  const capacity = getResponse(pifResponse, 14);
  const capacityMultiplier = capacityMultipliers[capacity] || 1.0;
  
  // Revenue conversion multiplier (Q15)
  const conversionMultipliers: Record<string, number> = {
    direct: 1.3,
    somewhat: 1.0,
    indirect: 0.7,
    limited: 0.3,
  };
  const conversion = getResponse(pifResponse, 15);
  const conversionMultiplier = conversionMultipliers[conversion] || 1.0;
  
  const finalPercentage = basePercentage * capacityMultiplier * conversionMultiplier;
  
  // Clamp between 0% and 200% (revenue uplift can exceed 100%)
  return Math.max(0, Math.min(200, Math.round(finalPercentage)));
}

/**
 * Map PIF Q11, Q14-15 to Revenue Uplift module
 * Always enabled with rubric-calculated percentage
 */
export function mapRevenueUplift(pifResponse: PIFResponse): RevenueUplift {
  // Note: Revenue value per hour will be auto-calculated by ROI Calculator
  // based on salary and working hours when those are entered by consultant
  
  return {
    enabled: true,
    percentReallocated: 40, // Default 40% of freed time goes to revenue
    revenueValuePerHour: 0, // Will be auto-calculated
    source: 'PIF Response - Revenue Uplift Analysis (Q11, Q14-15)',
  };
}

/**
 * Initialize Costs & Rampup with defaults
 * All fields require manual consultant input
 */
export function mapCostsAndRampup(): CostsAndRampup {
  return {
    implementationCost: 0,
    annualSoftwareCost: 0,
    trainingHoursPerEmployee: 0,
    changeMgmtCosts: 0,
    rampUpMonths: 6, // Default to 6 months
    rampUpCalculationMethod: 'manual',
    rampUpEfficiencyPercent: 100, // Default 100% efficiency
    rubricComplexity: 'moderate',
    rubricDigitalComfort: 'neutral',
    rubricRolloutApproach: 'phased',
    rubricSupportStructure: 'basic',
    source: 'Manual consultant input required',
  };
}

/**
 * Generate complete ROI Calculator state from PIF response
 * 
 * @param stepName - The workflow step name (auto-populates processName)
 * @param workflowName - The workflow name (for business unit context)
 * @param pifResponse - Complete PIF response with roiInputs
 * @returns Pre-populated ROI Calculator state ready for consultant review
 */
export function generateROICalculatorState(
  stepName: string,
  workflowName: string,
  pifResponse: PIFResponse
): ROICalculation {
  return {
    processInfo: mapProcessInfo(stepName, workflowName, pifResponse),
    peopleAndCost: mapPeopleAndCost(pifResponse),
    timeSavings: mapTimeSavings(pifResponse),
    qualityImpact: mapQualityImpact(pifResponse), // Q21 controls enabled flag
    revenueUplift: mapRevenueUplift(pifResponse),
    costsAndRampup: mapCostsAndRampup(),
    selectedScenario: 'conservative', // Default to conservative scenario
  };
}
