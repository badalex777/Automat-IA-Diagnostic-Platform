import { eq, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "./db";
import { 
  companies, 
  workflows, 
  tfaAssessments, 
  businessImpact,
  type Company,
  type InsertCompany,
  type Workflow,
  type InsertWorkflow,
  type TFAAssessment,
  type InsertTFAAssessment,
  type BusinessImpact,
  type InsertBusinessImpact,
} from "@shared/schema";
import type { IStorage } from "./storage";

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
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company | undefined> {
    const [updated] = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
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
      .where(eq(tfaAssessments.workflowId, workflowId))
      .orderBy(sql`${tfaAssessments.completedAt} DESC NULLS LAST`)
      .limit(1);
    return assessment;
  }

  async createTFAAssessment(assessment: InsertTFAAssessment): Promise<TFAAssessment> {
    // Generate unique shareable ID with collision retry
    let shareableId = nanoid(10);
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const [newAssessment] = await db.insert(tfaAssessments)
          .values({ ...assessment, shareableId })
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
    if (gapMetadata !== undefined) {
      updateData.gapMetadata = gapMetadata;
    }
    const [updated] = await db.update(tfaAssessments).set(updateData).where(eq(tfaAssessments.id, id)).returning();
    return updated;
  }

  async fillTFAGaps(id: string, gapResponses: Record<string, { value: string, answeredBy: string, reason: string }>, updatedResponses: Record<string, string>, updatedScore: number): Promise<TFAAssessment | undefined> {
    const assessment = await this.getTFAAssessment(id);
    if (!assessment) return undefined;

    const currentSources = (assessment.responseSources as Record<string, any>) || {};
    
    // Merge gap responses into responseSources with timestamps
    for (const [questionId, gapData] of Object.entries(gapResponses)) {
      currentSources[questionId] = {
        answeredBy: gapData.answeredBy,
        reason: gapData.reason,
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

  async deleteTFAAssessment(id: string): Promise<boolean> {
    const result = await db.delete(tfaAssessments).where(eq(tfaAssessments.id, id));
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
}

export const storage = new DbStorage();
