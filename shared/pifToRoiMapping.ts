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

/**
 * Role Profiles - 16 roles per spec with base percentages and ranges
 * 
 * Per specification section 6. ROLE PROFILES:
 * Role ID                    Time Base   Time Range      Quality Base  Quality Range   Revenue Base  Revenue Range
 */
export const roleProfiles: Record<string, {
  timeSavingsBase: number;
  timeSavingsRange: [number, number];
  qualityImpactBase: number;
  qualityImpactRange: [number, number];
  revenueUpliftBase: number;
  revenueUpliftRange: [number, number];
}> = {
  data_entry_admin: {
    timeSavingsBase: 70,
    timeSavingsRange: [40, 90],
    qualityImpactBase: 60,
    qualityImpactRange: [35, 85],
    revenueUpliftBase: 5,
    revenueUpliftRange: [0, 15],
  },
  accounts_payable_receivable: {
    timeSavingsBase: 65,
    timeSavingsRange: [35, 85],
    qualityImpactBase: 70,
    qualityImpactRange: [45, 90],
    revenueUpliftBase: 10,
    revenueUpliftRange: [0, 25],
  },
  payroll_specialist: {
    timeSavingsBase: 60,
    timeSavingsRange: [30, 85],
    qualityImpactBase: 75,
    qualityImpactRange: [50, 95],
    revenueUpliftBase: 5,
    revenueUpliftRange: [0, 15],
  },
  customer_support_t1: {
    timeSavingsBase: 65,
    timeSavingsRange: [35, 85],
    qualityImpactBase: 50,
    qualityImpactRange: [25, 70],
    revenueUpliftBase: 35,
    revenueUpliftRange: [10, 60],
  },
  sales_ops_crm: {
    timeSavingsBase: 60,
    timeSavingsRange: [30, 85],
    qualityImpactBase: 55,
    qualityImpactRange: [30, 75],
    revenueUpliftBase: 60,
    revenueUpliftRange: [20, 60],
  },
  procurement_purchasing: {
    timeSavingsBase: 55,
    timeSavingsRange: [30, 80],
    qualityImpactBase: 60,
    qualityImpactRange: [35, 80],
    revenueUpliftBase: 20,
    revenueUpliftRange: [5, 40],
  },
  hr_coordinator: {
    timeSavingsBase: 55,
    timeSavingsRange: [30, 80],
    qualityImpactBase: 50,
    qualityImpactRange: [25, 70],
    revenueUpliftBase: 10,
    revenueUpliftRange: [0, 25],
  },
  it_support_helpdesk: {
    timeSavingsBase: 60,
    timeSavingsRange: [30, 85],
    qualityImpactBase: 55,
    qualityImpactRange: [30, 75],
    revenueUpliftBase: 15,
    revenueUpliftRange: [0, 30],
  },
  operations_coordinator: {
    timeSavingsBase: 50,
    timeSavingsRange: [25, 75],
    qualityImpactBase: 45,
    qualityImpactRange: [20, 65],
    revenueUpliftBase: 25,
    revenueUpliftRange: [5, 45],
  },
  marketing_ops: {
    timeSavingsBase: 55,
    timeSavingsRange: [30, 80],
    qualityImpactBase: 50,
    qualityImpactRange: [25, 70],
    revenueUpliftBase: 45,
    revenueUpliftRange: [15, 60],
  },
  financial_analyst: {
    timeSavingsBase: 45,
    timeSavingsRange: [25, 70],
    qualityImpactBase: 55,
    qualityImpactRange: [30, 75],
    revenueUpliftBase: 30,
    revenueUpliftRange: [10, 50],
  },
  customer_success: {
    timeSavingsBase: 40,
    timeSavingsRange: [20, 65],
    qualityImpactBase: 45,
    qualityImpactRange: [20, 65],
    revenueUpliftBase: 55,
    revenueUpliftRange: [20, 60],
  },
  executive_assistant: {
    timeSavingsBase: 50,
    timeSavingsRange: [25, 75],
    qualityImpactBase: 40,
    qualityImpactRange: [20, 60],
    revenueUpliftBase: 5,
    revenueUpliftRange: [0, 15],
  },
  compliance_qa_audit: {
    timeSavingsBase: 45,
    timeSavingsRange: [25, 70],
    qualityImpactBase: 65,
    qualityImpactRange: [40, 85],
    revenueUpliftBase: 10,
    revenueUpliftRange: [0, 25],
  },
  legal_contract_admin: {
    timeSavingsBase: 40,
    timeSavingsRange: [20, 65],
    qualityImpactBase: 60,
    qualityImpactRange: [35, 80],
    revenueUpliftBase: 15,
    revenueUpliftRange: [0, 30],
  },
  other: {
    timeSavingsBase: 30,
    timeSavingsRange: [10, 60],
    qualityImpactBase: 30,
    qualityImpactRange: [10, 60],
    revenueUpliftBase: 0,
    revenueUpliftRange: [0, 20],
  },
};

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
 * Calculate Time Savings rubric percentage from PIF Q11-13
 * 
 * Per spec section 5. RUBRIC CALCULATION LOGIC:
 * Formula: finalPercent = basePercent × complexity × repetition × structure
 * 
 * Q1: Role Type → Sets base percentage (from roleProfiles table)
 * Q2: Complexity → Simple=1.3, Moderate=1.0, Complex=0.7
 * Q3: Repetition → Daily=1.2, Weekly=1.0, Monthly=0.8
 * Q4: Data Structure → Highly structured=1.3, Semi-structured=1.0, Unstructured=0.7
 * 
 * Capping: Result is capped within the role's timeSavingsRange
 */
export function calculateTimeSavingsRubric(pifResponse: PIFResponse): number {
  // Q11 (Role Type) → Get base percentage and range from role profiles
  const roleType = getResponse(pifResponse, 11);
  const roleProfile = roleProfiles[roleType] || roleProfiles.other;
  const basePercentage = roleProfile.timeSavingsBase;
  const [minRange, maxRange] = roleProfile.timeSavingsRange;
  
  // Per spec: Complexity multipliers (Q12)
  const complexityMultipliers: Record<string, number> = {
    simple: 1.3,
    moderate: 1.0,
    complex: 0.7,
  };
  const complexity = getResponse(pifResponse, 12);
  const complexityMultiplier = complexityMultipliers[complexity] || 1.0;
  
  // Per spec: Repetition/Frequency multipliers
  // Very High 1.3×, Daily 1.2×, Weekly 1.0×, Monthly 0.8×
  const frequencyMultipliers: Record<string, number> = {
    very_high: 1.3,
    daily: 1.2,
    weekly: 1.0,
    monthly: 0.8,
  };
  const frequency = getResponse(pifResponse, 18) || getRoiInputs(pifResponse).frequency || 'weekly';
  const frequencyMultiplier = frequencyMultipliers[frequency] || 1.0;
  
  // Per spec: Data structure multipliers (Q13)
  const dataStructureMultipliers: Record<string, number> = {
    structured: 1.3,
    highly_structured: 1.3,
    semi_structured: 1.0,
    unstructured: 0.7,
  };
  const dataStructure = getResponse(pifResponse, 13);
  const dataStructureMultiplier = dataStructureMultipliers[dataStructure] || 1.0;
  
  // Per spec: finalPercent = basePercent × complexity × repetition × structure
  const rawPercentage = basePercentage * complexityMultiplier * frequencyMultiplier * dataStructureMultiplier;
  
  // Per spec: Result is capped within the role's timeSavingsRange
  return Math.round(Math.max(minRange, Math.min(maxRange, rawPercentage)));
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
 * Per spec: ALL rubrics use MULTIPLICATION, never averaging
 * Formula: basePercent × errorFreqMultiplier × errorCauseMultiplier × detectionMultiplier × standardizationMultiplier × aiSuitabilityMultiplier
 * 
 * Q1: Role Type → Sets base percentage (from roleProfiles)
 * Q2: Error Frequency → Very frequent=1.3, Frequent=1.15, Occasional=1.0, Rare=0.8
 * Q3: Error Cause → Manual/repetitive=1.3, Info gaps=1.15, Inconsistent standards=1.15, External factors=0.9, Complex judgment=0.7
 * Q4: Detection Timing → (weights vary 0.8-1.3)
 * Q5: Standardization → (weights vary 0.8-1.3)
 * Q6: AI Suitability → Rule-based=1.3, Pattern recognition=1.15, Contextual=1.0, Highly subjective=0.8
 * 
 * Capping: Result is capped within the role's qualityImpactRange
 */
export function calculateQualityImpactRubric(pifResponse: PIFResponse): number {
  if (getResponse(pifResponse, 21) !== 'yes') {
    return 0;
  }
  
  const roleType = getResponse(pifResponse, 11);
  const roleProfile = roleProfiles[roleType] || roleProfiles.other;
  const basePercentage = roleProfile.qualityImpactBase;
  const [minRange, maxRange] = roleProfile.qualityImpactRange;
  
  const reworkImpactMultipliers: Record<string, number> = {
    critical: 1.3,
    very_frequent: 1.3,
    significant: 1.15,
    frequent: 1.15,
    moderate: 1.0,
    occasional: 1.0,
    minimal: 0.8,
    rare: 0.8,
  };
  const reworkImpact = getResponse(pifResponse, 23);
  const reworkMultiplier = reworkImpactMultipliers[reworkImpact] || 1.0;
  
  const errorCauseMultipliers: Record<string, number> = {
    manual_repetitive: 1.3,
    info_gaps: 1.15,
    inconsistent_standards: 1.15,
    external_factors: 0.9,
    complex_judgment: 0.7,
  };
  const errorCause = getResponse(pifResponse, 24);
  const errorCauseMultiplier = errorCauseMultipliers[errorCause] || 1.0;
  
  const detectionMultipliers: Record<string, number> = {
    immediate: 0.8,
    same_day: 1.0,
    next_day: 1.15,
    delayed: 1.3,
  };
  const detection = getResponse(pifResponse, 25);
  const detectionMultiplier = detectionMultipliers[detection] || 1.0;
  
  const standardizationMultipliers: Record<string, number> = {
    highly_standardized: 1.3,
    standardized: 1.15,
    some_guidelines: 1.0,
    minimal_guidelines: 0.8,
  };
  const standardization = getResponse(pifResponse, 26);
  const standardizationMultiplier = standardizationMultipliers[standardization] || 1.0;
  
  const aiSuitabilityMultipliers: Record<string, number> = {
    rule_based: 1.3,
    pattern_recognition: 1.15,
    contextual: 1.0,
    highly_subjective: 0.8,
  };
  const aiSuitability = getResponse(pifResponse, 27);
  const aiSuitabilityMultiplier = aiSuitabilityMultipliers[aiSuitability] || 1.0;
  
  // Per spec: ALL rubrics use MULTIPLICATION, never averaging
  // Formula: basePercent × errorFreqMultiplier × errorCauseMultiplier × detectionMultiplier × standardizationMultiplier × aiSuitabilityMultiplier
  const rawPercentage = basePercentage * reworkMultiplier * errorCauseMultiplier * detectionMultiplier * standardizationMultiplier * aiSuitabilityMultiplier;
  
  return Math.round(Math.max(minRange, Math.min(maxRange, rawPercentage)));
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
 * Per spec section 5. RUBRIC CALCULATION LOGIC - Revenue Uplift Rubric (3 Questions):
 * Formula: finalPercent = basePercent × capacityDemand × revenueProcess
 * 
 * Q1: Role Type → Sets base percentage (from roleProfiles)
 * Q2: Capacity/Demand → High demand=1.4, Strong pipeline=1.2, Moderate=0.9, Limited=0.4
 * Q3: Revenue Process → Direct predictable=1.2, Somewhat=1.0, Indirect=0.7, Limited=0.4
 * 
 * Capping: Result is capped at 60% maximum (per spec line 176)
 */
export function calculateRevenueUpliftRubric(pifResponse: PIFResponse): number {
  const roleType = getResponse(pifResponse, 11);
  const roleProfile = roleProfiles[roleType] || roleProfiles.other;
  const basePercentage = roleProfile.revenueUpliftBase;
  
  // Q2: Capacity/Demand multipliers (per spec line 174)
  const capacityMultipliers: Record<string, number> = {
    high_demand: 1.4,
    strong_pipeline: 1.2,
    moderate: 0.9,
    limited: 0.4,
  };
  const capacity = getResponse(pifResponse, 14);
  const capacityMultiplier = capacityMultipliers[capacity] || 0.9;
  
  // Q3: Revenue Process multipliers (per spec line 175)
  const conversionMultipliers: Record<string, number> = {
    direct: 1.2,
    direct_predictable: 1.2,
    somewhat: 1.0,
    indirect: 0.7,
    limited: 0.4,
  };
  const conversion = getResponse(pifResponse, 15);
  const conversionMultiplier = conversionMultipliers[conversion] || 1.0;
  
  // Per spec: finalPercent = basePercent × capacityDemand × revenueProcess
  const rawPercentage = basePercentage * capacityMultiplier * conversionMultiplier;
  
  // Per spec line 176: Capping at 60% maximum
  return Math.round(Math.max(0, Math.min(60, rawPercentage)));
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
    opportunityName: undefined, // User-provided opportunity name (distinct from process name)
    opportunityDescription: undefined, // User-provided opportunity description
    processInfo: mapProcessInfo(stepName, workflowName, pifResponse),
    peopleAndCost: mapPeopleAndCost(pifResponse),
    timeSavings: mapTimeSavings(pifResponse),
    qualityImpact: mapQualityImpact(pifResponse), // Q21 controls enabled flag
    revenueUplift: mapRevenueUplift(pifResponse),
    costsAndRampup: mapCostsAndRampup(),
    selectedScenario: 'conservative', // Default to conservative scenario
  };
}
