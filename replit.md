# Automat-IA Diagnostic Platform

## Overview

The Automat-IA Diagnostic Platform is a professional data management web application designed to help consultants manage AI implementation diagnostics for client companies. It facilitates Phase-1 diagnostics per project (company) and workflow, including Technical Feasibility Assessments (TFA), Readiness Rubrics, and Business Impact calculations to determine ROI and implementation viability. The platform aims to streamline the management of multiple diagnostic projects and generate shareable assessment links for technical contacts.

## User Preferences

Preferred communication style: Simple, everyday language.

Design principles:
- No emojis anywhere in the webapp (use Lucide React SVG icons instead)
- All messaging must position AI as augmentation of human work, never replacement

## System Architecture

### Frontend Architecture

The frontend is built as a Single Page Application (SPA) using React 18+ with TypeScript and Wouter for routing. It leverages Radix UI primitives and Shadcn/ui (New York variant) for a consistent, accessible UI, styled with Tailwind CSS. State management relies on TanStack Query for server state and React hooks for local component state. The design system features a professional, data-focused aesthetic with a custom HSL-based color system, Inter and JetBrains Mono typography, and a consistent elevation system. Dark mode is supported by default.

### Backend Architecture

The backend is built with Express.js and TypeScript, utilizing ESM modules. Data is stored in a PostgreSQL database (Neon serverless) managed by Drizzle ORM for type-safe queries and schema management, with Zod for runtime validation. The API follows a RESTful pattern with JSON request/response formats and includes middleware for logging, error handling, and CORS. Session management is prepared using connect-pg-simple.

### Data Model

The core entities include Companies (client organizations with optional financial context: annualRevenue for ROI normalization, totalEmployees for FTE normalization), Workflows (business processes within companies), TFA Assessments (technical feasibility with weighted scoring across 4 technical categories: System Environment 25%, Data Quality 30%, Integration Feasibility 30%, Security/Compliance 15%), PIF Responses (Process Insight Form with multi-respondent support), Readiness Rubrics (combining TFA 60% + PIF 40%), Implementation Opportunities (ROI-based business impact opportunities with FTE-based hours normalization, no per-opportunity labor cost data), and Business Impact (ROI calculations with 10x multiplier applied to both ROI and FTE metrics). TFA assessments include a 21-question weighted scoring system (0-100 score), feasibility bands (Very High, High, Moderate, Low, Very Low), shareable links, and open-ended comments. The system also tracks initial respondents and multiple response sources to audit knowledge gaps. PIF responses store respondent metadata (name, role, responsibilities), 40-question responses with conditional Quality Impact module, operational scores (Process Clarity, Change Magnitude, Workflow Brittleness), ROI inputs, and qualitative insights.

### Feature Specifications

- **TFA Survey**: Collects responses to 21 questions across 4 technical sections (System Environment: 6q, Data Quality: 5q, Integration Feasibility: 6q, Security/Compliance: 4q), detects "Don't Know" answers, and collects "gap metadata" (why the question couldn't be answered, who might know).
- **Gap Resolution**: Consultants can fill knowledge gaps, with an audit trail of who provided the information and why.
- **TFA Analysis**: Provides auto-updating scores, assessment notes, visual analytics (radar and pie charts), a 5-tier feasibility interpretation with recommendations, and a data-driven Executive Summary. The Executive Summary includes Critical Technical Gaps (questions scoring 1-2, impact-sorted using formula: (5 - score) × section_weight), Key Strengths (top questions scoring 5), and an Implementation Roadmap with score-specific recommendations pulled directly from question responses.
- **Question-Level Analysis**: Collapsible detailed view showing individual question responses with score-specific recommendations (105 total: 21 questions × 5 score levels). Features include: text search, section filter (4 technical categories), score filter (Critical 1, Weak 2, Moderate 3, Strong 4, Optimal 5), automatic exclusion of "Don't Know" responses, respondent attribution, and actionable mitigation strategies for each answer. Shows answered questions even when knowledge gaps exist; full analysis (charts, executive summary) unlocks when all gaps are resolved.
- **PIF Survey**: Multi-respondent Process Insight Form accessible via shareable workflow-based link (no registration required). Collects 40 questions across 8 sections with section-level validation (Process Clarity Q1-Q3, Change Magnitude Q4-Q6, Workflow Brittleness Q7-Q10, Time Savings Q11-Q13, Revenue Uplift Q14-Q15, Experience & Insights Q17-Q27, Time & Volume Data Q28-Q31, Quality Impact Module Q32-Q41 conditional on Q32 = 'yes'). Questions include examples for clarity (e.g., Q24 typical outcomes, Q19 exceptions). Key question refinements: Q11 asks "which best describes the primary work you perform in this step?" providing 15 comprehensive back-office role options organized into 7 departmental categories for easier scanning: Finance & Accounting (financial, finance_ops), Sales & Customer Operations (sales_ops, customer_success, support), Operations & Logistics (procurement, inventory, facilities), HR & Administration (hr, admin), IT & Data (it_ops, data_analyst), Marketing & Growth (marketing_ops), Compliance & Quality (quality_assurance, legal), and Other. This merged role question serves both time savings categorization AND revenue uplift calculations (eliminating redundant Q14 "who gets time back"); Q33 frequency question; Q24 captures typical outcomes/deliverables, Q22 identifies time-wasters, Q17 documents specific steps performed, Q19 captures exceptions and special cases, Q32 is Yes/No gate for Quality Impact module (was Likert scale). Next button validates required questions per section before progression. Captures respondent metadata (name, role, responsibilities), operational scores (Process Clarity 0-100, Change Magnitude 0-100, Workflow Brittleness 0-100), ROI inputs extracted from Q28-Q31 (employeeCount, frequency, processesPerPeriod, minutesPerProcess) and Q39-Q41 when hasQualityImpact = true (errorRate, reworkMinutesPerError, costPerError), and section-specific qualitative insights including role (Q11), personalSteps (Q17), criticalKnowledge (Q18), exceptions (Q19), toolsUsed (Q20), toolLimitations (Q21), timeWasters (Q22), automationWish (Q23), typicalOutcome (Q24), keyDifficulties (Q25), impactOfDelays (Q26), additionalContext (Q27). Supports unlimited respondents per workflow.
- **PIF Aggregation & Variance**: Displays aggregated scores (average, min-max range, standard deviation) across all respondents for each operational metric. Visual variance indicators (icons for low/moderate/high variance) help identify consensus vs. disagreement. Individual responses viewable in detail dialog with complete data (scores, ROI, qualitative). Delete functionality with cache invalidation.
- **Readiness Rubric**: Unified readiness assessment combining TFA technical foundation (60% weight) and PIF operational readiness (40% weight) into a 0-100 combined score. Displays 7 component breakdowns: TFA components (System Environment 15%, Data Quality 18%, Integration Feasibility 18%, Security/Compliance 9%) and PIF components (Process Clarity 15%, Change Magnitude 15%, Workflow Brittleness 10%). Features feasibility banding (Very High 80+, High 65-79, Moderate 50-64, Low 35-49, Very Low <35) with color-coded badges and strategic recommendations. Visual analytics include component radar chart and component weights pie chart with detailed explanations of why each component carries its specific weight. Executive Summary provides comprehensive SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) using actual TFA and PIF data to identify high-scoring areas, critical gaps, implementation opportunities, and potential blockers. Requires both TFA completion and at least one PIF response.
- **Opportunity Matrix**: 2D scatter plot visualization mapping opportunities by Business Impact (X-axis) vs Implementation Effort (Y-axis). Features **dual-matrix scoring system** with Base Impact Matrix and Enhanced Impact Matrix for comprehensive opportunity comparison. **Business Impact Scoring with 10x Multiplier**: Uses absolute percentage-based scoring with 10x amplification applied to both ROI and FTE metrics. Formula: `roiScore = (Annual ROI / Company Revenue) × 1000` and `hoursScore = (FTE Savings / Total Employees) × 1000`, both capped at 100. This multiplier acknowledges that workflow-level automations rarely exceed 10% company-wide impact, making 10% ROI or 10% FTE savings = score 100 (exceptional), 5% = score 50 (solid), 2% = score 20 (modest). Scores remain stable when adding/removing other opportunities (no relative normalization). **Base Impact Matrix**: Fixed apples-to-apples comparison using ROI 60% + Hours 40% = 100 max. Provides consistent opportunity comparison regardless of additional metrics. **Enhanced Impact Matrix**: Additive bonus model starting with base impact (ROI 60% + Hours 40%) and layering bonuses on top: Error Reduction +25%, Revenue Uplift +25%. Guarantees Enhanced Impact ≥ Base Impact since bonuses can only increase scores. Dynamic scale adjusts based on enabled metrics: Time Only = 0-100 (base only), Time + Error/Revenue = 0-125 (base + one bonus), All Three Metrics = 0-150 (base + both bonuses). Toggle controls (errorMetricsEnabled, revenueMetricsEnabled) persist per-opportunity to database. Workflow color stability via sorted ID assignment.
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