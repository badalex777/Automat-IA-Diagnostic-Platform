import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import { 
  insertCompanySchema,
  updateCompanySchema,
  insertWorkflowSchema,
  updateWorkflowSchema,
  insertTFAAssessmentSchema,
  tfaResponsesSchema,
  fillGapsSchema,
  unmarkGapSchema,
  pifSubmitSchema,
  insertBusinessImpactSchema,
  updateBusinessImpactSchema,
  insertImplementationOpportunitySchema,
  updateImplementationOpportunitySchema,
} from "@shared/schema";
import { TFA_QUESTIONS, calculateTFAScore, calculateSectionScores } from "@shared/tfaQuestions";
import { ALL_PIF_QUESTIONS, calculatePIFScores, extractROIInputs, extractQualitativeResponses } from "@shared/pifQuestions";
import { calculateAggregatedPIFScores } from "@shared/pifCalculations";
import { aggregateCompanyDiagnosticData } from "./reportDataAggregator";
import { generateExecutiveReport } from "./reportGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Companies
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getAllCompanies();
      
      // Get workflow counts for each company
      const companiesWithCounts = await Promise.all(
        companies.map(async (company) => {
          const workflows = await storage.getWorkflowsByCompany(company.id);
          
          // Count completed workflows (those with completed TFA)
          const completedCount = await Promise.all(
            workflows.map(async (workflow) => {
              const tfa = await storage.getTFAByWorkflowId(workflow.id);
              return tfa?.completedAt ? 1 : 0;
            })
          ).then(counts => counts.reduce((sum: number, count: number) => sum + count, 0));
          
          return {
            ...company,
            workflowCount: workflows.length,
            completedCount,
          };
        })
      );
      
      res.json(companiesWithCounts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validatedData);
      res.status(201).json(company);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const validatedData = updateCompanySchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "At least one field to update is required" });
      }

      const company = await storage.updateCompany(req.params.id, validatedData);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      const success = await storage.deleteCompany(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Executive Report Generation
  app.get("/api/companies/:id/executive-report", async (req, res) => {
    try {
      // Aggregate all diagnostic data for the company
      const diagnosticData = await aggregateCompanyDiagnosticData(req.params.id);
      
      if (!diagnosticData) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Validate that company has at least one complete opportunity
      // (workflow with both TFA and PIF completed)
      if (!diagnosticData.hasCompleteOpportunities) {
        return res.status(400).json({ 
          error: "Cannot generate report: Company must have at least one workflow with both TFA and PIF completed" 
        });
      }

      // Generate the Word document
      const buffer = await generateExecutiveReport(diagnosticData);

      // Set headers for file download
      const companyName = diagnosticData.company.name.replace(/[^a-z0-9]/gi, '_');
      const diagnosticPeriod = diagnosticData.diagnosticPeriod.end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '_');
      const filename = `Automat-IA_Executive_Diagnostic_Report_${companyName}_${diagnosticPeriod}.docx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
    } catch (error: any) {
      console.error('Error generating executive report:', error);
      res.status(500).json({ error: "Failed to generate executive report" });
    }
  });

  // Workflows
  app.get("/api/companies/:companyId/workflows", async (req, res) => {
    try {
      const workflows = await storage.getWorkflowsByCompany(req.params.companyId);
      
      // Enrich workflows with TFA and PIF completion dates
      const enrichedWorkflows = await Promise.all(workflows.map(async (workflow) => {
        const tfa = await storage.getTFAByWorkflowId(workflow.id);
        const pifResponses = await storage.getAllPIFResponsesForWorkflow(workflow.id);
        
        // Find latest PIF submission date
        const latestPifDate = pifResponses.length > 0
          ? pifResponses
              .map(r => r.completedAt)
              .filter((date): date is Date => date !== null && date !== undefined)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
          : undefined;
        
        return {
          ...workflow,
          tfaCompletedAt: tfa?.completedAt || null,
          latestPifCompletedAt: latestPifDate || null,
        };
      }));
      
      res.json(enrichedWorkflows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const workflow = await storage.getWorkflow(req.params.id);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const validatedData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(validatedData);
      
      // Auto-create TFA assessment with shareable link
      const assessment = await storage.createTFAAssessment({
        workflowId: workflow.id,
        responses: {},
      });

      res.status(201).json({ workflow, assessment });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/workflows/:id", async (req, res) => {
    try {
      const validatedData = updateWorkflowSchema.parse(req.body);

      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "At least one field to update is required" });
      }

      const workflow = await storage.updateWorkflow(req.params.id, validatedData);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      const success = await storage.deleteWorkflow(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Workflow not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // TFA Assessments
  app.get("/api/tfa/questions", (req, res) => {
    res.json({ questions: TFA_QUESTIONS });
  });

  app.post("/api/tfa", async (req, res) => {
    try {
      const validatedData = insertTFAAssessmentSchema.parse(req.body);
      const assessment = await storage.createTFAAssessment(validatedData);
      res.status(201).json(assessment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tfa/:id", async (req, res) => {
    try {
      const assessment = await storage.getTFAAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/tfa/shareable/:shareableId", async (req, res) => {
    try {
      const assessment = await storage.getTFAByShareableId(req.params.shareableId);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      
      const workflow = await storage.getWorkflow(assessment.workflowId);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      const company = await storage.getCompany(workflow.companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json({
        assessment,
        workflow,
        company,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/workflows/:workflowId/tfa", async (req, res) => {
    try {
      const assessment = await storage.getTFAByWorkflowId(req.params.workflowId);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/tfa/:id/responses", async (req, res) => {
    try {
      const validatedData = tfaResponsesSchema.parse(req.body);
      const { responses } = validatedData;

      // Validate each response matches valid option values
      for (const [questionId, value] of Object.entries(responses)) {
        const question = TFA_QUESTIONS.find(q => q.id.toString() === questionId);
        if (!question) {
          return res.status(400).json({ error: `Invalid question ID: ${questionId}` });
        }
        
        const validValues = question.options.map(opt => opt.value);
        if (!validValues.includes(value)) {
          return res.status(400).json({ 
            error: `Invalid response value "${value}" for question ${questionId}. Must be one of: ${validValues.join(', ')}`
          });
        }
      }

      // Calculate score based on responses
      const score = calculateTFAScore(responses);
      
      const assessment = await storage.updateTFAResponses(req.params.id, responses, score);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      res.json(assessment);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tfa/shareable/:shareableId/submit", async (req, res) => {
    try {
      const validatedData = tfaResponsesSchema.parse(req.body);
      const { responses, comments, initialRespondent, initialRespondentRole, gapMetadata } = validatedData;

      // Get assessment by shareableId
      const assessment = await storage.getTFAByShareableId(req.params.shareableId);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Validate all questions are answered
      const allQuestionIds = TFA_QUESTIONS.map(q => q.id.toString());
      const answeredIds = Object.keys(responses);
      const missingQuestions = allQuestionIds.filter(id => !answeredIds.includes(id));
      
      if (missingQuestions.length > 0) {
        return res.status(400).json({ 
          error: "All questions must be answered before submission",
          missingQuestions,
        });
      }

      // Validate each response matches valid option values
      for (const [questionId, value] of Object.entries(responses)) {
        const question = TFA_QUESTIONS.find(q => q.id.toString() === questionId);
        if (!question) {
          return res.status(400).json({ error: `Invalid question ID: ${questionId}` });
        }
        
        const validValues = question.options.map(opt => opt.value);
        if (!validValues.includes(value)) {
          return res.status(400).json({ 
            error: `Invalid response value "${value}" for question ${questionId}. Must be one of: ${validValues.join(', ')}`
          });
        }
      }

      // Calculate final score
      const score = calculateTFAScore(responses);
      const sectionScores = calculateSectionScores(responses);

      // Update TFA with responses and mark as complete with all data in one operation
      await storage.updateTFAResponses(assessment.id, responses, score, comments, initialRespondent, initialRespondentRole, gapMetadata);
      const updatedAssessment = await storage.completeTFA(assessment.id, score, comments);
      
      if (!updatedAssessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Update workflow status
      await storage.updateWorkflowStatus(updatedAssessment.workflowId, "tfa_readiness");

      res.json({ 
        assessment: updatedAssessment, 
        score,
        sectionScores,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/tfa/:id/submit", async (req, res) => {
    try {
      const validatedData = tfaResponsesSchema.parse(req.body);
      const { responses } = validatedData;

      // Validate all questions are answered
      const allQuestionIds = TFA_QUESTIONS.map(q => q.id.toString());
      const answeredIds = Object.keys(responses);
      const missingQuestions = allQuestionIds.filter(id => !answeredIds.includes(id));
      
      if (missingQuestions.length > 0) {
        return res.status(400).json({ 
          error: "All questions must be answered before submission",
          missingQuestions,
        });
      }

      // Validate each response matches valid option values
      for (const [questionId, value] of Object.entries(responses)) {
        const question = TFA_QUESTIONS.find(q => q.id.toString() === questionId);
        if (!question) {
          return res.status(400).json({ error: `Invalid question ID: ${questionId}` });
        }
        
        const validValues = question.options.map(opt => opt.value);
        if (!validValues.includes(value)) {
          return res.status(400).json({ 
            error: `Invalid response value "${value}" for question ${questionId}. Must be one of: ${validValues.join(', ')}`
          });
        }
      }

      // Calculate final score
      const score = calculateTFAScore(responses);
      const sectionScores = calculateSectionScores(responses);

      // Update TFA with responses and mark as complete
      await storage.updateTFAResponses(req.params.id, responses, score);
      const assessment = await storage.completeTFA(req.params.id, score);
      
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Update workflow status
      await storage.updateWorkflowStatus(assessment.workflowId, "tfa_readiness");

      res.json({ 
        assessment, 
        score,
        sectionScores,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/tfa/:id", async (req, res) => {
    try {
      const success = await storage.deleteTFAAssessment(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Fill knowledge gaps endpoint
  app.patch("/api/tfa/:id/fill-gaps", async (req, res) => {
    try {
      const validatedData = fillGapsSchema.parse(req.body);
      const { gapResponses } = validatedData;

      // Get the current assessment
      const assessment = await storage.getTFAAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Validate gap responses
      for (const [questionId, gapData] of Object.entries(gapResponses)) {
        const question = TFA_QUESTIONS.find(q => q.id.toString() === questionId);
        if (!question) {
          return res.status(400).json({ error: `Invalid question ID: ${questionId}` });
        }

        const validValues = question.options.map(opt => opt.value);
        if (!validValues.includes(gapData.value)) {
          return res.status(400).json({ 
            error: `Invalid response value "${gapData.value}" for question ${questionId}. Must be one of: ${validValues.join(', ')}`
          });
        }

        // Ensure it's not "Don't Know" again
        if (gapData.value === "0") {
          return res.status(400).json({ 
            error: `Cannot fill gap with "Don't Know" response for question ${questionId}`
          });
        }
      }

      // Merge gap responses into existing responses
      const currentResponses = (assessment.responses as Record<string, string>) || {};
      const updatedResponses = { ...currentResponses };
      
      for (const [questionId, gapData] of Object.entries(gapResponses)) {
        updatedResponses[questionId] = gapData.value;
      }

      // Recalculate score with filled gaps
      const updatedScore = calculateTFAScore(updatedResponses);
      const sectionScores = calculateSectionScores(updatedResponses);

      // Update assessment with filled gaps
      const updated = await storage.fillTFAGaps(
        req.params.id,
        gapResponses,
        updatedResponses,
        updatedScore
      );

      if (!updated) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      res.json({ 
        assessment: updated,
        score: updatedScore,
        sectionScores,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Unmark knowledge gap endpoint
  app.patch("/api/tfa/:id/unmark-gap", async (req, res) => {
    try {
      const validatedData = unmarkGapSchema.parse(req.body);
      const { questionId } = validatedData;

      // Get the current assessment
      const assessment = await storage.getTFAAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Check if the question is actually marked
      const responseSources = (assessment.responseSources as Record<string, any>) || {};
      if (!responseSources[questionId]) {
        return res.status(400).json({ error: `Question ${questionId} is not marked as a knowledge gap` });
      }

      // Unmark the gap
      const updated = await storage.unmarkTFAGap(req.params.id, questionId);

      if (!updated) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Recalculate scores for response
      const updatedResponses = (updated.responses as Record<string, string>) || {};
      const updatedScore = calculateTFAScore(updatedResponses);
      const sectionScores = calculateSectionScores(updatedResponses);

      res.json({ 
        assessment: updated,
        score: updatedScore,
        sectionScores,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PIF (Process Insight Form)
  app.get("/api/pif/questions", (req, res) => {
    res.json({ questions: ALL_PIF_QUESTIONS });
  });

  app.post("/api/workflows/:workflowId/pif/submit", async (req, res) => {
    try {
      const validatedData = pifSubmitSchema.parse(req.body);
      const { respondentName, respondentRole, respondentResponsibilities, responses, roiInputs, qualitativeResponses } = validatedData;

      // Verify workflow exists
      const workflow = await storage.getWorkflow(req.params.workflowId);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      // Calculate operational scores
      const scores = calculatePIFScores(responses);
      
      // Extract ROI inputs
      const extractedROI = extractROIInputs(responses);
      const finalROI = roiInputs || extractedROI;
      
      // Extract qualitative responses
      const extractedQualitative = extractQualitativeResponses(responses);
      const finalQualitative = qualitativeResponses || extractedQualitative;

      // Create PIF response
      const pifResponse = await storage.createPIFResponse({
        workflowId: req.params.workflowId,
        respondentName,
        respondentRole,
        respondentResponsibilities: respondentResponsibilities || null,
        responses,
        processClarity: scores.processClarity,
        changeMagnitude: scores.changeMagnitude,
        workflowBrittleness: scores.workflowBrittleness,
        roiInputs: finalROI,
        qualitativeResponses: finalQualitative,
        completedAt: new Date(),
      });

      res.status(201).json(pifResponse);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/workflows/:workflowId/pif", async (req, res) => {
    try {
      const responses = await storage.getAllPIFResponsesForWorkflow(req.params.workflowId);
      
      // Calculate aggregated scores with variance
      const aggregated = calculateAggregatedPIFScores(responses);
      
      res.json({
        responses,
        aggregated
      });
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/pif/shareable/:shareableId", async (req, res) => {
    try {
      // For PIF, shareableId IS the workflowId (no separate registration needed)
      const workflow = await storage.getWorkflow(req.params.shareableId);
      if (!workflow) {
        return res.status(404).json({ error: "Survey not found" });
      }

      const company = await storage.getCompany(workflow.companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      res.json({
        workflow,
        company,
        shareableId: req.params.shareableId
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/pif/:id", async (req, res) => {
    try {
      const success = await storage.deletePIFResponse(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Response not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Business Impact
  app.get("/api/workflows/:workflowId/business-impact", async (req, res) => {
    try {
      const impact = await storage.getBusinessImpact(req.params.workflowId);
      res.json(impact || null);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workflows/:workflowId/business-impact", async (req, res) => {
    try {
      const validatedData = insertBusinessImpactSchema.parse({
        ...req.body,
        workflowId: req.params.workflowId,
      });
      const impact = await storage.createBusinessImpact(validatedData);
      res.status(201).json(impact);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/workflows/:workflowId/business-impact", async (req, res) => {
    try {
      const validatedData = updateBusinessImpactSchema.parse(req.body);

      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "At least one field to update is required" });
      }

      const impact = await storage.updateBusinessImpact(req.params.workflowId, validatedData);
      if (!impact) {
        return res.status(404).json({ error: "Business impact not found" });
      }
      res.json(impact);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/workflows/:workflowId/business-impact", async (req, res) => {
    try {
      const success = await storage.deleteBusinessImpact(req.params.workflowId);
      if (!success) {
        return res.status(404).json({ error: "Business impact not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Implementation Opportunities
  app.get("/api/workflows/:workflowId/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getAllOpportunitiesForWorkflow(req.params.workflowId);
      res.json(opportunities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/companies/:companyId/opportunities", async (req, res) => {
    try {
      const opportunities = await storage.getAllOpportunitiesForCompany(req.params.companyId);
      res.json(opportunities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/opportunities/:id", async (req, res) => {
    try {
      const opportunity = await storage.getImplementationOpportunity(req.params.id);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workflows/:workflowId/opportunities", async (req, res) => {
    try {
      const validatedData = insertImplementationOpportunitySchema.parse({
        ...req.body,
        workflowId: req.params.workflowId,
      });
      const opportunity = await storage.createImplementationOpportunity(validatedData);
      res.status(201).json(opportunity);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/opportunities/:id", async (req, res) => {
    try {
      const validatedData = updateImplementationOpportunitySchema.parse(req.body);

      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "At least one field to update is required" });
      }

      const opportunity = await storage.updateImplementationOpportunity(req.params.id, validatedData);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.json(opportunity);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/opportunities/:id", async (req, res) => {
    try {
      const success = await storage.deleteImplementationOpportunity(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
