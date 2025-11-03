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
  tfaSectionScores: TFASectionScores
): SWOTAnalysis {
  const { componentScores, totalScore, feasibilityBand } = readinessScore;
  
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
  
  // Generate Strengths (scores >= 70)
  const strengths: string[] = [];
  
  if (componentScores.dataQuality >= 70) {
    strengths.push(
      `Strong data infrastructure with ${componentScores.dataQuality}/100 data quality score enables reliable AI model training and reduces implementation risk.`
    );
  }
  
  if (componentScores.processClarity >= 70) {
    strengths.push(
      `Process is well-documented with ${componentScores.processClarity}/100 clarity score, minimizing knowledge transfer requirements and accelerating automation design.`
    );
  }
  
  if (componentScores.integrationFeasibility >= 70) {
    strengths.push(
      `Existing systems show ${componentScores.integrationFeasibility}/100 integration readiness, allowing seamless AI solution deployment without major infrastructure changes.`
    );
  }
  
  if (componentScores.changeMagnitude >= 70) {
    strengths.push(
      `Manageable change profile (${componentScores.changeMagnitude}/100) indicates strong organizational readiness for AI adoption with minimal disruption.`
    );
  }
  
  if (strengths.length === 0) {
    strengths.push(
      `Assessment completed with ${pifResponses.length} respondent${pifResponses.length > 1 ? 's' : ''}, providing baseline insights for improvement planning.`
    );
  }
  
  // Generate Weaknesses (scores < 50)
  const weaknesses: string[] = [];
  
  if (componentScores.systemEnvironment < 50) {
    weaknesses.push(
      `System infrastructure gaps (${componentScores.systemEnvironment}/100) require modernization before AI deployment to ensure compatibility and performance.`
    );
  }
  
  if (componentScores.dataQuality < 50) {
    weaknesses.push(
      `Data quality challenges (${componentScores.dataQuality}/100) necessitate cleanup and standardization efforts to support accurate AI decision-making.`
    );
  }
  
  if (componentScores.securityCompliance < 50) {
    weaknesses.push(
      `Security and compliance framework (${componentScores.securityCompliance}/100) needs strengthening to meet AI governance requirements and protect sensitive data.`
    );
  }
  
  if (componentScores.processClarity < 50) {
    weaknesses.push(
      `Limited process documentation (${componentScores.processClarity}/100) creates knowledge gaps that increase automation complexity and implementation timeline.`
    );
  }
  
  if (componentScores.workflowBrittleness < 50) {
    weaknesses.push(
      `Process fragility (${componentScores.workflowBrittleness}/100) indicates high variability requiring standardization before reliable automation can be achieved.`
    );
  }
  
  if (weaknesses.length === 0) {
    weaknesses.push(
      `All component scores meet minimum thresholds, though strategic improvements in lower-scoring areas will accelerate implementation.`
    );
  }
  
  // Generate Opportunities (business impact potential)
  const opportunities: string[] = [];
  
  if (estimatedFTE >= 0.5) {
    opportunities.push(
      `Significant capacity release opportunity detected through process optimization, enabling team reallocation to higher-value strategic initiatives.`
    );
  }
  
  if (avgErrorRate > 5) {
    opportunities.push(
      `Quality improvement potential through AI-driven consistency and validation, reducing rework cycles and enhancing operational reliability.`
    );
  }
  
  if (volumeDescriptions.length > 0 && volumeContext.includes('daily')) {
    opportunities.push(
      `High-frequency process provides rapid ROI accumulation with daily efficiency gains compounding to substantial annual impact.`
    );
  }
  
  if (componentScores.processClarity >= 60 && componentScores.dataQuality >= 60) {
    opportunities.push(
      `Strong process and data foundations enable phased AI implementation, starting with high-confidence automation and expanding progressively.`
    );
  }
  
  if (totalScore >= 50) {
    opportunities.push(
      `Moderate-to-high readiness enables pilot program initiation within current quarter, generating early wins and stakeholder confidence.`
    );
  }
  
  if (opportunities.length === 0) {
    opportunities.push(
      `Foundation-building phase presents opportunity to establish best practices that will benefit future automation initiatives across the organization.`
    );
  }
  
  // Generate Threats (implementation risks)
  const threats: string[] = [];
  
  if (componentScores.changeMagnitude < 40) {
    threats.push(
      `Low change readiness (${componentScores.changeMagnitude}/100) risks user resistance and adoption challenges without comprehensive change management support.`
    );
  }
  
  if (componentScores.workflowBrittleness < 40) {
    threats.push(
      `Process instability (${componentScores.workflowBrittleness}/100) threatens automation reliability; standardization must precede AI deployment to avoid multiplying inconsistencies.`
    );
  }
  
  if (componentScores.systemEnvironment < 40 && componentScores.integrationFeasibility < 40) {
    threats.push(
      `Technical infrastructure limitations risk project delays and cost overruns; foundation-building investment required before automation work begins.`
    );
  }
  
  if (pifResponses.length < 2 && totalEmployees > 5) {
    threats.push(
      `Limited stakeholder input (${pifResponses.length} respondent${pifResponses.length > 1 ? 's' : ''} from ${totalEmployees}+ affected employees) may miss critical process nuances affecting implementation success.`
    );
  }
  
  if (totalScore < 35) {
    threats.push(
      `Low overall readiness (${totalScore}/100) indicates premature automation would likely fail; focus on foundational improvements before revisiting AI implementation.`
    );
  }
  
  if (threats.length === 0) {
    threats.push(
      `Standard implementation risks apply; maintain stakeholder engagement and monitor for scope creep as automation design evolves.`
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
