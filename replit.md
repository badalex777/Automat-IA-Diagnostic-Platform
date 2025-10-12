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

The core entities include Companies (client organizations), Workflows (business processes within companies), TFA Assessments (technical feasibility with weighted scoring across 4 technical categories: System Environment 25%, Data Quality 30%, Integration Feasibility 30%, Security/Compliance 15%), Readiness Rubrics (planned), and Business Impact (ROI calculations). TFA assessments include a 21-question weighted scoring system (0-100 score), feasibility bands (Very High, High, Moderate, Low, Very Low), shareable links, and open-ended comments. The system also tracks initial respondents and multiple response sources to audit knowledge gaps. Process-related assessments (Process Stability, Ownership) have been moved to future End-User forms.

### Feature Specifications

- **TFA Survey**: Collects responses to 21 questions across 4 technical sections (System Environment: 6q, Data Quality: 5q, Integration Feasibility: 6q, Security/Compliance: 4q), detects "Don't Know" answers, and collects "gap metadata" (why the question couldn't be answered, who might know).
- **Gap Resolution**: Consultants can fill knowledge gaps, with an audit trail of who provided the information and why.
- **TFA Analysis**: Provides auto-updating scores, assessment notes, visual analytics (radar and pie charts), a 5-tier feasibility interpretation with recommendations, and a data-driven Executive Summary. The Executive Summary includes Critical Technical Gaps (questions scoring 1-2, impact-sorted using formula: (5 - score) × section_weight), Key Strengths (top questions scoring 5), and an Implementation Roadmap with score-specific recommendations pulled directly from question responses.
- **Question-Level Analysis**: Collapsible detailed view showing individual question responses with score-specific recommendations (105 total: 21 questions × 5 score levels). Features include: text search, section filter (4 technical categories), score filter (Critical 1-2, Weak 3, Moderate 4, Strong 5), automatic exclusion of "Don't Know" responses, respondent attribution, and actionable mitigation strategies for each answer. Shows answered questions even when knowledge gaps exist; full analysis (charts, executive summary) unlocks when all gaps are resolved.
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