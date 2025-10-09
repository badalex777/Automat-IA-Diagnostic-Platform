import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  contact: text("contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  score: integer("score"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  workflowIdIdx: index("tfa_assessments_workflow_id_idx").on(table.workflowId),
  shareableIdIdx: index("tfa_assessments_shareable_id_idx").on(table.shareableId),
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

// Insert schemas
export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
});

export const insertTFAAssessmentSchema = createInsertSchema(tfaAssessments).omit({
  id: true,
  shareableId: true,
  createdAt: true,
});

export const insertBusinessImpactSchema = createInsertSchema(businessImpact).omit({
  id: true,
  createdAt: true,
});

// Select types
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type TFAAssessment = typeof tfaAssessments.$inferSelect;
export type InsertTFAAssessment = z.infer<typeof insertTFAAssessmentSchema>;

export type BusinessImpact = typeof businessImpact.$inferSelect;
export type InsertBusinessImpact = z.infer<typeof insertBusinessImpactSchema>;
