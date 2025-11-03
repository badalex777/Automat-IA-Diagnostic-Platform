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
  
  // Helper function to get meaningful component description for TFA components
  function getTFAComponentInsight(componentName: string, score: number, isStrength: boolean): string[] {
    const insights: string[] = [];
    
    // Map component names to their relevant questions
    const componentQuestionMap: Record<string, number[]> = {
      systemEnvironment: [1, 2, 3, 4, 5, 6],
      dataQuality: [7, 8, 9, 10, 11],
      integrationFeasibility: [12, 13, 14, 15, 16, 17],
      securityCompliance: [18, 19, 20, 21]
    };
    
    const questionIds = componentQuestionMap[componentName] || [];
    
    // Check each question for this component
    questionIds.forEach(qId => {
      if (isKnowledgeGap(qId)) {
        // Knowledge gap found - add it to insights
        const meaning = TFA_QUESTION_MEANINGS[qId];
        insights.push(
          `Unknown ${meaning.capability} - ${meaning.knowledgeGapAction}`
        );
      } else if (tfaResponses) {
        const response = tfaResponses[qId.toString()];
        const responseScore = typeof response === 'string' ? parseInt(response, 10) : response;
        
        if (!isNaN(responseScore) && responseScore > 0) {
          const meaning = TFA_QUESTION_MEANINGS[qId];
          
          if (isStrength && responseScore >= 4) {
            // High score - use high score meaning
            insights.push(meaning.highScoreMeaning);
          } else if (!isStrength && responseScore <= 2) {
            // Low score - use low score meaning  
            insights.push(meaning.lowScoreMeaning);
          }
        }
      }
    });
    
    return insights;
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
  
  // Generate Strengths (ALL components >= 60 with meaningful descriptions)
  const strengths: string[] = [];
  
  // TFA Components - use question mappings for detailed insights
  if (componentScores.systemEnvironment >= 60) {
    const insights = getTFAComponentInsight('systemEnvironment', componentScores.systemEnvironment, true);
    if (insights.length > 0) {
      strengths.push(`System Environment (${componentScores.systemEnvironment}/100): ${insights[0]}`);
    }
  }
  
  if (componentScores.dataQuality >= 60) {
    const insights = getTFAComponentInsight('dataQuality', componentScores.dataQuality, true);
    if (insights.length > 0) {
      strengths.push(`Data Quality (${componentScores.dataQuality}/100): ${insights[0]}`);
    }
  }
  
  if (componentScores.integrationFeasibility >= 60) {
    const insights = getTFAComponentInsight('integrationFeasibility', componentScores.integrationFeasibility, true);
    if (insights.length > 0) {
      strengths.push(`Integration Feasibility (${componentScores.integrationFeasibility}/100): ${insights[0]}`);
    }
  }
  
  if (componentScores.securityCompliance >= 60) {
    const insights = getTFAComponentInsight('securityCompliance', componentScores.securityCompliance, true);
    if (insights.length > 0) {
      strengths.push(`Security & Compliance (${componentScores.securityCompliance}/100): ${insights[0]}`);
    }
  }
  
  // PIF Components - operational strengths
  if (componentScores.processClarity >= 60) {
    strengths.push(
      `Process Clarity (${componentScores.processClarity}/100): Well-documented workflow with minimal variation enables accurate automation design and reduces implementation risk`
    );
  }
  
  if (componentScores.changeMagnitude >= 60) {
    strengths.push(
      `Change Readiness (${componentScores.changeMagnitude}/100): Strong organizational readiness for AI adoption minimizes disruption and accelerates user acceptance`
    );
  }
  
  if (componentScores.workflowBrittleness >= 60) {
    strengths.push(
      `Process Stability (${componentScores.workflowBrittleness}/100): Standardized workflow with low variability supports reliable automated execution`
    );
  }
  
  // Ensure minimum insights
  if (strengths.length === 0) {
    strengths.push(
      `Assessment completed with ${pifResponses.length} respondent${pifResponses.length > 1 ? 's' : ''}, establishing baseline for improvement planning and implementation strategy`
    );
  }
  
  // Generate Weaknesses (ALL components < 60 + TFA knowledge gaps)
  const weaknesses: string[] = [];
  
  // TFA Components - include gaps and knowledge gaps
  if (componentScores.systemEnvironment < 60) {
    const insights = getTFAComponentInsight('systemEnvironment', componentScores.systemEnvironment, false);
    if (insights.length > 0) {
      insights.forEach(insight => {
        weaknesses.push(`System Environment (${componentScores.systemEnvironment}/100): ${insight}`);
      });
    } else {
      weaknesses.push(
        `System Environment (${componentScores.systemEnvironment}/100): Infrastructure limitations require assessment and potential modernization before AI deployment`
      );
    }
  }
  
  if (componentScores.dataQuality < 60) {
    const insights = getTFAComponentInsight('dataQuality', componentScores.dataQuality, false);
    if (insights.length > 0) {
      insights.forEach(insight => {
        weaknesses.push(`Data Quality (${componentScores.dataQuality}/100): ${insight}`);
      });
    } else {
      weaknesses.push(
        `Data Quality (${componentScores.dataQuality}/100): Data standardization and cleanup initiatives needed to support reliable AI decision-making`
      );
    }
  }
  
  if (componentScores.integrationFeasibility < 60) {
    const insights = getTFAComponentInsight('integrationFeasibility', componentScores.integrationFeasibility, false);
    if (insights.length > 0) {
      insights.forEach(insight => {
        weaknesses.push(`Integration Feasibility (${componentScores.integrationFeasibility}/100): ${insight}`);
      });
    } else {
      weaknesses.push(
        `Integration Feasibility (${componentScores.integrationFeasibility}/100): Integration complexity requires architectural planning and potential middleware development`
      );
    }
  }
  
  if (componentScores.securityCompliance < 60) {
    const insights = getTFAComponentInsight('securityCompliance', componentScores.securityCompliance, false);
    if (insights.length > 0) {
      insights.forEach(insight => {
        weaknesses.push(`Security & Compliance (${componentScores.securityCompliance}/100): ${insight}`);
      });
    } else {
      weaknesses.push(
        `Security & Compliance (${componentScores.securityCompliance}/100): Governance framework requires strengthening to meet AI implementation requirements`
      );
    }
  }
  
  // PIF Components - operational weaknesses
  if (componentScores.processClarity < 60) {
    weaknesses.push(
      `Process Clarity (${componentScores.processClarity}/100): Limited documentation creates knowledge gaps that complicate automation design and increase implementation timeline`
    );
  }
  
  if (componentScores.changeMagnitude < 60) {
    weaknesses.push(
      `Change Readiness (${componentScores.changeMagnitude}/100): Change management challenges risk user resistance and require comprehensive stakeholder engagement strategy`
    );
  }
  
  if (componentScores.workflowBrittleness < 60) {
    weaknesses.push(
      `Process Stability (${componentScores.workflowBrittleness}/100): High process variability requires standardization initiatives before reliable automation deployment`
    );
  }
  
  // Ensure minimum insights
  if (weaknesses.length === 0) {
    weaknesses.push(
      `All component scores exceed 60/100 threshold, though targeted improvements in 50-60 range components will optimize implementation success`
    );
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
  
  // Ensure minimum insights
  if (opportunities.length === 0) {
    opportunities.push(
      `Early-stage assessment provides opportunity to develop comprehensive automation roadmap aligned with business priorities and technical capabilities`
    );
  }
  
  // Generate Threats (implementation risks + TFA knowledge gaps as uncertainty risks)
  const threats: string[] = [];
  
  // Critical low scores create implementation risks
  if (componentScores.systemEnvironment < 40) {
    threats.push(
      `System Environment (${componentScores.systemEnvironment}/100): Critical infrastructure limitations threaten project timeline and budget; foundation modernization required before automation deployment`
    );
  }
  
  if (componentScores.dataQuality < 40) {
    threats.push(
      `Data Quality (${componentScores.dataQuality}/100): Severe data issues risk automation accuracy and reliability; comprehensive data cleanup initiatives must precede AI implementation`
    );
  }
  
  if (componentScores.integrationFeasibility < 40) {
    threats.push(
      `Integration Feasibility (${componentScores.integrationFeasibility}/100): Integration complexity threatens implementation timeline and cost; architectural planning and middleware development required`
    );
  }
  
  if (componentScores.securityCompliance < 40) {
    threats.push(
      `Security & Compliance (${componentScores.securityCompliance}/100): Regulatory gaps create deployment blockers; comprehensive governance framework needed before vendor selection`
    );
  }
  
  if (componentScores.changeMagnitude < 40) {
    threats.push(
      `Change Readiness (${componentScores.changeMagnitude}/100): Low organizational readiness risks user resistance and adoption failure; comprehensive change management program essential`
    );
  }
  
  if (componentScores.workflowBrittleness < 40) {
    threats.push(
      `Process Stability (${componentScores.workflowBrittleness}/100): Severe process variability threatens automation reliability; standardization initiatives must precede deployment to avoid multiplying inconsistencies`
    );
  }
  
  if (componentScores.processClarity < 40) {
    threats.push(
      `Process Clarity (${componentScores.processClarity}/100): Critical documentation gaps increase implementation risk; comprehensive process mapping required before automation design`
    );
  }
  
  // Add TFA knowledge gaps as uncertainty threats
  const knowledgeGapThreats: string[] = [];
  for (let qId = 1; qId <= 21; qId++) {
    if (isKnowledgeGap(qId)) {
      const meaning = TFA_QUESTION_MEANINGS[qId];
      knowledgeGapThreats.push(
        `Unknown ${meaning.capability} creates implementation uncertainty - ${meaning.knowledgeGapAction}`
      );
    }
  }
  threats.push(...knowledgeGapThreats);
  
  // Stakeholder coverage risks
  if (pifResponses.length < 2 && totalEmployees > 5) {
    threats.push(
      `Limited stakeholder participation (${pifResponses.length} respondent${pifResponses.length > 1 ? 's' : ''} from ${totalEmployees}+ employees) risks missing critical process insights that could derail implementation`
    );
  }
  
  // Overall readiness risks
  if (totalScore < 35) {
    threats.push(
      `Critical overall readiness gap (${totalScore}/100): Premature automation deployment would likely fail; prioritize foundational improvements and reassess in 6-12 months`
    );
  } else if (totalScore < 50) {
    threats.push(
      `Moderate readiness challenges require structured preparation phase before pilot initiation to mitigate implementation risks`
    );
  }
  
  // Ensure minimum insights
  if (threats.length === 0) {
    threats.push(
      `Standard implementation risks apply: maintain proactive stakeholder engagement, monitor scope creep, and validate assumptions as automation design evolves`
    );
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
