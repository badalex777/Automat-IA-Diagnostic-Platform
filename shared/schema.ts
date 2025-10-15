import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  contact: text("contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowStatusEnum = ["tfa_only", "tfa_pending", "tfa_readiness", "impact_pending", "completed"] as const;

export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyId: varchar("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("tfa_only"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyIdIdx: index("workflows_company_id_idx").on(table.companyId),
}));

export const tfaAssessments = pgTable("tfa_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  shareableId: varchar("shareable_id").notNull().unique(),
  responses: jsonb("responses").default({}),
  comments: text("comments"),
  score: integer("score"),
  initialRespondent: text("initial_respondent"),
  responseSources: jsonb("response_sources").default({}),
  gapMetadata: jsonb("gap_metadata").default({}),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("tfa_assessments_workflow_id_idx").on(table.workflowId),
  shareableIdIdx: index("tfa_assessments_shareable_id_idx").on(table.shareableId),
}));

export const pifResponses = pgTable("pis_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  shareableId: varchar("shareable_id").notNull(),
  respondentName: text("respondent_name").notNull(),
  respondentRole: text("respondent_role").notNull(),
  respondentResponsibilities: text("respondent_responsibilities"),
  responses: jsonb("responses").default({}),
  processClarity: integer("process_clarity"),
  changeMagnitude: integer("change_magnitude"),
  workflowBrittleness: integer("workflow_brittleness"),
  roiInputs: jsonb("roi_inputs").default({}),
  qualitativeResponses: jsonb("qualitative_responses").default({}),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("pis_responses_workflow_id_idx").on(table.workflowId),
  shareableIdIdx: index("pis_responses_shareable_id_idx").on(table.shareableId),
}));

export const businessImpact = pgTable("business_impact", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().unique().references(() => workflows.id, { onDelete: 'cascade' }),
  hoursPerWeek: integer("hours_per_week"),
  hoursPerYear: integer("hours_per_year"),
  fteEquivalent: integer("fte_equivalent"),
  annualBenefits: integer("annual_benefits"),
  roiPercentage: integer("roi_percentage"),
  paybackMonths: integer("payback_months"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("business_impact_workflow_id_idx").on(table.workflowId),
}));

export const implementationOpportunities = pgTable("implementation_opportunities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  annualRoi: decimal("annual_roi", { precision: 12, scale: 2 }),
  hoursSavedPerWeek: decimal("hours_saved_per_week", { precision: 8, scale: 2 }),
  annualHoursSaved: decimal("annual_hours_saved", { precision: 10, scale: 2 }),
  fteSavings: decimal("fte_savings", { precision: 6, scale: 2 }),
  errorReductionPct: decimal("error_reduction_pct", { precision: 5, scale: 2 }),
  errorsAvoidedAnnually: integer("errors_avoided_annually"),
  hoursReallocatedToRevenue: decimal("hours_reallocated_to_revenue", { precision: 10, scale: 2 }),
  revenueUpliftAnnual: decimal("revenue_uplift_annual", { precision: 12, scale: 2 }),
  rampupPeriodMonths: decimal("rampup_period_months", { precision: 6, scale: 2 }),
  paybackPeriodMonths: decimal("payback_period_months", { precision: 6, scale: 2 }),
  trainingHoursPerEmployee: decimal("training_hours_per_employee", { precision: 6, scale: 2 }),
  errorMetricsEnabled: boolean("error_metrics_enabled").default(false).notNull(),
  revenueMetricsEnabled: boolean("revenue_metrics_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("implementation_opportunities_workflow_id_idx").on(table.workflowId),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const updateCompanySchema = insertCompanySchema.partial();

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.enum(workflowStatusEnum).optional(),
});

export const updateWorkflowSchema = insertWorkflowSchema.partial();

export const insertTFAAssessmentSchema = createInsertSchema(tfaAssessments).omit({
  id: true,
  shareableId: true,
  createdAt: true,
});

export const tfaResponsesSchema = z.object({
  responses: z.record(z.string(), z.string()),
  comments: z.string().optional(),
  initialRespondent: z.string().optional(),
  gapMetadata: z.record(z.string(), z.object({
    why: z.string(),
    whoMightKnow: z.string(),
  })).optional(),
});

export const fillGapsSchema = z.object({
  gapResponses: z.record(z.string(), z.object({
    value: z.string().min(1, "Answer is required"),
    answeredBy: z.string().min(1, "Answered by is required"),
    reason: z.string().optional(), // Optional - consultant can add additional context
  })),
});

export const insertBusinessImpactSchema = createInsertSchema(businessImpact).omit({
  id: true,
  createdAt: true,
});

export const insertPIFResponseSchema = createInsertSchema(pifResponses).omit({
  id: true,
  shareableId: true,
  createdAt: true,
});

export const pifSubmitSchema = z.object({
  respondentName: z.string().min(1, "Name is required"),
  respondentRole: z.string().min(1, "Role is required"),
  respondentResponsibilities: z.string().min(1, "Responsibilities are required"),
  responses: z.record(z.string(), z.string()),
  roiInputs: z.object({
    employeeCount: z.number().optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    processesPerPeriod: z.number().optional(),
    minutesPerProcess: z.number().optional(),
    hasQualityImpact: z.boolean().optional(),
    errorRate: z.number().optional(),
    reworkMinutesPerError: z.number().optional(),
    costPerError: z.number().optional(),
  }).optional(),
  qualitativeResponses: z.record(z.string(), z.string()).optional(),
});

export const updateBusinessImpactSchema = insertBusinessImpactSchema.omit({ workflowId: true }).partial();

export const insertImplementationOpportunitySchema = createInsertSchema(implementationOpportunities).omit({
  id: true,
  createdAt: true,
}).extend({
  annualRoi: z.coerce.number().optional(),
  hoursSavedPerWeek: z.coerce.number().optional(),
  annualHoursSaved: z.coerce.number().optional(),
  fteSavings: z.coerce.number().optional(),
  errorReductionPct: z.coerce.number().min(0).max(100).optional(),
  errorsAvoidedAnnually: z.coerce.number().int().optional(),
  hoursReallocatedToRevenue: z.coerce.number().optional(),
  revenueUpliftAnnual: z.coerce.number().optional(),
  rampupPeriodMonths: z.coerce.number().optional(),
  paybackPeriodMonths: z.coerce.number().optional(),
  trainingHoursPerEmployee: z.coerce.number().optional(),
});

export const updateImplementationOpportunitySchema = insertImplementationOpportunitySchema.omit({ workflowId: true }).partial();

// Select types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type TFAAssessment = typeof tfaAssessments.$inferSelect;
export type InsertTFAAssessment = z.infer<typeof insertTFAAssessmentSchema>;

export type PIFResponse = typeof pifResponses.$inferSelect;
export type InsertPIFResponse = z.infer<typeof insertPIFResponseSchema>;
export type PIFSubmit = z.infer<typeof pifSubmitSchema>;

export type BusinessImpact = typeof businessImpact.$inferSelect;
export type InsertBusinessImpact = z.infer<typeof insertBusinessImpactSchema>;

export type ImplementationOpportunity = typeof implementationOpportunities.$inferSelect;
export type InsertImplementationOpportunity = z.infer<typeof insertImplementationOpportunitySchema>;
