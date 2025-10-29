import { db } from "./db";
import { 
  companies, 
  workflows, 
  tfaAssessments, 
  pifResponses, 
  implementationOpportunities,
  type TFAAssessment,
  type PIFResponse,
  type ImplementationOpportunity,
  type Company,
  type Workflow
} from "@shared/schema";
import { eq, and, isNotNull } from "drizzle-orm";
import { calculateReadinessRubric, calculateAggregatedPIFScores } from "@shared/pifCalculations";
import { calculateOpportunityScore } from "@shared/opportunityCalculations";
import { calculateSectionScores } from "@shared/tfaQuestions";

export interface DiagnosticData {
  company: Company;
  workflows: WorkflowData[];
  diagnosticPeriod: { start: Date; end: Date };
  hasCompleteOpportunities: boolean;
}

export interface WorkflowData {
  workflow: Workflow;
  tfa: TFAData | null;
  pifs: PIFData[];
  opportunities: OpportunityData[];
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
  respondentName: string;
  respondentRole: string;
  respondentResponsibilities: string | null;
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
    quadrant: 'Quick Wins' | 'Strategic Goals' | 'Nice-To-Haves' | 'Deprioritize';
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
    // Get TFA assessment
    const [tfa] = await db
      .select()
      .from(tfaAssessments)
      .where(
        and(
          eq(tfaAssessments.workflowId, workflow.id),
          isNotNull(tfaAssessments.completedAt)
        )
      );

    // Get all PIF responses
    const pifs = await db
      .select()
      .from(pifResponses)
      .where(
        and(
          eq(pifResponses.workflowId, workflow.id),
          isNotNull(pifResponses.completedAt)
        )
      );

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

      return {
        id: pif.id,
        respondentName: pif.respondentName,
        respondentRole: pif.respondentRole,
        respondentResponsibilities: pif.respondentResponsibilities,
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

      return {
        opportunity: opp,
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

    workflowsData.push({
      workflow,
      tfa: tfaData,
      pifs: pifsData,
      opportunities: opportunitiesData,
      readiness: readinessData,
    });
  }

  // Determine diagnostic period
  const diagnosticPeriod = {
    start: earliestDate || new Date(),
    end: latestDate || new Date(),
  };

  return {
    company,
    workflows: workflowsData,
    diagnosticPeriod,
    hasCompleteOpportunities,
  };
}
