# Automat-IA Diagnostic Platform

## Overview

The Automat-IA Diagnostic Platform is a professional web application designed for consultants to manage AI implementation diagnostics for client companies. It specializes in Phase-1 diagnostics by assessing workflows at a granular, step-level. The platform uses Technical Feasibility Assessments (TFA, workflow-level) and Process Insight Forms (PIF, step-level) to evaluate each process step. It generates step-specific readiness scores, SWOT analyses, and identifies implementation opportunities, culminating in comprehensive Executive Diagnostic Reports. The platform's vision is to provide consultants with detailed insights for AI adoption, enabling precise project scoping and impact measurement.

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