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
import { calculateReadinessRubric, calculateAggregatedPIFScores, calculateSWOT } from "@shared/pifCalculations";
import { calculateOpportunityScore } from "@shared/opportunityCalculations";
import { calculateSectionScores } from "@shared/tfaQuestions";

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
}

export interface MatrixDistribution {
  quickWins: { count: number; opportunities: string[] };
  strategicGoals: { count: number; opportunities: string[] };
  niceToHaves: { count: number; opportunities: string[] };
  deprioritize: { count: number; opportunities: string[] };
}

export interface RoadmapPhases {
  phase1QuickWins: OpportunityData[];
  phase2Foundational: OpportunityData[];
  phase3Strategic: OpportunityData[];
}

export interface AppendixBData {
  workflowName: string;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export interface AppendixFData {
  workflowName: string;
  dataType: 'TFA' | 'PIF';
  respondentName: string;
  respondentRole: string;
  department: string | null;
  collectionMethod: string;
  submissionDate: string;
  knowledgeGaps: string | null;
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

  // ===== PORTFOLIO METRICS CALCULATION =====
  const allOpportunities = workflowsData.flatMap(w => w.opportunities);
  const totalOpportunities = allOpportunities.length;
  const totalAnnualBenefit = allOpportunities.reduce((sum, o) => sum + o.roiMetrics.annualRoi, 0);
  const averagePaybackMonths = totalOpportunities > 0
    ? allOpportunities.reduce((sum, o) => sum + o.roiMetrics.paybackMonths, 0) / totalOpportunities
    : 0;
  const totalFteSavings = allOpportunities.reduce((sum, o) => sum + o.roiMetrics.fteSavings, 0);
  
  // Calculate average ROI from annual benefit and implementation cost
  const totalCost = allOpportunities.reduce((sum, o) => sum + parseFloat(o.opportunity.implementationCost || "0"), 0);
  const averageRoi = totalCost > 0 ? ((totalAnnualBenefit / totalCost) * 100) : 0;
  
  // Get unique functions list from workflows
  const uniqueFunctions = new Set<string>();
  workflowsData.forEach(w => {
    if (w.workflow.department) uniqueFunctions.add(w.workflow.department);
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
      roi: totalCost > 0 ? ((o.roiMetrics.annualRoi / parseFloat(o.opportunity.implementationCost || "1")) * 100) : 0,
      paybackMonths: o.roiMetrics.paybackMonths,
      fteSavings: o.roiMetrics.fteSavings,
      description: o.opportunity.description || "",
      businessImpact: o.matrixPosition.businessImpact,
    }))
  );

  const top3Opportunities = allOpportunitiesWithWorkflow
    .sort((a, b) => b.businessImpact - a.businessImpact)
    .slice(0, 3);

  // ===== MATRIX DISTRIBUTION CALCULATION =====
  const matrixDistribution: MatrixDistribution = {
    quickWins: { count: 0, opportunities: [] },
    strategicGoals: { count: 0, opportunities: [] },
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
      case 'Strategic Goals':
        matrixDistribution.strategicGoals.count++;
        matrixDistribution.strategicGoals.opportunities.push(oppName);
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
      (o.matrixPosition.quadrant === 'Strategic Goals' && o.matrixPosition.implementationEffort < 65)
    ),
    phase3Strategic: allOpportunities.filter(o => 
      o.matrixPosition.quadrant === 'Strategic Goals' && o.matrixPosition.implementationEffort >= 65
    ),
  };

  // ===== APPENDIX B: SWOT ANALYSIS =====
  const appendixB: AppendixBData[] = workflowsData
    .filter(w => w.readiness !== null)
    .map(w => {
      const swot = calculateSWOT(w.readiness!);
      return {
        workflowName: w.workflow.name,
        swotAnalysis: swot,
      };
    });

  // ===== APPENDIX F: DATA PROVENANCE =====
  const appendixF: AppendixFData[] = [];
  
  workflowsData.forEach(w => {
    // Add TFA provenance
    if (w.tfa) {
      const knowledgeGaps = Object.keys(w.tfa.gapMetadata || {});
      appendixF.push({
        workflowName: w.workflow.name,
        dataType: 'TFA',
        respondentName: w.tfa.initialRespondent,
        respondentRole: 'Technical Contact',
        department: w.workflow.department,
        collectionMethod: 'Technical Feasibility Assessment Form',
        submissionDate: w.tfa.completedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        knowledgeGaps: knowledgeGaps.length > 0 ? `${knowledgeGaps.length} questions with gaps` : null,
      });
    }

    // Add PIF provenance for each respondent
    w.pifs.forEach(pif => {
      appendixF.push({
        workflowName: w.workflow.name,
        dataType: 'PIF',
        respondentName: pif.respondentName,
        respondentRole: pif.respondentRole,
        department: w.workflow.department,
        collectionMethod: 'Process Insights Form',
        submissionDate: pif.completedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        knowledgeGaps: null,
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
