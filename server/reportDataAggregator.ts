import { db } from "./db";
import { 
  companies, 
  workflows, 
  workflowSteps,
  tfaAssessments, 
  pifResponses, 
  implementationOpportunities,
  workflowConsolidations,
  type TFAAssessment,
  type PIFResponse,
  type ImplementationOpportunity,
  type WorkflowConsolidation,
  type Company,
  type Workflow,
  type WorkflowStep
} from "@shared/schema";
import { eq, and, isNotNull, or, isNull } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { calculateReadinessRubric, calculateAggregatedPIFScores } from "@shared/pifCalculations";
import { calculateOpportunityScore } from "@shared/opportunityCalculations";
import { calculateSectionScores, TFA_QUESTIONS } from "@shared/tfaQuestions";
import { ALL_PIF_QUESTIONS } from "@shared/pifQuestions";
import { calculateConsolidatedMetrics, calculateConsolidationBusinessImpact } from "@shared/consolidationCalculations";

/**
 * Remediation recommendations based on section and score level
 */
const REMEDIATION_MAP: Record<string, Record<string, string>> = {
  "System Environment": {
    "Critical": "Immediate infrastructure upgrade required - consider cloud migration or API modernization",
    "High": "Prioritize system modernization - implement REST APIs and enhance integration capabilities",
    "Medium": "Incrementally improve system access and documentation"
  },
  "Data Quality": {
    "Critical": "Critical data governance initiative required - establish data quality framework immediately",
    "High": "Implement data validation, cleansing, and standardization processes",
    "Medium": "Enhance data documentation and consistency checks"
  },
  "Integration Feasibility": {
    "Critical": "Integration architecture overhaul needed - engage integration specialists",
    "High": "Develop comprehensive integration strategy with proper middleware and error handling",
    "Medium": "Document existing integrations and identify improvement opportunities"
  },
  "Security/Compliance": {
    "Critical": "Immediate security audit and compliance remediation required",
    "High": "Strengthen security controls and establish compliance monitoring",
    "Medium": "Review and update security documentation and access controls"
  },
  "Process Clarity": {
    "Critical": "Comprehensive process documentation initiative required",
    "High": "Standardize and document all workflow steps with clear ownership",
    "Medium": "Enhance existing process documentation and training materials"
  },
  "Change Magnitude": {
    "Critical": "Extensive change management and training program required",
    "High": "Develop structured change management plan with stakeholder engagement",
    "Medium": "Provide targeted training and support for process changes"
  },
  "Workflow Brittleness": {
    "Critical": "Workflow redesign necessary to reduce fragility and dependencies",
    "High": "Implement error handling, fallback procedures, and resilience measures",
    "Medium": "Document dependencies and establish monitoring for critical paths"
  }
};

/**
 * Extract question insights from TFA assessment
 */
function extractTFAInsights(
  tfa: TFAAssessment,
  initialRespondent: string,
  submissionDate: Date
): QuestionInsight[] {
  const insights: QuestionInsight[] = [];
  
  // Defensive check: ensure responses object exists
  if (!tfa.responses || typeof tfa.responses !== 'object') {
    console.warn(`TFA assessment has invalid or missing responses object`);
    return insights;
  }
  
  const responses = tfa.responses as Record<string, string>;
  const responseSources = (tfa.responseSources as Record<string, any>) || {};
  
  for (const question of TFA_QUESTIONS) {
    // Try both formats: "qX" and "X" (database may store without 'q' prefix)
    const responseValue = responses[`q${question.id}`] || responses[`${question.id}`];
    // Explicitly check for null/undefined to include "0" (Don't Know) responses
    if (responseValue === null || responseValue === undefined) continue;
    
    const selectedOption = question.options.find(opt => opt.value === responseValue);
    if (!selectedOption) continue;
    
    // Determine respondent from response sources
    const responseSource = responseSources[`q${question.id}`];
    const respondent = responseSource?.respondent || initialRespondent;
    
    insights.push({
      questionId: question.id,
      questionText: question.question,
      section: question.section,
      dataType: 'TFA',
      respondentName: respondent,
      rawResponse: selectedOption.label,
      numericScore: selectedOption.score, // Will be null for Don't Know
      submissionDate: submissionDate.toISOString().split('T')[0],
      analystComments: responseSource?.comments || undefined
    });
  }
  
  return insights;
}

/**
 * Extract question insights from PIF responses
 */
function extractPIFInsights(
  pif: PIFResponse,
  respondentName: string,
  submissionDate: Date
): QuestionInsight[] {
  const insights: QuestionInsight[] = [];
  
  // Defensive check: ensure responses object exists
  if (!pif.responses || typeof pif.responses !== 'object') {
    console.warn(`PIF response for ${respondentName} has invalid or missing responses object`);
    return insights;
  }
  
  const responses = pif.responses as Record<string, string>;
  
  for (const question of ALL_PIF_QUESTIONS) {
    // Skip non-operational questions (ROI inputs and qualitative)
    if (!question.weight) continue;
    if (question.type === 'text' || question.type === 'textarea' || question.type === 'number') continue;
    
    // Try both formats: "qX" and "X" (database may store without 'q' prefix)
    const responseValue = responses[`q${question.id}`] || responses[`${question.id}`];
    // Explicitly check for null/undefined to handle all valid values including "0"
    if (responseValue === null || responseValue === undefined) continue;
    
    const selectedOption = question.options?.find(opt => opt.value === responseValue);
    if (!selectedOption) continue;
    
    // Calculate numeric score (respecting inverse scoring)
    const numericValue = parseInt(responseValue);
    const numericScore = question.inverseScoring ? (6 - numericValue) : numericValue;
    
    insights.push({
      questionId: question.id,
      questionText: question.question,
      section: question.section,
      dataType: 'PIF',
      respondentName: respondentName,
      rawResponse: selectedOption.label,
      numericScore: numericScore,
      submissionDate: submissionDate.toISOString().split('T')[0],
      analystComments: undefined
    });
  }
  
  return insights;
}

/**
 * Generate follow-up actions for low-scoring factors
 * Treats "Don't Know" responses (null scores) as 0 to reflect critical knowledge gaps
 */
function generateFollowUpActions(insights: QuestionInsight[]): FollowUpAction[] {
  const actions: FollowUpAction[] = [];
  const lowScoreThreshold = 3;
  
  // Group by section
  const sectionScores: Record<string, { scores: number[]; factors: string[] }> = {};
  
  for (const insight of insights) {
    // Treat null scores (Don't Know) as 0 - representing critical knowledge gaps
    const effectiveScore = insight.numericScore === null ? 0 : insight.numericScore;
    
    if (effectiveScore >= lowScoreThreshold) continue;
    
    if (!sectionScores[insight.section]) {
      sectionScores[insight.section] = { scores: [], factors: [] };
    }
    
    sectionScores[insight.section].scores.push(effectiveScore);
    sectionScores[insight.section].factors.push(insight.questionText);
  }
  
  // Generate action for each section with low scores
  for (const [section, data] of Object.entries(sectionScores)) {
    if (data.scores.length === 0) continue;
    
    const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const priority: 'Critical' | 'High' | 'Medium' = 
      avgScore <= 1.5 ? 'Critical' : avgScore <= 2.5 ? 'High' : 'Medium';
    
    const recommendations = REMEDIATION_MAP[section] || {
      "Critical": "Immediate remediation required",
      "High": "High-priority improvement needed",
      "Medium": "Targeted improvement recommended"
    };
    
    // Format factors list to preserve specific question identities
    let factorText: string;
    if (data.factors.length === 1) {
      factorText = data.factors[0];
    } else if (data.factors.length <= 3) {
      factorText = data.factors.join("; ");
    } else {
      // Show first 3 and indicate there are more
      factorText = data.factors.slice(0, 3).join("; ") + `; and ${data.factors.length - 3} more`;
    }
    
    actions.push({
      section: section,
      factor: factorText,
      score: Math.round(avgScore * 10) / 10,
      recommendation: recommendations[priority],
      priority: priority
    });
  }
  
  return actions.sort((a, b) => {
    const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate SWOT analysis from readiness component scores
 */
function generateSWOT(readiness: ReadinessData) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  // Analyze component scores
  const components = readiness.components;
  
  // Strengths: scores >= 70
  if (components.systemEnvironment >= 70) strengths.push(`Strong system environment foundation (${Math.round(components.systemEnvironment)})`);
  if (components.dataQuality >= 70) strengths.push(`High-quality data availability (${Math.round(components.dataQuality)})`);
  if (components.integrationFeasibility >= 70) strengths.push(`Robust integration capabilities (${Math.round(components.integrationFeasibility)})`);
  if (components.securityCompliance >= 70) strengths.push(`Strong security and compliance posture (${Math.round(components.securityCompliance)})`);
  if (components.processClarity >= 70) strengths.push(`Well-documented processes (${Math.round(components.processClarity)})`);
  if (components.changeMagnitude >= 70) strengths.push(`Manageable change requirements (${Math.round(components.changeMagnitude)})`);
  if (components.workflowBrittleness >= 70) strengths.push(`Resilient workflow structure (${Math.round(components.workflowBrittleness)})`);

  // Weaknesses: scores < 50
  if (components.systemEnvironment < 50) weaknesses.push(`System environment limitations (${Math.round(components.systemEnvironment)})`);
  if (components.dataQuality < 50) weaknesses.push(`Data quality concerns (${Math.round(components.dataQuality)})`);
  if (components.integrationFeasibility < 50) weaknesses.push(`Integration challenges (${Math.round(components.integrationFeasibility)})`);
  if (components.securityCompliance < 50) weaknesses.push(`Security/compliance gaps (${Math.round(components.securityCompliance)})`);
  if (components.processClarity < 50) weaknesses.push(`Process documentation gaps (${Math.round(components.processClarity)})`);
  if (components.changeMagnitude < 50) weaknesses.push(`Significant change requirements (${Math.round(components.changeMagnitude)})`);
  if (components.workflowBrittleness < 50) weaknesses.push(`Brittle workflow dependencies (${Math.round(components.workflowBrittleness)})`);

  // Opportunities: moderate scores (50-69) that could be improved
  if (components.systemEnvironment >= 50 && components.systemEnvironment < 70) {
    opportunities.push(`Enhance system environment capabilities through targeted upgrades`);
  }
  if (components.dataQuality >= 50 && components.dataQuality < 70) {
    opportunities.push(`Improve data quality through governance initiatives`);
  }
  if (components.processClarity >= 50 && components.processClarity < 70) {
    opportunities.push(`Standardize and document processes for scalability`);
  }

  // Threats: critical low scores that block progress
  if (components.dataQuality < 40) threats.push(`Critical data quality issues may hinder automation success`);
  if (components.integrationFeasibility < 40) threats.push(`Integration limitations pose significant implementation risk`);
  if (components.securityCompliance < 40) threats.push(`Security/compliance gaps require immediate remediation`);
  if (components.workflowBrittleness < 40) threats.push(`Workflow fragility may cause automation failures`);

  // Ensure we have at least something in each category
  if (strengths.length === 0) strengths.push(`Established baseline readiness for automation`);
  if (opportunities.length === 0) opportunities.push(`Potential for incremental capability improvements`);
  if (weaknesses.length === 0) weaknesses.push(`Minor areas for optimization identified`);
  if (threats.length === 0) threats.push(`No critical blockers identified`);

  return { strengths, weaknesses, opportunities, threats };
}

export interface DiagnosticData {
  company: Company;
  workflows: WorkflowData[];
  diagnosticPeriod: { start: Date; end: Date };
  hasCompleteOpportunities: boolean;
  portfolioMetrics: PortfolioMetrics;
  top3Opportunities: TopOpportunity[];
  matrixDistribution: MatrixDistribution;
  roadmapPhases: RoadmapPhases;
  appendixB: AppendixBData[];
  appendixF: AppendixFData[];
}

export interface PortfolioMetrics {
  totalWorkflows: number;
  totalOpportunities: number;
  totalAnnualBenefit: number;
  averagePaybackMonths: number;
  averageRoi: number;
  totalFteSavings: number;
  functionsList: string;
}

export interface TopOpportunity {
  workflowName: string;
  opportunityName: string;
  annualBenefit: number;
  roi: number;
  paybackMonths: number;
  fteSavings: number;
  description: string;
  businessImpact: number;
  implementationCost: string;
}

export interface MatrixDistribution {
  quickWins: { count: number; opportunities: string[] };
  strategicBets: { count: number; opportunities: string[] };
  niceToHaves: { count: number; opportunities: string[] };
  deprioritize: { count: number; opportunities: string[] };
}

export interface RoadmapPhases {
  phase1QuickWins: OpportunityData[];
  phase2Foundational: OpportunityData[];
  phase3Strategic: OpportunityData[];
}

export interface QuestionInsight {
  questionId: number;
  questionText: string;
  section: string;
  dataType: 'TFA' | 'PIF';
  respondentName: string;
  rawResponse: string;
  numericScore: number | null; // null for "Don't Know"
  submissionDate: string;
  analystComments?: string;
}

export interface FollowUpAction {
  section: string;
  factor: string;
  score: number;
  recommendation: string;
  priority: 'Critical' | 'High' | 'Medium';
}

export interface StepLevelSWOT {
  stepName: string;
  participantName: string;
  participantRole: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  questionInsights: QuestionInsight[];
  followUpActions: FollowUpAction[];
}

export interface AppendixBData {
  workflowName: string;
  stepLevelSWOTs: StepLevelSWOT[];  // New: array of step-level SWOT analyses
  workflowLevelSWOT?: {  // Optional: keep workflow-level for backwards compatibility
    swotAnalysis: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    questionInsights: QuestionInsight[];
    followUpActions: FollowUpAction[];
  };
}

export interface AppendixFData {
  workflowName: string;
  stepNumber: string;  // "N/A" for TFA (workflow-level), or step number for PIF
  stepName: string;    // "Workflow-level (TFA)" for TFA, or actual step name for PIF
  dataType: 'TFA' | 'PIF';
  respondentName: string;
  respondentRole: string;
  department: string | null;
  collectionMethod: string;
  submissionDate: string;
  knowledgeGaps: string | null;
  validationStatus: 'Complete' | 'Pending' | 'Partial';
  knowledgeGapDetails?: Array<{
    questionId: number;
    questionText: string;
    resolvedBy: string;
    resolverRole: string;
    isKnowledgeGap: boolean;
    resolvedAt: string;
    resolutionMethod: string;
  }>;
}

export interface WorkflowData {
  workflow: Workflow;
  tfa: TFAData | null;
  pifs: PIFData[];
  opportunities: OpportunityData[];
  consolidations: ConsolidationData[];
  readiness: ReadinessData | null;
}

export interface TFAData {
  id: string;
  score: number;
  responses: Record<string, string>;
  initialRespondent: string;
  responseSources: Record<string, any>;
  gapMetadata: Record<string, any>;
  completedAt: Date;
  sectionScores: {
    systemEnvironment: number;
    dataQuality: number;
    integrationFeasibility: number;
    securityCompliance: number;
  };
}

export interface PIFData {
  id: string;
  stepId: string | null;  // Step ID for joining with workflowSteps
  stepNumber: number | null;  // Step number within workflow
  stepName: string | null;  // Step name
  respondentName: string;
  respondentRole: string;
  respondentResponsibilities: string | null;
  responses: Record<string, string>; // Question responses needed for insights
  completedAt: Date;
  operationalScores: {
    processClarity: number;
    changeMagnitude: number;
    workflowBrittleness: number;
  };
  roiInputs: {
    employeeCount: number;
    frequency: string;
    processesPerPeriod: number;
    minutesPerProcess: number;
  };
  qualitativeInsights: {
    role: string | null;
    personalSteps: string | null;
    criticalKnowledge: string | null;
    exceptions: string | null;
    toolsUsed: string | null;
    toolLimitations: string | null;
    timeWasters: string | null;
    automationWish: string | null;
    typicalOutcome: string | null;
    keyDifficulties: string | null;
    impactOfDelays: string | null;
    additionalContext: string | null;
  };
}

export interface OpportunityData {
  opportunity: ImplementationOpportunity;
  workflow: { name: string };  // Workflow information
  step: { stepOrder: number; name: string };  // Step information
  roiMetrics: {
    annualRoi: number;
    fteSavings: number;
    paybackMonths: number;
    hoursSavedPerWeek: number;
    annualHoursSaved: number;
    errorReductionPct: number | null;
    revenueUpliftAnnual: number | null;
  };
  matrixPosition: {
    implementationEffort: number;
    baseImpact: number;
    businessImpact: number; // Enhanced impact
    quadrant: 'Quick Wins' | 'Strategic Bets' | 'Nice-To-Haves' | 'Deprioritize';
  };
}

export interface ConsolidationData {
  consolidation: WorkflowConsolidation;
  workflow: { name: string };
  constituentOpportunities: Array<{
    id: string;
    name: string;
    stepName: string;
    stepOrder: number;
  }>;
  aggregatedMetrics: {
    totalAnnualRoi: number;
    totalFteSavings: number;
    totalErrorsAvoidedAnnually: number;
    totalRevenueUpliftAnnual: number;
    weightedAvgRampupPeriodMonths: number;
    weightedAvgPaybackPeriodMonths: number;
    weightedAvgTrainingHoursPerEmployee: number;
  };
  matrixPosition: {
    implementationEffort: number;
    businessImpact: number;
    quadrant: 'Quick Wins' | 'Strategic Bets' | 'Nice-To-Haves' | 'Deprioritize';
  };
}

export interface ReadinessData {
  totalScore: number;
  feasibilityBand: 'Very High' | 'High' | 'Moderate' | 'Low' | 'Very Low';
  recommendation: string;
  componentScores: {
    systemEnvironment: number;
    dataQuality: number;
    integrationFeasibility: number;
    securityCompliance: number;
    processClarity: number;
    changeMagnitude: number;
    workflowBrittleness: number;
  };
  components: {
    systemEnvironment: number;
    dataQuality: number;
    integrationFeasibility: number;
    securityCompliance: number;
    processClarity: number;
    changeMagnitude: number;
    workflowBrittleness: number;
  };
}

/**
 * Aggregate all diagnostic data for a company's executive report
 */
export async function aggregateCompanyDiagnosticData(companyId: string): Promise<DiagnosticData | null> {
  // Get company
  const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
  if (!company) return null;

  // Get all workflows for company
  const companyWorkflows = await db.select().from(workflows).where(eq(workflows.companyId, companyId));

  // Process each workflow
  const workflowsData: WorkflowData[] = [];
  let hasCompleteOpportunities = false;
  let earliestDate: Date | null = null;
  let latestDate: Date | null = null;

  for (const workflow of companyWorkflows) {
    // Get TFA assessment (only verified responses, or legacy responses without email)
    const [tfa] = await db
      .select()
      .from(tfaAssessments)
      .where(
        and(
          eq(tfaAssessments.workflowId, workflow.id),
          isNotNull(tfaAssessments.completedAt),
          or(
            isNull(tfaAssessments.email),
            eq(tfaAssessments.verified, true)
          )
        )
      );

    // Get all PIF responses (only verified responses, or legacy responses without email)
    const pifs = await db
      .select()
      .from(pifResponses)
      .where(
        and(
          eq(pifResponses.workflowId, workflow.id),
          isNotNull(pifResponses.completedAt),
          or(
            isNull(pifResponses.email),
            eq(pifResponses.verified, true)
          )
        )
      );

    // Get workflow steps for step information
    const workflowStepRecords = await db
      .select()
      .from(workflowSteps as any)
      .where(eq((workflowSteps as any).workflowId, workflow.id))
      .orderBy(asc((workflowSteps as any).stepOrder));

    // Get implementation opportunities
    const opps = await db
      .select()
      .from(implementationOpportunities)
      .where(eq(implementationOpportunities.workflowId, workflow.id));

    // Process TFA data
    let tfaData: TFAData | null = null;
    if (tfa && tfa.completedAt) {
      const sectionScoresArray = calculateSectionScores(tfa.responses as Record<string, string>);
      
      // Convert array to object
      const sectionScores = {
        systemEnvironment: sectionScoresArray.find(s => s.name === "System Environment")?.score || 0,
        dataQuality: sectionScoresArray.find(s => s.name === "Data Quality")?.score || 0,
        integrationFeasibility: sectionScoresArray.find(s => s.name === "Integration Feasibility")?.score || 0,
        securityCompliance: sectionScoresArray.find(s => s.name === "Security & Compliance")?.score || 0,
      };
      
      tfaData = {
        id: tfa.id,
        score: tfa.score || 0,
        responses: tfa.responses as Record<string, string>,
        initialRespondent: tfa.initialRespondent || "Unknown",
        responseSources: tfa.responseSources as Record<string, any>,
        gapMetadata: tfa.gapMetadata as Record<string, any>,
        completedAt: tfa.completedAt,
        sectionScores,
      };

      // Track earliest/latest dates
      if (!earliestDate || tfa.completedAt < earliestDate) {
        earliestDate = tfa.completedAt;
      }
      if (!latestDate || tfa.completedAt > latestDate) {
        latestDate = tfa.completedAt;
      }
    }

    // Process PIF data
    const pifsData: PIFData[] = pifs.map(pif => {
      if (pif.completedAt) {
        if (!earliestDate || pif.completedAt < earliestDate) {
          earliestDate = pif.completedAt;
        }
        if (!latestDate || pif.completedAt > latestDate) {
          latestDate = pif.completedAt;
        }
      }

      const roiInputs = pif.roiInputs as any || {};
      const qualitative = pif.qualitativeResponses as any || {};

      // Look up step information if stepId exists
      const step = pif.stepId ? workflowStepRecords.find((s: any) => s.id === pif.stepId) : null;

      return {
        id: pif.id,
        stepId: pif.stepId,
        stepNumber: step?.stepOrder || null,
        stepName: step?.stepName || null,
        respondentName: pif.respondentName,
        respondentRole: pif.respondentRole,
        respondentResponsibilities: pif.respondentResponsibilities,
        responses: (pif.responses as Record<string, string>) || {}, // Include question responses for insights
        completedAt: pif.completedAt!,
        operationalScores: {
          processClarity: pif.processClarity || 0,
          changeMagnitude: pif.changeMagnitude || 0,
          workflowBrittleness: pif.workflowBrittleness || 0,
        },
        roiInputs: {
          employeeCount: roiInputs.employeeCount || 0,
          frequency: roiInputs.frequency || "unknown",
          processesPerPeriod: roiInputs.processesPerPeriod || 0,
          minutesPerProcess: roiInputs.minutesPerProcess || 0,
        },
        qualitativeInsights: {
          role: qualitative.role || null,
          personalSteps: qualitative.personalSteps || null,
          criticalKnowledge: qualitative.criticalKnowledge || null,
          exceptions: qualitative.exceptions || null,
          toolsUsed: qualitative.toolsUsed || null,
          toolLimitations: qualitative.toolLimitations || null,
          timeWasters: qualitative.timeWasters || null,
          automationWish: qualitative.automationWish || null,
          typicalOutcome: qualitative.typicalOutcome || null,
          keyDifficulties: qualitative.keyDifficulties || null,
          impactOfDelays: qualitative.impactOfDelays || null,
          additionalContext: qualitative.additionalContext || null,
        },
      };
    });

    // Calculate readiness if both TFA and PIF exist
    let readinessData: ReadinessData | null = null;
    if (tfaData && pifsData.length > 0) {
      hasCompleteOpportunities = true;
      
      const aggregatedPIF = calculateAggregatedPIFScores(pifs);
      const rubric = calculateReadinessRubric(
        tfaData.score,
        tfaData.sectionScores,
        aggregatedPIF
      );

      readinessData = {
        totalScore: rubric.totalScore,
        feasibilityBand: rubric.feasibilityBand,
        recommendation: rubric.recommendation,
        componentScores: rubric.componentScores,
        components: rubric.components,
      };
    }

    // Process opportunities with ROI and matrix positioning
    const opportunitiesData: OpportunityData[] = opps.map(opp => {
      const toggles = {
        errorMetrics: opp.errorMetricsEnabled || false,
        revenueMetrics: opp.revenueMetricsEnabled || false,
      };

      const companyContext = {
        annualRevenue: company.annualRevenue ? parseFloat(company.annualRevenue.toString()) : undefined,
        totalEmployees: company.totalEmployees || undefined,
      };

      const readinessScore = readinessData?.totalScore || 50; // Default to moderate if no readiness
      const matrixPosition = calculateOpportunityScore(opp, readinessScore, toggles, companyContext);

      // Look up step information from workflowStepRecords
      const step = opp.stepId ? workflowStepRecords.find((s: any) => s.id === opp.stepId) : null;

      return {
        opportunity: opp,
        workflow: { name: workflow.name },
        step: step ? { stepOrder: step.stepOrder, name: step.stepName } : { stepOrder: 0, name: "Unknown Step" },
        roiMetrics: {
          annualRoi: parseFloat(opp.annualRoi || "0"),
          fteSavings: parseFloat(opp.fteSavings || "0"),
          paybackMonths: parseFloat(opp.paybackPeriodMonths || "0"),
          hoursSavedPerWeek: parseFloat(opp.hoursSavedPerWeek || "0"),
          annualHoursSaved: parseFloat(opp.annualHoursSaved || "0"),
          errorReductionPct: opp.errorReductionPct ? parseFloat(opp.errorReductionPct.toString()) : null,
          revenueUpliftAnnual: opp.revenueUpliftAnnual ? parseFloat(opp.revenueUpliftAnnual.toString()) : null,
        },
        matrixPosition,
      };
    });

    // Fetch and process consolidations
    const consolidationRecords = await db
      .select()
      .from(workflowConsolidations)
      .where(eq(workflowConsolidations.workflowId, workflow.id));

    const consolidationsData: ConsolidationData[] = consolidationRecords.map(cons => {
      // Parse opportunity IDs array
      const opportunityIds = (cons.opportunityIds as string[]) || [];
      
      // Find constituent opportunities
      const constituentOpps = opportunityIds.map(oppId => {
        const opp = opps.find(o => o.id === oppId);
        if (!opp) return null;
        const step = opp.stepId ? workflowStepRecords.find((s: any) => s.id === opp.stepId) : null;
        return {
          id: opp.id,
          name: opp.name,
          stepName: step?.stepName || "Unknown Step",
          stepOrder: step?.stepOrder || 0,
        };
      }).filter((opp): opp is NonNullable<typeof opp> => opp !== null);
      
      // Find full opportunity objects for metric calculation
      const constituentOppRecords = opportunityIds
        .map(oppId => opps.find(o => o.id === oppId))
        .filter((opp): opp is NonNullable<typeof opp> => opp !== null);
      
      // Calculate aggregated metrics using centralized logic
      const metrics = calculateConsolidatedMetrics(constituentOppRecords);
      
      // Calculate step readiness scores for implementation effort
      const stepReadinessScores: Record<string, number> = {};
      workflowStepRecords.forEach((step: any) => {
        const stepPIFs = pifs.filter(pif => pif.stepId === step.id);
        if (stepPIFs.length > 0 && tfaData) {
          const aggregatedPIF = calculateAggregatedPIFScores(stepPIFs);
          const rubric = calculateReadinessRubric(
            tfaData.score,
            tfaData.sectionScores,
            aggregatedPIF
          );
          stepReadinessScores[step.id] = rubric.totalScore;
        }
      });
      
      // Calculate average readiness across constituent opportunity steps
      const readinessValues = constituentOppRecords
        .map(opp => opp.stepId ? stepReadinessScores[opp.stepId] : null)
        .filter((score): score is number => score !== null);
      const avgReadiness = readinessValues.length > 0
        ? readinessValues.reduce((sum, score) => sum + score, 0) / readinessValues.length
        : 50; // Default to moderate
      
      // Calculate implementation effort
      const implementationEffort = 
        (100 - avgReadiness) * 0.40 +
        metrics.weightedAvgRampupPeriodMonths * 3.0 +
        metrics.weightedAvgPaybackPeriodMonths * 2.0 +
        (metrics.weightedAvgTrainingHoursPerEmployee / 40) * 10;
      
      // Calculate business impact using centralized logic
      const companyContext = {
        annualRevenue: company.annualRevenue ? parseFloat(company.annualRevenue.toString()) : undefined,
        totalEmployees: company.totalEmployees || undefined,
      };
      const businessImpact = calculateConsolidationBusinessImpact(metrics, companyContext);
      
      // Determine quadrant
      let quadrant: 'Quick Wins' | 'Strategic Bets' | 'Nice-To-Haves' | 'Deprioritize';
      if (businessImpact >= 75 && implementationEffort <= 50) {
        quadrant = 'Quick Wins';
      } else if (businessImpact >= 75 && implementationEffort > 50) {
        quadrant = 'Strategic Bets';
      } else if (businessImpact < 75 && implementationEffort <= 50) {
        quadrant = 'Nice-To-Haves';
      } else {
        quadrant = 'Deprioritize';
      }
      
      return {
        consolidation: cons,
        workflow: { name: workflow.name },
        constituentOpportunities: constituentOpps,
        aggregatedMetrics: {
          totalAnnualRoi: metrics.totalAnnualRoi,
          totalFteSavings: metrics.totalFteSavings,
          totalErrorsAvoidedAnnually: metrics.totalErrorsAvoidedAnnually,
          totalRevenueUpliftAnnual: metrics.totalRevenueUpliftAnnual,
          weightedAvgRampupPeriodMonths: metrics.weightedAvgRampupPeriodMonths,
          weightedAvgPaybackPeriodMonths: metrics.weightedAvgPaybackPeriodMonths,
          weightedAvgTrainingHoursPerEmployee: metrics.weightedAvgTrainingHoursPerEmployee,
        },
        matrixPosition: {
          implementationEffort,
          businessImpact,
          quadrant,
        },
      };
    });

    workflowsData.push({
      workflow,
      tfa: tfaData,
      pifs: pifsData,
      opportunities: opportunitiesData,
      consolidations: consolidationsData,
      readiness: readinessData,
    });
  }

  // Determine diagnostic period
  const diagnosticPeriod = {
    start: earliestDate || new Date(),
    end: latestDate || new Date(),
  };

  // ===== PORTFOLIO METRICS CALCULATION =====
  const allOpportunities = workflowsData.flatMap(w => w.opportunities);
  const totalOpportunities = allOpportunities.length;
  const totalAnnualBenefit = allOpportunities.reduce((sum, o) => sum + o.roiMetrics.annualRoi, 0);
  const averagePaybackMonths = totalOpportunities > 0
    ? allOpportunities.reduce((sum, o) => sum + o.roiMetrics.paybackMonths, 0) / totalOpportunities
    : 0;
  const totalFteSavings = allOpportunities.reduce((sum, o) => sum + o.roiMetrics.fteSavings, 0);
  
  // Calculate average Annual Run Rate ROI% from stored values
  const averageRoi = totalOpportunities > 0
    ? allOpportunities.reduce((sum, o) => sum + parseFloat(o.opportunity.annualRunRateRoi || "0"), 0) / totalOpportunities
    : 0;
  
  // Get unique functions list from workflows - using workflow names as proxy since department field doesn't exist
  const uniqueFunctions = new Set<string>();
  workflowsData.forEach(w => {
    // Extract function/department from workflow name or description
    uniqueFunctions.add(w.workflow.name.split(' - ')[0] || w.workflow.name);
  });
  const functionsList = Array.from(uniqueFunctions).join(", ");

  const portfolioMetrics: PortfolioMetrics = {
    totalWorkflows: workflowsData.length,
    totalOpportunities,
    totalAnnualBenefit,
    averagePaybackMonths,
    averageRoi,
    totalFteSavings,
    functionsList,
  };

  // ===== TOP 3 OPPORTUNITIES CALCULATION =====
  const allOpportunitiesWithWorkflow = workflowsData.flatMap(w =>
    w.opportunities.map(o => ({
      workflowName: w.workflow.name,
      opportunityName: o.opportunity.name,
      annualBenefit: o.roiMetrics.annualRoi,
      roi: parseFloat(o.opportunity.annualRunRateRoi || "0"),
      paybackMonths: o.roiMetrics.paybackMonths,
      fteSavings: o.roiMetrics.fteSavings,
      description: o.opportunity.description || "",
      businessImpact: o.matrixPosition.businessImpact,
      implementationCost: o.opportunity.implementationCost || "0",
    }))
  );

  const top3Opportunities = allOpportunitiesWithWorkflow
    .sort((a, b) => b.businessImpact - a.businessImpact)
    .slice(0, 3);

  // ===== MATRIX DISTRIBUTION CALCULATION =====
  const matrixDistribution: MatrixDistribution = {
    quickWins: { count: 0, opportunities: [] },
    strategicBets: { count: 0, opportunities: [] },
    niceToHaves: { count: 0, opportunities: [] },
    deprioritize: { count: 0, opportunities: [] },
  };

  allOpportunities.forEach(o => {
    const oppName = o.opportunity.name;
    switch (o.matrixPosition.quadrant) {
      case 'Quick Wins':
        matrixDistribution.quickWins.count++;
        matrixDistribution.quickWins.opportunities.push(oppName);
        break;
      case 'Strategic Bets':
        matrixDistribution.strategicBets.count++;
        matrixDistribution.strategicBets.opportunities.push(oppName);
        break;
      case 'Nice-To-Haves':
        matrixDistribution.niceToHaves.count++;
        matrixDistribution.niceToHaves.opportunities.push(oppName);
        break;
      case 'Deprioritize':
        matrixDistribution.deprioritize.count++;
        matrixDistribution.deprioritize.opportunities.push(oppName);
        break;
    }
  });

  // ===== ROADMAP PHASES CALCULATION =====
  // Phase 1: Quick Wins (0-6 months) - Low effort, high impact
  // Phase 2: Foundational (6-12 months) - Medium effort
  // Phase 3: Strategic (12-18+ months) - High effort, high impact
  const roadmapPhases: RoadmapPhases = {
    phase1QuickWins: allOpportunities.filter(o => o.matrixPosition.quadrant === 'Quick Wins'),
    phase2Foundational: allOpportunities.filter(o => 
      o.matrixPosition.quadrant === 'Nice-To-Haves' || 
      (o.matrixPosition.quadrant === 'Strategic Bets' && o.matrixPosition.implementationEffort < 65)
    ),
    phase3Strategic: allOpportunities.filter(o => 
      o.matrixPosition.quadrant === 'Strategic Bets' && o.matrixPosition.implementationEffort >= 65
    ),
  };

  // ===== APPENDIX B: STEP-LEVEL SWOT ANALYSES =====
  const appendixB: AppendixBData[] = [];
  
  for (const w of workflowsData) {
    // Fetch workflow steps ordered by stepOrder
    const steps = await db
      .select()
      .from(workflowSteps)
      .where(eq(workflowSteps.workflowId, w.workflow.id))
      .orderBy(asc(workflowSteps.stepOrder));
    
    const stepLevelSWOTs: StepLevelSWOT[] = [];
    
    // Process each step
    for (const step of steps) {
      // Get PIFs for this specific step
      const stepPIFs = await db
        .select()
        .from(pifResponses)
        .where(
          and(
            eq(pifResponses.stepId, step.id),
            isNotNull(pifResponses.completedAt)
          )
        );
      
      // Only generate SWOT if this step has PIFs
      if (stepPIFs.length > 0 && w.tfa) {
        // Calculate step-level readiness using TFA + step PIFs
        const aggregatedPIF = calculateAggregatedPIFScores(stepPIFs);
        const stepReadiness = calculateReadinessRubric(
          w.tfa.score,
          w.tfa.sectionScores,
          aggregatedPIF
        );
        
        // Generate SWOT for this step
        const stepSWOT = generateSWOT({
          totalScore: stepReadiness.totalScore,
          feasibilityBand: stepReadiness.feasibilityBand,
          recommendation: stepReadiness.recommendation,
          componentScores: stepReadiness.componentScores,
          components: stepReadiness.components,
        });
        
        // Collect question insights from step PIFs only
        const stepQuestionInsights: QuestionInsight[] = [];
        stepPIFs.forEach(pif => {
          const pifInsights = extractPIFInsights(
            pif as any,
            pif.respondentName,
            pif.completedAt!
          );
          stepQuestionInsights.push(...pifInsights);
        });
        
        // Generate follow-up actions for this step
        const stepFollowUpActions = generateFollowUpActions(stepQuestionInsights);
        
        stepLevelSWOTs.push({
          stepName: step.stepName,
          participantName: step.participantName || 'N/A',
          participantRole: step.participantRole || 'N/A',
          swotAnalysis: stepSWOT,
          questionInsights: stepQuestionInsights,
          followUpActions: stepFollowUpActions,
        });
      }
    }
    
    // Also handle workflow-level PIFs (those without stepId) for backwards compatibility
    // Fetch all PIFs for this workflow to check stepId
    const allWorkflowPIFs = await db
      .select()
      .from(pifResponses)
      .where(
        and(
          eq(pifResponses.workflowId, w.workflow.id),
          isNotNull(pifResponses.completedAt)
        )
      );
    
    const workflowLevelPIFs = w.pifs.filter(pif => {
      // Check if this PIF has no stepId
      const originalPIF = allWorkflowPIFs.find((p: PIFResponse) => p.id === pif.id);
      return !originalPIF?.stepId;
    });
    
    let workflowLevelSWOT = undefined;
    if (workflowLevelPIFs.length > 0 && w.readiness) {
      const swot = generateSWOT(w.readiness);
      
      // Collect question insights from TFA and workflow-level PIFs
      const questionInsights: QuestionInsight[] = [];
      
      if (w.tfa) {
        const tfaInsights = extractTFAInsights(
          w.tfa as any,
          w.tfa.initialRespondent,
          w.tfa.completedAt
        );
        questionInsights.push(...tfaInsights);
      }
      
      workflowLevelPIFs.forEach(pif => {
        const pifInsights = extractPIFInsights(
          pif as any,
          pif.respondentName,
          pif.completedAt
        );
        questionInsights.push(...pifInsights);
      });
      
      const followUpActions = generateFollowUpActions(questionInsights);
      
      workflowLevelSWOT = {
        swotAnalysis: swot,
        questionInsights,
        followUpActions,
      };
    }
    
    // Add to appendixB if we have either step-level or workflow-level SWOTs
    if (stepLevelSWOTs.length > 0 || workflowLevelSWOT) {
      appendixB.push({
        workflowName: w.workflow.name,
        stepLevelSWOTs,
        workflowLevelSWOT,
      });
    }
  }

  // ===== APPENDIX F: DATA PROVENANCE =====
  const appendixF: AppendixFData[] = [];
  
  workflowsData.forEach(w => {
    // Extract department from workflow name (use part before " - " if exists, otherwise infer from context)
    let department = 'General Operations';
    if (w.workflow.name.includes(' - ')) {
      department = w.workflow.name.split(' - ')[0].trim();
    } else if (w.workflow.description) {
      // Try to infer department from description
      const desc = w.workflow.description.toLowerCase();
      if (desc.includes('finance') || desc.includes('invoice') || desc.includes('payment')) {
        department = 'Finance';
      } else if (desc.includes('hr') || desc.includes('employee') || desc.includes('payroll')) {
        department = 'Human Resources';
      } else if (desc.includes('sales') || desc.includes('customer') || desc.includes('crm')) {
        department = 'Sales & Marketing';
      } else if (desc.includes('operations') || desc.includes('logistics') || desc.includes('supply')) {
        department = 'Operations';
      }
    }
    
    // Add TFA provenance
    if (w.tfa) {
      const gapMetadata = w.tfa.gapMetadata || {};
      const responseSources = w.tfa.responseSources || {};
      const initialGapsCount = Object.keys(gapMetadata).length;
      
      // Identify resolved gaps and knowledge gaps from responseSources
      const knowledgeGapDetails: Array<{
        questionId: number;
        questionText: string;
        resolvedBy: string;
        resolverRole: string;
        isKnowledgeGap: boolean;
        resolvedAt: string;
        resolutionMethod: string;
      }> = [];
      
      // First, add all items from responseSources that were actively resolved
      Object.keys(responseSources).forEach(questionKey => {
        const source = responseSources[questionKey];
        if (source.answeredBy && source.answeredByRole) {
          const qId = parseInt(questionKey.replace('q', ''));
          const question = TFA_QUESTIONS.find(q => q.id === qId);
          
          knowledgeGapDetails.push({
            questionId: qId,
            questionText: question?.question || `Question ${qId}`,
            resolvedBy: source.answeredBy,
            resolverRole: source.answeredByRole,
            isKnowledgeGap: source.isKnowledgeGap || false,
            resolvedAt: source.answeredAt || '',
            resolutionMethod: source.isKnowledgeGap ? 'Knowledge Gap Resolution' : 'SME Consultation'
          });
        }
      });
      
      // Then, add any gaps from gapMetadata that aren't in responseSources
      // These are unresolved gaps that were marked with midpoint scores
      Object.keys(gapMetadata).forEach(questionKey => {
        const qId = parseInt(questionKey.replace('q', ''));
        // Check if this gap is already in knowledgeGapDetails
        const alreadyIncluded = knowledgeGapDetails.some(detail => detail.questionId === qId);
        if (!alreadyIncluded) {
          const question = TFA_QUESTIONS.find(q => q.id === qId);
          knowledgeGapDetails.push({
            questionId: qId,
            questionText: question?.question || `Question ${qId}`,
            resolvedBy: 'Unresolved',
            resolverRole: 'N/A',
            isKnowledgeGap: true,
            resolvedAt: '',
            resolutionMethod: 'Midpoint Score Applied'
          });
        }
      });
      
      const markedAsKnowledgeGapCount = knowledgeGapDetails.filter(d => d.isKnowledgeGap).length;
      const resolvedByOthersCount = knowledgeGapDetails.filter(d => !d.isKnowledgeGap).length;
      
      let gapSummary = null;
      if (initialGapsCount > 0) {
        const parts = [];
        if (resolvedByOthersCount > 0) parts.push(`${resolvedByOthersCount} resolved by SMEs`);
        if (markedAsKnowledgeGapCount > 0) parts.push(`${markedAsKnowledgeGapCount} marked as knowledge gaps`);
        gapSummary = `${initialGapsCount} initial gaps: ${parts.join(', ')}`;
      }
      
      // Determine validation status
      const totalQuestions = TFA_QUESTIONS.length;
      const answeredQuestions = Object.keys(w.tfa.responses).length;
      const validationStatus: 'Complete' | 'Pending' | 'Partial' = 
        answeredQuestions === totalQuestions && markedAsKnowledgeGapCount === 0 ? 'Complete' :
        markedAsKnowledgeGapCount > 0 ? 'Partial' : 'Pending';
      
      appendixF.push({
        workflowName: w.workflow.name,
        stepNumber: "N/A",
        stepName: "Workflow-level (TFA)",
        dataType: 'TFA',
        respondentName: w.tfa.initialRespondent,
        respondentRole: 'Technical Contact',
        department,
        collectionMethod: 'Survey Form',
        submissionDate: w.tfa.completedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        knowledgeGaps: gapSummary,
        validationStatus: validationStatus,
        knowledgeGapDetails: knowledgeGapDetails.length > 0 ? knowledgeGapDetails : undefined,
      });
    }

    // Add PIF provenance for each respondent
    w.pifs.forEach(pif => {
      appendixF.push({
        workflowName: w.workflow.name,
        stepNumber: pif.stepNumber ? pif.stepNumber.toString() : "N/A",
        stepName: pif.stepName || "Step-level (PIF)",
        dataType: 'PIF',
        respondentName: pif.respondentName,
        respondentRole: pif.respondentRole,
        department,
        collectionMethod: 'Survey Form',
        submissionDate: pif.completedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        knowledgeGaps: null,
        validationStatus: 'Complete', // PIFs are always complete when submitted
      });
    });
  });

  return {
    company,
    workflows: workflowsData,
    diagnosticPeriod,
    hasCompleteOpportunities,
    portfolioMetrics,
    top3Opportunities,
    matrixDistribution,
    roadmapPhases,
    appendixB,
    appendixF,
  };
}
