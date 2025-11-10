# Automat-IA Diagnostic Platform

## Overview

The Automat-IA Diagnostic Platform is a professional web application designed for consultants to manage AI implementation diagnostics for client companies. It specializes in Phase-1 diagnostics by assessing workflows at a granular, step-level. The platform uses Technical Feasibility Assessments (TFA, workflow-level) and Process Insight Forms (PIF, step-level) to evaluate each process step. It generates step-specific readiness scores, SWOT analyses, and identifies implementation opportunities, culminating in comprehensive Executive Diagnostic Reports. The platform's vision is to provide consultants with detailed insights for AI adoption, enabling precise project scoping and impact measurement.

## Recent Changes

### November 10, 2025 - Bilingual EDR Project Completion
- **COMPLETE**: Achieved 100% translation coverage for Executive Diagnostic Reports in English and Spanish
- Expanded `reportTranslations.ts` with 101 additional translation keys covering all Appendices (B, C, D, E), Section 6, Table 4.4, and edge case fallbacks
- Refactored all remaining hardcoded English strings in `reportGenerator.ts` to use centralized translation system
- Enhanced Appendix A formatting: changed period separators to colons, added bilingual framework name detection for bold formatting in both `reportPrompts.ts` and `reportPrompts_es.ts`
- Fixed cultural readiness null-safety with defensive optional chaining and empty payload guards
- Verified Spanish terminology for professional executive audience (corrected "SOPs" to "procedimientos operativos estándar (SOP)")
- **DOCX XML verification**: Confirmed bold colon formatting renders correctly in both languages via XML inspection of generated reports
- End-to-end tested with company "Nuevo sistema PIF" - both English (31KB) and Spanish (32KB) reports generated successfully
- Zero hardcoded English strings remaining - full type-safety enforced via TypeScript interfaces

### November 9, 2025 - Complete Spanish Translation Implementation for EDR
- Implemented centralized translation system with 300+ type-safe translation keys in `server/reportTranslations.ts`
- Created locale-aware formatting module `server/reportFormatters.ts` using Intl APIs for currency, numbers, dates, and month names
- Introduced `createReportContext(lang)` helper providing unified `ctx.t` (translations) and `ctx.fmt` (formatters) API
- Migrated entire `reportGenerator.ts` to use context-based translations and formatters (zero hardcoded strings)
- Spanish formatting: currency uses "$1.234,56" format, dates show "Noviembre 2025", all UI elements fully localized
- End-to-end tested: Both English and Spanish EDR generation confirmed working via API (`?lang=en` / `?lang=es`)
- TypeScript interface enforces translation key parity between English/Spanish dictionaries
- Resolved circular dependency between translation and formatter modules using Intl.DateTimeFormat

### November 9, 2025 - EDR Formatting Refinements
- Reduced spacing after Phase titles, methodology subsections, and subsection headings from 120pt to 60pt to eliminate excessive white space
- Added conditional consolidation count to Section 4.2 Key Diagnostic Findings (displays only when consolidations exist)
- Removed "culture" reference from Phase 8 methodology description
- EDR generation endpoint validates that company has at least one workflow with both TFA and PIF completed before allowing report generation

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

The frontend is a React 18+ SPA built with TypeScript and Wouter for routing. It leverages Radix UI and Shadcn/ui (New York variant) for a consistent and accessible user interface, styled using Tailwind CSS. TanStack Query manages server state. The design emphasizes a professional, data-focused aesthetic, featuring a custom HSL-based color system, Inter and JetBrains Mono typography, and dark mode support.

### Backend

The backend is developed with Express.js and TypeScript (ESM modules). Data is persisted in PostgreSQL (Neon serverless) and managed using Drizzle ORM, with Zod providing schema validation. The API is RESTful, utilizing JSON formats, and includes middleware for logging, error handling, and CORS.

### Data Model

Core entities include Companies, Workflows, Workflow Steps (with participant assignments), TFA Assessments (workflow-level, weighted scoring), PIF Responses (step-level, multi-respondent, operational scores, ROI inputs), Readiness Rubrics (calculated per step from TFA and PIF), Implementation Opportunities (ROI-based, linked to specific steps), and Business Impact calculations.

### Key Features

- **Workflow Management**: Create and manage workflows broken into individual, assignable process steps.
- **TFA Survey & Analysis**: Workflow-level technical feasibility assessment with gap detection, scores, visual analytics, and an executive summary.
- **Step-Level PIF Survey**: Granular, step-level Process Insight Forms collecting operational realities, operational scores, and ROI inputs from multiple respondents.
- **Step-Level Readiness Rubric**: Primary assessment view displaying combined readiness scores (60% TFA + 40% PIF) per step, with component breakdowns, radar charts, and SWOT analysis.
- **Opportunity Matrix**: A 2D scatter plot visualizing implementation opportunities by Business Impact (X-axis) and Implementation Effort (Y-axis), with opportunities linked to specific steps and color-coded by workflow. Includes both Base and Enhanced Impact Matrices.
- **Executive Diagnostic Report**: Generates a comprehensive, branded .docx document including executive summary, methodology, findings, roadmap, and detailed technical appendices aggregating step-level SWOT analyses.
- **Step-Level Assessment Architecture**: Ensures all assessments, readiness scores, SWOT analyses, and opportunity creations are primarily managed at the individual process step level.
- **Workflow-Level Consolidation System**: Allows bundling multiple step-level opportunities into strategic consolidation packages, providing both tactical and strategic investment scenarios. Consolidations have distinct calculation logic for business impact, payback period, readiness score, and implementation effort, incorporating coordination buffers and integration overheads. They are visually differentiated on the Opportunity Matrix and detailed in the EDR.

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