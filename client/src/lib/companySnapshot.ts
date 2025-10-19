import { translations } from "./translations";
import { calculateAggregatedPIFScores, calculateReadinessRubric } from "@shared/pifCalculations";
import { calculateImplementationEffort, calculateBusinessImpact, type CompanyContext } from "@shared/opportunityCalculations";
import { TFA_QUESTIONS, TFA_SECTIONS, calculateSectionScores, calculateQuestionImpact } from "@shared/tfaQuestions";
import type { Company, Workflow, TFAAssessment, PIFResponse, ImplementationOpportunity } from "@shared/schema";

interface PIFData {
  responses: PIFResponse[];
  aggregated: any;
}

interface WorkflowSnapshotData {
  workflow: Workflow;
  tfa: TFAAssessment | null;
  pifData: PIFData | null;
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
      const pifData = pifRes.ok ? await pifRes.json() : null;
      const opportunities = oppRes.ok ? await oppRes.json() : [];

      console.log(`[Snapshot] Workflow ${workflow.name}:`, {
        hasTFA: !!tfa,
        pifData: pifData ? {
          hasResponses: !!pifData.responses,
          responsesLength: pifData.responses?.length,
          hasAggregated: !!pifData.aggregated,
          aggregatedType: typeof pifData.aggregated
        } : 'null',
      });

      return {
        workflow,
        tfa,
        pifData, // Keep as-is: { responses, aggregated } or null
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
  ${generateMethodologySection(t)}
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
      color: #e5e7eb;
      background: #0a0a0a;
      padding: 40px;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 24px;
      color: #ffffff;
      border-bottom: 3px solid #10b981;
      padding-bottom: 12px;
    }

    h2 {
      font-size: 28px;
      font-weight: 600;
      margin-top: 48px;
      margin-bottom: 20px;
      color: #10b981;
      border-bottom: 2px solid #1f2937;
      padding-bottom: 8px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 22px;
      font-weight: 600;
      margin-top: 32px;
      margin-bottom: 16px;
      color: #10b981;
      page-break-after: avoid;
    }

    h4 {
      font-size: 18px;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #6ee7b7;
      page-break-after: avoid;
    }

    p {
      margin-bottom: 12px;
      color: #d1d5db;
    }

    strong {
      color: #f3f4f6;
    }

    .header {
      margin-bottom: 40px;
      border-bottom: 1px solid #1f2937;
      padding-bottom: 32px;
    }

    .company-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
      padding: 24px;
      background: #111827;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6ee7b7;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 20px;
      font-weight: 600;
      color: #f9fafb;
    }

    .workflow-section {
      margin-top: 60px;
      page-break-before: always;
      border-top: 4px solid #1f2937;
      padding-top: 32px;
    }

    .workflow-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 12px;
    }

    .workflow-description {
      font-size: 16px;
      color: #9ca3af;
      margin-bottom: 32px;
      font-style: italic;
    }

    .subsection {
      margin-top: 32px;
      padding: 28px;
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 8px;
      page-break-inside: avoid;
    }

    .subsection-title {
      font-size: 24px;
      font-weight: 600;
      color: #10b981;
      margin-bottom: 20px;
      border-bottom: 1px solid #1f2937;
      padding-bottom: 8px;
    }

    .respondent-info {
      padding: 16px;
      background: #1f2937;
      border-radius: 6px;
      border-left: 3px solid #10b981;
      margin-bottom: 20px;
    }

    .respondent-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6ee7b7;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    .respondent-value {
      font-size: 16px;
      color: #f3f4f6;
    }

    .score-badge {
      display: inline-block;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 20px;
      margin: 8px 0;
    }

    .feasibility-very-high {
      background: #10b981;
      color: #000000;
    }

    .feasibility-high {
      background: #34d399;
      color: #000000;
    }

    .feasibility-moderate {
      background: #fbbf24;
      color: #000000;
    }

    .feasibility-low {
      background: #f59e0b;
      color: #000000;
    }

    .feasibility-very-low {
      background: #ef4444;
      color: #ffffff;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }

    .data-table th {
      background: #1f2937;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #6ee7b7;
      border-bottom: 2px solid #10b981;
    }

    .data-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #374151;
      color: #d1d5db;
    }

    .data-table tr:hover {
      background: #1f2937;
    }

    .metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 16px 0;
    }

    .metric-card {
      padding: 20px;
      background: #1f2937;
      border-radius: 6px;
      border-left: 3px solid #10b981;
    }

    .metric-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #6ee7b7;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
    }

    .metric-range {
      font-size: 13px;
      color: #9ca3af;
      margin-top: 4px;
    }

    .insights-list {
      list-style: none;
      margin: 16px 0;
    }

    .insights-list li {
      padding: 14px;
      margin-bottom: 10px;
      background: #1f2937;
      border-left: 3px solid #6ee7b7;
      border-radius: 4px;
      color: #d1d5db;
      font-style: italic;
    }

    .component-breakdown {
      margin: 24px 0;
    }

    .component-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px;
      margin-bottom: 10px;
      background: #1f2937;
      border-radius: 4px;
      border-left: 3px solid #10b981;
    }

    .component-name {
      font-weight: 500;
      color: #e5e7eb;
    }

    .component-score {
      font-weight: 700;
      font-size: 20px;
      color: #10b981;
    }

    .gap-card {
      padding: 16px;
      margin-bottom: 12px;
      background: #7f1d1d;
      border: 1px solid #991b1b;
      border-radius: 6px;
      border-left: 4px solid #ef4444;
    }

    .gap-question {
      font-size: 15px;
      font-weight: 600;
      color: #fecaca;
      margin-bottom: 6px;
    }

    .gap-section {
      font-size: 12px;
      color: #fca5a5;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .strength-card {
      padding: 16px;
      margin-bottom: 12px;
      background: #064e3b;
      border: 1px solid #065f46;
      border-radius: 6px;
      border-left: 4px solid #10b981;
    }

    .strength-question {
      font-size: 15px;
      font-weight: 600;
      color: #a7f3d0;
      margin-bottom: 6px;
    }

    .strength-section {
      font-size: 12px;
      color: #6ee7b7;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .roadmap-item {
      padding: 16px;
      margin-bottom: 12px;
      background: #1f2937;
      border-radius: 6px;
      border-left: 4px solid #6ee7b7;
    }

    .roadmap-title {
      font-size: 16px;
      font-weight: 600;
      color: #10b981;
      margin-bottom: 8px;
    }

    .roadmap-description {
      color: #d1d5db;
      font-size: 14px;
      line-height: 1.6;
    }

    .not-available {
      color: #6b7280;
      font-style: italic;
      padding: 16px;
      background: #1f2937;
      border-radius: 6px;
    }

    .matrix-container {
      margin: 32px 0;
      page-break-inside: avoid;
    }

    .matrix-title {
      font-size: 20px;
      font-weight: 600;
      color: #10b981;
      margin-bottom: 16px;
    }

    .matrix-grid {
      display: grid;
      grid-template-columns: 40px 1fr;
      grid-template-rows: auto 1fr;
      gap: 0;
      margin: 20px 0;
      border: 2px solid #374151;
      background: #111827;
    }

    .matrix-y-label {
      grid-column: 1;
      grid-row: 2;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1f2937;
      font-size: 13px;
      font-weight: 600;
      color: #6ee7b7;
      padding: 8px;
    }

    .matrix-quadrants {
      grid-column: 2;
      grid-row: 2;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 2px;
      background: #374151;
    }

    .matrix-x-label {
      grid-column: 2;
      grid-row: 3;
      text-align: center;
      background: #1f2937;
      font-size: 13px;
      font-weight: 600;
      color: #6ee7b7;
      padding: 8px;
    }

    .quadrant {
      padding: 16px;
      min-height: 180px;
      position: relative;
    }

    .quadrant-strategic {
      background: #064e3b;
      border: 1px solid #065f46;
    }

    .quadrant-quick {
      background: #134e4a;
      border: 1px solid #0f766e;
    }

    .quadrant-deprioritize {
      background: #7f1d1d;
      border: 1px solid #991b1b;
    }

    .quadrant-nice {
      background: #78350f;
      border: 1px solid #92400e;
    }

    .quadrant-label {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .quadrant-strategic .quadrant-label {
      color: #6ee7b7;
    }

    .quadrant-quick .quadrant-label {
      color: #5eead4;
    }

    .quadrant-deprioritize .quadrant-label {
      color: #fca5a5;
    }

    .quadrant-nice .quadrant-label {
      color: #fcd34d;
    }

    .opportunity-dot {
      font-size: 12px;
      padding: 4px 8px;
      margin: 4px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      display: inline-block;
      color: #f3f4f6;
    }

    .methodology-section {
      margin-top: 80px;
      padding-top: 40px;
      border-top: 4px solid #1f2937;
      page-break-before: always;
    }

    .methodology-block {
      margin: 24px 0;
      padding: 24px;
      background: #111827;
      border-radius: 8px;
      border-left: 3px solid #10b981;
    }

    .methodology-title {
      font-weight: 600;
      font-size: 18px;
      color: #10b981;
      margin-bottom: 12px;
    }

    .methodology-content {
      color: #d1d5db;
      font-size: 15px;
      line-height: 1.8;
    }

    .formula-block {
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      background: #1f2937;
      padding: 16px;
      border-radius: 6px;
      border-left: 3px solid #6ee7b7;
      margin: 16px 0;
      font-size: 14px;
      color: #d1d5db;
      overflow-x: auto;
    }

    @media print {
      body {
        padding: 20px;
        background: white;
        color: black;
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
      <p style="font-size: 28px; font-weight: 600; color: #10b981; margin-bottom: 8px;">${company.name}</p>
      <p style="color: #9ca3af;">${t.companySnapshot.generatedOn}: ${generationDate}</p>
      
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
  const { workflow, tfa, pifData, opportunities } = data;

  try {
    return `
      <div class="workflow-section">
        <div class="workflow-title">${workflow.name}</div>
        ${workflow.description ? `<div class="workflow-description">${workflow.description}</div>` : ''}
        
        ${generateTFASection(tfa, t, language)}
        ${generatePIFSection(pifData, t, language)}
        ${generateReadinessSection(tfa, pifData, t, language)}
        ${generateOpportunityMatrixes(opportunities, tfa, pifData, company, workflow, t, language)}
      </div>
    `;
  } catch (error) {
    console.error(`[Snapshot] Error generating section for workflow ${workflow.name}:`, error);
    return `
      <div class="workflow-section">
        <div class="workflow-title">${workflow.name}</div>
        ${workflow.description ? `<div class="workflow-description">${workflow.description}</div>` : ''}
        <div style="padding: 20px; background: #1f2937; border-left: 3px solid #ef4444; color: #fca5a5; margin: 20px 0;">
          <p><strong>Error generating workflow snapshot</strong></p>
          <p style="margin-top: 8px; font-size: 14px;">This workflow's data could not be processed. Please ensure all assessment forms are completed.</p>
        </div>
      </div>
    `;
  }
}

function hasTFAData(tfa: TFAAssessment | null): boolean {
  if (!tfa) return false;
  if (!tfa.responses) return false;
  const responses = tfa.responses as Record<string, string>;
  return Object.keys(responses).length > 0;
}

function hasPIFData(pifData: PIFData | null): boolean {
  return pifData !== null && pifData.responses !== undefined && pifData.responses.length > 0;
}

function generateTFASection(tfa: TFAAssessment | null, t: any, language: 'en' | 'es'): string {
  if (!hasTFAData(tfa)) {
    return `
      <div class="subsection">
        <div class="subsection-title">${t.companySnapshot.tfaSection.title}</div>
        <p class="not-available">${t.companySnapshot.notCompleted}</p>
      </div>
    `;
  }

  const responses = tfa!.responses as Record<string, string>;
  const sectionScores = calculateSectionScores(responses);
  
  // Calculate section scores for readiness rubric
  const tfaSectionScoresMap: Record<string, number> = {};
  sectionScores.forEach(section => {
    // Normalize to 0-100 scale
    const normalizedScore = (section.score / 5) * 100;
    tfaSectionScoresMap[section.name] = normalizedScore;
  });

  const feasibilityBand = getFeasibilityBand(tfa!.score || 0);
  const bandClass = feasibilityBand.toLowerCase().replace(/\s+/g, '-');
  const bandKey = feasibilityBand.toLowerCase().replace(/\s+/g, '');
  const bandText = t.tfa.feasibilityBands[bandKey as keyof typeof t.tfa.feasibilityBands] || feasibilityBand;

  return `
    <div class="subsection">
      <div class="subsection-title">${t.companySnapshot.tfaSection.title}</div>
      
      ${generateTFARespondentInfo(tfa!, t)}
      
      <div style="margin: 20px 0;">
        <p><strong>${t.companySnapshot.tfaSection.overallScore}:</strong> <span class="score-badge feasibility-${bandClass}">${tfa!.score}/100</span></p>
        <p style="margin-top: 12px;"><strong>${t.companySnapshot.tfaSection.feasibilityBand}:</strong> <span class="score-badge feasibility-${bandClass}">${bandText}</span></p>
      </div>

      ${generateTFAExecutiveSummary(tfa!, responses, t)}
      ${generateTFACriticalGaps(responses, t)}
      ${generateTFAKeyStrengths(responses, t)}
      ${generateTFAImplementationRoadmap(tfa!, responses, sectionScores, t)}
    </div>
  `;
}

function generateTFARespondentInfo(tfa: TFAAssessment, t: any): string {
  const initialRespondent = tfa.initialRespondent || 'Not specified';
  const responseSources = tfa.responseSources as Record<string, { answeredBy?: string, source?: string }> || {};
  
  // Extract gap fillers (people who answered "Don't Know" questions)
  const gapFillers = new Set<string>();
  Object.values(responseSources).forEach((source) => {
    if (source.answeredBy && source.answeredBy !== initialRespondent) {
      gapFillers.add(source.answeredBy);
    }
  });

  const hasGapFillers = gapFillers.size > 0;
  const gapFillersText = Array.from(gapFillers).join(', ');

  return `
    <div class="respondent-info">
      <div class="respondent-label">Data Source</div>
      <div class="respondent-value">
        ${hasGapFillers 
          ? `Data gathered through ${initialRespondent} with support from ${gapFillersText}`
          : `Primary respondent: ${initialRespondent}`
        }
      </div>
    </div>
  `;
}

function generateTFAExecutiveSummary(tfa: TFAAssessment, responses: Record<string, string>, t: any): string {
  const score = tfa.score || 0;
  const sectionScores = calculateSectionScores(responses);
  
  // Find strongest and weakest sections
  const sortedSections = [...sectionScores].sort((a, b) => b.score - a.score);
  const strongest = sortedSections[0];
  const weakest = sortedSections[sortedSections.length - 1];

  let summary = '';
  if (score >= 80) {
    summary = `This workflow demonstrates exceptional technical readiness for AI automation with a score of ${score}/100. The technical infrastructure is robust, with particularly strong ${strongest.name.toLowerCase()} capabilities. This represents an ideal candidate for immediate implementation.`;
  } else if (score >= 65) {
    summary = `This workflow shows strong technical readiness for AI automation with a score of ${score}/100. While ${strongest.name.toLowerCase()} is well-developed, attention to ${weakest.name.toLowerCase()} will ensure smooth implementation.`;
  } else if (score >= 50) {
    summary = `This workflow demonstrates moderate technical readiness with a score of ${score}/100. While ${strongest.name.toLowerCase()} provides a solid foundation, significant improvements in ${weakest.name.toLowerCase()} are recommended before proceeding with automation.`;
  } else if (score >= 35) {
    summary = `This workflow faces technical challenges with a score of ${score}/100. Critical gaps exist in ${weakest.name.toLowerCase()} that require resolution. A phased approach with infrastructure improvements is recommended.`;
  } else {
    summary = `This workflow requires substantial technical infrastructure development before AI automation can be considered, with a score of ${score}/100. Focus on foundational improvements in ${weakest.name.toLowerCase()} and ${strongest.name.toLowerCase()} before revisiting automation opportunities.`;
  }

  return `
    <h4>Executive Summary</h4>
    <div style="padding: 16px; background: #1f2937; border-radius: 6px; border-left: 3px solid #10b981;">
      <p style="color: #d1d5db; line-height: 1.7;">${summary}</p>
    </div>

    <h4 style="margin-top: 24px;">Technical Readiness by Area</h4>
    <div class="metric-grid">
      ${sectionScores.map(section => {
        const normalizedScore = Math.round((section.score / 5) * 100);
        return `
          <div class="metric-card">
            <div class="metric-label">${section.name}</div>
            <div class="metric-value">${normalizedScore}/100</div>
            <div class="metric-range">Weight: ${section.weight}%</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function generateTFACriticalGaps(responses: Record<string, string>, t: any): string {
  // Find all questions scoring 1-2
  const gaps: Array<{ id: number; question: string; section: string; score: number; impactScore: number }> = [];
  
  TFA_QUESTIONS.forEach(q => {
    const response = responses[q.id.toString()];
    if (response) {
      const selectedOption = q.options.find(opt => opt.value === response);
      if (selectedOption && selectedOption.score !== null && selectedOption.score <= 2) {
        const sectionWeight = TFA_SECTIONS.find(s => s.name === q.section)?.weight || 0;
        const impactScore = calculateQuestionImpact(q.id, selectedOption.score, sectionWeight);
        gaps.push({
          id: q.id,
          question: q.question,
          section: q.section,
          score: selectedOption.score,
          impactScore: impactScore
        });
      }
    }
  });

  // Sort by impact score (descending)
  gaps.sort((a, b) => b.impactScore - a.impactScore);

  if (gaps.length === 0) {
    return `
      <h4>Critical Technical Gaps</h4>
      <p style="padding: 16px; background: #064e3b; border-radius: 6px; color: #a7f3d0;">
        No critical technical gaps identified. The technical infrastructure is well-suited for AI automation.
      </p>
    `;
  }

  return `
    <h4>Critical Technical Gaps</h4>
    <p style="color: #9ca3af; margin-bottom: 16px; font-size: 14px;">
      These areas scored 1-2 out of 5 and represent the highest-impact technical challenges, sorted by their weighted impact on overall feasibility.
    </p>
    ${gaps.map(gap => `
      <div class="gap-card">
        <div class="gap-section">${gap.section} (Impact: ${gap.impactScore.toFixed(1)})</div>
        <div class="gap-question">${gap.question}</div>
        <div style="color: #fca5a5; font-size: 14px; margin-top: 8px;">
          Current Score: ${gap.score}/5 - Immediate attention required
        </div>
      </div>
    `).join('')}
  `;
}

function generateTFAKeyStrengths(responses: Record<string, string>, t: any): string {
  // Find all questions scoring 5
  const strengths: Array<{ id: number; question: string; section: string }> = [];
  
  TFA_QUESTIONS.forEach(q => {
    const response = responses[q.id.toString()];
    if (response) {
      const selectedOption = q.options.find(opt => opt.value === response);
      if (selectedOption && selectedOption.score === 5) {
        strengths.push({
          id: q.id,
          question: q.question,
          section: q.section
        });
      }
    }
  });

  if (strengths.length === 0) {
    return `
      <h4>Key Technical Strengths</h4>
      <p class="not-available">
        No areas scored at the maximum level. Focus on achieving excellence in at least one technical area to establish a strong foundation.
      </p>
    `;
  }

  return `
    <h4>Key Technical Strengths</h4>
    <p style="color: #9ca3af; margin-bottom: 16px; font-size: 14px;">
      These areas scored 5/5 and represent your strongest technical capabilities for AI automation.
    </p>
    ${strengths.map(strength => `
      <div class="strength-card">
        <div class="strength-section">${strength.section}</div>
        <div class="strength-question">${strength.question}</div>
        <div style="color: #6ee7b7; font-size: 14px; margin-top: 8px;">
          ✓ Excellent - Ready for advanced automation
        </div>
      </div>
    `).join('')}
  `;
}

function generateTFAImplementationRoadmap(
  tfa: TFAAssessment,
  responses: Record<string, string>,
  sectionScores: Array<{ name: string; score: number; weight: number }>,
  t: any
): string {
  const score = tfa.score || 0;
  const roadmapItems: Array<{ title: string; description: string }> = [];

  // Generate score-specific recommendations
  if (score >= 80) {
    roadmapItems.push({
      title: 'Immediate Implementation (Weeks 1-4)',
      description: 'Begin proof-of-concept development immediately. Your technical infrastructure is ready. Focus on selecting the highest-ROI use case and establishing success metrics.'
    });
    roadmapItems.push({
      title: 'Scaling & Optimization (Weeks 5-12)',
      description: 'Expand to additional workflows and optimize performance. Leverage your strong technical foundation to achieve rapid deployment across similar processes.'
    });
  } else if (score >= 65) {
    roadmapItems.push({
      title: 'Address Minor Gaps (Weeks 1-6)',
      description: 'Resolve the identified technical gaps in lower-scoring areas. Focus particularly on improving capabilities in areas that scored below 3/5.'
    });
    roadmapItems.push({
      title: 'Pilot Implementation (Weeks 7-12)',
      description: 'Launch a controlled pilot focusing on leveraging your strongest technical areas. Use this to validate approach and refine before broader rollout.'
    });
    roadmapItems.push({
      title: 'Production Rollout (Weeks 13-20)',
      description: 'Scale to full production with confidence, using lessons learned from the pilot phase.'
    });
  } else if (score >= 50) {
    roadmapItems.push({
      title: 'Infrastructure Development (Months 1-3)',
      description: 'Prioritize improvements in the lowest-scoring technical areas. Consider consulting with technical experts to accelerate infrastructure upgrades.'
    });
    roadmapItems.push({
      title: 'Validation & Testing (Months 4-5)',
      description: 'Conduct thorough testing of improved infrastructure. Ensure all technical prerequisites meet minimum requirements for automation.'
    });
    roadmapItems.push({
      title: 'Phased Implementation (Months 6-12)',
      description: 'Begin with limited scope automation, gradually expanding as technical confidence grows and infrastructure matures.'
    });
  } else {
    roadmapItems.push({
      title: 'Foundational Assessment (Months 1-2)',
      description: 'Conduct a comprehensive technical assessment with external experts. Develop a detailed infrastructure improvement plan with clear milestones.'
    });
    roadmapItems.push({
      title: 'Infrastructure Overhaul (Months 3-9)',
      description: 'Execute systematic improvements across all low-scoring areas. This is a prerequisite before automation can be considered viable.'
    });
    roadmapItems.push({
      title: 'Re-evaluation (Month 10)',
      description: 'Reassess technical readiness after infrastructure improvements. Determine if conditions now support automation or if additional work is needed.'
    });
  }

  // Add section-specific recommendations for lowest-scoring areas
  const weakSections = [...sectionScores].sort((a, b) => a.score - b.score).slice(0, 2);
  weakSections.forEach(section => {
    if (section.score < 3.5) {
      roadmapItems.push({
        title: `${section.name} Improvement Priority`,
        description: `This area scored ${((section.score / 5) * 100).toFixed(0)}/100 and requires focused attention. Consider: hiring specialists, upgrading systems, or implementing best practices specific to ${section.name.toLowerCase()}.`
      });
    }
  });

  return `
    <h4>Implementation Roadmap</h4>
    <p style="color: #9ca3af; margin-bottom: 16px; font-size: 14px;">
      Based on your technical readiness score of ${score}/100, here's a recommended implementation timeline:
    </p>
    ${roadmapItems.map(item => `
      <div class="roadmap-item">
        <div class="roadmap-title">${item.title}</div>
        <div class="roadmap-description">${item.description}</div>
      </div>
    `).join('')}
  `;
}

function generatePIFSection(pifData: PIFData | null, t: any, language: 'en' | 'es'): string {
  if (!hasPIFData(pifData)) {
    return `
      <div class="subsection">
        <div class="subsection-title">${t.companySnapshot.pifSection.title}</div>
        <p class="not-available">${t.companySnapshot.notCompleted}</p>
      </div>
    `;
  }

  const pifResponses = pifData!.responses || [];
  // Use aggregated scores from API, or calculate if missing/incomplete
  const hasValidAggregated = pifData!.aggregated?.processClarity !== undefined;
  const aggregated = hasValidAggregated ? pifData!.aggregated : calculateAggregatedPIFScores(pifResponses);
  
  return `
    <div class="subsection">
      <div class="subsection-title">${t.companySnapshot.pifSection.title}</div>
      
      ${generatePIFRespondentInfo(pifData, t)}
      
      <h4>${t.companySnapshot.pifSection.operationalScores}</h4>
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">${t.pifScoring.processClarity}</div>
          <div class="metric-value">${aggregated.processClarity.average}/100</div>
          <div class="metric-range">Range: ${aggregated.processClarity.min}-${aggregated.processClarity.max} | StdDev: ${aggregated.processClarity.standardDeviation}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${t.pifScoring.changeMagnitude}</div>
          <div class="metric-value">${aggregated.changeMagnitude.average}/100</div>
          <div class="metric-range">Range: ${aggregated.changeMagnitude.min}-${aggregated.changeMagnitude.max} | StdDev: ${aggregated.changeMagnitude.standardDeviation}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">${t.pifScoring.workflowBrittleness}</div>
          <div class="metric-value">${aggregated.workflowBrittleness.average}/100</div>
          <div class="metric-range">Range: ${aggregated.workflowBrittleness.min}-${aggregated.workflowBrittleness.max} | StdDev: ${aggregated.workflowBrittleness.standardDeviation}</div>
        </div>
      </div>

      ${generatePIFROIInputs(pifData, t)}
      ${generatePIFQualitativeInsights(pifData, t)}
    </div>
  `;
}

function generatePIFRespondentInfo(pifData: PIFData | null, t: any): string {
  const pifResponses = pifData?.responses || [];
  
  if (pifResponses.length === 1) {
    return `
      <div class="respondent-info">
        <div class="respondent-label">Respondent</div>
        <div class="respondent-value">${pifResponses[0].respondentName} (${pifResponses[0].respondentRole})</div>
      </div>
    `;
  }

  const respondentsList = pifResponses
    .map(r => `${r.respondentName} (${r.respondentRole})`)
    .join(', ');

  return `
    <div class="respondent-info">
      <div class="respondent-label">Respondents (${pifResponses.length} total)</div>
      <div class="respondent-value">${respondentsList}</div>
    </div>
  `;
}

function generatePIFROIInputs(pifData: PIFData | null, t: any): string {
  const pifResponses = pifData?.responses || [];
  
  // Extract ROI inputs from responses
  const roiData: Array<{ respondent: string; employeeCount?: number; frequency?: string; processTime?: number }> = [];
  
  pifResponses.forEach(response => {
    if (response.roiInputs) {
      const roi = response.roiInputs as any;
      roiData.push({
        respondent: response.respondentName,
        employeeCount: roi.employeeCount,
        frequency: roi.frequency,
        processTime: roi.minutesPerProcess
      });
    }
  });

  if (roiData.length === 0) {
    return '';
  }

  return `
    <h4>Time & Volume Data</h4>
    <table class="data-table">
      <thead>
        <tr>
          <th>Respondent</th>
          <th>Employee Count</th>
          <th>Frequency</th>
          <th>Process Time (min)</th>
        </tr>
      </thead>
      <tbody>
        ${roiData.map(data => `
          <tr>
            <td>${data.respondent}</td>
            <td>${data.employeeCount || 'N/A'}</td>
            <td>${data.frequency ? data.frequency.charAt(0).toUpperCase() + data.frequency.slice(1) : 'N/A'}</td>
            <td>${data.processTime || 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function generatePIFQualitativeInsights(pifData: PIFData | null, t: any): string {
  const pifResponses = pifData?.responses || [];
  
  const timeWasters: string[] = [];
  const automationWishes: string[] = [];
  const typicalOutcomes: string[] = [];
  
  pifResponses.forEach(response => {
    if (response.qualitativeResponses) {
      const qual = response.qualitativeResponses as Record<string, string>;
      // Q22: biggest time-wasters
      if (qual['22']) timeWasters.push(qual['22']);
      // Q23: what would you automate
      if (qual['23']) automationWishes.push(qual['23']);
      // Q24: what do you produce
      if (qual['24']) typicalOutcomes.push(qual['24']);
    }
  });

  if (timeWasters.length === 0 && automationWishes.length === 0 && typicalOutcomes.length === 0) {
    return '';
  }

  return `
    <h4>Process Insights from End Users</h4>
    
    ${timeWasters.length > 0 ? `
      <div style="margin-bottom: 24px;">
        <h5 style="font-size: 16px; color: #6ee7b7; margin-bottom: 12px;">Biggest Time-Wasters</h5>
        <ul class="insights-list">
          ${timeWasters.slice(0, 3).map(insight => `<li>"${insight}"</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${automationWishes.length > 0 ? `
      <div style="margin-bottom: 24px;">
        <h5 style="font-size: 16px; color: #6ee7b7; margin-bottom: 12px;">What Users Want to Automate</h5>
        <ul class="insights-list">
          ${automationWishes.slice(0, 3).map(insight => `<li>"${insight}"</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    ${typicalOutcomes.length > 0 ? `
      <div style="margin-bottom: 24px;">
        <h5 style="font-size: 16px; color: #6ee7b7; margin-bottom: 12px;">Typical Process Outcomes</h5>
        <ul class="insights-list">
          ${typicalOutcomes.slice(0, 3).map(insight => `<li>"${insight}"</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `;
}

function generateReadinessSection(
  tfa: TFAAssessment | null,
  pifData: PIFData | null,
  t: any,
  language: 'en' | 'es'
): string {
  if (!hasTFAData(tfa) || !hasPIFData(pifData)) {
    return `
      <div class="subsection">
        <div class="subsection-title">${t.companySnapshot.readinessSection.title}</div>
        <p class="not-available">
          Readiness Rubric requires both Technical Feasibility Assessment (TFA) and Process Insight Form (PIF) data to be completed.
        </p>
      </div>
    `;
  }

  const responses = tfa!.responses as Record<string, string>;
  const sectionScores = calculateSectionScores(responses);
  
  // Calculate section scores normalized to 0-100
  const tfaSectionScoresMap: any = {};
  sectionScores.forEach(section => {
    const normalizedScore = (section.score / 5) * 100;
    const key = section.name.replace(/\//g, '').replace(/\s+/g, '');
    if (section.name === 'System Environment') tfaSectionScoresMap.systemEnvironment = normalizedScore;
    else if (section.name === 'Data Quality') tfaSectionScoresMap.dataQuality = normalizedScore;
    else if (section.name === 'Integration Feasibility') tfaSectionScoresMap.integrationFeasibility = normalizedScore;
    else if (section.name === 'Security/Compliance') tfaSectionScoresMap.securityCompliance = normalizedScore;
  });

  // Use aggregated scores from API, or calculate if missing
  const pifResponses = pifData!.responses || [];
  const hasValidAggregated = pifData!.aggregated?.processClarity !== undefined;
  const aggregatedPIF = hasValidAggregated ? pifData!.aggregated : calculateAggregatedPIFScores(pifResponses);
  const readiness = calculateReadinessRubric(tfa!.score || 0, tfaSectionScoresMap, aggregatedPIF);

  const feasibilityClass = readiness.feasibilityBand.toLowerCase().replace(/\s+/g, '-');
  const bandKey = readiness.feasibilityBand.toLowerCase().replace(/\s+/g, '');
  const bandText = t.tfa.feasibilityBands[bandKey as keyof typeof t.tfa.feasibilityBands] || readiness.feasibilityBand;

  return `
    <div class="subsection">
      <div class="subsection-title">${t.companySnapshot.readinessSection.title}</div>
      
      <div style="margin: 20px 0;">
        <p><strong>Combined Readiness Score (TFA 60% + PIF 40%):</strong></p>
        <div class="score-badge feasibility-${feasibilityClass}" style="font-size: 32px; padding: 16px 32px; margin: 16px 0;">
          ${readiness.totalScore}/100
        </div>
        <p style="margin-top: 12px;"><strong>Feasibility Band:</strong></p>
        <div class="score-badge feasibility-${feasibilityClass}">${bandText}</div>
      </div>

      <div style="padding: 20px; background: #1f2937; border-radius: 6px; border-left: 3px solid #10b981; margin: 24px 0;">
        <p style="color: #d1d5db; line-height: 1.7;"><strong style="color: #10b981;">Strategic Recommendation:</strong> ${readiness.recommendation}</p>
      </div>

      <h4>7-Component Breakdown</h4>
      <p style="color: #9ca3af; margin-bottom: 16px; font-size: 14px;">
        The Readiness Rubric combines technical feasibility (60%) and operational readiness (40%) across seven weighted components:
      </p>
      <div class="component-breakdown">
        <div class="component-item">
          <span class="component-name">Data Quality (18% of total)</span>
          <span class="component-score">${Math.round(readiness.componentScores.dataQuality)}/100</span>
        </div>
        <div class="component-item">
          <span class="component-name">Integration Feasibility (18% of total)</span>
          <span class="component-score">${Math.round(readiness.componentScores.integrationFeasibility)}/100</span>
        </div>
        <div class="component-item">
          <span class="component-name">System Environment (15% of total)</span>
          <span class="component-score">${Math.round(readiness.componentScores.systemEnvironment)}/100</span>
        </div>
        <div class="component-item">
          <span class="component-name">Security/Compliance (9% of total)</span>
          <span class="component-score">${Math.round(readiness.componentScores.securityCompliance)}/100</span>
        </div>
        <div class="component-item">
          <span class="component-name">Process Clarity (8% of total)</span>
          <span class="component-score">${Math.round(readiness.componentScores.processClarity)}/100</span>
        </div>
        <div class="component-item">
          <span class="component-name">Change Magnitude (8% of total)</span>
          <span class="component-score">${Math.round(readiness.componentScores.changeMagnitude)}/100</span>
        </div>
        <div class="component-item">
          <span class="component-name">Workflow Brittleness (6% of total) - inverted</span>
          <span class="component-score">${Math.round(readiness.componentScores.workflowBrittleness)}/100</span>
        </div>
      </div>

      <div style="margin-top: 24px; padding: 16px; background: #1f2937; border-radius: 6px; font-size: 14px;">
        <p style="color: #9ca3af; line-height: 1.7;">
          <strong style="color: #6ee7b7;">Calculation Verification:</strong><br>
          TFA Contribution (60%): ${readiness.tfaScore} × 0.6 = ${Math.round(readiness.tfaScore * 0.6)}<br>
          PIF Contribution (40%): ${readiness.pifScore} × 0.4 = ${Math.round(readiness.pifScore * 0.4)}<br>
          <strong style="color: #ffffff;">Total: ${readiness.totalScore}/100</strong>
        </p>
      </div>
    </div>
  `;
}

function generateOpportunityMatrixes(
  opportunities: ImplementationOpportunity[],
  tfa: TFAAssessment | null,
  pifData: PIFData | null,
  company: Company,
  workflow: Workflow,
  t: any,
  language: 'en' | 'es'
): string {
  if (opportunities.length === 0 || !hasTFAData(tfa) || !hasPIFData(pifData)) {
    return '';
  }

  // Calculate readiness score for implementation effort
  const responses = tfa!.responses as Record<string, string>;
  const sectionScores = calculateSectionScores(responses);
  const tfaSectionScoresMap: any = {};
  sectionScores.forEach(section => {
    const normalizedScore = (section.score / 5) * 100;
    if (section.name === 'System Environment') tfaSectionScoresMap.systemEnvironment = normalizedScore;
    else if (section.name === 'Data Quality') tfaSectionScoresMap.dataQuality = normalizedScore;
    else if (section.name === 'Integration Feasibility') tfaSectionScoresMap.integrationFeasibility = normalizedScore;
    else if (section.name === 'Security/Compliance') tfaSectionScoresMap.securityCompliance = normalizedScore;
  });

  // Use aggregated scores from API, or calculate if missing
  const pifResponses = pifData!.responses || [];
  const hasValidAggregated = pifData!.aggregated?.processClarity !== undefined;
  const aggregatedPIF = hasValidAggregated ? pifData!.aggregated : calculateAggregatedPIFScores(pifResponses);
  const readiness = calculateReadinessRubric(tfa!.score || 0, tfaSectionScoresMap, aggregatedPIF);

  const companyContext: CompanyContext = {
    annualRevenue: company.annualRevenue,
    totalEmployees: company.totalEmployees
  };

  // Define the 4 matrix configurations
  const matrixConfigs = [
    {
      name: 'Time Savings Only',
      toggles: { errorMetrics: false, revenueMetrics: false },
      filter: (opp: ImplementationOpportunity) => !opp.errorMetricsEnabled && !opp.revenueMetricsEnabled
    },
    {
      name: 'Time + Error Reduction',
      toggles: { errorMetrics: true, revenueMetrics: false },
      filter: (opp: ImplementationOpportunity) => opp.errorMetricsEnabled && !opp.revenueMetricsEnabled
    },
    {
      name: 'Time + Revenue Uplift',
      toggles: { errorMetrics: false, revenueMetrics: true },
      filter: (opp: ImplementationOpportunity) => !opp.errorMetricsEnabled && opp.revenueMetricsEnabled
    },
    {
      name: 'All 3 Metrics (Time + Error + Revenue)',
      toggles: { errorMetrics: true, revenueMetrics: true },
      filter: (opp: ImplementationOpportunity) => opp.errorMetricsEnabled && opp.revenueMetricsEnabled
    }
  ];

  let matrixesHTML = `
    <div class="subsection">
      <div class="subsection-title">Opportunity Prioritization Matrixes</div>
      <p style="color: #9ca3af; margin-bottom: 24px;">
        Each matrix shows opportunities positioned by Business Impact (x-axis) and Implementation Effort (y-axis).
        The quadrants help prioritize: Quick Wins (high impact, low effort), Strategic Goals (high impact, high effort),
        Nice-To-Haves (low impact, low effort), and Deprioritize (low impact, high effort).
      </p>
  `;

  matrixConfigs.forEach(config => {
    const filteredOpps = opportunities.filter(config.filter);
    
    // Skip matrix if no matching opportunities
    if (filteredOpps.length === 0) {
      return;
    }

    // Calculate scores for each opportunity
    const oppScores = filteredOpps.map(opp => {
      const impact = calculateBusinessImpact(opp, config.toggles, companyContext, false);
      const effort = calculateImplementationEffort(
        readiness.totalScore,
        parseFloat(opp.rampupPeriodMonths?.toString() || '0'),
        parseFloat(opp.paybackPeriodMonths?.toString() || '0'),
        parseFloat(opp.trainingHoursPerEmployee?.toString() || '0')
      );

      // Determine quadrant
      let quadrant: string;
      if (impact >= 50 && effort < 50) quadrant = 'quick';
      else if (impact >= 50 && effort >= 50) quadrant = 'strategic';
      else if (impact < 50 && effort < 50) quadrant = 'nice';
      else quadrant = 'deprioritize';

      return {
        name: opp.name,
        impact,
        effort,
        quadrant
      };
    });

    // Group by quadrant
    const byQuadrant: Record<string, typeof oppScores> = {
      strategic: [],
      quick: [],
      deprioritize: [],
      nice: []
    };

    oppScores.forEach(opp => {
      byQuadrant[opp.quadrant].push(opp);
    });

    matrixesHTML += `
      <div class="matrix-container">
        <div class="matrix-title">${config.name}</div>
        <div class="matrix-grid">
          <div class="matrix-y-label">Implementation Effort (Lower is Better)</div>
          <div class="matrix-quadrants">
            <!-- Top Left: Strategic Goals (high impact, high effort) -->
            <div class="quadrant quadrant-strategic">
              <div class="quadrant-label">Strategic Goals</div>
              ${byQuadrant.strategic.map(opp => 
                `<div class="opportunity-dot">${opp.name} (${Math.round(opp.impact)}, ${Math.round(opp.effort)})</div>`
              ).join('') || '<div style="color: #6b7280; font-size: 13px;">No opportunities</div>'}
            </div>
            
            <!-- Top Right: Quick Wins (high impact, low effort) -->
            <div class="quadrant quadrant-quick">
              <div class="quadrant-label">Quick Wins</div>
              ${byQuadrant.quick.map(opp => 
                `<div class="opportunity-dot">${opp.name} (${Math.round(opp.impact)}, ${Math.round(opp.effort)})</div>`
              ).join('') || '<div style="color: #6b7280; font-size: 13px;">No opportunities</div>'}
            </div>
            
            <!-- Bottom Left: Deprioritize (low impact, high effort) -->
            <div class="quadrant quadrant-deprioritize">
              <div class="quadrant-label">Deprioritize</div>
              ${byQuadrant.deprioritize.map(opp => 
                `<div class="opportunity-dot">${opp.name} (${Math.round(opp.impact)}, ${Math.round(opp.effort)})</div>`
              ).join('') || '<div style="color: #6b7280; font-size: 13px;">No opportunities</div>'}
            </div>
            
            <!-- Bottom Right: Nice-To-Haves (low impact, low effort) -->
            <div class="quadrant quadrant-nice">
              <div class="quadrant-label">Nice-To-Haves</div>
              ${byQuadrant.nice.map(opp => 
                `<div class="opportunity-dot">${opp.name} (${Math.round(opp.impact)}, ${Math.round(opp.effort)})</div>`
              ).join('') || '<div style="color: #6b7280; font-size: 13px;">No opportunities</div>'}
            </div>
          </div>
          <div class="matrix-x-label">Business Impact (Higher is Better)</div>
        </div>
      </div>
    `;
  });

  matrixesHTML += `</div>`;

  return matrixesHTML;
}

function generateMethodologySection(t: any): string {
  return `
    <div class="methodology-section">
      <h2>Scoring Methodology & Calculations</h2>
      <p style="color: #9ca3af; margin-bottom: 24px;">
        This section explains how all scores and metrics in this snapshot are calculated, ensuring full transparency and enabling you to validate our analysis.
      </p>

      <div class="methodology-block">
        <div class="methodology-title">Business Impact Score (X-Axis)</div>
        <div class="methodology-content">
          <p>Business Impact measures the relative value of an automation opportunity to your organization. It's calculated as a company-relative metric to ensure fair comparison regardless of company size:</p>
          
          <div class="formula-block">
ROI Score = (Annual ROI ÷ Company Annual Revenue) × 1000
  → Capped at 100
  → Example: $100k ROI / $10M revenue × 1000 = 10 points

FTE Score = (FTE Savings ÷ Total Employees) × 1000
  → Capped at 100
  → Example: 2 FTE / 50 employees × 1000 = 40 points
          </div>

          <p><strong>Base Calculation (Time Savings Only):</strong></p>
          <ul style="margin-left: 20px; color: #d1d5db;">
            <li>Annual ROI: 60%</li>
            <li>Annual Hours Saved (as FTE): 40%</li>
          </ul>

          <p style="margin-top: 12px;"><strong>With Error Reduction:</strong></p>
          <ul style="margin-left: 20px; color: #d1d5db;">
            <li>Annual ROI: 45%</li>
            <li>Annual Hours Saved: 30%</li>
            <li>Error Impact: 25%</li>
          </ul>

          <p style="margin-top: 12px;"><strong>With Revenue Uplift:</strong></p>
          <ul style="margin-left: 20px; color: #d1d5db;">
            <li>Annual ROI: 45%</li>
            <li>Annual Hours Saved: 30%</li>
            <li>Revenue Impact: 25%</li>
          </ul>

          <p style="margin-top: 12px;"><strong>With Both (All 3 Metrics):</strong></p>
          <ul style="margin-left: 20px; color: #d1d5db;">
            <li>Annual ROI: 40%</li>
            <li>Annual Hours Saved: 25%</li>
            <li>Error Impact: 20%</li>
            <li>Revenue Impact: 15%</li>
          </ul>

          <p style="margin-top: 16px; color: #10b981;">
            <strong>Why company-relative?</strong> A $100k automation saving means something very different to a $2M company versus a $100M company. By expressing ROI and FTE as percentages of your company's financials, we ensure opportunities are fairly prioritized based on your specific context.
          </p>
        </div>
      </div>

      <div class="methodology-block">
        <div class="methodology-title">Implementation Effort Score (Y-Axis)</div>
        <div class="methodology-content">
          <p>Implementation Effort represents the difficulty and resource requirements for deploying an automation. Lower scores indicate easier implementation:</p>
          
          <div class="formula-block">
Implementation Effort = 
  (Inverted Readiness × 40%) +
  (Normalized Ramp-up Period × 25%) +
  (Normalized Payback Period × 25%) +
  (Normalized Training Hours × 10%)

Where:
  • Readiness inverted: (100 - ReadinessScore)
  • Ramp-up: 3 months = 0, 18+ months = 100
  • Payback: 6 months = 0, 36+ months = 100
  • Training: 2 hours = 0, 40+ hours = 100
          </div>

          <p style="color: #9ca3af; margin-top: 12px; font-size: 14px;">
            The Readiness Score (from TFA + PIF) is the primary driver at 40%, because strong technical and operational readiness dramatically reduces implementation risk and timeline. The other factors account for the specific characteristics of each opportunity.
          </p>
        </div>
      </div>

      <div class="methodology-block">
        <div class="methodology-title">Readiness Rubric Calculation</div>
        <div class="methodology-content">
          <p>The Readiness Rubric combines Technical Feasibility (TFA) and Operational Readiness (PIF) with specific weightings validated across hundreds of automation projects:</p>
          
          <div class="formula-block">
Total Readiness = (TFA Score × 60%) + (PIF Score × 40%)

TFA Components (60% of total):
  • Data Quality: 18% (30% of TFA × 60%)
  • Integration Feasibility: 18% (30% of TFA × 60%)
  • System Environment: 15% (25% of TFA × 60%)
  • Security/Compliance: 9% (15% of TFA × 60%)

PIF Components (40% of total):
  • Process Clarity: 8% (~20% of PIF × 40%)
  • Change Magnitude: 8% (~20% of PIF × 40%)
  • Workflow Brittleness: 6% (~15% of PIF × 40%)
          </div>

          <p style="margin-top: 16px; color: #10b981;">
            <strong>Why 60/40 split?</strong> Technical infrastructure (TFA) is weighted higher because even the best operational conditions cannot overcome fundamental technical limitations. However, operational readiness (PIF) is still critical—the best technology fails without user adoption and process clarity.
          </p>
        </div>
      </div>

      <div class="methodology-block">
        <div class="methodology-title">TFA Section Scoring</div>
        <div class="methodology-content">
          <p>Each TFA question is scored 1-5 (plus "Don't Know" option). Section scores are calculated as weighted averages:</p>
          
          <div class="formula-block">
Section Score = Σ(Question Score × Question Weight) ÷ Σ(Question Weights)
  → Normalized to 0-100 scale
  → "Don't Know" responses excluded from calculation
  → Missing knowledge gaps identified for follow-up
          </div>

          <p style="color: #9ca3af; margin-top: 12px; font-size: 14px;">
            Questions within each section have different weights based on their impact on automation feasibility. For example, API availability is weighted more heavily than monitoring capabilities in the System Environment section.
          </p>
        </div>
      </div>

      <div class="methodology-block">
        <div class="methodology-title">PIF Aggregation Across Respondents</div>
        <div class="methodology-content">
          <p>When multiple people complete the PIF for a workflow, their responses are aggregated statistically:</p>
          
          <div class="formula-block">
For each metric (Process Clarity, Change Magnitude, Workflow Brittleness):
  • Average: Mean score across all respondents
  • Min/Max: Range of responses
  • Standard Deviation: Measure of consensus
  
High standard deviation indicates disagreement and warrants investigation.
Low standard deviation indicates strong consensus.
          </div>

          <p style="margin-top: 16px; color: #10b981;">
            <strong>Why aggregate?</strong> Different stakeholders experience workflows differently. A manager may rate Process Clarity highly due to documented procedures, while a frontline worker may rate it low due to real-world complexity. Seeing the range and variation provides crucial insights.
          </p>
        </div>
      </div>

      <div style="margin-top: 32px; padding: 24px; background: #1f2937; border-radius: 8px; border-left: 4px solid #10b981;">
        <p style="color: #d1d5db; line-height: 1.8;">
          <strong style="color: #10b981; font-size: 18px;">Data Integrity Commitment</strong><br><br>
          All calculations in this snapshot are derived directly from your submitted TFA and PIF responses using the formulas documented above. No assumptions, estimates, or "black box" algorithms are used. Every score can be independently verified by reviewing your source data and applying these same calculations.
          <br><br>
          This snapshot is designed to be a trusted decision-making tool—not a sales document. Our recommendations are based solely on the objective analysis of your technical and operational readiness.
        </p>
      </div>
    </div>
  `;
}

function getFeasibilityBand(score: number): string {
  if (score >= 80) return 'Very High';
  if (score >= 65) return 'High';
  if (score >= 50) return 'Moderate';
  if (score >= 35) return 'Low';
  return 'Very Low';
}

function formatCurrency(amount: number, language: 'en' | 'es'): string {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: language === 'en' ? 'USD' : 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
