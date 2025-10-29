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
  Packer,
  PageNumber,
  NumberFormat,
  TabStopType,
  TabStopPosition,
  convertInchesToTwip,
  VerticalAlign,
  UnderlineType,
} from "docx";
import { DiagnosticData } from "./reportDataAggregator";

// Automat-IA Brand Colors (converted to hex)
const COLORS = {
  PRIMARY_GREEN: "10b981",    // Main brand green
  LIGHT_GREEN: "6ee7b7",      // Light accent green
  PALE_GREEN: "a7f3d0",       // Pale green
  BLACK: "000000",
  DARK_GRAY: "374151",
  MEDIUM_GRAY: "6b7280",
  LIGHT_GRAY: "d1d5db",
};

// Format helper functions
function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Main function to generate Executive Diagnostic Report
 */
export async function generateExecutiveReport(
  data: DiagnosticData
): Promise<Buffer> {
  // Calculate aggregate metrics
  const totalWorkflows = data.workflows.length;
  const totalOpportunities = data.workflows.reduce(
    (sum, w) => sum + w.opportunities.length,
    0
  );
  
  const totalAnnualBenefit = data.workflows.reduce(
    (sum, w) =>
      sum + w.opportunities.reduce((s, o) => s + o.roiMetrics.annualRoi, 0),
    0
  );

  const avgPaybackMonths =
    totalOpportunities > 0
      ? data.workflows.reduce(
          (sum, w) =>
            sum +
            w.opportunities.reduce((s, o) => s + o.roiMetrics.paybackMonths, 0),
          0
        ) / totalOpportunities
      : 0;

  const avgROI =
    totalOpportunities > 0
      ? (totalAnnualBenefit /
          data.workflows.reduce(
            (sum, w) =>
              sum +
              w.opportunities.reduce(
                (s, o) => s + o.roiMetrics.paybackMonths * 1000,
                0
              ),
            1
          )) *
        100
      : 0;

  // Sort opportunities by ROI for top 3
  const allOpportunities = data.workflows.flatMap((w) =>
    w.opportunities.map((o) => ({
      workflowName: w.workflow.name,
      ...o,
    }))
  );
  const top3Opportunities = allOpportunities
    .sort((a, b) => b.roiMetrics.annualRoi - a.roiMetrics.annualRoi)
    .slice(0, 3);

  // Count opportunities by quadrant
  const quadrantCounts = {
    "Quick Wins": 0,
    "Strategic Goals": 0,
    "Nice-To-Haves": 0,
    Deprioritize: 0,
  };
  allOpportunities.forEach((opp) => {
    quadrantCounts[opp.matrixPosition.quadrant]++;
  });

  // Create document sections
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Roboto",
            size: 22, // 11pt (half-points)
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
            },
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
            spacing: {
              before: 480,
              after: 240,
            },
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
            spacing: {
              before: 360,
              after: 180,
            },
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
            spacing: {
              before: 240,
              after: 120,
            },
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
                spacing: {
                  after: 200,
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
                    text: "Page ",
                    size: 18,
                    color: COLORS.MEDIUM_GRAY,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: COLORS.MEDIUM_GRAY,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                border: {
                  top: {
                    color: COLORS.LIGHT_GRAY,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 6,
                  },
                },
                spacing: {
                  before: 200,
                },
              }),
            ],
          }),
        },
        children: [
          // ===== COVER PAGE =====
          new Paragraph({
            children: [
              new TextRun({
                text: "",
              }),
            ],
            spacing: { before: 2000 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "EXECUTIVE DIAGNOSTIC REPORT",
                size: 48,
                bold: true,
                color: COLORS.PRIMARY_GREEN,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.company.name,
                size: 36,
                bold: true,
                color: COLORS.BLACK,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Automation Readiness & Opportunity Analysis",
                size: 24,
                color: COLORS.DARK_GRAY,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Diagnostic Period: ${formatDate(data.diagnosticPeriod.start)} - ${formatDate(data.diagnosticPeriod.end)}`,
                size: 22,
                color: COLORS.MEDIUM_GRAY,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Lead Analyst: Alejandro Madrid-Malo",
                size: 22,
                color: COLORS.MEDIUM_GRAY,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Version: v1 - ${formatMonthYear(new Date())}`,
                size: 22,
                color: COLORS.MEDIUM_GRAY,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1600 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Automat-IA",
                size: 32,
                bold: true,
                color: COLORS.PRIMARY_GREEN,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),

          // ===== PAGE BREAK TO TABLE OF CONTENTS =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== TABLE OF CONTENTS =====
          new Paragraph({
            text: "Table of Contents",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 400 },
          }),
          new TableOfContents("Table of Contents", {
            hyperlink: true,
            headingStyleRange: "1-3",
          }),

          // ===== PAGE BREAK TO MAIN CONTENT =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== SECTION 1: EXECUTIVE SUMMARY =====
          new Paragraph({
            text: "1. Executive Summary",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `This diagnostic report presents the findings from our comprehensive automation readiness assessment of ${data.company.name}. Our analysis identified `,
              }),
              new TextRun({
                text: `${totalWorkflows} critical workflows`,
                bold: true,
              }),
              new TextRun({
                text: " and evaluated ",
              }),
              new TextRun({
                text: `${totalOpportunities} automation opportunities`,
                bold: true,
              }),
              new TextRun({
                text: " with a combined annual benefit potential of ",
              }),
              new TextRun({
                text: formatCurrency(totalAnnualBenefit),
                bold: true,
                color: COLORS.PRIMARY_GREEN,
              }),
              new TextRun({
                text: ".",
              }),
            ],
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Key Findings:",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Total Workflows Analyzed: ${totalWorkflows}`,
              }),
            ],
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Automation Opportunities Identified: ${totalOpportunities}`,
              }),
            ],
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Total Annual Benefit: ${formatCurrency(totalAnnualBenefit)}`,
              }),
            ],
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Average Payback Period: ${Math.round(avgPaybackMonths)} months`,
              }),
            ],
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Average ROI: ${formatPercentage(avgROI)}`,
              }),
            ],
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "[Strategic Interpretation: Describe the overall automation readiness posture, highlight the most compelling opportunities, and provide executive-level context on what these findings mean for the organization's digital transformation journey. Include specific recommendations on prioritization approach and expected business impact.]",
                italics: true,
                color: COLORS.MEDIUM_GRAY,
              }),
            ],
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== SECTION 2: CONFIDENTIALITY & DISCLAIMER =====
          new Paragraph({
            text: "2. Confidentiality & Disclaimer Statement",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Confidentiality",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This document contains confidential and proprietary information belonging to ",
              }),
              new TextRun({
                text: data.company.name,
                bold: true,
              }),
              new TextRun({
                text: " and Automat-IA. The information contained herein is intended solely for the use of the individual or entity to whom it is addressed. Any dissemination, distribution, or copying of this document without prior written consent from both parties is strictly prohibited.",
              }),
            ],
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Disclaimer",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "The findings, recommendations, and financial projections presented in this report are based on information provided during the diagnostic period and reflect conditions as of the assessment date. Actual results may vary based on:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "• Changes in business processes, technology infrastructure, or organizational priorities",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Variations in implementation approach, timeline, or resource allocation",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• External factors including market conditions, regulatory changes, or technology evolution",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Accuracy and completeness of information provided by stakeholders during assessment",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "ROI calculations and benefit projections are estimates based on industry benchmarks and client-provided data. Automat-IA makes no warranties or guarantees regarding the achievement of specific financial outcomes. This report should be used as a strategic planning tool in conjunction with your organization's due diligence and decision-making processes.",
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Professional Engagement",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "This diagnostic assessment was conducted by Automat-IA's certified automation analysts using our proprietary methodology. All recommendations are provided in good faith based on current industry best practices and our professional expertise in automation strategy and implementation.",
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== SECTION 3: METHODOLOGY OVERVIEW =====
          new Paragraph({
            text: "3. Methodology Overview",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Our diagnostic approach combines rigorous technical assessment with business impact analysis to provide a complete picture of automation potential. The methodology consists of six key phases:",
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Phase 1: Stakeholder Discovery Interviews",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "We conducted structured interviews with process owners, subject matter experts, and end users to understand current workflows, pain points, and automation aspirations. These sessions establish baseline understanding and identify candidate processes for deeper analysis.",
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Phase 2: Technical Feasibility Assessment (TFA)",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Each workflow underwent a comprehensive technical evaluation across four dimensions: System Environment (accessibility, API availability), Data Quality (structure, consistency), Integration Feasibility (complexity, dependencies), and Security & Compliance (requirements, constraints). Scores from 1-5 generate an overall technical readiness rating.",
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Phase 3: Process Impact Forms (PIF)",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Process participants completed detailed questionnaires capturing operational metrics (frequency, duration, employee count) and qualitative insights (exceptions, knowledge requirements, pain points). These inputs feed ROI calculations and reveal implementation considerations beyond pure technical feasibility.",
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Phase 4: Opportunity Identification & ROI Modeling",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Using TFA and PIF data, we modeled specific automation opportunities with quantified benefits: time savings (hours/week, FTE reduction), error reduction percentages, and revenue impact where applicable. Each opportunity receives annualized ROI calculations and payback period projections.",
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Phase 5: Dual-Matrix Positioning",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Opportunities are positioned on two axes—Business Impact (combining ROI, annual benefits, and strategic value) versus Implementation Effort (derived from technical complexity and readiness scores). This creates four quadrants: Quick Wins, Strategic Goals, Nice-To-Haves, and Deprioritize, enabling clear prioritization.",
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Phase 6: Roadmap Development",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Finally, we sequence opportunities into a phased implementation roadmap: Phase 1 (Quick Wins, 0-6 months) delivers immediate value and builds momentum; Phase 2 (Foundational, 6-12 months) establishes core automation infrastructure; Phase 3 (Strategic, 12-18+ months) tackles complex, high-value transformations requiring the foundation built in earlier phases.",
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== SECTION 4: DIAGNOSTIC OVERVIEW =====
          new Paragraph({
            text: "4. Diagnostic Overview",
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph({
            text: "Assessment Scope",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: `This diagnostic evaluated ${totalWorkflows} workflows across ${data.company.name}'s operations. The assessment period spanned from ${formatDate(data.diagnosticPeriod.start)} to ${formatDate(data.diagnosticPeriod.end)}.`,
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Top 3 Opportunities (by Annual ROI)",
            heading: HeadingLevel.HEADING_3,
          }),

          ...top3Opportunities.flatMap((opp, idx) => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${idx + 1}. ${opp.workflowName} - ${opp.opportunity.name}`,
                  bold: true,
                  color: COLORS.PRIMARY_GREEN,
                }),
              ],
              spacing: { before: 120, after: 60 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Annual ROI: ${formatCurrency(opp.roiMetrics.annualRoi)} | `,
                }),
                new TextRun({
                  text: `FTE Savings: ${opp.roiMetrics.fteSavings.toFixed(2)} | `,
                }),
                new TextRun({
                  text: `Payback: ${Math.round(opp.roiMetrics.paybackMonths)} months`,
                }),
              ],
              spacing: { after: 60 },
            }),
            new Paragraph({
              text: opp.opportunity.description || "[Opportunity description]",
              spacing: { after: 180 },
            }),
          ]),

          new Paragraph({
            children: [
              new TextRun({
                text: "[Commentary: Provide strategic context on these top opportunities. Explain why they rank highest, what business challenges they address, and any interdependencies or prerequisites for successful implementation.]",
                italics: true,
                color: COLORS.MEDIUM_GRAY,
              }),
            ],
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "Financial Summary",
            heading: HeadingLevel.HEADING_3,
          }),

          // Financial Summary Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Metric",
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                    shading: {
                      fill: COLORS.PALE_GREEN,
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Value",
                            bold: true,
                          }),
                        ],
                      }),
                    ],
                    shading: {
                      fill: COLORS.PALE_GREEN,
                    },
                  }),
                ],
              }),
              // Data rows
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Total Opportunities")],
                  }),
                  new TableCell({
                    children: [new Paragraph(totalOpportunities.toString())],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Total Annual Benefits")],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: formatCurrency(totalAnnualBenefit),
                            bold: true,
                            color: COLORS.PRIMARY_GREEN,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Average Payback Period")],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(`${Math.round(avgPaybackMonths)} months`),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Average ROI")],
                  }),
                  new TableCell({
                    children: [new Paragraph(formatPercentage(avgROI))],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Total FTE Savings Potential")],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(
                        allOpportunities
                          .reduce((sum, o) => sum + o.roiMetrics.fteSavings, 0)
                          .toFixed(2)
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: "",
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== SECTION 5: FINDINGS & ANALYSIS =====
          new Paragraph({
            text: "5. Findings & Analysis",
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph({
            text: "Readiness Summary by Workflow",
            heading: HeadingLevel.HEADING_3,
          }),

          // Readiness Summary Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Workflow", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "TFA Score", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Readiness Score", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Feasibility Band", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Opportunities", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                ],
              }),
              // Data rows
              ...data.workflows.map(
                (w) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph(w.workflow.name)],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(
                            w.tfa ? w.tfa.score.toFixed(1) : "N/A"
                          ),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(
                            w.readiness
                              ? w.readiness.totalScore.toFixed(1)
                              : "N/A"
                          ),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(
                            w.readiness ? w.readiness.feasibilityBand : "N/A"
                          ),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(w.opportunities.length.toString()),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({
            text: "",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "ROI Insights",
            heading: HeadingLevel.HEADING_3,
          }),

          // ROI Insights Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Opportunity", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Annual ROI", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "FTE Savings", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Payback (mo)", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Quadrant", bold: true })],
                      }),
                    ],
                    shading: { fill: COLORS.PALE_GREEN },
                  }),
                ],
              }),
              // Data rows - top 10 opportunities
              ...allOpportunities.slice(0, 10).map(
                (opp) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph(
                            `${opp.workflowName}: ${opp.opportunity.name}`
                          ),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(
                            formatCurrency(opp.roiMetrics.annualRoi)
                          ),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(opp.roiMetrics.fteSavings.toFixed(2)),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(
                            Math.round(opp.roiMetrics.paybackMonths).toString()
                          ),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(opp.matrixPosition.quadrant),
                        ],
                      }),
                    ],
                  })
              ),
            ],
          }),

          new Paragraph({
            text: "",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "Opportunity Matrix Analysis",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Our dual-matrix positioning reveals the following distribution of opportunities:",
            spacing: { after: 180 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `• Quick Wins (High Impact, Low Effort): ${quadrantCounts["Quick Wins"]} opportunities`,
                bold: quadrantCounts["Quick Wins"] > 0,
              }),
            ],
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Strategic Goals (High Impact, High Effort): ${quadrantCounts["Strategic Goals"]} opportunities`,
              }),
            ],
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Nice-To-Haves (Low Impact, Low Effort): ${quadrantCounts["Nice-To-Haves"]} opportunities`,
              }),
            ],
            bullet: { level: 0 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Deprioritize (Low Impact, High Effort): ${quadrantCounts["Deprioritize"]} opportunities`,
              }),
            ],
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "[Analysis: Interpret the quadrant distribution. What does the concentration of opportunities in Quick Wins vs. Strategic Goals tell us about the organization's automation maturity? Are there themes emerging within each quadrant? What dependencies exist between quick wins and strategic initiatives?]",
                italics: true,
                color: COLORS.MEDIUM_GRAY,
              }),
            ],
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== SECTION 6: AUTOMATION ROADMAP =====
          new Paragraph({
            text: "6. Automation Roadmap",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Based on our analysis, we recommend a phased approach that balances quick value delivery with strategic capability building:",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "Phase 1: Quick Wins (0-6 months)",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Focus on high-impact, low-complexity opportunities that demonstrate value and build organizational confidence in automation.",
            spacing: { after: 180 },
          }),

          ...allOpportunities
            .filter((o) => o.matrixPosition.quadrant === "Quick Wins")
            .slice(0, 5)
            .map(
              (opp) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${opp.workflowName}: ${opp.opportunity.name}`,
                      bold: true,
                    }),
                    new TextRun({
                      text: ` - ${formatCurrency(opp.roiMetrics.annualRoi)} annual benefit, ${Math.round(opp.roiMetrics.paybackMonths)} month payback`,
                    }),
                  ],
                  bullet: { level: 0 },
                })
            ),

          new Paragraph({
            text: "",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "Phase 2: Foundational Builds (6-12 months)",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Establish core automation infrastructure and tackle moderate-complexity opportunities that enable future phases.",
            spacing: { after: 180 },
          }),

          ...allOpportunities
            .filter((o) => o.matrixPosition.quadrant === "Nice-To-Haves")
            .slice(0, 5)
            .map(
              (opp) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${opp.workflowName}: ${opp.opportunity.name}`,
                      bold: true,
                    }),
                    new TextRun({
                      text: ` - ${formatCurrency(opp.roiMetrics.annualRoi)} annual benefit`,
                    }),
                  ],
                  bullet: { level: 0 },
                })
            ),

          new Paragraph({
            text: "",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "Phase 3: Strategic Transformations (12-18+ months)",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Pursue high-value, complex automations that require the foundation built in earlier phases and deliver transformative business impact.",
            spacing: { after: 180 },
          }),

          ...allOpportunities
            .filter((o) => o.matrixPosition.quadrant === "Strategic Goals")
            .slice(0, 5)
            .map(
              (opp) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `• ${opp.workflowName}: ${opp.opportunity.name}`,
                      bold: true,
                    }),
                    new TextRun({
                      text: ` - ${formatCurrency(opp.roiMetrics.annualRoi)} annual benefit`,
                    }),
                  ],
                  bullet: { level: 0 },
                })
            ),

          new Paragraph({
            text: "",
            spacing: { after: 240 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "[Roadmap Narrative: Explain the sequencing logic, highlight any critical dependencies between phases, discuss resource requirements and change management considerations. Note any external factors (budget cycles, technology migrations, organizational readiness) that should inform timing.]",
                italics: true,
                color: COLORS.MEDIUM_GRAY,
              }),
            ],
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== SECTION 7: CONCLUSIONS & NEXT STEPS =====
          new Paragraph({
            text: "7. Conclusions & Next Steps",
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph({
            text: "Key Conclusions",
            heading: HeadingLevel.HEADING_3,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: `${data.company.name} demonstrates `,
              }),
              new TextRun({
                text: data.hasCompleteOpportunities
                  ? "strong readiness"
                  : "emerging potential",
                bold: true,
              }),
              new TextRun({
                text: ` for automation with ${totalOpportunities} identified opportunities representing ${formatCurrency(totalAnnualBenefit)} in annual benefits.`,
              }),
            ],
            spacing: { after: 180 },
          }),

          new Paragraph({
            text: `• The ${quadrantCounts["Quick Wins"]} Quick Win opportunities provide an excellent starting point for demonstrating value and building momentum`,
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: `• Strategic opportunities in Phase 3 represent the highest individual ROI but require foundational capabilities from earlier phases`,
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: `• Average payback period of ${Math.round(avgPaybackMonths)} months indicates relatively rapid return on automation investments`,
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Technical feasibility assessments reveal varying levels of readiness across workflows, informing implementation sequencing",
            bullet: { level: 0 },
            spacing: { after: 360 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "[Strategic Interpretation: Synthesize the diagnostic findings into strategic guidance. What is the overall automation maturity level? What organizational capabilities need strengthening? How does this automation roadmap align with broader digital transformation goals? What executive sponsorship and change management will be critical?]",
                italics: true,
                color: COLORS.MEDIUM_GRAY,
              }),
            ],
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "Recommended Next Steps",
            heading: HeadingLevel.HEADING_3,
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "1. Executive Alignment Session",
                bold: true,
              }),
            ],
            spacing: { before: 180, after: 120 },
          }),
          new Paragraph({
            text: "Convene leadership to review findings, validate prioritization, and secure sponsorship for Phase 1 initiatives.",
            spacing: { after: 180 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "2. Detailed Solution Design (Phase 1 Opportunities)",
                bold: true,
              }),
            ],
            spacing: { before: 180, after: 120 },
          }),
          new Paragraph({
            text: "Conduct technical design sessions for top-priority Quick Wins to define architecture, integration points, and implementation approach.",
            spacing: { after: 180 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "3. Pilot Implementation",
                bold: true,
              }),
            ],
            spacing: { before: 180, after: 120 },
          }),
          new Paragraph({
            text: "Select 1-2 Quick Win opportunities for pilot implementation to validate ROI assumptions and refine delivery methodology.",
            spacing: { after: 180 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "4. Automation Center of Excellence (CoE) Planning",
                bold: true,
              }),
            ],
            spacing: { before: 180, after: 120 },
          }),
          new Paragraph({
            text: "Define governance model, standards, and support structure to scale automation beyond initial pilots.",
            spacing: { after: 180 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "5. Quarterly Roadmap Review Cadence",
                bold: true,
              }),
            ],
            spacing: { before: 180, after: 120 },
          }),
          new Paragraph({
            text: "Establish regular checkpoints to assess progress, reprioritize based on business changes, and identify new opportunities.",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "This diagnostic provides a data-driven foundation for your automation journey. We recommend moving forward with Phase 1 Quick Wins within the next quarter to begin realizing benefits and building organizational capability.",
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "",
            spacing: { after: 600 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "For questions or to discuss next steps, please contact:",
                italics: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Alejandro Madrid-Malo",
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Lead Automation Analyst, Automat-IA",
                italics: true,
              }),
            ],
          }),

          // ===== PAGE BREAK TO APPENDICES =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== APPENDIX A: DETAILED METHODOLOGY =====
          new Paragraph({
            text: "Appendix A: Detailed Methodology (Technical Deep-Dive)",
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph({
            text: "Data Sources & Collection",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Our diagnostic methodology draws from four primary data sources:",
            spacing: { after: 180 },
          }),
          new Paragraph({
            text: "• Technical Feasibility Assessments (TFA): Structured technical evaluations completed by IT/operations leads for each workflow, capturing system accessibility, data quality, integration complexity, and security constraints",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Process Impact Forms (PIF): Detailed questionnaires completed by process participants capturing operational metrics, pain points, and qualitative insights about day-to-day execution",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Stakeholder Interviews: Semi-structured discussions with process owners and subject matter experts to understand strategic context and automation objectives",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• End-User Interviews: Direct conversations with workflow participants to validate PIF responses and uncover nuanced implementation considerations",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Diagnostic Frameworks",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Technical Feasibility Assessment (TFA) - 60% Weight",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "The TFA evaluates workflows across four equally-weighted sections:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "1. System Environment (25% of TFA): Evaluates system accessibility, API availability, authentication mechanisms, and technical documentation quality",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "2. Data Quality (25% of TFA): Assesses data structure, consistency, validation rules, and availability of structured vs. unstructured data",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "3. Integration Feasibility (25% of TFA): Measures integration complexity, cross-system dependencies, and required technical capabilities",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "4. Security & Compliance (25% of TFA): Reviews security requirements, compliance constraints, data sensitivity, and audit trail needs",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Process Impact Form (PIF) - 40% Weight",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "The PIF captures operational readiness across three components:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "1. Process Clarity (33% of PIF): Measures documentation quality, standardization, and procedural consistency",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "2. Change Magnitude (33% of PIF): Assesses the scale of process transformation required and organizational change readiness",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "3. Workflow Brittleness (34% of PIF): Evaluates exception handling requirements, edge case frequency, and process resilience",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Data Integrity & Knowledge Gap Handling",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "When TFA questions cannot be definitively answered during initial assessment, we employ conservative midpoint scoring (score of 3 on 1-5 scale) to avoid artificially inflating or deflating feasibility. All knowledge gaps are:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "• Documented in gapMetadata with gap identification date and reason",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Tracked in responseSources indicating which questions have definitive vs. estimated answers",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Flagged for follow-up investigation during solution design phase",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Considered in risk assessment when prioritizing opportunities",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Business Impact Scoring Methodology",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Base Impact Score (0-100): Calculated from ROI percentage using a 10x multiplier to create separation between opportunities. For example, 8% ROI = 80 base impact points.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Enhanced Impact Score (0-150): Applies additive bonuses to base impact:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "• Time Savings Bonus (0-25 points): Scaled by hours saved per week relative to company size",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Error Reduction Bonus (0-15 points): When error metrics are enabled and quantified",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Revenue Impact Bonus (0-10 points): When revenue uplift is measured and material",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "ROI Modeling Methodology",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Conservative Scenario Framework: All ROI calculations use conservative assumptions to ensure achievable projections:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "• Time savings assume 70% automation achievement (not 100%) to account for exception handling",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• FTE calculations use fully-loaded labor costs including benefits and overhead",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Implementation costs include licensing, development, training, and ongoing maintenance",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Payback periods account for gradual adoption curves rather than instantaneous realization",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Opportunity Matrix Methodology",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "X-Axis (Implementation Effort): Derived by inverting technical feasibility scores (100 - TFA composite score) so higher scores represent more effort.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Y-Axis (Business Impact): Enhanced impact score (0-150 scale) combining ROI percentage with time savings, error reduction, and revenue bonuses.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Quadrant Definitions:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "• Quick Wins: Impact ≥75, Effort <50 (high value, low complexity)",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Strategic Goals: Impact ≥75, Effort ≥50 (high value, high complexity)",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Nice-To-Haves: Impact <75, Effort <50 (moderate value, low complexity)",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Deprioritize: Impact <75, Effort ≥50 (moderate value, high complexity)",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Roadmap Development Methodology",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Our phased roadmap approach sequences opportunities based on:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "• Quadrant positioning (Quick Wins in Phase 1, Strategic Goals in Phase 3)",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Technical dependencies (foundational capabilities before dependent solutions)",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Value sequencing (early wins build momentum and fund later phases)",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Resource constraints (team capacity and budget availability)",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Change management capacity (organizational ability to absorb transformation)",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          new Paragraph({
            text: "Methodological Limitations",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Stakeholders should be aware of the following limitations:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "• Assessments rely on self-reported data from TFA and PIF respondents; accuracy depends on respondent knowledge",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• ROI projections are estimates; actual results will vary based on implementation approach and organizational factors",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Technical feasibility reflects current state; system changes can impact viability",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Diagnostic captures point-in-time snapshot; business conditions and priorities evolve",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Methodology cannot account for unforeseen technical challenges or organizational resistance",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== APPENDIX B: SWOT ANALYSIS =====
          new Paragraph({
            text: "Appendix B: All Opportunities Readiness SWOT Analysis",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "This appendix provides comprehensive SWOT analysis for each workflow with complete readiness assessment data.",
            spacing: { after: 360 },
          }),

          ...data.workflows
            .filter((w) => w.readiness !== null)
            .flatMap((w) => [
              new Paragraph({
                text: w.workflow.name,
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Readiness Score: ${w.readiness!.totalScore.toFixed(1)} | `,
                    bold: true,
                  }),
                  new TextRun({
                    text: `Feasibility Band: ${w.readiness!.feasibilityBand}`,
                    bold: true,
                    color: COLORS.PRIMARY_GREEN,
                  }),
                ],
                spacing: { after: 240 },
              }),

              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: "Strengths",
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        shading: {
                          fill: COLORS.PRIMARY_GREEN,
                          type: ShadingType.SOLID,
                          color: COLORS.PRIMARY_GREEN,
                        },
                        width: { size: 50, type: WidthType.PERCENTAGE },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: "Weaknesses",
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        shading: {
                          fill: COLORS.PRIMARY_GREEN,
                          type: ShadingType.SOLID,
                          color: COLORS.PRIMARY_GREEN,
                        },
                        width: { size: 50, type: WidthType.PERCENTAGE },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          ...(w.readiness!.componentScores.systemEnvironment >= 70
                            ? [
                                new Paragraph({
                                  text: `• Strong system environment (${w.readiness!.componentScores.systemEnvironment.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.dataQuality >= 70
                            ? [
                                new Paragraph({
                                  text: `• High data quality (${w.readiness!.componentScores.dataQuality.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.integrationFeasibility >= 70
                            ? [
                                new Paragraph({
                                  text: `• Good integration feasibility (${w.readiness!.componentScores.integrationFeasibility.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.processClarity >= 70
                            ? [
                                new Paragraph({
                                  text: `• Clear process documentation (${w.readiness!.componentScores.processClarity.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.changeMagnitude >= 70
                            ? [
                                new Paragraph({
                                  text: `• Manageable change scope (${w.readiness!.componentScores.changeMagnitude.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.workflowBrittleness >= 70
                            ? [
                                new Paragraph({
                                  text: `• Robust workflow design (${w.readiness!.componentScores.workflowBrittleness.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                        ],
                      }),
                      new TableCell({
                        children: [
                          ...(w.readiness!.componentScores.systemEnvironment < 50
                            ? [
                                new Paragraph({
                                  text: `• Limited system access (${w.readiness!.componentScores.systemEnvironment.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.dataQuality < 50
                            ? [
                                new Paragraph({
                                  text: `• Data quality concerns (${w.readiness!.componentScores.dataQuality.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.integrationFeasibility < 50
                            ? [
                                new Paragraph({
                                  text: `• Complex integration requirements (${w.readiness!.componentScores.integrationFeasibility.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.securityCompliance < 50
                            ? [
                                new Paragraph({
                                  text: `• Security/compliance challenges (${w.readiness!.componentScores.securityCompliance.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.processClarity < 50
                            ? [
                                new Paragraph({
                                  text: `• Unclear process definition (${w.readiness!.componentScores.processClarity.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          ...(w.readiness!.componentScores.workflowBrittleness < 50
                            ? [
                                new Paragraph({
                                  text: `• Brittle workflow with many exceptions (${w.readiness!.componentScores.workflowBrittleness.toFixed(1)})`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: "Opportunities",
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        shading: {
                          fill: COLORS.PRIMARY_GREEN,
                          type: ShadingType.SOLID,
                          color: COLORS.PRIMARY_GREEN,
                        },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: "Threats",
                            alignment: AlignmentType.CENTER,
                          }),
                        ],
                        shading: {
                          fill: COLORS.PRIMARY_GREEN,
                          type: ShadingType.SOLID,
                          color: COLORS.PRIMARY_GREEN,
                        },
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: `• ${w.opportunities.length} automation opportunities identified`,
                            bullet: { level: 0 },
                          }),
                          new Paragraph({
                            text: `• Total annual benefit: ${formatCurrency(w.opportunities.reduce((sum, o) => sum + o.roiMetrics.annualRoi, 0))}`,
                            bullet: { level: 0 },
                          }),
                          ...(w.readiness!.feasibilityBand === "Very High" || w.readiness!.feasibilityBand === "High"
                            ? [
                                new Paragraph({
                                  text: "• Strong foundation for rapid implementation",
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          new Paragraph({
                            text: "• Potential for quick wins and demonstrable ROI",
                            bullet: { level: 0 },
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          ...(w.readiness!.feasibilityBand === "Low" || w.readiness!.feasibilityBand === "Very Low"
                            ? [
                                new Paragraph({
                                  text: "• Low readiness may delay implementation",
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                          new Paragraph({
                            text: "• System changes could impact feasibility",
                            bullet: { level: 0 },
                          }),
                          new Paragraph({
                            text: "• Requires stakeholder buy-in and change management",
                            bullet: { level: 0 },
                          }),
                          ...(w.tfa?.gapMetadata && Object.keys(w.tfa.gapMetadata).length > 0
                            ? [
                                new Paragraph({
                                  text: `• Knowledge gaps exist (${Object.keys(w.tfa.gapMetadata).length} questions)`,
                                  bullet: { level: 0 },
                                }),
                              ]
                            : []),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              new Paragraph({
                text: "",
                spacing: { after: 360 },
              }),
            ]),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== APPENDIX C: READINESS SCORE WEIGHTING =====
          new Paragraph({
            text: "Appendix C: Readiness Score Metric Weighting",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "The composite readiness score combines technical and operational factors with the following weightings:",
            spacing: { after: 360 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: "Component",
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: {
                      fill: COLORS.PRIMARY_GREEN,
                      type: ShadingType.SOLID,
                      color: COLORS.PRIMARY_GREEN,
                    },
                    width: { size: 40, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: "Weight",
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: {
                      fill: COLORS.PRIMARY_GREEN,
                      type: ShadingType.SOLID,
                      color: COLORS.PRIMARY_GREEN,
                    },
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: "Source",
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: {
                      fill: COLORS.PRIMARY_GREEN,
                      type: ShadingType.SOLID,
                      color: COLORS.PRIMARY_GREEN,
                    },
                    width: { size: 15, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        text: "Rationale",
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    shading: {
                      fill: COLORS.PRIMARY_GREEN,
                      type: ShadingType.SOLID,
                      color: COLORS.PRIMARY_GREEN,
                    },
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("System Environment")],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "15%", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "TFA", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph("System accessibility directly impacts development velocity")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Data Quality")],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "18%", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "TFA", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph("Poor data quality is primary automation failure cause")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Integration Feasibility")],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "18%", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "TFA", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph("Complex integrations drive cost and timeline risk")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Security/Compliance")],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "9%", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "TFA", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph("Critical but affects subset of workflows")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Process Clarity")],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "15%", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "PIF", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph("Unclear processes require costly discovery and redesign")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Change Magnitude")],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "15%", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "PIF", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph("Large changes increase adoption risk and timeline")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Workflow Brittleness")],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "10%", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "PIF", alignment: AlignmentType.CENTER })],
                  }),
                  new TableCell({
                    children: [new Paragraph("Exception handling complexity affects maintainability")],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: "",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "Why These Weights Matter",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "The weighting model reflects lessons from hundreds of automation implementations:",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "• Technical factors (TFA) carry 60% weight because system constraints are hard blockers that cannot be overcome with process redesign",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Operational factors (PIF) carry 40% weight because process and change challenges can be mitigated through training and stakeholder engagement",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Data Quality and Integration Feasibility receive highest individual weights (18% each) as they are the most common automation failure points",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Security/Compliance receives lower weight (9%) as it primarily affects regulated industries and sensitive data workflows",
            bullet: { level: 0 },
          }),
          new Paragraph({
            text: "• Process Clarity and Change Magnitude (15% each) balance implementation complexity with organizational readiness",
            bullet: { level: 0 },
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== APPENDIX D: DETAILED ROI OVERVIEW =====
          new Paragraph({
            text: "Appendix D: Detailed ROI Overview",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "Comprehensive financial metrics for all identified automation opportunities:",
            spacing: { after: 360 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Workflow", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Opportunity", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Annual ROI", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "FTE Savings", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Payback (mo)", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Hrs/Week", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Error ↓", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Revenue ↑", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                ],
              }),
              ...data.workflows.flatMap((w) =>
                w.opportunities.map((opp) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph(w.workflow.name)],
                      }),
                      new TableCell({
                        children: [new Paragraph(opp.opportunity.name)],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: formatCurrency(opp.roiMetrics.annualRoi), alignment: AlignmentType.RIGHT })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: opp.roiMetrics.fteSavings.toFixed(2), alignment: AlignmentType.RIGHT })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: Math.round(opp.roiMetrics.paybackMonths).toString(), alignment: AlignmentType.RIGHT })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: opp.roiMetrics.hoursSavedPerWeek.toFixed(1), alignment: AlignmentType.RIGHT })],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: opp.roiMetrics.errorReductionPct !== null ? `${Math.round(opp.roiMetrics.errorReductionPct)}%` : "-",
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({
                            text: opp.roiMetrics.revenueUpliftAnnual !== null ? formatCurrency(opp.roiMetrics.revenueUpliftAnnual) : "-",
                            alignment: AlignmentType.RIGHT,
                          }),
                        ],
                      }),
                    ],
                  })
                )
              ),
            ],
          }),

          new Paragraph({
            text: "",
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== APPENDIX E: ROI CALCULATION METHODOLOGY =====
          new Paragraph({
            text: "Appendix E: ROI Calculation Methodology",
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph({
            text: "Detailed Formulas",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Annual Hours Saved:",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Hours Saved Per Week × 52 weeks × Automation Efficiency Factor (0.7)",
            spacing: { after: 180 },
          }),

          new Paragraph({
            text: "FTE Savings:",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Annual Hours Saved ÷ 2,080 hours (standard work year)",
            spacing: { after: 180 },
          }),

          new Paragraph({
            text: "Annual Labor Cost Savings:",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "FTE Savings × Fully-Loaded FTE Cost (salary + benefits + overhead)",
            spacing: { after: 180 },
          }),

          new Paragraph({
            text: "Annual ROI:",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "Labor Cost Savings + Error Reduction Benefits + Revenue Uplift - Implementation Cost - Annual Maintenance",
            spacing: { after: 180 },
          }),

          new Paragraph({
            text: "Payback Period (months):",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            text: "(Implementation Cost ÷ Monthly Benefit) accounting for gradual adoption curve",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "Conservative Scenario Framework Assumptions",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Our ROI calculations apply conservative assumptions to ensure realistic projections:",
            spacing: { after: 180 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "Assumption Category", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Conservative Value", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: "Rationale", alignment: AlignmentType.CENTER })],
                    shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Automation Efficiency")],
                  }),
                  new TableCell({
                    children: [new Paragraph("70% of process time")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Accounts for exception handling and edge cases")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Fully-Loaded FTE Cost")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Salary × 1.4 multiplier")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Includes benefits, taxes, overhead, workspace costs")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Implementation Timeline")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Industry benchmarks + 20%")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Buffer for organizational learning curve")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Adoption Curve")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Gradual ramp (not instant)")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Benefits accrue over 3-6 months post-deployment")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Annual Maintenance")],
                  }),
                  new TableCell({
                    children: [new Paragraph("15-20% of implementation")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Licensing, updates, minor enhancements, support")],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Error Reduction Impact")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Only when quantified")],
                  }),
                  new TableCell({
                    children: [new Paragraph("Requires measurable baseline error rates")],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({
            text: "",
            spacing: { after: 360 },
          }),

          new Paragraph({
            text: "FTE and Hours Normalization Methodology",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Standard Work Year: 2,080 hours (40 hours/week × 52 weeks)",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "FTE Calculation: Total annual hours saved divided by 2,080 provides fractional FTE equivalents. For example, 520 hours saved annually = 0.25 FTE.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Hours Per Week: Annualized hours divided by 52 weeks provides weekly impact metric for intuitive understanding.",
            spacing: { after: 120 },
          }),
          new Paragraph({
            text: "Partial FTE Treatment: Fractional FTE savings represent redeployable capacity for higher-value work, not necessarily headcount reduction.",
            spacing: { after: 240 },
          }),

          // ===== PAGE BREAK =====
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ===== APPENDIX F: DATA PROVENANCE & AUDIT TRAIL =====
          new Paragraph({
            text: "Appendix F: Data Provenance & Audit Trail",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            text: "This appendix documents the source and quality of assessment data for each workflow, enabling stakeholders to trace findings back to original inputs and identify knowledge gaps requiring follow-up.",
            spacing: { after: 360 },
          }),

          ...data.workflows.flatMap((w) => [
            new Paragraph({
              text: w.workflow.name,
              heading: HeadingLevel.HEADING_2,
            }),

            new Paragraph({
              text: "Technical Feasibility Assessment (TFA)",
              heading: HeadingLevel.HEADING_3,
            }),
            ...(w.tfa
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Initial Respondent: ",
                        bold: true,
                      }),
                      new TextRun({
                        text: w.tfa.initialRespondent,
                      }),
                    ],
                    spacing: { after: 120 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Completion Date: ",
                        bold: true,
                      }),
                      new TextRun({
                        text: formatDate(w.tfa.completedAt),
                      }),
                    ],
                    spacing: { after: 120 },
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "Overall TFA Score: ",
                        bold: true,
                      }),
                      new TextRun({
                        text: `${w.tfa.score.toFixed(1)}/100`,
                        color: COLORS.PRIMARY_GREEN,
                      }),
                    ],
                    spacing: { after: 240 },
                  }),
                ]
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "No TFA assessment completed",
                        italics: true,
                      }),
                    ],
                    spacing: { after: 240 },
                  }),
                ]),

            ...(w.tfa && w.tfa.gapMetadata && Object.keys(w.tfa.gapMetadata).length > 0
              ? [
                  new Paragraph({
                    text: "Knowledge Gaps Identified:",
                    heading: HeadingLevel.HEADING_3,
                  }),
                  ...Object.entries(w.tfa.gapMetadata).map(([questionId, metadata]: [string, any]) =>
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `• Question ${questionId}: `,
                          bold: true,
                        }),
                        new TextRun({
                          text: `${metadata.reason || "Unknown reason"} (defaulted to midpoint score)`,
                        }),
                      ],
                      bullet: { level: 0 },
                    })
                  ),
                  new Paragraph({
                    text: "",
                    spacing: { after: 240 },
                  }),
                ]
              : []),

            new Paragraph({
              text: "Process Impact Forms (PIF)",
              heading: HeadingLevel.HEADING_3,
            }),
            ...(w.pifs.length > 0
              ? [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `Total Respondents: ${w.pifs.length}`,
                        bold: true,
                      }),
                    ],
                    spacing: { after: 180 },
                  }),
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [new Paragraph({ text: "Respondent", alignment: AlignmentType.CENTER })],
                            shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                          }),
                          new TableCell({
                            children: [new Paragraph({ text: "Role", alignment: AlignmentType.CENTER })],
                            shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                          }),
                          new TableCell({
                            children: [new Paragraph({ text: "Completion Date", alignment: AlignmentType.CENTER })],
                            shading: { fill: COLORS.PRIMARY_GREEN, type: ShadingType.SOLID, color: COLORS.PRIMARY_GREEN },
                          }),
                        ],
                      }),
                      ...w.pifs.map(
                        (pif) =>
                          new TableRow({
                            children: [
                              new TableCell({
                                children: [new Paragraph(pif.respondentName)],
                              }),
                              new TableCell({
                                children: [new Paragraph(pif.respondentRole)],
                              }),
                              new TableCell({
                                children: [new Paragraph(formatDate(pif.completedAt))],
                              }),
                            ],
                          })
                      ),
                    ],
                  }),
                ]
              : [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: "No PIF responses collected",
                        italics: true,
                      }),
                    ],
                  }),
                ]),

            new Paragraph({
              text: "",
              spacing: { after: 360 },
            }),
          ]),
        ],
      },
    ],
  });

  // Generate and return buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
