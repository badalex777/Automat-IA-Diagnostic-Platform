// PIF Aggregation and Variance Calculations
import type { PIFResponse } from "./schema";

// TFA Question Meaning Mapping for SWOT Analysis
// Maps each TFA question to business-friendly descriptions for client-facing reports
export const TFA_QUESTION_MEANINGS: Record<number, {
  capability: string;
  highScoreMeaning: string;
  lowScoreMeaning: string;
  knowledgeGapAction: string;
}> = {
  // System Environment
  1: {
    capability: "cloud infrastructure and deployment model",
    highScoreMeaning: "Modern cloud-based systems enable flexible AI deployment with minimal infrastructure investment",
    lowScoreMeaning: "Legacy on-premises infrastructure requires modernization or hybrid integration layer before AI deployment",
    knowledgeGapAction: "Conduct IT infrastructure assessment to document deployment architecture and cloud migration roadmap"
  },
  2: {
    capability: "API availability and system connectivity",
    highScoreMeaning: "Comprehensive modern APIs enable seamless AI integration with real-time data exchange",
    lowScoreMeaning: "Limited or absent APIs require custom integration middleware or RPA workarounds, increasing implementation complexity",
    knowledgeGapAction: "Request technical documentation from IT/vendors to identify available API endpoints and integration options"
  },
  3: {
    capability: "programmatic system access for automation",
    highScoreMeaning: "Native automation support with service accounts and SDKs enables reliable unattended AI processing",
    lowScoreMeaning: "UI-only access requires RPA screen automation, creating brittleness and maintenance overhead",
    knowledgeGapAction: "Engage IT team to verify service account capabilities and programmatic access methods"
  },
  4: {
    capability: "system performance and reliability",
    highScoreMeaning: "Sub-second response times and high uptime ensure AI automation meets business SLAs",
    lowScoreMeaning: "Frequent timeouts and system instability threaten automation reliability and require infrastructure improvements",
    knowledgeGapAction: "Review system monitoring dashboards with IT to establish baseline performance metrics"
  },
  5: {
    capability: "monitoring and observability infrastructure",
    highScoreMeaning: "Real-time monitoring with automated alerts enables proactive AI performance management and rapid issue resolution",
    lowScoreMeaning: "Lack of monitoring visibility hampers troubleshooting and limits ability to track automation ROI",
    knowledgeGapAction: "Audit existing monitoring tools with IT team to determine logging and alerting capabilities"
  },
  6: {
    capability: "backup and disaster recovery capabilities",
    highScoreMeaning: "Enterprise disaster recovery with automated failover protects AI automation from data loss and downtime",
    lowScoreMeaning: "Inadequate backup systems create risk of catastrophic automation failures without recovery options",
    knowledgeGapAction: "Review disaster recovery documentation with IT to understand RTO/RPO commitments"
  },
  
  // Data Quality
  7: {
    capability: "data structure and format consistency",
    highScoreMeaning: "Fully structured data with standardized schemas enables accurate AI model training with minimal preprocessing",
    lowScoreMeaning: "Unstructured or inconsistent data formats require significant data engineering and increase AI error rates",
    knowledgeGapAction: "Conduct data sampling exercise to document actual data formats and structure variations"
  },
  8: {
    capability: "data accuracy and completeness",
    highScoreMeaning: "High-quality validated data reduces AI training requirements and ensures reliable automated decisions",
    lowScoreMeaning: "Frequent errors and missing fields necessitate data cleanup initiatives before AI implementation can succeed",
    knowledgeGapAction: "Perform data quality audit to quantify error rates and identify root causes of data issues"
  },
  9: {
    capability: "historical data availability for training",
    highScoreMeaning: "Extensive historical records provide rich training examples, enabling sophisticated AI pattern recognition",
    lowScoreMeaning: "Insufficient training data limits AI capabilities or requires synthetic data generation approaches",
    knowledgeGapAction: "Query databases with IT support to determine actual record counts and historical data depth"
  },
  10: {
    capability: "data consistency across sources and time",
    highScoreMeaning: "Single source of truth with enforced standards enables confident AI deployment across data sources",
    lowScoreMeaning: "Conflicting data formats across systems require complex mapping logic and ongoing maintenance",
    knowledgeGapAction: "Map data flows between systems to document format variations and transformation requirements"
  },
  11: {
    capability: "data validation and error handling",
    highScoreMeaning: "Robust validation framework with automated correction reduces manual exception handling in AI workflows",
    lowScoreMeaning: "Lack of validation rules allows bad data to propagate through automation, causing downstream failures",
    knowledgeGapAction: "Review existing validation logic with development team to identify gaps in error handling"
  },
  
  // Integration Feasibility
  12: {
    capability: "number of systems requiring integration",
    highScoreMeaning: "Simple integration landscape with few touchpoints reduces implementation complexity and accelerates deployment",
    lowScoreMeaning: "Complex multi-system integration requires orchestration layer and increases points of failure",
    knowledgeGapAction: "Create system integration map to document all touchpoints and data flows in the workflow"
  },
  13: {
    capability: "compatibility with integration platforms",
    highScoreMeaning: "Native integration support enables rapid deployment using low-code platforms like Zapier or Make",
    lowScoreMeaning: "Proprietary systems with no connectors necessitate custom middleware development and ongoing maintenance",
    knowledgeGapAction: "Check vendor documentation and integration marketplaces to identify available connectors"
  },
  14: {
    capability: "authentication complexity",
    highScoreMeaning: "Simple API key authentication enables straightforward automation setup with minimal security overhead",
    lowScoreMeaning: "Complex multi-factor authentication schemes complicate unattended automation and may require architectural workarounds",
    knowledgeGapAction: "Consult security team to understand authentication requirements and available service account options"
  },
  15: {
    capability: "API rate limits and throughput capacity",
    highScoreMeaning: "Generous API limits support high-volume automation without throttling concerns",
    lowScoreMeaning: "Strict rate limits constrain automation throughput and may require batch processing or caching strategies",
    knowledgeGapAction: "Review vendor SLAs and API documentation to confirm rate limit tiers and upgrade options"
  },
  16: {
    capability: "error handling and retry mechanisms",
    highScoreMeaning: "Advanced error handling with circuit breakers ensures graceful degradation and automatic recovery",
    lowScoreMeaning: "Absence of retry logic causes automation failures to propagate, requiring manual intervention",
    knowledgeGapAction: "Review integration architecture with technical team to document current error handling patterns"
  },
  17: {
    capability: "API stability and version management",
    highScoreMeaning: "Enterprise-grade API stability with long deprecation cycles minimizes automation maintenance burden",
    lowScoreMeaning: "Frequent breaking changes create ongoing maintenance overhead and automation fragility",
    knowledgeGapAction: "Review vendor API changelog and roadmap to assess historical stability and versioning practices"
  },
  
  // Security/Compliance
  18: {
    capability: "data sensitivity classification",
    highScoreMeaning: "Non-sensitive data reduces compliance requirements and accelerates AI vendor selection",
    lowScoreMeaning: "Highly regulated data (PHI, PCI, PII) requires stringent vendor vetting and limits AI solution options",
    knowledgeGapAction: "Engage compliance team to formally classify data sensitivity and applicable regulations"
  },
  19: {
    capability: "regulatory compliance requirements",
    highScoreMeaning: "Minimal compliance overhead allows flexible AI vendor selection and rapid implementation",
    lowScoreMeaning: "Strict regulatory requirements (HIPAA, SOC 2, PCI-DSS) necessitate specialized vendors and extensive auditing",
    knowledgeGapAction: "Review compliance obligations with legal/InfoSec to document specific AI governance requirements"
  },
  20: {
    capability: "security approval timeline",
    highScoreMeaning: "Rapid security approval process enables agile AI vendor selection and quick implementation cycles",
    lowScoreMeaning: "Lengthy security reviews create extended timelines and may require early vendor engagement",
    knowledgeGapAction: "Meet with InfoSec team to understand approval process and identify opportunities for pre-approval"
  },
  21: {
    capability: "data retention and archival policies",
    highScoreMeaning: "Flexible retention policies simplify AI solution design and reduce storage complexity",
    lowScoreMeaning: "Complex long-term retention mandates require specialized archival solutions and increase infrastructure costs",
    knowledgeGapAction: "Review retention policies with legal/compliance to document exact requirements and their AI implications"
  }
};

// SWOT Analysis Types
export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  executiveSummary: string;
  internalMetrics: {
    estimatedAnnualHours: number;
    estimatedFTESaved: number;
    errorReductionPotential: number;
    volumeContext: string;
  };
}

export interface AggregatedPIFScores {
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

export function calculateAggregatedPIFScores(responses: PIFResponse[]): AggregatedPIFScores {
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

// Calculate combined Readiness Rubric score (TFA 60% + PIF 40%)
export interface ReadinessRubricScore {
  totalScore: number;
  tfaScore: number;
  pifScore: number;
  componentScores: {
    // Raw 0-100 scores for each component
    systemEnvironment: number;
    dataQuality: number;
    integrationFeasibility: number;
    securityCompliance: number;
    processClarity: number;
    changeMagnitude: number;
    workflowBrittleness: number;
  };
  components: {
    // Weighted contributions to total score (for calculation verification)
    // TFA components (60% total)
    systemEnvironment: number; // 15% of total (25% of TFA × 60%)
    dataQuality: number; // 18% of total (30% of TFA × 60%)
    integrationFeasibility: number; // 18% of total (30% of TFA × 60%)
    securityCompliance: number; // 9% of total (15% of TFA × 60%)
    // PIF components (40% total)
    processClarity: number; // 15% of total
    changeMagnitude: number; // 15% of total
    workflowBrittleness: number; // 10% of total
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
  aggregatedPIF: AggregatedPIFScores
): ReadinessRubricScore {
  // PIF operational score (weighted average of 3 components)
  // Weights within PIF: Process Clarity 15%, Change Magnitude 15%, Workflow Brittleness 10% (of 40% total)
  // Normalized to 100%: 15/40 = 37.5%, 15/40 = 37.5%, 10/40 = 25%
  const pifOperationalScore = Math.round(
    (aggregatedPIF.processClarity.average * 0.375) +
    (aggregatedPIF.changeMagnitude.average * 0.375) +
    (aggregatedPIF.workflowBrittleness.average * 0.25)
  );

  // Combined score: TFA 60% + PIF 40%
  const totalScore = Math.round((tfaScore * 0.6) + (pifOperationalScore * 0.4));

  // Raw component scores (0-100)
  const componentScores = {
    systemEnvironment: tfaSectionScores.systemEnvironment,
    dataQuality: tfaSectionScores.dataQuality,
    integrationFeasibility: tfaSectionScores.integrationFeasibility,
    securityCompliance: tfaSectionScores.securityCompliance,
    processClarity: Math.round(aggregatedPIF.processClarity.average),
    changeMagnitude: Math.round(aggregatedPIF.changeMagnitude.average),
    workflowBrittleness: Math.round(aggregatedPIF.workflowBrittleness.average),
  };

  // Component breakdown with actual weights (for verification)
  const components = {
    systemEnvironment: Math.round(tfaSectionScores.systemEnvironment * 0.15), // 25% of 60% = 15%
    dataQuality: Math.round(tfaSectionScores.dataQuality * 0.18), // 30% of 60% = 18%
    integrationFeasibility: Math.round(tfaSectionScores.integrationFeasibility * 0.18), // 30% of 60% = 18%
    securityCompliance: Math.round(tfaSectionScores.securityCompliance * 0.09), // 15% of 60% = 9%
    processClarity: Math.round(aggregatedPIF.processClarity.average * 0.15), // 15% of total
    changeMagnitude: Math.round(aggregatedPIF.changeMagnitude.average * 0.15), // 15% of total
    workflowBrittleness: Math.round(aggregatedPIF.workflowBrittleness.average * 0.10), // 10% of total
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
    pifScore: pifOperationalScore,
    componentScores,
    components,
    feasibilityBand,
    recommendation
  };
}

// Generate data-driven SWOT analysis with internal time/FTE calculations
export function generateSWOTAnalysis(
  readinessScore: ReadinessRubricScore,
  pifResponses: PIFResponse[],
  tfaSectionScores: TFASectionScores,
  tfaResponses?: Record<string, string | number> | null
): SWOTAnalysis {
  const { componentScores, totalScore, feasibilityBand } = readinessScore;
  
  // Helper function to detect TFA knowledge gaps
  function isKnowledgeGap(questionId: number): boolean {
    if (!tfaResponses) return false;
    const response = tfaResponses[questionId.toString()];
    return response === "0" || response === 0;
  }
  
  // Component metadata for consistent labeling
  const componentMeta = {
    systemEnvironment: { label: 'System Environment', tfaQuestions: [1, 2, 3, 4, 5, 6] },
    dataQuality: { label: 'Data Quality', tfaQuestions: [7, 8, 9, 10, 11] },
    integrationFeasibility: { label: 'Integration Feasibility', tfaQuestions: [12, 13, 14, 15, 16, 17] },
    securityCompliance: { label: 'Security & Compliance', tfaQuestions: [18, 19, 20, 21] },
    processClarity: { label: 'Process Clarity', tfaQuestions: [] },
    changeMagnitude: { label: 'Change Readiness', tfaQuestions: [] },
    workflowBrittleness: { label: 'Process Stability', tfaQuestions: [] }
  };
  
  // Helper to get TFA component insights with knowledge gaps
  function getTFAComponentDescriptions(
    componentName: 'systemEnvironment' | 'dataQuality' | 'integrationFeasibility' | 'securityCompliance',
    score: number
  ): { strengths: string[], weaknesses: string[], knowledgeGaps: string[] } {
    const meta = componentMeta[componentName];
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const knowledgeGaps: string[] = [];
    
    // Check each question in this component
    meta.tfaQuestions.forEach(qId => {
      if (isKnowledgeGap(qId)) {
        // Knowledge gap found
        const meaning = TFA_QUESTION_MEANINGS[qId];
        knowledgeGaps.push(`Unknown ${meaning.capability} - ${meaning.knowledgeGapAction}`);
      } else if (tfaResponses) {
        const response = tfaResponses[qId.toString()];
        const responseScore = typeof response === 'string' ? parseInt(response, 10) : response;
        
        if (!isNaN(responseScore) && responseScore > 0) {
          const meaning = TFA_QUESTION_MEANINGS[qId];
          
          if (responseScore >= 4) {
            strengths.push(meaning.highScoreMeaning);
          } else if (responseScore <= 2) {
            weaknesses.push(meaning.lowScoreMeaning);
          }
        }
      }
    });
    
    return { strengths, weaknesses, knowledgeGaps };
  }
  
  // Calculate internal metrics from PIF ROI data
  let totalAnnualHours = 0;
  let totalEmployees = 0;
  let weightedErrorRate = 0;
  let volumeDescriptions: string[] = [];
  
  pifResponses.forEach(response => {
    if (response.roiInputs && typeof response.roiInputs === 'object') {
      const roi = response.roiInputs as any;
      
      if (roi.employeeCount && roi.minutesPerProcess && roi.processesPerPeriod && roi.frequency) {
        const employees = Number(roi.employeeCount) || 0;
        const minutesPerProcess = Number(roi.minutesPerProcess) || 0;
        const processesPerPeriod = Number(roi.processesPerPeriod) || 0;
        
        // Convert frequency to annual multiplier
        let annualMultiplier = 1;
        if (roi.frequency === 'daily') annualMultiplier = 250; // Working days
        else if (roi.frequency === 'weekly') annualMultiplier = 52;
        else if (roi.frequency === 'monthly') annualMultiplier = 12;
        
        const annualProcesses = processesPerPeriod * annualMultiplier;
        const annualHours = (minutesPerProcess * annualProcesses * employees) / 60;
        totalAnnualHours += annualHours;
        totalEmployees += employees;
        
        // Track error rates
        if (roi.hasQualityImpact && roi.errorRate) {
          weightedErrorRate += Number(roi.errorRate) || 0;
        }
        
        // Build volume context
        volumeDescriptions.push(
          `${roi.frequency} process with ${processesPerPeriod} execution${processesPerPeriod > 1 ? 's' : ''} involving ${employees} employee${employees > 1 ? 's' : ''}`
        );
      }
    }
  });
  
  const estimatedFTE = totalAnnualHours / 2080; // Standard work year
  const avgErrorRate = pifResponses.length > 0 ? weightedErrorRate / pifResponses.length : 0;
  const volumeContext = volumeDescriptions.length > 0 
    ? volumeDescriptions.join('; ') 
    : 'Process volume data not fully captured';
  
  // Generate Executive Summary
  const executiveSummary = generateExecutiveSummary(
    totalScore,
    feasibilityBand,
    estimatedFTE,
    componentScores
  );
  
  // STRENGTHS: Iterate ALL components, include those >= 60
  const strengths: string[] = [];
  
  // TFA Components
  const tfaComponents: Array<'systemEnvironment' | 'dataQuality' | 'integrationFeasibility' | 'securityCompliance'> = [
    'systemEnvironment', 'dataQuality', 'integrationFeasibility', 'securityCompliance'
  ];
  
  tfaComponents.forEach(componentName => {
    const score = componentScores[componentName];
    const meta = componentMeta[componentName];
    
    if (score >= 60) {
      const descriptions = getTFAComponentDescriptions(componentName, score);
      
      if (descriptions.strengths.length > 0) {
        // Use first specific insight from high-scoring questions
        strengths.push(`${meta.label} (${score}/100): ${descriptions.strengths[0]}`);
      } else {
        // Fallback: generic strength statement based on score range
        const fallbackMsg = score >= 75 
          ? 'Strong capability foundation supports confident AI implementation'
          : 'Solid capability baseline enables structured automation approach';
        strengths.push(`${meta.label} (${score}/100): ${fallbackMsg}`);
      }
    }
  });
  
  // PIF Components
  if (componentScores.processClarity >= 60) {
    strengths.push(
      `${componentMeta.processClarity.label} (${componentScores.processClarity}/100): Well-documented workflow with minimal variation enables accurate automation design and reduces implementation risk`
    );
  }
  
  if (componentScores.changeMagnitude >= 60) {
    strengths.push(
      `${componentMeta.changeMagnitude.label} (${componentScores.changeMagnitude}/100): Strong organizational readiness for AI adoption minimizes disruption and accelerates user acceptance`
    );
  }
  
  if (componentScores.workflowBrittleness >= 60) {
    strengths.push(
      `${componentMeta.workflowBrittleness.label} (${componentScores.workflowBrittleness}/100): Standardized workflow with low variability supports reliable automated execution`
    );
  }
  
  // Enforce minimum 3 insights - add targeted fallbacks
  while (strengths.length < 3) {
    if (strengths.length === 0) {
      strengths.push(
        `Assessment completed with ${pifResponses.length} respondent${pifResponses.length > 1 ? 's' : ''}, establishing baseline for improvement planning and implementation strategy`
      );
    } else if (strengths.length === 1) {
      strengths.push(
        `Diagnostic findings provide data-driven foundation for solution scoping and vendor selection process`
      );
    } else {
      strengths.push(
        `Stakeholder engagement during assessment phase builds organizational alignment for successful implementation`
      );
    }
  }
  
  // WEAKNESSES: Iterate ALL components, include those < 60 AND knowledge gaps
  const weaknesses: string[] = [];
  
  // TFA Components - systematically check each
  tfaComponents.forEach(componentName => {
    const score = componentScores[componentName];
    const meta = componentMeta[componentName];
    const descriptions = getTFAComponentDescriptions(componentName, score);
    
    // Add knowledge gaps FIRST (these are critical weaknesses regardless of score)
    descriptions.knowledgeGaps.forEach(gap => {
      weaknesses.push(`${meta.label} (${score}/100): ${gap}`);
    });
    
    // Then add score-based weaknesses if < 60
    if (score < 60) {
      if (descriptions.weaknesses.length > 0) {
        // Use first specific weakness from low-scoring questions
        weaknesses.push(`${meta.label} (${score}/100): ${descriptions.weaknesses[0]}`);
      } else if (descriptions.knowledgeGaps.length === 0) {
        // Fallback: generic weakness if no specific insights and no knowledge gaps
        const fallbackMsg = score < 40
          ? 'Critical capability gap requires foundation-building before AI implementation'
          : 'Moderate capability limitations necessitate targeted improvements during preparation phase';
        weaknesses.push(`${meta.label} (${score}/100): ${fallbackMsg}`);
      }
    }
  });
  
  // PIF Components - operational weaknesses
  if (componentScores.processClarity < 60) {
    weaknesses.push(
      `${componentMeta.processClarity.label} (${componentScores.processClarity}/100): Limited documentation creates knowledge gaps that complicate automation design and increase implementation timeline`
    );
  }
  
  if (componentScores.changeMagnitude < 60) {
    weaknesses.push(
      `${componentMeta.changeMagnitude.label} (${componentScores.changeMagnitude}/100): Change management challenges risk user resistance and require comprehensive stakeholder engagement strategy`
    );
  }
  
  if (componentScores.workflowBrittleness < 60) {
    weaknesses.push(
      `${componentMeta.workflowBrittleness.label} (${componentScores.workflowBrittleness}/100): High process variability requires standardization initiatives before reliable automation deployment`
    );
  }
  
  // Enforce minimum 3 insights - add targeted fallbacks
  while (weaknesses.length < 3) {
    if (weaknesses.length === 0) {
      weaknesses.push(
        `All component scores exceed 60/100 threshold, establishing strong foundation for implementation`
      );
    } else if (weaknesses.length === 1) {
      weaknesses.push(
        `Targeted improvements in moderate-scoring components (50-60 range) will optimize implementation timeline and reduce risk`
      );
    } else {
      weaknesses.push(
        `Continuous monitoring during implementation will identify emerging challenges early for proactive mitigation`
      );
    }
  }
  
  // Generate Opportunities (directional business impact - no ROI calculations)
  const opportunities: string[] = [];
  
  // Business impact potential from high-scoring foundations
  const strongComponents = [];
  if (componentScores.dataQuality >= 60) strongComponents.push('data quality');
  if (componentScores.processClarity >= 60) strongComponents.push('process documentation');
  if (componentScores.integrationFeasibility >= 60) strongComponents.push('integration readiness');
  if (componentScores.systemEnvironment >= 60) strongComponents.push('technical infrastructure');
  
  if (strongComponents.length >= 2) {
    opportunities.push(
      `Strong ${strongComponents.slice(0, 2).join(' and ')} foundations enable confident phased AI implementation, starting with high-value use cases and expanding progressively`
    );
  }
  
  // Capacity release potential (directional only)
  if (estimatedFTE >= 0.5) {
    opportunities.push(
      `Substantial capacity release potential through automation enables team reallocation to higher-value strategic initiatives and growth activities`
    );
  } else if (estimatedFTE >= 0.2) {
    opportunities.push(
      `Meaningful efficiency gains available through automation, supporting operational optimization goals`
    );
  }
  
  // Quality improvement potential
  if (avgErrorRate > 5) {
    opportunities.push(
      `Significant quality improvement opportunity through AI-driven consistency and validation, reducing rework cycles and enhancing operational reliability`
    );
  } else if (avgErrorRate > 0) {
    opportunities.push(
      `Error reduction potential through automated validation supports quality and compliance objectives`
    );
  }
  
  // Frequency/volume advantages (directional)
  if (volumeDescriptions.length > 0) {
    if (volumeContext.includes('daily')) {
      opportunities.push(
        `High-frequency daily process enables rapid ROI accumulation with efficiency gains compounding to substantial annual business impact`
      );
    } else if (volumeContext.includes('weekly')) {
      opportunities.push(
        `Regular weekly cadence provides consistent automation value and measurable performance tracking`
      );
    }
  }
  
  // Readiness-based timing opportunities
  if (totalScore >= 65) {
    opportunities.push(
      `Strong overall readiness supports immediate pilot program initiation, generating early wins and building stakeholder confidence for broader rollout`
    );
  } else if (totalScore >= 50) {
    opportunities.push(
      `Moderate readiness enables targeted pilot program within current quarter after addressing specific preparatory items`
    );
  } else if (totalScore >= 35) {
    opportunities.push(
      `Foundation-building phase presents opportunity to establish AI governance best practices that will benefit future automation initiatives across the organization`
    );
  }
  
  // Enforce minimum 3 insights - add context-specific opportunities
  while (opportunities.length < 3) {
    if (opportunities.length === 0) {
      opportunities.push(
        `Early-stage assessment provides opportunity to develop comprehensive automation roadmap aligned with business priorities and technical capabilities`
      );
    } else if (opportunities.length === 1) {
      opportunities.push(
        `Structured preparation phase enables proactive risk mitigation and stakeholder alignment before implementation`
      );
    } else {
      opportunities.push(
        `Diagnostic insights support data-driven decision-making for solution selection and vendor evaluation`
      );
    }
  }
  
  // THREATS: Implementation risks from low scores + knowledge gaps as uncertainty
  const threats: string[] = [];
  
  // TFA Components - systematically check for critical risks (<40) AND knowledge gaps
  tfaComponents.forEach(componentName => {
    const score = componentScores[componentName];
    const meta = componentMeta[componentName];
    const descriptions = getTFAComponentDescriptions(componentName, score);
    
    // Add knowledge gaps as uncertainty threats (regardless of score)
    descriptions.knowledgeGaps.forEach(gap => {
      threats.push(`${meta.label}: ${gap}`);
    });
    
    // Add critical score-based threats (<40)
    if (score < 40) {
      threats.push(
        `${meta.label} (${score}/100): Critical capability gaps threaten implementation timeline and success; comprehensive foundation-building required before automation deployment`
      );
    }
  });
  
  // PIF Components - critical operational risks (<40)
  if (componentScores.processClarity < 40) {
    threats.push(
      `${componentMeta.processClarity.label} (${componentScores.processClarity}/100): Severe documentation gaps increase implementation risk and cost; comprehensive process mapping essential before design phase`
    );
  }
  
  if (componentScores.changeMagnitude < 40) {
    threats.push(
      `${componentMeta.changeMagnitude.label} (${componentScores.changeMagnitude}/100): Low organizational readiness risks user resistance and adoption failure; intensive change management program required`
    );
  }
  
  if (componentScores.workflowBrittleness < 40) {
    threats.push(
      `${componentMeta.workflowBrittleness.label} (${componentScores.workflowBrittleness}/100): Severe process variability threatens automation reliability; standardization must precede deployment to avoid multiplying inconsistencies`
    );
  }
  
  // Stakeholder coverage risks
  if (pifResponses.length < 2 && totalEmployees > 5) {
    threats.push(
      `Limited stakeholder input (${pifResponses.length} respondent${pifResponses.length > 1 ? 's' : ''} from ${totalEmployees}+ employees) risks missing critical process nuances that could derail implementation`
    );
  }
  
  // Overall readiness risks
  if (totalScore < 35) {
    threats.push(
      `Critical overall readiness gap (${totalScore}/100): Premature automation would likely fail; prioritize foundational improvements and reassess readiness in 6-12 months`
    );
  } else if (totalScore < 50) {
    threats.push(
      `Moderate readiness challenges require structured preparation phase before pilot initiation to mitigate implementation risks and ensure success`
    );
  }
  
  // Enforce minimum 3 insights - add standard risks if needed
  while (threats.length < 3) {
    if (threats.length === 0) {
      threats.push(
        `Standard implementation risks apply: maintain proactive stakeholder engagement and validate assumptions as design evolves`
      );
    } else if (threats.length === 1) {
      threats.push(
        `Monitor scope creep during solution design to prevent budget overruns and timeline delays`
      );
    } else {
      threats.push(
        `Ensure adequate training and support resources are allocated to minimize user adoption friction`
      );
    }
  }
  
  return {
    strengths,
    weaknesses,
    opportunities,
    threats,
    executiveSummary,
    internalMetrics: {
      estimatedAnnualHours: Math.round(totalAnnualHours),
      estimatedFTESaved: Math.round(estimatedFTE * 10) / 10,
      errorReductionPotential: Math.round(avgErrorRate),
      volumeContext
    }
  };
}

// Aggregate all step-level executive summaries into workflow-level strategic overview
export function aggregateExecutiveSummaries(
  stepSummaries: Array<{
    stepNumber: number;
    stepName: string;
    summary: string;
    readinessScore: number;
    feasibilityBand: string;
  }>
): string {
  if (stepSummaries.length === 0) {
    return 'No step assessments available for workflow-level analysis.';
  }
  
  // Calculate overall workflow readiness
  const avgReadiness = Math.round(
    stepSummaries.reduce((sum, step) => sum + step.readinessScore, 0) / stepSummaries.length
  );
  
  // Determine overall workflow feasibility band
  let workflowBand: string;
  if (avgReadiness >= 75) {
    workflowBand = 'Very High';
  } else if (avgReadiness >= 65) {
    workflowBand = 'High';
  } else if (avgReadiness >= 50) {
    workflowBand = 'Moderate';
  } else if (avgReadiness >= 35) {
    workflowBand = 'Low';
  } else {
    workflowBand = 'Very Low';
  }
  
  // Identify step readiness patterns
  const highSteps = stepSummaries.filter(s => s.readinessScore >= 65).map(s => s.stepName);
  const lowSteps = stepSummaries.filter(s => s.readinessScore < 50).map(s => s.stepName);
  
  // Build cohesive narrative
  let narrative = `Workflow assessment encompasses ${stepSummaries.length} process step${stepSummaries.length > 1 ? 's' : ''} with an overall readiness score of ${avgReadiness}/100 (${workflowBand} feasibility). `;
  
  if (avgReadiness >= 65) {
    narrative += `The workflow demonstrates strong automation readiness across ${highSteps.length > 0 ? highSteps.length : 'multiple'} step${highSteps.length > 1 ? 's' : ''}. `;
    
    if (lowSteps.length > 0) {
      narrative += `Targeted preparation for ${lowSteps.length} lower-scoring step${lowSteps.length > 1 ? 's' : ''} (${lowSteps.slice(0, 2).join(', ')}${lowSteps.length > 2 ? ', ...' : ''}) will optimize implementation timeline. `;
    }
    
    narrative += `Recommended approach: initiate pilot program with highest-readiness steps while concurrently addressing preparation items for remaining workflow components.`;
  } else if (avgReadiness >= 50) {
    narrative += `The workflow shows moderate readiness with preparatory work required across multiple steps. `;
    
    if (highSteps.length > 0) {
      narrative += `${highSteps.length} step${highSteps.length > 1 ? 's' : ''} demonstrate${highSteps.length === 1 ? 's' : ''} strong readiness (${highSteps.slice(0, 2).join(', ')}${highSteps.length > 2 ? ', ...' : ''}) and can anchor early implementation phases. `;
    }
    
    if (lowSteps.length > 0) {
      narrative += `${lowSteps.length} step${lowSteps.length > 1 ? 's' : ''} require${lowSteps.length === 1 ? 's' : ''} foundational improvements before automation deployment. `;
    }
    
    narrative += `Recommended approach: phased implementation beginning with higher-readiness process components while addressing infrastructure and operational gaps in lower-scoring steps.`;
  } else {
    narrative += `The workflow exhibits significant readiness challenges requiring comprehensive preparation before automation becomes viable. `;
    
    if (highSteps.length > 0) {
      narrative += `While ${highSteps.length} step${highSteps.length > 1 ? 's show' : ' shows'} relative strength (${highSteps.slice(0, 2).join(', ')}${highSteps.length > 2 ? ', ...' : ''}), `;
    } else {
      narrative += ``;
    }
    
    narrative += `critical gaps across ${lowSteps.length > 0 ? lowSteps.length : 'multiple'} step${lowSteps.length > 1 ? 's' : ''} necessitate foundation-building initiatives. Recommended approach: address infrastructure, data quality, and process maturity gaps at workflow level before revisiting automation potential in 6-12 months.`;
  }
  
  return narrative;
}

// Aggregate all step-level SWOTs into workflow-level SWOT with step attribution
export function aggregateWorkflowSWOT(
  stepSwots: Array<{
    stepNumber: number;
    stepName: string;
    swot: SWOTAnalysis;
  }>
): SWOTAnalysis {
  const aggregatedStrengths: string[] = [];
  const aggregatedWeaknesses: string[] = [];
  const aggregatedOpportunities: string[] = [];
  const aggregatedThreats: string[] = [];
  
  // Aggregate internal metrics
  let totalAnnualHours = 0;
  let totalFTE = 0;
  let totalErrorReduction = 0;
  const volumeContexts: string[] = [];
  
  // Combine all step-level insights with step attribution
  stepSwots.forEach(({ stepNumber, stepName, swot }) => {
    const stepLabel = `[Step ${stepNumber} - ${stepName}]`;
    
    // Add strengths with step attribution
    swot.strengths.forEach(strength => {
      aggregatedStrengths.push(`${stepLabel} ${strength}`);
    });
    
    // Add weaknesses with step attribution
    swot.weaknesses.forEach(weakness => {
      aggregatedWeaknesses.push(`${stepLabel} ${weakness}`);
    });
    
    // Add opportunities with step attribution
    swot.opportunities.forEach(opportunity => {
      aggregatedOpportunities.push(`${stepLabel} ${opportunity}`);
    });
    
    // Add threats with step attribution
    swot.threats.forEach(threat => {
      aggregatedThreats.push(`${stepLabel} ${threat}`);
    });
    
    // Aggregate internal metrics
    if (swot.internalMetrics) {
      totalAnnualHours += swot.internalMetrics.estimatedAnnualHours || 0;
      totalFTE += swot.internalMetrics.estimatedFTESaved || 0;
      totalErrorReduction += swot.internalMetrics.errorReductionPotential || 0;
      if (swot.internalMetrics.volumeContext && swot.internalMetrics.volumeContext !== 'Process volume data not fully captured') {
        volumeContexts.push(`${stepLabel} ${swot.internalMetrics.volumeContext}`);
      }
    }
  });
  
  // Generate workflow-level executive summary placeholder
  // (This will be replaced by aggregateExecutiveSummaries function)
  const executiveSummary = `Workflow assessment completed across ${stepSwots.length} process step${stepSwots.length > 1 ? 's' : ''}. Step-level insights aggregated below provide comprehensive view of automation readiness at granular process level.`;
  
  return {
    strengths: aggregatedStrengths,
    weaknesses: aggregatedWeaknesses,
    opportunities: aggregatedOpportunities,
    threats: aggregatedThreats,
    executiveSummary,
    internalMetrics: {
      estimatedAnnualHours: totalAnnualHours,
      estimatedFTESaved: Math.round(totalFTE * 10) / 10,
      errorReductionPotential: Math.round(totalErrorReduction / Math.max(stepSwots.length, 1)),
      volumeContext: volumeContexts.length > 0 ? volumeContexts.join('; ') : 'Process volume data aggregated from step assessments'
    }
  };
}

function generateExecutiveSummary(
  totalScore: number,
  feasibilityBand: string,
  estimatedFTE: number,
  componentScores: any
): string {
  const topStrength = Object.entries(componentScores)
    .sort((a: any, b: any) => b[1] - a[1])[0];
  
  const bottomGap = Object.entries(componentScores)
    .sort((a: any, b: any) => a[1] - b[1])[0];
  
  const strengthName = topStrength[0].replace(/([A-Z])/g, ' $1').trim().toLowerCase();
  const gapName = bottomGap[0].replace(/([A-Z])/g, ' $1').trim().toLowerCase();
  
  if (totalScore >= 65) {
    return `This process demonstrates ${feasibilityBand.toLowerCase()} readiness for AI automation with an overall score of ${totalScore}/100. The assessment reveals strong ${strengthName} capabilities supporting implementation feasibility. ${estimatedFTE >= 0.5 ? 'Significant capacity release potential justifies investment prioritization.' : 'Implementation should focus on quality and consistency improvements beyond pure efficiency gains.'} Key success factor: leveraging existing strengths while addressing ${gapName} considerations during deployment planning.`;
  } else if (totalScore >= 50) {
    return `This process shows ${feasibilityBand.toLowerCase()} readiness (${totalScore}/100) for AI automation with preparatory work required. While ${strengthName} capabilities provide a foundation, ${gapName} gaps must be addressed for successful implementation. ${estimatedFTE >= 0.3 ? 'Moderate efficiency opportunity warrants measured investment with realistic timeline expectations.' : 'Focus implementation value proposition on quality, compliance, or strategic benefits rather than pure labor savings.'} Recommended approach: phased deployment beginning with lower-risk process components.`;
  } else {
    return `This process currently exhibits ${feasibilityBand.toLowerCase()} readiness (${totalScore}/100) for AI automation. Critical gaps in ${gapName} require foundational improvements before automation becomes viable. While ${strengthName} shows relative strength, multiple components need enhancement to support reliable AI deployment. Recommended path: address infrastructure and process maturity gaps first, then reassess automation potential in 6-12 months as improvements materialize.`;
  }
}
