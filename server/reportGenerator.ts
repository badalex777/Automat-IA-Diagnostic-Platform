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
    return /^(\d+\.\d+|[A-Z]\.\d+)\s+/.test(line.trim());
  };
  
  const isFrameworkName = (line: string): boolean => {
    // Matches framework names like "Technical Feasibility Assessment (TFA)." or "Process Insights Form (PIF)."
    const frameworks = [
      'Technical Feasibility Assessment',
      'Technical Feasibility Assessments',
      'Process Insights Form',
      'Process Insights Forms',
      'Stakeholder Interviews',
      'End-User Interviews',
      'Documentation Review',
      'Readiness Rubric',
      'Automat-IA ROI Calculator',
      'Opportunity Matrix'
    ];
    const trimmed = line.trim();
    return frameworks.some(fw => trimmed.startsWith(fw));
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

    const financialSummaryHeaders = ["Metric", "Value", "Description"];
    const totalTopBenefit = data.top3Opportunities.reduce((sum, opp) => sum + opp.annualBenefit, 0);
    const totalTopCost = data.top3Opportunities.reduce((sum, opp) => sum + parseFloat(opp.implementationCost || "0"), 0);
    const avgTopROI = data.top3Opportunities.reduce((sum, opp) => sum + opp.roi, 0) / data.top3Opportunities.length;
    const avgTopPayback = data.top3Opportunities.reduce((sum, opp) => sum + opp.paybackMonths, 0) / data.top3Opportunities.length;
    const totalTopFTE = data.top3Opportunities.reduce((sum, opp) => sum + opp.fteSavings, 0);

    const financialSummaryRows = [
      ["Total Annual Benefit", formatCurrency(totalTopBenefit), "Combined quantifiable value across identified opportunities"],
      ["Total Estimated Implementation Cost", formatCurrency(totalTopCost), "Includes implementation, training, and change management"],
      ["Average ROI", formatNumber(avgTopROI, 1) + "%", "Modeled under the Conservative Scenario Framework"],
      ["Average Payback Period", formatNumber(avgTopPayback, 1) + " months", "Time to recover implementation cost"],
      ["Total FTE Capacity Saved", formatNumber(totalTopFTE, 2), "Full-time equivalent hours freed for higher-value work"],
    ];

    sections.push(createTable(financialSummaryHeaders, financialSummaryRows));
    sections.push(createBodyParagraph("All figures modeled under Automat-IA's Conservative Scenario Framework; rounded to the nearest hundred."));
  }
  sections.push(createHorizontalSeparator());
  
  // Part 3: Sections 4.5-4.9
  const diagnosticOverviewPart3 = replaceVariables(DIAGNOSTIC_OVERVIEW_PART3, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(diagnosticOverviewPart3));

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== FINDINGS & ANALYSIS =====
  sections.push(createHeading("Findings and Analysis", HeadingLevel.HEADING_1));
  
  // Part 1: 5.1 Introduction text
  const findingsPart1 = replaceVariables(FINDINGS_ANALYSIS_PART1, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart1));
  
  // Table 5.1: Readiness Summary - ONE ROW PER WORKFLOW (not per opportunity)
  const readinessHeaders = ["Workflow", "TFA Score", "PIF Score", "Readiness", "Band"];
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
  
  // Part 4: Commentary after Table 5.2
  const findingsPart4 = replaceVariables(FINDINGS_ANALYSIS_PART4, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart4));
  sections.push(createHorizontalSeparator());
  
  // Part 5: 5.3 Opportunity Matrix Analysis introduction text
  const findingsPart5 = replaceVariables(FINDINGS_ANALYSIS_PART5, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart5));
  
  // Table 5.3: Matrix Distribution
  const matrixHeaders = ["Quadrant", "Opportunities", "Count"];
  const matrixRows = [
    ["Quick Wins", data.matrixDistribution.quickWins.opportunities.join(", "), data.matrixDistribution.quickWins.count.toString()],
    ["Strategic Goals", data.matrixDistribution.strategicGoals.opportunities.join(", "), data.matrixDistribution.strategicGoals.count.toString()],
    ["Nice-to-Haves", data.matrixDistribution.niceToHaves.opportunities.join(", "), data.matrixDistribution.niceToHaves.count.toString()],
    ["Deprioritize", data.matrixDistribution.deprioritize.opportunities.join(", "), data.matrixDistribution.deprioritize.count.toString()],
  ];
  sections.push(createTable(matrixHeaders, matrixRows));
  
  // Part 6: Commentary and matrix image placeholders
  const findingsPart6 = replaceVariables(FINDINGS_ANALYSIS_PART6, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(findingsPart6));
  
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
  
  // Introduction
  const roadmapIntro = replaceVariables(AUTOMATION_ROADMAP_INTRO, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapIntro));
  sections.push(createHorizontalSeparator());
  
  // Phase 1
  const roadmapPhase1 = replaceVariables(AUTOMATION_ROADMAP_PHASE1, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase1));
  
  // Phase 1 Table
  if (data.roadmapPhases.phase1QuickWins.length > 0) {
    const phase1Headers = ["Opportunity", "Annual Benefit", "Payback", "FTE Saved"];
    const phase1Rows = data.roadmapPhases.phase1QuickWins.map(opp => [
      opp.opportunity.name,
      formatCurrency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " mo",
      formatNumber(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTable(phase1Headers, phase1Rows));
  }
  
  const roadmapPhase1Outcomes = replaceVariables(AUTOMATION_ROADMAP_PHASE1_OUTCOMES, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase1Outcomes));
  sections.push(createHorizontalSeparator());

  // Phase 2
  const roadmapPhase2 = replaceVariables(AUTOMATION_ROADMAP_PHASE2, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase2));
  
  // Phase 2 Table
  if (data.roadmapPhases.phase2Foundational.length > 0) {
    const phase2Headers = ["Opportunity", "Annual Benefit", "Payback", "FTE Saved"];
    const phase2Rows = data.roadmapPhases.phase2Foundational.map(opp => [
      opp.opportunity.name,
      formatCurrency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " mo",
      formatNumber(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTable(phase2Headers, phase2Rows));
  }
  
  const roadmapPhase2Outcomes = replaceVariables(AUTOMATION_ROADMAP_PHASE2_OUTCOMES, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase2Outcomes));
  sections.push(createHorizontalSeparator());

  // Phase 3
  const roadmapPhase3 = replaceVariables(AUTOMATION_ROADMAP_PHASE3, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapPhase3));
  
  // Phase 3 Table
  if (data.roadmapPhases.phase3Strategic.length > 0) {
    const phase3Headers = ["Opportunity", "Annual Benefit", "Payback", "FTE Saved"];
    const phase3Rows = data.roadmapPhases.phase3Strategic.map(opp => [
      opp.opportunity.name,
      formatCurrency(opp.roiMetrics.annualRoi),
      Math.round(opp.roiMetrics.paybackMonths) + " mo",
      formatNumber(opp.roiMetrics.fteSavings, 2),
    ]);
    sections.push(createTable(phase3Headers, phase3Rows));
  }
  
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
    ["Phase 1: Quick Wins", "█████", "█████", "", "", "", ""],
    ["Phase 2: Foundational", "", "", "█████", "█████", "", ""],
    ["Phase 3: Strategic", "", "", "", "", "█████", "█████"],
  ];
  sections.push(createTable(ganttHeaders, ganttRows));
  
  // Narrative Summary
  const roadmapSummary = replaceVariables(AUTOMATION_ROADMAP_SUMMARY, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(roadmapSummary));

  sections.push(new Paragraph({ children: [new PageBreak()] }));
  
  // ===== CONCLUSIONS & NEXT STEPS =====
  sections.push(createHeading("Conclusions and Next Steps", HeadingLevel.HEADING_1));

  sections.push(createBodyParagraph("Key Conclusions:"));
  sections.push(createBulletParagraph("High-readiness workflows identified for immediate automation, offering quick ROI realization."));
  sections.push(createBulletParagraph("Foundational gaps in data quality and system integration require strategic investment."));
  sections.push(createBulletParagraph("The phased roadmap balances short-term wins with long-term transformation."));

  sections.push(createBodyParagraph("Recommended Next Steps:"));
  sections.push(createBulletParagraph("Prioritize Quick Win opportunities for Phase 1 implementation within the next 90 days."));
  sections.push(createBulletParagraph("Develop detailed implementation plans for foundational infrastructure improvements."));
  sections.push(createBulletParagraph("Establish governance framework and change management protocols."));
  sections.push(createBulletParagraph("Schedule follow-up diagnostic review at 6-month interval to track progress."));

  sections.push(createHorizontalSeparator());

  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // ===== APPENDICES =====

  // Appendix A
  sections.push(createHeading("Appendix A: Detailed Methodology", HeadingLevel.HEADING_1));
  const appendixAText = replaceVariables(APPENDIX_A, templateVars, commentaryKeys);
  sections.push(...createTextParagraphs(appendixAText));
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix B: Readiness Score Metric Weighting
  sections.push(createHeading("Appendix B: Readiness Score Metric Weighting", HeadingLevel.HEADING_1));
  
  sections.push(createBodyParagraph(
    "The Readiness Score is calculated as a weighted combination of the Technical Feasibility Assessment (TFA) " +
    "and Process Insights Form (PIF). These weights reflect the relative importance of technical and operational " +
    "factors in determining automation feasibility."
  ));
  
  // Metric Weighting Table
  const metricWeightHeaders = ["Component", "Weight", "Description"];
  const metricWeightRows = [
    ["Technical Feasibility Assessment (TFA)", "60%", "Measures system readiness, data quality, integration capability, and security compliance"],
    ["Process Insights Form (PIF)", "40%", "Captures process clarity, change magnitude, and workflow brittleness from operational perspective"],
  ];
  sections.push(createTable(metricWeightHeaders, metricWeightRows, [35, 15, 50]));
  
  sections.push(createBodyParagraph("Why These Weights Matter:"));
  sections.push(createBulletParagraph("TFA carries higher weight (60%) because technical barriers are typically harder and more expensive to remediate than operational issues."));
  sections.push(createBulletParagraph("PIF provides essential context (40%) on process maturity and organizational readiness, which directly impacts adoption success."));
  sections.push(createBulletParagraph("Combined, these metrics produce a holistic readiness score that balances technical feasibility with operational reality."));
  
  sections.push(createHorizontalSeparator());
  sections.push(new Paragraph({ children: [new PageBreak()] }));
  
  // Appendix C: Readiness SWOT Analysis (formerly Appendix B)
  sections.push(createHeading("Appendix C: Readiness SWOT Analysis", HeadingLevel.HEADING_1));
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
    
    // Recommended Follow-Up Actions Table (Question Insights removed per Task 13)
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
    
    sections.push(createHorizontalSeparator());
  });
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix D
  sections.push(createHeading("Appendix D: All Opportunities ROI Detailed Overview", HeadingLevel.HEADING_1));
  sections.push(createBodyParagraph(APPENDIX_D_INTRO));
  
  // D.1 Portfolio Summary Table (add Weekly Hours Saved column)
  const portfolioHeaders = ["Workflow", "Opportunity", "Annual Benefit", "Est. Cost", "FTE Saved", "Payback", "Weekly Hours Saved"];
  const portfolioRows: string[][] = [];
  data.workflows.forEach(w => {
    w.opportunities.forEach(opp => {
      const weeklyHours = (opp.roiMetrics.fteSavings * 2080) / 52;
      portfolioRows.push([
        w.workflow.name,
        opp.opportunity.name,
        formatCurrency(opp.roiMetrics.annualRoi),
        formatCurrency(parseFloat(opp.opportunity.implementationCost || "0")),
        formatNumber(opp.roiMetrics.fteSavings, 2),
        Math.round(opp.roiMetrics.paybackMonths) + " mo",
        formatNumber(weeklyHours, 1),
      ]);
    });
  });
  if (portfolioRows.length > 0) {
    sections.push(createTable(portfolioHeaders, portfolioRows));
  }
  sections.push(createBodyParagraph("Use the portfolio summary to compare opportunity scale, cost, and realization pace at a glance. Detailed per-opportunity pages follow."));
  sections.push(createHorizontalSeparator());
  
  // D.2.X sections - ONE PER OPPORTUNITY
  let oppCounter = 1;
  data.workflows.forEach(w => {
    w.opportunities.forEach(opp => {
      sections.push(
        new Paragraph({
          text: `D.2.${oppCounter} ROI Insights – ${w.workflow.name} / ${opp.opportunity.name}`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 360, after: 120 },
        })
      );
      
      // Performance Summary paragraph
      const annualHours = opp.roiMetrics.fteSavings * 2080;
      sections.push(createBodyParagraph(
        `Performance Summary. Under the conservative scenario, estimated annual benefit is ` +
        `${formatCurrency(opp.roiMetrics.annualRoi)}, equivalent to ${formatNumber(opp.roiMetrics.fteSavings, 2)} FTEs or approximately ` +
        `${formatNumber(annualHours, 0)} hours per year, with an expected payback of ${Math.round(opp.roiMetrics.paybackMonths)} months.`
      ));
      
      // Key Metrics Table (9 rows)
      const implCost = parseFloat(opp.opportunity.implementationCost || "0");
      const year1Net = opp.roiMetrics.annualRoi - implCost;
      const year3Net = (opp.roiMetrics.annualRoi * 3) - implCost;
      const year5Net = (opp.roiMetrics.annualRoi * 5) - implCost;
      const weeklyHours = annualHours / 52;
      
      const keyMetricsHeaders = ["Metric", "Value"];
      const keyMetricsRows = [
        ["Annual Benefit", formatCurrency(opp.roiMetrics.annualRoi)],
        ["Estimated Implementation Cost", formatCurrency(implCost)],
        ["Payback Period", `${Math.round(opp.roiMetrics.paybackMonths)} months`],
        ["1-Year Net Benefit", formatCurrency(year1Net)],
        ["3-Year Net Benefit", formatCurrency(year3Net)],
        ["5-Year Net Benefit", formatCurrency(year5Net)],
        ["FTE Saved", formatNumber(opp.roiMetrics.fteSavings, 2)],
        ["Annual Hours Saved", formatNumber(annualHours, 0)],
        ["Weekly Hours Saved", formatNumber(weeklyHours, 1)],
      ];
      sections.push(createTable(keyMetricsHeaders, keyMetricsRows, [50, 50]));
      sections.push(createBodyParagraph("All values modeled under Automat-IA Conservative Scenario."));
      
      // Business Impact Components Table
      const impactHeaders = ["Impact Area", "Key Metrics", "Description"];
      const impactRows = [
        ["Time Savings", `${formatNumber(annualHours, 0)} hours/year`, "Primary efficiency gain from process automation"],
        ["Quality Impact", "Conservative estimate", "Error reduction benefits modeled conservatively where data available"],
        ["Revenue Uplift", "To be validated", "Capacity reallocation potential subject to business validation"],
        ["Ramp-Up Period", "3 months", "Time to reach steady-state performance after implementation"],
      ];
      sections.push(createTable(impactHeaders, impactRows, [25, 25, 50]));
      
      // Dominant component paragraph
      sections.push(createBodyParagraph(
        "For this opportunity, the majority of measurable benefit is driven by time savings. " +
        "Quality and revenue impacts are modeled conservatively or omitted where supporting data is insufficient. " +
        "Ramp-up accounts for adoption and stabilization so Year-1 results reflect achievable performance."
      ));
      
      sections.push(createHorizontalSeparator());
      oppCounter++;
    });
  });
  
  // D.3 Modeling Notes
  sections.push(...createTextParagraphs(APPENDIX_D_MODELING_NOTES));
  sections.push(createHorizontalSeparator());
  sections.push(new Paragraph({ children: [new PageBreak()] }));

  // Appendix E
  sections.push(createHeading("Appendix E: ROI Calculation Methodology", HeadingLevel.HEADING_1));

  // E.1 Core Financial Formulas (text only)
  sections.push(...createTextParagraphs(APPENDIX_E_PART1));

  // E.2 Net Benefit Formulas Table
  const netBenefitHeaders = ["Projection Horizon", "Formula", "Purpose"];
  const netBenefitRows = [
    ["Year 1", "Annual Benefit × Ramp-Up Factor − Implementation Cost", "Accounts for partial realization during adoption phase"],
    ["3-Year", "(Annual Benefit × 3) − Implementation Cost", "Cumulative value over initial contract period"],
    ["5-Year", "(Annual Benefit × 5) − Implementation Cost", "Long-term strategic value assessment"],
  ];
  sections.push(createTable(netBenefitHeaders, netBenefitRows, [25, 40, 35]));

  // E.3 FTE Conversions (text)
  sections.push(...createTextParagraphs(APPENDIX_E_PART2));

  // E.4 Annual Benefit Breakdown Table
  const benefitHeaders = ["Component", "Formula", "Description"];
  const benefitRows = [
    ["Time Savings Benefits", "Hours Saved × Effective Hourly Rate × Adoption %", "Value of time freed for higher-priority work"],
    ["Error Reduction Benefits", "Error Rate × Rework Cost × Volume × Improvement %", "Value of quality improvements and rework avoided"],
    ["Revenue Uplift Benefits", "Capacity Reallocation × Revenue per Hour × Realization %", "Value from redirecting capacity to revenue-generating activities"],
  ];
  sections.push(createTable(benefitHeaders, benefitRows, [25, 40, 35]));
  sections.push(createBodyParagraph("All benefit calculations apply downward multipliers in conservative modeling to avoid overstatement."));

  // E.5 Scenario Adjustment Framework Table
  sections.push(...createTextParagraphs(APPENDIX_E_PART3));
  const scenarioHeaders = ["Adjustment Category", "Conservative Modeling Rationale"];
  const scenarioRows = [
    ["Time Savings Adjustment", "Apply 60-75% realization factor to account for exceptions, learning curves, and process variations"],
    ["Error Reduction Adjustment", "Only include when error data is documented; apply 50% discount to projected improvements"],
    ["Revenue Reallocation Adjustment", "Exclude unless business validates capacity can be redirected; apply 40% discount when included"],
    ["Cost Overrun Adjustment", "Add 20% contingency to implementation costs to reflect typical project overruns"],
    ["Ramp-Up Efficiency Adjustment", "Year 1 benefits discounted by 50% to reflect gradual adoption and stabilization"],
  ];
  sections.push(createTable(scenarioHeaders, scenarioRows, [35, 65]));
  sections.push(createBodyParagraph("Together these controls form the Conservative Scenario Framework, ensuring projections remain achievable, evidence-based, and comparable across diagnostics."));

  // E.6 Key Modeling Assumptions Table
  sections.push(...createTextParagraphs(APPENDIX_E_PART4));
  const assumptionsHeaders = ["Variable", "Standard Assumption", "Rationale"];
  const assumptionsRows = [
    ["Effective Hourly Rate", "$50-$75 per hour", "Blended rate reflecting salary, benefits, and overhead across roles"],
    ["Standard Work Year", "2,080 hours", "52 weeks × 40 hours, industry standard for FTE calculations"],
    ["Process Baseline", "Current state as reported", "PIF data establishes pre-automation performance baseline"],
    ["Automation Capability", "60-80% task coverage", "Realistic automation scope accounting for exceptions and edge cases"],
    ["Recurring Costs", "10-15% of implementation", "Annual software licenses, maintenance, and support"],
    ["One-Time Costs", "Implementation + Training", "Includes build, configuration, testing, and change management"],
  ];
  sections.push(createTable(assumptionsHeaders, assumptionsRows, [25, 30, 45]));

  // E.7 Formula Integrity (text)
  sections.push(...createTextParagraphs(APPENDIX_E_PART5));
  sections.push(createHorizontalSeparator());
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
