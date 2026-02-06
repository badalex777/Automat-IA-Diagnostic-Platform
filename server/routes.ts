import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import { 
  insertCompanySchema,
  updateCompanySchema,
  insertWorkflowSchema,
  updateWorkflowSchema,
  insertWorkflowStepSchema,
  updateWorkflowStepSchema,
  insertTFAAssessmentSchema,
  tfaResponsesSchema,
  fillGapsSchema,
  unmarkGapSchema,
  pifSubmitSchema,
  insertBusinessImpactSchema,
  updateBusinessImpactSchema,
  insertImplementationOpportunitySchema,
  updateImplementationOpportunitySchema,
  insertWorkflowConsolidationSchema,
  updateWorkflowConsolidationSchema,
} from "@shared/schema";
import { TFA_QUESTIONS, calculateTFAScore, calculateSectionScores } from "@shared/tfaQuestions";
import { ALL_PIF_QUESTIONS, calculatePIFScores, extractROIInputs, extractQualitativeResponses } from "@shared/pifQuestions";
import { calculateAggregatedPIFScores } from "@shared/pifCalculations";
import { aggregateCompanyDiagnosticData } from "./reportDataAggregator";
import { generateExecutiveReport, ReportValidationError } from "./reportGenerator";
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
      // Get language from query parameter (default: 'en')
      const language = (req.query.lang as string || 'en').toLowerCase();
      
      // Validate language parameter
      if (language !== 'en' && language !== 'es') {
        return res.status(400).json({ error: "Invalid language parameter. Must be 'en' or 'es'" });
      }
      
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

      // Generate the Word document with selected language
      const buffer = await generateExecutiveReport(diagnosticData, language as 'en' | 'es');

      // Set headers for file download
      const companyName = diagnosticData.company.name.replace(/[^a-z0-9]/gi, '_');
      const locale = language === 'es' ? 'es-ES' : 'en-US';
      const diagnosticPeriod = diagnosticData.diagnosticPeriod.end.toLocaleDateString(locale, { month: 'short', year: 'numeric' }).replace(' ', '_');
      const langSuffix = language === 'es' ? '_ES' : '_EN';
      const filename = `Athenia_Executive_Diagnostic_Report_${companyName}_${diagnosticPeriod}${langSuffix}.docx`;
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length);
      
      res.send(buffer);
    } catch (error: any) {
      console.error('Error generating executive report:', error);
      
      // Check if this is a validation error (from pre-export validation)
      if (error.name === 'ReportValidationError') {
        return res.status(400).json({ 
          error: error.message, 
          validationErrors: error.validationErrors 
        });
      }
      
      // All other errors are internal server errors
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

  // Get assessment status for workflow (which steps have TFA and PIF completed)
  app.get("/api/workflows/:workflowId/assessment-status", async (req, res) => {
    try {
      const { workflowId } = req.params;
      
      // Get TFA assessment for workflow
      const tfaAssessment = await storage.getTFAByWorkflowId(workflowId);
      // TFA is complete only if it exists AND has completedAt timestamp
      const hasTFA = !!tfaAssessment && !!tfaAssessment.completedAt;
      
      // Get all workflow steps
      const steps = await storage.getWorkflowStepsByWorkflow(workflowId);
      
      // Get all PIF responses for this workflow
      const allPIFs = await storage.getAllPIFResponsesForWorkflow(workflowId);
      
      // Build assessment status for each step
      const stepStatuses = steps.map(step => {
        // Check if this step has any COMPLETED PIF responses (not just any PIF)
        const hasPIF = allPIFs.some(pif => pif.stepId === step.id && !!pif.completedAt);
        
        return {
          stepId: step.id,
          stepName: step.stepName,
          stepOrder: step.stepOrder,
          hasPIF,
          isComplete: hasTFA && hasPIF, // Both TFA (workflow-level) and PIF (step-level) must be COMPLETED
        };
      });
      
      res.json({
        workflowId,
        hasTFA,
        steps: stepStatuses,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Workflow Steps
  app.get("/api/workflows/:workflowId/steps", async (req, res) => {
    try {
      const steps = await storage.getWorkflowStepsByWorkflow(req.params.workflowId);
      res.json(steps);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workflows/:workflowId/steps", async (req, res) => {
    try {
      const validatedData = insertWorkflowStepSchema.parse({
        ...req.body,
        workflowId: req.params.workflowId,
      });

      // Check if step number already exists in this workflow
      const existingSteps = await storage.getWorkflowStepsByWorkflow(req.params.workflowId);
      const duplicateStep = existingSteps.find(s => s.stepOrder === validatedData.stepOrder);
      if (duplicateStep) {
        return res.status(400).json({ 
          error: `Step number ${validatedData.stepOrder} already exists for step "${duplicateStep.stepName}". Please choose a different number.` 
        });
      }

      const step = await storage.createWorkflowStep(validatedData);
      res.status(201).json(step);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/steps/:id", async (req, res) => {
    try {
      const step = await storage.getWorkflowStep(req.params.id);
      if (!step) {
        return res.status(404).json({ error: "Workflow step not found" });
      }
      res.json(step);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/steps/:id", async (req, res) => {
    try {
      const validatedData = updateWorkflowStepSchema.parse(req.body);
      
      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "At least one field to update is required" });
      }

      const step = await storage.updateWorkflowStep(req.params.id, validatedData);
      if (!step) {
        return res.status(404).json({ error: "Workflow step not found" });
      }
      res.json(step);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/steps/:id", async (req, res) => {
    try {
      const success = await storage.deleteWorkflowStep(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Workflow step not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
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

      // Return only non-sensitive metadata (no questions, no verification code)
      // This allows anyone to see the intro/welcome page without validating access code
      res.json({
        shareableId: req.params.shareableId,
        companyName: company.name,
        workflowName: workflow.name,
        workflowId: assessment.workflowId,
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
      await storage.updateTFAResponses(
        assessment.id, 
        responses, 
        score, 
        comments, 
        initialRespondent, 
        initialRespondentRole, 
        gapMetadata
      );
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

  // Create PIF shareable link with verification code
  app.post("/api/workflows/:workflowId/pif/create-shareable", async (req, res) => {
    try {
      const { workflowId } = req.params;
      const { stepId } = req.body;

      // Verify workflow exists
      const workflow = await storage.getWorkflow(workflowId);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      // If stepId is provided, verify the step exists and belongs to this workflow
      if (stepId) {
        const step = await storage.getWorkflowStep(stepId);
        if (!step) {
          return res.status(404).json({ error: "Workflow step not found" });
        }
        if (step.workflowId !== workflowId) {
          return res.status(400).json({ error: "Step does not belong to this workflow" });
        }
      }

      // Create a template PIF response with verification code
      const pifTemplate = await storage.createPIFResponse({
        workflowId,
        stepId: stepId || null,
        respondentName: '', // Empty until filled
        respondentRole: '', // Empty until filled
        respondentResponsibilities: null,
        responses: {},
        processClarity: null,
        changeMagnitude: null,
        workflowBrittleness: null,
        roiInputs: {},
        qualitativeResponses: {},
        email: null,
        verificationToken: null,
        verified: false,
        verifiedAt: null,
        completedAt: null, // Not completed yet
      });

      res.status(201).json({ 
        shareableId: pifTemplate.shareableId,
        workflow,
        step: stepId ? await storage.getWorkflowStep(stepId) : null
      });
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/workflows/:workflowId/pif/submit", async (req, res) => {
    try {
      const validatedData = pifSubmitSchema.parse(req.body);
      const { respondentName, respondentRole, respondentResponsibilities, responses, stepId, roiInputs, qualitativeResponses, email } = validatedData;

      // Verify workflow exists
      const workflow = await storage.getWorkflow(req.params.workflowId);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      // If stepId is provided, verify the step exists and belongs to this workflow
      if (stepId) {
        const step = await storage.getWorkflowStep(stepId);
        if (!step) {
          return res.status(404).json({ error: "Workflow step not found" });
        }
        if (step.workflowId !== req.params.workflowId) {
          return res.status(400).json({ error: "Step does not belong to this workflow" });
        }
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
        stepId: stepId || null,
        respondentName,
        respondentRole,
        respondentResponsibilities: respondentResponsibilities || null,
        responses,
        processClarity: scores.processClarity,
        changeMagnitude: scores.changeMagnitude,
        workflowBrittleness: scores.workflowBrittleness,
        roiInputs: finalROI,
        qualitativeResponses: finalQualitative,
        email: email || null,
        verificationToken: null,
        verified: true,
        verifiedAt: new Date(),
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
      // Fetch the PIF template by shareableId
      const templates = await storage.getPIFByShareableId(req.params.shareableId);
      if (!templates || templates.length === 0) {
        return res.status(404).json({ error: "Survey not found" });
      }
      
      const template = templates[0]; // Use first template (all should have same workflow/step)
      
      const workflow = await storage.getWorkflow(template.workflowId);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      const company = await storage.getCompany(workflow.companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Return only non-sensitive metadata (no questions, no verification code)
      // This allows anyone to see the disclaimer without validating access code
      res.json({
        shareableId: req.params.shareableId,
        companyName: company.name,
        workflowName: workflow.name,
        stepId: template.stepId,
        // Disclaimer text will be fetched from PIF_QUESTIONS in frontend
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/pif/shareable/:shareableId/submit", async (req, res) => {
    try {
      console.log('[PIF Shareable Submit] Received request:', {
        shareableId: req.params.shareableId,
        bodyKeys: Object.keys(req.body),
        responsesCount: req.body.responses ? Object.keys(req.body.responses).length : 0,
      });

      const validatedData = pifSubmitSchema.parse(req.body);
      const { respondentName, respondentRole, respondentResponsibilities, shareableId, responses, stepId, email } = validatedData;

      console.log('[PIF Shareable Submit] Validated data:', {
        respondentName,
        respondentRole,
        shareableId,
        email,
        responsesCount: Object.keys(responses).length,
      });

      // Get PIF template by shareableId
      const templates = await storage.getPIFByShareableId(shareableId);
      if (!templates || templates.length === 0) {
        console.log('[PIF Shareable Submit] No templates found for shareableId:', shareableId);
        return res.status(404).json({ error: "Survey not found" });
      }

      const template = templates[0];
      console.log('[PIF Shareable Submit] Found template:', {
        templateId: template.id,
        templateShareableId: template.shareableId,
        templateWorkflowId: template.workflowId,
        templateStepId: template.stepId,
      });

      // Calculate PIF scores from responses
      const pifScores = calculatePIFScores(responses);
      const roiInputs = extractROIInputs(responses);
      const qualitativeResponses = extractQualitativeResponses(responses);

      console.log('[PIF Shareable Submit] Calculated scores and extracted data:', {
        pifScores,
        roiInputs,
        qualitativeResponses,
      });

      // Create new PIF response with verified data and calculated scores
      const newResponseData = {
        workflowId: template.workflowId,
        stepId: template.stepId || null, // Use stepId from template, not request body
        respondentName,
        respondentRole,
        respondentResponsibilities,
        email: email || null,
        responses,
        processClarity: pifScores.processClarity,
        changeMagnitude: pifScores.changeMagnitude,
        workflowBrittleness: pifScores.workflowBrittleness,
        roiInputs,
        qualitativeResponses,
        verified: true,
        completedAt: new Date(), // Mark as completed on submission
      };

      console.log('[PIF Shareable Submit] Creating new PIF response with data:', {
        workflowId: newResponseData.workflowId,
        stepId: newResponseData.stepId,
        respondentName: newResponseData.respondentName,
        email: newResponseData.email,
        responsesCount: Object.keys(newResponseData.responses).length,
        roiInputsKeys: Object.keys(newResponseData.roiInputs),
        hasCompletedAt: !!newResponseData.completedAt,
      });

      const pifResponse = await storage.createPIFResponse(newResponseData);

      console.log('[PIF Shareable Submit] PIF response created successfully:', {
        id: pifResponse.id,
        shareableId: pifResponse.shareableId,
        completedAt: pifResponse.completedAt,
        responsesCount: pifResponse.responses ? Object.keys(pifResponse.responses as Record<string, string>).length : 0,
        roiInputs: pifResponse.roiInputs,
      });

      res.status(201).json(pifResponse);
    } catch (error: any) {
      console.error('[PIF Shareable Submit] Error:', error);
      if (error.name === 'ZodError') {
        console.error('[PIF Shareable Submit] Zod validation error:', error.issues);
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
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

  app.get("/api/companies/:companyId/consolidations", async (req, res) => {
    try {
      const consolidations = await storage.getConsolidationsByCompany(req.params.companyId);
      res.json(consolidations);
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
      const opportunityId = req.params.id;
      
      // Get the opportunity to find its workflow
      const opportunity = await storage.getImplementationOpportunity(opportunityId);
      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }

      // Get all consolidations for this workflow
      const consolidations = await storage.getConsolidationsByWorkflow(opportunity.workflowId);
      
      // Find consolidations that include this opportunity
      const affectedConsolidations = consolidations.filter(c => 
        c.opportunityIds.includes(opportunityId)
      );

      // Update or delete affected consolidations
      for (const consolidation of affectedConsolidations) {
        const newOpportunityIds = consolidation.opportunityIds.filter(id => id !== opportunityId);
        
        if (newOpportunityIds.length < 2) {
          // Delete consolidation if fewer than 2 constituents remain
          await storage.deleteWorkflowConsolidation(consolidation.id);
        } else {
          // Update consolidation with remaining opportunity IDs
          await storage.updateWorkflowConsolidation(consolidation.id, {
            opportunityIds: newOpportunityIds
          });
        }
      }

      // Delete the opportunity
      const success = await storage.deleteImplementationOpportunity(opportunityId);
      if (!success) {
        return res.status(404).json({ error: "Opportunity not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Workflow Consolidations
  app.post("/api/workflows/:workflowId/consolidations", async (req, res) => {
    try {
      const validatedData = insertWorkflowConsolidationSchema.parse({
        ...req.body,
        workflowId: req.params.workflowId,
      });

      const consolidation = await storage.createWorkflowConsolidation(validatedData);
      res.status(201).json(consolidation);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/workflows/:workflowId/consolidations", async (req, res) => {
    try {
      const consolidations = await storage.getConsolidationsByWorkflow(req.params.workflowId);
      res.json(consolidations);
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/consolidations/:id", async (req, res) => {
    try {
      const consolidation = await storage.getWorkflowConsolidation(req.params.id);
      if (!consolidation) {
        return res.status(404).json({ error: "Consolidation not found" });
      }
      res.json(consolidation);
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/consolidations/:id", async (req, res) => {
    try {
      const validatedData = updateWorkflowConsolidationSchema.parse(req.body);

      if (Object.keys(validatedData).length === 0) {
        return res.status(400).json({ error: "At least one field to update is required" });
      }

      const consolidation = await storage.updateWorkflowConsolidation(req.params.id, validatedData);
      if (!consolidation) {
        return res.status(404).json({ error: "Consolidation not found" });
      }
      res.json(consolidation);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/consolidations/:id", async (req, res) => {
    try {
      const success = await storage.deleteWorkflowConsolidation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Consolidation not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
