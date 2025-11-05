// Executive Diagnostic Report - Verbatim Section Prompts
// These templates contain the exact text from the provided PDF prompts
// Variables in {{double_braces}} get populated from database
// Variables in [square_brackets] are left for manual analyst commentary

/**
 * Variable replacement utility
 * Replaces {{variables}} with actual data values
 * Converts commentary placeholders to [bracketed] format for manual fill-in
 */
export function replaceVariables(
  template: string,
  data: Record<string, any>,
  commentaryKeys: string[] = []
): string {
  let result = template;

  // First, convert commentary placeholders from {{key}} to [key]
  commentaryKeys.forEach(key => {
    const commentaryPattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(commentaryPattern, `[${key}]`);
  });

  // Then replace data variables
  Object.entries(data).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    
    // Format value based on type
    let formattedValue = value;
    if (typeof value === 'number') {
      // Format currency if it looks like a money value
      if (key.includes('benefit') || key.includes('cost') || key.includes('revenue')) {
        formattedValue = value.toLocaleString('en-US', { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 0 
        });
      } else if (key.includes('percent') || key.includes('roi')) {
        formattedValue = value.toFixed(1);
      } else if (key.includes('payback') || key.includes('months')) {
        formattedValue = Math.round(value).toString();
      } else {
        formattedValue = value.toLocaleString('en-US', { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 2 
        });
      }
    }
    
    result = result.replace(pattern, String(formattedValue));
  });

  return result;
}

/**
 * Format date as "MMM YYYY"
 */
export function formatDiagnosticDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

/**
 * COMPREHENSIVE VARIABLE MAPPING
 * ================================
 * This maps template {{variables}} to their database sources and calculations
 * 
 * COMPANY CONTEXT:
 * - {{company_name}} → company.name
 * - {{annual_revenue}} → company.annualRevenue (optional, for normalization)
 * - {{total_employees}} → company.totalEmployees (optional, for normalization)
 * 
 * PORTFOLIO-LEVEL METRICS (calculated across all workflows/opportunities):
 * - {{total_workflows}} → count of workflows
 * - {{workflow_count}} → same as total_workflows
 * - {{total_opportunities}} → count of opportunities
 * - {{opportunity_count}} → same as total_opportunities
 * - {{annual_benefit}} → sum of all opportunity.annualBenefit
 * - {{avg_payback}} → average of all opportunity.paybackPeriodMonths
 * - {{payback_period}} → same as avg_payback
 * - {{roi_percent}} → average ROI across opportunities
 * - {{fte_savings}} → sum of all opportunity.fteSavings
 * - {{functions_list}} → comma-separated list of unique workflow departments/functions
 * 
 * TOP 3 OPPORTUNITIES (sorted by business impact):
 * - Top 3 opportunities with: name, annual benefit, ROI, payback, FTE, description
 * 
 * MATRIX QUADRANT COUNTS:
 * - {{quickwin_count}} → count of opportunities in Quick Wins quadrant
 * - Quick Wins, Strategic, Nice-to-Have, Deprioritize counts and lists
 * 
 * PER-OPPORTUNITY DETAILS (for tables and Appendix D):
 * - {{workflow_name}} → workflow.name
 * - {{opportunity_name}} → opportunity.name
 * - {{annual_benefit}} → opportunity.annualBenefit
 * - {{payback_months}} → opportunity.paybackPeriodMonths
 * - {{fte_saved}} → opportunity.fteSavings
 * - {{implementation_cost}} → opportunity.implementationCost
 * - {{net_benefit_3yr}} → opportunity.netBenefit3Year (optional)
 * - {{net_benefit_5yr}} → opportunity.netBenefit5Year (optional)
 * - {{annual_hours_saved}} → opportunity.fteSavings * 2080
 * - {{weekly_hours_saved}} → annual_hours_saved / 52
 * - {{dominant_component}} → calculated from impact breakdown
 * 
 * READINESS SCORES (per workflow):
 * - {{tfa_score}} → TFA score 0-100
 * - {{pif_score}} → Aggregated PIF score 0-100
 * - {{readiness_score}} → Combined readiness (TFA 60% + PIF 40%)
 * - {{readiness_band}} → Very High/High/Moderate/Low/Very Low
 * 
 * DATE FORMATTING:
 * - {{diagnostic_date}} → Format as "MMM YYYY" (e.g., "Oct 2025")
 * 
 * COMMENTARY PLACEHOLDERS (converted from {{}} to []):
 * - [commentary] → Manual analyst insights
 * - [readiness_commentary] → Readiness analysis
 * - [roi_commentary] → ROI interpretation
 * - [matrix_distribution_commentary] → Matrix analysis
 * - [executive_analysis_commentary] → Executive interpretation
 * - [quickwin_commentary] → Quick wins analysis
 * - [foundational_commentary] → Foundational phase analysis
 * - [strategic_commentary] → Strategic phase analysis
 * - [roadmap_summary_commentary] → Roadmap summary
 */

export const EXECUTIVE_SUMMARY = `
Automat-IA conducted a data-driven diagnostic to evaluate {{company_name}}'s readiness for
AI-driven back-office automation and to quantify the financial return of potential
implementations.
The objective of this diagnostic was to help {{company_name}} identify, prioritize, and
roadmap automation opportunities aligned with its business objectives and operational realities.

The engagement analyzed {{total_workflows}} workflows, identifying {{total_opportunities}}
valid automation opportunities with an estimated total annual benefit of {{annual_benefit}},
an average payback of {{payback_period}} months, and an average ROI of {{roi_percent}}%.

Each workflow was assessed using Automat-IA's dual-diagnostic methodology — combining the
Technical Feasibility Assessment (TFA) and Process Insights Form (PIF) — to establish an
integrated readiness score capturing both technical and operational viability.

This analysis revealed meaningful variation across workflows:

[Insert 1–2 sentences highlighting Quick Wins (high-feasibility, short-payback
opportunities)]

[Insert 1–2 sentences describing foundational gaps (e.g., data quality, system
integration, documentation)]

All findings were consolidated into a quantitative ROI model, a two-layer Opportunity Matrix
(Business Impact vs. Implementation Effort), and an 18-month Automation Roadmap outlining
short-, mid-, and long-term implementation priorities.

By following the roadmap outlined in this report, {{company_name}} can establish a scalable
automation foundation, accelerate efficiency gains, and create measurable operational and
financial advantages within the next fiscal cycle.

[Strategic Interpretation: Summarize automation readiness posture, highlight the highest-impact
opportunities, and explain what these findings imply for the company's AI adoption journey and
prioritization strategy.]
`;

export const CONFIDENTIALITY_DISCLAIMER = `
This document has been prepared exclusively for {{company_name}} by Automat-IA as part of the AI
Automation Diagnostic and Readiness Assessment. All analyses, financial models, and workflow
evaluations contained herein are confidential and intended solely for the internal use of the client's
executive and technical teams. No portion of this report may be reproduced, distributed, or disclosed to
third parties without prior written consent from Automat-IA.

All findings, metrics, and recommendations are based on information provided by the client through
interviews, surveys, Technical Feasibility Assessments (TFAs), Process Insights Forms (PIFs), and
related documentation. Automat-IA assumes that this information is accurate and complete to the best of
the client's knowledge at the time of submission. Any omissions or inaccuracies may affect the validity of
the conclusions presented.

This report represents a diagnostic-stage evaluation prepared for strategic and planning purposes. It does
not constitute a guarantee of specific results or a commitment to implement any proposed solutions. All
implementation activities require separate scoping and contractual agreement.

When data is incomplete or uncertain, Automat-IA applies controlled assumption parameters to preserve
analytical continuity without distorting results. These assumption controls follow a standardized hierarchy
that includes the application of midpoint scoring to unresolved TFA responses and conservative weighting
or exclusion of unverified operational data such as error rates or revenue uplift.

All quantitative results, including readiness scores, ROI projections, payback periods, and benefit
estimates, are modeled using Automat-IA's Conservative Scenario Framework. This framework applies
risk-adjusted assumptions that reflect realistic adoption, integration, and execution conditions. Actual
implementation outcomes may vary depending on factors such as final project scope and technical
architecture, vendor selection, change-management effectiveness, user adoption, data integrity, process
compliance, and system performance.

The analyses and estimates contained in this document are intended to guide prioritization, budgeting,
and strategic decision-making in the context of AI automation readiness. Automat-IA recommends that
clients validate all assumptions during the implementation phase and track realized benefits against the
projections presented herein.
`;

export const METHODOLOGY_OVERVIEW = `
Our diagnostic approach integrates technical feasibility analysis with business impact
evaluation to produce a complete, data-driven view of automation potential. The methodology
unfolds through ten key phases, ensuring analytical depth, stakeholder validation, and
traceability of insights.

Phase 1: Stakeholder Discovery and Context Definition

Structured interviews with process owners, subject matter experts, and departmental leads
establish a baseline understanding of current workflows, pain points, and automation objectives.
This ensures that the diagnostic scope and business priorities are aligned.

Phase 2: Technical Feasibility Assessment (TFA)

The TFA is conducted at the workflow level and shared across all steps within that workflow.
Each workflow is evaluated across four weighted dimensions: System Environment, Data
Quality, Integration Feasibility, and Security and Compliance, using Automat-IA's
21-question rubric. Responses generate a Technical Readiness Rating (0 to 100), with
knowledge gaps recorded for clarification to maintain data integrity. This workflow-level
assessment provides a foundation for understanding the technical environment that affects all
steps within the process.

Phase 3: Process Insights Form (PIF)

PIFs are collected at the step level—each individual process step within a workflow receives its
own PIF assessment. Operational participants complete the PIF to provide quantitative data
such as frequency, duration, and participant count, as well as qualitative observations including
exceptions, manual steps, and dependencies. This step-level granularity captures the operational
realities at each specific point in the workflow, enabling precise identification of automation
opportunities and readiness assessment for individual process steps rather than relying on
aggregated workflow averages.

Phase 4: End-User Validation and Workflow Mapping

Validation sessions with end users confirm PIF inputs and map each workflow in detail,
identifying inefficiencies, bottlenecks, rework loops, and error-prone activities. This ensures that
technical assumptions align with real execution conditions.

Phase 5: Opportunity Identification

By combining workflow-level TFA data with step-level PIF data, potential automation
opportunities are identified and categorized according to feasibility, process complexity, and
expected business value. Each opportunity is linked to its specific originating workflow step for
auditability and precise impact attribution.

Phase 6: ROI Modeling and Quantification

Each validated opportunity is modeled using Automat-IA's ROI Calculator Framework to
estimate financial impact, including time savings, error reduction, and potential revenue uplift.
Results include annualized benefit, ROI percentage, and payback period, calculated through
the Conservative Scenario Framework to ensure realism and analytical discipline.

Phase 7: Opportunity Matrix Prioritization

7.1 General Overview

The Opportunity Matrix is a decision-support model used to prioritize automation initiatives
based on both business and technical perspectives. It visualizes every opportunity in a unified
framework that compares expected value creation against implementation feasibility, enabling
data-driven prioritization rather than subjective ranking.

7.2 Matrix Axes

The matrix plots two core dimensions:

Vertical Axis: Business Impact combines ROI percentage, annual benefit, and
strategic contribution to organizational goals.

Horizontal Axis: Implementation Effort reflects the technical difficulty, integration
complexity, and step-level readiness scores derived from the combination of
workflow-level TFA and step-specific PIF assessments.

This two-axis approach highlights which opportunities deliver the highest return for the lowest
relative effort.

7.3 Matrix Quadrants

The matrix is divided into four quadrants that guide prioritization:

Quick Wins: High impact and low effort; immediate candidates for early implementation.

Strategic bets: High impact and high effort; long-term projects with significant value
potential.

Nice-to-have: Moderate or low impact and low effort; useful for optimization or
proof-of-concept.

Deprioritize: Low impact and high effort; low priority until foundational changes improve
feasibility.

This quadrant model ensures that automation decisions balance short-term value with long-term
scalability.

7.4 Standard vs. Enhanced Opportunity Matrix

Automat-IA applies a Two-Matrix Framework:

1. The Base Impact Opportunity Matrix calculates Business Impact based on Annual ROI percentage and FTE savings, providing initial prioritization that supports executive visibility and quick sequencing of opportunities.

2. The Enhanced Opportunity Matrix applies an additive bonus model to the Business Impact axis only, expanding the scale from 0-100 to 0-150 for opportunities that demonstrate additional value through error reduction or revenue uplift. This refined matrix adjusts opportunity rankings to reflect strategic interdependencies, ensuring a balanced portfolio of short-term gains and sustainable long-term automation value.

Phase 8: Validation Session and Stakeholder Alignment

After the Opportunity Matrix is generated, a validation session is conducted with key
stakeholders to confirm prioritization, address hidden risks, and align automation opportunities
with organizational strategy and culture. This collaborative review ensures that the roadmap
reflects both analytical rigor and practical business considerations. Stakeholders provide input
on implementation feasibility, resource availability, and strategic fit, allowing the team to adjust
rankings and sequencing as needed. The validated Opportunity Matrix then feeds directly into
the final automation roadmap and becomes the foundation for the Executive Diagnostic Report.

Phase 9: Automation Roadmap Development

Opportunities selected from the validated matrices are sequenced into a three-phase roadmap
that converts diagnostic insights into actionable implementation steps:

Phase 1: Quick Wins (0 to 6 months) focus on low-complexity automations that deliver
early ROI and demonstrate measurable results.

Phase 2: Foundational (6 to 12 months) builds the integration, data, and governance
structures required for scalable automation.

Phase 3: Strategic (12 to 18+ months) delivers high-value, cross-departmental
transformations that leverage the foundation built earlier.

The roadmap acts as a structured execution plan, ensuring a logical transition from immediate
efficiency gains to organization-wide AI enablement.

Phase 10: Final Deliverables

The diagnostic process concludes with the delivery of two comprehensive outputs:

1. Executive Diagnostic Report (EDR): This document consolidates all findings, readiness
assessments, SWOT analyses, ROI projections, opportunity matrices, and the 18-month automation
roadmap. The EDR includes an Executive Summary, detailed methodology (Phases 1-10), diagnostic
overview, findings and analysis, and six comprehensive appendices (A: Detailed Methodology,
B: Readiness Score Metric Weighting, C: Step-Level SWOT Analysis, D: ROI Detailed Overview,
E: ROI Calculation Methodology, F: Data Provenance and Audit Trail). Designed for executive
and technical stakeholders to guide strategic decision-making and implementation planning.

2. Executive Presentation: A summarized presentation highlighting key findings, validated
opportunities, and the recommended roadmap, tailored for board-level and senior leadership
communication.

These deliverables provide both the depth required for implementation planning and the clarity
needed for executive buy-in and resource allocation.
`;

// Continue with remaining prompts...
export const DIAGNOSTIC_OVERVIEW_PART1 = `
4.1 Scope of Evaluation

Automat-IA conducted a comprehensive diagnostic of {{company_name}} to assess
automation readiness and quantify the financial impact of AI-driven process improvements. The
analysis covered {{workflow_count}} workflows across key back-office functions including
{{functions_list}}.

Each workflow was evaluated across three dimensions:

• Technical Feasibility – The ability of current systems, data structures, and integration pathways to support automation securely and reliably.

• Organizational Readiness – The degree of process standardization, data consistency, and change adaptability within the organization.

• Business Impact – Quantified ROI, payback period, and annual benefit potential derived from modeled automation opportunities. Business Impact is calculated using two approaches: the Base Impact Matrix (ROI + FTE savings) and the Enhanced Impact Matrix (Base Impact + additive bonuses for error reduction and revenue uplift when applicable).

All automation opportunities were positioned within Automat-IA's Opportunity Matrix, aligning
technical readiness with financial value. The objective was to identify and prioritize automations
that are both technically feasible and financially justified.

4.2 Key Diagnostic Findings

• Total Workflows Analyzed: {{workflow_count}}
• Validated Automation Opportunities: {{opportunity_count}}
• Total Annual Benefit Potential: {{annual_benefit}}
• Average Payback Period: {{avg_payback}} months
• FTE Saved: {{fte_savings}}

Readiness scores varied across workflows, reflecting differences in data quality, process
structure, and integration maturity.
High-readiness workflows indicate immediate automation potential, while lower-readiness ones
highlight foundational gaps in documentation, API connectivity, or process ownership.

[Commentary: Summarize overall readiness trends, such as "Finance and HR exhibit mature
technical readiness, while Procurement and Operations require data and process
standardization."]
`;

export const DIAGNOSTIC_OVERVIEW_PART2 = `
[Commentary: Explain why these top opportunities rank highest, their expected impact on
operations, and any interdependencies.]
`;

export const DIAGNOSTIC_OVERVIEW_PART3 = `
4.5 Immediate Implementation Potential (Quick Wins)

{{quickwin_count}} opportunities demonstrated high readiness and low implementation effort,
classifying them as Quick Wins. These opportunities span the following workflows and steps:

{{quickwin_list}}

These can be executed in the short term to generate early ROI and internal momentum. Quick
Wins are characterized by high step-level readiness scores (strong technical feasibility combined
with clear operational data), minimal system integration requirements, and well-documented
processes with engaged stakeholders.

[Analyst Commentary: Describe each Quick Win opportunity, what it automates, and expected impact]

4.6 Strategic Bets for Long-Term Value

A subset of high-impact opportunities offers significant potential but requires higher
implementation effort due to technical debt, legacy system dependencies, or cross-departmental
coordination requirements. These Strategic Bets include:

{{strategic_bets_list}}

These opportunities should be prioritized for later roadmap phases (Phase 2: Foundational or
Phase 3: Strategic) once foundational enablers are strengthened, technical readiness improves,
and early Quick Wins have built organizational capability and momentum.

[Analyst Commentary: Describe each Strategic Bet opportunity, what it automates, and long-term value proposition]

4.7 Foundational Gaps Hindering Scale

Step-level readiness analysis revealed recurring weaknesses that limit scalability across multiple
workflows. Common foundational gaps include:

{{foundational_gaps_list}}

Recommended remediation actions include system integration upgrades, data governance
improvements, process documentation initiatives, and establishing clear process ownership.
Addressing these foundational gaps will improve readiness scores for medium-effort opportunities
and enable successful scaling of automation initiatives.

[Analyst Commentary: Explain each foundational gap category, affected workflows, and recommended remediation timeline]

4.8 Organizational and Cultural Readiness

Stakeholder interviews and step-level PIF responses revealed differing levels of automation
awareness and change adaptability across departments. Cultural readiness factors include:

{{cultural_readiness_summary}}

Recommendations for organizational readiness include targeted change management programs,
cross-departmental communication initiatives, automation literacy training, and establishing
internal champions to build confidence and capability. Strong cultural readiness accelerates
implementation timelines and improves adoption rates for all automation initiatives.

4.9 Recommended Focus

● Prioritize Quick Wins in Phase 1 to demonstrate ROI and build internal confidence.

● Address foundational readiness gaps before initiating high-effort initiatives.

● Reassess opportunity scores after each implementation cycle to update the Opportunity
Matrix dynamically.

● Use early successes to strengthen advocacy and technical competence for subsequent
phases.
`;

export const FINDINGS_ANALYSIS_PART1 = `
5.1 Readiness Summary

The table below consolidates the readiness assessment results for all workflows analyzed
during the diagnostic phase. Each workflow was evaluated through the combined outputs of 
the Technical Feasibility Assessment (TFA) and the Process Insights Form (PIF).

The aggregated readiness score provides an objective measure of implementation readiness,
forming the analytical foundation for prioritization within the Opportunity Matrix and the
Automation Roadmap.
`;

export const FINDINGS_ANALYSIS_PART2 = `
[readiness_commentary]

For detailed, per-workflow qualitative insights including identified strengths, weaknesses, and
dependencies, refer to Appendix B: Readiness SWOT Analysis.
`;

export const FINDINGS_ANALYSIS_PART3 = `
5.2 ROI Insights

This section summarizes the quantitative results of the ROI modeling conducted for the
validated automation opportunities. All financial results are derived using Automat-IA's ROI
Calculator Framework, which applies conservative, evidence-based assumptions to estimate
operational benefits.

Each opportunity's annual benefit represents the combined effect of time savings, error
reduction, and potential revenue uplift, modeled under the Conservative Scenario
Framework to ensure realistic projections.

The Annual Run Rate ROI% represents the steady-state return on investment once each
implementation is fully operational, reflecting the annual return achieved after the initial
ramp-up period. This metric provides a normalized view of long-term value creation across
all opportunities.
`;

export const FINDINGS_ANALYSIS_PART4 = `
[roi_commentary]

All results are modeled under the Conservative Scenario Framework.
For detailed financial breakdowns, refer to Appendix D: ROI Model and Benefit Components.
`;

export const FINDINGS_ANALYSIS_PART5 = `
5.3 Opportunity Matrix Analysis

The Opportunity Matrix visualizes the positioning of all automation opportunities within a single
model that balances Business Impact and Implementation Effort. This provides an
evidence-based view of where automation can create the highest return relative to complexity
and readiness.
`;

export const FINDINGS_ANALYSIS_PART6 = `
[matrix_distribution_commentary]

Matrix Visualizations

Base Opportunity Matrix (Operational Impact View)
[base_matrix_image]

Enhanced Opportunity Matrix (Strategic Impact View)
[enhanced_matrix_image]

The Base Matrix illustrates the relative efficiency and feasibility of each opportunity, while the
Enhanced Matrix incorporates strategic and cross-functional impact. Together, they present a
balanced view of short-term gains and long-term automation potential.

5.4 Executive Interpretation

[executive_analysis_commentary]
`;

export const AUTOMATION_ROADMAP_INTRO = `
The Automation Roadmap translates the diagnostic findings into a structured sequence of
initiatives guiding {{company_name}} from analysis to execution. It consolidates insights from
the Readiness Rubric, ROI Analysis, and Opportunity Matrix into a practical, phased
implementation plan.

The roadmap is designed to:

● Deliver measurable value early through Quick Wins that validate the automation
strategy.

● Strengthen the data, process, and integration foundations required for scale.

● Build organizational capability to support increasingly complex automations over time.

This phased approach ensures momentum, minimizes disruption, and aligns implementation
pacing with organizational readiness.
`;

export const AUTOMATION_ROADMAP_PHASE1 = `
6.1 Phase 1 – Quick Wins (Short-Term, 0 to 6 months)

Objective: Achieve immediate operational improvements with minimal complexity and risk.

Quick Wins typically involve repetitive, rules-based workflows with clean data and existing
system connectivity. Their implementation demonstrates the value of automation while
establishing internal confidence and governance foundations.
`;

export const AUTOMATION_ROADMAP_PHASE1_OUTCOMES = `
Expected Outcomes:

● Rapid ROI realization and visible efficiency gains.

● Reduction of manual workload and improved accuracy in high-volume processes.

● Early establishment of automation governance and monitoring mechanisms.

[quickwin_commentary]
`;

export const AUTOMATION_ROADMAP_PHASE2 = `
6.2 Phase 2 – Foundational Enhancements (Mid-Term, 6 to 12 months)

Objective: Strengthen the technological and procedural foundations required for scalable
automation.

This phase focuses on workflows that have strong ROI potential but require improvement in
data quality, system integration, or process clarity before deployment. It builds the operational
backbone that enables sustainable expansion of automation capability.
`;

export const AUTOMATION_ROADMAP_PHASE2_OUTCOMES = `
Focus Areas:

● Remediation of technical and data limitations identified during the TFA.

● Standardization and documentation of core workflows to reduce variability.

● Enhancement of integration pathways and data accessibility.

● Pilot implementation of mid-complexity automations to validate readiness improvements.

● Strengthening of internal automation governance and knowledge-sharing processes.

Expected Outcomes:

● Improved data reliability, system interoperability, and process transparency.

● Higher readiness levels across multiple workflows.

● Reduced operational friction and improved cross-departmental coordination.

[foundational_commentary]
`;

export const AUTOMATION_ROADMAP_PHASE3 = `
6.3 Phase 3 – Strategic Implementations (Long-Term, 12 to 18+ months)

Objective: Deploy high-impact, complex automations that drive transformative efficiency and
long-term business value.

These initiatives, drawn from the High Impact / High Effort quadrant of the Opportunity Matrix,
require stronger infrastructure and cross-departmental collaboration. By this stage, Quick Wins
and Foundational phases will have validated the governance model, making these large-scale
transformations viable.
`;

export const AUTOMATION_ROADMAP_PHASE3_OUTCOMES = `
Focus Areas:

● Deployment of multi-system or AI-driven automations across departments.

● Integration of advanced technologies such as natural language processing, predictive
analytics, and intelligent workflow orchestration.

● Optimization of APIs, data pipelines, and monitoring dashboards to sustain performance.

● Scaling of automation coverage to ensure end-to-end process continuity.

Expected Outcomes:

● Measurable improvements in process speed, accuracy, and throughput.

● Significant reduction in manual intervention for critical workflows.

● Institutional adoption of automation as a core strategic capability.

● Strengthened data integrity and system traceability across operations.

[strategic_commentary]
`;

export const AUTOMATION_ROADMAP_SUMMARY = `
6.5 Narrative Summary

This roadmap enables {{company_name}} to advance automation maturity in structured,
measurable stages. Quick Wins create momentum and early financial returns, Foundational
Enhancements strengthen the organization's digital infrastructure, and Strategic
Implementations unlock transformative value and cross-functional scalability.

Each phase is directly informed by the diagnostic evidence collected through Automat-IA's
framework. This ensures that priorities are grounded in verified readiness, ROI, and effort data
rather than subjective judgment. As execution progresses, the roadmap should be continuously
updated to reflect new opportunities, refined readiness scores, and evolving business priorities.

[roadmap_summary_commentary]
`;

export const APPENDIX_A = `
A.1 Data Sources and Collection

The diagnostic integrates quantitative and qualitative inputs from multiple organizational layers
to ensure analytical depth, data integrity, and traceability. Each stream captures a distinct
dimension of the analyzed workflows.

Technical Feasibility Assessments (TFA). Completed by IT and system owners to document
system environment, data quality, integration feasibility, and security posture. TFAs establish the
technical conditions that determine whether automation is feasible within each workflow.

Process Insights Forms (PIF). Completed by process owners and end users to capture
operational realities. PIFs measure process clarity, change magnitude, and workflow brittleness,
and collect metrics such as process volume, frequency, average duration, and observed error
rates. PIF inputs feed readiness scoring and ROI modeling.

Stakeholder Interviews. Sessions with department leads and subject-matter experts validate
automation candidates, contextualize TFA and PIF responses, and provide data not found in
system documentation, including salary ranges, role counts per workflow, and high-level
process maps.

End-User Interviews. Discussions with those performing the work verify PIF inputs, enable
detailed workflow mapping, surface edge cases, and isolate high-friction or error-prone stages.

Documentation Review. Review of workflow diagrams, SOPs, and system documentation to
cross-check form data and confirm process conditions. Where available, policy documents,
screen captures, or task logs are incorporated as supporting evidence.

For a complete record of data inputs, see Appendix F: Data Provenance and Audit Trail. It
lists, per workflow, the data type, source, respondent name and role, department, collection
method, and date.

A.2 Diagnostic Frameworks

Automat-IA applies a structured, multi-layered framework that translates technical and
operational inputs into measurable readiness and financial performance indicators.

Technical Feasibility Assessment (TFA).
21 weighted questions scored 1 to 5, with a "Don't know" option to flag gaps. Section weights:
System Environment 25 percent, Data Quality 30 percent, Integration Feasibility 30 percent,
Security and Compliance 15 percent. TFA outputs a 0 to 100 technical readiness score.

Process Insights Form (PIF).
40 questions capturing operational readiness across process clarity, change magnitude, and
workflow brittleness, plus quantitative metrics for volumes, times, participants, and quality. When
multiple respondents exist, responses are aggregated with variance tracking.

Readiness Rubric.
Combined readiness score per workflow or opportunity using TFA 60 percent and PIF 40
percent, normalized 0 to 100. This score is a primary input (50 percent weight) into the
Implementation Effort calculation detailed in Section A.5.

Automat-IA ROI Calculator.
Quantifies financial impact using PIF operational data and cost assumptions from the
diagnostic. The calculator applies a double-layer conservatism model, producing annual benefit,
payback period, and related business metrics. All calculations are version-controlled and
auditable.

Opportunity Matrix.
Final analytical layer that unifies readiness and ROI into a single prioritization framework.

● X axis: Business Impact, a normalized score derived from efficiency and value.

● Y axis: Implementation Effort, a weighted composite score combining readiness, ramp-up
period, payback period, and training hours. See Section A.5 for detailed methodology.

A.3 Data Integrity and Knowledge Gap Handling

Gap capture in TFAs. Every question supports a "Don't know" response that records reasons
and potential sources. Automat-IA then: 1) extracts the gaps, 2) assigns follow-ups, 3) updates
responses once verified, and 4) records the contributor.

Midpoint response rule. If no stakeholder can provide a verified answer, a neutral midpoint
score of 3 on the 1 to 5 scale is applied to preserve dataset completeness. Each midpoint
substitution is explicitly logged for auditability.

A.4 Business Impact Scoring Methodology

Business Impact expresses expected value relative to company scale for fair comparison across
clients.

Base Impact components and normalization.

● ROI Score: (Annual run-rate ROI ÷ Company annual revenue) × 1000, capped at 100.

● Hours Score: (FTE savings ÷ Total employees) × 1000, capped at 100.

● Base Impact (0 to 100) equals ROI Score 60 percent plus Hours Score 40 percent.

Normalization by revenue and FTEs prevents bias toward larger firms and captures the relative
significance of benefits.

A.5 Implementation Effort Scoring Methodology

Implementation Effort represents the vertical axis of the Opportunity Matrix and measures the
complexity and resource requirements for bringing an automation opportunity to production. Lower
scores indicate easier implementation.

Formula and weights.

Implementation Effort is calculated as a weighted composite of four factors:

● Readiness Score (inverted): 50 percent. Derived from the combined TFA (60 percent) and
PIF (40 percent) assessment. Higher readiness results in lower effort. This is the primary
driver because it reflects comprehensive client assessment data across 61 combined questions.

● Ramp-up Period: 20 percent. Estimated months from kickoff to steady-state operation.
Normalized on a scale where 2 months or less equals 0 (lowest effort) and 12+ months
equals 100 (highest effort).

● Payback Period: 20 percent. Estimated months to recover implementation costs. Normalized
where 3 months or less equals 0 (lowest effort) and 18+ months equals 100 (highest effort).

● Training Hours per Employee: 10 percent. Estimated end-user training required. Normalized
where 1 hour or less equals 0 (lowest effort) and 20+ hours equals 100 (highest effort).

Rationale for 50 percent readiness weighting. The Readiness Rubric synthesizes actual client
data from both technical (TFA) and operational (PIF) assessments, while ramp-up, payback, and
training represent analyst-generated estimates subject to refinement during scoping. Weighting
readiness at 50 percent ensures that ground-truth client data anchors the effort calculation,
while still allowing differentiation between opportunities within the same workflow based on
their specific implementation characteristics.

Example calculation.

Opportunity with 38 percent readiness, 12-month ramp-up, 18-month payback, 15 hours training:

● Readiness effort (inverted): 100 − 38 = 62 → 62 × 0.50 = 31.0

● Ramp-up effort: ((12 − 2) ÷ (12 − 2)) × 100 = 100 → 100 × 0.20 = 20.0

● Payback effort: ((18 − 3) ÷ (18 − 3)) × 100 = 100 → 100 × 0.20 = 20.0

● Training effort: ((15 − 1) ÷ (20 − 1)) × 100 = 73.7 → 73.7 × 0.10 = 7.4

Total Implementation Effort = 31.0 + 20.0 + 20.0 + 7.4 = 78.4

This score positions the opportunity in the upper region of the matrix, indicating high
implementation complexity.

A.6 ROI Modeling Methodology

Double-layer conservatism.

Layer 1: Rubric-based base estimation.
Structured rubrics convert PIF inputs into base percentages for time savings, quality
improvement, and revenue reallocation, considering process type, complexity, repetition, and
data structure.

Layer 2: Scenario multipliers.
Risk-adjusted multipliers reflect adoption rates, exception handling, coverage, and integration
maturity. Conservative scenario applies downward adjustments across benefit categories.

Key formulas.

● Annual Benefit = Time savings value + Quality improvement value + Revenue uplift
value.

● Payback (months) = Implementation cost ÷ Annual Benefit × 12.

● ROI percent (used in methodology and matrices, even if not shown in every table) =
(Annual Benefit − Annual cost) ÷ Annual cost × 100.

Inputs, parameters, and versions are documented in Appendix E: ROI Calculator
Methodology.

A.7 Opportunity Matrix Methodology

The Opportunity Matrix converts readiness and business impact into a transparent prioritization
model.

Two-matrix framework.

1. Base Opportunity Matrix 0 to 100. Pure efficiency comparison on a consistent
company-relative basis using Base Impact.

2. Enhanced Opportunity Matrix 0 to 150. Adds value beyond efficiency:

○ Error Reduction Bonus up to 25 points based on measured error rates and
rework avoided.

○ Revenue Uplift Bonus up to 25 points based on validated capacity reallocation
toward revenue activities.

Enhanced Impact = Base Impact + Error Bonus + Revenue Bonus. Enhanced is
always greater than or equal to Base.

Axes.

● X axis: Business Impact (Base or Enhanced, depending on the view presented).

● Y axis: Implementation Effort (0 to 100), a weighted composite combining readiness score
(50 percent), ramp-up period (20 percent), payback period (20 percent), and training hours
(10 percent). See Section A.5 for detailed methodology.

Quadrants.

● Quick Wins: High impact and low effort.

● Strategic Bets: High impact and high effort.

● Nice-to-Haves: Low impact and low effort.

● Deprioritize: Low impact and high effort.

A.8 Roadmap Development Methodology

Roadmap sequencing is derived directly from matrix positions and diagnostic evidence.

Phase 1 Quick Wins 0 to 6 months. Low effort and high impact items executed first to deliver
ROI quickly and validate governance, data connections, and monitoring.

Phase 2 Foundational Enhancements 6 to 12 months. Address data quality, integration, and
documentation gaps and pilot mid-complexity automations to raise readiness.

Phase 3 Strategic Implementations 12 to 18 plus months. High-impact, higher-effort
automations that extend across systems and functions, often with AI components and
orchestration requirements.

Sequencing also considers technical dependencies, value realization timing, resource capacity,
change management cadence, and budget cycles.

A.9 Methodological Limitations

This diagnostic is a point-in-time assessment of readiness and potential value, not a detailed
implementation plan.

Reliance on client data. TFAs, PIFs, and interviews are self-reported. Inaccuracies or
omissions may affect precision. Midpoint rules and follow-ups mitigate but do not eliminate this
risk.

Scope boundary. Findings focus on feasibility, maturity, and impact at diagnostic depth.
Solution design, integration validation, and vendor selection occur in subsequent phases.

Uncertainty and change. System changes, policy shifts, or market conditions may alter
feasibility and benefits. Conservative modeling and normalization are used to avoid overstating
impact.
`;

export const APPENDIX_D_INTRO = `
This appendix provides an auditable financial view of each validated automation opportunity.
Results are modeled using Automat-IA's Conservative Scenario Framework unless indicated
otherwise. Financial figures are rounded to the nearest hundred.

D.1 Portfolio Summary Table
`;

export const APPENDIX_D_MODELING_NOTES = `
D.3 Modeling Notes and Traceability

● Calculations follow the Automat-IA ROI Calculator and Conservative Scenario
Framework.

● Inputs originate from validated PIF responses, stakeholder interviews, and
documentation review; see Appendix F: Data Provenance and Audit Trail for
respondent names, roles, dates, and any midpoint assumptions.

● When quality or revenue data is not verified, values are held at zero until validated to
avoid inflating benefit.

● Payback is computed as Implementation Cost divided by Annual Benefit multiplied by
12.

● FTE conversions assume 2,080 hours per year unless client-specific contracts dictate
otherwise.
`;

export const APPENDIX_E_PART1 = `
This appendix documents the financial logic and scenario controls used to generate
Automat-IA's ROI, payback, and benefit projections. All calculations are performed under the
Conservative Scenario Framework, ensuring every figure in this report is realistic,
risk-adjusted, and auditable.

E.1 Core Financial Formulas

Return on Investment (ROI)

ROI (%) = (Net Benefit / Total Costs) × 100

Components:
Net Benefit = Total Annual Benefits − Total Annual Costs
Total Costs = Implementation + Software + Training + Change Management

Interpretation:
ROI expresses the steady-state annual financial return after the automation is fully operational.
A positive ROI indicates that annualized benefits exceed total costs.

Payback Period (Months)

Payback = Total Investment / Monthly Net Benefit

Monthly Net Benefit = (Annual Benefits − Recurring Costs) / 12

Interpretation:
Measures how many months are required for cumulative net benefits to recover initial
investment, including a Year-1 ramp-up factor to reflect progressive adoption rather than instant
realization.

E.2 Net Benefit Formulas
`;

export const APPENDIX_E_PART2 = `
E.3 FTE and Hours Conversions

FTE Saved = Annual Hours Saved / 2,080

Annual Hours Saved = (Weekly Process Hours × Employees Involved × Time Savings %) × 52

Standard Work Year: 2,080 hours (52 weeks × 40 hours)

Interpretation: Converts time saved into full-time-equivalent capacity. Fractional FTEs indicate
redeployable time rather than headcount reduction.

E.4 Annual Benefit Breakdown

Total Annual Benefits = Time Savings Benefits + Error Reduction Benefits + Revenue Uplift Benefits
`;

export const APPENDIX_E_PART3 = `
E.5 Scenario Adjustment Framework

To reflect real-world execution realities, Automat-IA applies five adjustment layers that moderate
both benefit and cost estimations:
`;

export const APPENDIX_E_PART4 = `
E.6 Key Modeling Assumptions
`;

export const APPENDIX_E_PART5 = `
E.7 Formula Integrity and Audit Trail

All formulas are implemented in Automat-IA's ROI Calculator engine with:

● Version-controlled formula library and revision logs

● Parameter provenance linking each input to respondent and collection date

● Automatic rounding to the nearest hundred for presentation consistency

● Validation checks ensuring all ROI, payback, and FTE values reconcile across
appendices

Every figure in this report can be traced back to its originating dataset in Appendix F: Data
Provenance and Audit Trail.
`;
