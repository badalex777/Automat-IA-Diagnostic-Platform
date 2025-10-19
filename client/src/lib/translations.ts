export type Language = "en" | "es";

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    create: string;
    update: string;
    search: string;
    filter: string;
    loading: string;
    error: string;
    success: string;
    required: string;
    optional: string;
    yes: string;
    no: string;
    back: string;
    next: string;
    submit: string;
    download: string;
    close: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    companies: string;
    documentation: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    companies: string;
    workflows: string;
    opportunities: string;
    createCompany: string;
    searchCompanies: string;
    noCompanies: string;
    noCompaniesDesc: string;
  };

  // Company
  company: {
    name: string;
    annualRevenue: string;
    totalEmployees: string;
    financialContext: string;
    workflows: string;
    opportunities: string;
    createWorkflow: string;
    companyDetails: string;
    editCompany: string;
    deleteCompany: string;
    confirmDelete: string;
    downloadSnapshot: string;
  };

  // Workflow
  workflow: {
    name: string;
    description: string;
    status: string;
    tfaOnly: string;
    tfaReadiness: string;
    readinessImpact: string;
    complete: string;
    viewTfa: string;
    viewPif: string;
    viewReadiness: string;
    viewOpportunities: string;
    createOpportunity: string;
    shareTfaLink: string;
    sharePifLink: string;
  };

  // TFA (Technical Feasibility Assessment)
  tfa: {
    title: string;
    subtitle: string;
    forWorkflow: string;
    selectLanguage: string;
    sections: {
      systemEnvironment: string;
      dataQuality: string;
      integrationFeasibility: string;
      securityCompliance: string;
    };
    score: string;
    feasibility: string;
    feasibilityBands: {
      veryHigh: string;
      high: string;
      moderate: string;
      low: string;
      veryLow: string;
    };
    respondent: string;
    gapMetadata: string;
    dontKnow: string;
    whyCantAnswer: string;
    whoMightKnow: string;
    analysis: string;
    executiveSummary: string;
    criticalGaps: string;
    keyStrengths: string;
    roadmap: string;
  };

  // PIF (Process Insight Form)
  pif: {
    title: string;
    subtitle: string;
    forWorkflow: string;
    selectLanguage: string;
    respondentInfo: string;
    yourName: string;
    yourRole: string;
    yourResponsibilities: string;
    sections: {
      processClarity: string;
      changeMagnitude: string;
      workflowBrittleness: string;
      timeSavings: string;
      revenueUplift: string;
      experience: string;
      timeVolume: string;
      qualityImpact: string;
    };
    scores: {
      processClarity: string;
      changeMagnitude: string;
      workflowBrittleness: string;
    };
    responses: string;
    respondents: string;
    aggregated: string;
    variance: {
      low: string;
      moderate: string;
      high: string;
    };
  };

  // Readiness Rubric
  readiness: {
    title: string;
    combinedScore: string;
    components: string;
    tfaWeight: string;
    pifWeight: string;
    swotAnalysis: string;
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
    requiresTfa: string;
    requiresPif: string;
  };

  // Opportunities
  opportunities: {
    title: string;
    create: string;
    edit: string;
    name: string;
    description: string;
    businessImpact: string;
    implementationEffort: string;
    annualRoi: string;
    fteSaved: string;
    errorReduction: string;
    revenueUplift: string;
    enableErrorMetrics: string;
    enableRevenueMetrics: string;
    matrix: string;
    scoringGuide: string;
    filters: {
      timeOnly: string;
      timeError: string;
      timeRevenue: string;
      allThree: string;
    };
  };

  // Opportunity Matrix
  matrix: {
    title: string;
    xAxis: string;
    yAxis: string;
    quadrants: {
      quickWins: string;
      strategicBets: string;
      lowHanging: string;
      maybeNever: string;
    };
  };

  // Forms and Dialogs
  forms: {
    // Company forms
    companyName: string;
    companyNamePlaceholder: string;
    industry: string;
    industryPlaceholder: string;
    contact: string;
    contactPlaceholder: string;
    annualRevenuePlaceholder: string;
    totalEmployeesPlaceholder: string;
    annualLaborCosts: string;
    annualLaborCostsPlaceholder: string;

    // Workflow forms
    workflowName: string;
    workflowNamePlaceholder: string;
    workflowDescription: string;
    workflowDescriptionPlaceholder: string;

    // Opportunity forms
    opportunityName: string;
    opportunityNamePlaceholder: string;
    opportunityDescription: string;
    opportunityDescriptionPlaceholder: string;
    hoursSavedPerWeek: string;
    hoursSavedPerWeekPlaceholder: string;
    annualHoursSaved: string;
    annualHoursSavedPlaceholder: string;
    errorReductionPct: string;
    errorReductionPctPlaceholder: string;
    errorsAvoidedAnnually: string;
    errorsAvoidedAnnuallyPlaceholder: string;
    hoursReallocatedToRevenue: string;
    hoursReallocatedToRevenuePlaceholder: string;
    revenueUpliftAnnual: string;
    revenueUpliftAnnualPlaceholder: string;
    rampupPeriodMonths: string;
    rampupPeriodMonthsPlaceholder: string;
    paybackPeriodMonths: string;
    paybackPeriodMonthsPlaceholder: string;
    trainingHoursPerEmployee: string;
    trainingHoursPerEmployeePlaceholder: string;
    annualRoiPlaceholder: string;

    // Business Impact forms
    hoursPerWeek: string;
    hoursPerWeekPlaceholder: string;
    hoursPerYear: string;
    hoursPerYearPlaceholder: string;
    fteEquivalent: string;
    fteEquivalentPlaceholder: string;
    fteEquivalentHelp: string;
    annualBenefits: string;
    annualBenefitsPlaceholder: string;
    roiPercentage: string;
    roiPercentagePlaceholder: string;
    paybackMonths: string;
    paybackMonthsPlaceholder: string;

    // Section titles
    timeSavings: string;
    financialMetrics: string;
    errorMetrics: string;
    revenueMetrics: string;
    implementationDetails: string;
  };

  // Dialog titles and descriptions
  dialogs: {
    createCompany: string;
    createCompanyDesc: string;
    createWorkflow: string;
    createWorkflowDesc: string;
    editFinancialContext: string;
    editFinancialContextDesc: string;
    deleteCompany: string;
    deleteCompanyDesc: string;
    deleteWorkflow: string;
    deleteWorkflowDesc: string;
    deleteOpportunity: string;
    deleteOpportunityDesc: string;
    scoringGuide: string;
    scoringGuideDesc: string;
  };

  // Toast messages
  toast: {
    companyCreated: string;
    companyCreatedDesc: string;
    companyUpdated: string;
    companyUpdatedDesc: string;
    companyDeleted: string;
    companyDeletedDesc: string;
    workflowCreated: string;
    workflowCreatedDesc: string;
    workflowUpdated: string;
    workflowUpdatedDesc: string;
    workflowDeleted: string;
    workflowDeletedDesc: string;
    opportunityCreated: string;
    opportunityCreatedDesc: string;
    opportunityUpdated: string;
    opportunityUpdatedDesc: string;
    opportunityDeleted: string;
    opportunityDeletedDesc: string;
    businessImpactSaved: string;
    businessImpactSavedDesc: string;
    errorLoading: string;
    errorSaving: string;
    errorDeleting: string;
  };

  // Buttons and Actions
  actions: {
    addCompany: string;
    addWorkflow: string;
    addOpportunity: string;
    editFinancialContext: string;
    viewDetails: string;
    deleteItem: string;
    saveChanges: string;
    saving: string;
    creating: string;
    deleting: string;
    viewScoringGuide: string;
    toggleErrorMetrics: string;
    toggleRevenueMetrics: string;
  };

  // Status and Labels
  labels: {
    completionRate: string;
    feasibility: string;
    annualBenefitsValue: string;
    quadrant: string;
    businessImpact: string;
    implementationEffort: string;
    enabled: string;
    disabled: string;
    industry: string;
    workflowsCount: string;
    completedWorkflows: string;
    respondent: string;
    variance: string;
    weight: string;
    score: string;
    allOpportunities: string;
    filterByMetrics: string;
  };

  // Readiness Rubric
  rubric: {
    overallScore: string;
    combinedReadiness: string;
    technicalOperational: string;
    scoreComponents: string;
    detailedComponents: string;
    technicalFoundation: string;
    operationalReadiness: string;
    executiveSummary: string;
    swotAnalysis: string;
    componentAnalysis: string;
    componentWeights: string;
    whyTheseWeights: string;
    dataQualityWeight: string;
    integrationWeight: string;
    systemEnvWeight: string;
    securityWeight: string;
    clarityWeight: string;
    changeMagWeight: string;
    brittlenessWeight: string;
  };

  // Scoring Guide
  scoringGuide: {
    title: string;
    companyScoring: string;
    filterExplanation: string;
    timeOnlyExplanation: string;
    timeErrorExplanation: string;
    timeRevenueExplanation: string;
    allThreeExplanation: string;
    roiThresholds: string;
    hoursThresholds: string;
    errorThresholds: string;
    revenueThresholds: string;
    low: string;
    medium: string;
    high: string;
  };
}

const en: Translations = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    create: "Create",
    update: "Update",
    search: "Search",
    filter: "Filter",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    required: "Required",
    optional: "Optional",
    yes: "Yes",
    no: "No",
    back: "Back",
    next: "Next",
    submit: "Submit",
    download: "Download",
    close: "Close",
  },
  nav: {
    dashboard: "Dashboard",
    companies: "Companies",
    documentation: "Documentation",
  },
  dashboard: {
    title: "AI Implementation Diagnostics",
    companies: "Companies",
    workflows: "Workflows",
    opportunities: "Opportunities",
    createCompany: "Create Company",
    searchCompanies: "Search companies...",
    noCompanies: "No companies yet",
    noCompaniesDesc: "Get started by creating your first company to begin managing AI implementation diagnostics.",
  },
  company: {
    name: "Company Name",
    annualRevenue: "Annual Revenue",
    totalEmployees: "Total Employees",
    financialContext: "Financial Context",
    workflows: "Workflows",
    opportunities: "Opportunities",
    createWorkflow: "Create Workflow",
    companyDetails: "Company Details",
    editCompany: "Edit Company",
    deleteCompany: "Delete Company",
    confirmDelete: "Are you sure you want to delete this company? This action cannot be undone.",
    downloadSnapshot: "Download Company Snapshot",
  },
  workflow: {
    name: "Workflow Name",
    description: "Description",
    status: "Status",
    tfaOnly: "TFA Only",
    tfaReadiness: "TFA + Readiness",
    readinessImpact: "Readiness + Impact",
    complete: "Complete",
    viewTfa: "View TFA",
    viewPif: "View PIF",
    viewReadiness: "View Readiness",
    viewOpportunities: "View Opportunities",
    createOpportunity: "Create Opportunity",
    shareTfaLink: "Share TFA Link",
    sharePifLink: "Share PIF Link",
  },
  tfa: {
    title: "Technical Feasibility Assessment",
    subtitle: "Evaluate technical foundation for AI implementation",
    forWorkflow: "for workflow",
    selectLanguage: "Select Language",
    sections: {
      systemEnvironment: "System Environment",
      dataQuality: "Data Quality",
      integrationFeasibility: "Integration Feasibility",
      securityCompliance: "Security & Compliance",
    },
    score: "Score",
    feasibility: "Feasibility",
    feasibilityBands: {
      veryHigh: "Very High",
      high: "High",
      moderate: "Moderate",
      low: "Low",
      veryLow: "Very Low",
    },
    respondent: "Respondent",
    gapMetadata: "Gap Metadata",
    dontKnow: "Don't Know",
    whyCantAnswer: "Why can't you answer this question?",
    whoMightKnow: "Who might know the answer?",
    analysis: "Analysis",
    executiveSummary: "Executive Summary",
    criticalGaps: "Critical Technical Gaps",
    keyStrengths: "Key Strengths",
    roadmap: "Implementation Roadmap",
  },
  pif: {
    title: "Process Insight Form",
    subtitle: "Gather operational readiness insights from process participants",
    forWorkflow: "for workflow",
    selectLanguage: "Select Language",
    respondentInfo: "Respondent Information",
    yourName: "Your Name",
    yourRole: "Your Role",
    yourResponsibilities: "Your Responsibilities in this Workflow",
    sections: {
      processClarity: "Process Clarity",
      changeMagnitude: "Change Magnitude",
      workflowBrittleness: "Workflow Brittleness",
      timeSavings: "Time Savings",
      revenueUplift: "Revenue Uplift",
      experience: "Experience & Insights",
      timeVolume: "Time & Volume Data",
      qualityImpact: "Quality Impact",
    },
    scores: {
      processClarity: "Process Clarity Score",
      changeMagnitude: "Change Magnitude Score",
      workflowBrittleness: "Workflow Brittleness Score",
    },
    responses: "Responses",
    respondents: "Respondents",
    aggregated: "Aggregated Scores",
    variance: {
      low: "Low variance",
      moderate: "Moderate variance",
      high: "High variance",
    },
  },
  readiness: {
    title: "Readiness Rubric",
    combinedScore: "Combined Readiness Score",
    components: "Components",
    tfaWeight: "TFA Weight",
    pifWeight: "PIF Weight",
    swotAnalysis: "SWOT Analysis",
    strengths: "Strengths",
    weaknesses: "Weaknesses",
    opportunities: "Opportunities",
    threats: "Threats",
    requiresTfa: "Requires completed TFA",
    requiresPif: "Requires at least one PIF response",
  },
  opportunities: {
    title: "Implementation Opportunities",
    create: "Create Opportunity",
    edit: "Edit Opportunity",
    name: "Opportunity Name",
    description: "Description",
    businessImpact: "Business Impact",
    implementationEffort: "Implementation Effort",
    annualRoi: "Annual ROI",
    fteSaved: "FTE Saved",
    errorReduction: "Error Reduction",
    revenueUplift: "Revenue Uplift",
    enableErrorMetrics: "Enable Error Reduction Metrics",
    enableRevenueMetrics: "Enable Revenue Uplift Metrics",
    matrix: "Opportunity Matrix",
    scoringGuide: "Scoring Guide",
    filters: {
      timeOnly: "Time Savings Only",
      timeError: "Time + Error Reduction",
      timeRevenue: "Time + Revenue Uplift",
      allThree: "All 3 Metrics",
    },
  },
  matrix: {
    title: "Opportunity Matrix",
    xAxis: "Business Impact",
    yAxis: "Implementation Effort",
    quadrants: {
      quickWins: "Quick Wins",
      strategicBets: "Strategic Bets",
      lowHanging: "Low-Hanging Fruit",
      maybeNever: "Maybe Never",
    },
  },
  forms: {
    companyName: "Company Name",
    companyNamePlaceholder: "e.g., Acme Corporation",
    industry: "Industry",
    industryPlaceholder: "e.g., Manufacturing, Healthcare, Finance",
    contact: "Contact Information",
    contactPlaceholder: "Email, phone, or contact name",
    annualRevenuePlaceholder: "e.g., 5000000",
    totalEmployeesPlaceholder: "e.g., 250",
    annualLaborCosts: "Annual Labor Costs",
    annualLaborCostsPlaceholder: "e.g., 10000000",
    workflowName: "Workflow Name",
    workflowNamePlaceholder: "e.g., Invoice Processing Automation",
    workflowDescription: "Description",
    workflowDescriptionPlaceholder: "Brief description of the workflow and what it does",
    opportunityName: "Opportunity Name",
    opportunityNamePlaceholder: "e.g., Automated Invoice Processing",
    opportunityDescription: "Description",
    opportunityDescriptionPlaceholder: "Describe this implementation opportunity",
    hoursSavedPerWeek: "Hours Saved Per Week",
    hoursSavedPerWeekPlaceholder: "e.g., 40",
    annualHoursSaved: "Annual Hours Saved",
    annualHoursSavedPlaceholder: "e.g., 2080",
    errorReductionPct: "Error Reduction %",
    errorReductionPctPlaceholder: "e.g., 75",
    errorsAvoidedAnnually: "Errors Avoided Annually",
    errorsAvoidedAnnuallyPlaceholder: "e.g., 500",
    hoursReallocatedToRevenue: "Hours Reallocated to Revenue",
    hoursReallocatedToRevenuePlaceholder: "e.g., 1000",
    revenueUpliftAnnual: "Annual Revenue Uplift",
    revenueUpliftAnnualPlaceholder: "e.g., 250000",
    rampupPeriodMonths: "Ramp-up Period (months)",
    rampupPeriodMonthsPlaceholder: "e.g., 6",
    paybackPeriodMonths: "Payback Period (months)",
    paybackPeriodMonthsPlaceholder: "e.g., 12",
    trainingHoursPerEmployee: "Training Hours Per Employee",
    trainingHoursPerEmployeePlaceholder: "e.g., 8",
    annualRoiPlaceholder: "e.g., 150000",
    hoursPerWeek: "Hours Saved per Week",
    hoursPerWeekPlaceholder: "e.g., 40",
    hoursPerYear: "Hours Saved per Year",
    hoursPerYearPlaceholder: "e.g., 2080",
    fteEquivalent: "FTE Equivalent",
    fteEquivalentPlaceholder: "e.g., 1.5",
    fteEquivalentHelp: "Full-time employee equivalent",
    annualBenefits: "Annual Benefits ($)",
    annualBenefitsPlaceholder: "e.g., 125000",
    roiPercentage: "ROI Percentage (%)",
    roiPercentagePlaceholder: "e.g., 250",
    paybackMonths: "Payback Period (months)",
    paybackMonthsPlaceholder: "e.g., 8",
    timeSavings: "Time Savings",
    financialMetrics: "Financial Metrics",
    errorMetrics: "Error Reduction Metrics",
    revenueMetrics: "Revenue Uplift Metrics",
    implementationDetails: "Implementation Details",
  },
  dialogs: {
    createCompany: "Create New Company",
    createCompanyDesc: "Add a new company to manage their AI implementation diagnostics",
    createWorkflow: "Create New Workflow",
    createWorkflowDesc: "Add a new workflow to assess for AI automation potential",
    editFinancialContext: "Edit Company Financial Context",
    editFinancialContextDesc: "Update financial metrics used for opportunity scoring and ROI calculations",
    deleteCompany: "Delete Company",
    deleteCompanyDesc: "Are you sure you want to delete this company? This will also delete all associated workflows and data. This action cannot be undone.",
    deleteWorkflow: "Delete Workflow",
    deleteWorkflowDesc: "Are you sure you want to delete this workflow? This action cannot be undone.",
    deleteOpportunity: "Delete Opportunity",
    deleteOpportunityDesc: "Are you sure you want to delete this opportunity? This action cannot be undone.",
    scoringGuide: "Opportunity Scoring Guide",
    scoringGuideDesc: "Understanding how business impact is calculated based on company context",
  },
  toast: {
    companyCreated: "Company created",
    companyCreatedDesc: "The company has been successfully added.",
    companyUpdated: "Company updated",
    companyUpdatedDesc: "The company has been successfully updated.",
    companyDeleted: "Company deleted",
    companyDeletedDesc: "The company and all its workflows have been removed.",
    workflowCreated: "Workflow created",
    workflowCreatedDesc: "The workflow has been successfully added.",
    workflowUpdated: "Workflow updated",
    workflowUpdatedDesc: "The workflow has been successfully updated.",
    workflowDeleted: "Workflow deleted",
    workflowDeletedDesc: "The workflow and all its data have been removed.",
    opportunityCreated: "Opportunity created",
    opportunityCreatedDesc: "The implementation opportunity has been created.",
    opportunityUpdated: "Opportunity updated",
    opportunityUpdatedDesc: "The implementation opportunity has been updated.",
    opportunityDeleted: "Opportunity deleted",
    opportunityDeletedDesc: "The implementation opportunity has been removed.",
    businessImpactSaved: "Business impact saved",
    businessImpactSavedDesc: "The business impact data has been successfully saved.",
    errorLoading: "Error loading data",
    errorSaving: "Error saving data",
    errorDeleting: "Error deleting item",
  },
  actions: {
    addCompany: "Add Company",
    addWorkflow: "Add Workflow",
    addOpportunity: "Add Opportunity",
    editFinancialContext: "Edit Financial Context",
    viewDetails: "View Details",
    deleteItem: "Delete",
    saveChanges: "Save Changes",
    saving: "Saving...",
    creating: "Creating...",
    deleting: "Deleting...",
    viewScoringGuide: "View Scoring Guide",
    toggleErrorMetrics: "Toggle error reduction metrics",
    toggleRevenueMetrics: "Toggle revenue uplift metrics",
  },
  labels: {
    completionRate: "Completion Rate",
    feasibility: "Feasibility",
    annualBenefitsValue: "Annual Benefits",
    quadrant: "Quadrant",
    businessImpact: "Business Impact",
    implementationEffort: "Implementation Effort",
    enabled: "Enabled",
    disabled: "Disabled",
    industry: "Industry",
    workflowsCount: "Workflows",
    completedWorkflows: "completed",
    respondent: "Respondent",
    variance: "Variance",
    weight: "weight",
    score: "Score",
    allOpportunities: "All Opportunities",
    filterByMetrics: "Filter by metrics",
  },
  rubric: {
    overallScore: "Overall Score",
    combinedReadiness: "Combined Readiness Score",
    technicalOperational: "Technical (60%) + Operational (40%)",
    scoreComponents: "Score Components",
    detailedComponents: "Detailed Components",
    technicalFoundation: "Technical Foundation (60%)",
    operationalReadiness: "Operational Readiness (40%)",
    executiveSummary: "Executive Summary",
    swotAnalysis: "SWOT Analysis",
    componentAnalysis: "Component Analysis",
    componentWeights: "Component Weight Distribution",
    whyTheseWeights: "Why These Weights?",
    dataQualityWeight: "Data Quality (18%) and Integration Feasibility (18%) carry the most weight because they directly determine whether the AI can connect to existing systems and work with available data - the fundamental building blocks of any AI implementation.",
    integrationWeight: "Integration Feasibility is weighted heavily as it represents the technical capability to connect AI solutions with existing infrastructure.",
    systemEnvWeight: "System Environment (15%) is critical as it encompasses the technical infrastructure, scalability, and backup capabilities that ensure the AI solution can run reliably.",
    securityWeight: "Security & Compliance (9%) addresses regulatory and security requirements that, while essential, are often more about verification than technical capability.",
    clarityWeight: "Process Clarity (8%) and Change Magnitude (8%) reflect operational readiness - clear processes reduce implementation complexity, while understanding change magnitude helps plan adoption strategies.",
    changeMagWeight: "Change Magnitude helps quantify the organizational impact and adoption challenges.",
    brittlenessWeight: "Workflow Brittleness (6%) has the lowest weight as it indicates risk rather than capability, and can often be mitigated through careful design even in brittle workflows.",
  },
  scoringGuide: {
    title: "Opportunity Scoring Guide",
    companyScoring: "Company-Specific Scoring",
    filterExplanation: "Filter Explanation",
    timeOnlyExplanation: "Time savings only: Focuses solely on labor hour reductions. Business impact = (ROI × 50%) + (Hours × 50%). This is the baseline scoring mode.",
    timeErrorExplanation: "When error reduction metrics are enabled, the scoring weights are redistributed to account for quality improvements. The business impact is calculated as: (ROI Score × 45%) + (Hours Score × 30%) + (Error Score × 25%). This means error reduction contributes 25% to the total score, while time savings (ROI + Hours) still dominates at 75%.",
    timeRevenueExplanation: "When revenue uplift metrics are enabled, the scoring weights are redistributed to account for growth opportunities. The business impact is calculated as: (ROI Score × 45%) + (Hours Score × 30%) + (Revenue Score × 25%). This means revenue uplift contributes 25% to the total score, while time savings (ROI + Hours) still dominates at 75%.",
    allThreeExplanation: "All three metrics enabled: The most comprehensive scoring mode where business impact = (ROI × 40%) + (Hours × 30%) + (Error × 15%) + (Revenue × 15%).",
    roiThresholds: "ROI Thresholds",
    hoursThresholds: "Hours Saved Thresholds",
    errorThresholds: "Error Reduction Thresholds",
    revenueThresholds: "Revenue Uplift Thresholds",
    low: "Low",
    medium: "Medium",
    high: "High",
  },
};

const es: Translations = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    create: "Crear",
    update: "Actualizar",
    search: "Buscar",
    filter: "Filtrar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    required: "Requerido",
    optional: "Opcional",
    yes: "Sí",
    no: "No",
    back: "Atrás",
    next: "Siguiente",
    submit: "Enviar",
    download: "Descargar",
    close: "Cerrar",
  },
  nav: {
    dashboard: "Panel",
    companies: "Empresas",
    documentation: "Documentación",
  },
  dashboard: {
    title: "Diagnósticos de Implementación de IA",
    companies: "Empresas",
    workflows: "Flujos de Trabajo",
    opportunities: "Oportunidades",
    createCompany: "Crear Empresa",
    searchCompanies: "Buscar empresas...",
    noCompanies: "Aún no hay empresas",
    noCompaniesDesc: "Comience creando su primera empresa para gestionar diagnósticos de implementación de IA.",
  },
  company: {
    name: "Nombre de la Empresa",
    annualRevenue: "Ingresos Anuales",
    totalEmployees: "Total de Empleados",
    financialContext: "Contexto Financiero",
    workflows: "Flujos de Trabajo",
    opportunities: "Oportunidades",
    createWorkflow: "Crear Flujo de Trabajo",
    companyDetails: "Detalles de la Empresa",
    editCompany: "Editar Empresa",
    deleteCompany: "Eliminar Empresa",
    confirmDelete: "¿Está seguro de que desea eliminar esta empresa? Esta acción no se puede deshacer.",
    downloadSnapshot: "Descargar Instantánea de la Empresa",
  },
  workflow: {
    name: "Nombre del Flujo de Trabajo",
    description: "Descripción",
    status: "Estado",
    tfaOnly: "Solo TFA",
    tfaReadiness: "TFA + Preparación",
    readinessImpact: "Preparación + Impacto",
    complete: "Completo",
    viewTfa: "Ver TFA",
    viewPif: "Ver PIF",
    viewReadiness: "Ver Preparación",
    viewOpportunities: "Ver Oportunidades",
    createOpportunity: "Crear Oportunidad",
    shareTfaLink: "Compartir Enlace TFA",
    sharePifLink: "Compartir Enlace PIF",
  },
  tfa: {
    title: "Evaluación de Viabilidad Técnica",
    subtitle: "Evaluar la base técnica para la implementación de IA",
    forWorkflow: "para el flujo de trabajo",
    selectLanguage: "Seleccionar Idioma",
    sections: {
      systemEnvironment: "Entorno del Sistema",
      dataQuality: "Calidad de Datos",
      integrationFeasibility: "Viabilidad de Integración",
      securityCompliance: "Seguridad y Cumplimiento",
    },
    score: "Puntuación",
    feasibility: "Viabilidad",
    feasibilityBands: {
      veryHigh: "Muy Alta",
      high: "Alta",
      moderate: "Moderada",
      low: "Baja",
      veryLow: "Muy Baja",
    },
    respondent: "Encuestado",
    gapMetadata: "Metadatos de Brecha",
    dontKnow: "No Sé",
    whyCantAnswer: "¿Por qué no puede responder esta pregunta?",
    whoMightKnow: "¿Quién podría saber la respuesta?",
    analysis: "Análisis",
    executiveSummary: "Resumen Ejecutivo",
    criticalGaps: "Brechas Técnicas Críticas",
    keyStrengths: "Fortalezas Clave",
    roadmap: "Hoja de Ruta de Implementación",
  },
  pif: {
    title: "Formulario de Perspectiva del Proceso",
    subtitle: "Recopilar información sobre la preparación operacional de los participantes del proceso",
    forWorkflow: "para el flujo de trabajo",
    selectLanguage: "Seleccionar Idioma",
    respondentInfo: "Información del Encuestado",
    yourName: "Su Nombre",
    yourRole: "Su Rol",
    yourResponsibilities: "Sus Responsabilidades en este Flujo de Trabajo",
    sections: {
      processClarity: "Claridad del Proceso",
      changeMagnitude: "Magnitud del Cambio",
      workflowBrittleness: "Fragilidad del Flujo de Trabajo",
      timeSavings: "Ahorro de Tiempo",
      revenueUplift: "Aumento de Ingresos",
      experience: "Experiencia y Perspectivas",
      timeVolume: "Datos de Tiempo y Volumen",
      qualityImpact: "Impacto en la Calidad",
    },
    scores: {
      processClarity: "Puntuación de Claridad del Proceso",
      changeMagnitude: "Puntuación de Magnitud del Cambio",
      workflowBrittleness: "Puntuación de Fragilidad del Flujo de Trabajo",
    },
    responses: "Respuestas",
    respondents: "Encuestados",
    aggregated: "Puntuaciones Agregadas",
    variance: {
      low: "Baja varianza",
      moderate: "Varianza moderada",
      high: "Alta varianza",
    },
  },
  readiness: {
    title: "Rúbrica de Preparación",
    combinedScore: "Puntuación Combinada de Preparación",
    components: "Componentes",
    tfaWeight: "Peso TFA",
    pifWeight: "Peso PIF",
    swotAnalysis: "Análisis FODA",
    strengths: "Fortalezas",
    weaknesses: "Debilidades",
    opportunities: "Oportunidades",
    threats: "Amenazas",
    requiresTfa: "Requiere TFA completado",
    requiresPif: "Requiere al menos una respuesta PIF",
  },
  opportunities: {
    title: "Oportunidades de Implementación",
    create: "Crear Oportunidad",
    edit: "Editar Oportunidad",
    name: "Nombre de la Oportunidad",
    description: "Descripción",
    businessImpact: "Impacto en el Negocio",
    implementationEffort: "Esfuerzo de Implementación",
    annualRoi: "ROI Anual",
    fteSaved: "FTE Ahorrado",
    errorReduction: "Reducción de Errores",
    revenueUplift: "Aumento de Ingresos",
    enableErrorMetrics: "Habilitar Métricas de Reducción de Errores",
    enableRevenueMetrics: "Habilitar Métricas de Aumento de Ingresos",
    matrix: "Matriz de Oportunidades",
    scoringGuide: "Guía de Puntuación",
    filters: {
      timeOnly: "Solo Ahorro de Tiempo",
      timeError: "Tiempo + Reducción de Errores",
      timeRevenue: "Tiempo + Aumento de Ingresos",
      allThree: "Las 3 Métricas",
    },
  },
  matrix: {
    title: "Matriz de Oportunidades",
    xAxis: "Impacto en el Negocio",
    yAxis: "Esfuerzo de Implementación",
    quadrants: {
      quickWins: "Victorias Rápidas",
      strategicBets: "Apuestas Estratégicas",
      lowHanging: "Fruta al Alcance",
      maybeNever: "Tal Vez Nunca",
    },
  },
  forms: {
    companyName: "Nombre de la Empresa",
    companyNamePlaceholder: "ej., Corporación Acme",
    industry: "Industria",
    industryPlaceholder: "ej., Manufactura, Salud, Finanzas",
    contact: "Información de Contacto",
    contactPlaceholder: "Correo, teléfono o nombre de contacto",
    annualRevenuePlaceholder: "ej., 5000000",
    totalEmployeesPlaceholder: "ej., 250",
    annualLaborCosts: "Costos Laborales Anuales",
    annualLaborCostsPlaceholder: "ej., 10000000",
    workflowName: "Nombre del Flujo de Trabajo",
    workflowNamePlaceholder: "ej., Automatización de Procesamiento de Facturas",
    workflowDescription: "Descripción",
    workflowDescriptionPlaceholder: "Breve descripción del flujo de trabajo y su función",
    opportunityName: "Nombre de la Oportunidad",
    opportunityNamePlaceholder: "ej., Procesamiento Automatizado de Facturas",
    opportunityDescription: "Descripción",
    opportunityDescriptionPlaceholder: "Describa esta oportunidad de implementación",
    hoursSavedPerWeek: "Horas Ahorradas por Semana",
    hoursSavedPerWeekPlaceholder: "ej., 40",
    annualHoursSaved: "Horas Ahorradas Anualmente",
    annualHoursSavedPlaceholder: "ej., 2080",
    errorReductionPct: "% de Reducción de Errores",
    errorReductionPctPlaceholder: "ej., 75",
    errorsAvoidedAnnually: "Errores Evitados Anualmente",
    errorsAvoidedAnnuallyPlaceholder: "ej., 500",
    hoursReallocatedToRevenue: "Horas Reasignadas a Ingresos",
    hoursReallocatedToRevenuePlaceholder: "ej., 1000",
    revenueUpliftAnnual: "Aumento de Ingresos Anual",
    revenueUpliftAnnualPlaceholder: "ej., 250000",
    rampupPeriodMonths: "Período de Rampa (meses)",
    rampupPeriodMonthsPlaceholder: "ej., 6",
    paybackPeriodMonths: "Período de Recuperación (meses)",
    paybackPeriodMonthsPlaceholder: "ej., 12",
    trainingHoursPerEmployee: "Horas de Capacitación por Empleado",
    trainingHoursPerEmployeePlaceholder: "ej., 8",
    annualRoiPlaceholder: "ej., 150000",
    hoursPerWeek: "Horas Ahorradas por Semana",
    hoursPerWeekPlaceholder: "ej., 40",
    hoursPerYear: "Horas Ahorradas por Año",
    hoursPerYearPlaceholder: "ej., 2080",
    fteEquivalent: "Equivalente FTE",
    fteEquivalentPlaceholder: "ej., 1.5",
    fteEquivalentHelp: "Equivalente a empleado de tiempo completo",
    annualBenefits: "Beneficios Anuales ($)",
    annualBenefitsPlaceholder: "ej., 125000",
    roiPercentage: "Porcentaje de ROI (%)",
    roiPercentagePlaceholder: "ej., 250",
    paybackMonths: "Período de Recuperación (meses)",
    paybackMonthsPlaceholder: "ej., 8",
    timeSavings: "Ahorro de Tiempo",
    financialMetrics: "Métricas Financieras",
    errorMetrics: "Métricas de Reducción de Errores",
    revenueMetrics: "Métricas de Aumento de Ingresos",
    implementationDetails: "Detalles de Implementación",
  },
  dialogs: {
    createCompany: "Crear Nueva Empresa",
    createCompanyDesc: "Agregue una nueva empresa para gestionar sus diagnósticos de implementación de IA",
    createWorkflow: "Crear Nuevo Flujo de Trabajo",
    createWorkflowDesc: "Agregue un nuevo flujo de trabajo para evaluar el potencial de automatización de IA",
    editFinancialContext: "Editar Contexto Financiero de la Empresa",
    editFinancialContextDesc: "Actualice las métricas financieras utilizadas para la puntuación de oportunidades y los cálculos de ROI",
    deleteCompany: "Eliminar Empresa",
    deleteCompanyDesc: "¿Está seguro de que desea eliminar esta empresa? Esto también eliminará todos los flujos de trabajo y datos asociados. Esta acción no se puede deshacer.",
    deleteWorkflow: "Eliminar Flujo de Trabajo",
    deleteWorkflowDesc: "¿Está seguro de que desea eliminar este flujo de trabajo? Esta acción no se puede deshacer.",
    deleteOpportunity: "Eliminar Oportunidad",
    deleteOpportunityDesc: "¿Está seguro de que desea eliminar esta oportunidad? Esta acción no se puede deshacer.",
    scoringGuide: "Guía de Puntuación de Oportunidades",
    scoringGuideDesc: "Comprendiendo cómo se calcula el impacto empresarial basado en el contexto de la empresa",
  },
  toast: {
    companyCreated: "Empresa creada",
    companyCreatedDesc: "La empresa se ha agregado exitosamente.",
    companyUpdated: "Empresa actualizada",
    companyUpdatedDesc: "La empresa se ha actualizado exitosamente.",
    companyDeleted: "Empresa eliminada",
    companyDeletedDesc: "La empresa y todos sus flujos de trabajo han sido eliminados.",
    workflowCreated: "Flujo de trabajo creado",
    workflowCreatedDesc: "El flujo de trabajo se ha agregado exitosamente.",
    workflowUpdated: "Flujo de trabajo actualizado",
    workflowUpdatedDesc: "El flujo de trabajo se ha actualizado exitosamente.",
    workflowDeleted: "Flujo de trabajo eliminado",
    workflowDeletedDesc: "El flujo de trabajo y todos sus datos han sido eliminados.",
    opportunityCreated: "Oportunidad creada",
    opportunityCreatedDesc: "La oportunidad de implementación ha sido creada.",
    opportunityUpdated: "Oportunidad actualizada",
    opportunityUpdatedDesc: "La oportunidad de implementación ha sido actualizada.",
    opportunityDeleted: "Oportunidad eliminada",
    opportunityDeletedDesc: "La oportunidad de implementación ha sido eliminada.",
    businessImpactSaved: "Impacto empresarial guardado",
    businessImpactSavedDesc: "Los datos de impacto empresarial se han guardado exitosamente.",
    errorLoading: "Error al cargar datos",
    errorSaving: "Error al guardar datos",
    errorDeleting: "Error al eliminar elemento",
  },
  actions: {
    addCompany: "Agregar Empresa",
    addWorkflow: "Agregar Flujo de Trabajo",
    addOpportunity: "Agregar Oportunidad",
    editFinancialContext: "Editar Contexto Financiero",
    viewDetails: "Ver Detalles",
    deleteItem: "Eliminar",
    saveChanges: "Guardar Cambios",
    saving: "Guardando...",
    creating: "Creando...",
    deleting: "Eliminando...",
    viewScoringGuide: "Ver Guía de Puntuación",
    toggleErrorMetrics: "Alternar métricas de reducción de errores",
    toggleRevenueMetrics: "Alternar métricas de aumento de ingresos",
  },
  labels: {
    completionRate: "Tasa de Completitud",
    feasibility: "Viabilidad",
    annualBenefitsValue: "Beneficios Anuales",
    quadrant: "Cuadrante",
    businessImpact: "Impacto en el Negocio",
    implementationEffort: "Esfuerzo de Implementación",
    enabled: "Habilitado",
    disabled: "Deshabilitado",
    industry: "Industria",
    workflowsCount: "Flujos de Trabajo",
    completedWorkflows: "completados",
    respondent: "Encuestado",
    variance: "Varianza",
    weight: "peso",
    score: "Puntuación",
    allOpportunities: "Todas las Oportunidades",
    filterByMetrics: "Filtrar por métricas",
  },
  rubric: {
    overallScore: "Puntuación General",
    combinedReadiness: "Puntuación Combinada de Preparación",
    technicalOperational: "Técnico (60%) + Operacional (40%)",
    scoreComponents: "Componentes de Puntuación",
    detailedComponents: "Componentes Detallados",
    technicalFoundation: "Fundamento Técnico (60%)",
    operationalReadiness: "Preparación Operacional (40%)",
    executiveSummary: "Resumen Ejecutivo",
    swotAnalysis: "Análisis FODA",
    componentAnalysis: "Análisis de Componentes",
    componentWeights: "Distribución de Peso de Componentes",
    whyTheseWeights: "¿Por Qué Estos Pesos?",
    dataQualityWeight: "La Calidad de Datos (18%) y la Viabilidad de Integración (18%) tienen el mayor peso porque determinan directamente si la IA puede conectarse a los sistemas existentes y trabajar con los datos disponibles, los bloques de construcción fundamentales de cualquier implementación de IA.",
    integrationWeight: "La Viabilidad de Integración se pondera fuertemente ya que representa la capacidad técnica para conectar soluciones de IA con la infraestructura existente.",
    systemEnvWeight: "El Entorno del Sistema (15%) es crítico ya que abarca la infraestructura técnica, la escalabilidad y las capacidades de respaldo que aseguran que la solución de IA pueda funcionar de manera confiable.",
    securityWeight: "Seguridad y Cumplimiento (9%) aborda los requisitos regulatorios y de seguridad que, aunque esenciales, a menudo son más sobre verificación que capacidad técnica.",
    clarityWeight: "La Claridad del Proceso (8%) y la Magnitud del Cambio (8%) reflejan la preparación operacional: los procesos claros reducen la complejidad de la implementación, mientras que comprender la magnitud del cambio ayuda a planificar estrategias de adopción.",
    changeMagWeight: "La Magnitud del Cambio ayuda a cuantificar el impacto organizacional y los desafíos de adopción.",
    brittlenessWeight: "La Fragilidad del Flujo de Trabajo (6%) tiene el peso más bajo ya que indica riesgo en lugar de capacidad, y a menudo se puede mitigar mediante un diseño cuidadoso incluso en flujos de trabajo frágiles.",
  },
  scoringGuide: {
    title: "Guía de Puntuación de Oportunidades",
    companyScoring: "Puntuación Específica de la Empresa",
    filterExplanation: "Explicación del Filtro",
    timeOnlyExplanation: "Solo ahorro de tiempo: Se enfoca únicamente en reducciones de horas laborales. Impacto empresarial = (ROI × 50%) + (Horas × 50%). Este es el modo de puntuación base.",
    timeErrorExplanation: "Cuando las métricas de reducción de errores están habilitadas, los pesos de puntuación se redistribuyen para tener en cuenta las mejoras de calidad. El impacto empresarial se calcula como: (Puntuación ROI × 45%) + (Puntuación Horas × 30%) + (Puntuación Error × 25%). Esto significa que la reducción de errores contribuye un 25% a la puntuación total, mientras que el ahorro de tiempo (ROI + Horas) sigue dominando con un 75%.",
    timeRevenueExplanation: "Cuando las métricas de aumento de ingresos están habilitadas, los pesos de puntuación se redistribuyen para tener en cuenta las oportunidades de crecimiento. El impacto empresarial se calcula como: (Puntuación ROI × 45%) + (Puntuación Horas × 30%) + (Puntuación Ingresos × 25%). Esto significa que el aumento de ingresos contribuye un 25% a la puntuación total, mientras que el ahorro de tiempo (ROI + Horas) sigue dominando con un 75%.",
    allThreeExplanation: "Las tres métricas habilitadas: El modo de puntuación más completo donde impacto empresarial = (ROI × 40%) + (Horas × 30%) + (Error × 15%) + (Ingresos × 15%).",
    roiThresholds: "Umbrales de ROI",
    hoursThresholds: "Umbrales de Horas Ahorradas",
    errorThresholds: "Umbrales de Reducción de Errores",
    revenueThresholds: "Umbrales de Aumento de Ingresos",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
  },
};

export const translations = { en, es };
