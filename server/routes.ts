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
} from "@shared/schema";
import { TFA_QUESTIONS, calculateTFAScore, calculateSectionScores } from "@shared/tfaQuestions";
import { ALL_PIF_QUESTIONS, calculatePIFScores, extractROIInputs, extractQualitativeResponses } from "@shared/pifQuestions";
import { calculateAggregatedPIFScores } from "@shared/pifCalculations";
import { aggregateCompanyDiagnosticData } from "./reportDataAggregator";
import { generateExecutiveReport, ReportValidationError } from "./reportGenerator";
import { sendVerificationEmail, generateVerificationToken } from "./emailService";

/**
 * Generate bilingual HTML page for successful email verification
 */
function getVerificationSuccessHTML(language: 'en' | 'es', formType: 'tfa' | 'pif', alreadyVerified: boolean): string {
  const content = {
    en: {
      title: alreadyVerified ? 'Already Verified' : 'Email Verified Successfully',
      heading: alreadyVerified ? 'Already Verified' : 'Email Verified!',
      message: alreadyVerified
        ? `Your ${formType === 'tfa' ? 'Technical Feasibility Assessment' : 'Process Insight Form'} submission has already been verified.`
        : `Thank you! Your ${formType === 'tfa' ? 'Technical Feasibility Assessment' : 'Process Insight Form'} submission has been successfully verified.`,
      info: 'Your responses will be included in the diagnostic analysis and final report.',
      closing: 'You may now close this window.',
    },
    es: {
      title: alreadyVerified ? 'Ya Verificado' : 'Correo Verificado Exitosamente',
      heading: alreadyVerified ? 'Ya Verificado' : '¡Correo Verificado!',
      message: alreadyVerified
        ? `Su envío de ${formType === 'tfa' ? 'Evaluación de Viabilidad Técnica' : 'Formulario de Información de Proceso'} ya ha sido verificado.`
        : `¡Gracias! Su envío de ${formType === 'tfa' ? 'Evaluación de Viabilidad Técnica' : 'Formulario de Información de Proceso'} ha sido verificado exitosamente.`,
      info: 'Sus respuestas se incluirán en el análisis diagnóstico y el informe final.',
      closing: 'Ahora puede cerrar esta ventana.',
    },
  };

  const text = content[language];

  return `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${text.title}</title>
      <style>
        body {
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 90%;
          padding: 48px 32px;
          text-align: center;
        }
        .icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: ${alreadyVerified ? '#64748b' : '#10b981'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .checkmark {
          color: white;
          font-size: 48px;
          font-weight: bold;
        }
        h1 {
          color: #0f172a;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }
        p {
          color: #475569;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }
        .info {
          background: #f1f5f9;
          border-left: 4px solid ${alreadyVerified ? '#64748b' : '#10b981'};
          padding: 16px;
          margin: 24px 0;
          text-align: left;
          border-radius: 4px;
        }
        .closing {
          color: #64748b;
          font-size: 14px;
          margin-top: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">
          <div class="checkmark">✓</div>
        </div>
        <h1>${text.heading}</h1>
        <p>${text.message}</p>
        <div class="info">
          <p style="margin: 0;">${text.info}</p>
        </div>
        <p class="closing">${text.closing}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate bilingual HTML page for email verification errors
 */
function getVerificationErrorHTML(language: 'en' | 'es'): string {
  const content = {
    en: {
      title: 'Verification Error',
      heading: 'Verification Failed',
      message: 'We were unable to verify your email address. This verification link may have expired or is invalid.',
      suggestions: [
        'The verification link may have been already used',
        'The link may have expired (links are valid for 7 days)',
        'The link may be incomplete or corrupted',
      ],
      contact: 'If you continue to experience issues, please contact your diagnostic coordinator.',
    },
    es: {
      title: 'Error de Verificación',
      heading: 'Verificación Fallida',
      message: 'No pudimos verificar su dirección de correo electrónico. Este enlace de verificación puede haber expirado o no ser válido.',
      suggestions: [
        'El enlace de verificación puede haber sido utilizado anteriormente',
        'El enlace puede haber expirado (los enlaces son válidos por 7 días)',
        'El enlace puede estar incompleto o corrupto',
      ],
      contact: 'Si continúa experimentando problemas, comuníquese con su coordinador de diagnóstico.',
    },
  };

  const text = content[language];

  return `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${text.title}</title>
      <style>
        body {
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 90%;
          padding: 48px 32px;
          text-align: center;
        }
        .icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .error-mark {
          color: white;
          font-size: 48px;
          font-weight: bold;
        }
        h1 {
          color: #0f172a;
          font-size: 28px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }
        p {
          color: #475569;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }
        .suggestions {
          background: #fef2f2;
          border-left: 4px solid #ef4444;
          padding: 16px;
          margin: 24px 0;
          text-align: left;
          border-radius: 4px;
        }
        .suggestions ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
          color: #475569;
        }
        .suggestions li {
          margin-bottom: 8px;
        }
        .contact {
          background: #f1f5f9;
          padding: 16px;
          border-radius: 4px;
          margin-top: 24px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">
          <div class="error-mark">✕</div>
        </div>
        <h1>${text.heading}</h1>
        <p>${text.message}</p>
        <div class="suggestions">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f172a;">${language === 'en' ? 'Possible reasons:' : 'Posibles razones:'}</p>
          <ul>
            ${text.suggestions.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div class="contact">
          <p style="margin: 0;">${text.contact}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

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
      const filename = `Automat-IA_Executive_Diagnostic_Report_${companyName}_${diagnosticPeriod}${langSuffix}.docx`;
      
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
      const { responses, comments, initialRespondent, initialRespondentRole, gapMetadata, email } = validatedData;

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

      // Handle email verification if email provided
      let verificationToken: string | undefined;
      let emailSent = false;
      
      if (email && email.trim().length > 0) {
        verificationToken = generateVerificationToken();
        
        // Get workflow and company data for email template
        const workflow = await storage.getWorkflow(assessment.workflowId);
        if (workflow) {
          const company = await storage.getCompany(workflow.companyId);
          if (company) {
            // Detect language from comments or default to English
            const language = (comments && comments.toLowerCase().includes('español')) ? 'es' : 'en';
            
            const emailResult = await sendVerificationEmail({
              recipientEmail: email,
              recipientName: initialRespondent || 'Respondent',
              verificationToken,
              formType: 'tfa',
              workflowName: workflow.name,
              companyName: company.name,
              language,
            });
            
            emailSent = emailResult.success;
            console.log(`[TFA Submission] Email verification ${emailSent ? 'sent' : 'failed'} for ${email}`);
          }
        }
      }

      // Update TFA with responses and mark as complete with all data in one operation
      await storage.updateTFAResponses(
        assessment.id, 
        responses, 
        score, 
        comments, 
        initialRespondent, 
        initialRespondentRole, 
        gapMetadata,
        email,
        verificationToken
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
        emailSent,
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

      // Handle email verification if email provided
      let verificationToken: string | undefined;
      let emailSent = false;
      
      if (email && email.trim().length > 0) {
        verificationToken = generateVerificationToken();
        
        // Get company data for email template
        const company = await storage.getCompany(workflow.companyId);
        if (company) {
          // Detect language from respondent responsibilities or default to English
          const language = (respondentResponsibilities && respondentResponsibilities.toLowerCase().includes('español')) ? 'es' : 'en';
          
          const emailResult = await sendVerificationEmail({
            recipientEmail: email,
            recipientName: respondentName,
            verificationToken,
            formType: 'pif',
            workflowName: workflow.name,
            companyName: company.name,
            language,
          });
          
          emailSent = emailResult.success;
          console.log(`[PIF Submission] Email verification ${emailSent ? 'sent' : 'failed'} for ${email}`);
        }
      }

      // Create PIF response with email and verification token
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
        verificationToken: verificationToken || null,
        verified: false,
        completedAt: new Date(),
      });

      res.status(201).json({ ...pifResponse, emailSent });
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

  // TFA Email Verification Endpoint
  app.get("/api/tfa/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Find TFA assessment by verification token
      const assessment = await storage.getTFAByVerificationToken(token);
      
      if (!assessment) {
        return res.status(404).send(getVerificationErrorHTML('en'));
      }

      // Check if already verified
      if (assessment.verified) {
        return res.send(getVerificationSuccessHTML('en', 'tfa', true));
      }

      // Verify the assessment
      await storage.verifyTFA(token);
      
      res.send(getVerificationSuccessHTML('en', 'tfa', false));
    } catch (error: any) {
      console.error('[TFA Verification] Error:', error);
      res.status(500).send(getVerificationErrorHTML('en'));
    }
  });

  // PIF Email Verification Endpoint
  app.get("/api/pif/verify/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      // Find PIF response by verification token
      const pifResponse = await storage.getPIFByVerificationToken(token);
      
      if (!pifResponse) {
        return res.status(404).send(getVerificationErrorHTML('en'));
      }

      // Check if already verified
      if (pifResponse.verified) {
        return res.send(getVerificationSuccessHTML('en', 'pif', true));
      }

      // Verify the PIF response
      await storage.verifyPIF(token);
      
      res.send(getVerificationSuccessHTML('en', 'pif', false));
    } catch (error: any) {
      console.error('[PIF Verification] Error:', error);
      res.status(500).send(getVerificationErrorHTML('en'));
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
