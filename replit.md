# Automat-IA Diagnostic Platform

## Overview

The Automat-IA Diagnostic Platform is a professional web application for consultants to manage AI implementation diagnostics for client companies. It facilitates Phase-1 diagnostics, including Technical Feasibility Assessments (TFA), Readiness Rubrics, and Business Impact calculations to determine ROI and implementation viability. The platform streamlines project management, generates shareable assessment links, and produces comprehensive Executive Diagnostic Reports. The business vision is to empower consultants with a robust tool for AI strategy, enhancing market potential by providing clear, data-driven insights for AI adoption.

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

Core entities include Companies, Workflows, TFA Assessments (21-question weighted scoring, feasibility bands), PIF Responses (multi-respondent, 40-question, operational scores, ROI inputs, qualitative insights), Readiness Rubrics (TFA 60% + PIF 40%), Implementation Opportunities (ROI-based business impact with FTE normalization), and Business Impact (ROI calculations with a 10x multiplier). The system tracks respondents and knowledge gaps.

### Key Features

- **TFA Survey & Analysis**: Collects technical feasibility data, detects "Don't Know" answers, supports gap resolution, provides auto-updating scores, visual analytics, 5-tier feasibility interpretation, and an Executive Summary with critical technical gaps, strengths, and an implementation roadmap.
- **PIF Survey & Aggregation**: Multi-respondent Process Insight Form collecting 40 questions across 8 sections, including operational scores, ROI inputs, and qualitative insights. Aggregates scores with variance indicators across respondents.
- **Readiness Rubric**: Unifies TFA and PIF into a combined 0-100 score with 7 component breakdowns, feasibility banding, visual analytics, and a comprehensive SWOT analysis Executive Summary.
- **Opportunity Matrix**: A 2D scatter plot visualizing opportunities by Business Impact (X-axis, with a 10x multiplier for ROI and FTE) and Implementation Effort (Y-axis, weighted composite of readiness, ramp-up, payback, and training). Features both a Base Impact Matrix and an Enhanced Impact Matrix with additive bonuses.
- **Executive Diagnostic Report**: Generates a comprehensive, branded .docx document for clients, including an Executive Summary, methodology, findings, automation roadmap, and six detailed technical appendices.

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