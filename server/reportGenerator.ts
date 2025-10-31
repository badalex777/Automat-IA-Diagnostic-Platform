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
import {
  EXECUTIVE_SUMMARY,
  CONFIDENTIALITY_DISCLAIMER,
  METHODOLOGY_OVERVIEW,
  DIAGNOSTIC_OVERVIEW,
  FINDINGS_ANALYSIS,
  AUTOMATION_ROADMAP,
  APPENDIX_A,
  APPENDIX_D,
  APPENDIX_E,
  replaceVariables,
  formatDiagnosticDate,
} from "./reportPrompts";

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

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatNumber(value: number, decimals: number = 1): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

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
    return /^(\d+\.\d+|[A-Z]\.\d+)\s+/.test(line.trim());
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
        spacing: { before: 120, after: 120 },
      }));
      continue;
    }

    if (isSubsectionTitle(trimmed)) {
      // Flush any current paragraph first
      flushParagraph();
      // Add subsection as heading
      paragraphs.push(new Paragraph({
        text: trimmed,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 120, after: 120 },
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
        children: [new TextRun({ text: h, bold: true })],
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

  // ===== APPENDIX B VALIDATION =====
  if (!data.appendixB || data.appendixB.length === 0) {
    errors.push('Appendix B data is missing - at least one workflow with TFA/PIF analysis is required');
  } else {
    data.appendixB.forEach((workflow, index) => {
      const prefix = `Appendix B workflow ${index + 1}`;
      
      if (!workflow.workflowName || workflow.workflowName.trim() === '') {
        errors.push(`${prefix}: Missing workflow name`);
      }
      
      // Validate SWOT analysis data
      if (!workflow.swotAnalysis) {
        errors.push(`${prefix} "${workflow.workflowName}": Missing SWOT analysis`);
      } else {
        if (!Array.isArray(workflow.swotAnalysis.strengths)) {
          errors.push(`${prefix} "${workflow.workflowName}": Invalid SWOT strengths array`);
        }
        if (!Array.isArray(workflow.swotAnalysis.weaknesses)) {
          errors.push(`${prefix} "${workflow.workflowName}": Invalid SWOT weaknesses array`);
        }
        if (!Array.isArray(workflow.swotAnalysis.opportunities)) {
          errors.push(`${prefix} "${workflow.workflowName}": Invalid SWOT opportunities array`);
        }
        if (!Array.isArray(workflow.swotAnalysis.threats)) {
          errors.push(`${prefix} "${workflow.workflowName}": Invalid SWOT threats array`);
        }
      }
      
      // Validate question insights
      if (!workflow.questionInsights || workflow.questionInsights.length === 0) {
        errors.push(`${prefix} "${workflow.workflowName}": No question insights found`);
      } else {
        workflow.questionInsights.forEach((insight, i) => {
          if (!insight.questionText || insight.questionText.trim() === '') {
            errors.push(`${prefix} "${workflow.workflowName}" insight ${i + 1}: Missing question text`);
          }
          if (!insight.section || insight.section.trim() === '') {
            errors.push(`${prefix} "${workflow.workflowName}" insight ${i + 1}: Missing section`);
          }
          if (!insight.respondentName || insight.respondentName.trim() === '') {
            errors.push(`${prefix} "${workflow.workflowName}" insight ${i + 1}: Missing respondent name`);
          }
        });
      }
      
      // Validate followUpActions array exists (may be empty if all scores are high)
      if (!Array.isArray(workflow.followUpActions)) {
        errors.push(`${prefix} "${workflow.workflowName}": Invalid followUpActions array`);
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
 */
export async function generateExecutiveReport(data: DiagnosticData): Promise<Buffer> {
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
  
  const templateVars = {
    company_name: data.company.name,
    Lead_Analyst_Name: data.company.leadAnalystName || "[Lead Analyst Name]",
    Month: diagnosticPeriod,
    diagnostic_period: diagnosticPeriod,
    total_workflows: data.portfolioMetrics.totalWorkflows.toString(),
    workflow_count: data.portfolioMetrics.totalWorkflows.toString(),
    total_opportunities: data.portfolioMetrics.totalOpportunities.toString(),
    opportunity_count: data.portfolioMetrics.totalOpportunities.toString(),
    annual_benefit: formatCurrency(data.portfolioMetrics.totalAnnualBenefit),
    payback_period: Math.round(data.portfolioMetrics.averagePaybackMonths).toString(),
    avg_payback: Math.round(data.portfolioMetrics.averagePaybackMonths).toString(),
    roi_percent: formatNumber(data.portfolioMetrics.averageRoi, 1),
    fte_savings: formatNumber(data.portfolioMetrics.totalFteSavings, 2),
    functions_list: data.portfolioMetrics.functionsList,
    quickwin_count: data.matrixDistribution.quickWins.count.toString(),
    diagnostic_date: diagnosticPeriod,
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
      text: "EXECUTIVE DIAGNOSTIC REPORT",
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
          text: "Automation Readiness & Opportunity Analysis",
          size: 24,
          font: "Roboto",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      text: `Diagnostic Period: ${diagnosticPeriod}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Lead Analyst: ${data.company.leadAnalystName || "[Lead Analyst Name]"}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: `Version: v1 - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
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
  sections.push(createHeading("Executive Summary", HeadingLevel.HEADING_1));
  const execSummaryText = replaceVariables(EXECUTIVE_SUMMARY, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(execSummaryText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== CONFIDENTIALITY & DISCLAIMER =====
  sections.push(createHeading("Confidentiality and Disclaimer Statement", HeadingLevel.HEADING_1));
  const confidentialityText = replaceVariables(CONFIDENTIALITY_DISCLAIMER, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(confidentialityText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== TABLE OF CONTENTS =====
  sections.push(
    createHeading("Table of Contents", HeadingLevel.HEADING_1),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // ===== METHODOLOGY OVERVIEW =====
  sections.push(createHeading("Methodology Overview", HeadingLevel.HEADING_1));
  const methodologyText = replaceVariables(METHODOLOGY_OVERVIEW, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(methodologyText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== DIAGNOSTIC OVERVIEW =====
  sections.push(createHeading("Diagnostic Overview", HeadingLevel.HEADING_1));
  const diagnosticOverviewText = replaceVariables(DIAGNOSTIC_OVERVIEW, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(diagnosticOverviewText));
  
  // Top 3 Opportunities Table
  if (data.top3Opportunities.length > 0) {
    sections.push(
      new Paragraph({
        text: "Top Three Automation Opportunities",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 120 },
      })
    );

    const top3Headers = ["Workflow", "Opportunity", "Annual Benefit", "ROI %", "Payback (months)", "FTE Saved"];
    const top3Rows = data.top3Opportunities.map(opp => [
      opp.workflowName,
      opp.opportunityName,
      formatCurrency(opp.annualBenefit),
      formatNumber(opp.roi, 0) + "%",
      Math.round(opp.paybackMonths).toString(),
      formatNumber(opp.fteSavings, 2),
    ]);
    sections.push(createTable(top3Headers, top3Rows));
  }

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== FINDINGS & ANALYSIS =====
  sections.push(createHeading("Findings and Analysis", HeadingLevel.HEADING_1));
  const findingsText = replaceVariables(FINDINGS_ANALYSIS, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsText));

  // Readiness Summary Table
  sections.push(
    new Paragraph({
      text: "Readiness Summary Table",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 240, after: 120 },
    })
  );

  const readinessHeaders = ["Workflow", "Opportunity", "TFA Score", "PIF Score", "Readiness", "Band"];
  const readinessRows: string[][] = [];
  data.workflows.forEach(w => {
    if (w.readiness && w.readiness.componentScores) {
      const readiness = w.readiness;
      const avgPIFScore = Math.round(
        (readiness.componentScores.processClarity + 
         readiness.componentScores.changeMagnitude + 
         readiness.componentScores.workflowBrittleness) / 3
      );
      
      w.opportunities.forEach(opp => {
        readinessRows.push([
          w.workflow.name,
          opp.opportunity.name,
          Math.round(w.tfa?.score || 0) + "%",
          avgPIFScore + "%",
          Math.round(readiness.totalScore) + "%",
          readiness.feasibilityBand,
        ]);
      });
    }
  });

  if (readinessRows.length > 0) {
    sections.push(createTable(readinessHeaders, readinessRows));
  }

  // ROI Insights Table
  sections.push(
    new Paragraph({
      text: "ROI Insights Table",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 360, after: 120 },
    })
  );

  const roiHeaders = ["Workflow", "Opportunity", "Annual Benefit", "Est. Cost", "FTE Saved", "Payback"];
  const roiRows: string[][] = [];
  data.workflows.forEach(w => {
    w.opportunities.forEach(opp => {
      roiRows.push([
        w.workflow.name,
        opp.opportunity.name,
        formatCurrency(opp.roiMetrics.annualRoi),
        formatCurrency(parseFloat(opp.opportunity.implementationCost || "0")),
        formatNumber(opp.roiMetrics.fteSavings, 2),
        Math.round(opp.roiMetrics.paybackMonths) + " mo",
      ]);
    });
  });

  if (roiRows.length > 0) {
    sections.push(createTable(roiHeaders, roiRows));
  }

  // Matrix Distribution
  sections.push(
    new Paragraph({
      text: "Matrix Distribution Overview",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 360, after: 120 },
    })
  );

  const matrixHeaders = ["Quadrant", "Opportunities", "Count"];
  const matrixRows = [
    ["Quick Wins", data.matrixDistribution.quickWins.opportunities.join(", "), data.matrixDistribution.quickWins.count.toString()],
    ["Strategic Goals", data.matrixDistribution.strategicGoals.opportunities.join(", "), data.matrixDistribution.strategicGoals.count.toString()],
    ["Nice-to-Haves", data.matrixDistribution.niceToHaves.opportunities.join(", "), data.matrixDistribution.niceToHaves.count.toString()],
    ["Deprioritize", data.matrixDistribution.deprioritize.opportunities.join(", "), data.matrixDistribution.deprioritize.count.toString()],
  ];
  sections.push(createTable(matrixHeaders, matrixRows));

  // Matrix image placeholders
  sections.push(
    new Paragraph({
      text: "[base_matrix_image]",
      spacing: { before: 240, after: 120 },
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: "[enhanced_matrix_image]",
      spacing: { before: 240, after: 120 },
      alignment: AlignmentType.CENTER,
    })
  );

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== AUTOMATION ROADMAP =====
  sections.push(createHeading("Automation Roadmap", HeadingLevel.HEADING_1));
  const roadmapText = replaceVariables(AUTOMATION_ROADMAP, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapText));

  // Phase 1 Table
  if (data.roadmapPhases.phase1QuickWins.length > 0) {
    sections.push(
      new Paragraph({
        text: "Phase 1: Quick Wins (0-6 months)",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 120 },
      })
    );

    const phase1Headers = ["Opportunity", "Annual Benefit", "Payback", "FTE Saved"];
    const phase1Rows = data.roadmapPhases.phase1QuickWins.map(opp => [
      opp.opportunity.name,
      formatCurrency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " mo",
      formatNumber(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTable(phase1Headers, phase1Rows));
  }

  // Phase 2 Table
  if (data.roadmapPhases.phase2Foundational.length > 0) {
    sections.push(
      new Paragraph({
        text: "Phase 2: Foundational (6-12 months)",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 360, after: 120 },
      })
    );

    const phase2Headers = ["Opportunity", "Annual Benefit", "Payback", "FTE Saved"];
    const phase2Rows = data.roadmapPhases.phase2Foundational.map(opp => [
      opp.opportunity.name,
      formatCurrency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " mo",
      formatNumber(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTable(phase2Headers, phase2Rows));
  }

  // Phase 3 Table
  if (data.roadmapPhases.phase3Strategic.length > 0) {
    sections.push(
      new Paragraph({
        text: "Phase 3: Strategic (12-18+ months)",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 360, after: 120 },
      })
    );

    const phase3Headers = ["Opportunity", "Annual Benefit", "Payback", "FTE Saved"];
    const phase3Rows = data.roadmapPhases.phase3Strategic.map(opp => [
      opp.opportunity.name,
      formatCurrency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " mo",
      formatNumber(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTable(phase3Headers, phase3Rows));
  }

  // Gantt Table (18-month roadmap)
  sections.push(
    new Paragraph({
      text: "18-Month Automation Roadmap",
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 360, after: 120 },
    })
  );

  const ganttHeaders = ["Phase", "0-3 mo", "3-6 mo", "6-9 mo", "9-12 mo", "12-15 mo", "15-18 mo"];
  const ganttRows = [
    ["Phase 1: Quick Wins", "█████", "█████", "", "", "", ""],
    ["Phase 2: Foundational", "", "", "█████", "█████", "", ""],
    ["Phase 3: Strategic", "", "", "", "", "█████", "█████"],
  ];
  sections.push(createTable(ganttHeaders, ganttRows));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== APPENDICES =====

  // Appendix A
  sections.push(createHeading("Appendix A: Detailed Methodology", HeadingLevel.HEADING_1));
  const appendixAText = replaceVariables(APPENDIX_A, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(appendixAText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix B - SWOT Analysis + Question Insights + Follow-Up Actions
  sections.push(createHeading("Appendix B: Readiness SWOT Analysis", HeadingLevel.HEADING_1));
  data.appendixB.forEach(swotData => {
    sections.push(
      new Paragraph({
        text: `Workflow: ${swotData.workflowName}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 120 },
      })
    );

    // SWOT Table
    const swotHeaders = ["Category", "Findings"];
    const swotRows = [
      ["Strengths", swotData.swotAnalysis.strengths.join("\n")],
      ["Weaknesses", swotData.swotAnalysis.weaknesses.join("\n")],
      ["Opportunities", swotData.swotAnalysis.opportunities.join("\n")],
      ["Threats", swotData.swotAnalysis.threats.join("\n")],
    ];
    sections.push(createTable(swotHeaders, swotRows, [30, 70]));
    
    // Question-Level Insights Table
    if (swotData.questionInsights && swotData.questionInsights.length > 0) {
      sections.push(
        new Paragraph({
          text: "Question-Level Insights",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
      
      const insightHeaders = ["Q#", "Question", "Section", "Type", "Respondent", "Response", "Score", "Date"];
      const insightRows = swotData.questionInsights.map(insight => [
        insight.questionId.toString(),
        insight.questionText,
        insight.section,
        insight.dataType,
        insight.respondentName,
        insight.rawResponse,
        insight.numericScore !== null ? insight.numericScore.toString() : "N/A",
        insight.submissionDate,
      ]);
      sections.push(createTable(insightHeaders, insightRows, [5, 25, 12, 5, 12, 20, 8, 13]));
    }
    
    // Recommended Follow-Up Actions Table
    if (swotData.followUpActions && swotData.followUpActions.length > 0) {
      sections.push(
        new Paragraph({
          text: "Recommended Follow-Up Actions",
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120 },
        })
      );
      
      const actionHeaders = ["Priority", "Section", "Avg Score", "Factor(s)", "Recommendation"];
      const actionRows = swotData.followUpActions.map(action => [
        action.priority,
        action.section,
        action.score.toFixed(1),
        action.factor,
        action.recommendation,
      ]);
      sections.push(createTable(actionHeaders, actionRows, [12, 18, 10, 25, 35]));
    }
    
    sections.push(new Paragraph({ spacing: { after: 240 } }));
  });
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix D
  sections.push(createHeading("Appendix D: All Opportunities ROI Detailed Overview", HeadingLevel.HEADING_1));
  const appendixDText = replaceVariables(APPENDIX_D, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(appendixDText));

  // Portfolio Summary Table
  const portfolioHeaders = ["Workflow", "Opportunity", "Annual Benefit", "Est. Cost", "FTE Saved", "Payback"];
  const portfolioRows: string[][] = [];
  data.workflows.forEach(w => {
    w.opportunities.forEach(opp => {
      portfolioRows.push([
        w.workflow.name,
        opp.opportunity.name,
        formatCurrency(opp.roiMetrics.annualRoi),
        formatCurrency(parseFloat(opp.opportunity.implementationCost || "0")),
        formatNumber(opp.roiMetrics.fteSavings, 2),
        Math.round(opp.roiMetrics.paybackMonths) + " mo",
      ]);
    });
  });
  if (portfolioRows.length > 0) {
    sections.push(createTable(portfolioHeaders, portfolioRows));
  }
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix E
  sections.push(createHeading("Appendix E: ROI Calculation Methodology", HeadingLevel.HEADING_1));
  const appendixEText = replaceVariables(APPENDIX_E, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(appendixEText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix F - Data Provenance and Audit Trail
  sections.push(createHeading("Appendix F: Data Provenance and Audit Trail", HeadingLevel.HEADING_1));
  const provenanceHeaders = ["Workflow", "Type", "Respondent", "Role", "Department", "Method", "Date", "Status", "Gaps"];
  const provenanceRows = data.appendixF.map(prov => [
    prov.workflowName,
    prov.dataType,
    prov.respondentName,
    prov.respondentRole,
    prov.department || "N/A",
    prov.collectionMethod,
    prov.submissionDate,
    prov.validationStatus,
    prov.knowledgeGaps || "None",
  ]);
  if (provenanceRows.length > 0) {
    sections.push(createTable(provenanceHeaders, provenanceRows, [15, 6, 12, 10, 10, 15, 10, 8, 14]));
  }
  
  // Add detailed knowledge gap resolution tables if available
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
        detail.isKnowledgeGap ? "Yes" : "No",
        detail.resolvedAt,
      ]);
      sections.push(createTable(gapHeaders, gapRows, [5, 30, 15, 12, 15, 8, 15]));
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
                    text: `Prepared for ${data.company.name} by Automat-IA | Confidential`,
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
                    text: `Automat-IA Executive Diagnostic Report – ${diagnosticPeriod}`,
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
