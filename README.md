# Athenia Diagnostic Platform

Athenia is a full-stack platform for consultants assessing where AI-assisted automation may fit within an organization's workflows. It brings technical feasibility, operational readiness, and business impact into one workflow—from initial assessment through prioritized opportunities and an executive report.

The platform is designed for human-led discovery and decision support. Its scoring is based on documented rules; it does not make autonomous decisions about what work should be automated.

## What it does

1. **Organizes client work** — Create companies, workflows, and the individual steps that make up each workflow.
2. **Collects technical evidence** — Use a structured Technical Feasibility Assessment (TFA) to record technical conditions, scores, and knowledge gaps.
3. **Collects operational insight** — Share Process Insight Forms (PIFs) with process participants to gather information about process clarity, change magnitude, workflow brittleness, and ROI inputs. TFA and PIF forms are available in English and Spanish.
4. **Calculates step-level readiness** — Combines technical feasibility (60%) and operational readiness (40%), with a component breakdown, feasibility band, and data-driven SWOT analysis.
5. **Models and prioritizes opportunities** — Estimate benefits, costs, ramp-up, payback, time savings, error reduction, and revenue impact. Compare opportunities in an impact-versus-effort matrix, and group related opportunities into consolidation packages.
6. **Creates client deliverables** — Generate branded Executive Diagnostic Reports as Word documents in English or Spanish.

### Typical workflow

Create a company → define its workflows and steps → complete TFA and PIF assessments → review readiness and gaps → model and prioritize opportunities → generate an executive report.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, Wouter, TanStack Query |
| UI | Tailwind CSS, Radix UI, shadcn/ui components, Recharts |
| Backend | Node.js, Express, TypeScript |
| Data | PostgreSQL, Drizzle ORM, Neon serverless driver |
| Validation | Zod, React Hook Form |
| Reports | `docx` |

## Project structure

```text
client/                 React application and UI
  src/pages/            Dashboard, company, workflow, step, and survey pages
  src/components/       Assessment, scoring, opportunity, and shared UI components
server/                 Express API, persistence, scoring/report support
shared/                 Database schema, question sets, and scoring calculations
drizzle.config.ts       Drizzle database configuration
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- A PostgreSQL database and its connection string

### Install and configure

```bash
# Replace YOUR_USERNAME and YOUR_REPOSITORY with your GitHub details
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
npm install
```

Set `DATABASE_URL` in your shell or development environment. For example:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

In PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

Use the connection string supplied by your PostgreSQL provider, including any SSL options it requires. Never commit a real connection string or password.

For a new database, create or synchronize the tables from the shared Drizzle schema:

```bash
npm run db:push
```

Review any schema-change prompt before accepting it. In particular, do not choose an option that truncates a table unless you intend to delete its data and have a backup.

### Run locally

```bash
npm run dev
```

The development server serves the frontend and API together, on port `5000` by default.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run check` | Run the TypeScript compiler |
| `npm run build` | Build the frontend and production server bundle |
| `npm start` | Start the production server after building |
| `npm run db:push` | Synchronize the Drizzle schema to the configured database |

## API overview

The Express API provides endpoints for:

- Company, workflow, and workflow-step management
- TFA and PIF questions, shareable assessment links, and submissions
- Readiness and assessment data
- Business-impact records, implementation opportunities, and consolidations
- Executive Diagnostic Report generation

The API is implemented in `server/routes.ts`; database entities and validation schemas are defined in `shared/schema.ts`.

## Database and deployment notes

- The application requires a PostgreSQL connection through `DATABASE_URL`.
- On Replit, use the project's managed PostgreSQL database or intentionally configure an external database. A legacy `DATABASE_URL` can override the managed connection.
- The server uses `PORT` when provided and otherwise defaults to `5000`.
- `npm run db:push` changes the database schema. Back up important data and review prompts before applying changes to an existing database.

## Security and current scope

This repository does not currently include authentication or authorization for the consultant dashboard and API. Treat it as a portfolio/demo project, use synthetic data, and do not enter confidential client information until access controls and deployment security are added.

## License

`package.json` currently declares the MIT license, but this repository does not yet include a `LICENSE` file. Confirm the intended license and add the corresponding license text and copyright holder before distributing the code.
