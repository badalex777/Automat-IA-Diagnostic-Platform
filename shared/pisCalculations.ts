// PIS Aggregation and Variance Calculations
import type { PISResponse } from "./schema";

export interface AggregatedPISScores {
  processClarity: {
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
    variance: number;
  };
  changeMagnitude: {
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
    variance: number;
  };
  workflowBrittleness: {
    average: number;
    min: number;
    max: number;
    standardDeviation: number;
    variance: number;
  };
  respondentCount: number;
}

function calculateStats(values: number[]): {
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
  variance: number;
} {
  if (values.length === 0) {
    return { average: 0, min: 0, max: 0, standardDeviation: 0, variance: 0 };
  }

  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculate variance and standard deviation
  const squaredDiffs = values.map(value => Math.pow(value - average, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  return {
    average: Math.round(average),
    min,
    max,
    standardDeviation: Math.round(standardDeviation * 10) / 10, // One decimal place
    variance: Math.round(variance * 10) / 10 // One decimal place
  };
}

export function calculateAggregatedPISScores(responses: PISResponse[]): AggregatedPISScores {
  if (responses.length === 0) {
    return {
      processClarity: { average: 0, min: 0, max: 0, standardDeviation: 0, variance: 0 },
      changeMagnitude: { average: 0, min: 0, max: 0, standardDeviation: 0, variance: 0 },
      workflowBrittleness: { average: 0, min: 0, max: 0, standardDeviation: 0, variance: 0 },
      respondentCount: 0
    };
  }

  const processClarity = responses
    .map(r => r.processClarity)
    .filter((score): score is number => score !== null && score !== undefined);
  
  const changeMagnitude = responses
    .map(r => r.changeMagnitude)
    .filter((score): score is number => score !== null && score !== undefined);
  
  const workflowBrittleness = responses
    .map(r => r.workflowBrittleness)
    .filter((score): score is number => score !== null && score !== undefined);

  return {
    processClarity: calculateStats(processClarity),
    changeMagnitude: calculateStats(changeMagnitude),
    workflowBrittleness: calculateStats(workflowBrittleness),
    respondentCount: responses.length
  };
}

// Calculate combined Readiness Rubric score (TFA 60% + PIS 40%)
export interface ReadinessRubricScore {
  totalScore: number;
  tfaScore: number;
  pisScore: number;
  components: {
    // TFA components (60% total)
    systemEnvironment: number; // 15% of total (25% of TFA × 60%)
    dataQuality: number; // 18% of total (30% of TFA × 60%)
    integrationFeasibility: number; // 18% of total (30% of TFA × 60%)
    securityCompliance: number; // 9% of total (15% of TFA × 60%)
    // PIS components (40% total)
    processClarity: number; // 8% of total (20% of PIS × 40%)
    changeMagnitude: number; // 8% of total (20% of PIS × 40%)
    workflowBrittleness: number; // 6% of total (15% of PIS × 40%) - adjusted to make 40% total
  };
  feasibilityBand: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  recommendation: string;
}

interface TFASectionScores {
  systemEnvironment: number;
  dataQuality: number;
  integrationFeasibility: number;
  securityCompliance: number;
}

export function calculateReadinessRubric(
  tfaScore: number,
  tfaSectionScores: TFASectionScores,
  aggregatedPIS: AggregatedPISScores
): ReadinessRubricScore {
  // PIS operational score (average of 3 components)
  // Weights within PIS: Process Clarity 20%, Change Magnitude 20%, Workflow Brittleness 15%
  // Normalized to 100%: 20/55 = 36.4%, 20/55 = 36.4%, 15/55 = 27.2%
  const pisOperationalScore = Math.round(
    (aggregatedPIS.processClarity.average * 0.364) +
    (aggregatedPIS.changeMagnitude.average * 0.364) +
    (aggregatedPIS.workflowBrittleness.average * 0.272)
  );

  // Combined score: TFA 60% + PIS 40%
  const totalScore = Math.round((tfaScore * 0.6) + (pisOperationalScore * 0.4));

  // Component breakdown with actual weights
  const components = {
    systemEnvironment: Math.round(tfaSectionScores.systemEnvironment * 0.15), // 25% of 60%
    dataQuality: Math.round(tfaSectionScores.dataQuality * 0.18), // 30% of 60%
    integrationFeasibility: Math.round(tfaSectionScores.integrationFeasibility * 0.18), // 30% of 60%
    securityCompliance: Math.round(tfaSectionScores.securityCompliance * 0.09), // 15% of 60%
    processClarity: Math.round(aggregatedPIS.processClarity.average * 0.08), // ~20% of 40%
    changeMagnitude: Math.round(aggregatedPIS.changeMagnitude.average * 0.08), // ~20% of 40%
    workflowBrittleness: Math.round(aggregatedPIS.workflowBrittleness.average * 0.06), // ~15% of 40%
  };

  // Determine feasibility band
  let feasibilityBand: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  let recommendation: string;

  if (totalScore >= 80) {
    feasibilityBand = 'Very High';
    recommendation = 'Excellent candidate for AI automation. Strong technical foundation and operational readiness. Proceed with implementation planning.';
  } else if (totalScore >= 65) {
    feasibilityBand = 'High';
    recommendation = 'Strong candidate for AI automation. Address minor technical or operational gaps during implementation.';
  } else if (totalScore >= 50) {
    feasibilityBand = 'Moderate';
    recommendation = 'Viable for AI automation with preparation. Focus on improving low-scoring technical and operational areas before implementation.';
  } else if (totalScore >= 35) {
    feasibilityBand = 'Low';
    recommendation = 'Significant challenges exist. Consider addressing critical technical infrastructure and change management needs before automation.';
  } else {
    feasibilityBand = 'Very Low';
    recommendation = 'Not recommended for AI automation at this time. Fundamental technical or operational improvements needed first.';
  }

  return {
    totalScore,
    tfaScore,
    pisScore: pisOperationalScore,
    components,
    feasibilityBand,
    recommendation
  };
}
