import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  TableOfContents,
  WidthType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  convertInchesToTwip,
  Packer,
  type IRunOptions,
} from "docx";
import { DiagnosticData } from "./reportDataAggregator";
import { createReportContext, type ReportContext } from "./reportTranslations";
// Dynamic import will be used based on language parameter

/**
 * Custom error class for report validation failures
 */
export class ReportValidationError extends Error {
  constructor(message: string, public validationErrors: string[]) {
    super(message);
    this.name = 'ReportValidationError';
  }
}

// Automat-IA Brand Colors
const COLORS = {
  PRIMARY_GREEN: "10b981",
  LIGHT_GREEN: "6ee7b7",
  PALE_GREEN: "a7f3d0",
  BLACK: "000000",
  DARK_GRAY: "374151",
  MEDIUM_GRAY: "6b7280",
  LIGHT_GRAY: "d1d5db",
  WHITE: "FFFFFF",
};

// ===== HELPER FUNCTIONS =====
// Note: formatCurrency and formatNumber are now accessed via ctx.fmt.currency() and ctx.fmt.number()
// The context is created in generateExecutiveReport() and passed through helper functions

/**
 * Create a body paragraph with justified alignment (for content after cover page)
 */
function createBodyParagraph(text: string, options: {spacing?: any} = {}): Paragraph {
  return new Paragraph({
    text,
    alignment: AlignmentType.BOTH,
    spacing: options.spacing || { after: 120 },
  });
}

/**
 * Create a bulleted paragraph with proper docx bullets
 */
function createBulletParagraph(text: string): Paragraph {
  return new Paragraph({
    text,
    alignment: AlignmentType.BOTH,
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

/**
 * Format a template string by replacing {0}, {1}, {2}, etc. with provided values
 * @param template - Template string with {0}, {1}, {2}, etc. placeholders
 * @param values - Values to replace placeholders with
 * @returns Formatted string
 */
function formatTemplate(template: string, ...values: (string | number)[]): string {
  return values.reduce((str, value, index) => {
    return str.replace(new RegExp(`\\{${index}\\}`, 'g'), String(value));
  }, template);
}

/**
 * Create a table caption with bold formatting
 * @param tableNumber - The table number (e.g., "4.3")
 * @param description - The table description
 * @param tableLabel - The localized label for "Table" (e.g., "Table" or "Tabla")
 */
function createTableCaption(tableNumber: string, description: string, tableLabel: string = "Table"): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: `${tableLabel} ${tableNumber}: ${description}`, bold: true })],
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60 },
  });
}

/**
 * Create horizontal separator line for subsection breaks
 */
function createHorizontalSeparator(): Paragraph {
  return new Paragraph({
    border: {
      bottom: {
        color: COLORS.LIGHT_GRAY,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
    spacing: { before: 240, after: 240 },
  });
}

/**
 * Create paragraphs from multi-line text with smart formatting
 * - Detects phase titles and makes them bold
 * - Detects subsection titles and makes them headings
 * - Detects framework names and makes them bold with colons
 * - Groups consecutive lines into paragraphs
 */
function createTextParagraphs(text: string): Paragraph[] {
  const lines = text.split('\n');
  const paragraphs: Paragraph[] = [];
  let currentParagraph: string[] = [];

  const isPhaseTitle = (line: string): boolean => {
    return /^Phase\s+\d+[:\s]/.test(line.trim());
  };

  const isSubsectionTitle = (line: string): boolean => {
    // Matches patterns like "7.1 Title", "A.1 Title", "E.1 Title", "4.1 Title", etc.
    // BUT EXCLUDE methodology sub-phases 7.1-7.4 (they should be bold paragraphs, not headings)
    const trimmed = line.trim();
    if (/^7\.[1-4]\s+/.test(trimmed)) {
      return false; // Methodology sub-phases should not be headings
    }
    return /^(\d+\.\d+|[A-Z]\.\d+)\s+/.test(trimmed);
  };
  
  const isMethodologySubsection = (line: string): boolean => {
    // Matches methodology sub-phases like "7.1 Title", "7.2 Title", etc.
    return /^7\.[1-4]\s+/.test(line.trim());
  };
  
  const isFrameworkName = (line: string): boolean => {
    // Matches framework names like "Technical Feasibility Assessment (TFA):" or "Process Insights Form (PIF):"
    // Supports both English and Spanish versions
    const frameworks = [
      // English
      'Technical Feasibility Assessment',
      'Technical Feasibility Assessments',
      'Process Insights Form',
      'Process Insights Forms',
      'Stakeholder Interviews',
      'End-User Interviews',
      'Documentation Review',
      'Readiness Rubric',
      'Automat-IA ROI Calculator',
      'Opportunity Matrix',
      // Spanish
      'Evaluaciones de Factibilidad Técnica',
      'Evaluación de Factibilidad Técnica',
      'Formularios de Perspectivas de Proceso',
      'Formulario de Perspectivas de Proceso',
      'Entrevistas con Partes Interesadas',
      'Entrevistas con Usuarios Finales',
      'Revisión de Documentación',
      'Rúbrica de Preparación',
      'Calculadora de ROI de Automat-IA',
      'Matriz de Oportunidades'
    ];
    const trimmed = line.trim();
    return frameworks.some(fw => trimmed.startsWith(fw));
  };

  const isBulletPoint = (line: string): boolean => {
    // Matches lines starting with bullet symbols (•, -, *, ●)
    return /^[•\-\*●]\s+/.test(line.trim());
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        paragraphs.push(new Paragraph({
          text,
          alignment: AlignmentType.BOTH,
          spacing: { after: 120 },
        }));
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      // Blank line - flush current paragraph
      flushParagraph();
      continue;
    }

    if (isPhaseTitle(trimmed)) {
      // Flush any current paragraph first
      flushParagraph();
      // Add phase title as bold paragraph
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: trimmed, bold: true })],
        alignment: AlignmentType.BOTH,
        spacing: { before: 120, after: 60 },
      }));
      continue;
    }

    if (isMethodologySubsection(trimmed)) {
      // Flush any current paragraph first
      flushParagraph();
      // Methodology subsections are rendered as bold paragraphs (not headings) to exclude from ToC
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: trimmed, bold: true })],
        alignment: AlignmentType.BOTH,
        spacing: { before: 120, after: 60 },
      }));
      continue;
    }
    
    if (isSubsectionTitle(trimmed)) {
      // Flush any current paragraph first
      flushParagraph();
      // Add subsection as heading (will appear in ToC)
      paragraphs.push(new Paragraph({
        text: trimmed,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 120, after: 60 },
      }));
      continue;
    }
    
    if (isFrameworkName(trimmed)) {
      // Flush any current paragraph first
      flushParagraph();
      // Framework name paragraphs: bold the framework name up to the period or colon
      const match = trimmed.match(/^([^.]+(?:\([^)]+\))?[.:])(.*)$/);
      if (match) {
        const [, boldPart, rest] = match;
        paragraphs.push(new Paragraph({
          children: [
            new TextRun({ text: boldPart, bold: true }),
            new TextRun({ text: rest }),
          ],
          alignment: AlignmentType.BOTH,
          spacing: { after: 120 },
        }));
      } else {
        // Fallback if pattern doesn't match
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true })],
          alignment: AlignmentType.BOTH,
          spacing: { after: 120 },
        }));
      }
      continue;
    }

    if (isBulletPoint(trimmed)) {
      // Flush any current paragraph first
      flushParagraph();
      // Remove bullet symbol and create proper DOCX bullet paragraph
      const textWithoutBullet = trimmed.replace(/^[•\-\*●]\s+/, '');
      paragraphs.push(new Paragraph({
        text: textWithoutBullet,
        alignment: AlignmentType.BOTH,
        bullet: { level: 0 },
        spacing: { after: 60 },
      }));
      continue;
    }

    // Regular line - add to current paragraph
    currentParagraph.push(trimmed);
  }

  // Flush any remaining paragraph
  flushParagraph();

  return paragraphs;
}

/**
 * Create a heading paragraph
 */
function createHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]): Paragraph {
  return new Paragraph({
    text,
    heading: level,
  });
}

/**
 * Create a simple data table with borders
 */
function createTable(
  headers: string[],
  rows: string[][],
  columnWidths?: number[]
): Table {
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text: h, bold: true, color: COLORS.DARK_GRAY })],
        alignment: AlignmentType.CENTER,
      })],
      shading: {
        fill: COLORS.LIGHT_GREEN,
        type: ShadingType.CLEAR,
      },
      width: columnWidths ? { size: columnWidths[i], type: WidthType.PERCENTAGE } : undefined,
    })),
    tableHeader: true,
  });

  const dataRows = rows.map(row => new TableRow({
    children: row.map((cell, i) => new TableCell({
      children: [new Paragraph({ text: cell })],
      width: columnWidths ? { size: columnWidths[i], type: WidthType.PERCENTAGE } : undefined,
    })),
  }));

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.MEDIUM_GRAY },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.MEDIUM_GRAY },
      left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.MEDIUM_GRAY },
      right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.MEDIUM_GRAY },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.LIGHT_GRAY },
    },
  });
}

/**
 * Validate diagnostic data before report generation
 */
function validateDiagnosticData(data: DiagnosticData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // ===== COMPANY DATA VALIDATION =====
  if (!data.company.name || data.company.name.trim() === '') {
    errors.push('Company name is required');
  }
  if (!data.company.leadAnalystName || data.company.leadAnalystName.trim() === '') {
    errors.push('Lead Analyst name is required for cover page');
  }

  // ===== DIAGNOSTIC PERIOD VALIDATION =====
  if (!data.diagnosticPeriod.start || !data.diagnosticPeriod.end) {
    errors.push('Diagnostic period dates are required');
  }

  // ===== PORTFOLIO METRICS VALIDATION =====
  if (!Number.isFinite(data.portfolioMetrics.totalWorkflows) || data.portfolioMetrics.totalWorkflows <= 0) {
    errors.push('Total workflows must be a finite number greater than zero');
  }
  if (!Number.isFinite(data.portfolioMetrics.totalOpportunities)) {
    errors.push('Total opportunities must be a finite number');
  }
  if (!Number.isFinite(data.portfolioMetrics.totalAnnualBenefit)) {
    errors.push('Total annual benefit must be a finite number');
  }
  if (!Number.isFinite(data.portfolioMetrics.averagePaybackMonths)) {
    errors.push('Average payback period must be a finite number');
  }
  if (!Number.isFinite(data.portfolioMetrics.averageRoi)) {
    errors.push('Average ROI must be a finite number');
  }
  if (!Number.isFinite(data.portfolioMetrics.totalFteSavings)) {
    errors.push('Total FTE savings must be a finite number');
  }
  if (!data.portfolioMetrics.functionsList || data.portfolioMetrics.functionsList.trim() === '') {
    errors.push('Functions list is required for portfolio summary');
  }

  // ===== APPENDIX B VALIDATION (Step-Level SWOT) =====
  if (!data.appendixB || data.appendixB.length === 0) {
    errors.push('Appendix B data is missing - at least one workflow with TFA/PIF analysis is required');
  } else {
    data.appendixB.forEach((workflow, index) => {
      const prefix = `Appendix B workflow ${index + 1}`;
      
      if (!workflow.workflowName || workflow.workflowName.trim() === '') {
        errors.push(`${prefix}: Missing workflow name`);
      }
      
      // Validate step-level SWOTs
      if (workflow.stepLevelSWOTs && workflow.stepLevelSWOTs.length > 0) {
        workflow.stepLevelSWOTs.forEach((stepSWOT, stepIndex) => {
          const stepPrefix = `${prefix} step ${stepIndex + 1}`;
          
          if (!stepSWOT.stepName || stepSWOT.stepName.trim() === '') {
            errors.push(`${stepPrefix}: Missing step name`);
          }
          
          // Validate SWOT analysis data for step
          if (!stepSWOT.swotAnalysis) {
            errors.push(`${stepPrefix}: Missing SWOT analysis`);
          } else {
            if (!Array.isArray(stepSWOT.swotAnalysis.strengths)) {
              errors.push(`${stepPrefix}: Invalid SWOT strengths array`);
            }
            if (!Array.isArray(stepSWOT.swotAnalysis.weaknesses)) {
              errors.push(`${stepPrefix}: Invalid SWOT weaknesses array`);
            }
            if (!Array.isArray(stepSWOT.swotAnalysis.opportunities)) {
              errors.push(`${stepPrefix}: Invalid SWOT opportunities array`);
            }
            if (!Array.isArray(stepSWOT.swotAnalysis.threats)) {
              errors.push(`${stepPrefix}: Invalid SWOT threats array`);
            }
          }
        });
      }
      
      // Validate workflow-level SWOT if it exists
      if (workflow.workflowLevelSWOT) {
        const wlPrefix = `${prefix} workflow-level`;
        
        if (!workflow.workflowLevelSWOT.swotAnalysis) {
          errors.push(`${wlPrefix}: Missing SWOT analysis`);
        } else {
          if (!Array.isArray(workflow.workflowLevelSWOT.swotAnalysis.strengths)) {
            errors.push(`${wlPrefix}: Invalid SWOT strengths array`);
          }
          if (!Array.isArray(workflow.workflowLevelSWOT.swotAnalysis.weaknesses)) {
            errors.push(`${wlPrefix}: Invalid SWOT weaknesses array`);
          }
          if (!Array.isArray(workflow.workflowLevelSWOT.swotAnalysis.opportunities)) {
            errors.push(`${wlPrefix}: Invalid SWOT opportunities array`);
          }
          if (!Array.isArray(workflow.workflowLevelSWOT.swotAnalysis.threats)) {
            errors.push(`${wlPrefix}: Invalid SWOT threats array`);
          }
        }
      }
      
      // Ensure at least one SWOT exists (step-level or workflow-level)
      if ((!workflow.stepLevelSWOTs || workflow.stepLevelSWOTs.length === 0) && !workflow.workflowLevelSWOT) {
        errors.push(`${prefix} "${workflow.workflowName}": No SWOT analyses found (neither step-level nor workflow-level)`);
      }
    });
  }

  // ===== APPENDIX F VALIDATION =====
  if (!data.appendixF || data.appendixF.length === 0) {
    errors.push('Appendix F data is missing - data provenance information is required');
  } else {
    data.appendixF.forEach((provenance, index) => {
      const prefix = `Appendix F entry ${index + 1}`;
      
      if (!provenance.workflowName || provenance.workflowName.trim() === '') {
        errors.push(`${prefix}: Missing workflow name`);
      }
      if (!provenance.respondentName || provenance.respondentName.trim() === '') {
        errors.push(`${prefix} "${provenance.workflowName}": Missing respondent name`);
      }
      if (!provenance.respondentRole || provenance.respondentRole.trim() === '') {
        errors.push(`${prefix} "${provenance.workflowName}": Missing respondent role`);
      }
      if (!provenance.collectionMethod || provenance.collectionMethod.trim() === '') {
        errors.push(`${prefix} "${provenance.workflowName}": Missing collection method`);
      }
      if (!provenance.submissionDate || provenance.submissionDate.trim() === '') {
        errors.push(`${prefix} "${provenance.workflowName}": Missing submission date`);
      }
      if (!provenance.validationStatus || !['Complete', 'Pending', 'Partial'].includes(provenance.validationStatus)) {
        errors.push(`${prefix} "${provenance.workflowName}": Invalid or missing validation status`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate template variables are all populated
 */
function validateTemplateVars(vars: Record<string, string>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredKeys = [
    'company_name',
    'Lead_Analyst_Name',
    'Month',
    'diagnostic_period',
    'total_workflows',
    'workflow_count',
    'total_opportunities',
    'opportunity_count',
    'annual_benefit',
    'payback_period',
    'avg_payback',
    'roi_percent',
    'fte_savings',
    'functions_list',
    'quickwin_count',
    'diagnostic_date',
  ];

  for (const key of requiredKeys) {
    const value = vars[key];
    if (value === undefined || value === null || value.trim() === '') {
      errors.push(`Template variable '${key}' is empty or undefined`);
    }
    // Check for un-replaced template tokens
    if (value && value.includes('{{')) {
      errors.push(`Template variable '${key}' contains un-replaced token: ${value}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Main function to generate Executive Diagnostic Report
 * @param data - Aggregated diagnostic data
 * @param language - Report language ('en' or 'es'), defaults to 'en'
 */
export async function generateExecutiveReport(data: DiagnosticData, language: 'en' | 'es' = 'en'): Promise<Buffer> {
  // Dynamically import the correct language prompts
  const prompts = language === 'es' 
    ? await import("./reportPrompts_es")
    : await import("./reportPrompts");
  
  // Create report context with translations and formatters
  const ctx = createReportContext(language);
  
  // Destructure all needed constants from the selected language module
  const {
    EXECUTIVE_SUMMARY,
    CONFIDENTIALITY_DISCLAIMER,
    METHODOLOGY_OVERVIEW,
    DIAGNOSTIC_OVERVIEW_PART1,
    DIAGNOSTIC_OVERVIEW_PART2,
    DIAGNOSTIC_OVERVIEW_PART3,
    FINDINGS_ANALYSIS_PART1,
    FINDINGS_ANALYSIS_PART2,
    FINDINGS_ANALYSIS_PART3,
    FINDINGS_ANALYSIS_PART4,
    FINDINGS_ANALYSIS_PART5,
    FINDINGS_ANALYSIS_PART6,
    AUTOMATION_ROADMAP_INTRO,
    AUTOMATION_ROADMAP_PHASE1,
    AUTOMATION_ROADMAP_PHASE1_OUTCOMES,
    AUTOMATION_ROADMAP_PHASE2,
    AUTOMATION_ROADMAP_PHASE2_OUTCOMES,
    AUTOMATION_ROADMAP_PHASE3,
    AUTOMATION_ROADMAP_PHASE3_OUTCOMES,
    AUTOMATION_ROADMAP_SUMMARY,
    APPENDIX_A,
    APPENDIX_D_INTRO,
    APPENDIX_D_MODELING_NOTES,
    APPENDIX_E_PART1,
    APPENDIX_E_PART2,
    APPENDIX_E_PART3,
    APPENDIX_E_PART4,
    APPENDIX_E_PART5,
    TRANSLATIONS,
    replaceVariables,
    formatDiagnosticDate,
  } = prompts;
  // Pre-export validation - data structure
  const dataValidation = validateDiagnosticData(data);
  if (!dataValidation.valid) {
    throw new ReportValidationError(
      'Report generation validation failed',
      dataValidation.errors
    );
  }
  
  // Prepare template variables from aggregated data
  const diagnosticPeriod = formatDiagnosticDate(data.diagnosticPeriod.end); // Format: "Oct 2025"
  
  // Generate Quick Win list with workflow and step details
  const quickwinList = data.roadmapPhases.phase1QuickWins.length > 0
    ? data.roadmapPhases.phase1QuickWins
        .map((opp, idx) => `${idx + 1}. ${opp.opportunity.name} (${opp.workflow.name} - ${formatTemplate(ctx.t.formatStrings.stepFormat, opp.step.stepOrder, opp.step.name)})`)
        .join('\n')
    : ctx.t.fallbackMessages.noQuickWins;
  
  // Generate foundational gaps list from common SWOT weaknesses
  const allWeaknesses = data.appendixB
    .flatMap(wb => {
      // Collect weaknesses from both workflow-level and step-level SWOTs
      const weaknesses: string[] = [];
      if (wb.workflowLevelSWOT?.swotAnalysis?.weaknesses) {
        weaknesses.push(...wb.workflowLevelSWOT.swotAnalysis.weaknesses.slice(0, 2));
      }
      if (wb.stepLevelSWOTs) {
        wb.stepLevelSWOTs.forEach(step => {
          if (step.swotAnalysis?.weaknesses) {
            weaknesses.push(...step.swotAnalysis.weaknesses.slice(0, 1));
          }
        });
      }
      return weaknesses;
    })
    .filter((gap, idx, arr) => arr.indexOf(gap) === idx) // Remove duplicates
    .slice(0, 5); // Limit to top 5 unique gaps
  
  const foundationalGapsList = allWeaknesses.length > 0
    ? allWeaknesses.map((gap, idx) => `${idx + 1}. ${gap}`).join('\n')
    : ctx.t.fallbackMessages.noFoundationalGaps;
  
  // Generate Strategic Bets list
  const strategicBetsList = [...data.roadmapPhases.phase2Foundational, ...data.roadmapPhases.phase3Strategic].length > 0
    ? [...data.roadmapPhases.phase2Foundational, ...data.roadmapPhases.phase3Strategic]
        .slice(0, 5) // Limit to top 5
        .map((opp, idx) => `${idx + 1}. ${opp.opportunity.name} (${opp.workflow.name} - ${formatTemplate(ctx.t.formatStrings.stepFormat, opp.step.stepOrder, opp.step.name)})`)
        .join('\n')
    : ctx.t.fallbackMessages.noStrategicBets;
  
  // Generate Nice-to-Have list
  const allRoadmapOpps = [
    ...data.roadmapPhases.phase1QuickWins,
    ...data.roadmapPhases.phase2Foundational,
    ...data.roadmapPhases.phase3Strategic
  ];
  const niceToHaveOpportunities = allRoadmapOpps.filter(o => o.matrixPosition.quadrant === 'Nice-To-Haves');
  const niceToHaveList = niceToHaveOpportunities.length > 0
    ? niceToHaveOpportunities
        .map((opp, idx) => `${idx + 1}. ${opp.opportunity.name} (${opp.workflow.name} - ${formatTemplate(ctx.t.formatStrings.stepFormat, opp.step.stepOrder, opp.step.name)})`)
        .join('\n')
    : ctx.t.fallbackMessages.noNiceToHave;
  
  // Generate cultural readiness summary from PIF insights (broader filter)
  const allQuestionInsights = data.appendixB.flatMap(wb => {
    const insights: any[] = [];
    if (wb.workflowLevelSWOT?.questionInsights) {
      insights.push(...wb.workflowLevelSWOT.questionInsights);
    }
    if (wb.stepLevelSWOTs) {
      wb.stepLevelSWOTs.forEach(step => {
        if (step.questionInsights) {
          insights.push(...step.questionInsights);
        }
      });
    }
    return insights;
  });
  
  const culturalInsights = allQuestionInsights
    .filter((qi: any) => {
      const section = qi?.section || '';
      return section === 'Cultural Fit' || section === 'Change Management' || section.includes('Cultural') || section.includes('Change');
    })
    .filter((qi: any) => qi?.insight && qi.insight.trim().length > 0) // Ensure insight exists and is not empty
    .slice(0, 4);
  
  const culturalReadinessSummary = culturalInsights.length > 0
    ? culturalInsights.map((qi, idx) => `${idx + 1}. ${qi.insight}`).join('\n')
    : ctx.t.fallbackMessages.noCulturalInsights;

  // Calculate total consolidations across all workflows
  const totalConsolidations = data.workflows.reduce((sum: number, wd: any) => sum + wd.consolidations.length, 0);
  const consolidationCountLine = totalConsolidations > 0 
    ? `\n• Workflow Consolidations Identified: ${totalConsolidations}` 
    : '';

  const templateVars = {
    company_name: data.company.name,
    Lead_Analyst_Name: data.company.leadAnalystName || "[Lead Analyst Name]",
    Month: diagnosticPeriod,
    diagnostic_period: diagnosticPeriod,
    total_workflows: data.portfolioMetrics.totalWorkflows.toString(),
    workflow_count: data.portfolioMetrics.totalWorkflows.toString(),
    total_opportunities: data.portfolioMetrics.totalOpportunities.toString(),
    opportunity_count: data.portfolioMetrics.totalOpportunities.toString(),
    consolidation_count_line: consolidationCountLine,
    annual_benefit: ctx.fmt.currency(data.portfolioMetrics.totalAnnualBenefit),
    payback_period: Math.round(data.portfolioMetrics.averagePaybackMonths).toString(),
    avg_payback: Math.round(data.portfolioMetrics.averagePaybackMonths).toString(),
    roi_percent: ctx.fmt.number(data.portfolioMetrics.averageRoi, 1),
    fte_savings: ctx.fmt.number(data.portfolioMetrics.totalFteSavings, 2),
    functions_list: data.portfolioMetrics.functionsList,
    quickwin_count: data.matrixDistribution.quickWins.count.toString(),
    diagnostic_date: diagnosticPeriod,
    quickwin_list: quickwinList,
    foundational_gaps_list: foundationalGapsList,
    strategic_bets_list: strategicBetsList,
    nice_to_have_list: niceToHaveList,
    nice_to_have_count: data.matrixDistribution.niceToHaves.count.toString(),
    cultural_readiness_summary: culturalReadinessSummary,
  };

  // Pre-export validation - template variables
  const varsValidation = validateTemplateVars(templateVars);
  if (!varsValidation.valid) {
    throw new ReportValidationError(
      'Template variable validation failed',
      varsValidation.errors
    );
  }

  // Commentary placeholders that should be converted to [brackets]
  const commentaryKeys = [
    'readiness_commentary',
    'roi_commentary',
    'matrix_distribution_commentary',
    'executive_analysis_commentary',
    'quickwin_commentary',
    'foundational_commentary',
    'strategic_commentary',
    'roadmap_summary_commentary',
  ];

  // Generate document sections
  const sections: (Paragraph | Table | TableOfContents)[] = [];

  // ===== COVER PAGE =====
  sections.push(
    new Paragraph({
      text: ctx.t.coverPage.executiveDiagnosticReport.toUpperCase(),
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 1000, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: data.company.name,
          size: 28,
          bold: true,
          font: "Roboto",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: ctx.t.coverTitle,
          size: 24,
          font: "Roboto",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: `${ctx.t.labels.diagnosticPeriod}: ${diagnosticPeriod}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `${ctx.t.labels.leadAnalyst}: ${data.company.leadAnalystName || "[Lead Analyst Name]"}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `${ctx.t.labels.version}: v1 - ${ctx.fmt.monthYear(new Date())}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Automat-IA",
          size: 32,
          bold: true,
          color: COLORS.PRIMARY_GREEN,
          font: "Roboto",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 2000 },
    }),
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ===== EXECUTIVE SUMMARY =====
  sections.push(createHeading(ctx.t.sections.executiveSummary, HeadingLevel.HEADING_1));
  const execSummaryText = replaceVariables(EXECUTIVE_SUMMARY, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(execSummaryText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== CONFIDENTIALITY & DISCLAIMER =====
  sections.push(createHeading(ctx.t.sections.confidentialityDisclaimer, HeadingLevel.HEADING_1));
  const confidentialityText = replaceVariables(CONFIDENTIALITY_DISCLAIMER, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(confidentialityText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== TABLE OF CONTENTS =====
  sections.push(
    createHeading(ctx.t.labels.tableOfContents, HeadingLevel.HEADING_1),
    new TableOfContents(ctx.t.labels.tableOfContents, {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===== METHODOLOGY OVERVIEW =====
  sections.push(createHeading(ctx.t.sections.methodologyOverview, HeadingLevel.HEADING_1));
  const methodologyText = replaceVariables(METHODOLOGY_OVERVIEW, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(methodologyText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== DIAGNOSTIC OVERVIEW =====
  sections.push(createHeading(ctx.t.sections.diagnosticOverview, HeadingLevel.HEADING_1));
  
  // Part 1: Sections 4.1 and 4.2
  const diagnosticOverviewPart1 = replaceVariables(DIAGNOSTIC_OVERVIEW_PART1, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(diagnosticOverviewPart1));
  sections.push(createHorizontalSeparator());
  
  // Table 4.3: Top Three Opportunities
  if (data.top3Opportunities.length > 0) {
    sections.push(
      new Paragraph({
        text: "4.3 Top Three Automation Opportunities",
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.BOTH,
        spacing: { before: 240, after: 120 },
      })
    );

    const top3Headers = [ctx.t.headers.workflow, ctx.t.headers.opportunity, ctx.t.headers.annualBenefit, ctx.t.headers.roi, ctx.t.headers.payback, ctx.t.headers.fteSaved];
    const top3Rows = data.top3Opportunities.map(opp => [
      opp.workflowName,
      opp.opportunityName,
      ctx.fmt.currency(opp.annualBenefit),
      ctx.fmt.number(opp.roi, 0) + "%",
      Math.round(opp.paybackMonths).toString(),
      ctx.fmt.number(opp.fteSavings, 2),
    ]);
    sections.push(createTableCaption("4.3", ctx.t.tableCaptions["4.3"], ctx.t.labels.table));
    sections.push(createTable(top3Headers, top3Rows));
  }
  
  // Part 2: Commentary after Table 4.3
  const diagnosticOverviewPart2 = replaceVariables(DIAGNOSTIC_OVERVIEW_PART2, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(diagnosticOverviewPart2));
  sections.push(createHorizontalSeparator());
  
  // Table 4.4: Financial Summary of Top Opportunities
  if (data.top3Opportunities.length > 0) {
    sections.push(
      new Paragraph({
        text: "4.4 Financial Summary of Top Opportunities",
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.BOTH,
        spacing: { before: 360, after: 120 },
      })
    );

    const financialSummaryHeaders = [ctx.t.headers.metric, ctx.t.headers.value, ctx.t.headers.description];
    const totalTopBenefit = data.top3Opportunities.reduce((sum, opp) => sum + opp.annualBenefit, 0);
    const totalTopCost = data.top3Opportunities.reduce((sum, opp) => sum + parseFloat(opp.implementationCost || "0"), 0);
    const avgTopROI = data.top3Opportunities.reduce((sum, opp) => sum + opp.roi, 0) / data.top3Opportunities.length;
    const avgTopPayback = data.top3Opportunities.reduce((sum, opp) => sum + opp.paybackMonths, 0) / data.top3Opportunities.length;
    const totalTopFTE = data.top3Opportunities.reduce((sum, opp) => sum + opp.fteSavings, 0);

    const financialSummaryRows = [
      [`Total ${ctx.t.metricLabels.annualBenefit}`, ctx.fmt.currency(totalTopBenefit), ctx.t.metricLabels.combinedQuantifiableValue],
      [`Total ${ctx.t.metricLabels.estimatedImplementationCost}`, ctx.fmt.currency(totalTopCost), ctx.t.metricLabels.includesImplementationTraining],
      ["Average ROI", ctx.fmt.number(avgTopROI, 1) + "%", ctx.t.metricLabels.modeledConservativeFramework],
      [`Average ${ctx.t.metricLabels.paybackPeriod}`, ctx.fmt.number(avgTopPayback, 1) + " " + ctx.t.formatStrings.monthsAbbrev, ctx.t.metricLabels.timeToRecoverCost],
      [`Total ${ctx.t.metricLabels.fteSaved}`, ctx.fmt.number(totalTopFTE, 2), ctx.t.metricLabels.fteHoursFreed],
    ];

    sections.push(createTableCaption("4.4", ctx.t.tableCaptions["4.4"], ctx.t.labels.table));
    sections.push(createTable(financialSummaryHeaders, financialSummaryRows));
    sections.push(createBodyParagraph(ctx.t.appendixNarratives.allValuesModeledConservative));
  }
  sections.push(createHorizontalSeparator());
  
  // Part 3: Sections 4.5-4.9
  const diagnosticOverviewPart3 = replaceVariables(DIAGNOSTIC_OVERVIEW_PART3, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(diagnosticOverviewPart3));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== FINDINGS & ANALYSIS =====
  sections.push(createHeading(ctx.t.sections.findingsAnalysis, HeadingLevel.HEADING_1));
  
  // Part 1: 5.1 Introduction text
  const findingsPart1 = replaceVariables(FINDINGS_ANALYSIS_PART1, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart1));
  
  // Table 5.1: Readiness Summary - ONE ROW PER WORKFLOW (not per opportunity)
  const readinessHeaders = [ctx.t.headers.workflow, ctx.t.headers.tfaScore, ctx.t.headers.pifScore, ctx.t.headers.readiness, ctx.t.headers.band];
  const readinessRows: string[][] = [];

  // Group by workflow to avoid duplication
  const workflowMap = new Map<string, any>();
  data.workflows.forEach(w => {
    if (w.readiness && w.readiness.componentScores && !workflowMap.has(w.workflow.name)) {
      const readiness = w.readiness;
      const avgPIFScore = Math.round(
        (readiness.componentScores.processClarity + 
         readiness.componentScores.changeMagnitude + 
         readiness.componentScores.workflowBrittleness) / 3
      );
      
      workflowMap.set(w.workflow.name, {
        name: w.workflow.name,
        tfaScore: Math.round(w.tfa?.score || 0),
        pifScore: avgPIFScore,
        readiness: Math.round(readiness.totalScore),
        band: readiness.feasibilityBand,
      });
    }
  });

  workflowMap.forEach(w => {
    readinessRows.push([
      w.name,
      w.tfaScore + "%",
      w.pifScore + "%",
      w.readiness + "%",
      w.band,
    ]);
  });

  if (readinessRows.length > 0) {
    sections.push(createTableCaption("5.1", ctx.t.tableCaptions["5.1"], ctx.t.labels.table));
    sections.push(createTable(readinessHeaders, readinessRows));
  }
  
  // Part 2: Commentary after Table 5.1
  const findingsPart2 = replaceVariables(FINDINGS_ANALYSIS_PART2, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart2));
  sections.push(createHorizontalSeparator());
  
  // Part 3: 5.2 ROI Insights introduction text
  const findingsPart3 = replaceVariables(FINDINGS_ANALYSIS_PART3, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart3));
  
  // Table 5.2: ROI Insights Table
  const roiHeaders = [ctx.t.headers.workflow, ctx.t.headers.opportunity, ctx.t.headers.annualBenefit, ctx.t.headers.estCost, ctx.t.headers.fteSaved, ctx.t.headers.payback];
  const roiRows: string[][] = [];
  data.workflows.forEach(w => {
    w.opportunities.forEach(opp => {
      roiRows.push([
        w.workflow.name,
        opp.opportunity.name,
        ctx.fmt.currency(opp.roiMetrics.annualRoi),
        ctx.fmt.currency(parseFloat(opp.opportunity.implementationCost || "0")),
        ctx.fmt.number(opp.roiMetrics.fteSavings, 2),
        Math.round(opp.roiMetrics.paybackMonths) + " " + ctx.t.formatStrings.monthsAbbrev,
      ]);
    });
  });

  if (roiRows.length > 0) {
    sections.push(createTableCaption("5.2", ctx.t.tableCaptions["5.2"], ctx.t.labels.table));
    sections.push(createTable(roiHeaders, roiRows));
  }
  
  // Part 4: Commentary after Table 5.2
  const findingsPart4 = replaceVariables(FINDINGS_ANALYSIS_PART4, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart4));
  sections.push(createHorizontalSeparator());
  
  // Part 5: 5.3 Opportunity Matrix Analysis introduction text
  const findingsPart5 = replaceVariables(FINDINGS_ANALYSIS_PART5, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart5));
  
  // Table 5.3: Matrix Distribution
  const matrixHeaders = [ctx.t.headers.quadrant, ctx.t.headers.opportunities, ctx.t.headers.count];
  const matrixRows = [
    [ctx.t.matrix.quickWins, data.matrixDistribution.quickWins.opportunities.join(", "), data.matrixDistribution.quickWins.count.toString()],
    [ctx.t.matrix.strategicGoals, data.matrixDistribution.strategicGoals.opportunities.join(", "), data.matrixDistribution.strategicGoals.count.toString()],
    [ctx.t.matrix.niceToHave, data.matrixDistribution.niceToHaves.opportunities.join(", "), data.matrixDistribution.niceToHaves.count.toString()],
    [ctx.t.matrix.deprioritize, data.matrixDistribution.deprioritize.opportunities.join(", "), data.matrixDistribution.deprioritize.count.toString()],
  ];
  sections.push(createTableCaption("5.3", ctx.t.tableCaptions["5.3"], ctx.t.labels.table));
  sections.push(createTable(matrixHeaders, matrixRows));
  
  // Part 6: Commentary and matrix image placeholders
  const findingsPart6 = replaceVariables(FINDINGS_ANALYSIS_PART6, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart6));
  
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: ctx.t.sections.matrixVisualizations, bold: true })],
      spacing: { before: 240, after: 120 },
    })
  );
  
  sections.push(createBodyParagraph(ctx.t.sections.baseOpportunityMatrix));
  sections.push(
    new Paragraph({
      text: "[base_matrix_image]",
      spacing: { before: 120, after: 240 },
      alignment: AlignmentType.CENTER,
    })
  );

  sections.push(createBodyParagraph(ctx.t.sections.enhancedOpportunityMatrix));
  sections.push(
    new Paragraph({
      text: "[enhanced_matrix_image]",
      spacing: { before: 120, after: 240 },
      alignment: AlignmentType.CENTER,
    })
  );
  
  sections.push(createBodyParagraph(ctx.t.matrixDescriptions.baseMatrix));

  // 5.4 Executive Interpretation
  sections.push(
    new Paragraph({
      text: "5.4 Executive Interpretation",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 240, after: 120 },
    })
  );
  sections.push(createBodyParagraph("[executive_analysis_commentary]"));
  
  sections.push(createBodyParagraph(""));
  sections.push(createBodyParagraph("[Insert Roadmap Prioritization Table]"));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== AUTOMATION ROADMAP =====
  sections.push(createHeading(ctx.t.sections.automationRoadmap, HeadingLevel.HEADING_1));
  
  // Introduction
  const roadmapIntro = replaceVariables(AUTOMATION_ROADMAP_INTRO, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapIntro));
  sections.push(createHorizontalSeparator());
  
  // Phase 1
  const roadmapPhase1 = replaceVariables(AUTOMATION_ROADMAP_PHASE1, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase1));
  
  // Phase 1 Table
  if (data.roadmapPhases.phase1QuickWins.length > 0) {
    const phase1Headers = [ctx.t.headers.opportunity, ctx.t.headers.annualBenefit, ctx.t.headers.payback, ctx.t.headers.fteSaved];
    const phase1Rows = data.roadmapPhases.phase1QuickWins.map(opp => [
      opp.opportunity.name,
      ctx.fmt.currency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " " + ctx.t.formatStrings.monthsAbbrev,
      ctx.fmt.number(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTableCaption("6.1", ctx.t.tableCaptions["6.1"], ctx.t.labels.table));
    sections.push(createTable(phase1Headers, phase1Rows));
  }
  
  // Add spacing between table and outcomes
  sections.push(createBodyParagraph(""));
  
  const roadmapPhase1Outcomes = replaceVariables(AUTOMATION_ROADMAP_PHASE1_OUTCOMES, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase1Outcomes));
  sections.push(createHorizontalSeparator());

  // Phase 2
  const roadmapPhase2 = replaceVariables(AUTOMATION_ROADMAP_PHASE2, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase2));
  
  // Phase 2 Table
  if (data.roadmapPhases.phase2Foundational.length > 0) {
    const phase2Headers = [ctx.t.headers.opportunity, ctx.t.headers.annualBenefit, ctx.t.headers.payback, ctx.t.headers.fteSaved];
    const phase2Rows = data.roadmapPhases.phase2Foundational.map(opp => [
      opp.opportunity.name,
      ctx.fmt.currency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " " + ctx.t.formatStrings.monthsAbbrev,
      ctx.fmt.number(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTableCaption("6.2", ctx.t.tableCaptions["6.2"], ctx.t.labels.table));
    sections.push(createTable(phase2Headers, phase2Rows));
  }
  
  // Add spacing between table and outcomes
  sections.push(createBodyParagraph(""));
  
  const roadmapPhase2Outcomes = replaceVariables(AUTOMATION_ROADMAP_PHASE2_OUTCOMES, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase2Outcomes));
  sections.push(createHorizontalSeparator());

  // Phase 3
  const roadmapPhase3 = replaceVariables(AUTOMATION_ROADMAP_PHASE3, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase3));
  
  // Phase 3 Table
  if (data.roadmapPhases.phase3Strategic.length > 0) {
    const phase3Headers = [ctx.t.headers.opportunity, ctx.t.headers.annualBenefit, ctx.t.headers.payback, ctx.t.headers.fteSaved];
    const phase3Rows = data.roadmapPhases.phase3Strategic.map(opp => [
      opp.opportunity.name,
      ctx.fmt.currency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " " + ctx.t.formatStrings.monthsAbbrev,
      ctx.fmt.number(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTableCaption("6.3", ctx.t.tableCaptions["6.3"], ctx.t.labels.table));
    sections.push(createTable(phase3Headers, phase3Rows));
  }
  
  // Add spacing between table and outcomes
  sections.push(createBodyParagraph(""));
  
  const roadmapPhase3Outcomes = replaceVariables(AUTOMATION_ROADMAP_PHASE3_OUTCOMES, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase3Outcomes));
  sections.push(createHorizontalSeparator());
  
  // Gantt Table (18-month roadmap)
  sections.push(
    new Paragraph({
      text: "6.4 18-Month Automation Roadmap",
      heading: HeadingLevel.HEADING_3,
      alignment: AlignmentType.BOTH,
      spacing: { before: 360, after: 120 },
    })
  );

  const ganttHeaders = ["Phase", "0-3 mo", "3-6 mo", "6-9 mo", "9-12 mo", "12-15 mo", "15-18 mo"];
  const ganttRows = [
    [ctx.t.phaseHeaders.phase1, "█████", "█████", "", "", "", ""],
    [ctx.t.phaseHeaders.phase2, "", "", "█████", "█████", "", ""],
    [ctx.t.phaseHeaders.phase3, "", "", "", "", "█████", "█████"],
  ];
  sections.push(createTableCaption("6.4", ctx.t.tableCaptions["6.4"], ctx.t.labels.table));
  sections.push(createTable(ganttHeaders, ganttRows));
  
  // Narrative Summary
  const roadmapSummary = replaceVariables(AUTOMATION_ROADMAP_SUMMARY, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapSummary));

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  
  // ===== CONCLUSIONS & NEXT STEPS =====
  sections.push(createHeading(ctx.t.conclusions.title, HeadingLevel.HEADING_1));

  sections.push(createBodyParagraph(ctx.t.conclusions.keyConclusions));
  sections.push(createBulletParagraph(formatTemplate(ctx.t.keyConclusionsBullets.bullet1, data.roadmapPhases.phase1QuickWins.length, ctx.fmt.currency(data.portfolioMetrics.totalAnnualBenefit))));
  sections.push(createBulletParagraph(ctx.t.keyConclusionsBullets.bullet2));
  sections.push(createBulletParagraph(ctx.t.keyConclusionsBullets.bullet3));
  sections.push(createBulletParagraph(formatTemplate(ctx.t.keyConclusionsBullets.bullet4, Math.round(data.portfolioMetrics.averagePaybackMonths))));
  sections.push(createBulletParagraph(ctx.t.keyConclusionsBullets.bullet5));
  
  sections.push(createBodyParagraph(ctx.t.keyConclusionsBullets.strategicInterpretationPrompt));

  sections.push(createBodyParagraph(ctx.t.conclusions.recommendedNextSteps));
  sections.push(createBodyParagraph(ctx.t.conclusions.step1Title));
  sections.push(createBodyParagraph(ctx.t.conclusions.step1Content));
  sections.push(createBodyParagraph(""));
  sections.push(createBodyParagraph(ctx.t.conclusions.step2Title));
  sections.push(createBodyParagraph(ctx.t.conclusions.step2Content));
  sections.push(createBodyParagraph(""));
  sections.push(createBodyParagraph(ctx.t.conclusions.step3Title));
  sections.push(createBodyParagraph(ctx.t.conclusions.step3Content));
  sections.push(createBodyParagraph(""));
  sections.push(createBodyParagraph(ctx.t.conclusions.step4Title));
  sections.push(createBodyParagraph(ctx.t.conclusions.step4Content));
  sections.push(createBodyParagraph(""));
  sections.push(createBodyParagraph(ctx.t.keyConclusionsBullets.step5Title));
  sections.push(createBodyParagraph(ctx.t.keyConclusionsBullets.step5Content));
  sections.push(createBodyParagraph(""));
  sections.push(createBodyParagraph(ctx.t.conclusions.closingStatement));

  sections.push(createHorizontalSeparator());

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== APPENDICES =====

  // Appendix A
  sections.push(createHeading(ctx.t.appendices.a, HeadingLevel.HEADING_1));
  const appendixAText = replaceVariables(APPENDIX_A, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(appendixAText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix B: Readiness Score Metric Weighting
  sections.push(createHeading(ctx.t.appendices.b, HeadingLevel.HEADING_1));
  
  sections.push(createBodyParagraph(ctx.t.appendixIntros.appendixB));
  
  // Component Weighting Table - 7-row breakdown matching template
  const metricWeightHeaders = [ctx.t.headers.component, ctx.t.headers.weight, ctx.t.headers.description];
  const metricWeightRows = [
    [ctx.t.tfaComponents.systemEnvironment, "15%", ctx.t.appendices.systemEnvironmentDesc],
    [ctx.t.tfaComponents.dataQuality, "18%", ctx.t.appendices.dataQualityDesc],
    [ctx.t.tfaComponents.integrationFeasibility, "18%", ctx.t.appendices.integrationFeasibilityDesc],
    [ctx.t.tfaComponents.securityCompliance, "9%", ctx.t.appendices.securityComplianceDesc],
    [ctx.t.tfaComponents.processClarity, "15%", ctx.t.appendices.processClarityDesc],
    [ctx.t.tfaComponents.changeMagnitude, "15%", ctx.t.appendices.changeMagnitudeDesc],
    [ctx.t.tfaComponents.workflowBrittleness, "10%", ctx.t.appendices.workflowBrittlenessDesc],
  ];
  sections.push(createTableCaption("B.1", ctx.t.tableCaptions["B.1"], ctx.t.labels.table));
  sections.push(createTable(metricWeightHeaders, metricWeightRows, [35, 15, 50]));
  
  sections.push(createBodyParagraph(ctx.t.appendices.whyTheseWeights));
  sections.push(createBulletParagraph(ctx.t.appendixNarratives.whyTheseWeightsBullet1));
  sections.push(createBulletParagraph(ctx.t.appendixNarratives.whyTheseWeightsBullet2));
  sections.push(createBulletParagraph(ctx.t.appendixNarratives.whyTheseWeightsBullet3));
  sections.push(createBulletParagraph(ctx.t.appendixNarratives.whyTheseWeightsBullet4));
  
  sections.push(new Paragraph({ children: [new PageBreak()] }));
  
  // Appendix C: Readiness SWOT Analysis - Step-Level Text Format
  sections.push(createHeading(ctx.t.appendices.c, HeadingLevel.HEADING_1));
  sections.push(createBodyParagraph(ctx.t.appendixIntros.appendixC));

  // Generate text-based SWOT format
  if (data.appendixB && data.appendixB.length > 0) {
    data.appendixB.forEach(workflowData => {
      // Workflow name as heading
      sections.push(
        new Paragraph({
          text: workflowData.workflowName,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );

      // Process each step within the workflow
      if (workflowData.stepLevelSWOTs && workflowData.stepLevelSWOTs.length > 0) {
        workflowData.stepLevelSWOTs.forEach((stepSWOT, stepIndex) => {
          const stepNumber = stepIndex + 1;
          
          // Step identifier as subheading
          sections.push(
            new Paragraph({
              text: formatTemplate(ctx.t.formatStrings.stepFormat, stepNumber, stepSWOT.stepName),
              heading: HeadingLevel.HEADING_4,
              spacing: { before: 180, after: 90 },
            })
          );

          // Strengths
          if (stepSWOT.swotAnalysis.strengths && stepSWOT.swotAnalysis.strengths.length > 0) {
            sections.push(new Paragraph({
              children: [new TextRun({ text: ctx.t.swot.strengths, bold: true })],
              spacing: { before: 60, after: 30 },
            }));
            stepSWOT.swotAnalysis.strengths.forEach(strength => {
              sections.push(createBulletParagraph(strength));
            });
          }

          // Weaknesses
          if (stepSWOT.swotAnalysis.weaknesses && stepSWOT.swotAnalysis.weaknesses.length > 0) {
            sections.push(new Paragraph({
              children: [new TextRun({ text: ctx.t.swot.weaknesses, bold: true })],
              spacing: { before: 60, after: 30 },
            }));
            stepSWOT.swotAnalysis.weaknesses.forEach(weakness => {
              sections.push(createBulletParagraph(weakness));
            });
          }

          // Opportunities
          if (stepSWOT.swotAnalysis.opportunities && stepSWOT.swotAnalysis.opportunities.length > 0) {
            sections.push(new Paragraph({
              children: [new TextRun({ text: ctx.t.swot.opportunities, bold: true })],
              spacing: { before: 60, after: 30 },
            }));
            stepSWOT.swotAnalysis.opportunities.forEach(opportunity => {
              sections.push(createBulletParagraph(opportunity));
            });
          }

          // Threats
          if (stepSWOT.swotAnalysis.threats && stepSWOT.swotAnalysis.threats.length > 0) {
            sections.push(new Paragraph({
              children: [new TextRun({ text: ctx.t.swot.threats, bold: true })],
              spacing: { before: 60, after: 30 },
            }));
            stepSWOT.swotAnalysis.threats.forEach(threat => {
              sections.push(createBulletParagraph(threat));
            });
          }
        });
      }
    });
  } else {
    sections.push(createBodyParagraph(ctx.t.fallback.noStepSwot));
  }
  
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix D
  sections.push(createHeading(ctx.t.appendices.d, HeadingLevel.HEADING_1));
  sections.push(createBodyParagraph(ctx.t.appendixIntros.appendixD));
  
  // D.0 Consolidated Opportunities Overview (conditional - only if consolidations exist)
  const allConsolidations = data.workflows.flatMap(w => w.consolidations || []);
  if (allConsolidations.length > 0) {
    sections.push(
      new Paragraph({
        text: ctx.t.formatStrings.consolidatedOpportunitiesHeading,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );
    
    sections.push(createBodyParagraph(ctx.t.appendixIntros.consolidatedOpportunities));
    
    // D.0a - Consolidated Opportunity Summary Table
    const consolidationHeaders = [
      ctx.t.headers.workflow,
      ctx.t.headers.consolidationName,
      ctx.t.headers.opportunities,
      ctx.t.headers.annualBenefit,
      ctx.t.headers.fteSaved,
      ctx.t.headers.payback,
      ctx.t.headers.quadrant
    ];
    
    const consolidationRows: string[][] = [];
    allConsolidations
      .sort((a, b) => b.matrixPosition.businessImpact - a.matrixPosition.businessImpact)
      .forEach(cons => {
        consolidationRows.push([
          cons.workflow.name,
          cons.consolidation.name,
          cons.constituentOpportunities.length.toString(),
          ctx.fmt.currency(cons.aggregatedMetrics.totalAnnualRoi),
          ctx.fmt.number(cons.aggregatedMetrics.totalFteSavings, 2),
          Math.round(cons.aggregatedMetrics.weightedAvgPaybackPeriodMonths) + " " + ctx.t.formatStrings.monthsAbbrev,
          cons.matrixPosition.quadrant,
        ]);
      });
    
    sections.push(createTableCaption("D.0a", (ctx.t.tableCaptions as any)["D.0a"], ctx.t.labels.table));
    sections.push(createTable(consolidationHeaders, consolidationRows, [18, 22, 10, 12, 10, 10, 18]));
    
    // D.0b - Consolidation Constituent Mapping Table
    const constituentHeaders = [
      ctx.t.headers.workflow,
      ctx.t.headers.consolidation,
      ctx.t.headers.constituentOpportunity,
      ctx.t.headers.stepNumber,
      ctx.t.headers.stepName
    ];
    
    const constituentRows: string[][] = [];
    allConsolidations.forEach(cons => {
      // Sort constituents by step order
      const sortedConstituents = [...cons.constituentOpportunities].sort((a, b) => a.stepOrder - b.stepOrder);
      sortedConstituents.forEach(opp => {
        constituentRows.push([
          cons.workflow.name,
          cons.consolidation.name,
          opp.name,
          opp.stepOrder.toString(),
          opp.stepName,
        ]);
      });
    });
    
    sections.push(createTableCaption("D.0b", (ctx.t.tableCaptions as any)["D.0b"], ctx.t.labels.table));
    sections.push(createTable(constituentHeaders, constituentRows, [20, 20, 25, 10, 25]));
    
    sections.push(createBodyParagraph(ctx.t.appendixNarratives.consolidationRepresentsParagraph));
    sections.push(createHorizontalSeparator());
  }
  
  // D.1 Portfolio Summary Table (add Weekly Hours Saved column)
  const portfolioHeaders = [ctx.t.headers.workflow, ctx.t.headers.opportunity, ctx.t.headers.annualBenefit, ctx.t.headers.estCost, ctx.t.headers.fteSaved, ctx.t.headers.payback, ctx.t.metricLabels.weeklyHoursSaved];
  const portfolioRows: string[][] = [];
  data.workflows.forEach(w => {
    w.opportunities.forEach(opp => {
      const weeklyHours = (opp.roiMetrics.fteSavings * 2080) / 52;
      portfolioRows.push([
        w.workflow.name,
        opp.opportunity.name,
        ctx.fmt.currency(opp.roiMetrics.annualRoi),
        ctx.fmt.currency(parseFloat(opp.opportunity.implementationCost || "0")),
        ctx.fmt.number(opp.roiMetrics.fteSavings, 2),
        Math.round(opp.roiMetrics.paybackMonths) + " " + ctx.t.formatStrings.monthsAbbrev,
        ctx.fmt.number(weeklyHours, 1),
      ]);
    });
  });
  if (portfolioRows.length > 0) {
    sections.push(createTableCaption("D.1", ctx.t.tableCaptions["D.1"], ctx.t.labels.table));
    sections.push(createTable(portfolioHeaders, portfolioRows));
  }
  sections.push(createBodyParagraph(
    formatTemplate(ctx.t.appendixNarratives.portfolioSummaryParagraph, 
      allConsolidations.length > 0 ? "Consolidated opportunities are shown aggregated above; individual constituents are included here for detailed review. " : "")
  ));
  sections.push(createHorizontalSeparator());
  
  // D.2.X sections - ONE PER OPPORTUNITY
  let oppCounter = 1;
  data.workflows.forEach(w => {
    w.opportunities.forEach(opp => {
      sections.push(
        new Paragraph({
          text: formatTemplate(ctx.t.formatStrings.roiInsightsHeading, oppCounter, w.workflow.name, opp.opportunity.name),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 360, after: 120 },
        })
      );
      
      // Performance Summary paragraph
      const annualHours = opp.roiMetrics.fteSavings * 2080;
      sections.push(createBodyParagraph(
        formatTemplate(ctx.t.appendixNarratives.performanceSummaryTemplate,
          ctx.fmt.currency(opp.roiMetrics.annualRoi),
          ctx.fmt.number(opp.roiMetrics.fteSavings, 2),
          ctx.fmt.number(annualHours, 0),
          Math.round(opp.roiMetrics.paybackMonths))
      ));
      
      // Key Metrics Table (9 rows)
      const implCost = parseFloat(opp.opportunity.implementationCost || "0");
      const year1Net = opp.roiMetrics.annualRoi - implCost;
      const year3Net = (opp.roiMetrics.annualRoi * 3) - implCost;
      const year5Net = (opp.roiMetrics.annualRoi * 5) - implCost;
      const weeklyHours = annualHours / 52;
      
      const keyMetricsHeaders = [ctx.t.headers.metric, ctx.t.headers.value];
      const keyMetricsRows = [
        [ctx.t.metricLabels.annualBenefit, ctx.fmt.currency(opp.roiMetrics.annualRoi)],
        [ctx.t.metricLabels.estimatedImplementationCost, ctx.fmt.currency(implCost)],
        [ctx.t.metricLabels.paybackPeriod, `${Math.round(opp.roiMetrics.paybackMonths)} ${ctx.t.formatStrings.monthsAbbrev}`],
        [ctx.t.metricLabels.yearOneNetBenefit, ctx.fmt.currency(year1Net)],
        [ctx.t.metricLabels.yearThreeNetBenefit, ctx.fmt.currency(year3Net)],
        [ctx.t.metricLabels.yearFiveNetBenefit, ctx.fmt.currency(year5Net)],
        [ctx.t.metricLabels.fteSaved, ctx.fmt.number(opp.roiMetrics.fteSavings, 2)],
        [ctx.t.metricLabels.annualHoursSaved, ctx.fmt.number(annualHours, 0)],
        [ctx.t.metricLabels.weeklyHoursSaved, ctx.fmt.number(weeklyHours, 1)],
      ];
      sections.push(createTableCaption(`D.2.${oppCounter}a`, "Key Financial Metrics", ctx.t.labels.table));
      sections.push(createTable(keyMetricsHeaders, keyMetricsRows, [50, 50]));
      sections.push(createBodyParagraph(ctx.t.appendixNarratives.allValuesModeledConservative));
      
      // Business Impact Components Table
      const impactHeaders = [ctx.t.headers.impactArea, ctx.t.headers.keyMetrics, ctx.t.headers.description];
      const impactRows = [
        [ctx.t.metricLabels.timeSavings, `${ctx.fmt.number(annualHours, 0)} ${ctx.t.formatStrings.hoursPerYear}`, ctx.t.metricLabels.primaryEfficiencyGain],
        [ctx.t.metricLabels.qualityImpact, ctx.t.metricLabels.conservativeEstimate, ctx.t.metricLabels.errorReductionBenefits],
        [ctx.t.metricLabels.revenueUplift, ctx.t.metricLabels.toBeValidated, ctx.t.metricLabels.capacityReallocation],
        [ctx.t.metricLabels.rampUpPeriod, ctx.t.metricLabels.threeMonths, ctx.t.metricLabels.timeToSteadyState],
      ];
      sections.push(createTableCaption(`D.2.${oppCounter}b`, "Business Impact Components", ctx.t.labels.table));
      sections.push(createTable(impactHeaders, impactRows, [25, 25, 50]));
      
      // Dominant component paragraph
      sections.push(createBodyParagraph(ctx.t.appendixNarratives.impactMajorityParagraph));
      
      sections.push(createHorizontalSeparator());
      oppCounter++;
    });
  });
  
  // D.3 Modeling Notes
  sections.push(...createTextParagraphs(APPENDIX_D_MODELING_NOTES));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix E
  sections.push(createHeading(ctx.t.appendices.e, HeadingLevel.HEADING_1));

  // E.1 Core Financial Formulas (text only)
  sections.push(...createTextParagraphs(APPENDIX_E_PART1));

  // E.2 Net Benefit Formulas Table
  const netBenefitHeaders = [ctx.t.appendixETables.projectionHorizonHeader, ctx.t.appendixETables.formulaHeader, ctx.t.appendixETables.purposeHeader];
  const netBenefitRows = [
    [ctx.t.appendixETables.netBenefitYear1, ctx.t.appendixETables.netBenefitYear1Formula, ctx.t.appendixETables.netBenefitYear1Purpose],
    [ctx.t.appendixETables.netBenefitYear3, ctx.t.appendixETables.netBenefitYear3Formula, ctx.t.appendixETables.netBenefitYear3Purpose],
    [ctx.t.appendixETables.netBenefitYear5, ctx.t.appendixETables.netBenefitYear5Formula, ctx.t.appendixETables.netBenefitYear5Purpose],
  ];
  sections.push(createTableCaption("E.2", ctx.t.tableCaptions["E.2"], ctx.t.labels.table));
  sections.push(createTable(netBenefitHeaders, netBenefitRows, [25, 40, 35]));

  // E.3 FTE Conversions (text)
  sections.push(...createTextParagraphs(APPENDIX_E_PART2));

  // E.4 Annual Benefit Breakdown Table
  const benefitHeaders = [ctx.t.appendixETables.componentHeader, ctx.t.appendixETables.formulaHeader, ctx.t.appendixETables.descriptionHeader];
  const benefitRows = [
    [ctx.t.appendixETables.timeSavingsBenefits, ctx.t.appendixETables.timeSavingsFormula, ctx.t.appendixETables.timeSavingsPurpose],
    [ctx.t.appendixETables.errorReductionBenefitsLabel, ctx.t.appendixETables.errorReductionFormula, ctx.t.appendixETables.errorReductionPurpose],
    [ctx.t.appendixETables.revenueUpliftBenefits, ctx.t.appendixETables.revenueUpliftFormula, ctx.t.appendixETables.revenueUpliftPurpose],
  ];
  sections.push(createTableCaption("E.4", ctx.t.tableCaptions["E.4"], ctx.t.labels.table));
  sections.push(createTable(benefitHeaders, benefitRows, [25, 40, 35]));
  sections.push(createBodyParagraph(ctx.t.appendixETables.benefitCalculationsFooter));

  // E.5 Scenario Adjustment Framework Table
  sections.push(...createTextParagraphs(APPENDIX_E_PART3));
  const scenarioHeaders = [ctx.t.appendixETables.adjustmentCategoryHeader, ctx.t.appendixETables.conservativeRationaleHeader];
  const scenarioRows = [
    [ctx.t.appendixETables.timeSavingsAdjustment, ctx.t.appendixETables.timeSavingsRationale],
    [ctx.t.appendixETables.errorReductionAdjustment, ctx.t.appendixETables.errorReductionRationale],
    [ctx.t.appendixETables.revenueReallocationAdjustment, ctx.t.appendixETables.revenueReallocationRationale],
    [ctx.t.appendixETables.costOverrunAdjustment, ctx.t.appendixETables.costOverrunRationale],
    [ctx.t.appendixETables.rampUpEfficiencyAdjustment, ctx.t.appendixETables.rampUpEfficiencyRationale],
  ];
  sections.push(createTableCaption("E.5", ctx.t.tableCaptions["E.5"], ctx.t.labels.table));
  sections.push(createTable(scenarioHeaders, scenarioRows, [35, 65]));
  sections.push(createBodyParagraph(ctx.t.appendixETables.conservativeFrameworkFooter));

  // E.6 Key Modeling Assumptions Table
  sections.push(...createTextParagraphs(APPENDIX_E_PART4));
  const assumptionsHeaders = [ctx.t.appendixETables.variableHeader, ctx.t.appendixETables.standardAssumptionHeader, ctx.t.appendixETables.rationaleHeader];
  const assumptionsRows = [
    [ctx.t.appendixETables.effectiveHourlyRate, ctx.t.appendixETables.effectiveHourlyRateValue, ctx.t.appendixETables.effectiveHourlyRateRationale],
    [ctx.t.appendixETables.standardWorkYear, ctx.t.appendixETables.standardWorkYearValue, ctx.t.appendixETables.standardWorkYearRationale],
    [ctx.t.appendixETables.processBaseline, ctx.t.appendixETables.processBaselineValue, ctx.t.appendixETables.processBaselineRationale],
    [ctx.t.appendixETables.automationCapability, ctx.t.appendixETables.automationCapabilityValue, ctx.t.appendixETables.automationCapabilityRationale],
    [ctx.t.appendixETables.recurringCostsLabel, ctx.t.appendixETables.recurringCostsValue, ctx.t.appendixETables.recurringCostsRationale],
    [ctx.t.appendixETables.oneTimeCostsLabel, ctx.t.appendixETables.oneTimeCostsValue, ctx.t.appendixETables.oneTimeCostsRationale],
  ];
  sections.push(createTableCaption("E.6", ctx.t.tableCaptions["E.6"], ctx.t.labels.table));
  sections.push(createTable(assumptionsHeaders, assumptionsRows, [25, 30, 45]));

  // E.7 Formula Integrity (text)
  sections.push(...createTextParagraphs(APPENDIX_E_PART5));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix F - Data Provenance and Audit Trail
  sections.push(createHeading(ctx.t.appendices.f, HeadingLevel.HEADING_1));
  const provenanceHeaders = [ctx.t.headers.workflowName, "Department", "Step", "Type", "Method", ctx.t.headers.respondentName, ctx.t.headers.respondentRole, ctx.t.headers.collectionDate, ctx.t.headers.verificationStatus, "Gaps"];
  const provenanceRows = data.appendixF.map(prov => {
    // Merge Step # and Step Name into single column
    const stepIdentifier = prov.stepNumber === ctx.t.fallback.na 
      ? ctx.t.fallback.na 
      : `Step ${prov.stepNumber} — ${prov.stepName}`;
    
    return [
      prov.workflowName,
      prov.department || "General Operations",
      stepIdentifier,
      prov.dataType,
      prov.collectionMethod,
      prov.respondentName,
      prov.respondentRole,
      prov.submissionDate,
      prov.validationStatus,
      prov.knowledgeGaps || ctx.t.fallback.none,
    ];
  });
  if (provenanceRows.length > 0) {
    sections.push(createTableCaption("F.1", ctx.t.tableCaptions["F.1"], ctx.t.labels.table));
    sections.push(createTable(provenanceHeaders, provenanceRows, [14, 12, 14, 7, 10, 12, 10, 8, 7, 6]));
  }
  
  // Add detailed knowledge gap resolution tables if available
  let gapTableCounter = 2; // Start at F.2 since F.1 is the main provenance table
  data.appendixF.forEach(prov => {
    if (prov.knowledgeGapDetails && prov.knowledgeGapDetails.length > 0) {
      sections.push(
        new Paragraph({
          text: `Knowledge Gap Resolution Details: ${prov.workflowName} (${prov.dataType})`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
      
      const gapHeaders = ["Q#", "Question", "Resolved By", "Role", "Method", "Gap?", "Date"];
      const gapRows = prov.knowledgeGapDetails.map(detail => [
        detail.questionId.toString(),
        detail.questionText,
        detail.resolvedBy,
        detail.resolverRole,
        detail.resolutionMethod,
        detail.isKnowledgeGap ? ctx.t.fallback.yes : ctx.t.fallback.no,
        detail.resolvedAt,
      ]);
      sections.push(createTableCaption(`F.${gapTableCounter}`, `Knowledge Gap Resolution — ${prov.workflowName}`, ctx.t.labels.table));
      sections.push(createTable(gapHeaders, gapRows, [5, 30, 15, 12, 15, 8, 15]));
      gapTableCounter++;
    }
  });

  // Create document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Roboto",
            size: 22, // 11pt
          },
        },
        heading1: {
          run: {
            font: "Roboto",
            size: 32, // 16pt
            bold: true,
            color: COLORS.PRIMARY_GREEN,
          },
          paragraph: {
            spacing: { before: 480, after: 240 },
          },
        },
        heading2: {
          run: {
            font: "Roboto",
            size: 28, // 14pt
            bold: true,
            color: COLORS.PRIMARY_GREEN,
          },
          paragraph: {
            spacing: { before: 360, after: 180 },
          },
        },
        heading3: {
          run: {
            font: "Roboto",
            size: 24, // 12pt
            bold: true,
            color: COLORS.DARK_GRAY,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${ctx.t.coverPage.preparedFor} ${data.company.name} ${ctx.t.coverPage.by} Automat-IA | ${ctx.t.coverPage.confidential}`,
                    size: 18,
                    color: COLORS.MEDIUM_GRAY,
                    font: "Roboto",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                border: {
                  bottom: {
                    color: COLORS.PRIMARY_GREEN,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${ctx.t.coverPage.executiveDiagnosticReport} – ${diagnosticPeriod}`,
                    size: 18,
                    color: COLORS.MEDIUM_GRAY,
                    font: "Roboto",
                  }),
                ],
                alignment: AlignmentType.CENTER,
                border: {
                  top: {
                    color: COLORS.PRIMARY_GREEN,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
              }),
            ],
          }),
        },
        children: sections,
      },
    ],
  });

  // Convert to buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
