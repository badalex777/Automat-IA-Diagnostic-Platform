import { eq, desc, sql, and, or, isNull, isNotNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { 
  companies, 
  workflows,
  workflowSteps,
  tfaAssessments,
  pifResponses,
  businessImpact,
  implementationOpportunities,
  type Company,
  type InsertCompany,
  type Workflow,
  type InsertWorkflow,
  type WorkflowStep,
  type InsertWorkflowStep,
  type TFAAssessment,
  type InsertTFAAssessment,
  type PIFResponse,
  type InsertPIFResponse,
  type BusinessImpact,
  type InsertBusinessImpact,
  type ImplementationOpportunity,
  type InsertImplementationOpportunity,
} from "@shared/schema";
import type { IStorage } from "./storage";
import { generateTFAVerificationCode, generatePIFVerificationCode } from "./verificationCodeGenerator";

export class DbStorage implements IStorage {
  // Companies
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getAllCompanies(): Promise<Company[]> {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    // Convert number fields to strings for decimal columns
    const dbCompany: any = {
      ...company,
      annualRevenue: company.annualRevenue?.toString(),
      // totalEmployees is integer, no conversion needed
    };
    const [newCompany] = await db.insert(companies).values(dbCompany).returning();
    return newCompany;
  }

  async updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company | undefined> {
    // Convert number fields to strings for decimal columns
    const dbData: any = { ...data };
    if (data.annualRevenue !== undefined) {
      dbData.annualRevenue = data.annualRevenue?.toString();
    }
    // totalEmployees is integer, no conversion needed
    const [updated] = await db.update(companies).set(dbData).where(eq(companies.id, id)).returning();
    return updated;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Workflows
  async getWorkflow(id: string): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow;
  }

  async getWorkflowsByCompany(companyId: string): Promise<Workflow[]> {
    return db.select().from(workflows).where(eq(workflows.companyId, companyId)).orderBy(desc(workflows.createdAt));
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db.insert(workflows).values(workflow).returning();
    return newWorkflow;
  }

  async updateWorkflow(id: string, data: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const [updated] = await db.update(workflows).set(data).where(eq(workflows.id, id)).returning();
    return updated;
  }

  async updateWorkflowStatus(id: string, status: string): Promise<Workflow | undefined> {
    const [updated] = await db.update(workflows).set({ status }).where(eq(workflows.id, id)).returning();
    return updated;
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Workflow Steps
  async getWorkflowStep(id: string): Promise<WorkflowStep | undefined> {
    const [step] = await db.select().from(workflowSteps).where(eq(workflowSteps.id, id));
    return step;
  }

  async getWorkflowStepsByWorkflow(workflowId: string): Promise<WorkflowStep[]> {
    return db.select().from(workflowSteps)
      .where(eq(workflowSteps.workflowId, workflowId))
      .orderBy(workflowSteps.stepOrder, desc(workflowSteps.createdAt));
  }

  async createWorkflowStep(step: InsertWorkflowStep): Promise<WorkflowStep> {
    const [newStep] = await db.insert(workflowSteps).values(step).returning();
    return newStep;
  }

  async updateWorkflowStep(id: string, data: Partial<InsertWorkflowStep>): Promise<WorkflowStep | undefined> {
    const [updated] = await db.update(workflowSteps).set(data).where(eq(workflowSteps.id, id)).returning();
    return updated;
  }

  async deleteWorkflowStep(id: string): Promise<boolean> {
    const result = await db.delete(workflowSteps).where(eq(workflowSteps.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // TFA Assessments
  async getTFAAssessment(id: string): Promise<TFAAssessment | undefined> {
    const [assessment] = await db.select().from(tfaAssessments).where(eq(tfaAssessments.id, id));
    return assessment;
  }

  async getTFAByShareableId(shareableId: string): Promise<TFAAssessment | undefined> {
    const [assessment] = await db.select().from(tfaAssessments).where(eq(tfaAssessments.shareableId, shareableId));
    return assessment;
  }

  async getTFAByWorkflowId(workflowId: string): Promise<TFAAssessment | undefined> {
    const [assessment] = await db.select()
      .from(tfaAssessments)
      .where(
        and(
          eq(tfaAssessments.workflowId, workflowId),
          or(
            isNull(tfaAssessments.email),
            eq(tfaAssessments.verified, true)
          )
        )
      )
      .orderBy(sql`${tfaAssessments.completedAt} DESC NULLS LAST`)
      .limit(1);
    return assessment;
  }

  async getTFAByVerificationToken(token: string): Promise<TFAAssessment | undefined> {
    const [assessment] = await db.select().from(tfaAssessments).where(eq(tfaAssessments.verificationToken, token));
    return assessment;
  }

  async createTFAAssessment(assessment: InsertTFAAssessment): Promise<TFAAssessment> {
    // Generate unique shareable ID and verification code
    let shareableId = nanoid(10);
    const verificationCode = generateTFAVerificationCode();
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const [newAssessment] = await db.insert(tfaAssessments)
          .values({ ...assessment, shareableId, verificationCode })
          .returning();
        return newAssessment;
      } catch (error: any) {
        if (error.code === '23505' && attempts < maxAttempts - 1) {
          // Unique constraint violation, try a new ID
          shareableId = nanoid(10);
          attempts++;
        } else {
          throw error;
        }
      }
    }

    throw new Error('Failed to generate unique shareable ID after maximum attempts');
  }

  async updateTFAResponses(
    id: string, 
    responses: Record<string, string>, 
    score?: number, 
    comments?: string, 
    initialRespondent?: string,
    initialRespondentRole?: string,
    gapMetadata?: Record<string, { why: string; whoMightKnow: string }>
  ): Promise<TFAAssessment | undefined> {
    const updateData: any = { responses };
    if (score !== undefined) {
      updateData.score = score;
    }
    if (comments !== undefined) {
      updateData.comments = comments;
    }
    if (initialRespondent !== undefined) {
      updateData.initialRespondent = initialRespondent;
    }
    if (initialRespondentRole !== undefined) {
      updateData.initialRespondentRole = initialRespondentRole;
    }
    if (gapMetadata !== undefined) {
      updateData.gapMetadata = gapMetadata;
    }
    const [updated] = await db.update(tfaAssessments).set(updateData).where(eq(tfaAssessments.id, id)).returning();
    return updated;
  }

  async fillTFAGaps(id: string, gapResponses: Record<string, { value: string, answeredBy: string, answeredByRole?: string, reason?: string, isKnowledgeGap?: boolean }>, updatedResponses: Record<string, string>, updatedScore: number): Promise<TFAAssessment | undefined> {
    const assessment = await this.getTFAAssessment(id);
    if (!assessment) return undefined;

    const currentSources = (assessment.responseSources as Record<string, any>) || {};
    
    // Merge gap responses into responseSources with timestamps
    for (const [questionId, gapData] of Object.entries(gapResponses)) {
      currentSources[questionId] = {
        answeredBy: gapData.answeredBy,
        answeredByRole: gapData.answeredByRole || null,
        reason: gapData.reason || null,
        isKnowledgeGap: gapData.isKnowledgeGap || false,
        answeredAt: new Date().toISOString(),
      };
    }

    const [updated] = await db.update(tfaAssessments)
      .set({
        responses: updatedResponses,
        responseSources: currentSources,
        score: updatedScore,
      })
      .where(eq(tfaAssessments.id, id))
      .returning();
    
    return updated;
  }

  async unmarkTFAGap(id: string, questionId: string): Promise<TFAAssessment | undefined> {
    const assessment = await this.getTFAAssessment(id);
    if (!assessment) return undefined;

    // Clone JSON objects to avoid mutation issues
    const currentSources = JSON.parse(JSON.stringify(assessment.responseSources || {})) as Record<string, any>;
    const currentResponses = JSON.parse(JSON.stringify(assessment.responses || {})) as Record<string, string>;
    
    // Verify the question exists in responses
    if (!currentResponses[questionId]) {
      return undefined;
    }
    
    // Remove the question from responseSources (if it exists there)
    delete currentSources[questionId];
    
    // Set response back to "Don't Know" (value "0")
    currentResponses[questionId] = "0";
    
    // Recalculate score
    const { calculateTFAScore } = await import("@shared/tfaQuestions");
    const updatedScore = calculateTFAScore(currentResponses);

    const [updated] = await db.update(tfaAssessments)
      .set({
        responses: currentResponses,
        responseSources: currentSources,
        score: updatedScore,
      })
      .where(eq(tfaAssessments.id, id))
      .returning();
    
    return updated;
  }

  async completeTFA(id: string, score: number, comments?: string): Promise<TFAAssessment | undefined> {
    const updateData: any = { score, completedAt: new Date() };
    if (comments !== undefined) {
      updateData.comments = comments;
    }
    const [updated] = await db.update(tfaAssessments)
      .set(updateData)
      .where(eq(tfaAssessments.id, id))
      .returning();
    return updated;
  }

  async verifyTFA(token: string): Promise<TFAAssessment | undefined> {
    const [updated] = await db.update(tfaAssessments)
      .set({ verified: true, verifiedAt: new Date() })
      .where(eq(tfaAssessments.verificationToken, token))
      .returning();
    return updated;
  }

  async deleteTFAAssessment(id: string): Promise<boolean> {
    const result = await db.delete(tfaAssessments).where(eq(tfaAssessments.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // PIF Responses
  async getPIFResponse(id: string): Promise<PIFResponse | undefined> {
    const [response] = await db.select().from(pifResponses).where(eq(pifResponses.id, id));
    return response;
  }

  async getPIFByShareableId(shareableId: string): Promise<PIFResponse[]> {
    return db.select().from(pifResponses).where(eq(pifResponses.shareableId, shareableId)).orderBy(desc(pifResponses.createdAt));
  }

  async getAllPIFResponsesForWorkflow(workflowId: string): Promise<PIFResponse[]> {
    return db.select()
      .from(pifResponses)
      .where(
        and(
          eq(pifResponses.workflowId, workflowId),
          isNotNull(pifResponses.completedAt), // Only return completed submissions, not templates
          or(
            isNull(pifResponses.email),
            eq(pifResponses.verified, true)
          )
        )
      )
      .orderBy(desc(pifResponses.createdAt));
  }

  async getPIFByVerificationToken(token: string): Promise<PIFResponse | undefined> {
    const [response] = await db.select().from(pifResponses).where(eq(pifResponses.verificationToken, token));
    return response;
  }

  async createPIFResponse(response: InsertPIFResponse): Promise<PIFResponse> {
    const shareableId = nanoid(10);
    const verificationCode = generatePIFVerificationCode();
    const [newResponse] = await db.insert(pifResponses).values({ ...response, shareableId, verificationCode }).returning();
    return newResponse;
  }

  async verifyPIF(token: string): Promise<PIFResponse | undefined> {
    const [updated] = await db.update(pifResponses)
      .set({ verified: true, verifiedAt: new Date() })
      .where(eq(pifResponses.verificationToken, token))
      .returning();
    return updated;
  }

  async deletePIFResponse(id: string): Promise<boolean> {
    const result = await db.delete(pifResponses).where(eq(pifResponses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Business Impact
  async getBusinessImpact(workflowId: string): Promise<BusinessImpact | undefined> {
    const [impact] = await db.select().from(businessImpact).where(eq(businessImpact.workflowId, workflowId));
    return impact;
  }

  async createBusinessImpact(impact: InsertBusinessImpact): Promise<BusinessImpact> {
    const [newImpact] = await db.insert(businessImpact).values(impact).returning();
    return newImpact;
  }

  async updateBusinessImpact(workflowId: string, impactData: Partial<InsertBusinessImpact>): Promise<BusinessImpact | undefined> {
    const [updated] = await db.update(businessImpact)
      .set(impactData)
      .where(eq(businessImpact.workflowId, workflowId))
      .returning();
    return updated;
  }

  async deleteBusinessImpact(workflowId: string): Promise<boolean> {
    const result = await db.delete(businessImpact).where(eq(businessImpact.workflowId, workflowId));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Implementation Opportunities
  async getImplementationOpportunity(id: string): Promise<ImplementationOpportunity | undefined> {
    const [opportunity] = await db.select().from(implementationOpportunities).where(eq(implementationOpportunities.id, id));
    return opportunity;
  }

  async getAllOpportunitiesForWorkflow(workflowId: string): Promise<ImplementationOpportunity[]> {
    return db.select()
      .from(implementationOpportunities)
      .where(eq(implementationOpportunities.workflowId, workflowId))
      .orderBy(desc(implementationOpportunities.createdAt));
  }

  async getAllOpportunitiesForCompany(companyId: string): Promise<ImplementationOpportunity[]> {
    return db.select()
      .from(implementationOpportunities)
      .innerJoin(workflows, eq(implementationOpportunities.workflowId, workflows.id))
      .where(eq(workflows.companyId, companyId))
      .then(results => results.map(r => r.implementation_opportunities));
  }

  async createImplementationOpportunity(opportunity: InsertImplementationOpportunity): Promise<ImplementationOpportunity> {
    // Convert number fields to strings for decimal columns
    const dbOpportunity: any = {
      ...opportunity,
      annualRoi: opportunity.annualRoi?.toString(),
      implementationCost: opportunity.implementationCost?.toString(),
      cumulativeNetBenefit3Year: opportunity.cumulativeNetBenefit3Year?.toString(),
      cumulativeNetBenefit5Year: opportunity.cumulativeNetBenefit5Year?.toString(),
      hoursSavedPerWeek: opportunity.hoursSavedPerWeek?.toString(),
      annualHoursSaved: opportunity.annualHoursSaved?.toString(),
      fteSavings: opportunity.fteSavings?.toString(),
      errorReductionPct: opportunity.errorReductionPct?.toString(),
      hoursReallocatedToRevenue: opportunity.hoursReallocatedToRevenue?.toString(),
      revenueUpliftAnnual: opportunity.revenueUpliftAnnual?.toString(),
      rampupPeriodMonths: opportunity.rampupPeriodMonths?.toString(),
      paybackPeriodMonths: opportunity.paybackPeriodMonths?.toString(),
      trainingHoursPerEmployee: opportunity.trainingHoursPerEmployee?.toString(),
    };
    const [newOpportunity] = await db.insert(implementationOpportunities).values(dbOpportunity).returning();
    return newOpportunity;
  }

  async updateImplementationOpportunity(id: string, data: Partial<InsertImplementationOpportunity>): Promise<ImplementationOpportunity | undefined> {
    // Convert number fields to strings for decimal columns
    const dbData: any = { ...data };
    if (data.annualRoi !== undefined) dbData.annualRoi = data.annualRoi?.toString();
    if (data.implementationCost !== undefined) dbData.implementationCost = data.implementationCost?.toString();
    if (data.cumulativeNetBenefit3Year !== undefined) dbData.cumulativeNetBenefit3Year = data.cumulativeNetBenefit3Year?.toString();
    if (data.cumulativeNetBenefit5Year !== undefined) dbData.cumulativeNetBenefit5Year = data.cumulativeNetBenefit5Year?.toString();
    if (data.hoursSavedPerWeek !== undefined) dbData.hoursSavedPerWeek = data.hoursSavedPerWeek?.toString();
    if (data.annualHoursSaved !== undefined) dbData.annualHoursSaved = data.annualHoursSaved?.toString();
    if (data.fteSavings !== undefined) dbData.fteSavings = data.fteSavings?.toString();
    if (data.errorReductionPct !== undefined) dbData.errorReductionPct = data.errorReductionPct?.toString();
    if (data.hoursReallocatedToRevenue !== undefined) dbData.hoursReallocatedToRevenue = data.hoursReallocatedToRevenue?.toString();
    if (data.revenueUpliftAnnual !== undefined) dbData.revenueUpliftAnnual = data.revenueUpliftAnnual?.toString();
    if (data.rampupPeriodMonths !== undefined) dbData.rampupPeriodMonths = data.rampupPeriodMonths?.toString();
    if (data.paybackPeriodMonths !== undefined) dbData.paybackPeriodMonths = data.paybackPeriodMonths?.toString();
    if (data.trainingHoursPerEmployee !== undefined) dbData.trainingHoursPerEmployee = data.trainingHoursPerEmployee?.toString();
    
    const [updated] = await db.update(implementationOpportunities)
      .set(dbData)
      .where(eq(implementationOpportunities.id, id))
      .returning();
    return updated;
  }

  async deleteImplementationOpportunity(id: string): Promise<boolean> {
    const result = await db.delete(implementationOpportunities).where(eq(implementationOpportunities.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DbStorage();
