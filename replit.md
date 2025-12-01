### Overview

The Automat-IA Diagnostic Platform is a professional web application for consultants to manage AI implementation diagnostics. It focuses on Phase-1 diagnostics by assessing workflows at a granular, step-level, using Technical Feasibility Assessments (TFA) and Process Insight Forms (PIF). The platform generates step-specific readiness scores, SWOT analyses, and identifies implementation opportunities, culminating in comprehensive Executive Diagnostic Reports. Its vision is to provide consultants with detailed insights for AI adoption, enabling precise project scoping and impact measurement.

### User Preferences

Preferred communication style: Simple, everyday language.

Design principles:
- No emojis anywhere in the webapp (use Lucide React SVG icons instead)
- All messaging must position AI as augmentation of human work, never replacement

Language Requirements:
- **Platform**: English-only for all internal components (Dashboard, Company Detail, Workflow Detail, all dialogs, forms, and reports)
- **TFA/PIF Surveys**: Bilingual (English/Spanish) with language toggle for client-facing assessment forms only
- Translation functionality is isolated to survey routes via scoped LanguageProvider in App.tsx

### System Architecture

**Frontend:**
The frontend is a React 18+ SPA with TypeScript and Wouter for routing. It utilizes Radix UI and Shadcn/ui (New York variant) with Tailwind CSS for a consistent, accessible, and data-focused user interface. Key features include a custom HSL-based color system, Inter and JetBrains Mono typography, and dark mode support. TanStack Query manages server state.

**Backend:**
The backend is built with Express.js and TypeScript (ESM modules). Data is stored in PostgreSQL (Neon serverless) and managed using Drizzle ORM, with Zod for schema validation. The API is RESTful, uses JSON, and incorporates middleware for logging, error handling, and CORS.

**Data Model:**
Core entities include Companies, Workflows, Workflow Steps, TFA Assessments, PIF Responses, Readiness Rubrics, Implementation Opportunities, and Business Impact calculations. Assessments, readiness scores, SWOT analyses, and opportunity creations are managed at the individual process step level.

**Key Features:**
- **Workflow Management**: Create and manage workflows broken into assignable process steps.
- **TFA Survey & Analysis**: Workflow-level technical feasibility assessment with gap detection and scores.
- **Step-Level PIF Survey**: Granular, step-level Process Insight Forms for operational realities and ROI inputs.
- **Step-Level Readiness Rubric**: Combines TFA and PIF scores (60% TFA + 40% PIF) per step, including SWOT analysis.
- **ROI Calculator Dialog**: Unified create/edit interface for implementation opportunities. Creates opportunities from PIF data with scenario-based projections. Edit mode loads existing roiCalculationData and uses normalizeROICalculation to coerce database strings to numbers. Supports both POST (create) and PATCH (update) operations.
- **Opportunity Matrix**: A 2D scatter plot visualizing implementation opportunities by Business Impact and Implementation Effort.
- **Executive Diagnostic Report**: Generates comprehensive, branded .docx documents with executive summaries, methodology, findings, roadmaps, and technical appendices. Features 12-phase methodology with opportunity quadrant sections (Quick Wins, Strategic Bets, Nice-to-Have, Deprioritize), categorized foundational gaps analysis, and analyst commentary placeholders.
- **Workflow-Level Consolidation System**: Bundles multiple step-level opportunities into strategic consolidation packages with distinct calculation logic for business impact, payback period, readiness score, and implementation effort. These are visually differentiated on the Opportunity Matrix and detailed in the EDR.
- **Unified Security Model**: Both TFA and PIF forms use identical security architecture where an intro/disclaimer page is public, but verification code + respondent info are required to access actual form questions.

**ROI Calculation Methodology (Authoritative: validation spec supersedes older handbook notes):**
- **ALL Rubrics use MULTIPLICATION, never averaging**: Time Savings, Quality Impact, Revenue Uplift, and Ramp-Up Efficiency rubrics multiply all question multipliers together
- **Effective Hourly Rate**: Always calculated as `(annualSalary / annualWorkingHours) × overheadMultiplier` - never use hardcoded values like $85
- **Payback Period**: Month-by-month tracking with 50% efficiency during ramp-up months, 100% after. Formula: `monthEfficiency = (month <= rampUpMonths) ? 0.5 : 1.0`
- **Year 1 Ramp Factor**: `(rampUpMonths × 0.5 + (12 - rampUpMonths) × 1.0) / 12`
- **Revenue Uplift**: Scenario multiplier applied to reallocation percentage only, NOT to the final dollar amount (prevents double multiplication)
- **annualRoi Field**: Stores Year 1 ramped dollar benefits (year1Benefits), allowing downstream to subtract implementation cost for net calculations
- **Scenario Multipliers**: Applied after rubric calculations per spec (Time Savings, Error Reduction, Reallocation, Cost Overrun, Ramp-Up)

**Recent Changes (December 2025):**
- Fixed EDR payback period display: Added getRecalculatedPaybackMonths() helper in reportDataAggregator.ts that recalculates payback from roiCalculationData (instead of reading stale database values) to match UI behavior. Also applied to consolidated opportunity metrics.
- Fixed PIF Operational Readiness score: Changed from simple average to weighted average using 37.5%/37.5%/25% weights for Process Clarity/Change Magnitude/Workflow Brittleness
- Added Opportunity Identity section to ROI Calculator: Separate opportunityName and opportunityDescription fields (distinct from process/step names) displayed throughout EDR
- Fixed Spanish EDR word spacing: Removed unwanted mid-sentence line breaks in reportPrompts_es.ts (Section 9.4 item 2, Section 4.1 Preparación Organizacional, Section 4.12 Reevaluar puntuaciones) that caused awkward word stretching in justified text
- Updated ReadinessData interface: Added tfaScore and pifScore fields for proper data flow from calculateReadinessRubric to EDR Table 5.1
- Fixed annualRoi storage: Now stores year1Benefits (dollar amount) instead of year1ActualROI (percentage)
- Fixed Revenue Uplift: Removed double reallocation multiplier application
- Fixed Quality Impact rubric: Changed from AVERAGING to MULTIPLICATION of 5 multipliers
- Fixed Payback calculation: Implemented month-by-month tracking with 50% efficiency during ramp-up
- Added missing "Very High 1.3×" option to Time Savings repetition multipliers

**Recent Changes (November 2025):**
- Fixed payback period calculation: Uses steady-state annual benefits (not Year 1 ramped-down values) for accurate simple payback calculation
- Unified opportunity editing across all pages: Both WorkflowStepDetail and WorkflowDetail pages now use ROICalculatorDialog for editing opportunities instead of the legacy OpportunityForm, preserving all calculated fields and providing consistent UX
- Added normalizeROICalculation helper: Coerces database decimal strings to numbers when loading opportunities for editing

### External Dependencies

**Database & Infrastructure:**
- **Neon Serverless PostgreSQL**: Cloud database.
- **Drizzle Kit**: Schema migrations.

**UI Component Libraries:**
- **@radix-ui/**: Accessible component primitives.
- **recharts**: Charting library.
- **embla-carousel**: Carousel component.
- **cmdk**: Command palette.
- **date-fns**: Date manipulation.
- **lucide-react**: Icon library.

**Form Handling & Validation:**
- **React Hook Form**: Form state management.
- **Zod**: Schema validation.

**Document Generation:**
- **docx**: Programmatic Word document creation.

**Development Tools:**
- **Vite**: Build tool and dev server.
- **TypeScript**: Type checking.
- **ESBuild**: Production server bundling.

**Styling Infrastructure:**
- **Tailwind CSS**: Utility-first CSS framework.
- **PostCSS with Autoprefixer**: CSS processing.
- **clsx & tailwind-merge**: Conditional class name utilities.