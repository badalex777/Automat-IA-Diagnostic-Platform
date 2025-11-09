# Automat-IA Diagnostic Platform

## Overview

The Automat-IA Diagnostic Platform is a professional web application for consultants to manage AI implementation diagnostics for client companies. It facilitates Phase-1 diagnostics using step-level process assessment as the primary method. Each workflow is broken down into individual process steps, where each step is assessed independently through Technical Feasibility (TFA, shared across workflow) and Process Insight Forms (PIF, collected per step). The platform generates step-specific readiness scores, SWOT analyses, and implementation opportunities, producing comprehensive Executive Diagnostic Reports. The business vision is to empower consultants with granular, step-by-step insights for AI adoption, enabling precise scoping and impact attribution.

**Recent Update (Nov 2024):** Platform Handbook comprehensively updated to accurately document step-level readiness architecture as the primary assessment method. All sections now clearly explain step-level granularity, multi-respondent aggregation scope, readiness view architecture, opportunity table features, and data flow with structured bullet formatting.

**EDR Generation Update (Nov 2024):** Executive Diagnostic Report generation system enhanced to fully implement step-level readiness architecture. Key improvements: (1) Methodology section expanded from 8 to 10 phases, clarifying TFA as workflow-level and PIF as step-level; (2) Diagnostic Overview sections 4.5-4.8 personalized with dynamic template variables (opportunity lists, foundational gaps, strategic bets, cultural insights) with comprehensive fallback handling; (3) Appendix C redesigned from traditional SWOT tables to flattened columnar format [Workflow, Step #, Step Name, SWOT Category, Readiness Insight, Evidence, Recommended Action]; (4) Appendix F enhanced with Step # and Step Name columns to differentiate TFA (workflow-level) from PIF (step-level) entries; (5) All data aggregation updated to include step metadata with proper database joins and naming conventions.

**EDR Data Model Integration (Nov 5, 2024):** Fixed critical data model integration bugs in report generation:
- **AppendixB Data Access**: Corrected template variable extraction to access nested `data.appendixB` structure instead of non-existent top-level `workflowSwot` and `questionInsights` fields
- **QuestionInsight Type Safety**: Fixed property access throughout report generation - using `numericScore` instead of `score`, `questionText` instead of `factor`
- **Comprehensive Null Safety**: Enhanced all template variable generators (foundationalGapsList, culturalReadinessSummary, evidence extraction) with proper null guards for missing SWOT data, question insights, and scores
- **Data Flow Contract**: DiagnosticData → appendixB[] → workflowLevelSWOT/stepLevelSWOTs → questionInsights/swotAnalysis/followUpActions
- **End-to-End Verification**: Report generation tested and confirmed working with proper Content-Type (application/vnd.openxmlformats-officedocument.wordprocessingml.document) and successful downloads

**Verification Code System (Nov 6, 2024):** Implemented shareable link verification using pre-generated codes shared separately from links:
- **Architecture**: Consultants generate shareable links with unique verification codes (format: "TFA-XXXXX" or "PIF-XXXXX") via ShareableLinkCard interface
- **Security**: GET endpoints sanitize verification codes from responses to prevent leakage; POST endpoints validate codes server-side before accepting submissions
- **TFA Flow**: POST /api/workflows/:workflowId/tfa/create-shareable generates template with code; TFA form displays code input on Section 0; POST /api/tfa/shareable/:shareableId/submit validates code
- **PIF Flow**: POST /api/workflows/:workflowId/pif/create-shareable generates template with code; PIF form displays code input on disclaimer page; POST /api/pif/shareable/:shareableId/submit validates code
- **UX Pattern**: Verification code input appears only on first section (disclaimer for PIF, section 0 for TFA) with format-specific placeholders
- **Data Model**: Both tfaAssessments and pifResponses tables store verificationCode as varchar for server-side validation; email field is optional
- **End-to-End Testing**: Automated Playwright tests verify both TFA and PIF flows including invalid code rejection
- **Data Quality**: All new TFA/PIF submissions are marked as verified=true, confirming successful code validation

**PIF Score Calculation & Display (Nov 7, 2024):** Fixed PIF operational score calculation and implemented executive summary display:
- **Bug Fix**: PIF submission endpoint (POST /api/pif/shareable/:shareableId/submit) now calculates and persists processClarity, changeMagnitude, and workflowBrittleness scores using calculatePIFScores function from shared/pifQuestions.ts
- **Data Architecture**: Individual PIF responses store their three operational scores as integers; variance/statistics are calculated dynamically via calculateAggregatedPIFScores when aggregating multiple respondents (not stored per-response)
- **PIFExecutiveSummary Component**: Created new executive summary component (client/src/components/PIFExecutiveSummary.tsx) mirroring TFA Executive Summary pattern with operational insights, strength/concern analysis, and action recommendations
- **Integration**: PIFExecutiveSummary added to WorkflowStepDetail PIF Data tab, positioned above raw respondent details, showing aggregated analysis for all step-level respondents
- **Readiness Display**: Step-level readiness analysis now correctly displays non-zero PIF operational scores in both PIF Data tab (executive summary) and Readiness Analysis tab (radar chart and component breakdown)
- **Data Backfill**: Existing PIF responses backfilled with calculated scores to ensure historical data displays correctly in all views
- **End-to-End Verification**: Automated Playwright tests confirm PIF scores calculate correctly, persist to database, and display in both PIF Data and Readiness Analysis tabs

**Workflow-Level Consolidation System (Nov 9, 2024):** Implemented hybrid tactical/strategic opportunity packaging with workflow-level consolidations:
- **Architecture**: Workflow-level consolidations bundle multiple step-level opportunities into coordinated implementation packages, showing both tactical (individual step opportunities) and strategic (consolidated platform) investment scenarios
- **Calculation Logic**: Centralized in shared/consolidationCalculations.ts with 20% coordination buffer for workflow-level projects and 15% integration overhead, preventing calculation divergence between UI components
- **Business Impact**: Consolidations use aggregated constituent metrics (sum ROI, sum FTE, weighted average payback) with coordination buffers applied; positioned on matrix using average constituent readiness scores with effort penalties
- **UI Integration**: OpportunityMatrix displays consolidations as larger data points (radius 8-10 vs 5) with distinct stroke styling and show/hide toggle; OpportunitiesTable shows Type column with expandable constituent breakdown
- **Workflow Detail UI**: Dedicated Consolidations section in Opportunities tab with create/edit/delete functionality, aggregated metrics cards, and constituent opportunity listings
- **EDR Report Enhancement**: Appendix D.0 added with two tables: (D.0a) Consolidated Opportunity Summary showing workflow, name, constituent count, ROI, FTE, payback, and quadrant; (D.0b) Consolidation Constituent Mapping with sorted step-by-step breakdown
- **Localization**: Full bilingual support with Spanish translations for D.0 table captions and report sections
- **Data Model**: opportunityConsolidations table links to workflows with many-to-many relationship to constituent opportunities, storing name and aggregated metrics

## User Preferences

Preferred communication style: Simple, everyday language.

Design principles:
- No emojis anywhere in the webapp (use Lucide React SVG icons instead)
- All messaging must position AI as augmentation of human work, never replacement

Language Requirements:
- **Platform**: English-only for all internal components (Dashboard, Company Detail, Workflow Detail, all dialogs, forms, and reports)
- **TFA/PIF Surveys**: Bilingual (English/Spanish) with language toggle for client-facing assessment forms only
- Translation functionality is isolated to survey routes via scoped LanguageProvider in App.tsx

## System Architecture

### Frontend

The frontend is a React 18+ SPA with TypeScript and Wouter for routing. It uses Radix UI and Shadcn/ui (New York variant) for a consistent, accessible UI, styled with Tailwind CSS. State management uses TanStack Query for server state. The design system features a professional, data-focused aesthetic with a custom HSL-based color system, Inter and JetBrains Mono typography, and dark mode support.

### Backend

The backend uses Express.js and TypeScript (ESM modules). Data is stored in PostgreSQL (Neon serverless) managed by Drizzle ORM and Zod for validation. The API is RESTful with JSON formats, including middleware for logging, error handling, and CORS.

### Data Model

Core entities include Companies, Workflows, Workflow Steps (step-level granularity with participant assignments), TFA Assessments (21-question weighted scoring at workflow level, feasibility bands), PIF Responses (step-level multi-respondent, 40-question, operational scores, ROI inputs, qualitative insights), Readiness Rubrics (calculated per step: TFA 60% + step PIF 40%), Implementation Opportunities (ROI-based business impact with FTE normalization, linkable to specific steps), and Business Impact (ROI calculations with a 10x multiplier). The system tracks respondents, knowledge gaps, and step-level performance metrics.

### Key Features

- **Workflow Management**: Create and manage workflows, each broken down into individual process steps with participant assignments and descriptions from stakeholder interviews.
- **TFA Survey & Analysis**: Workflow-level technical feasibility assessment shared across all steps. Collects feasibility data, detects "Don't Know" answers, supports gap resolution, provides auto-updating scores, visual analytics, 5-tier feasibility interpretation, and an Executive Summary with critical technical gaps, strengths, and an implementation roadmap.
- **Step-Level PIF Survey**: Process Insight Form collected per workflow step, capturing operational realities at granular level with 40 questions across 8 sections, including operational scores, ROI inputs, and qualitative insights. Supports multiple respondents per step with variance indicators.
- **Step-Level Readiness Rubric**: Each process step displays its own combined readiness score (60% shared TFA + 40% step-specific PIF) with 7 component breakdowns, radar chart visualization, feasibility banding, and comprehensive SWOT analysis. This is the primary assessment view.
- **Opportunity Matrix**: A 2D scatter plot visualizing opportunities by Business Impact (X-axis, with a 10x multiplier for ROI and FTE) and Implementation Effort (Y-axis, weighted composite of step-level readiness, ramp-up, payback, and training). Opportunities are created and linked exclusively at the step level. Matrix positioning uses each opportunity's step-specific readiness score for precise Implementation Effort calculation, while opportunities are color-coded by their source workflow for easy visual grouping. Features both a Base Impact Matrix (0-100 scale, ROI + FTE only) and an Enhanced Impact Matrix (0-150 scale with metric-based bonuses).
- **Executive Diagnostic Report**: Generates a comprehensive, branded .docx document for clients, including an Executive Summary, methodology, findings, automation roadmap, and six detailed technical appendices (Appendix C aggregates all step-level SWOT analyses per workflow).

### Step-Level Assessment Architecture

The platform implements step-level granularity for workflow assessments:

- **Workflow Steps**: Each workflow is broken down into individual process steps, each with assigned participants (name, role) and ordering
- **Step-Level PIFs**: Process Insight Forms are collected per workflow step/participant, capturing operational realities at granular level
- **Step-Level Readiness**: Each step receives its own readiness score calculated as 60% shared workflow TFA + 40% unique step PIF operational average
- **Step-Level SWOT**: Each step with a completed PIF generates its own SWOT analysis based on step-specific readiness components
- **Step-Exclusive Opportunity Creation**: Implementation opportunities are created and linked exclusively at the step level (no workflow-level opportunities exist). Each opportunity is positioned on the matrix using its step's specific readiness score for accurate Implementation Effort calculation
- **Report Aggregation**: Executive Diagnostic Report Appendix C aggregates all step-level SWOT analyses per workflow, providing comprehensive step-by-step assessment insights

## External Dependencies

### Database & Infrastructure

- **Neon Serverless PostgreSQL**: Cloud database.
- **Drizzle Kit**: Schema migrations.

### UI Component Libraries

- **@radix-ui/\***: Accessible component primitives.
- **recharts**: Charting library.
- **embla-carousel**: Carousel component.
- **cmdk**: Command palette.
- **date-fns**: Date manipulation.
- **lucide-react**: Icon library.

### Form Handling & Validation

- **React Hook Form**: Form state management.
- **Zod**: Schema validation.

### Document Generation

- **docx**: Programmatic Word document creation.

### Development Tools

- **Vite**: Build tool and dev server.
- **TypeScript**: Type checking.
- **ESBuild**: Production server bundling.

### Styling Infrastructure

- **Tailwind CSS**: Utility-first CSS framework.
- **PostCSS with Autoprefixer**: CSS processing.
- **clsx & tailwind-merge**: Conditional class name utilities.