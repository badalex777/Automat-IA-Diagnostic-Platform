# Automat-IA Platform Handbook

## Overview

The Automat-IA Diagnostic Platform is a professional web application designed for consultants to manage AI implementation diagnostics for client companies. It specializes in Phase-1 diagnostics by assessing workflows at a granular, step-level.

## Core Concepts

### Step-Level Assessment Architecture

The platform operates on a **step-level foundation**, where all assessments, readiness scores, SWOT analyses, and opportunities are primarily managed at the individual process step level. This granular approach enables:

- Precise identification of automation opportunities
- Accurate readiness assessment for each process step
- Targeted risk analysis and mitigation strategies
- Clear ROI attribution to specific workflow components

### Implementation Opportunities

**Individual Opportunities** represent standalone automation projects targeting specific workflow steps. Each opportunity includes:

- Business Impact calculation (ROI-based and FTE savings)
- Implementation Effort assessment
- Readiness score from combined TFA (60%) and PIF (40%) assessments
- SWOT analysis at the step level
- ROI metrics including payback period and cumulative benefits

### Workflow Consolidations: Strategic Platform Approach

**Why Consolidations Matter:**

When multiple opportunities exist within the same workflow, implementing them as isolated projects can lead to:
- **Integration challenges**: Disconnected tools that don't communicate
- **User friction**: Multiple interfaces and training requirements
- **Missed synergies**: Lost opportunities for shared infrastructure
- **Higher long-term costs**: Redundant maintenance and support

**Consolidations** bundle multiple step-level opportunities into unified strategic platforms, providing:

✅ **Coordinated Implementation**: Single integrated solution across multiple process steps
✅ **Enhanced User Experience**: One cohesive interface instead of multiple point solutions
✅ **Economies of Scale**: Shared infrastructure, training, and maintenance
✅ **Strategic Value**: Comprehensive workflow transformation vs. piecemeal improvements
✅ **Reduced Risk**: Coordinated change management and governance

**When to Consolidate Opportunities:**

Consider creating a consolidation when:

1. **Workflow Cohesion**: Multiple opportunities belong to the same workflow or tightly coupled process
   - Example: Lead qualification, proposal generation, and contract review in a sales process

2. **Shared Technology Stack**: Opportunities would benefit from the same underlying platform
   - Example: Multiple document processing steps could use a single AI document platform

3. **User Overlap**: The same team or roles interact with multiple opportunity areas
   - Example: Support agents handling ticket triage, response drafting, and escalation

4. **Sequential Dependencies**: Process steps flow directly into one another
   - Example: Data extraction → validation → entry → reconciliation in invoice processing

5. **Scale Threshold**: Combined impact justifies platform investment
   - Guideline: 3+ opportunities with combined Business Impact >80 (Enhanced) or >60 (Base)

6. **Strategic Bet**: Executive commitment to comprehensive workflow transformation
   - Example: Complete automation of a mission-critical business process

**When NOT to Consolidate:**

Avoid consolidation when:
- Opportunities span unrelated workflows with different ownership
- Technologies or vendors are fundamentally incompatible
- Organizational readiness varies significantly across opportunities
- Quick wins are needed (individual opportunities can be delivered faster)
- Political/organizational barriers prevent coordinated implementation

**Consolidation Calculation Logic:**

Consolidations use distinct calculations that reflect coordination complexity:

- **Business Impact**: Aggregates constituent ROI and FTE benefits (may include coordination efficiency gains in enhanced mode)
- **Payback Period**: Weighted average with 20% coordination buffer to account for integration complexity
- **Readiness Score**: FTE-weighted average of constituent readiness scores (defaults to 50 if no FTE data)
- **Implementation Effort**: Includes 15% integration overhead on rampup and training, plus 20% coordination buffer on payback

This approach provides realistic estimates that account for the additional complexity of coordinated implementations while highlighting the strategic value of platform approaches.

## Opportunity Matrix

### Base Impact Matrix

**Purpose**: Fair comparison of opportunities using only ROI and time savings metrics.

**Calculation**: 
- Business Impact (0-100 scale): 60% ROI Score + 40% FTE Savings Score
- No enhancement bonuses for error reduction or revenue growth
- Pure baseline comparison for conservative planning

**When to Use**: Initial assessment, budget-constrained scenarios, risk-averse stakeholders.

### Enhanced Impact Matrix

**Purpose**: Full-capability view including error reduction and revenue growth benefits.

**Calculation**:
- Business Impact (0-150 scale): Base score (ROI 60% + FTE 40%) + Error Reduction Bonus (0-25) + Revenue Growth Bonus (0-25)
- Reveals complete value proposition including quality improvements and revenue opportunities
- Supports strategic investment justification

**When to Use**: Executive presentations, strategic planning, comprehensive ROI analysis.

### Unified Filtering System

The Opportunity Matrix includes a sophisticated filtering system that works consistently across both Base and Enhanced Impact views:

**Matrix Filter (3 options)**:
- **Combined**: Display both individual opportunities AND consolidations on the same scatter plot
- **Opportunities Only**: Show only individual opportunities (hides consolidations)
- **Consolidations Only**: Show only strategic consolidation packages (hides individual opportunities)

**Table Filter (2 options)**:
- **Opportunities Only**: List individual opportunities in the data table
- **Consolidations Only**: List consolidation packages with expand/collapse to view constituents

**Sync Behavior**:

The matrix and table filters use **one-way synchronization**:

1. **Matrix → Table Sync**: When matrix filter changes to "Opportunities Only" or "Consolidations Only", the table automatically updates to match
2. **Combined Mode Independence**: When matrix filter is set to "Combined", the table filter remains independent and can be changed freely
3. **Table Independence**: User can always manually change the table filter without affecting the matrix

**Why This Matters**: This design supports two common workflows:
- **Focused Analysis**: Filter both matrix and table to one type (auto-synced)
- **Comprehensive View**: Matrix shows everything (Combined), table filters to specific type for detailed review

### Roadmap Priority Sorting

All opportunity tables use **roadmap priority sorting** exclusively:

**Formula**: `(Business Impact / Max Impact) - (Implementation Effort / Max Effort)`

This scoring automatically identifies:
- **Quick Wins**: High impact, low effort (top priority)
- **Strategic Bets**: High impact, high effort (secondary priority)  
- **Nice-to-Have**: Low impact, low effort (later consideration)
- **Deprioritize**: Low impact, high effort (avoid)

The 18-month roadmap recommendation prioritizes quick wins for immediate action, followed by strategic implementations for long-term transformation.

## Visual Distinction

**Individual Opportunities**: Standard sized dots (radius 5) with workflow-specific colors

**Consolidations**: Larger dots (radius 9) with contrasting border to emphasize strategic nature
- Base Impact Matrix: Larger circle with foreground-colored border
- Enhanced Impact Matrix: Same visual treatment for consistency

## Executive Diagnostic Report (EDR)

The EDR generates a comprehensive .docx document that aggregates:
- Executive summary with company overview and diagnostic findings
- Methodology explanation (TFA workflow-level + PIF step-level assessments)
- Consolidated SWOT analysis from all step-level assessments
- Implementation roadmap with both individual and consolidated opportunities
- Detailed technical appendices

**Consolidation Integration**: The EDR now includes:
- Consolidation packages in the implementation roadmap section
- Strategic rationale for bundled opportunities
- Comparative analysis of tactical (individual) vs. strategic (consolidated) approaches
- Both Base and Enhanced impact scenarios for investment planning

## Best Practices

### For Consultants

1. **Start Granular**: Complete step-level TFA and PIF assessments first
2. **Identify Patterns**: Look for natural opportunity groupings within workflows
3. **Evaluate Consolidation**: Apply decision criteria to determine if platform approach adds value
4. **Present Both Options**: Show client both tactical (individual) and strategic (consolidated) scenarios
5. **Use Appropriate Matrix**: Base for conservative estimates, Enhanced for complete value proposition
6. **Filter Strategically**: Use view filters to focus client discussions on specific opportunity types

### For Implementation Planning

1. **Quick Wins First**: Use roadmap priority to identify immediate-value opportunities
2. **Build Momentum**: Demonstrate ROI with quick wins before tackling strategic consolidations
3. **Coordinate Platforms**: When consolidating, plan for integration overhead and change management
4. **Monitor Readiness**: Track step-level readiness scores to ensure implementation success
5. **Iterate Assessments**: Update TFA/PIF data as organizational readiness evolves

---

**Document Version**: 1.0 (November 2025)
**Platform**: Automat-IA Diagnostic Platform
