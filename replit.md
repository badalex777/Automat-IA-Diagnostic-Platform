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
- In-memory storage layer (MemStorage) as development placeholder
- Interface-based storage abstraction (IStorage) for easy database integration
- Basic user schema established; workflow/assessment schemas to be implemented

**API Design**
- RESTful API pattern with /api prefix for all backend routes
- JSON request/response format
- Express middleware for request logging, error handling, and CORS
- Session management ready via connect-pg-simple (PostgreSQL session store)

### Data Model (To Be Implemented)

**Core Entities**
1. **Companies** - Client organizations with industry and contact information
2. **Workflows** - Specific business processes within companies requiring AI assessment
3. **TFA Assessments** - Technical Feasibility Assessment with weighted scoring across categories:
   - System Environment (deployment, APIs, data access)
   - Data Quality (availability, structure, volume)
   - Integration capabilities
   - Security & compliance requirements
   - Process stability
   - Stakeholder ownership
4. **Readiness Rubrics** - Implementation readiness evaluation
5. **Business Impact** - ROI calculations (time savings, FTE equivalents, annual benefits, payback period)

**Scoring System**
- Weighted section scoring (1-5 scale) aggregated to overall feasibility score
- Feasibility bands: High (75+), Moderate (50-74), Low (<50)
- Business impact matrix: Impact vs. Effort visualization

### External Dependencies

**Database & Infrastructure**
- Neon Serverless PostgreSQL - Cloud database with connection pooling and WebSocket support
- Database provisioned via DATABASE_URL environment variable
- Drizzle Kit for schema migrations and database push operations

**UI Component Libraries**
- @radix-ui/* - 20+ accessible component primitives (dialogs, dropdowns, tabs, etc.)
- recharts - Charting library for opportunity matrix scatter plots and data visualization
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