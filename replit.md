# Automat-IA Diagnostic Platform

## Overview

The Automat-IA Diagnostic Platform is a professional data management web application designed to help consultants manage AI implementation diagnostics for client companies. The platform enables Phase-1 diagnostics per project (company) and workflow, facilitating Technical Feasibility Assessments (TFA), Readiness Rubrics, and Business Impact calculations to determine ROI and implementation viability.

The application follows a hierarchical data structure: Companies → Workflows → Assessments (TFA/Readiness/Impact), providing a streamlined interface for managing multiple diagnostic projects and generating shareable assessment links for technical contacts.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18+ with TypeScript for type-safe component development
- Wouter for lightweight client-side routing
- Single Page Application (SPA) architecture with route-based code organization

**UI Component System**
- Radix UI primitives for accessible, unstyled components
- Shadcn/ui design system (New York variant) for consistent component styling
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for variant-based component APIs
- Dark mode by default with light mode support via ThemeProvider context

**State Management**
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks for UI-specific state
- No global state management library - leverages React Query's caching layer

**Design System**
- Professional, data-focused aesthetic inspired by Linear and Notion
- Custom HSL-based color system with semantic tokens (background, foreground, muted, accent, destructive)
- Typography: Inter for UI/body, JetBrains Mono for data/metrics display
- Consistent elevation system using hover/active states (elevate-1, elevate-2)
- Border radius tokens: lg (9px), md (6px), sm (3px)

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- TypeScript throughout for type safety across client and server
- ESM modules for modern JavaScript syntax
- Vite integration for development with HMR and production builds

**Data Storage Strategy**
- PostgreSQL database via Neon serverless (configured for connection pooling)
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with automatic TypeScript type generation
- Zod integration for runtime validation via drizzle-zod

**Current Implementation**
- PostgreSQL database with Drizzle ORM (fully migrated from in-memory storage)
- Database storage layer (DBStorage) with complete CRUD operations
- All schemas implemented: Companies, Workflows, TFA Assessments, Business Impact
- Shareable link system with nanoid-generated unique identifiers

**API Design**
- RESTful API pattern with /api prefix for all backend routes
- JSON request/response format
- Express middleware for request logging, error handling, and CORS
- Session management ready via connect-pg-simple (PostgreSQL session store)

### Data Model (Implemented)

**Core Entities**
1. **Companies** - Client organizations with industry and contact information
2. **Workflows** - Specific business processes within companies requiring AI assessment
   - Status tracking: tfa_only → tfa_readiness → readiness_impact → complete
3. **TFA Assessments** - Technical Feasibility Assessment with weighted scoring across 6 categories:
   - System Environment (20%) - deployment, APIs, data access  
   - Data Quality (25%) - availability, structure, volume
   - Integration Feasibility (25%) - system compatibility, authentication
   - Security/Compliance (15%) - data sensitivity, compliance requirements
   - Process Stability (10%) - change frequency, documentation
   - Ownership (5%) - business sponsorship, technical ownership
4. **Readiness Rubrics** - Implementation readiness evaluation (To Be Implemented)
5. **Business Impact** - ROI calculations (time savings, FTE equivalents, annual benefits, payback period)

**TFA Scoring System**
- 24 questions with weighted scoring (1-5 scale) across 6 sections
- Automated score calculation: weighted average normalized to 0-100
- Feasibility bands: Very High (>90), High (80-90), Moderate (60-80), Low (40-60), Very Low (<40)
- Shareable link system for external respondents to complete assessments
- Open-ended comments field for qualitative feedback
- "Don't Know" responses (value 0, score null) excluded from calculations

### External Dependencies

**Database & Infrastructure**
- Neon Serverless PostgreSQL - Cloud database with connection pooling and WebSocket support
- Database provisioned via DATABASE_URL environment variable
- Drizzle Kit for schema migrations and database push operations

**UI Component Libraries**
- @radix-ui/* - 20+ accessible component primitives (dialogs, dropdowns, tabs, etc.)
- recharts - Charting library for radar charts, pie charts, and data visualization
- embla-carousel - Touch-friendly carousel component
- cmdk - Command palette component
- date-fns - Date manipulation and formatting
- lucide-react - Icon library

**Form Handling & Validation**
- React Hook Form - Form state management with performance optimization
- @hookform/resolvers - Validation resolver integration
- Zod - Schema validation library integrated with Drizzle and form validation

**Development Tools**
- Vite - Build tool and dev server with HMR
- @replit/vite-plugin-* - Replit-specific development plugins (error overlay, cartographer, dev banner)
- TypeScript compiler for type checking
- ESBuild for production server bundling

**Styling Infrastructure**
- Tailwind CSS - Utility-first CSS framework
- PostCSS with Autoprefixer - CSS processing
- clsx & tailwind-merge - Conditional class name utilities

**Key Configuration Files**
- `drizzle.config.ts` - Database connection and migration settings
- `vite.config.ts` - Build configuration with path aliases (@, @shared, @assets)
- `tailwind.config.ts` - Design system tokens and theme configuration
- `components.json` - Shadcn/ui configuration for component generation

## Recent Changes (Last Updated: 2025-10-10)

### Completed Features

**TFA Expansion to 24 Questions (2025-10-10)**
- ✅ **Expanded Question Set**: Increased from 16 to 24 questions across all sections:
  - System Environment (20%): 3 → 5 questions (added performance monitoring, system monitoring)
  - Data Quality (25%): 3 → 5 questions (added data consistency, validation processes)
  - Integration Feasibility (25%): 3 → 5 questions (added rate limit handling, error handling)
  - Security/Compliance (15%): 3 → 4 questions (added data retention policies)
  - Process Stability (10%): 2 → 3 questions (added exception handling documentation)
  - Ownership (5%): 2 questions (unchanged)
- ✅ **Weight Rebalancing**: Maintained aggregate weight targets (20/25/25/15/10/5) with balanced distribution within sections
- ✅ **Bug Fixes**:
  - Fixed comments persistence: `completeTFA()` now correctly accepts and saves comments parameter
  - Fixed assessment retrieval: `getTFAByWorkflowId()` now returns most recently completed assessment using `ORDER BY completedAt DESC NULLS LAST`
  - Prevents stale assessments from displaying when multiple shareable links are regenerated
- ✅ **End-to-End Testing**: All 24 questions, scoring, weighted prioritization, radar charts, and comments verified working
- ✅ **Action Plan Fix**: Corrected logic for high-scoring TFAs - action plans now focus on implementation readiness instead of incorrectly treating TFA diagnostic criteria (Data Quality, Integration Feasibility, etc.) as automation targets. When scores are high, first action is: "Engage development team to begin detailed automation analysis and solution architecture"

**Enhanced TFA Layer 1 Analysis System (Fully Implemented)**
- ✅ **Auto-refresh mechanism**: TFA scores update automatically when returning to WorkflowDetail tab via `refetchOnWindowFocus: true`
- ✅ **Assessment Notes display**: Open-ended comments from TFA submissions shown in dedicated card
- ✅ **Visual Analytics**: 
  - Radar chart showing section score profile (0-5 scale)
  - Pie chart displaying weight distribution across sections
  - Tabbed interface for clean presentation using Recharts
- ✅ **Enhanced Score Interpretation**: 5-tier feasibility system with icons, descriptions, and recommendations
  - Very High (>90%): Ready for immediate implementation
  - High (80-90%): Strong feasibility, minor preparation needed
  - Moderate (60-80%): Viable with 2-4 weeks prep
  - Low (40-60%): Significant challenges, 4-8 weeks remediation
  - Very Low (<40%): Not recommended, 3-6 months foundational work
- ✅ **Detailed Weakness Analysis**:
  - Priority ranking (Critical <1.5, High 1.5-2.0, Medium 2.0-2.5)
  - Root cause identification per weakness type
  - 4-5 specific mitigation strategies per weak section
  - Effort estimation (Critical: 4-8w, High: 2-4w, Medium: 1-2w)
  - Automated total remediation timeline calculation
- ✅ **Layer 1 Executive Summary**:
  - Go/No-Go recommendation engine with decision logic
  - Key findings dashboard (Strengths vs Risk Factors)
  - Prioritized action plans (3-4 steps) based on recommendation
  - Timeline estimates including remediation effort
  - Balance metrics and consistency analysis

**Previous TFA Features**
- ✅ Complete backend API with CRUD operations for companies, workflows, TFA assessments, and business impact
- ✅ Database integration with PostgreSQL and Drizzle ORM
- ✅ Shareable link system for external respondents
- ✅ Automated TFA scoring: 24 questions across 6 weighted sections → normalized 0-100 score
- ✅ Frontend pages: Dashboard, CompanyDetail, WorkflowDetail, TFAForm with full React Query integration
- ✅ Search/filter functionality for companies and workflows
- ✅ Delete functionality with confirmation dialogs and cache invalidation
- ✅ TFA form enhancements: workflow description, disclaimers, Previous/Next navigation, auto-scroll, comments field
- ✅ Thank you confirmation page after TFA submission

### Pending Implementation

**Readiness Rubric Module**
- [ ] Schema definition for readiness assessment
- [ ] Backend API routes for readiness CRUD
- [ ] Frontend UI for readiness rubric evaluation
- [ ] Integration with workflow status progression

**Business Impact Enhancements**
- [ ] Opportunity matrix visualization (scatter plot)
- [ ] Per-company aggregated view of all workflows
- [ ] ROI calculation refinements

**Additional Features**
- [ ] Company reordering with drag-and-drop or manual sort controls
