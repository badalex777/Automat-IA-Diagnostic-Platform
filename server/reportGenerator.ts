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
        ],
      },
    ],
  });

  // Generate and return buffer
  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
