/**
 * Centralized Report Translations
 * 
 * This file contains all UI translations for the Executive Diagnostic Report.
 * It ensures translation key parity between English and Spanish by defining
 * both languages in a single, strongly-typed structure.
 */

/**
 * Translation structure type definition
 */
export interface ReportTranslations {
  // Cover page
  coverTitle: string;
  coverPage: {
    preparedFor: string;
    by: string;
    confidential: string;
    executiveDiagnosticReport: string;
  };
  
  // Fallback messages (when no data exists)
  fallbackMessages: {
    noStrategicBets: string;
    noNiceToHave: string;
    systemEnvironmentLimitations: string;
  };
  
  // Matrix descriptions
  matrixDescriptions: {
    baseMatrix: string;
  };
  
  // Roadmap phase headers
  phaseHeaders: {
    phase1: string;
    phase2: string;
    phase3: string;
  };
  
  // Conclusions section
  conclusions: {
    title: string;
    keyConclusions: string;
    recommendedNextSteps: string;
    step1Title: string;
    step1Content: string;
    step2Title: string;
    step2Content: string;
    step3Title: string;
    step3Content: string;
    step4Title: string;
    step4Content: string;
    closingStatement: string;
  };
  
  // Appendix subsections
  appendixSubsections: {
    a7: string;
  };
  
  // Table captions
  tableCaptions: {
    "4.3": string;
    "4.4": string;
    "5.1": string;
    "5.2": string;
    "5.3": string;
    "6.1": string;
    "6.2": string;
    "6.3": string;
    "6.4": string;
    "B.1": string;
    "D.0a": string;
    "D.0b": string;
    "D.1": string;
    "E.2": string;
    "E.4": string;
    "E.5": string;
    "E.6": string;
    "F.1": string;
  };
  
  // Column headers for various tables
  headers: {
    workflow: string;
    opportunity: string;
    annualBenefit: string;
    roi: string;
    payback: string;
    fteSaved: string;
    tfaScore: string;
    pifScore: string;
    readiness: string;
    band: string;
    estCost: string;
    stepNumber: string;
    stepName: string;
    swotCategory: string;
    readinessInsight: string;
    evidence: string;
    recommendedAction: string;
    metric: string;
    weight: string;
    description: string;
    quadrant: string;
    opportunities: string;
    count: string;
    component: string;
    value: string;
    formula: string;
    category: string;
    workflowName: string;
    dataField: string;
    source: string;
    respondentName: string;
    respondentRole: string;
    collectionDate: string;
    verificationStatus: string;
    questionText: string;
    score: string;
    notes: string;
    purpose: string;
    impactArea: string;
    keyMetrics: string;
    adjustmentCategory: string;
    conservativeRationale: string;
    variable: string;
    standardAssumption: string;
    rationale: string;
    weeklyHoursSaved: string;
    projectionHorizon: string;
    resolvedBy: string;
    role: string;
    gapQuestion: string;
    date: string;
  };
  
  // SWOT labels
  swot: {
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
  };
  
  // Matrix quadrant names
  matrix: {
    quickWins: string;
    strategicGoals: string;
    niceToHave: string;
    deprioritize: string;
  };
  
  // Section headers
  sections: {
    executiveSummary: string;
    confidentialityDisclaimer: string;
    methodologyOverview: string;
    diagnosticOverview: string;
    findingsAnalysis: string;
    automationRoadmap: string;
    keyConclusions: string;
    matrixVisualizations: string;
    baseOpportunityMatrix: string;
    enhancedOpportunityMatrix: string;
  };
  
  // Appendix titles
  appendices: {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
    f: string;
  };
  
  // Misc labels
  labels: {
    table: string;
    phase: string;
    keyMetric: string;
    financialMetric: string;
    businessImpactComponent: string;
    knowledgeGapResolution: string;
    diagnosticPeriod: string;
    leadAnalyst: string;
    version: string;
    tableOfContents: string;
    na: string;
    yes: string;
    no: string;
    step: string;
    months: string;
    generalOperations: string;
    department: string;
    type: string;
    method: string;
    gaps: string;
    consolidationName: string;
    constituentOpportunity: string;
    allFiguresModeled: string;
    allValuesModeled: string;
    performanceSummary: string;
    equivalentTo: string;
    ftesOrApproximately: string;
    hoursPerYearWith: string;
    monthsPeriod: string;
    consolidationsRepresent: string;
    portfolioSummary: string;
    consolidatedOpportunitiesShown: string;
    detailedPerOpportunity: string;
    knowledgeGapResolutionDetails: string;
    knowledgeGapResolutionPrefix: string;
  };
  
  // Readiness component labels
  readinessComponents: {
    systemEnvironment: string;
    dataQuality: string;
    integrationFeasibility: string;
    securityCompliance: string;
    processClarity: string;
    changeMagnitude: string;
    workflowBrittleness: string;
  };
  
  // Month names for date formatting
  months: {
    january: string;
    february: string;
    march: string;
    april: string;
    may: string;
    june: string;
    july: string;
    august: string;
    september: string;
    october: string;
    november: string;
    december: string;
  };
  
  // Specific table descriptions and content
  tableDescriptions: {
    totalAnnualBenefit: string;
    totalAnnualBenefitDesc: string;
    totalEstimatedCost: string;
    totalEstimatedCostDesc: string;
    averageRoi: string;
    averageRoiDesc: string;
    averagePayback: string;
    averagePaybackDesc: string;
    totalFteCapacity: string;
    totalFteCapacityDesc: string;
    timeSavings: string;
    timeSavingsDesc: string;
    qualityImpact: string;
    qualityImpactDesc: string;
    revenueUplift: string;
    revenueUpliftDesc: string;
    rampUpPeriod: string;
    rampUpPeriodDesc: string;
    keyFinancialMetrics: string;
    businessImpactComponents: string;
    impactMajority: string;
    noSwotAvailable: string;
    consolidatedOpportunities: string;
    consolidatedDesc: string;
    roiInsightsPrefix: string;
    yearOnePartial: string;
    yearThreeCumulative: string;
    yearFiveLongTerm: string;
    allBenefitCalculations: string;
    realizationFactor: string;
    errorReduction: string;
    revenueExclusion: string;
    costContingency: string;
    yearOneBenefits: string;
    frameworkClosing: string;
    fullyLoadedRate: string;
    annualHours: string;
    currentStateFrequency: string;
    currentStateDuration: string;
    automationRealization: string;
    recurringCosts: string;
    oneTimeCosts: string;
    systemEnvironmentDesc: string;
    dataQualityDesc: string;
    integrationFeasibilityDesc: string;
    securityComplianceDesc: string;
    processClarityDesc: string;
    changeMagnitudeDesc: string;
    workflowBrittlenessDesc: string;
    whyTheseWeights: string;
    technicalComponents: string;
    operationalComponents: string;
    dataQualityIntegration: string;
    holisticReadiness: string;
    swotIntro: string;
    consolidationIntro: string;
  };
  
  // Section table titles
  sectionTitles: {
    topThreeOpportunities: string;
    financialSummary: string;
    executiveInterpretation: string;
    consolidatedOpportunitiesSection: string;
    roadmapTimeline: string;
  };
  
  // Gantt chart timeline headers
  ganttHeaders: {
    phase: string;
    month0to3: string;
    month3to6: string;
    month6to9: string;
    month9to12: string;
    month12to15: string;
    month15to18: string;
  };
}

/**
 * English Translations
 */
export const en: ReportTranslations = {
  coverTitle: "Automation Readiness & Opportunity Analysis",
  coverPage: {
    preparedFor: "Prepared for",
    by: "by",
    confidential: "Confidential",
    executiveDiagnosticReport: "Automat-IA Executive Diagnostic Report",
  },
  
  fallbackMessages: {
    noStrategicBets: "No Strategic Bet opportunities identified. All opportunities are either Quick Wins or require foundational improvements.",
    noNiceToHave: "No Nice-to-Have opportunities identified. All opportunities are either Quick Wins, Strategic Bets, or require foundational improvements.",
    systemEnvironmentLimitations: "System environment limitations",
  },
  
  matrixDescriptions: {
    baseMatrix: "The Base Matrix illustrates the relative efficiency and feasibility of each opportunity, while the Enhanced Matrix incorporates strategic and cross-functional impact. Together, they present a balanced view of short-term gains and long-term automation potential.",
  },
  
  phaseHeaders: {
    phase1: "Phase 1: Quick Wins",
    phase2: "Phase 2: Foundational",
    phase3: "Phase 3: Strategic",
  },
  
  conclusions: {
    title: "Conclusions and Next Steps",
    keyConclusions: "Key Conclusions",
    recommendedNextSteps: "Recommended Next Steps",
    step1Title: "1. Executive Alignment Session",
    step1Content: "Convene leadership to review findings, validate prioritization, and secure sponsorship for Phase 1 initiatives.",
    step2Title: "2. Detailed Solution Design (Phase 1 Opportunities)",
    step2Content: "Conduct technical design sessions for top-priority Quick Wins to define architecture, integration points, and implementation approach.",
    step3Title: "3. Tool Procurement and Vendor Setup",
    step3Content: "Finalize automation platform selection, execute contracts, and initiate environment setup.",
    step4Title: "4. Center of Excellence (CoE) Readiness",
    step4Content: "Establish governance, standards, and support capabilities to sustain automation efforts beyond Phase 1.",
    closingStatement: "This diagnostic provides a data-driven foundation for your automation journey. We recommend moving forward with Phase 1 Quick Wins within the next quarter to begin realizing benefits and building organizational capability.",
  },
  
  appendixSubsections: {
    a7: "A.7 Opportunity Matrix Methodology",
  },
  
  tableCaptions: {
    "4.3": "Top Three Automation Opportunities",
    "4.4": "Financial Summary of Top Opportunities",
    "5.1": "Readiness Summary by Workflow",
    "5.2": "ROI Insights by Opportunity",
    "5.3": "Opportunity Matrix Distribution",
    "6.1": "Phase 1 — Quick Wins",
    "6.2": "Phase 2 — Foundational",
    "6.3": "Phase 3 — Strategic",
    "6.4": "18-Month Implementation Timeline",
    "B.1": "Readiness Score Component Weighting",
    "D.0a": "Consolidated Opportunity Summary",
    "D.0b": "Consolidation Constituent Mapping",
    "D.1": "Portfolio Overview — All Opportunities",
    "E.2": "Net Benefit Formulas",
    "E.4": "Annual Benefit Breakdown",
    "E.5": "Scenario Adjustment Framework",
    "E.6": "Key Modeling Assumptions",
    "F.1": "Data Provenance and Audit Trail",
  },
  
  headers: {
    workflow: "Workflow",
    opportunity: "Opportunity",
    annualBenefit: "Annual Benefit",
    roi: "ROI %",
    payback: "Payback (months)",
    fteSaved: "FTE Saved",
    tfaScore: "TFA Score",
    pifScore: "PIF Score",
    readiness: "Readiness",
    band: "Band",
    estCost: "Est. Cost",
    stepNumber: "Step #",
    stepName: "Step Name",
    swotCategory: "SWOT Category",
    readinessInsight: "Readiness Insight",
    evidence: "Evidence",
    recommendedAction: "Recommended Action",
    metric: "Metric",
    weight: "Weight",
    description: "Description",
    quadrant: "Quadrant",
    opportunities: "Opportunities",
    count: "Count",
    component: "Component",
    value: "Value",
    formula: "Formula",
    category: "Category",
    workflowName: "Workflow Name",
    dataField: "Data Field",
    source: "Source",
    respondentName: "Respondent Name",
    respondentRole: "Respondent Role",
    collectionDate: "Collection Date",
    verificationStatus: "Verification Status",
    questionText: "Question Text",
    score: "Score",
    notes: "Notes",
    purpose: "Purpose",
    impactArea: "Impact Area",
    keyMetrics: "Key Metrics",
    adjustmentCategory: "Adjustment Category",
    conservativeRationale: "Conservative Modeling Rationale",
    variable: "Variable",
    standardAssumption: "Standard Assumption",
    rationale: "Rationale",
    weeklyHoursSaved: "Weekly Hours Saved",
    projectionHorizon: "Projection Horizon",
    resolvedBy: "Resolved By",
    role: "Role",
    gapQuestion: "Gap?",
    date: "Date",
  },
  
  swot: {
    strengths: "Strengths:",
    weaknesses: "Weaknesses:",
    opportunities: "Opportunities:",
    threats: "Threats:",
  },
  
  matrix: {
    quickWins: "Quick Wins",
    strategicGoals: "Strategic Goals",
    niceToHave: "Nice to Have",
    deprioritize: "Deprioritize",
  },
  
  sections: {
    executiveSummary: "Executive Summary",
    confidentialityDisclaimer: "Confidentiality Disclaimer",
    methodologyOverview: "Methodology Overview",
    diagnosticOverview: "Diagnostic Overview",
    findingsAnalysis: "Findings & Analysis",
    automationRoadmap: "Automation Roadmap",
    keyConclusions: "Key Conclusions",
    matrixVisualizations: "Matrix Visualizations",
    baseOpportunityMatrix: "Base Opportunity Matrix (Operational Impact View)",
    enhancedOpportunityMatrix: "Enhanced Opportunity Matrix (Strategic Impact View)",
  },
  
  appendices: {
    a: "Appendix A: Project Scope and Interview Summary",
    b: "Appendix B: Readiness Score Metric Weighting",
    c: "Appendix C: Step-Level SWOT Analysis by Workflow",
    d: "Appendix D: Opportunity-Level Financial Details",
    e: "Appendix E: ROI Modeling Framework",
    f: "Appendix F: Data Provenance and Audit Trail",
  },
  
  labels: {
    table: "Table",
    phase: "Phase",
    keyMetric: "Key Metric",
    financialMetric: "Financial Metric",
    businessImpactComponent: "Business Impact Component",
    knowledgeGapResolution: "Knowledge Gap Resolution",
    diagnosticPeriod: "Diagnostic Period",
    leadAnalyst: "Lead Analyst",
    version: "Version",
    tableOfContents: "Table of Contents",
    na: "N/A",
    yes: "Yes",
    no: "No",
    step: "Step",
    months: " mo",
    generalOperations: "General Operations",
    department: "Department",
    type: "Type",
    method: "Method",
    gaps: "Gaps",
    consolidationName: "Consolidation Name",
    constituentOpportunity: "Constituent Opportunity",
    allFiguresModeled: "All figures modeled under Automat-IA's Conservative Scenario Framework; rounded to the nearest hundred.",
    allValuesModeled: "All values modeled under Automat-IA Conservative Scenario.",
    performanceSummary: "Performance Summary. Under the conservative scenario, estimated annual benefit is",
    equivalentTo: ", equivalent to",
    ftesOrApproximately: " FTEs or approximately",
    hoursPerYearWith: " hours per year, with an expected payback of",
    monthsPeriod: " months.",
    consolidationsRepresent: "Consolidations represent strategic groupings recommended for coordinated implementation. Individual constituent opportunities and their detailed financial analyses are presented in subsequent sections.",
    portfolioSummary: "Use the portfolio summary to compare opportunity scale, cost, and realization pace at a glance.",
    consolidatedOpportunitiesShown: "Consolidated opportunities are shown aggregated above; individual constituents are included here for detailed review.",
    detailedPerOpportunity: "Detailed per-opportunity pages follow.",
    knowledgeGapResolutionDetails: "Knowledge Gap Resolution Details:",
    knowledgeGapResolutionPrefix: "Knowledge Gap Resolution —",
  },
  
  readinessComponents: {
    systemEnvironment: "System Environment",
    dataQuality: "Data Quality",
    integrationFeasibility: "Integration Feasibility",
    securityCompliance: "Security/Compliance",
    processClarity: "Process Clarity",
    changeMagnitude: "Change Magnitude",
    workflowBrittleness: "Workflow Brittleness",
  },
  
  months: {
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
  },
  
  tableDescriptions: {
    totalAnnualBenefit: "Total Annual Benefit",
    totalAnnualBenefitDesc: "Combined quantifiable value across identified opportunities",
    totalEstimatedCost: "Total Estimated Implementation Cost",
    totalEstimatedCostDesc: "Includes implementation, training, and change management",
    averageRoi: "Average ROI",
    averageRoiDesc: "Modeled under the Conservative Scenario Framework",
    averagePayback: "Average Payback Period",
    averagePaybackDesc: "Time to recover implementation cost",
    totalFteCapacity: "Total FTE Capacity Saved",
    totalFteCapacityDesc: "Full-time equivalent hours freed for higher-value work",
    timeSavings: "Time Savings",
    timeSavingsDesc: "Primary efficiency gain from process automation",
    qualityImpact: "Quality Impact",
    qualityImpactDesc: "Error reduction benefits modeled conservatively where data available",
    revenueUplift: "Revenue Uplift",
    revenueUpliftDesc: "Capacity reallocation potential subject to business validation",
    rampUpPeriod: "Ramp-Up Period",
    rampUpPeriodDesc: "Time to reach steady-state performance after implementation",
    keyFinancialMetrics: "Key Financial Metrics",
    businessImpactComponents: "Business Impact Components",
    impactMajority: "For this opportunity, the majority of measurable benefit is driven by time savings. Quality and revenue impacts are modeled conservatively or omitted where supporting data is insufficient. Ramp-up accounts for adoption and stabilization so Year-1 results reflect achievable performance.",
    noSwotAvailable: "No step-level SWOT analyses available.",
    consolidatedOpportunities: "D.0 Consolidated Opportunities",
    consolidatedDesc: "When multiple automation opportunities exist across related process steps within a workflow, they may be consolidated into strategic implementation packages. Consolidations enable coordinated deployment that leverages shared resources, minimizes integration overhead, and achieves greater business impact through platform-level synergy. The tables below present consolidated opportunity summaries with aggregated financial metrics and constituent mappings for traceability.",
    roiInsightsPrefix: "D.2.",
    yearOnePartial: "Accounts for partial realization during adoption phase",
    yearThreeCumulative: "Cumulative value over initial contract period",
    yearFiveLongTerm: "Long-term strategic value assessment",
    allBenefitCalculations: "All benefit calculations apply downward multipliers in conservative modeling to avoid overstatement.",
    realizationFactor: "Apply 60-75% realization factor to account for exceptions, learning curves, and process variations",
    errorReduction: "Only include when error data is documented; apply 50% discount to projected improvements",
    revenueExclusion: "Exclude unless business validates capacity can be redirected; apply 40% discount when included",
    costContingency: "Add 20% contingency to implementation costs to reflect typical project overruns",
    yearOneBenefits: "Year 1 benefits discounted by 50% to reflect gradual adoption and stabilization",
    frameworkClosing: "Together these controls form the Conservative Scenario Framework, ensuring projections remain achievable, evidence-based, and comparable across diagnostics.",
    fullyLoadedRate: "Blended rate reflecting salary, benefits, and overhead across roles",
    annualHours: "52 weeks × 40 hours, industry standard for FTE calculations",
    currentStateFrequency: "Current state as reported",
    currentStateDuration: "PIF data establishes pre-automation performance baseline",
    automationRealization: "Realistic automation scope accounting for exceptions and edge cases",
    recurringCosts: "Annual software licenses, maintenance, and support",
    oneTimeCosts: "Includes build, configuration, testing, and change management",
    systemEnvironmentDesc: "API accessibility, structured data formats, and automation-friendly system architecture",
    dataQualityDesc: "Completeness, consistency, standardization, and reliability of data used in the workflow",
    integrationFeasibilityDesc: "Ease of system integration, availability of connectors, and cross-platform data flow",
    securityComplianceDesc: "Regulatory requirements, data sensitivity, and access control considerations",
    processClarityDesc: "Documentation quality, rule consistency, and decision logic transparency",
    changeMagnitudeDesc: "Frequency of process changes, adaptability requirements, and rules stability",
    workflowBrittlenessDesc: "Error frequency, exception handling needs, and input consistency challenges",
    whyTheseWeights: "Why These Weights Matter:",
    technicalComponents: "Technical components (System Environment, Data Quality, Integration, Security/Compliance) total 60%, reflecting the reality that technical barriers are harder and costlier to remediate.",
    operationalComponents: "Operational components (Process Clarity, Change Magnitude, Workflow Brittleness) total 40%, capturing process maturity and organizational readiness factors critical to adoption success.",
    dataQualityIntegration: "Data Quality and Integration Feasibility receive the highest individual weights (18% each) as they are the primary determinants of automation viability.",
    holisticReadiness: "Combined, these seven components produce a holistic readiness score that balances technical feasibility with operational reality.",
    swotIntro: "This appendix consolidates step-level SWOT analyses across all workflows, providing a comprehensive view of automation readiness at the process step level. Each workflow is presented with its constituent steps, followed by the Strengths, Weaknesses, Opportunities, and Threats identified through step-level readiness assessment.",
    consolidationIntro: "The Readiness Score is calculated as a weighted combination of the Technical Feasibility Assessment (TFA) and Process Insights Form (PIF). These weights reflect the relative importance of technical and operational factors in determining automation feasibility.",
  },
  
  sectionTitles: {
    topThreeOpportunities: "4.3 Top Three Automation Opportunities",
    financialSummary: "4.4 Financial Summary of Top Opportunities",
    executiveInterpretation: "5.4 Executive Interpretation",
    consolidatedOpportunitiesSection: "D.0 Consolidated Opportunities",
    roadmapTimeline: "6.4 18-Month Automation Roadmap",
  },
  
  ganttHeaders: {
    phase: "Phase",
    month0to3: "0-3 mo",
    month3to6: "3-6 mo",
    month6to9: "6-9 mo",
    month9to12: "9-12 mo",
    month12to15: "12-15 mo",
    month15to18: "15-18 mo",
  },
};

/**
 * Spanish Translations
 */
export const es: ReportTranslations = {
  coverTitle: "Análisis de Preparación y Oportunidades de Automatización",
  coverPage: {
    preparedFor: "Preparado para",
    by: "por",
    confidential: "Confidencial",
    executiveDiagnosticReport: "Informe Ejecutivo de Diagnóstico de Automat-IA",
  },
  
  fallbackMessages: {
    noStrategicBets: "No se identificaron oportunidades de Apuestas Estratégicas. Todas las oportunidades son Logros Rápidos o requieren mejoras fundacionales.",
    noNiceToHave: "No se identificaron oportunidades Deseables. Todas las oportunidades son Logros Rápidos, Apuestas Estratégicas o requieren mejoras fundacionales.",
    systemEnvironmentLimitations: "Limitaciones del entorno del sistema",
  },
  
  matrixDescriptions: {
    baseMatrix: "La Matriz Base ilustra la eficiencia relativa y viabilidad de cada oportunidad, mientras que la Matriz Mejorada incorpora impacto estratégico y funcional cruzado. Juntas, presentan una vista equilibrada de ganancias a corto plazo y potencial de automatización a largo plazo.",
  },
  
  phaseHeaders: {
    phase1: "Fase 1: Logros Rápidos",
    phase2: "Fase 2: Fundacional",
    phase3: "Fase 3: Estratégica",
  },
  
  conclusions: {
    title: "Conclusiones y Próximos Pasos",
    keyConclusions: "Conclusiones Clave",
    recommendedNextSteps: "Próximos Pasos Recomendados",
    step1Title: "1. Sesión de Alineación Ejecutiva",
    step1Content: "Reunir al liderazgo para revisar hallazgos, validar priorización y asegurar patrocinio para iniciativas de Fase 1.",
    step2Title: "2. Diseño Detallado de Solución (Oportunidades de Fase 1)",
    step2Content: "Realizar sesiones de diseño técnico para Logros Rápidos de alta prioridad para definir arquitectura, puntos de integración y enfoque de implementación.",
    step3Title: "3. Adquisición de Herramientas y Configuración de Proveedores",
    step3Content: "Finalizar selección de plataforma de automatización, ejecutar contratos e iniciar configuración de entorno.",
    step4Title: "4. Preparación del Centro de Excelencia (CoE)",
    step4Content: "Establecer gobierno, estándares y capacidades de soporte para sostener los esfuerzos de automatización más allá de la Fase 1.",
    closingStatement: "Este diagnóstico proporciona una base basada en datos para su viaje de automatización. Recomendamos avanzar con los Logros Rápidos de Fase 1 dentro del próximo trimestre para comenzar a realizar beneficios y desarrollar capacidad organizacional.",
  },
  
  appendixSubsections: {
    a7: "A.7 Metodología de la Matriz de Oportunidades",
  },
  
  tableCaptions: {
    "4.3": "Tres Principales Oportunidades de Automatización",
    "4.4": "Resumen Financiero de Principales Oportunidades",
    "5.1": "Resumen de Preparación por Flujo de Trabajo",
    "5.2": "Información de ROI por Oportunidad",
    "5.3": "Distribución de Matriz de Oportunidades",
    "6.1": "Fase 1 — Logros Rápidos",
    "6.2": "Fase 2 — Fundacional",
    "6.3": "Fase 3 — Estratégica",
    "6.4": "Cronograma de Implementación de 18 Meses",
    "B.1": "Ponderación de Componentes de Puntuación de Preparación",
    "D.0a": "Resumen de Oportunidades Consolidadas",
    "D.0b": "Mapeo de Constituyentes de Consolidación",
    "D.1": "Resumen de Cartera — Todas las Oportunidades",
    "E.2": "Fórmulas de Beneficio Neto",
    "E.4": "Desglose de Beneficio Anual",
    "E.5": "Marco de Ajuste de Escenarios",
    "E.6": "Supuestos Clave de Modelado",
    "F.1": "Procedencia de Datos y Pista de Auditoría",
  },
  
  headers: {
    workflow: "Flujo de Trabajo",
    opportunity: "Oportunidad",
    annualBenefit: "Beneficio Anual",
    roi: "ROI %",
    payback: "Recuperación (meses)",
    fteSaved: "FTE Ahorrados",
    tfaScore: "Puntuación TFA",
    pifScore: "Puntuación PIF",
    readiness: "Preparación",
    band: "Banda",
    estCost: "Costo Est.",
    stepNumber: "Paso #",
    stepName: "Nombre del Paso",
    swotCategory: "Categoría FODA",
    readinessInsight: "Percepción de Preparación",
    evidence: "Evidencia",
    recommendedAction: "Acción Recomendada",
    metric: "Métrica",
    weight: "Peso",
    description: "Descripción",
    quadrant: "Cuadrante",
    opportunities: "Oportunidades",
    count: "Cantidad",
    component: "Componente",
    value: "Valor",
    formula: "Fórmula",
    category: "Categoría",
    workflowName: "Nombre del Flujo de Trabajo",
    dataField: "Campo de Datos",
    source: "Fuente",
    respondentName: "Nombre del Encuestado",
    respondentRole: "Rol del Encuestado",
    collectionDate: "Fecha de Recopilación",
    verificationStatus: "Estado de Verificación",
    questionText: "Texto de la Pregunta",
    score: "Puntuación",
    notes: "Notas",
    purpose: "Propósito",
    impactArea: "Área de Impacto",
    keyMetrics: "Métricas Clave",
    adjustmentCategory: "Categoría de Ajuste",
    conservativeRationale: "Fundamento de Modelado Conservador",
    variable: "Variable",
    standardAssumption: "Supuesto Estándar",
    rationale: "Fundamento",
    weeklyHoursSaved: "Horas Semanales Ahorradas",
    projectionHorizon: "Horizonte de Proyección",
    resolvedBy: "Resuelto Por",
    role: "Rol",
    gapQuestion: "¿Brecha?",
    date: "Fecha",
  },
  
  swot: {
    strengths: "Fortalezas:",
    weaknesses: "Debilidades:",
    opportunities: "Oportunidades:",
    threats: "Amenazas:",
  },
  
  matrix: {
    quickWins: "Logros Rápidos",
    strategicGoals: "Metas Estratégicas",
    niceToHave: "Deseable",
    deprioritize: "Despriorizar",
  },
  
  sections: {
    executiveSummary: "Resumen Ejecutivo",
    confidentialityDisclaimer: "Descargo de Confidencialidad",
    methodologyOverview: "Resumen de Metodología",
    diagnosticOverview: "Resumen Diagnóstico",
    findingsAnalysis: "Hallazgos y Análisis",
    automationRoadmap: "Hoja de Ruta de Automatización",
    keyConclusions: "Conclusiones Clave",
    matrixVisualizations: "Visualizaciones de Matriz",
    baseOpportunityMatrix: "Matriz de Oportunidades Base (Vista de Impacto Operacional)",
    enhancedOpportunityMatrix: "Matriz de Oportunidades Mejorada (Vista de Impacto Estratégico)",
  },
  
  appendices: {
    a: "Apéndice A: Alcance del Proyecto y Resumen de Entrevistas",
    b: "Apéndice B: Ponderación de Métricas de Puntuación de Preparación",
    c: "Apéndice C: Análisis FODA a Nivel de Paso por Flujo de Trabajo",
    d: "Apéndice D: Detalles Financieros a Nivel de Oportunidad",
    e: "Apéndice E: Marco de Modelado de ROI",
    f: "Apéndice F: Procedencia de Datos y Pista de Auditoría",
  },
  
  labels: {
    table: "Tabla",
    phase: "Fase",
    keyMetric: "Métrica Clave",
    financialMetric: "Métrica Financiera",
    businessImpactComponent: "Componente de Impacto Empresarial",
    knowledgeGapResolution: "Resolución de Brecha de Conocimiento",
    diagnosticPeriod: "Período de Diagnóstico",
    leadAnalyst: "Analista Principal",
    version: "Versión",
    tableOfContents: "Tabla de Contenidos",
    na: "N/A",
    yes: "Sí",
    no: "No",
    step: "Paso",
    months: " meses",
    generalOperations: "Operaciones Generales",
    department: "Departamento",
    type: "Tipo",
    method: "Método",
    gaps: "Brechas",
    consolidationName: "Nombre de Consolidación",
    constituentOpportunity: "Oportunidad Constituyente",
    allFiguresModeled: "Todas las cifras modeladas bajo el Marco de Escenario Conservador de Automat-IA; redondeadas a la centena más cercana.",
    allValuesModeled: "Todos los valores modelados bajo Escenario Conservador de Automat-IA.",
    performanceSummary: "Resumen de Rendimiento. Bajo el escenario conservador, el beneficio anual estimado es",
    equivalentTo: ", equivalente a",
    ftesOrApproximately: " FTE o aproximadamente",
    hoursPerYearWith: " horas por año, con un retorno esperado de",
    monthsPeriod: " meses.",
    consolidationsRepresent: "Las consolidaciones representan agrupaciones estratégicas recomendadas para implementación coordinada. Las oportunidades constituyentes individuales y sus análisis financieros detallados se presentan en secciones posteriores.",
    portfolioSummary: "Use el resumen de cartera para comparar escala de oportunidad, costo y ritmo de realización de un vistazo.",
    consolidatedOpportunitiesShown: "Las oportunidades consolidadas se muestran agregadas arriba; los constituyentes individuales se incluyen aquí para revisión detallada.",
    detailedPerOpportunity: "Siguen las páginas detalladas por oportunidad.",
    knowledgeGapResolutionDetails: "Detalles de Resolución de Brecha de Conocimiento:",
    knowledgeGapResolutionPrefix: "Resolución de Brecha de Conocimiento —",
  },
  
  readinessComponents: {
    systemEnvironment: "Entorno del Sistema",
    dataQuality: "Calidad de Datos",
    integrationFeasibility: "Viabilidad de Integración",
    securityCompliance: "Seguridad/Cumplimiento",
    processClarity: "Claridad del Proceso",
    changeMagnitude: "Magnitud del Cambio",
    workflowBrittleness: "Fragilidad del Flujo de Trabajo",
  },
  
  months: {
    january: "Enero",
    february: "Febrero",
    march: "Marzo",
    april: "Abril",
    may: "Mayo",
    june: "Junio",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
    october: "Octubre",
    november: "Noviembre",
    december: "Diciembre",
  },
  
  tableDescriptions: {
    totalAnnualBenefit: "Beneficio Anual Total",
    totalAnnualBenefitDesc: "Valor cuantificable combinado a través de oportunidades identificadas",
    totalEstimatedCost: "Costo Total Estimado de Implementación",
    totalEstimatedCostDesc: "Incluye implementación, capacitación y gestión del cambio",
    averageRoi: "ROI Promedio",
    averageRoiDesc: "Modelado bajo el Marco de Escenario Conservador",
    averagePayback: "Período de Recuperación Promedio",
    averagePaybackDesc: "Tiempo para recuperar el costo de implementación",
    totalFteCapacity: "Capacidad Total de FTE Ahorrados",
    totalFteCapacityDesc: "Horas equivalentes a tiempo completo liberadas para trabajo de mayor valor",
    timeSavings: "Ahorro de Tiempo",
    timeSavingsDesc: "Ganancia de eficiencia primaria de la automatización de procesos",
    qualityImpact: "Impacto en Calidad",
    qualityImpactDesc: "Beneficios de reducción de errores modelados conservadoramente donde hay datos disponibles",
    revenueUplift: "Incremento de Ingresos",
    revenueUpliftDesc: "Potencial de reasignación de capacidad sujeto a validación empresarial",
    rampUpPeriod: "Período de Aceleración",
    rampUpPeriodDesc: "Tiempo para alcanzar rendimiento en estado estable después de la implementación",
    keyFinancialMetrics: "Métricas Financieras Clave",
    businessImpactComponents: "Componentes de Impacto Empresarial",
    impactMajority: "Para esta oportunidad, la mayoría del beneficio medible está impulsado por el ahorro de tiempo. Los impactos de calidad e ingresos se modelan conservadoramente o se omiten donde los datos de respaldo son insuficientes. La aceleración cuenta para la adopción y estabilización, por lo que los resultados del Año 1 reflejan el rendimiento alcanzable.",
    noSwotAvailable: "No hay análisis FODA a nivel de paso disponibles.",
    consolidatedOpportunities: "D.0 Oportunidades Consolidadas",
    consolidatedDesc: "Cuando existen múltiples oportunidades de automatización a través de pasos de proceso relacionados dentro de un flujo de trabajo, pueden consolidarse en paquetes de implementación estratégica. Las consolidaciones permiten despliegue coordinado que aprovecha recursos compartidos, minimiza sobrecarga de integración y logra mayor impacto empresarial a través de sinergia a nivel de plataforma. Las tablas a continuación presentan resúmenes de oportunidades consolidadas con métricas financieras agregadas y mapeos de constituyentes para trazabilidad.",
    roiInsightsPrefix: "D.2.",
    yearOnePartial: "Cuenta para realización parcial durante la fase de adopción",
    yearThreeCumulative: "Valor acumulativo durante el período de contrato inicial",
    yearFiveLongTerm: "Evaluación de valor estratégico a largo plazo",
    allBenefitCalculations: "Todos los cálculos de beneficios aplican multiplicadores a la baja en modelado conservador para evitar sobreestimación.",
    realizationFactor: "Aplicar factor de realización del 60-75% para tener en cuenta excepciones, curvas de aprendizaje y variaciones de proceso",
    errorReduction: "Incluir solo cuando los datos de error estén documentados; aplicar descuento del 50% a mejoras proyectadas",
    revenueExclusion: "Excluir a menos que el negocio valide que la capacidad puede redirigirse; aplicar descuento del 40% cuando se incluya",
    costContingency: "Agregar contingencia del 20% a costos de implementación para reflejar sobrecostos típicos de proyectos",
    yearOneBenefits: "Beneficios del Año 1 con descuento del 50% para reflejar adopción gradual y estabilización",
    frameworkClosing: "Juntos, estos controles forman el Marco de Escenario Conservador, asegurando que las proyecciones permanezcan alcanzables, basadas en evidencia y comparables entre diagnósticos.",
    fullyLoadedRate: "Tasa combinada que refleja salario, beneficios y gastos generales entre roles",
    annualHours: "52 semanas × 40 horas, estándar de la industria para cálculos de FTE",
    currentStateFrequency: "Estado actual según lo reportado",
    currentStateDuration: "Los datos PIF establecen la línea base de rendimiento pre-automatización",
    automationRealization: "Alcance de automatización realista que tiene en cuenta excepciones y casos extremos",
    recurringCosts: "Licencias de software anuales, mantenimiento y soporte",
    oneTimeCosts: "Incluye construcción, configuración, pruebas y gestión del cambio",
    systemEnvironmentDesc: "Accesibilidad de API, formatos de datos estructurados y arquitectura de sistema amigable para automatización",
    dataQualityDesc: "Completitud, consistencia, estandarización y confiabilidad de datos utilizados en el flujo de trabajo",
    integrationFeasibilityDesc: "Facilidad de integración de sistemas, disponibilidad de conectores y flujo de datos entre plataformas",
    securityComplianceDesc: "Requisitos regulatorios, sensibilidad de datos y consideraciones de control de acceso",
    processClarityDesc: "Calidad de documentación, consistencia de reglas y transparencia de lógica de decisión",
    changeMagnitudeDesc: "Frecuencia de cambios de proceso, requisitos de adaptabilidad y estabilidad de reglas",
    workflowBrittlenessDesc: "Frecuencia de errores, necesidades de manejo de excepciones y desafíos de consistencia de entrada",
    whyTheseWeights: "Por Qué Importan Estos Pesos:",
    technicalComponents: "Los componentes técnicos (Entorno del Sistema, Calidad de Datos, Integración, Seguridad/Cumplimiento) totalizan 60%, reflejando la realidad de que las barreras técnicas son más difíciles y costosas de remediar.",
    operationalComponents: "Los componentes operacionales (Claridad del Proceso, Magnitud del Cambio, Fragilidad del Flujo de Trabajo) totalizan 40%, capturando factores de madurez del proceso y preparación organizacional críticos para el éxito de la adopción.",
    dataQualityIntegration: "Calidad de Datos y Viabilidad de Integración reciben los pesos individuales más altos (18% cada uno) ya que son los determinantes primarios de viabilidad de automatización.",
    holisticReadiness: "Combinados, estos siete componentes producen una puntuación de preparación holística que equilibra viabilidad técnica con realidad operacional.",
    swotIntro: "Este apéndice consolida análisis FODA a nivel de paso en todos los flujos de trabajo, proporcionando una vista completa de preparación de automatización a nivel de paso de proceso. Cada flujo de trabajo se presenta con sus pasos constituyentes, seguido de las Fortalezas, Debilidades, Oportunidades y Amenazas identificadas a través de la evaluación de preparación a nivel de paso.",
    consolidationIntro: "La Puntuación de Preparación se calcula como una combinación ponderada de la Evaluación de Factibilidad Técnica (TFA) y el Formulario de Perspectivas de Proceso (PIF). Estos pesos reflejan la importancia relativa de factores técnicos y operacionales en determinar la viabilidad de automatización.",
  },
  
  sectionTitles: {
    topThreeOpportunities: "4.3 Tres Principales Oportunidades de Automatización",
    financialSummary: "4.4 Resumen Financiero de Principales Oportunidades",
    executiveInterpretation: "5.4 Interpretación Ejecutiva",
    consolidatedOpportunitiesSection: "D.0 Oportunidades Consolidadas",
    roadmapTimeline: "6.4 Hoja de Ruta de Automatización de 18 Meses",
  },
  
  ganttHeaders: {
    phase: "Fase",
    month0to3: "0-3 meses",
    month3to6: "3-6 meses",
    month6to9: "6-9 meses",
    month9to12: "9-12 meses",
    month12to15: "12-15 meses",
    month15to18: "15-18 meses",
  },
};

/**
 * Get translations for a specific language
 */
export function getTranslations(language: 'en' | 'es' = 'en'): ReportTranslations {
  return language === 'es' ? es : en;
}

/**
 * Format month name based on language
 */
export function getMonthName(monthIndex: number, language: 'en' | 'es' = 'en'): string {
  const t = getTranslations(language);
  const monthKeys: (keyof ReportTranslations['months'])[] = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  return t.months[monthKeys[monthIndex]];
}
