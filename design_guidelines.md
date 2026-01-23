# Design Guidelines: Athenia Diagnostic Webapp

## Design Approach: Professional Data Management System

**Selected Approach:** Design System (Linear + Notion inspired)

**Justification:** This is a utility-focused, data-intensive business application requiring clarity, efficiency, and professional presentation of complex information. Drawing from Linear's clean interface patterns and Notion's data organization principles to create a sophisticated diagnostic management system.

**Core Principles:**
- Clarity over decoration - every element serves a functional purpose
- Consistent data hierarchy across all views
- Professional credibility through refined typography and spacing
- Efficient workflows with minimal cognitive load

## Core Design Elements

### A. Color Palette

**Dark Mode Primary (Default):**
- Background: 220 20% 12% (deep slate)
- Surface: 220 18% 16% (elevated panels)
- Surface Hover: 220 16% 20% (interactive states)
- Border: 220 15% 25% (subtle dividers)
- Text Primary: 220 10% 95% (high contrast)
- Text Secondary: 220 8% 70% (supporting text)
- Text Muted: 220 8% 50% (metadata)

**Accent Colors:**
- Primary Action: 217 91% 60% (professional blue)
- Success/Complete: 142 76% 45% (workflow complete states)
- Warning/Pending: 38 92% 50% (in-progress indicators)
- Error/Low Score: 0 84% 60% (low feasibility alerts)

**Light Mode:**
- Background: 220 20% 98%
- Surface: 0 0% 100%
- Text Primary: 220 20% 15%
- (Accent colors remain consistent)

### B. Typography

**Font Families:**
- Primary: Inter (via Google Fonts CDN) - body text, UI elements
- Mono: JetBrains Mono (via Google Fonts CDN) - scores, metrics, data fields

**Type Scale:**
- Headings: font-semibold text-xl to text-3xl (page titles, section headers)
- Body: font-normal text-sm to text-base (forms, descriptions, lists)
- Labels: font-medium text-xs uppercase tracking-wide (form labels, metadata)
- Data: font-mono text-base (scores, percentages, calculations)

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section spacing: space-y-6 or space-y-8
- Form field gaps: gap-4
- Card margins: m-4 between items

**Grid System:**
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Workflow lists: Single column with clear hierarchy
- Opportunity Matrix: Full-width responsive canvas

**Containers:**
- Max width: max-w-7xl mx-auto
- Form containers: max-w-3xl
- Matrix view: w-full with constrained inner content

### D. Component Library

**Navigation:**
- Top navigation bar with company switcher dropdown
- Breadcrumb trail showing: Companies → [Company Name] → Workflows → [Workflow Name]
- Tab navigation for multi-step forms (TFA, Readiness, Business Impact)

**Data Display:**
- Company cards with status indicators and quick metrics
- Workflow list items showing completion badges (TFA / TFA+Readiness / Complete)
- Metric cards with large mono numbers and descriptive labels
- Score badges with color coding (Low/Moderate/High feasibility)

**Forms:**
- Clean single-column layouts with generous whitespace
- Radio button groups with visual distinction between selected/unselected
- Number inputs with clear labels and helper text
- Multi-step forms with progress indicator (Step 1 of 3 visual bar)
- Shareable link generator with copy-to-clipboard functionality

**Opportunity Matrix:**
- 2D scatter plot with quadrant lines (dividing Business Impact and Effort axes)
- Workflow cards as draggable/clickable elements positioned by metrics
- Axis labels: Business Impact (Annual Benefits + ROI%) → Effort (TFA Score inverted)
- Quadrant labels: Quick Wins / Strategic Projects / Fill-Ins / Deprioritize
- Hover states showing full workflow details in tooltip
- Color coding by completion status or priority level

**Status Indicators:**
- Completion badges: outlined pills with icon + text
- TFA score display: large circular progress indicator with percentage
- Workflow state: color-coded tags (gray/yellow/green for progress stages)

**Interactive Elements:**
- Primary buttons: solid fill with blue accent, medium rounded corners
- Secondary buttons: outline style with subtle hover states
- Icon buttons for actions (edit, delete, copy link) with tooltip labels
- Dropdown menus with search for company selection

### E. Specific View Designs

**Dashboard View:**
- Header with "All Companies" title and "Add Company" button (top-right)
- Company grid showing cards with: name, industry, workflow count, completion metrics
- Each card links to company detail view

**Company Detail View:**
- Company header with name, metadata, and "Add Workflow" button
- Tabs: Workflows List / Opportunity Matrix
- Workflow list with table-like structure: Name | Status | TFA Score | Business Impact | Actions
- Opportunity Matrix tab showing full scatter plot visualization

**TFA Form View:**
- Clean questionnaire layout with section headers for 6 categories
- Radio buttons for 1-5 scale responses with descriptive labels
- Weight indicators showing question importance (small badge showing %)
- Real-time score calculation display in sticky sidebar
- Submit button becomes active only when all required fields completed

**Business Impact Input:**
- Simple form with numeric inputs for: Hours Saved, FTE, Annual Benefits, ROI%, Payback Period
- Help text explaining each metric
- Calculation summary panel showing how data will position workflow in matrix

**Shareable Link Interface:**
- URL display with pre-filled parameters visible
- One-click copy button with confirmation toast
- QR code generation option for mobile access
- Link expiration settings (optional enhancement)

## Images

No hero images required - this is a data-focused utility application. All visual interest comes from clean UI design, data visualization, and the interactive Opportunity Matrix scatter plot. Use icons from Heroicons for navigation, actions, and status indicators throughout.

## Key UX Patterns

- Auto-save for long forms with visible save indicator
- Breadcrumb navigation for deep hierarchy navigation
- Inline editing for quick updates without page transitions
- Confirmation modals for destructive actions (delete workflow/company)
- Loading states with skeleton screens for data-heavy views
- Empty states with clear CTAs when no data exists ("No workflows yet - Create your first workflow")