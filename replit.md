### Overview

The Automat-IA Diagnostic Platform is a professional web application designed for consultants to manage AI implementation diagnostics for client companies. It specializes in Phase-1 diagnostics by assessing workflows at a granular, step-level, using Technical Feasibility Assessments (TFA) and Process Insight Forms (PIF). The platform generates step-specific readiness scores, SWOT analyses, and identifies implementation opportunities, culminating in comprehensive Executive Diagnostic Reports. Its vision is to provide consultants with detailed insights for AI adoption, enabling precise project scoping and impact measurement.

### Recent Changes

**November 18, 2025 - Comprehensive EDR Line Break and Formatting Fix**
- **Framework Name Detector**: Tightened `isFrameworkName()` to only trigger on standalone headings (colon + ≤20 chars), preventing false matches on mid-sentence framework mentions like "TFA: Completed by IT and system owners..."
- **List Processing**: Implemented multi-line accumulation for numbered lists and bullet points. List items now properly accumulate continuation lines until a blank line, new list marker, or special heading is encountered
- **List Numbering**: Added proper `resetListContext()` calls after all special headings to prevent numbering carryover between distinct lists
- **Next Steps Format**: Changed from numbered list format to inline bold format ("**Step Name:** Description") for cleaner presentation
- **Alignment**: All paragraphs use `AlignmentType.BOTH` (justified) for professional document appearance
- **Impact**: Eliminates all mid-sentence line breaks in Appendix A, Phase 10, bullet points, and throughout the EDR
- **Files Modified**: `server/reportGenerator.ts` - `createTextParagraphs()` function and Conclusions section

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
- **Opportunity Matrix**: A 2D scatter plot visualizing implementation opportunities by Business Impact and Implementation Effort.
- **Executive Diagnostic Report**: Generates comprehensive, branded .docx documents with executive summaries, methodology, findings, roadmaps, and technical appendices.
- **Workflow-Level Consolidation System**: Bundles multiple step-level opportunities into strategic consolidation packages with distinct calculation logic for business impact, payback period, readiness score, and implementation effort. These are visually differentiated on the Opportunity Matrix and detailed in the EDR.

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