import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  contact: text("contact"),
  leadAnalystName: text("lead_analyst_name"),
  annualRevenue: decimal("annual_revenue", { precision: 15, scale: 2 }),
  totalEmployees: integer("total_employees"),
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

export const workflowSteps = pgTable("workflow_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  stepName: text("step_name").notNull(),
  participantName: text("participant_name"),
  participantRole: text("participant_role"),
  stepDescription: text("step_description"),
  stepOrder: integer("step_order").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("workflow_steps_workflow_id_idx").on(table.workflowId),
}));

export const tfaAssessments = pgTable("tfa_assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  shareableId: varchar("shareable_id").notNull().unique(),
  verificationCode: varchar("verification_code", { length: 12 }),
  responses: jsonb("responses").default({}),
  comments: text("comments"),
  score: integer("score"),
  initialRespondent: text("initial_respondent"),
  initialRespondentRole: text("initial_respondent_role"),
  responseSources: jsonb("response_sources").default({}),
  gapMetadata: jsonb("gap_metadata").default({}),
  email: text("email"),
  verificationToken: varchar("verification_token").unique(),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("tfa_assessments_workflow_id_idx").on(table.workflowId),
  shareableIdIdx: index("tfa_assessments_shareable_id_idx").on(table.shareableId),
  verificationTokenIdx: index("tfa_assessments_verification_token_idx").on(table.verificationToken),
}));

export const pifResponses = pgTable("pif_responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  stepId: varchar("step_id").references(() => workflowSteps.id, { onDelete: 'cascade' }),
  shareableId: varchar("shareable_id").notNull(),
  verificationCode: varchar("verification_code", { length: 12 }),
  respondentName: text("respondent_name").notNull(),
  respondentRole: text("respondent_role").notNull(),
  respondentResponsibilities: text("respondent_responsibilities"),
  responses: jsonb("responses").default({}),
  processClarity: integer("process_clarity"),
  changeMagnitude: integer("change_magnitude"),
  workflowBrittleness: integer("workflow_brittleness"),
  roiInputs: jsonb("roi_inputs").default({}),
  qualitativeResponses: jsonb("qualitative_responses").default({}),
  email: text("email"),
  verificationToken: varchar("verification_token").unique(),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("pif_responses_workflow_id_idx").on(table.workflowId),
  stepIdIdx: index("pif_responses_step_id_idx").on(table.stepId),
  shareableIdIdx: index("pif_responses_shareable_id_idx").on(table.shareableId),
  verificationTokenIdx: index("pif_responses_verification_token_idx").on(table.verificationToken),
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
  stepId: varchar("step_id").references(() => workflowSteps.id, { onDelete: 'set null' }),
  name: text("name").notNull(),
  description: text("description"),
  annualRoi: decimal("annual_roi", { precision: 12, scale: 2 }),
  implementationCost: decimal("implementation_cost", { precision: 12, scale: 2 }),
  annualRunRateRoi: decimal("annual_run_rate_roi", { precision: 8, scale: 2 }),
  cumulativeNetBenefit3Year: decimal("cumulative_net_benefit_3year", { precision: 12, scale: 2 }),
  cumulativeNetBenefit5Year: decimal("cumulative_net_benefit_5year", { precision: 12, scale: 2 }),
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
  roiCalculationData: jsonb("roi_calculation_data"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("implementation_opportunities_workflow_id_idx").on(table.workflowId),
}));

export const workflowConsolidations = pgTable("workflow_consolidations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  opportunityIds: text("opportunity_ids").array().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("workflow_consolidations_workflow_id_idx").on(table.workflowId),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
}).extend({
  annualRevenue: z.coerce.number().positive("Annual revenue must be positive"),
  totalEmployees: z.coerce.number().int().positive("Total employees must be a positive whole number"),
});

export const updateCompanySchema = insertCompanySchema.partial();

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.enum(workflowStatusEnum).optional(),
});

export const updateWorkflowSchema = insertWorkflowSchema.partial();

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({
  id: true,
  createdAt: true,
});

export const updateWorkflowStepSchema = insertWorkflowStepSchema.partial();

export const insertTFAAssessmentSchema = createInsertSchema(tfaAssessments).omit({
  id: true,
  shareableId: true,
  createdAt: true,
});

export const tfaResponsesSchema = z.object({
  responses: z.record(z.string(), z.string()),
  comments: z.string().optional(),
  initialRespondent: z.string().optional(),
  initialRespondentRole: z.string().optional(),
  verificationCode: z.string(),
  gapMetadata: z.record(z.string(), z.object({
    why: z.string(),
    whoMightKnow: z.string(),
  })).optional(),
});

export const fillGapsSchema = z.object({
  gapResponses: z.record(z.string(), z.object({
    value: z.string().min(1, "Answer is required"),
    answeredBy: z.string(), // Can be empty for actual knowledge gaps
    answeredByRole: z.string(), // Can be empty for actual knowledge gaps
    reason: z.string().optional(),
    isKnowledgeGap: z.boolean().optional().default(false),
  }).refine(
    (data) => {
      // For actual knowledge gaps, no respondent data needed
      if (data.isKnowledgeGap) return true;
      // For resolved gaps, require respondent info
      return data.answeredBy.trim().length > 0 && data.answeredByRole.trim().length > 0;
    },
    {
      message: "For resolved gaps, both answeredBy and answeredByRole are required. For actual knowledge gaps, mark as isKnowledgeGap.",
    }
  )),
});

export const unmarkGapSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
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
  verificationCode: z.string().min(1, "Verification code is required"),
  shareableId: z.string().min(1, "Shareable ID is required"),
  email: z.string().email("Please enter a valid email address").optional(),
  responses: z.record(z.string(), z.string()),
  stepId: z.string().optional(), // Optional step ID for step-level PIFs
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
  implementationCost: z.coerce.number().positive("Implementation cost must be positive"),
  annualRunRateRoi: z.coerce.number().optional(),
  cumulativeNetBenefit3Year: z.coerce.number().optional(),
  cumulativeNetBenefit5Year: z.coerce.number().optional(),
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

export const insertWorkflowConsolidationSchema = createInsertSchema(workflowConsolidations).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Consolidation name is required"),
  opportunityIds: z.array(z.string()).min(1, "At least one opportunity must be selected"),
});

export const updateWorkflowConsolidationSchema = insertWorkflowConsolidationSchema.omit({ workflowId: true }).partial();

// Select types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;

export type TFAAssessment = typeof tfaAssessments.$inferSelect;
export type InsertTFAAssessment = z.infer<typeof insertTFAAssessmentSchema>;

export type PIFResponse = typeof pifResponses.$inferSelect;
export type InsertPIFResponse = z.infer<typeof insertPIFResponseSchema>;
export type PIFSubmit = z.infer<typeof pifSubmitSchema>;

export type BusinessImpact = typeof businessImpact.$inferSelect;
export type InsertBusinessImpact = z.infer<typeof insertBusinessImpactSchema>;

export type ImplementationOpportunity = typeof implementationOpportunities.$inferSelect;
export type InsertImplementationOpportunity = z.infer<typeof insertImplementationOpportunitySchema>;

export type WorkflowConsolidation = typeof workflowConsolidations.$inferSelect;
export type InsertWorkflowConsolidation = z.infer<typeof insertWorkflowConsolidationSchema>;

// ROI Calculator Data Types
export const processInfoSchema = z.object({
  processName: z.string().min(1, "Process name is required"),
  businessUnit: z.string().min(1, "Business unit is required"),
  dataSource: z.string().min(1, "Data source is required"),
});

export const peopleAndCostSchema = z.object({
  employees: z.number().min(1, "Number of employees must be at least 1"),
  hoursPerWeekPerEmployee: z.number().min(0.1, "Hours per week must be positive"),
  averageAnnualSalary: z.number().min(1000, "Annual salary must be realistic"),
  annualWorkingHours: z.number().min(1500, "Annual working hours must be at least 1500").max(2200, "Annual working hours cannot exceed 2200"),
  overheadMultiplier: z.number().min(1).max(2).default(1.0),
  source: z.string().min(1, "Source is required"),
  
  useProcessBasedCalculation: z.boolean().default(false),
  processesPerPeriod: z.number().min(0).default(0),
  timePerProcessMinutes: z.number().min(0).default(0),
  processFrequency: z.enum(["daily", "weekly", "monthly"]).default("daily"),
});

export const timeSavingsSchema = z.object({
  enabled: z.boolean().default(false),
  percentTimeSaved: z.number().min(0).max(100).default(0),
  source: z.string().min(1, "Source is required"),
});

export const qualityImpactSchema = z.object({
  enabled: z.boolean().default(false),
  
  calculationMethod: z.enum(["manual", "rubric"]).default("manual"),
  
  transactionsPerWeek: z.number().min(0).default(0),
  currentErrorRate: z.number().min(0).max(100).default(0),
  
  postAIErrorRate: z.number().min(0).max(100).default(0),
  
  financialCostPerError: z.number().min(0).default(0),
  reworkMinutesPerError: z.number().min(0).default(0),
  
  percentQualityImprovement: z.number().min(0).max(100).default(0),
  
  source: z.string().min(1, "Source is required"),
});

export const revenueUpliftSchema = z.object({
  enabled: z.boolean().default(false),
  percentReallocated: z.number().min(0).max(100).default(40),
  revenueValuePerHour: z.number().min(0).default(0),
  source: z.string().min(1, "Source is required"),
});

export const costsAndRampupSchema = z.object({
  implementationCost: z.number().min(0).default(0),
  annualSoftwareCost: z.number().min(0).default(0),
  trainingHoursPerEmployee: z.number().min(0).default(0),
  changeMgmtCosts: z.number().min(0).default(0),
  rampUpMonths: z.number().min(1).max(12).default(6),
  
  rampUpCalculationMethod: z.enum(["manual", "rubric"]).default("manual"),
  rampUpEfficiencyPercent: z.number().min(20).max(150).default(100),
  
  rubricComplexity: z.enum(["low", "moderate", "high", "very_high"]).default("moderate"),
  rubricDigitalComfort: z.enum(["very_uncomfortable", "somewhat_uncomfortable", "neutral", "comfortable", "very_comfortable"]).default("neutral"),
  rubricRolloutApproach: z.enum(["pilot_first", "phased", "parallel", "bigbang"]).default("phased"),
  rubricSupportStructure: z.enum(["strong", "basic", "minimal"]).default("basic"),
  
  source: z.string().min(1, "Source is required"),
});

export const scenarioType = z.enum(["best", "base", "conservative", "worst"]);

export const roiCalculationSchema = z.object({
  processInfo: processInfoSchema,
  peopleAndCost: peopleAndCostSchema,
  timeSavings: timeSavingsSchema,
  qualityImpact: qualityImpactSchema,
  revenueUplift: revenueUpliftSchema,
  costsAndRampup: costsAndRampupSchema,
  selectedScenario: scenarioType.default("base"),
});

export const scenarioMultipliers = {
  best: {
    name: "Best Case",
    description: "Optimistic but achievable outcomes with higher adoption and efficiency gains",
    timeSavingsMultiplier: 1.15,
    errorReductionMultiplier: 1.2,
    reallocationMultiplier: 1.0,
    costOverrunMultiplier: 0.95,
    rampUpEfficiencyMultiplier: 1.15,
    color: "text-green-600",
  },
  base: {
    name: "Base Case", 
    description: "Realistic baseline expectations using input values as-is",
    timeSavingsMultiplier: 1.0,
    errorReductionMultiplier: 1.0,
    reallocationMultiplier: 0.7,
    costOverrunMultiplier: 1.0,
    rampUpEfficiencyMultiplier: 1.0,
    color: "text-blue-600",
  },
  conservative: {
    name: "Conservative",
    description: "Cautious middle-ground estimates with reduced benefits and cost padding",
    timeSavingsMultiplier: 0.7,
    errorReductionMultiplier: 0.7,
    reallocationMultiplier: 0.4,
    costOverrunMultiplier: 1.1,
    rampUpEfficiencyMultiplier: 0.8,
    color: "text-orange-600",
  },
  worst: {
    name: "Worst Case",
    description: "Downside risk scenario with significant implementation challenges",
    timeSavingsMultiplier: 0.4,
    errorReductionMultiplier: 0.5,
    reallocationMultiplier: 0.0,
    costOverrunMultiplier: 1.2,
    rampUpEfficiencyMultiplier: 0.7,
    color: "text-red-600",
  },
} as const;

export type ProcessInfo = z.infer<typeof processInfoSchema>;
export type PeopleAndCost = z.infer<typeof peopleAndCostSchema>;
export type TimeSavings = z.infer<typeof timeSavingsSchema>;
export type QualityImpact = z.infer<typeof qualityImpactSchema>;
export type RevenueUplift = z.infer<typeof revenueUpliftSchema>;
export type CostsAndRampup = z.infer<typeof costsAndRampupSchema>;
export type ROICalculation = z.infer<typeof roiCalculationSchema>;
export type ScenarioType = z.infer<typeof scenarioType>;
