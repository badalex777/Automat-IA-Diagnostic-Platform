import { 
  type Company, 
  type InsertCompany,
  type Workflow,
  type InsertWorkflow,
  type TFAAssessment,
  type InsertTFAAssessment,
  type BusinessImpact,
  type InsertBusinessImpact,
} from "@shared/schema";

export interface IStorage {
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Workflows
  getWorkflow(id: string): Promise<Workflow | undefined>;
  getWorkflowsByCompany(companyId: string): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflowStatus(id: string, status: string): Promise<Workflow | undefined>;
  
  // TFA Assessments
  getTFAAssessment(id: string): Promise<TFAAssessment | undefined>;
  getTFAByShareableId(shareableId: string): Promise<TFAAssessment | undefined>;
  getTFAByWorkflowId(workflowId: string): Promise<TFAAssessment | undefined>;
  createTFAAssessment(assessment: InsertTFAAssessment): Promise<TFAAssessment>;
  updateTFAResponses(id: string, responses: Record<string, string>, score?: number): Promise<TFAAssessment | undefined>;
  completeTFA(id: string, score: number): Promise<TFAAssessment | undefined>;
  
  // Business Impact
  getBusinessImpact(workflowId: string): Promise<BusinessImpact | undefined>;
  createBusinessImpact(impact: InsertBusinessImpact): Promise<BusinessImpact>;
  updateBusinessImpact(workflowId: string, impact: Partial<InsertBusinessImpact>): Promise<BusinessImpact | undefined>;
}
