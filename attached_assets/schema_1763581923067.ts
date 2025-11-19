import { z } from "zod";
import { pgTable, serial, varchar, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

// Database Tables for Multi-Tenant Structure

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().references(() => companies.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  name: varchar("name", { length: 255 }).notNull(),
  calculationData: jsonb("calculation_data").notNull(), // Stores entire ROI calculation
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  workflows: many(workflows),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  company: one(companies, {
    fields: [workflows.companyId],
    references: [companies.id],
  }),
  opportunities: many(opportunities),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  workflow: one(workflows, {
    fields: [opportunities.workflowId],
    references: [workflows.id],
  }),
}));

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkflowSchema = createInsertSchema(workflows).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOpportunitySchema = createInsertSchema(opportunities).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;

// ROI Calculator Data Types
export const processInfoSchema = z.object({
  processName: z.string().min(1, "Process name is required"),
  businessUnit: z.string().min(1, "Business unit is required"),
  dataSource: z.string().min(1, "Data source is required"), // e.g., "Greg from Operations"
});

export const peopleAndCostSchema = z.object({
  employees: z.number().min(1, "Number of employees must be at least 1"),
  hoursPerWeekPerEmployee: z.number().min(0.1, "Hours per week must be positive"),
  averageAnnualSalary: z.number().min(1000, "Annual salary must be realistic"),
  annualWorkingHours: z.number().min(1500, "Annual working hours must be at least 1500").max(2200, "Annual working hours cannot exceed 2200"),
  overheadMultiplier: z.number().min(1).max(2).default(1.0),
  source: z.string().min(1, "Source is required"),
  
  // Process-based calculation fields
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

// Consolidated Quality Impact (combines Error Avoidance + Rework Reduction)
export const qualityImpactSchema = z.object({
  enabled: z.boolean().default(false),
  
  // Calculation method selection
  calculationMethod: z.enum(["manual", "rubric"]).default("manual"),
  
  // Core metrics (REQUIRED for both methods)
  transactionsPerWeek: z.number().min(0).default(0),
  currentErrorRate: z.number().min(0).max(100).default(0), // Percentage of transactions with errors
  
  // Manual entry specific
  postAIErrorRate: z.number().min(0).max(100).default(0), // Expected error rate after AI (manual only)
  
  // Financial and time impact per error (REQUIRED for both methods)
  financialCostPerError: z.number().min(0).default(0), // Fines, refunds, write-offs
  reworkMinutesPerError: z.number().min(0).default(0), // Time spent fixing each error (in minutes)
  
  // Rubric-calculated percentage (rubric method only)
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
  rampUpMonths: z.number().min(1).max(12).default(6), // Implementation ramp-up period (1-12 months)
  
  // Ramp-Up Efficiency Rubric
  rampUpCalculationMethod: z.enum(["manual", "rubric"]).default("manual"),
  rampUpEfficiencyPercent: z.number().min(20).max(150).default(100), // Manual override: 20-150% (allows for delayed rollouts and optimistic scenarios)
  
  // Rubric questions for calculating ramp-up efficiency
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

// Scenario multipliers configuration
export const scenarioMultipliers = {
  best: {
    name: "Best Case",
    description: "Optimistic but achievable outcomes with higher adoption and efficiency gains",
    timeSavingsMultiplier: 1.15,
    errorReductionMultiplier: 1.2,
    reallocationMultiplier: 1.0,
    costOverrunMultiplier: 0.95,
    rampUpEfficiencyMultiplier: 1.15, // 15% faster ramp-up in best case
    color: "text-green-600",
  },
  base: {
    name: "Base Case", 
    description: "Realistic baseline expectations using input values as-is",
    timeSavingsMultiplier: 1.0,
    errorReductionMultiplier: 1.0,
    reallocationMultiplier: 0.7,
    costOverrunMultiplier: 1.0,
    rampUpEfficiencyMultiplier: 1.0, // Normal ramp-up in base case
    color: "text-blue-600",
  },
  conservative: {
    name: "Conservative",
    description: "Cautious middle-ground estimates with reduced benefits and cost padding",
    timeSavingsMultiplier: 0.7,
    errorReductionMultiplier: 0.7,
    reallocationMultiplier: 0.4,
    costOverrunMultiplier: 1.1,
    rampUpEfficiencyMultiplier: 0.8, // 20% slower ramp-up in conservative case
    color: "text-orange-600",
  },
  worst: {
    name: "Worst Case",
    description: "Downside risk scenario with significant implementation challenges",
    timeSavingsMultiplier: 0.4,
    errorReductionMultiplier: 0.5,
    reallocationMultiplier: 0.0,
    costOverrunMultiplier: 1.2,
    rampUpEfficiencyMultiplier: 0.7, // 30% slower ramp-up in worst case
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
