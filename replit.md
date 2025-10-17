# Automat-IA Diagnostic Platform

## Overview

The Automat-IA Diagnostic Platform is a professional data management web application designed to help consultants manage AI implementation diagnostics for client companies. It facilitates Phase-1 diagnostics per project (company) and workflow, including Technical Feasibility Assessments (TFA), Readiness Rubrics, and Business Impact calculations to determine ROI and implementation viability. The platform aims to streamline the management of multiple diagnostic projects and generate shareable assessment links for technical contacts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built as a Single Page Application (SPA) using React 18+ with TypeScript and Wouter for routing. It leverages Radix UI primitives and Shadcn/ui (New York variant) for a consistent, accessible UI, styled with Tailwind CSS. State management relies on TanStack Query for server state and React hooks for local component state. The design system features a professional, data-focused aesthetic with a custom HSL-based color system, Inter and JetBrains Mono typography, and a consistent elevation system. Dark mode is supported by default.

### Backend Architecture

The backend is built with Express.js and TypeScript, utilizing ESM modules. Data is stored in a PostgreSQL database (Neon serverless) managed by Drizzle ORM for type-safe queries and schema management, with Zod for runtime validation. The API follows a RESTful pattern with JSON request/response formats and includes middleware for logging, error handling, and CORS. Session management is prepared using connect-pg-simple.

### Data Model

The core entities include Companies (client organizations with optional financial context: annualRevenue, totalEmployees, annualLaborCosts for normalized opportunity scoring), Workflows (business processes within companies), TFA Assessments (technical feasibility with weighted scoring across 4 technical categories: System Environment 25%, Data Quality 30%, Integration Feasibility 30%, Security/Compliance 15%), PIF Responses (Process Insight Form with multi-respondent support), Readiness Rubrics (combining TFA 60% + PIF 40%), and Business Impact (ROI calculations). TFA assessments include a 21-question weighted scoring system (0-100 score), feasibility bands (Very High, High, Moderate, Low, Very Low), shareable links, and open-ended comments. The system also tracks initial respondents and multiple response sources to audit knowledge gaps. PIF responses store respondent metadata (name, role, responsibilities), 41-question responses with conditional Quality Impact module, operational scores (Process Clarity, Change Magnitude, Workflow Brittleness), ROI inputs, and qualitative insights.

### Feature Specifications

- **TFA Survey**: Collects responses to 21 questions across 4 technical sections (System Environment: 6q, Data Quality: 5q, Integration Feasibility: 6q, Security/Compliance: 4q), detects "Don't Know" answers, and collects "gap metadata" (why the question couldn't be answered, who might know).
- **Gap Resolution**: Consultants can fill knowledge gaps, with an audit trail of who provided the information and why.
- **TFA Analysis**: Provides auto-updating scores, assessment notes, visual analytics (radar and pie charts), a 5-tier feasibility interpretation with recommendations, and a data-driven Executive Summary. The Executive Summary includes Critical Technical Gaps (questions scoring 1-2, impact-sorted using formula: (5 - score) × section_weight), Key Strengths (top questions scoring 5), and an Implementation Roadmap with score-specific recommendations pulled directly from question responses.
- **Question-Level Analysis**: Collapsible detailed view showing individual question responses with score-specific recommendations (105 total: 21 questions × 5 score levels). Features include: text search, section filter (4 technical categories), score filter (Critical 1, Weak 2, Moderate 3, Strong 4, Optimal 5), automatic exclusion of "Don't Know" responses, respondent attribution, and actionable mitigation strategies for each answer. Shows answered questions even when knowledge gaps exist; full analysis (charts, executive summary) unlocks when all gaps are resolved.
- **PIF Survey**: Multi-respondent Process Insight Form accessible via shareable workflow-based link (no registration required). Collects 41 questions across 8 sections with section-level validation (Process Clarity Q1-Q3, Change Magnitude Q4-Q6, Workflow Brittleness Q7-Q10, Time Savings Q11-Q13, Revenue Uplift Q14-Q16, Experience & Insights Q17-Q27, Time & Volume Data Q28-Q31, Quality Impact Module Q32-Q41 conditional on Q32 = 'yes'). Questions include examples for clarity (e.g., Q21 typical outcomes, Q26 exceptions). Key question refinements: Q11/Q33 ask "which best describes the work you perform" (employee perspective), Q21 captures typical outcomes/deliverables, Q22 identifies pain points, Q23 documents specific steps performed, Q26 captures exceptions and special cases, Q32 is Yes/No gate for Quality Impact module (was Likert scale). Next button validates required questions per section before progression. Captures respondent metadata (name, role, responsibilities), operational scores (Process Clarity 0-100, Change Magnitude 0-100, Workflow Brittleness 0-100), ROI inputs extracted from Q28-Q31 (employeeCount, frequency, processesPerPeriod, minutesPerProcess) and Q39-Q41 when hasQualityImpact = true (errorRate, reworkMinutesPerError, costPerError), and section-specific qualitative insights (toolsUsed, toolLimitations, timeWasters, automationWish, typicalOutcome, keyDifficulties, personalSteps, criticalKnowledge, impactOfDelays, exceptions, additionalContext). Supports unlimited respondents per workflow.
- **PIF Aggregation & Variance**: Displays aggregated scores (average, min-max range, standard deviation) across all respondents for each operational metric. Visual variance indicators (icons for low/moderate/high variance) help identify consensus vs. disagreement. Individual responses viewable in detail dialog with complete data (scores, ROI, qualitative). Delete functionality with cache invalidation.
- **Readiness Rubric**: Unified readiness assessment combining TFA technical foundation (60% weight) and PIF operational readiness (40% weight) into a 0-100 combined score. Displays 7 component breakdowns: TFA components (System Environment 15%, Data Quality 18%, Integration Feasibility 18%, Security/Compliance 9%) and PIF components (Process Clarity 8%, Change Magnitude 8%, Workflow Brittleness 6%). Features feasibility banding (Very High 80+, High 65-79, Moderate 50-64, Low 35-49, Very Low <35) with color-coded badges and strategic recommendations. Visual analytics include component radar chart and component weights pie chart with detailed explanations of why each component carries its specific weight. Executive Summary provides comprehensive SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) using actual TFA and PIF data to identify high-scoring areas, critical gaps, implementation opportunities, and potential blockers. Requires both TFA completion and at least one PIF response.
- **Opportunity Matrix**: 2D scatter plot visualization mapping opportunities by Business Impact (X-axis, 0-100) vs Implementation Effort (Y-axis, 0-100, inverted readiness). Four quadrants with strategic labels: Quick Wins (high impact, low effort), Strategic Goals (high impact, high effort), Nice-To-Haves (low impact, low effort), Deprioritize (low impact, high effort). **Business Impact Formula**: Simplified to ROI + Hours only (FTE removed as it was redundant with Hours since FTE = hours/40). FTE is auto-calculated for display purposes only. **Matrix Filter System**: Filter dropdown enables fair comparison of opportunities within metric categories. Five filter views with rebalanced weights: (1) Time Savings Only - shows opportunities with no bonuses, redistributes 100% across ROI 60%, Hours 40%; (2) Time + Error Reduction - shows opportunities with error enabled only, redistributes to ROI 45%, Hours 30%, Error 25%; (3) Time + Revenue Uplift - shows opportunities with revenue enabled only, redistributes to ROI 45%, Hours 30%, Revenue 25%; (4) All 3 Metrics - shows opportunities with both bonuses enabled, redistributes to ROI 40%, Hours 25%, Error 20%, Revenue 15%; (5) All Opportunities - shows all opportunities using their individual toggle states. **Within-Category Normalization**: Each filtered view recalculates Business Impact using only relevant metrics, then normalizes scores so the best opportunity in that category can reach ~100 (normalizedScore = score / maxScore × 100, only applies when maxScore > 20 and filter ≠ "all-opportunities"). This ensures fair scoring and enables time-only opportunities to compete effectively within their category instead of being penalized for missing bonus metrics. **Hourly Rate Calculation**: The Hours score component uses actual employee hourly rates calculated from stakeholder interview data: Hourly Rate = (employeeAnnualSalary × overheadMultiplier) ÷ 2,080 annual hours. This aligns with the ROI Calculator methodology (Section 3.1). Default overhead multiplier is 1.3 (representing benefits and indirect costs). When salary data is not provided, the system falls back to $50/hour for backward compatibility. The calculated hourly rate directly impacts the Hours score: hoursScore = (annualHoursSaved × hourlyRate) / maxPossibleHoursSaved × normalizedWeight. This ensures Business Impact reflects actual labor economics rather than inflated assumptions. **Implementation Effort**: Calculated from inverted readiness (40%), ramp-up period (25%, normalized 3-18 months), payback period (25%), and training hours (10%). Ramp-up period measures time to full operational capacity. Each opportunity has per-opportunity toggle controls (errorMetricsEnabled, revenueMetricsEnabled) that persist to database and automatically update scores and positions when changed. Toggles display as "Impact Boosters" on opportunity cards when relevant metrics exist. Y-axis correctly positions higher effort opportunities higher on chart. **Company-Relative Scoring**: When company financial context is provided (annualRevenue, totalEmployees, annualLaborCosts), opportunity scores are normalized relative to company size: ROI as percentage of annual revenue, and labor cost savings as percentage of annual labor costs. This enables fair comparison across companies of different sizes. When financial context is missing, scores fallback to absolute value normalization. The system prompts users to add financial context for more accurate business impact assessment. **FTE Display**: FTE is auto-calculated from hours (FTE = hoursPerWeek / 40) and displayed separately alongside hours/week for communication purposes.
- **Workflow Progression**: Workflows track status from tfa_only → tfa_readiness → readiness_impact → complete.
- **Dashboard**: Provides overview of companies and workflows with search/filter functionality.

## External Dependencies

### Database & Infrastructure

- **Neon Serverless PostgreSQL**: Cloud database with connection pooling.
- **Drizzle Kit**: For schema migrations.

### UI Component Libraries

- **@radix-ui/\***: Accessible component primitives.
- **recharts**: Charting library for data visualization.
- **embla-carousel**: Touch-friendly carousel.
- **cmdk**: Command palette component.
- **date-fns**: Date manipulation.
- **lucide-react**: Icon library.

### Form Handling & Validation

- **React Hook Form**: Form state management.
- **Zod**: Schema validation.

### Development Tools

- **Vite**: Build tool and dev server.
- **@replit/vite-plugin-\***: Replit-specific plugins.
- **TypeScript**: For type checking.
- **ESBuild**: For production server bundling.

### Styling Infrastructure

- **Tailwind CSS**: Utility-first CSS framework.
- **PostCSS with Autoprefixer**: CSS processing.
- **clsx & tailwind-merge**: Conditional class name utilities.