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
 * Create a text paragraph from a multi-line string
 */
function createTextParagraphs(text: string): Paragraph[] {
  return text
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => new Paragraph({
      text: line.trim(),
      spacing: { after: 120 },
    }));
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
 * Main function to generate Executive Diagnostic Report
 */
export async function generateExecutiveReport(data: DiagnosticData): Promise<Buffer> {
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

  // Appendix B - SWOT Analysis
  sections.push(createHeading("Appendix B: Readiness SWOT Analysis", HeadingLevel.HEADING_1));
  data.appendixB.forEach(swotData => {
    sections.push(
      new Paragraph({
        text: `Workflow: ${swotData.workflowName}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 240, after: 120 },
      })
    );

    const swotHeaders = ["Category", "Findings"];
    const swotRows = [
      ["Strengths", swotData.swotAnalysis.strengths.join("\n")],
      ["Weaknesses", swotData.swotAnalysis.weaknesses.join("\n")],
      ["Opportunities", swotData.swotAnalysis.opportunities.join("\n")],
      ["Threats", swotData.swotAnalysis.threats.join("\n")],
    ];
    sections.push(createTable(swotHeaders, swotRows, [30, 70]));
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

  // Appendix F - Data Provenance
  sections.push(createHeading("Appendix F: Data Provenance and Audit Trail", HeadingLevel.HEADING_1));
  const provenanceHeaders = ["Workflow", "Type", "Respondent", "Role", "Department", "Method", "Date", "Gaps"];
  const provenanceRows = data.appendixF.map(prov => [
    prov.workflowName,
    prov.dataType,
    prov.respondentName,
    prov.respondentRole,
    prov.department || "N/A",
    prov.collectionMethod,
    prov.submissionDate,
    prov.knowledgeGaps || "None",
  ]);
  if (provenanceRows.length > 0) {
    sections.push(createTable(provenanceHeaders, provenanceRows));
  }

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
