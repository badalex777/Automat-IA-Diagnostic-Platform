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
    loadingEllipsis: string;
    error: string;
    success: string;
    required: string;
    optional: string;
    yes: string;
    no: string;
    back: string;
    backToDashboard: string;
    next: string;
    submit: string;
    download: string;
    close: string;
    platformName: string;
    scoringGuide: string;
    unknownCompany: string;
    unknownIndustry: string;
    searchWorkflows: string;
    noOpportunities: string;
    noOpportunitiesWithAssessments: string;
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
    subtitle: string;
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
    backToCompany: string;
    unknownWorkflow: string;
    errorLoadingWorkflow: string;
    errorLoadingCompany: string;
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
      niceToHave: string;
      deprioritize: string;
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
    errorLoadingAssessment: string;
    errorSaving: string;
    errorDeleting: string;
    errorUpdating: string;
    error: string;
    success: string;
    responseDeleted: string;
    responseDeletedDesc: string;
    deleteFailed: string;
  };

  // Tabs
  tabs: {
    technicalFeasibility: string;
    processInsights: string;
    readinessRubric: string;
    opportunities: string;
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

  // Documentation
  documentation: {
    title: string;
    tableOfContents: string;
    
    // Platform Overview
    platformOverview: {
      title: string;
      purpose: string;
      purposeContent: string;
      targetUsers: string;
      targetUsersContent: string;
      keyBenefits: string;
      benefit1: string;
      benefit2: string;
      benefit3: string;
      benefit4: string;
      workflowProgression: string;
      workflowProgressionContent: string;
    };
    
    // User Journey
    userJourney: {
      title: string;
      intro: string;
      step1Title: string;
      step1Content: string;
      step2Title: string;
      step2Content: string;
      step3Title: string;
      step3Content: string;
      step4Title: string;
      step4Content: string;
      step5Title: string;
      step5Content: string;
      step6Title: string;
      step6Content: string;
    };
    
    // TFA Methodology
    tfaMethodology: {
      title: string;
      intro: string;
      questionsStructure: string;
      questionsStructureContent: string;
      sectionWeights: string;
      systemEnvironment: string;
      dataQuality: string;
      integrationFeasibility: string;
      securityCompliance: string;
      scoringAlgorithm: string;
      scoringAlgorithmContent: string;
      feasibilityBands: string;
      veryHigh: string;
      high: string;
      moderate: string;
      low: string;
      veryLow: string;
      gapDetection: string;
      gapDetectionContent: string;
      executiveSummary: string;
      executiveSummaryContent: string;
    };
    
    // PIF Methodology
    pifMethodology: {
      title: string;
      intro: string;
      questionsStructure: string;
      questionsStructureContent: string;
      sections: string;
      section1: string;
      section2: string;
      section3: string;
      section4: string;
      section5: string;
      section6: string;
      section7: string;
      section8: string;
      operationalScores: string;
      operationalScoresContent: string;
      roiDataExtraction: string;
      roiDataExtractionContent: string;
      qualitativeInsights: string;
      qualitativeInsightsContent: string;
      multiRespondent: string;
      multiRespondentContent: string;
    };
    
    // Readiness Rubric
    readinessRubric: {
      title: string;
      intro: string;
      weightingFormula: string;
      weightingFormulaContent: string;
      componentBreakdown: string;
      component1: string;
      component2: string;
      component3: string;
      component4: string;
      component5: string;
      component6: string;
      component7: string;
      feasibilityBanding: string;
      feasibilityBandingContent: string;
      swotAnalysis: string;
      swotAnalysisContent: string;
    };
    
    // Opportunity Matrix
    opportunityMatrix: {
      title: string;
      intro: string;
      businessImpactScoring: string;
      businessImpactScoringContent: string;
      multiplierExplanation: string;
      multiplierExplanationContent: string;
      dualMatrixSystem: string;
      dualMatrixIntro: string;
      baseMatrixTitle: string;
      baseMatrixContent: string;
      enhancedMatrixTitle: string;
      enhancedMatrixContent: string;
      bonusCalculationTitle: string;
      bonusCalculationContent: string;
      matrixGuaranteeTitle: string;
      matrixGuaranteeContent: string;
      scatterPlotInterpretation: string;
      scatterPlotInterpretationContent: string;
      quadrants: string;
      quadrant1: string;
      quadrant2: string;
      quadrant3: string;
      quadrant4: string;
    };
    
    // ROI Calculations
    roiCalculations: {
      title: string;
      intro: string;
      annualRoiFormula: string;
      annualRoiFormulaContent: string;
      fteSavingsFormula: string;
      fteSavingsFormulaContent: string;
      businessImpactScoring: string;
      businessImpactScoringContent: string;
      implementationEffort: string;
      implementationEffortContent: string;
    };
    
    // Formulas Reference
    formulasReference: {
      title: string;
      intro: string;
      tfaScore: string;
      tfaScoreFormula: string;
      readinessScore: string;
      readinessScoreFormula: string;
      roiScore: string;
      roiScoreFormula: string;
      hoursScore: string;
      hoursScoreFormula: string;
      errorScore: string;
      errorScoreFormula: string;
      revenueScore: string;
      revenueScoreFormula: string;
      baseImpactMatrix: string;
      baseImpactMatrixFormula: string;
      enhancedImpactMatrix: string;
      enhancedImpactMatrixFormula: string;
      bonusFormulas: string;
      bonusFormulasExplanation: string;
      implementationEffort: string;
      implementationEffortFormula: string;
    };
  };

  // Company Snapshot
  companySnapshot: {
    title: string;
    generatedOn: string;
    notAvailable: string;
    notCompleted: string;
    workflowSection: string;
    
    // Header
    header: {
      companySnapshot: string;
      financialContext: string;
      generationDate: string;
    };
    
    // TFA Section
    tfaSection: {
      title: string;
      overallScore: string;
      feasibilityBand: string;
      criticalGaps: string;
      keyStrengths: string;
      roadmapRecommendations: string;
      noGapsIdentified: string;
      noStrengthsIdentified: string;
    };
    
    // PIF Section
    pifSection: {
      title: string;
      respondents: string;
      operationalScores: string;
      average: string;
      range: string;
      qualitativeInsights: string;
      roiInputsSummary: string;
      noQualitativeData: string;
    };
    
    // Readiness Rubric
    readinessSection: {
      title: string;
      combinedScore: string;
      componentBreakdown: string;
      feasibilityAssessment: string;
      swotAnalysis: string;
      strengths: string;
      weaknesses: string;
      opportunities: string;
      threats: string;
      requiresData: string;
    };
    
    // Opportunities
    opportunitiesSection: {
      title: string;
      annualRoi: string;
      fteSavings: string;
      businessImpactScore: string;
      implementationEffortScore: string;
      errorReduction: string;
      revenueUplift: string;
      noOpportunities: string;
    };
    
    // Opportunity Matrix
    matrixSection: {
      title: string;
      filterView: string;
      quadrantInterpretation: string;
      noMatrixData: string;
    };
    
    // Calculation Transparency
    transparency: {
      title: string;
      tfaScoring: string;
      tfaScoringExplanation: string;
      sectionWeights: string;
      pifScoring: string;
      pifScoringExplanation: string;
      readinessFormula: string;
      readinessFormulaExplanation: string;
      businessImpactScoring: string;
      businessImpactExplanation: string;
      multiplierExplanation: string;
      implementationEffort: string;
      implementationEffortExplanation: string;
      scoringGuideTables: string;
      scoreInterpretation: string;
      roiScoreGuide: string;
      hoursScoreGuide: string;
      errorScoreGuide: string;
      revenueScoreGuide: string;
      score100Meaning: string;
      score50Meaning: string;
      score20Meaning: string;
      score10Meaning: string;
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
    loadingEllipsis: "Loading...",
    error: "Error",
    success: "Success",
    required: "Required",
    optional: "Optional",
    yes: "Yes",
    no: "No",
    back: "Back",
    backToDashboard: "Back to Dashboard",
    next: "Next",
    submit: "Submit",
    download: "Download",
    close: "Close",
    platformName: "Automat-IA Diagnostic Platform",
    scoringGuide: "Scoring Guide",
    unknownCompany: "Unknown Company",
    unknownIndustry: "Unknown",
    searchWorkflows: "Search workflows...",
    noOpportunities: "No opportunities yet. Create opportunities in workflow detail pages.",
    noOpportunitiesWithAssessments: "No opportunities with completed TFA and PIF assessments. Complete assessments to see opportunities here.",
  },
  nav: {
    dashboard: "Dashboard",
    companies: "Companies",
    documentation: "Documentation",
  },
  dashboard: {
    title: "AI Implementation Diagnostics",
    subtitle: "Manage AI feasibility assessments for client companies",
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
    backToCompany: "Back to Company",
    unknownWorkflow: "Unknown Workflow",
    errorLoadingWorkflow: "Error loading workflow",
    errorLoadingCompany: "Error loading company",
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
    yourResponsibilities: "Your Role in this Workflow: What specific tasks do you perform?",
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
      niceToHave: "Nice-to-Have",
      deprioritize: "Deprioritize",
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
    errorLoadingAssessment: "Error loading assessment data",
    errorSaving: "Error saving data",
    errorDeleting: "Error deleting item",
    errorUpdating: "Error updating data",
    error: "Error",
    success: "Success",
    responseDeleted: "Response deleted",
    responseDeletedDesc: "The PIF response has been deleted successfully.",
    deleteFailed: "Delete failed",
  },
  tabs: {
    technicalFeasibility: "Technical Feasibility",
    processInsights: "Process Insights",
    readinessRubric: "Readiness Rubric",
    opportunities: "Opportunities",
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
    allThreeExplanation: "All three metrics enabled: The most comprehensive scoring mode where business impact = (ROI × 40%) + (Hours × 25%) + (Error × 20%) + (Revenue × 15%).",
    roiThresholds: "ROI Thresholds",
    hoursThresholds: "Hours Saved Thresholds",
    errorThresholds: "Error Reduction Thresholds",
    revenueThresholds: "Revenue Uplift Thresholds",
    low: "Low",
    medium: "Medium",
    high: "High",
  },
  documentation: {
    title: "Platform Handbook",
    tableOfContents: "Table of Contents",
    
    platformOverview: {
      title: "Platform Overview",
      purpose: "Purpose",
      purposeContent: "Automat-IA is a comprehensive diagnostic platform designed to help consultants systematically evaluate AI implementation opportunities within client organizations. Our platform empowers consultants to gather technical and operational data, calculate business impact, and identify automation opportunities that augment human capabilities—enabling workers to focus on higher-value activities.",
      targetUsers: "Target Users",
      targetUsersContent: "Technical consultants, business analysts, and implementation specialists working with client organizations to assess AI readiness and identify automation opportunities. The platform serves as a bridge between technical assessment and business strategy.",
      keyBenefits: "Key Benefits",
      benefit1: "Structured Assessment: Systematic evaluation framework combining technical feasibility (TFA) and operational insights (PIF)",
      benefit2: "Data-Driven Decisions: Company-relative scoring ensures opportunities are evaluated in proper business context",
      benefit3: "Stakeholder Alignment: Bilingual support and shareable links enable multi-stakeholder participation",
      benefit4: "Actionable Roadmaps: Comprehensive scoring, SWOT analysis, and opportunity prioritization guide implementation strategy",
      workflowProgression: "Workflow Progression",
      workflowProgressionContent: "Each workflow advances through defined stages: TFA Only → TFA + Readiness → Readiness + Impact → Complete. This progression ensures consultants gather necessary data before making strategic recommendations.",
    },
    
    userJourney: {
      title: "User Journey",
      intro: "The consultant workflow follows a systematic progression from company creation through comprehensive analysis:",
      step1Title: "Step 1: Company Creation",
      step1Content: "Create a company profile with essential financial context (annual revenue, total employees). This context powers company-relative scoring throughout the platform.",
      step2Title: "Step 2: Workflow Definition",
      step2Content: "Define specific workflows within the company to evaluate for automation potential. Each workflow is assessed independently with its own TFA, PIF, readiness score, and opportunities.",
      step3Title: "Step 3: Technical Feasibility Assessment (TFA)",
      step3Content: "Generate a shareable TFA link and send it to technical stakeholders. The TFA evaluates technical foundation across 21 questions in 4 sections: System Environment (25%), Data Quality (30%), Integration Feasibility (30%), and Security/Compliance (15%). Results include a 0-100 score, feasibility band classification, knowledge gap detection, and executive summary.",
      step4Title: "Step 4: Process Insight Form (PIF)",
      step4Content: "Generate shareable PIF links and send to process participants. The PIF collects operational insights across 40 questions in 8 sections, capturing operational readiness scores (Process Clarity, Change Magnitude, Workflow Brittleness), ROI data (time/volume metrics from Q28-Q31, quality impact from Q39-Q41), and qualitative insights. Multiple respondents can provide input, with variance tracking showing alignment levels.",
      step5Title: "Step 5: Readiness Rubric Analysis",
      step5Content: "View the combined readiness score calculated as 60% TFA + 40% PIF. The rubric breaks down all 7 components with their individual weights, provides feasibility band classification, and generates a comprehensive SWOT analysis identifying strengths, weaknesses, opportunities, and threats.",
      step6Title: "Step 6: Opportunity Identification & Prioritization",
      step6Content: "Create implementation opportunities specifying ROI data, time savings, optional error reduction metrics, and optional revenue uplift metrics. View the Opportunity Matrix scatter plot showing Business Impact (X-axis) vs Implementation Effort (Y-axis). Compare opportunities using both Base Impact Matrix (pure time savings) and Enhanced Impact Matrix (with quality and growth bonuses).",
    },
    
    tfaMethodology: {
      title: "TFA Methodology",
      intro: "The Technical Feasibility Assessment (TFA) evaluates the technical foundation required for successful AI implementation. It is designed to be completed by technical stakeholders who understand the systems, data, and infrastructure involved in the workflow.",
      questionsStructure: "Questions Structure",
      questionsStructureContent: "21 questions organized across 4 technical sections. Each question uses a 1-5 scoring scale where 5 represents optimal readiness and 1 represents significant technical barriers. Respondents can also select 'Don't Know' to flag knowledge gaps, triggering metadata capture for gap resolution.",
      sectionWeights: "Section Weights",
      systemEnvironment: "System Environment (25%): Infrastructure, deployment models, API availability, programmatic access, system performance, and change management processes",
      dataQuality: "Data Quality (30%): Data availability, structure, cleanliness, volume, labeling quality, and historical tracking",
      integrationFeasibility: "Integration Feasibility (30%): Technical integration capabilities, vendor cooperation, data exchange formats, latency tolerance, and monitoring infrastructure",
      securityCompliance: "Security & Compliance (15%): Security requirements, data privacy standards, compliance frameworks, audit trails, and regulatory constraints",
      scoringAlgorithm: "Scoring Algorithm",
      scoringAlgorithmContent: "TFA Score = Weighted average across all sections, normalized to 0-100 scale. Formula: TFA = [(System Environment × 0.25) + (Data Quality × 0.30) + (Integration Feasibility × 0.30) + (Security/Compliance × 0.15)]. Each section score is calculated as the average of its question scores, weighted by question importance. Knowledge gaps (Don't Know responses) are excluded from calculations but tracked separately for risk assessment.",
      feasibilityBands: "Feasibility Bands",
      veryHigh: "Very High Feasibility (80-100): Optimal technical foundation. Systems are modern, well-integrated, and AI-ready. Minimal technical barriers to implementation.",
      high: "High Feasibility (65-79): Strong technical foundation with minor gaps. Implementation is viable with manageable technical adjustments.",
      moderate: "Moderate Feasibility (50-64): Adequate technical foundation with notable gaps. Implementation requires focused technical investments and system improvements.",
      low: "Low Feasibility (35-49): Limited technical foundation. Significant infrastructure improvements required before AI implementation is viable.",
      veryLow: "Very Low Feasibility (<35): Insufficient technical foundation. Major system upgrades and technical investments needed. Consider fundamental infrastructure improvements before pursuing AI automation.",
      gapDetection: "Knowledge Gap Detection",
      gapDetectionContent: "When respondents select 'Don't Know', the system captures metadata: (1) Why the question cannot be answered, (2) Who might have this information. This creates an actionable knowledge gap inventory, identifying information needed before proceeding with implementation. High-impact questions with gaps are flagged as critical blockers.",
      executiveSummary: "Executive Summary Generation",
      executiveSummaryContent: "The TFA generates an executive summary highlighting: Overall feasibility assessment with band classification, Critical technical gaps that must be addressed, Key technical strengths to leverage, Implementation roadmap prioritizing gap resolution and infrastructure improvements. This summary translates technical data into strategic guidance for decision-makers.",
    },
    
    pifMethodology: {
      title: "PIF Methodology",
      intro: "The Process Insight Form (PIF) gathers operational readiness data and ROI inputs directly from the people who perform the work. Unlike the technical TFA, the PIF captures the human dimension: process clarity, change readiness, time/volume data, and quality metrics.",
      questionsStructure: "Questions Structure",
      questionsStructureContent: "40 questions across 8 distinct sections. The first 3 sections calculate operational readiness scores; the middle sections capture ROI data; the final sections gather qualitative insights and experience feedback.",
      sections: "Eight Sections",
      section1: "Process Clarity (Q1-Q3): Standardization, sequence consistency, documentation availability",
      section2: "Change Magnitude (Q4-Q6): Rule stability, workflow impact, technology adoption comfort",
      section3: "Workflow Brittleness (Q7-Q11): Error frequency, downstream impact, recovery complexity, system dependencies, manual intervention needs",
      section4: "Time Savings Opportunities (Q12-Q19): Frequency, repetitive tasks, time consumption, automation potential",
      section5: "Revenue Uplift Potential (Q20-Q27): Capacity constraints, speed impact, customer experience effects, competitive advantages",
      section6: "Experience & Insights (Q28-Q33): Frustrations, ideal improvements, missing support",
      section7: "Time & Volume Data (Q34-Q38): Cycle time, weekly volume, seasonal patterns, resource requirements",
      section8: "Quality Impact Data (Q39-Q43): Error rates, error costs, rework needs, customer satisfaction effects",
      operationalScores: "Operational Readiness Scores",
      operationalScoresContent: "Three operational scores contribute to the Readiness Rubric: Process Clarity Score (20% weight): Average of Q1-Q3, measuring standardization and documentation. Change Magnitude Score (20% weight): Average of Q4-Q6, with inverse scoring for Q4 (higher change frequency = lower readiness). Workflow Brittleness Score (8% weight): Average of Q7-Q11, with inverse scoring (higher brittleness = lower readiness). These scores combine with TFA to form the comprehensive Readiness Rubric.",
      roiDataExtraction: "ROI Data Extraction",
      roiDataExtractionContent: "Critical ROI inputs are extracted from specific questions: Time/Volume Metrics (Q34-Q38): Cycle time per instance, weekly volume processed, seasonal/temporal patterns, FTE count dedicated to workflow. Quality Impact Metrics (Q39-Q43): Current error rate percentage, financial cost per error, hours spent on rework, customer satisfaction impact. These inputs power opportunity ROI calculations and enable consultants to quantify business impact with real operational data.",
      qualitativeInsights: "Qualitative Insights Capture",
      qualitativeInsightsContent: "Open-ended questions (Q28-Q33, Q42-Q43) capture rich qualitative data: Current frustrations and pain points, Ideal state descriptions from practitioners, Missing capabilities or support needs, Customer and stakeholder impact narratives. This qualitative data informs opportunity descriptions and helps consultants understand the human context behind the numbers.",
      multiRespondent: "Multi-Respondent Aggregation",
      multiRespondentContent: "Multiple process participants can complete the PIF for the same workflow. The platform aggregates responses showing: Average scores across respondents, Variance indicators (Low/Moderate/High), Individual respondent details with their roles and perspectives. High variance signals misalignment or different process experiences, prompting deeper investigation before implementation planning.",
    },
    
    readinessRubric: {
      title: "Readiness Rubric",
      intro: "The Readiness Rubric combines technical feasibility (TFA) and operational readiness (PIF) into a comprehensive assessment of implementation readiness. This weighted formula ensures both technical capability and organizational readiness are evaluated.",
      weightingFormula: "Weighting Formula",
      weightingFormulaContent: "Readiness Score = (TFA Score × 60%) + (PIF Score × 40%). Technical feasibility receives higher weight (60%) because without technical foundation, even operationally ready processes cannot be automated. The 40% PIF weight ensures operational factors significantly influence overall readiness—recognizing that technical capability alone does not guarantee successful implementation.",
      componentBreakdown: "Seven Component Breakdown",
      component1: "Data Quality (18%): Highest individual weight. Without quality data, AI solutions cannot function reliably. This component directly determines AI performance.",
      component2: "Integration Feasibility (18%): Equally critical. Systems must connect seamlessly for automation to work. Poor integration creates fragile implementations.",
      component3: "System Environment (15%): Infrastructure foundation. Modern, scalable systems support sustainable AI solutions.",
      component4: "Process Clarity (12%): Standardized processes are easier to automate. High clarity reduces implementation complexity and improves solution quality.",
      component5: "Change Magnitude (12%): Understanding change scope informs adoption planning. Lower magnitude typically means faster, smoother implementations.",
      component6: "Security & Compliance (9%): Essential but often verification rather than capability. Organizations either meet standards or have clear remediation paths.",
      component7: "Workflow Brittleness (6%): Lowest weight. Indicates risk rather than capability. Even brittle workflows can be automated with careful design.",
      feasibilityBanding: "Feasibility Banding",
      feasibilityBandingContent: "The combined readiness score is classified into the same bands as TFA: Very High (80-100), High (65-79), Moderate (50-64), Low (35-49), Very Low (<35). However, the combined score reflects both technical and operational dimensions, providing a more holistic implementation readiness assessment.",
      swotAnalysis: "SWOT Analysis Generation",
      swotAnalysisContent: "The platform automatically generates a SWOT analysis based on component scores: Strengths: Components scoring above 75, highlighting ready capabilities. Weaknesses: Components scoring below 50, identifying areas requiring improvement. Opportunities: High-scoring areas where quick wins are possible. Threats: Low-scoring areas that could derail implementation if not addressed. This framework translates scores into strategic insights for stakeholders.",
    },
    
    opportunityMatrix: {
      title: "Opportunity Matrix",
      intro: "The Opportunity Matrix visualizes implementation opportunities on a scatter plot with Business Impact (X-axis) vs Implementation Effort (Y-axis). This prioritization framework helps consultants and stakeholders identify which opportunities to pursue first.",
      businessImpactScoring: "Business Impact Scoring (X-axis, 0-100)",
      businessImpactScoringContent: "Business Impact is scored relative to company size, ensuring opportunities are evaluated in proper business context. A $100K ROI means different things for a $1M company vs a $100M company. The scoring uses company-relative formulas with a 10× multiplier to create meaningful scores.",
      multiplierExplanation: "10× Multiplier Explanation",
      multiplierExplanationContent: "Why the multiplier? Workflow-level automation impacts rarely exceed 10% of company-wide metrics. Without amplification, a genuinely impactful opportunity might score just 2 out of 100, making meaningful comparisons impossible. The 10× multiplier rescales the 0-10% range to fill the 0-100 scoring range, creating intuitive, comparable scores. Real-world example: Automating invoice processing in a 100-person company saves 1 FTE annually. Impact: 1 FTE ÷ 100 employees = 1% company-wide savings. Without multiplier: Score = 1 (appears trivial). With 10× multiplier: Score = 10 (modest but meaningful). A truly exceptional 10% company-wide impact scores the maximum 100, while realistic 2-5% impacts score 20-50, enabling clear prioritization. The multiplier doesn't change the underlying math—it simply makes workflow-level impacts visible and comparable.",
      dualMatrixSystem: "Dual-Matrix Scoring System",
      dualMatrixIntro: "The platform uses TWO separate scoring matrices to evaluate opportunities: Base Impact Matrix (pure time savings comparison) and Enhanced Impact Matrix (with quality and growth bonuses). This dual-matrix approach provides both apples-to-apples comparison and comprehensive business value assessment.",
      baseMatrixTitle: "Base Impact Matrix (0-100 Scale)",
      baseMatrixContent: "Base Impact = (ROI Score × 60%) + (Hours Score × 40%). This fixed formula NEVER changes, providing consistent apples-to-apples comparison across all opportunities. The Base Matrix focuses purely on time savings efficiency, ensuring you can always compare opportunities on equal footing regardless of whether they include error reduction or revenue uplift. Every opportunity receives a Base Impact score on this standardized 0-100 scale.",
      enhancedMatrixTitle: "Enhanced Impact Matrix (Dynamic 0-150 Scale)",
      enhancedMatrixContent: "Enhanced Impact = Base Impact + Bonuses. The Enhanced Matrix uses an additive bonus model: it starts with the Base Impact score, then layers on bonuses for error reduction (+25 max) and revenue uplift (+25 max). This means Enhanced Impact is ALWAYS ≥ Base Impact—bonuses can only increase scores, never decrease them. The scale adjusts dynamically: Time Only = 0-100 (no bonuses), Time + Error or Time + Revenue = 0-125 (one +25 bonus), All Three Metrics = 0-150 (both bonuses).",
      bonusCalculationTitle: "Bonus Calculation Details",
      bonusCalculationContent: "Error Reduction Bonus: (Error Score × 25%) capped at +25 points. Revenue Uplift Bonus: (Revenue Score × 25%) capped at +25 points. These bonuses are added on top of the base 60/40 time savings score, not redistributed. Example: An opportunity with ROI Score = 60, Hours Score = 40, Error Score = 80 would have Base Impact = (60 × 0.60) + (40 × 0.40) = 52, Enhanced Impact = 52 + (80 × 0.25) = 52 + 20 = 72. The Enhanced score is always higher when bonuses apply.",
      matrixGuaranteeTitle: "Key Guarantee: Enhanced ≥ Base Always",
      matrixGuaranteeContent: "Because bonuses are additive (not redistributive), the Enhanced Impact Matrix ALWAYS scores opportunities equal to or higher than the Base Impact Matrix. This mathematical guarantee means you never lose the base time-savings comparison while gaining visibility into additional business value. Use Base Matrix for pure efficiency comparison, Enhanced Matrix for comprehensive business impact including quality and growth.",
      scatterPlotInterpretation: "Scatter Plot Interpretation",
      scatterPlotInterpretationContent: "The matrix divides into four quadrants based on median values: Quick Wins (High Impact, Low Effort): Prioritize immediately. These deliver strong results with manageable implementation complexity. Strategic Bets (High Impact, High Effort): Long-term strategic projects. Significant business value justifies higher implementation investment. Nice-to-Haves (Low Impact, Low Effort): Consider after higher priorities. Easy to implement but limited business impact. Deprioritize (Low Impact, High Effort): Avoid unless strategic reasons exist. Poor ROI relative to implementation complexity.",
      quadrants: "Quadrant Definitions",
      quadrant1: "Quick Wins: High business impact, low implementation effort. These opportunities should be prioritized for immediate action.",
      quadrant2: "Strategic Bets: High business impact, high implementation effort. Valuable long-term investments requiring significant resources and planning.",
      quadrant3: "Nice-to-Haves: Low business impact, low implementation effort. Easy wins but limited strategic value. Pursue after higher priorities.",
      quadrant4: "Deprioritize: Low business impact, high implementation effort. Avoid unless non-financial strategic drivers exist.",
    },
    
    roiCalculations: {
      title: "ROI Calculations",
      intro: "The platform calculates ROI and business impact using company-relative formulas that account for organization size and financial context.",
      annualRoiFormula: "Annual ROI Formula",
      annualRoiFormulaContent: "Annual ROI = (Annual Hours Saved × Hourly Labor Cost) - Implementation Costs. Where: Annual Hours Saved = Hours per Week × 52 weeks, Hourly Labor Cost = (Total Company Labor Costs / Total Employees) / 2080 hours. Implementation costs include training, ramp-up, and integration expenses captured in opportunity details.",
      fteSavingsFormula: "FTE Savings Formula",
      fteSavingsFormulaContent: "FTE Savings = Annual Hours Saved / 2080 hours. This represents the full-time equivalent headcount liberated to focus on higher-value work. Critical note: FTE savings does not mean job elimination. It represents capacity reallocation, enabling employees to augment their capabilities and contribute to more strategic initiatives.",
      businessImpactScoring: "Business Impact Scoring (Company-Relative)",
      businessImpactScoringContent: "ROI Score = (Annual ROI / Company Annual Revenue) × 1000, capped at 100. Example: $50K ROI for $5M company = (50,000 / 5,000,000) × 1000 = 10. A 10% ROI (very high) scores 100, 5% scores 50, 2% scores 20, 1% scores 10. Hours Score = (FTE Savings / Total Employees) × 1000, capped at 100. Example: 2 FTE saved for 200-employee company = (2 / 200) × 1000 = 10. A 10% workforce impact (exceptional) scores 100, 1% scores 10. This ensures opportunities are evaluated relative to company size, not absolute dollars.",
      implementationEffort: "Implementation Effort Calculation (Y-axis, 0-100)",
      implementationEffortContent: "Implementation Effort = (Inverted Readiness × 40%) + (Ramp-up Period × 25%) + (Payback Period × 25%) + (Training Hours × 10%). Inverted Readiness (40% weight): Higher readiness = lower effort. A workflow with 80 readiness has effort contribution of (100-80) × 0.40 = 8. Ramp-up Period (25% weight): 3 months = 0, 18+ months = 100, linear scaling between. Payback Period (25% weight): 6 months = 0, 36+ months = 100, linear scaling between. Training Hours (10% weight): 2 hours/employee = 0, 40+ hours = 100, linear scaling between. This multi-factor formula captures true implementation complexity.",
    },
    
    formulasReference: {
      title: "Formulas Reference",
      intro: "Complete reference of all scoring and calculation formulas used throughout the platform.",
      tfaScore: "TFA Score (Technical Feasibility Assessment)",
      tfaScoreFormula: "TFA Score = [(Σ System Environment questions / count) × 0.25] + [(Σ Data Quality questions / count) × 0.30] + [(Σ Integration Feasibility questions / count) × 0.30] + [(Σ Security/Compliance questions / count) × 0.15]. Scale: 0-100. Questions scored 1-5, 'Don't Know' excluded from calculations.",
      readinessScore: "Readiness Score (Combined TFA + PIF)",
      readinessScoreFormula: "Readiness Score = (TFA Score × 0.60) + (PIF Score × 0.40). Where PIF Score = (Process Clarity × 0.20) + (Change Magnitude × 0.20) + (Workflow Brittleness × 0.08). Note: PIF weights are relative to the 40% PIF contribution. Scale: 0-100.",
      roiScore: "ROI Score (Company-Relative)",
      roiScoreFormula: "ROI Score = MIN(100, (Annual ROI / Company Annual Revenue) × 1000). Example: $100K ROI, $10M revenue = (100,000 / 10,000,000) × 1000 = 10. Scoring guide: 10% = 100, 5% = 50, 2% = 20, 1% = 10.",
      hoursScore: "Hours Score (Company-Relative)",
      hoursScoreFormula: "Hours Score = MIN(100, (FTE Savings / Total Employees) × 1000). Where FTE Savings = Annual Hours Saved / 2080. Example: 1 FTE saved, 100 employees = (1 / 100) × 1000 = 10. Scoring guide: 10% = 100, 5% = 50, 1% = 10.",
      errorScore: "Error Reduction Score (Company-Relative)",
      errorScoreFormula: "Error Score = MIN(100, (Annual Error Cost Avoided / Company Annual Revenue) × 1000). Where Annual Error Cost Avoided = Errors Avoided × Cost per Error. Scoring follows same company-relative pattern as ROI and Hours.",
      revenueScore: "Revenue Uplift Score (Company-Relative)",
      revenueScoreFormula: "Revenue Score = MIN(100, (Annual Revenue Uplift / Company Annual Revenue) × 1000). Scoring follows same company-relative pattern as ROI and Hours.",
      baseImpactMatrix: "Base Impact Matrix (Fixed 0-100 Scale)",
      baseImpactMatrixFormula: "Base Impact = (ROI Score × 0.60) + (Hours Score × 0.40). This formula is FIXED and never changes, providing consistent apples-to-apples comparison across all opportunities regardless of error/revenue metrics. Scale: Always 0-100.",
      enhancedImpactMatrix: "Enhanced Impact Matrix (Dynamic Scale)",
      enhancedImpactMatrixFormula: "Enhanced Impact = Base Impact + Error Bonus + Revenue Bonus. Where: Base Impact = (ROI Score × 0.60) + (Hours Score × 0.40), Error Bonus = (Error Score × 0.25) when enabled (max +25), Revenue Bonus = (Revenue Score × 0.25) when enabled (max +25). Scale: 0-100 (time only), 0-125 (one bonus), 0-150 (both bonuses). Key guarantee: Enhanced Impact ≥ Base Impact always, since bonuses are additive.",
      bonusFormulas: "Additive Bonus Formulas",
      bonusFormulasExplanation: "Error Reduction Bonus = MIN(25, Error Score × 0.25). Revenue Uplift Bonus = MIN(25, Revenue Score × 0.25). These bonuses are layered on top of the base 60/40 time-savings score. Example: ROI Score = 50, Hours Score = 60, Error Score = 80, Revenue Score = 40 → Base Impact = (50 × 0.60) + (60 × 0.40) = 54, Enhanced Impact = 54 + (80 × 0.25) + (40 × 0.25) = 54 + 20 + 10 = 84.",
      implementationEffort: "Implementation Effort",
      implementationEffortFormula: "Implementation Effort = (Inverted Readiness × 0.40) + (Normalized Ramp-up × 0.25) + (Normalized Payback × 0.25) + (Normalized Training × 0.10). Where: Inverted Readiness = 100 - Readiness Score. Normalized Ramp-up: 0 at ≤3 months, 100 at ≥18 months, linear between. Normalized Payback: 0 at ≤6 months, 100 at ≥36 months, linear between. Normalized Training: 0 at ≤2 hours, 100 at ≥40 hours, linear between. Scale: 0-100 (lower = easier).",
    },
  },

  companySnapshot: {
    title: "Company Diagnostic Snapshot",
    generatedOn: "Generated on",
    notAvailable: "N/A",
    notCompleted: "Not yet completed",
    workflowSection: "Workflow",
    
    header: {
      companySnapshot: "Company Diagnostic Snapshot",
      financialContext: "Financial Context",
      generationDate: "Generation Date",
    },
    
    tfaSection: {
      title: "Technical Feasibility Assessment (TFA)",
      overallScore: "Overall TFA Score",
      feasibilityBand: "Feasibility Band",
      criticalGaps: "Critical Technical Gaps",
      keyStrengths: "Key Technical Strengths",
      roadmapRecommendations: "Implementation Roadmap Recommendations",
      noGapsIdentified: "No critical gaps identified",
      noStrengthsIdentified: "No key strengths identified",
    },
    
    pifSection: {
      title: "Process Insight Form (PIF)",
      respondents: "Respondents",
      operationalScores: "Operational Readiness Scores",
      average: "Average",
      range: "Range",
      qualitativeInsights: "Representative Qualitative Insights",
      roiInputsSummary: "ROI Inputs Summary",
      noQualitativeData: "No qualitative insights available",
    },
    
    readinessSection: {
      title: "Readiness Rubric",
      combinedScore: "Combined Readiness Score",
      componentBreakdown: "Component Breakdown",
      feasibilityAssessment: "Feasibility Assessment",
      swotAnalysis: "SWOT Analysis",
      strengths: "Strengths",
      weaknesses: "Weaknesses",
      opportunities: "Opportunities",
      threats: "Threats",
      requiresData: "Requires both TFA and PIF data for calculation",
    },
    
    opportunitiesSection: {
      title: "Implementation Opportunities",
      annualRoi: "Annual ROI",
      fteSavings: "FTE Savings",
      businessImpactScore: "Business Impact Score",
      implementationEffortScore: "Implementation Effort Score",
      errorReduction: "Error Reduction",
      revenueUplift: "Revenue Uplift",
      noOpportunities: "No implementation opportunities defined for this workflow",
    },
    
    matrixSection: {
      title: "Opportunity Matrix",
      filterView: "Filter View",
      quadrantInterpretation: "Quadrant Interpretation",
      noMatrixData: "Opportunity matrix unavailable - requires both TFA and PIF data",
    },
    
    transparency: {
      title: "Calculation Transparency",
      tfaScoring: "TFA Scoring Methodology",
      tfaScoringExplanation: "The Technical Feasibility Assessment uses a weighted scoring system across four critical dimensions. Each section contributes to the overall TFA score based on its relative importance to successful AI implementation.",
      sectionWeights: "Section Weights: System Environment (25%), Data Quality (30%), Integration Feasibility (30%), Security & Compliance (15%)",
      pifScoring: "PIF Scoring Methodology",
      pifScoringExplanation: "The Process Insight Form calculates operational readiness by aggregating scores across three dimensions: Process Clarity, Change Magnitude, and Workflow Brittleness. Scores are normalized to a 0-100 scale and averaged across all respondents.",
      readinessFormula: "Readiness Rubric Formula",
      readinessFormulaExplanation: "Combined Readiness Score = (TFA Score × 60%) + (PIF Score × 40%). This formula weights technical feasibility higher because strong technical foundation is essential for successful AI implementation, while still ensuring operational readiness significantly influences the assessment.",
      businessImpactScoring: "Business Impact Scoring",
      businessImpactExplanation: "Business Impact scores are calculated relative to company size, ensuring opportunities are evaluated in proper business context. The scoring uses a company-relative formula to normalize impact scores.",
      multiplierExplanation: "10× Multiplier: We use a 1000× multiplier to convert small percentages into meaningful 0-100 scores. For example, an opportunity saving 1% of company workforce scores 10, while 10% scores 100 (the maximum).",
      implementationEffort: "Implementation Effort Scoring",
      implementationEffortExplanation: "Implementation Effort combines readiness scores (40%), ramp-up period (25%), payback period (25%), and training requirements (10%) to estimate implementation complexity on a 0-100 scale where lower scores indicate easier implementation.",
      scoringGuideTables: "Scoring Guide Tables",
      scoreInterpretation: "Score Interpretation",
      roiScoreGuide: "ROI Score Guide (Company-Relative)",
      hoursScoreGuide: "Hours Saved Score Guide (Company-Relative)",
      errorScoreGuide: "Error Reduction Score Guide (Company-Relative)",
      revenueScoreGuide: "Revenue Uplift Score Guide (Company-Relative)",
      score100Meaning: "Score 100 = 10% company impact (exceptional)",
      score50Meaning: "Score 50 = 5% company impact (significant)",
      score20Meaning: "Score 20 = 2% company impact (notable)",
      score10Meaning: "Score 10 = 1% company impact (meaningful)",
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
    loadingEllipsis: "Cargando...",
    error: "Error",
    success: "Éxito",
    required: "Requerido",
    optional: "Opcional",
    yes: "Sí",
    no: "No",
    back: "Atrás",
    backToDashboard: "Volver al Panel",
    next: "Siguiente",
    submit: "Enviar",
    download: "Descargar",
    close: "Cerrar",
    platformName: "Plataforma de Diagnóstico Automat-IA",
    scoringGuide: "Guía de Puntuación",
    unknownCompany: "Empresa Desconocida",
    unknownIndustry: "Desconocido",
    searchWorkflows: "Buscar flujos de trabajo...",
    noOpportunities: "Aún no hay oportunidades. Cree oportunidades en las páginas de detalle del flujo de trabajo.",
    noOpportunitiesWithAssessments: "No hay oportunidades con evaluaciones TFA y PIF completadas. Complete las evaluaciones para ver las oportunidades aquí.",
  },
  nav: {
    dashboard: "Panel",
    companies: "Empresas",
    documentation: "Documentación",
  },
  dashboard: {
    title: "Diagnósticos de Implementación de IA",
    subtitle: "Gestionar evaluaciones de viabilidad de IA para empresas clientes",
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
    backToCompany: "Volver a la Empresa",
    unknownWorkflow: "Flujo de Trabajo Desconocido",
    errorLoadingWorkflow: "Error al cargar el flujo de trabajo",
    errorLoadingCompany: "Error al cargar la empresa",
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
    yourResponsibilities: "Su Rol en este Flujo de Trabajo: ¿Qué tareas específicas realiza?",
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
      niceToHave: "Agradables de Tener",
      deprioritize: "Despriorizar",
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
    errorLoadingAssessment: "Error al cargar datos de evaluación",
    errorSaving: "Error al guardar datos",
    errorDeleting: "Error al eliminar elemento",
    errorUpdating: "Error al actualizar datos",
    error: "Error",
    success: "Éxito",
    responseDeleted: "Respuesta eliminada",
    responseDeletedDesc: "La respuesta PIF ha sido eliminada exitosamente.",
    deleteFailed: "Error al eliminar",
  },
  tabs: {
    technicalFeasibility: "Viabilidad Técnica",
    processInsights: "Perspectivas del Proceso",
    readinessRubric: "Rúbrica de Preparación",
    opportunities: "Oportunidades",
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
    allThreeExplanation: "Las tres métricas habilitadas: El modo de puntuación más completo donde impacto empresarial = (ROI × 40%) + (Horas × 25%) + (Error × 20%) + (Ingresos × 15%).",
    roiThresholds: "Umbrales de ROI",
    hoursThresholds: "Umbrales de Horas Ahorradas",
    errorThresholds: "Umbrales de Reducción de Errores",
    revenueThresholds: "Umbrales de Aumento de Ingresos",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
  },
  documentation: {
    title: "Manual de la Plataforma",
    tableOfContents: "Tabla de Contenidos",
    
    platformOverview: {
      title: "Descripción General de la Plataforma",
      purpose: "Propósito",
      purposeContent: "Automat-IA es una plataforma de diagnóstico integral diseñada para ayudar a los consultores a evaluar sistemáticamente las oportunidades de implementación de IA dentro de las organizaciones cliente. Nuestra plataforma empodera a los consultores para recopilar datos técnicos y operacionales, calcular el impacto empresarial e identificar oportunidades de automatización que aumentan las capacidades humanas, permitiendo que los trabajadores se enfoquen en actividades de mayor valor.",
      targetUsers: "Usuarios Objetivo",
      targetUsersContent: "Consultores técnicos, analistas de negocios y especialistas en implementación que trabajan con organizaciones cliente para evaluar la preparación de IA e identificar oportunidades de automatización. La plataforma sirve como puente entre la evaluación técnica y la estrategia empresarial.",
      keyBenefits: "Beneficios Clave",
      benefit1: "Evaluación Estructurada: Marco de evaluación sistemático que combina viabilidad técnica (TFA) y perspectivas operacionales (PIF)",
      benefit2: "Decisiones Basadas en Datos: La puntuación relativa a la empresa asegura que las oportunidades se evalúen en el contexto empresarial adecuado",
      benefit3: "Alineación de Partes Interesadas: Soporte bilingüe y enlaces compartibles permiten la participación de múltiples partes interesadas",
      benefit4: "Hojas de Ruta Accionables: Puntuación integral, análisis FODA y priorización de oportunidades guían la estrategia de implementación",
      workflowProgression: "Progresión del Flujo de Trabajo",
      workflowProgressionContent: "Cada flujo de trabajo avanza a través de etapas definidas: Solo TFA → TFA + Preparación → Preparación + Impacto → Completo. Esta progresión asegura que los consultores recopilen los datos necesarios antes de hacer recomendaciones estratégicas.",
    },
    
    userJourney: {
      title: "Recorrido del Usuario",
      intro: "El flujo de trabajo del consultor sigue una progresión sistemática desde la creación de la empresa hasta el análisis integral:",
      step1Title: "Paso 1: Creación de Empresa",
      step1Content: "Cree un perfil de empresa con contexto financiero esencial (ingresos anuales, total de empleados). Este contexto impulsa la puntuación relativa de la empresa en toda la plataforma.",
      step2Title: "Paso 2: Definición de Flujo de Trabajo",
      step2Content: "Defina flujos de trabajo específicos dentro de la empresa para evaluar el potencial de automatización. Cada flujo de trabajo se evalúa de forma independiente con su propio TFA, PIF, puntuación de preparación y oportunidades.",
      step3Title: "Paso 3: Evaluación de Viabilidad Técnica (TFA)",
      step3Content: "Genere un enlace TFA compartible y envíelo a las partes interesadas técnicas. El TFA evalúa la base técnica a través de 21 preguntas en 4 secciones: Entorno del Sistema (25%), Calidad de Datos (30%), Viabilidad de Integración (30%) y Seguridad/Cumplimiento (15%). Los resultados incluyen una puntuación de 0-100, clasificación de banda de viabilidad, detección de brechas de conocimiento y resumen ejecutivo.",
      step4Title: "Paso 4: Formulario de Perspectivas del Proceso (PIF)",
      step4Content: "Genere enlaces PIF compartibles y envíelos a los participantes del proceso. El PIF recopila perspectivas operacionales a través de 40 preguntas en 8 secciones, capturando puntuaciones de preparación operacional (Claridad del Proceso, Magnitud del Cambio, Fragilidad del Flujo de Trabajo), datos de ROI (métricas de tiempo/volumen de P28-P31, impacto de calidad de P39-P41) y perspectivas cualitativas. Múltiples encuestados pueden proporcionar información, con seguimiento de varianza que muestra niveles de alineación.",
      step5Title: "Paso 5: Análisis de Rúbrica de Preparación",
      step5Content: "Vea la puntuación de preparación combinada calculada como 60% TFA + 40% PIF. La rúbrica desglosa los 7 componentes con sus pesos individuales, proporciona clasificación de banda de viabilidad y genera un análisis FODA integral que identifica fortalezas, debilidades, oportunidades y amenazas.",
      step6Title: "Paso 6: Identificación y Priorización de Oportunidades",
      step6Content: "Cree oportunidades de implementación especificando datos de ROI, ahorro de tiempo, métricas opcionales de reducción de errores y métricas opcionales de aumento de ingresos. Vea el gráfico de dispersión de la Matriz de Oportunidades mostrando Impacto Empresarial (eje X) vs Esfuerzo de Implementación (eje Y). Compare oportunidades usando tanto la Matriz de Impacto Base (ahorro de tiempo puro) como la Matriz de Impacto Mejorada (con bonificaciones de calidad y crecimiento).",
    },
    
    tfaMethodology: {
      title: "Metodología TFA",
      intro: "La Evaluación de Viabilidad Técnica (TFA) evalúa la base técnica requerida para una implementación exitosa de IA. Está diseñada para ser completada por partes interesadas técnicas que comprenden los sistemas, datos e infraestructura involucrados en el flujo de trabajo.",
      questionsStructure: "Estructura de Preguntas",
      questionsStructureContent: "21 preguntas organizadas en 4 secciones técnicas. Cada pregunta usa una escala de puntuación de 1-5 donde 5 representa preparación óptima y 1 representa barreras técnicas significativas. Los encuestados también pueden seleccionar 'No sé' para marcar brechas de conocimiento, activando la captura de metadatos para la resolución de brechas.",
      sectionWeights: "Pesos de Sección",
      systemEnvironment: "Entorno del Sistema (25%): Infraestructura, modelos de implementación, disponibilidad de API, acceso programático, rendimiento del sistema y procesos de gestión de cambios",
      dataQuality: "Calidad de Datos (30%): Disponibilidad de datos, estructura, limpieza, volumen, calidad de etiquetado y seguimiento histórico",
      integrationFeasibility: "Viabilidad de Integración (30%): Capacidades de integración técnica, cooperación de proveedores, formatos de intercambio de datos, tolerancia a la latencia e infraestructura de monitoreo",
      securityCompliance: "Seguridad y Cumplimiento (15%): Requisitos de seguridad, estándares de privacidad de datos, marcos de cumplimiento, pistas de auditoría y restricciones regulatorias",
      scoringAlgorithm: "Algoritmo de Puntuación",
      scoringAlgorithmContent: "Puntuación TFA = Promedio ponderado en todas las secciones, normalizado a escala 0-100. Fórmula: TFA = [(Entorno del Sistema × 0.25) + (Calidad de Datos × 0.30) + (Viabilidad de Integración × 0.30) + (Seguridad/Cumplimiento × 0.15)]. La puntuación de cada sección se calcula como el promedio de las puntuaciones de sus preguntas, ponderadas por la importancia de la pregunta. Las brechas de conocimiento (respuestas 'No sé') se excluyen de los cálculos pero se rastrean por separado para la evaluación de riesgos.",
      feasibilityBands: "Bandas de Viabilidad",
      veryHigh: "Viabilidad Muy Alta (80-100): Base técnica óptima. Los sistemas son modernos, bien integrados y listos para IA. Barreras técnicas mínimas para la implementación.",
      high: "Viabilidad Alta (65-79): Base técnica sólida con brechas menores. La implementación es viable con ajustes técnicos manejables.",
      moderate: "Viabilidad Moderada (50-64): Base técnica adecuada con brechas notables. La implementación requiere inversiones técnicas enfocadas y mejoras del sistema.",
      low: "Viabilidad Baja (35-49): Base técnica limitada. Se requieren mejoras significativas de infraestructura antes de que la implementación de IA sea viable.",
      veryLow: "Viabilidad Muy Baja (<35): Base técnica insuficiente. Se necesitan actualizaciones importantes del sistema e inversiones técnicas. Considere mejoras fundamentales de infraestructura antes de buscar la automatización de IA.",
      gapDetection: "Detección de Brechas de Conocimiento",
      gapDetectionContent: "Cuando los encuestados seleccionan 'No sé', el sistema captura metadatos: (1) Por qué no se puede responder la pregunta, (2) Quién podría tener esta información. Esto crea un inventario de brechas de conocimiento accionable, identificando la información necesaria antes de proceder con la implementación. Las preguntas de alto impacto con brechas se marcan como bloqueadores críticos.",
      executiveSummary: "Generación de Resumen Ejecutivo",
      executiveSummaryContent: "El TFA genera un resumen ejecutivo destacando: Evaluación general de viabilidad con clasificación de banda, Brechas técnicas críticas que deben abordarse, Fortalezas técnicas clave para aprovechar, Hoja de ruta de implementación priorizando la resolución de brechas y mejoras de infraestructura. Este resumen traduce datos técnicos en orientación estratégica para tomadores de decisiones.",
    },
    
    pifMethodology: {
      title: "Metodología PIF",
      intro: "El Formulario de Perspectivas del Proceso (PIF) recopila datos de preparación operacional y entradas de ROI directamente de las personas que realizan el trabajo. A diferencia del TFA técnico, el PIF captura la dimensión humana: claridad del proceso, preparación para el cambio, datos de tiempo/volumen y métricas de calidad.",
      questionsStructure: "Estructura de Preguntas",
      questionsStructureContent: "40 preguntas en 8 secciones distintas. Las primeras 3 secciones calculan puntuaciones de preparación operacional; las secciones medias capturan datos de ROI; las secciones finales recopilan perspectivas cualitativas y retroalimentación de experiencia.",
      sections: "Ocho Secciones",
      section1: "Claridad del Proceso (P1-P3): Estandarización, consistencia de secuencia, disponibilidad de documentación",
      section2: "Magnitud del Cambio (P4-P6): Estabilidad de reglas, impacto del flujo de trabajo, comodidad con la adopción de tecnología",
      section3: "Fragilidad del Flujo de Trabajo (P7-P11): Frecuencia de errores, impacto descendente, complejidad de recuperación, dependencias del sistema, necesidades de intervención manual",
      section4: "Oportunidades de Ahorro de Tiempo (P12-P19): Frecuencia, tareas repetitivas, consumo de tiempo, potencial de automatización",
      section5: "Potencial de Aumento de Ingresos (P20-P27): Restricciones de capacidad, impacto de velocidad, efectos de experiencia del cliente, ventajas competitivas",
      section6: "Experiencia y Perspectivas (P28-P33): Frustraciones, mejoras ideales, apoyo faltante",
      section7: "Datos de Tiempo y Volumen (P34-P38): Tiempo de ciclo, volumen semanal, patrones estacionales, requisitos de recursos",
      section8: "Datos de Impacto de Calidad (P39-P43): Tasas de error, costos de error, necesidades de retrabajo, efectos de satisfacción del cliente",
      operationalScores: "Puntuaciones de Preparación Operacional",
      operationalScoresContent: "Tres puntuaciones operacionales contribuyen a la Rúbrica de Preparación: Puntuación de Claridad del Proceso (peso 20%): Promedio de P1-P3, midiendo estandarización y documentación. Puntuación de Magnitud del Cambio (peso 20%): Promedio de P4-P6, con puntuación inversa para P4 (mayor frecuencia de cambio = menor preparación). Puntuación de Fragilidad del Flujo de Trabajo (peso 8%): Promedio de P7-P11, con puntuación inversa (mayor fragilidad = menor preparación). Estas puntuaciones se combinan con TFA para formar la Rúbrica de Preparación integral.",
      roiDataExtraction: "Extracción de Datos de ROI",
      roiDataExtractionContent: "Las entradas críticas de ROI se extraen de preguntas específicas: Métricas de Tiempo/Volumen (P34-P38): Tiempo de ciclo por instancia, volumen semanal procesado, patrones estacionales/temporales, recuento de FTE dedicado al flujo de trabajo. Métricas de Impacto de Calidad (P39-P43): Porcentaje de tasa de error actual, costo financiero por error, horas dedicadas al retrabajo, impacto en la satisfacción del cliente. Estas entradas impulsan los cálculos de ROI de oportunidades y permiten a los consultores cuantificar el impacto empresarial con datos operacionales reales.",
      qualitativeInsights: "Captura de Perspectivas Cualitativas",
      qualitativeInsightsContent: "Las preguntas abiertas (P28-P33, P42-P43) capturan datos cualitativos ricos: Frustraciones y puntos de dolor actuales, Descripciones de estado ideal de los practicantes, Capacidades o necesidades de apoyo faltantes, Narrativas de impacto de clientes y partes interesadas. Estos datos cualitativos informan las descripciones de oportunidades y ayudan a los consultores a comprender el contexto humano detrás de los números.",
      multiRespondent: "Agregación de Múltiples Encuestados",
      multiRespondentContent: "Múltiples participantes del proceso pueden completar el PIF para el mismo flujo de trabajo. La plataforma agrega respuestas mostrando: Puntuaciones promedio entre encuestados, Indicadores de varianza (Baja/Moderada/Alta), Detalles de encuestados individuales con sus roles y perspectivas. La alta varianza señala desalineación o diferentes experiencias de proceso, impulsando una investigación más profunda antes de la planificación de implementación.",
    },
    
    readinessRubric: {
      title: "Rúbrica de Preparación",
      intro: "La Rúbrica de Preparación combina viabilidad técnica (TFA) y preparación operacional (PIF) en una evaluación integral de preparación para implementación. Esta fórmula ponderada asegura que tanto la capacidad técnica como la preparación organizacional se evalúen.",
      weightingFormula: "Fórmula de Ponderación",
      weightingFormulaContent: "Puntuación de Preparación = (Puntuación TFA × 60%) + (Puntuación PIF × 40%). La viabilidad técnica recibe mayor peso (60%) porque sin base técnica, incluso los procesos operacionalmente listos no pueden ser automatizados. El peso del 40% PIF asegura que los factores operacionales influyan significativamente en la preparación general, reconociendo que la capacidad técnica por sí sola no garantiza una implementación exitosa.",
      componentBreakdown: "Desglose de Siete Componentes",
      component1: "Calidad de Datos (18%): Mayor peso individual. Sin datos de calidad, las soluciones de IA no pueden funcionar de manera confiable. Este componente determina directamente el rendimiento de la IA.",
      component2: "Viabilidad de Integración (18%): Igualmente crítico. Los sistemas deben conectarse sin problemas para que la automatización funcione. La integración pobre crea implementaciones frágiles.",
      component3: "Entorno del Sistema (15%): Base de infraestructura. Los sistemas modernos y escalables soportan soluciones de IA sostenibles.",
      component4: "Claridad del Proceso (12%): Los procesos estandarizados son más fáciles de automatizar. La alta claridad reduce la complejidad de implementación y mejora la calidad de la solución.",
      component5: "Magnitud del Cambio (12%): Comprender el alcance del cambio informa la planificación de adopción. Menor magnitud típicamente significa implementaciones más rápidas y fluidas.",
      component6: "Seguridad y Cumplimiento (9%): Esencial pero a menudo verificación en lugar de capacidad. Las organizaciones cumplen con los estándares o tienen caminos de remediación claros.",
      component7: "Fragilidad del Flujo de Trabajo (6%): Peso más bajo. Indica riesgo en lugar de capacidad. Incluso los flujos de trabajo frágiles pueden ser automatizados con diseño cuidadoso.",
      feasibilityBanding: "Bandas de Viabilidad",
      feasibilityBandingContent: "La puntuación de preparación combinada se clasifica en las mismas bandas que TFA: Muy Alta (80-100), Alta (65-79), Moderada (50-64), Baja (35-49), Muy Baja (<35). Sin embargo, la puntuación combinada refleja dimensiones tanto técnicas como operacionales, proporcionando una evaluación de preparación para implementación más holística.",
      swotAnalysis: "Generación de Análisis FODA",
      swotAnalysisContent: "La plataforma genera automáticamente un análisis FODA basado en puntuaciones de componentes: Fortalezas: Componentes con puntuación superior a 75, destacando capacidades listas. Debilidades: Componentes con puntuación inferior a 50, identificando áreas que requieren mejora. Oportunidades: Áreas de alta puntuación donde las victorias rápidas son posibles. Amenazas: Áreas de baja puntuación que podrían descarrilar la implementación si no se abordan. Este marco traduce puntuaciones en perspectivas estratégicas para las partes interesadas.",
    },
    
    opportunityMatrix: {
      title: "Matriz de Oportunidades",
      intro: "La Matriz de Oportunidades visualiza oportunidades de implementación en un gráfico de dispersión con Impacto Empresarial (eje X) vs Esfuerzo de Implementación (eje Y). Este marco de priorización ayuda a consultores y partes interesadas a identificar qué oportunidades perseguir primero.",
      businessImpactScoring: "Puntuación de Impacto Empresarial (eje X, 0-100)",
      businessImpactScoringContent: "El Impacto Empresarial se puntúa en relación con el tamaño de la empresa, asegurando que las oportunidades se evalúen en el contexto empresarial adecuado. Un ROI de $100K significa cosas diferentes para una empresa de $1M vs una empresa de $100M. La puntuación usa fórmulas relativas a la empresa con un multiplicador de 10× para crear puntuaciones significativas.",
      multiplierExplanation: "Explicación del Multiplicador 10×",
      multiplierExplanationContent: "¿Por qué el multiplicador? Los impactos de automatización a nivel de flujo de trabajo rara vez exceden el 10% de las métricas globales de la empresa. Sin amplificación, una oportunidad genuinamente impactante podría puntuar solo 2 de 100, haciendo imposibles las comparaciones significativas. El multiplicador 10× reescala el rango 0-10% para llenar el rango de puntuación 0-100, creando puntajes intuitivos y comparables. Ejemplo del mundo real: Automatizar el procesamiento de facturas en una empresa de 100 personas ahorra 1 FTE anualmente. Impacto: 1 FTE ÷ 100 empleados = 1% de ahorro a nivel empresa. Sin multiplicador: Puntuación = 1 (parece trivial). Con multiplicador 10×: Puntuación = 10 (modesto pero significativo). Un impacto excepcional del 10% a nivel empresa puntúa el máximo 100, mientras que impactos realistas del 2-5% puntúan 20-50, permitiendo priorización clara. El multiplicador no cambia las matemáticas subyacentes—simplemente hace visibles y comparables los impactos a nivel de flujo de trabajo.",
      dualMatrixSystem: "Sistema de Matriz Dual",
      dualMatrixIntro: "La plataforma usa DOS matrices de puntuación separadas para evaluar oportunidades: Matriz de Impacto Base (comparación pura de ahorro de tiempo) y Matriz de Impacto Mejorado (con bonificaciones de calidad y crecimiento). Este enfoque de matriz dual proporciona tanto comparación de manzanas con manzanas como evaluación integral del valor empresarial.",
      baseMatrixTitle: "Matriz de Impacto Base (Escala 0-100)",
      baseMatrixContent: "Impacto Base = (Puntuación ROI × 60%) + (Puntuación Horas × 40%). Esta fórmula fija NUNCA cambia, proporcionando comparación consistente de manzanas con manzanas en todas las oportunidades. La Matriz Base se enfoca puramente en la eficiencia del ahorro de tiempo, asegurando que siempre pueda comparar oportunidades en igualdad de condiciones independientemente de si incluyen reducción de errores o aumento de ingresos. Cada oportunidad recibe una puntuación de Impacto Base en esta escala estandarizada de 0-100.",
      enhancedMatrixTitle: "Matriz de Impacto Mejorado (Escala Dinámica 0-150)",
      enhancedMatrixContent: "Impacto Mejorado = Impacto Base + Bonificaciones. La Matriz Mejorada usa un modelo de bonificación aditiva: comienza con la puntuación de Impacto Base, luego agrega bonificaciones por reducción de errores (+25 máx) y aumento de ingresos (+25 máx). Esto significa que el Impacto Mejorado SIEMPRE es ≥ Impacto Base: las bonificaciones solo pueden aumentar las puntuaciones, nunca disminuirlas. La escala se ajusta dinámicamente: Solo Tiempo = 0-100 (sin bonificaciones), Tiempo + Error o Tiempo + Ingresos = 0-125 (una bonificación +25), Las Tres Métricas = 0-150 (ambas bonificaciones).",
      bonusCalculationTitle: "Detalles de Cálculo de Bonificaciones",
      bonusCalculationContent: "Bonificación de Reducción de Errores: (Puntuación Error × 25%) limitado a +25 puntos. Bonificación de Aumento de Ingresos: (Puntuación Ingresos × 25%) limitado a +25 puntos. Estas bonificaciones se agregan además de la puntuación base de ahorro de tiempo 60/40, no se redistribuyen. Ejemplo: Una oportunidad con Puntuación ROI = 60, Puntuación Horas = 40, Puntuación Error = 80 tendría Impacto Base = (60 × 0.60) + (40 × 0.40) = 52, Impacto Mejorado = 52 + (80 × 0.25) = 52 + 20 = 72. La puntuación mejorada siempre es mayor cuando se aplican bonificaciones.",
      matrixGuaranteeTitle: "Garantía Clave: Mejorado ≥ Base Siempre",
      matrixGuaranteeContent: "Debido a que las bonificaciones son aditivas (no redistributivas), la Matriz de Impacto Mejorado SIEMPRE puntúa oportunidades igual o mayor que la Matriz de Impacto Base. Esta garantía matemática significa que nunca pierde la comparación base de ahorro de tiempo mientras gana visibilidad del valor empresarial adicional. Use Matriz Base para comparación de eficiencia pura, Matriz Mejorada para impacto empresarial integral incluyendo calidad y crecimiento.",
      scatterPlotInterpretation: "Interpretación del Gráfico de Dispersión",
      scatterPlotInterpretationContent: "La matriz se divide en cuatro cuadrantes basados en valores medianos: Victorias Rápidas (Alto Impacto, Bajo Esfuerzo): Priorice inmediatamente. Estos entregan resultados sólidos con complejidad de implementación manejable. Apuestas Estratégicas (Alto Impacto, Alto Esfuerzo): Proyectos estratégicos a largo plazo. El valor empresarial significativo justifica mayor inversión de implementación. Agradables de Tener (Bajo Impacto, Bajo Esfuerzo): Considere después de prioridades más altas. Fácil de implementar pero impacto empresarial limitado. Despriorizar (Bajo Impacto, Alto Esfuerzo): Evite a menos que existan razones estratégicas. ROI pobre relativo a la complejidad de implementación.",
      quadrants: "Definiciones de Cuadrantes",
      quadrant1: "Victorias Rápidas: Alto impacto empresarial, bajo esfuerzo de implementación. Estas oportunidades deben priorizarse para acción inmediata.",
      quadrant2: "Apuestas Estratégicas: Alto impacto empresarial, alto esfuerzo de implementación. Inversiones valiosas a largo plazo que requieren recursos y planificación significativos.",
      quadrant3: "Agradables de Tener: Bajo impacto empresarial, bajo esfuerzo de implementación. Victorias fáciles pero valor estratégico limitado. Perseguir después de prioridades más altas.",
      quadrant4: "Despriorizar: Bajo impacto empresarial, alto esfuerzo de implementación. Evite a menos que existan impulsores estratégicos no financieros.",
    },
    
    roiCalculations: {
      title: "Cálculos de ROI",
      intro: "La plataforma calcula el ROI y el impacto empresarial usando fórmulas relativas a la empresa que consideran el tamaño de la organización y el contexto financiero.",
      annualRoiFormula: "Fórmula de ROI Anual",
      annualRoiFormulaContent: "ROI Anual = (Horas Anuales Ahorradas × Costo Laboral por Hora) - Costos de Implementación. Donde: Horas Anuales Ahorradas = Horas por Semana × 52 semanas, Costo Laboral por Hora = (Costos Laborales Totales de la Empresa / Total Empleados) / 2080 horas. Los costos de implementación incluyen capacitación, rampa y gastos de integración capturados en detalles de oportunidad.",
      fteSavingsFormula: "Fórmula de Ahorro FTE",
      fteSavingsFormulaContent: "Ahorro FTE = Horas Anuales Ahorradas / 2080 horas. Esto representa el equivalente de personal de tiempo completo liberado para enfocarse en trabajo de mayor valor. Nota crítica: El ahorro FTE no significa eliminación de empleos. Representa reasignación de capacidad, permitiendo a los empleados aumentar sus capacidades y contribuir a iniciativas más estratégicas.",
      businessImpactScoring: "Puntuación de Impacto Empresarial (Relativa a la Empresa)",
      businessImpactScoringContent: "Puntuación ROI = (ROI Anual / Ingresos Anuales de la Empresa) × 1000, limitado a 100. Ejemplo: $50K ROI para empresa de $5M = (50,000 / 5,000,000) × 1000 = 10. Un ROI del 10% (muy alto) puntúa 100, 5% puntúa 50, 2% puntúa 20, 1% puntúa 10. Puntuación Horas = (Ahorro FTE / Total Empleados) × 1000, limitado a 100. Ejemplo: 2 FTE ahorrados para empresa de 200 empleados = (2 / 200) × 1000 = 10. Un impacto de fuerza laboral del 10% (excepcional) puntúa 100, 1% puntúa 10. Esto asegura que las oportunidades se evalúen en relación con el tamaño de la empresa, no dólares absolutos.",
      implementationEffort: "Cálculo de Esfuerzo de Implementación (eje Y, 0-100)",
      implementationEffortContent: "Esfuerzo de Implementación = (Preparación Invertida × 40%) + (Período de Rampa × 25%) + (Período de Recuperación × 25%) + (Horas de Capacitación × 10%). Preparación Invertida (peso 40%): Mayor preparación = menor esfuerzo. Un flujo de trabajo con preparación de 80 tiene contribución de esfuerzo de (100-80) × 0.40 = 8. Período de Rampa (peso 25%): 3 meses = 0, 18+ meses = 100, escalado lineal entre. Período de Recuperación (peso 25%): 6 meses = 0, 36+ meses = 100, escalado lineal entre. Horas de Capacitación (peso 10%): 2 horas/empleado = 0, 40+ horas = 100, escalado lineal entre. Esta fórmula multifactorial captura la verdadera complejidad de implementación.",
    },
    
    formulasReference: {
      title: "Referencia de Fórmulas",
      intro: "Referencia completa de todas las fórmulas de puntuación y cálculo utilizadas en toda la plataforma.",
      tfaScore: "Puntuación TFA (Evaluación de Viabilidad Técnica)",
      tfaScoreFormula: "Puntuación TFA = [(Σ preguntas Entorno del Sistema / conteo) × 0.25] + [(Σ preguntas Calidad de Datos / conteo) × 0.30] + [(Σ preguntas Viabilidad de Integración / conteo) × 0.30] + [(Σ preguntas Seguridad/Cumplimiento / conteo) × 0.15]. Escala: 0-100. Preguntas puntuadas 1-5, 'No sé' excluido de cálculos.",
      readinessScore: "Puntuación de Preparación (TFA + PIF Combinados)",
      readinessScoreFormula: "Puntuación de Preparación = (Puntuación TFA × 0.60) + (Puntuación PIF × 0.40). Donde Puntuación PIF = (Claridad del Proceso × 0.20) + (Magnitud del Cambio × 0.20) + (Fragilidad del Flujo de Trabajo × 0.08). Nota: Los pesos PIF son relativos a la contribución del 40% PIF. Escala: 0-100.",
      roiScore: "Puntuación ROI (Relativa a la Empresa)",
      roiScoreFormula: "Puntuación ROI = MIN(100, (ROI Anual / Ingresos Anuales de la Empresa) × 1000). Ejemplo: $100K ROI, $10M ingresos = (100,000 / 10,000,000) × 1000 = 10. Guía de puntuación: 10% = 100, 5% = 50, 2% = 20, 1% = 10.",
      hoursScore: "Puntuación de Horas (Relativa a la Empresa)",
      hoursScoreFormula: "Puntuación de Horas = MIN(100, (Ahorro FTE / Total Empleados) × 1000). Donde Ahorro FTE = Horas Anuales Ahorradas / 2080. Ejemplo: 1 FTE ahorrado, 100 empleados = (1 / 100) × 1000 = 10. Guía de puntuación: 10% = 100, 5% = 50, 1% = 10.",
      errorScore: "Puntuación de Reducción de Errores (Relativa a la Empresa)",
      errorScoreFormula: "Puntuación de Error = MIN(100, (Costo Anual de Error Evitado / Ingresos Anuales de la Empresa) × 1000). Donde Costo Anual de Error Evitado = Errores Evitados × Costo por Error. La puntuación sigue el mismo patrón relativo a la empresa que ROI y Horas.",
      revenueScore: "Puntuación de Aumento de Ingresos (Relativa a la Empresa)",
      revenueScoreFormula: "Puntuación de Ingresos = MIN(100, (Aumento de Ingresos Anual / Ingresos Anuales de la Empresa) × 1000). La puntuación sigue el mismo patrón relativo a la empresa que ROI y Horas.",
      baseImpactMatrix: "Matriz de Impacto Base (Escala Fija 0-100)",
      baseImpactMatrixFormula: "Impacto Base = (Puntuación ROI × 0.60) + (Puntuación Horas × 0.40). Esta fórmula es FIJA y nunca cambia, proporcionando comparación consistente de manzanas con manzanas en todas las oportunidades independientemente de las métricas de error/ingresos. Escala: Siempre 0-100.",
      enhancedImpactMatrix: "Matriz de Impacto Mejorado (Escala Dinámica)",
      enhancedImpactMatrixFormula: "Impacto Mejorado = Impacto Base + Bonificación Error + Bonificación Ingresos. Donde: Impacto Base = (Puntuación ROI × 0.60) + (Puntuación Horas × 0.40), Bonificación Error = (Puntuación Error × 0.25) cuando está habilitado (máx +25), Bonificación Ingresos = (Puntuación Ingresos × 0.25) cuando está habilitado (máx +25). Escala: 0-100 (solo tiempo), 0-125 (una bonificación), 0-150 (ambas bonificaciones). Garantía clave: Impacto Mejorado ≥ Impacto Base siempre, ya que las bonificaciones son aditivas.",
      bonusFormulas: "Fórmulas de Bonificación Aditiva",
      bonusFormulasExplanation: "Bonificación de Reducción de Errores = MIN(25, Puntuación Error × 0.25). Bonificación de Aumento de Ingresos = MIN(25, Puntuación Ingresos × 0.25). Estas bonificaciones se agregan además de la puntuación base de ahorro de tiempo 60/40. Ejemplo: Puntuación ROI = 50, Puntuación Horas = 60, Puntuación Error = 80, Puntuación Ingresos = 40 → Impacto Base = (50 × 0.60) + (60 × 0.40) = 54, Impacto Mejorado = 54 + (80 × 0.25) + (40 × 0.25) = 54 + 20 + 10 = 84.",
      implementationEffort: "Esfuerzo de Implementación",
      implementationEffortFormula: "Esfuerzo de Implementación = (Preparación Invertida × 0.40) + (Rampa Normalizada × 0.25) + (Recuperación Normalizada × 0.25) + (Capacitación Normalizada × 0.10). Donde: Preparación Invertida = 100 - Puntuación de Preparación. Rampa Normalizada: 0 en ≤3 meses, 100 en ≥18 meses, lineal entre. Recuperación Normalizada: 0 en ≤6 meses, 100 en ≥36 meses, lineal entre. Capacitación Normalizada: 0 en ≤2 horas, 100 en ≥40 horas, lineal entre. Escala: 0-100 (menor = más fácil).",
    },
  },

  companySnapshot: {
    title: "Instantánea Diagnóstica de la Empresa",
    generatedOn: "Generado el",
    notAvailable: "N/D",
    notCompleted: "Aún no completado",
    workflowSection: "Flujo de Trabajo",
    
    header: {
      companySnapshot: "Instantánea Diagnóstica de la Empresa",
      financialContext: "Contexto Financiero",
      generationDate: "Fecha de Generación",
    },
    
    tfaSection: {
      title: "Evaluación de Viabilidad Técnica (TFA)",
      overallScore: "Puntuación General TFA",
      feasibilityBand: "Banda de Viabilidad",
      criticalGaps: "Brechas Técnicas Críticas",
      keyStrengths: "Fortalezas Técnicas Clave",
      roadmapRecommendations: "Recomendaciones de Hoja de Ruta de Implementación",
      noGapsIdentified: "No se identificaron brechas críticas",
      noStrengthsIdentified: "No se identificaron fortalezas clave",
    },
    
    pifSection: {
      title: "Formulario de Perspectiva del Proceso (PIF)",
      respondents: "Encuestados",
      operationalScores: "Puntuaciones de Preparación Operacional",
      average: "Promedio",
      range: "Rango",
      qualitativeInsights: "Perspectivas Cualitativas Representativas",
      roiInputsSummary: "Resumen de Entradas de ROI",
      noQualitativeData: "No hay perspectivas cualitativas disponibles",
    },
    
    readinessSection: {
      title: "Rúbrica de Preparación",
      combinedScore: "Puntuación Combinada de Preparación",
      componentBreakdown: "Desglose de Componentes",
      feasibilityAssessment: "Evaluación de Viabilidad",
      swotAnalysis: "Análisis FODA",
      strengths: "Fortalezas",
      weaknesses: "Debilidades",
      opportunities: "Oportunidades",
      threats: "Amenazas",
      requiresData: "Requiere datos de TFA y PIF para el cálculo",
    },
    
    opportunitiesSection: {
      title: "Oportunidades de Implementación",
      annualRoi: "ROI Anual",
      fteSavings: "Ahorro FTE",
      businessImpactScore: "Puntuación de Impacto Empresarial",
      implementationEffortScore: "Puntuación de Esfuerzo de Implementación",
      errorReduction: "Reducción de Errores",
      revenueUplift: "Aumento de Ingresos",
      noOpportunities: "No hay oportunidades de implementación definidas para este flujo de trabajo",
    },
    
    matrixSection: {
      title: "Matriz de Oportunidades",
      filterView: "Vista de Filtro",
      quadrantInterpretation: "Interpretación de Cuadrante",
      noMatrixData: "Matriz de oportunidades no disponible - requiere datos de TFA y PIF",
    },
    
    transparency: {
      title: "Transparencia de Cálculos",
      tfaScoring: "Metodología de Puntuación TFA",
      tfaScoringExplanation: "La Evaluación de Viabilidad Técnica utiliza un sistema de puntuación ponderada a través de cuatro dimensiones críticas. Cada sección contribuye a la puntuación general TFA basándose en su importancia relativa para la implementación exitosa de IA.",
      sectionWeights: "Pesos de Sección: Entorno del Sistema (25%), Calidad de Datos (30%), Viabilidad de Integración (30%), Seguridad y Cumplimiento (15%)",
      pifScoring: "Metodología de Puntuación PIF",
      pifScoringExplanation: "El Formulario de Perspectiva del Proceso calcula la preparación operacional agregando puntuaciones a través de tres dimensiones: Claridad del Proceso, Magnitud del Cambio y Fragilidad del Flujo de Trabajo. Las puntuaciones se normalizan a una escala de 0-100 y se promedian entre todos los encuestados.",
      readinessFormula: "Fórmula de Rúbrica de Preparación",
      readinessFormulaExplanation: "Puntuación Combinada de Preparación = (Puntuación TFA × 60%) + (Puntuación PIF × 40%). Esta fórmula pondera la viabilidad técnica más alta porque una base técnica sólida es esencial para la implementación exitosa de IA, mientras asegura que la preparación operacional influya significativamente en la evaluación.",
      businessImpactScoring: "Puntuación de Impacto Empresarial",
      businessImpactExplanation: "Las puntuaciones de Impacto Empresarial se calculan en relación con el tamaño de la empresa, asegurando que las oportunidades se evalúen en el contexto empresarial adecuado. La puntuación utiliza una fórmula relativa a la empresa para normalizar las puntuaciones de impacto.",
      multiplierExplanation: "Multiplicador 10×: Usamos un multiplicador de 1000× para convertir pequeños porcentajes en puntuaciones significativas de 0-100. Por ejemplo, una oportunidad que ahorra 1% de la fuerza laboral de la empresa puntúa 10, mientras que 10% puntúa 100 (el máximo).",
      implementationEffort: "Puntuación de Esfuerzo de Implementación",
      implementationEffortExplanation: "El Esfuerzo de Implementación combina puntuaciones de preparación (40%), período de rampa (25%), período de recuperación (25%) y requisitos de capacitación (10%) para estimar la complejidad de implementación en una escala de 0-100 donde puntuaciones más bajas indican implementación más fácil.",
      scoringGuideTables: "Tablas de Guía de Puntuación",
      scoreInterpretation: "Interpretación de Puntuación",
      roiScoreGuide: "Guía de Puntuación ROI (Relativa a la Empresa)",
      hoursScoreGuide: "Guía de Puntuación de Horas Ahorradas (Relativa a la Empresa)",
      errorScoreGuide: "Guía de Puntuación de Reducción de Errores (Relativa a la Empresa)",
      revenueScoreGuide: "Guía de Puntuación de Aumento de Ingresos (Relativa a la Empresa)",
      score100Meaning: "Puntuación 100 = 10% de impacto en la empresa (excepcional)",
      score50Meaning: "Puntuación 50 = 5% de impacto en la empresa (significativo)",
      score20Meaning: "Puntuación 20 = 2% de impacto en la empresa (notable)",
      score10Meaning: "Puntuación 10 = 1% de impacto en la empresa (significativo)",
    },
  },
};

export const translations = { en, es };
