import { 
  type Company, 
  type InsertCompany,
  type Workflow,
  type InsertWorkflow,
  type TFAAssessment,
  type InsertTFAAssessment,
  type PIFResponse,
  type InsertPIFResponse,
  type BusinessImpact,
  type InsertBusinessImpact,
  type ImplementationOpportunity,
  type InsertImplementationOpportunity,
  type WorkflowConsolidation,
  type InsertWorkflowConsolidation,
} from "@shared/schema";

export interface IStorage {
  // Companies
  getCompany(id: string): Promise<Company | undefined>;
  getAllCompanies(): Promise<Company[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;
  
  // Workflows
  getWorkflow(id: string): Promise<Workflow | undefined>;
  getWorkflowsByCompany(companyId: string): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, data: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  updateWorkflowStatus(id: string, status: string): Promise<Workflow | undefined>;
  deleteWorkflow(id: string): Promise<boolean>;
  
  // TFA Assessments
  getTFAAssessment(id: string): Promise<TFAAssessment | undefined>;
  getTFAByShareableId(shareableId: string): Promise<TFAAssessment | undefined>;
  getTFAByWorkflowId(workflowId: string): Promise<TFAAssessment | undefined>;
  getTFAByVerificationToken(token: string): Promise<TFAAssessment | undefined>;
  createTFAAssessment(assessment: InsertTFAAssessment): Promise<TFAAssessment>;
  updateTFAResponses(id: string, responses: Record<string, string>, score?: number, comments?: string, initialRespondent?: string, initialRespondentRole?: string, gapMetadata?: any, email?: string, verificationToken?: string): Promise<TFAAssessment | undefined>;
  completeTFA(id: string, score: number, comments?: string): Promise<TFAAssessment | undefined>;
  verifyTFA(token: string): Promise<TFAAssessment | undefined>;
  deleteTFAAssessment(id: string): Promise<boolean>;
  
  // PIF Responses
  getPIFResponse(id: string): Promise<PIFResponse | undefined>;
  getPIFByShareableId(shareableId: string): Promise<PIFResponse[]>;
  getPIFByVerificationToken(token: string): Promise<PIFResponse | undefined>;
  getAllPIFResponsesForWorkflow(workflowId: string): Promise<PIFResponse[]>;
  createPIFResponse(response: InsertPIFResponse): Promise<PIFResponse>;
  verifyPIF(token: string): Promise<PIFResponse | undefined>;
  deletePIFResponse(id: string): Promise<boolean>;
  
  // Business Impact
  getBusinessImpact(workflowId: string): Promise<BusinessImpact | undefined>;
  createBusinessImpact(impact: InsertBusinessImpact): Promise<BusinessImpact>;
  updateBusinessImpact(workflowId: string, impact: Partial<InsertBusinessImpact>): Promise<BusinessImpact | undefined>;
  deleteBusinessImpact(workflowId: string): Promise<boolean>;
  
  // Implementation Opportunities
  getImplementationOpportunity(id: string): Promise<ImplementationOpportunity | undefined>;
  getAllOpportunitiesForWorkflow(workflowId: string): Promise<ImplementationOpportunity[]>;
  getAllOpportunitiesForCompany(companyId: string): Promise<ImplementationOpportunity[]>;
  createImplementationOpportunity(opportunity: InsertImplementationOpportunity): Promise<ImplementationOpportunity>;
  updateImplementationOpportunity(id: string, data: Partial<InsertImplementationOpportunity>): Promise<ImplementationOpportunity | undefined>;
  deleteImplementationOpportunity(id: string): Promise<boolean>;
  
  // Workflow Consolidations
  getWorkflowConsolidation(id: string): Promise<WorkflowConsolidation | undefined>;
  getConsolidationsByWorkflow(workflowId: string): Promise<WorkflowConsolidation[]>;
  createWorkflowConsolidation(consolidation: InsertWorkflowConsolidation): Promise<WorkflowConsolidation>;
  updateWorkflowConsolidation(id: string, data: Partial<InsertWorkflowConsolidation>): Promise<WorkflowConsolidation | undefined>;
  deleteWorkflowConsolidation(id: string): Promise<boolean>;
}
