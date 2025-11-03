# Automat-IA Diagnostic Platform

## Overview

The Automat-IA Diagnostic Platform is a professional web application for consultants to manage AI implementation diagnostics for client companies. It facilitates Phase-1 diagnostics using step-level process assessment as the primary method. Each workflow is broken down into individual process steps, where each step is assessed independently through Technical Feasibility (TFA, shared across workflow) and Process Insight Forms (PIF, collected per step). The platform generates step-specific readiness scores, SWOT analyses, and implementation opportunities, producing comprehensive Executive Diagnostic Reports. The business vision is to empower consultants with granular, step-by-step insights for AI adoption, enabling precise scoping and impact attribution.

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
- **Opportunity Matrix**: A 2D scatter plot visualizing opportunities by Business Impact (X-axis, with a 10x multiplier for ROI and FTE) and Implementation Effort (Y-axis, weighted composite of readiness, ramp-up, payback, and training). Opportunities can be linked to specific workflow steps. Features both a Base Impact Matrix and an Enhanced Impact Matrix with additive bonuses.
- **Executive Diagnostic Report**: Generates a comprehensive, branded .docx document for clients, including an Executive Summary, methodology, findings, automation roadmap, and six detailed technical appendices (Appendix C aggregates all step-level SWOT analyses per workflow).

### Step-Level Assessment Architecture

The platform implements step-level granularity for workflow assessments:

- **Workflow Steps**: Each workflow is broken down into individual process steps, each with assigned participants (name, role) and ordering
- **Step-Level PIFs**: Process Insight Forms are collected per workflow step/participant, capturing operational realities at granular level
- **Step-Level Readiness**: Each step receives its own readiness score calculated as 60% shared workflow TFA + 40% unique step PIF operational average
- **Step-Level SWOT**: Each step with a completed PIF generates its own SWOT analysis based on step-specific readiness components
- **Opportunity Linking**: Implementation opportunities can be linked to specific workflow steps, enabling precise scoping and impact attribution
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