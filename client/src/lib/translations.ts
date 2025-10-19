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
};

export const translations = { en, es };
