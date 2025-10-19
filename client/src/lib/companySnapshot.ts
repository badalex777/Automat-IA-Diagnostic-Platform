import { translations } from "./translations";
import { calculateAggregatedPIFScores, calculateReadinessRubric } from "@shared/pifCalculations";
import { calculateImplementationEffort, calculateBusinessImpact, type CompanyContext } from "@shared/opportunityCalculations";
import type { Company, Workflow, TFAAssessment, PIFResponse, ImplementationOpportunity } from "@shared/schema";

interface WorkflowSnapshotData {
  workflow: Workflow;
  tfa: TFAAssessment | null;
  pifResponses: PIFResponse[];
  opportunities: ImplementationOpportunity[];
}

/**
 * Generate a comprehensive company snapshot document in HTML format
 * @param companyId - The ID of the company
 * @param language - The language for the snapshot ('en' or 'es')
 * @returns HTML string of the complete snapshot document
 */
export async function generateCompanySnapshot(
  companyId: string,
  language: 'en' | 'es' = 'en'
): Promise<string> {
  const t = translations[language];

  // Fetch all data in parallel
  const [companyRes, workflowsRes] = await Promise.all([
    fetch(`/api/companies/${companyId}`),
    fetch(`/api/companies/${companyId}/workflows`)
  ]);

  if (!companyRes.ok || !workflowsRes.ok) {
    throw new Error('Failed to fetch company data');
  }

  const company: Company = await companyRes.json();
  const workflows: Workflow[] = await workflowsRes.json();

  // Fetch TFA, PIF, and opportunities for each workflow
  const workflowData: WorkflowSnapshotData[] = await Promise.all(
    workflows.map(async (workflow) => {
      const [tfaRes, pifRes, oppRes] = await Promise.all([
        fetch(`/api/workflows/${workflow.id}/tfa`),
        fetch(`/api/workflows/${workflow.id}/pif`),
        fetch(`/api/workflows/${workflow.id}/opportunities`)
      ]);

      const tfa = tfaRes.ok ? await tfaRes.json() : null;
      const pifResponses = pifRes.ok ? await pifRes.json() : [];
      const opportunities = oppRes.ok ? await oppRes.json() : [];

      return {
        workflow,
        tfa,
        pifResponses: Array.isArray(pifResponses) ? pifResponses : [],
        opportunities: Array.isArray(opportunities) ? opportunities : []
      };
    })
  );

  // Generate HTML document
  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.companySnapshot.header.companySnapshot} - ${company.name}</title>
  <style>
    ${getSnapshotStyles()}
  </style>
</head>
<body>
  ${generateHeader(company, t, language)}
  ${generateWorkflowSections(workflowData, company, t, language)}
  ${generateCalculationTransparency(t)}
</body>
</html>
  `;

  return html.trim();
}

function getSnapshotStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      padding: 40px;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 24px;
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 12px;
    }

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin-top: 48px;
      margin-bottom: 20px;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
      margin-top: 32px;
      margin-bottom: 16px;
      color: #334155;
      page-break-after: avoid;
    }

    h4 {
      font-size: 16px;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #475569;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 12px;
      color: #334155;
    }

    .header {
      margin-bottom: 40px;
    }

    .company-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }

    .workflow-section {
      margin-top: 60px;
      page-break-before: always;
      border-top: 4px solid #e2e8f0;
      padding-top: 32px;
    }

    .workflow-title {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .workflow-description {
      font-size: 16px;
      color: #64748b;
      margin-bottom: 32px;
      font-style: italic;
    }

    .subsection {
      margin-top: 32px;
      padding: 24px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      page-break-inside: avoid;
    }

    .subsection-title {
      font-size: 20px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }

    .score-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 18px;
      margin: 8px 0;
    }

    .feasibility-very-high {
      background: #10b981;
      color: white;
    }

    .feasibility-high {
      background: #3b82f6;
      color: white;
    }

    .feasibility-moderate {
      background: #f59e0b;
      color: white;
    }

    .feasibility-low {
      background: #ef4444;
      color: white;
    }

    .feasibility-very-low {
      background: #dc2626;
      color: white;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }

    .data-table th {
      background: #f1f5f9;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #cbd5e1;
    }

    .data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }

    .data-table tr:hover {
      background: #f8fafc;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }

    .metric-card {
      padding: 16px;
      background: #f8fafc;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }

    .metric-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
    }

    .metric-range {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }

    .insights-list {
      list-style: none;
      margin: 16px 0;
    }

    .insights-list li {
      padding: 12px;
      margin-bottom: 8px;
      background: #f8fafc;
      border-left: 3px solid #8b5cf6;
      border-radius: 4px;
      color: #475569;
      font-style: italic;
    }

    .component-breakdown {
      margin: 20px 0;
    }

    .component-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      margin-bottom: 8px;
      background: #f8fafc;
      border-radius: 4px;
      border-left: 3px solid #6366f1;
    }

    .component-name {
      font-weight: 500;
      color: #334155;
    }

    .component-score {
      font-weight: 700;
      font-size: 18px;
      color: #0f172a;
    }

    .swot-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin: 20px 0;
    }

    .swot-card {
      padding: 16px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }

    .swot-card.strengths {
      border-left: 4px solid #10b981;
      background: #f0fdf4;
    }

    .swot-card.weaknesses {
      border-left: 4px solid #ef4444;
      background: #fef2f2;
    }

    .swot-card.opportunities {
      border-left: 4px solid #3b82f6;
      background: #eff6ff;
    }

    .swot-card.threats {
      border-left: 4px solid #f59e0b;
      background: #fffbeb;
    }

    .swot-title {
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      margin-bottom: 12px;
      letter-spacing: 0.5px;
    }

    .swot-card.strengths .swot-title {
      color: #047857;
    }

    .swot-card.weaknesses .swot-title {
      color: #dc2626;
    }

    .swot-card.opportunities .swot-title {
      color: #2563eb;
    }

    .swot-card.threats .swot-title {
      color: #d97706;
    }

    .swot-list {
      list-style: none;
    }

    .swot-list li {
      padding: 6px 0;
      color: #475569;
      font-size: 14px;
    }

    .swot-list li:before {
      content: "• ";
      font-weight: bold;
      margin-right: 8px;
    }

    .opportunity-card {
      padding: 20px;
      margin-bottom: 16px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      border-left: 4px solid #8b5cf6;
    }

    .opportunity-name {
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 8px;
    }

    .opportunity-description {
      color: #64748b;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .opportunity-metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }

    .formula-block {
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      background: #f1f5f9;
      padding: 16px;
      border-radius: 6px;
      border-left: 3px solid #6366f1;
      margin: 16px 0;
      font-size: 14px;
      color: #334155;
      overflow-x: auto;
    }

    .not-available {
      color: #94a3b8;
      font-style: italic;
    }

    .transparency-section {
      margin-top: 80px;
      padding-top: 40px;
      border-top: 4px solid #e2e8f0;
      page-break-before: always;
    }

    .transparency-block {
      margin: 24px 0;
      padding: 20px;
      background: #f8fafc;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
    }

    .transparency-title {
      font-weight: 600;
      font-size: 16px;
      color: #0f172a;
      margin-bottom: 12px;
    }

    .transparency-content {
      color: #475569;
      font-size: 14px;
      line-height: 1.7;
    }

    @media print {
      body {
        padding: 20px;
      }

      .workflow-section {
        page-break-before: always;
      }

      .subsection {
        page-break-inside: avoid;
      }
    }
  `;
}

function generateHeader(company: Company, t: any, language: 'en' | 'es'): string {
  const annualRevenue = company.annualRevenue
    ? formatCurrency(Number(company.annualRevenue), language)
    : t.companySnapshot.notAvailable;
  
  const totalEmployees = company.totalEmployees
    ? company.totalEmployees.toLocaleString(language)
    : t.companySnapshot.notAvailable;

  const generationDate = new Date().toLocaleDateString(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <div class="header">
      <h1>${t.companySnapshot.header.companySnapshot}</h1>
      <p style="font-size: 24px; font-weight: 600; color: #3b82f6; margin-bottom: 8px;">${company.name}</p>
      <p style="color: #64748b;">${t.companySnapshot.generatedOn}: ${generationDate}</p>
      
      <div class="company-info">
        <div class="info-item">
          <div class="info-label">${t.companySnapshot.header.financialContext}</div>
          <div class="info-value">${annualRevenue}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.company.totalEmployees}</div>
          <div class="info-value">${totalEmployees}</div>
        </div>
        <div class="info-item">
          <div class="info-label">${t.company.industry}</div>
          <div class="info-value">${company.industry}</div>
        </div>
      </div>
    </div>
  `;
}

function generateWorkflowSections(
  workflowData: WorkflowSnapshotData[],
  company: Company,
  t: any,
  language: 'en' | 'es'
): string {
  return workflowData
    .map((data) => generateWorkflowSection(data, company, t, language))
    .join('\n');
}

function generateWorkflowSection(
  data: WorkflowSnapshotData,
  company: Company,
  t: any,
  language: 'en' | 'es'
): string {
  const { workflow, tfa, pifResponses, opportunities } = data;

  return `
    <div class="workflow-section">
      <div class="workflow-title">${workflow.name}</div>
      ${workflow.description ? `<div class="workflow-description">${workflow.description}</div>` : ''}
      
      ${generateTFASection(tfa, t, language)}
      ${generatePIFSection(pifResponses, t, language)}
      ${generateReadinessSection(tfa, pifResponses, t, language)}
      ${generateOpportunitiesSection(opportunities, tfa, pifResponses, company, t, language)}
    </div>
  `;
}

function generateTFASection(tfa: TFAAssessment | null, t: any, language: 'en' | 'es'): string {
  if (!tfa || !tfa.score) {
    return `
      <div class="subsection">
        <div class="subsection-title">${t.companySnapshot.tfaSection.title}</div>
        <p class="not-available">${t.companySnapshot.notCompleted}</p>
      </div>
    `;
  }

  const feasibilityBand = getFeasibilityBand(tfa.score);
  const bandClass = feasibilityBand.toLowerCase().replace(/\s+/g, '-');
  const bandKey = feasibilityBand.toLowerCase().replace(/\s+/g, '');
  const bandText = t.tfa.feasibilityBands[bandKey as keyof typeof t.tfa.feasibilityBands] || feasibilityBand;

  return `
    <div class="subsection">
      <div class="subsection-title">${t.companySnapshot.tfaSection.title}</div>
      
      <div style="margin: 16px 0;">
        <p><strong>${t.companySnapshot.tfaSection.overallScore}:</strong> <span class="score-badge">${tfa.score}/100</span></p>
        <p><strong>${t.companySnapshot.tfaSection.feasibilityBand}:</strong></p>
        <div class="score-badge feasibility-${bandClass}">${bandText}</div>
      </div>

      ${generateTFAGapsAndStrengths(tfa, t)}
    </div>
  `;
}

function generateTFAGapsAndStrengths(tfa: TFAAssessment, t: any): string {
  // Extract gaps and strengths from TFA responses
  // This is a simplified version - you may want to implement more sophisticated logic
  return `
    <div style="margin-top: 20px;">
      <h4>${t.companySnapshot.tfaSection.criticalGaps}</h4>
      <p class="not-available">${t.companySnapshot.tfaSection.noGapsIdentified}</p>
      
      <h4>${t.companySnapshot.tfaSection.keyStrengths}</h4>
      <p class="not-available">${t.companySnapshot.tfaSection.noStrengthsIdentified}</p>
    </div>
  `;
}

function generatePIFSection(pifResponses: PIFResponse[], t: any, language: 'en' | 'es'): string {
  if (!pifResponses || pifResponses.length === 0) {
    return `
      <div class="subsection">
        <div class="subsection-title">${t.companySnapshot.pifSection.title}</div>
        <p class="not-available">${t.companySnapshot.notCompleted}</p>
      </div>
    `;
  }

  const aggregated = calculateAggregatedPIFScores(pifResponses);
  
  return `
    <div class="subsection">
      <div class="subsection-title">${t.companySnapshot.pifSection.title}</div>
      
      <p><strong>${t.companySnapshot.pifSection.respondents}:</strong> ${aggregated.respondentCount}</p>
      
      <h4>${t.companySnapshot.pifSection.operationalScores}</h4>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">${t.pifScoring.processClarity}</div>
          <div class="metric-value">${aggregated.processClarity.average}/100</div>
          <div class="metric-range">${t.companySnapshot.pifSection.range}: ${aggregated.processClarity.min}-${aggregated.processClarity.max}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${t.pifScoring.changeMagnitude}</div>
          <div class="metric-value">${aggregated.changeMagnitude.average}/100</div>
          <div class="metric-range">${t.companySnapshot.pifSection.range}: ${aggregated.changeMagnitude.min}-${aggregated.changeMagnitude.max}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${t.pifScoring.workflowBrittleness}</div>
          <div class="metric-value">${aggregated.workflowBrittleness.average}/100</div>
          <div class="metric-range">${t.companySnapshot.pifSection.range}: ${aggregated.workflowBrittleness.min}-${aggregated.workflowBrittleness.max}</div>
        </div>
      </div>

      ${generateQualitativeInsights(pifResponses, t)}
    </div>
  `;
}

function generateQualitativeInsights(pifResponses: PIFResponse[], t: any): string {
  // Extract qualitative responses from PIF
  const insights: string[] = [];
  
  pifResponses.forEach(response => {
    if (response.qualitativeResponses) {
      const qual = response.qualitativeResponses as any;
      // Extract representative quotes
      if (qual.Q28) insights.push(qual.Q28);
      if (qual.Q29) insights.push(qual.Q29);
    }
  });

  if (insights.length === 0) {
    return `
      <h4>${t.companySnapshot.pifSection.qualitativeInsights}</h4>
      <p class="not-available">${t.companySnapshot.pifSection.noQualitativeData}</p>
    `;
  }

  return `
    <h4>${t.companySnapshot.pifSection.qualitativeInsights}</h4>
    <ul class="insights-list">
      ${insights.slice(0, 3).map(insight => `<li>"${insight}"</li>`).join('')}
    </ul>
  `;
}

function generateReadinessSection(
  tfa: TFAAssessment | null,
  pifResponses: PIFResponse[],
  t: any,
  language: 'en' | 'es'
): string {
  if (!tfa || !tfa.score || !pifResponses || pifResponses.length === 0) {
    return `
      <div class="subsection">
        <div class="subsection-title">${t.companySnapshot.readinessSection.title}</div>
        <p class="not-available">${t.companySnapshot.readinessSection.requiresData}</p>
      </div>
    `;
  }

  // Calculate readiness rubric
  const aggregatedPIF = calculateAggregatedPIFScores(pifResponses);
  
  // Extract TFA section scores (simplified - you may need actual section calculations)
  const tfaSectionScores = {
    systemEnvironment: tfa.score || 0, // Simplified - should calculate from actual sections
    dataQuality: tfa.score || 0,
    integrationFeasibility: tfa.score || 0,
    securityCompliance: tfa.score || 0
  };

  const readiness = calculateReadinessRubric(tfa.score || 0, tfaSectionScores, aggregatedPIF);

  const feasibilityClass = readiness.feasibilityBand.toLowerCase().replace(/\s+/g, '-');
  const bandKey = readiness.feasibilityBand.toLowerCase().replace(/\s+/g, '');
  const bandText = t.tfa.feasibilityBands[bandKey as keyof typeof t.tfa.feasibilityBands] || readiness.feasibilityBand;

  return `
    <div class="subsection">
      <div class="subsection-title">${t.companySnapshot.readinessSection.title}</div>
      
      <div style="margin: 16px 0;">
        <p><strong>${t.companySnapshot.readinessSection.combinedScore}:</strong> <span class="score-badge">${readiness.totalScore}/100</span></p>
        <p><strong>${t.companySnapshot.readinessSection.feasibilityAssessment}:</strong></p>
        <div class="score-badge feasibility-${feasibilityClass}">${bandText}</div>
      </div>

      <h4>${t.companySnapshot.readinessSection.componentBreakdown}</h4>
      <div class="component-breakdown">
        ${generateComponentItem(t.readinessRubric.dataQuality.split(':')[0], readiness.componentScores.dataQuality, '18%')}
        ${generateComponentItem(t.readinessRubric.integrationFeasibility.split(':')[0], readiness.componentScores.integrationFeasibility, '18%')}
        ${generateComponentItem(t.readinessRubric.systemEnvironment.split(':')[0], readiness.componentScores.systemEnvironment, '15%')}
        ${generateComponentItem(t.readinessRubric.processClarity.split(':')[0], readiness.componentScores.processClarity, '12%')}
        ${generateComponentItem(t.readinessRubric.changeMagnitude.split(':')[0], readiness.componentScores.changeMagnitude, '12%')}
        ${generateComponentItem(t.readinessRubric.securityCompliance.split(':')[0], readiness.componentScores.securityCompliance, '9%')}
        ${generateComponentItem(t.readinessRubric.workflowBrittleness.split(':')[0], readiness.componentScores.workflowBrittleness, '6%')}
      </div>

      ${generateSWOTAnalysis(readiness, t)}
    </div>
  `;
}

function generateComponentItem(name: string, score: number, weight: string): string {
  return `
    <div class="component-item">
      <span class="component-name">${name} (${weight})</span>
      <span class="component-score">${Math.round(score)}/100</span>
    </div>
  `;
}

function generateSWOTAnalysis(readiness: any, t: any): string {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  
  // Identify strengths (components > 75)
  Object.entries(readiness.componentScores).forEach(([key, score]) => {
    if (typeof score === 'number' && score > 75) {
      strengths.push(key);
    } else if (typeof score === 'number' && score < 50) {
      weaknesses.push(key);
    }
  });

  return `
    <h4>${t.companySnapshot.readinessSection.swotAnalysis}</h4>
    <div class="swot-grid">
      <div class="swot-card strengths">
        <div class="swot-title">${t.companySnapshot.readinessSection.strengths}</div>
        <ul class="swot-list">
          ${strengths.length > 0 
            ? strengths.map(s => `<li>${s.replace(/([A-Z])/g, ' $1').trim()}</li>`).join('') 
            : `<li class="not-available">${t.readinessRubric.noStrengthsYet || 'None identified'}</li>`
          }
        </ul>
      </div>
      <div class="swot-card weaknesses">
        <div class="swot-title">${t.companySnapshot.readinessSection.weaknesses}</div>
        <ul class="swot-list">
          ${weaknesses.length > 0 
            ? weaknesses.map(w => `<li>${w.replace(/([A-Z])/g, ' $1').trim()}</li>`).join('') 
            : `<li class="not-available">${t.readinessRubric.noWeaknessesYet || 'None identified'}</li>`
          }
        </ul>
      </div>
      <div class="swot-card opportunities">
        <div class="swot-title">${t.companySnapshot.readinessSection.opportunities}</div>
        <ul class="swot-list">
          <li>${t.readinessRubric.leverage || 'Leverage high-scoring areas for quick wins'}</li>
        </ul>
      </div>
      <div class="swot-card threats">
        <div class="swot-title">${t.companySnapshot.readinessSection.threats}</div>
        <ul class="swot-list">
          <li>${t.readinessRubric.address || 'Address low-scoring areas before implementation'}</li>
        </ul>
      </div>
    </div>
  `;
}

function generateOpportunitiesSection(
  opportunities: ImplementationOpportunity[],
  tfa: TFAAssessment | null,
  pifResponses: PIFResponse[],
  company: Company,
  t: any,
  language: 'en' | 'es'
): string {
  if (!opportunities || opportunities.length === 0) {
    return `
      <div class="subsection">
        <div class="subsection-title">${t.companySnapshot.opportunitiesSection.title}</div>
        <p class="not-available">${t.companySnapshot.opportunitiesSection.noOpportunities}</p>
      </div>
    `;
  }

  const companyContext: CompanyContext = {
    annualRevenue: company.annualRevenue,
    totalEmployees: company.totalEmployees
  };

  // Calculate readiness score if we have TFA and PIF
  let readinessScore = 50; // Default
  if (tfa && tfa.score && pifResponses && pifResponses.length > 0) {
    const aggregatedPIF = calculateAggregatedPIFScores(pifResponses);
    const tfaSectionScores = {
      systemEnvironment: tfa.score,
      dataQuality: tfa.score,
      integrationFeasibility: tfa.score,
      securityCompliance: tfa.score
    };
    const readiness = calculateReadinessRubric(tfa.score, tfaSectionScores, aggregatedPIF);
    readinessScore = readiness.totalScore;
  }

  const opportunityCards = opportunities.map(opp => {
    const effort = calculateImplementationEffort(
      readinessScore,
      opp.rampupPeriodMonths ? Number(opp.rampupPeriodMonths) : null,
      opp.paybackPeriodMonths ? Number(opp.paybackPeriodMonths) : null,
      opp.trainingHoursPerEmployee ? Number(opp.trainingHoursPerEmployee) : null
    );

    const impact = calculateBusinessImpact(
      opp,
      { errorMetrics: opp.errorMetricsEnabled, revenueMetrics: opp.revenueMetricsEnabled },
      companyContext,
      false // redistributive mode
    );

    return `
      <div class="opportunity-card">
        <div class="opportunity-name">${opp.name}</div>
        ${opp.description ? `<div class="opportunity-description">${opp.description}</div>` : ''}
        
        <div class="opportunity-metrics">
          <div class="metric-card">
            <div class="metric-label">${t.companySnapshot.opportunitiesSection.annualRoi}</div>
            <div class="metric-value">${formatCurrency(Number(opp.annualRoi) || 0, language)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${t.companySnapshot.opportunitiesSection.fteSavings}</div>
            <div class="metric-value">${Number(opp.fteSavings || 0).toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${t.companySnapshot.opportunitiesSection.businessImpactScore}</div>
            <div class="metric-value">${impact.toFixed(1)}/100</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">${t.companySnapshot.opportunitiesSection.implementationEffortScore}</div>
            <div class="metric-value">${effort.toFixed(1)}/100</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="subsection">
      <div class="subsection-title">${t.companySnapshot.opportunitiesSection.title}</div>
      ${opportunityCards}
    </div>
  `;
}

function generateCalculationTransparency(t: any): string {
  return `
    <div class="transparency-section">
      <h2>${t.companySnapshot.transparency.title}</h2>
      
      <div class="transparency-block">
        <div class="transparency-title">${t.companySnapshot.transparency.tfaScoring}</div>
        <div class="transparency-content">
          <p>${t.companySnapshot.transparency.tfaScoringExplanation}</p>
          <p style="margin-top: 12px;"><strong>${t.companySnapshot.transparency.sectionWeights}</strong></p>
        </div>
      </div>

      <div class="transparency-block">
        <div class="transparency-title">${t.companySnapshot.transparency.pifScoring}</div>
        <div class="transparency-content">
          <p>${t.companySnapshot.transparency.pifScoringExplanation}</p>
        </div>
      </div>

      <div class="transparency-block">
        <div class="transparency-title">${t.companySnapshot.transparency.readinessFormula}</div>
        <div class="transparency-content">
          <p>${t.companySnapshot.transparency.readinessFormulaExplanation}</p>
          <div class="formula-block">Readiness Score = (TFA Score × 60%) + (PIF Score × 40%)</div>
        </div>
      </div>

      <div class="transparency-block">
        <div class="transparency-title">${t.companySnapshot.transparency.businessImpactScoring}</div>
        <div class="transparency-content">
          <p>${t.companySnapshot.transparency.businessImpactExplanation}</p>
          <p style="margin-top: 12px;">${t.companySnapshot.transparency.multiplierExplanation}</p>
          <div class="formula-block">
            ROI Score = MIN(100, (Annual ROI / Company Revenue) × 1000)<br/>
            Hours Score = MIN(100, (FTE Savings / Total Employees) × 1000)
          </div>
        </div>
      </div>

      <div class="transparency-block">
        <div class="transparency-title">${t.companySnapshot.transparency.implementationEffort}</div>
        <div class="transparency-content">
          <p>${t.companySnapshot.transparency.implementationEffortExplanation}</p>
        </div>
      </div>

      <div class="transparency-block">
        <div class="transparency-title">${t.companySnapshot.transparency.scoringGuideTables}</div>
        <div class="transparency-content">
          <table class="data-table">
            <thead>
              <tr>
                <th>${t.companySnapshot.transparency.scoreInterpretation}</th>
                <th>${t.companySnapshot.transparency.roiScoreGuide}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>100</td><td>${t.companySnapshot.transparency.score100Meaning}</td></tr>
              <tr><td>50</td><td>${t.companySnapshot.transparency.score50Meaning}</td></tr>
              <tr><td>20</td><td>${t.companySnapshot.transparency.score20Meaning}</td></tr>
              <tr><td>10</td><td>${t.companySnapshot.transparency.score10Meaning}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Helper functions
function getFeasibilityBand(score: number): string {
  if (score >= 80) return 'Very High';
  if (score >= 65) return 'High';
  if (score >= 50) return 'Moderate';
  if (score >= 35) return 'Low';
  return 'Very Low';
}

function formatCurrency(amount: number, language: 'en' | 'es'): string {
  return new Intl.NumberFormat(language === 'en' ? 'en-US' : 'es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
