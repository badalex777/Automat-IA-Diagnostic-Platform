export interface TFAQuestion {
  id: number;
  question: string;
  section: string;
  weight: number;
  options: {
    value: string;
    label: string;
    description: string;
    score: number;
  }[];
}

export const TFA_SECTIONS = [
  { name: "System Environment", weight: 20 },
  { name: "Data Quality", weight: 25 },
  { name: "Integration Feasibility", weight: 25 },
  { name: "Security/Compliance", weight: 15 },
  { name: "Process Stability", weight: 10 },
  { name: "Ownership", weight: 5 },
];

export const TFA_QUESTIONS: TFAQuestion[] = [
  // System Environment (20%)
  {
    id: 1,
    section: "System Environment",
    question: "Deployment model: How are the main systems for this workflow deployed?",
    weight: 5,
    options: [
      { value: "1", label: "Legacy on-prem only", description: "Very Low Feasibility / Major Limitation", score: 1 },
      { value: "2", label: "Mostly on-prem, some cloud", description: "Low Feasibility / Several Limitations", score: 2 },
      { value: "3", label: "Mixed/hybrid", description: "Moderate Feasibility / Some Workarounds Possible", score: 3 },
      { value: "4", label: "Mostly cloud SaaS", description: "Good Feasibility / Minor Constraints", score: 4 },
      { value: "5", label: "Modern cloud SaaS only", description: "Excellent Feasibility / Fully Ready", score: 5 },
    ],
  },
  {
    id: 2,
    section: "System Environment",
    question: "API availability: Do the systems expose REST/SOAP APIs or webhooks?",
    weight: 8,
    options: [
      { value: "1", label: "No APIs available", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Limited/legacy APIs", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Some modern APIs", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Good API coverage", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Comprehensive modern APIs", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 3,
    section: "System Environment",
    question: "System access: Can automation tools access these systems programmatically?",
    weight: 7,
    options: [
      { value: "1", label: "No programmatic access", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Very limited access", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Moderate access with workarounds", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Good programmatic access", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Full programmatic access", description: "Excellent Feasibility", score: 5 },
    ],
  },
  
  // Data Quality (25%)
  {
    id: 4,
    section: "Data Quality",
    question: "Data structure: How structured and consistent is the input data?",
    weight: 10,
    options: [
      { value: "1", label: "Highly unstructured", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Mostly unstructured", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Semi-structured", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Mostly structured", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Fully structured", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 5,
    section: "Data Quality",
    question: "Data quality: How accurate and complete is the data?",
    weight: 8,
    options: [
      { value: "1", label: "Poor quality, many errors", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Below average quality", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Acceptable quality", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Good quality", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Excellent quality", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 6,
    section: "Data Quality",
    question: "Data availability: Is training/historical data available?",
    weight: 7,
    options: [
      { value: "1", label: "No historical data", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Very limited data", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Some historical data", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Good historical data", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Extensive historical data", description: "Excellent Feasibility", score: 5 },
    ],
  },

  // Integration Feasibility (25%)
  {
    id: 7,
    section: "Integration Feasibility",
    question: "Integration complexity: How many systems need to be integrated?",
    weight: 8,
    options: [
      { value: "1", label: "10+ systems", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "6-9 systems", description: "Low Feasibility", score: 2 },
      { value: "3", label: "3-5 systems", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "2 systems", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Single system", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 8,
    section: "Integration Feasibility",
    question: "System compatibility: Are the systems compatible with modern integration tools?",
    weight: 9,
    options: [
      { value: "1", label: "No compatibility", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Poor compatibility", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Moderate compatibility", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Good compatibility", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Excellent compatibility", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 9,
    section: "Integration Feasibility",
    question: "Authentication: How complex is the authentication/authorization?",
    weight: 8,
    options: [
      { value: "1", label: "Very complex/custom", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Complex", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Moderate complexity", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Standard OAuth/SSO", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Simple API keys", description: "Excellent Feasibility", score: 5 },
    ],
  },

  // Security/Compliance (15%)
  {
    id: 10,
    section: "Security/Compliance",
    question: "Data sensitivity: How sensitive is the data being processed?",
    weight: 6,
    options: [
      { value: "1", label: "Highly sensitive (PII/PHI)", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Sensitive", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Moderately sensitive", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Low sensitivity", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Non-sensitive", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 11,
    section: "Security/Compliance",
    question: "Compliance requirements: What compliance standards apply?",
    weight: 5,
    options: [
      { value: "1", label: "Strict (HIPAA/SOC2/PCI)", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "High compliance needs", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Moderate compliance", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Basic compliance", description: "Good Feasibility", score: 4 },
      { value: "5", label: "No specific compliance", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 12,
    section: "Security/Compliance",
    question: "Security approval: How long does security approval typically take?",
    weight: 4,
    options: [
      { value: "1", label: "6+ months", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "3-6 months", description: "Low Feasibility", score: 2 },
      { value: "3", label: "1-3 months", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "2-4 weeks", description: "Good Feasibility", score: 4 },
      { value: "5", label: "< 2 weeks", description: "Excellent Feasibility", score: 5 },
    ],
  },

  // Process Stability (10%)
  {
    id: 13,
    section: "Process Stability",
    question: "Process definition: How well-defined and documented is the process?",
    weight: 5,
    options: [
      { value: "1", label: "Undefined/ad-hoc", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Poorly defined", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Moderately defined", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Well defined", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Fully documented", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 14,
    section: "Process Stability",
    question: "Process changes: How frequently does the process change?",
    weight: 5,
    options: [
      { value: "1", label: "Weekly changes", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Monthly changes", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Quarterly changes", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Annual changes", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Rarely changes", description: "Excellent Feasibility", score: 5 },
    ],
  },

  // Ownership (5%)
  {
    id: 15,
    section: "Ownership",
    question: "Business sponsorship: Is there executive/business sponsorship?",
    weight: 3,
    options: [
      { value: "1", label: "No sponsorship", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Weak sponsorship", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Moderate sponsorship", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Strong sponsorship", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Executive champion", description: "Excellent Feasibility", score: 5 },
    ],
  },
  {
    id: 16,
    section: "Ownership",
    question: "Technical ownership: Is there clear technical ownership and support?",
    weight: 2,
    options: [
      { value: "1", label: "No technical owner", description: "Very Low Feasibility", score: 1 },
      { value: "2", label: "Unclear ownership", description: "Low Feasibility", score: 2 },
      { value: "3", label: "Moderate ownership", description: "Moderate Feasibility", score: 3 },
      { value: "4", label: "Clear ownership", description: "Good Feasibility", score: 4 },
      { value: "5", label: "Dedicated owner", description: "Excellent Feasibility", score: 5 },
    ],
  },
];

// Calculate weighted score
export function calculateTFAScore(responses: Record<string, string>): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  TFA_QUESTIONS.forEach((question) => {
    const response = responses[question.id.toString()];
    if (response) {
      const option = question.options.find((opt) => opt.value === response);
      if (option) {
        totalWeightedScore += (option.score / 5) * question.weight;
        totalWeight += question.weight;
      }
    }
  });

  return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
}

// Calculate section scores
export function calculateSectionScores(responses: Record<string, string>) {
  const sectionScores: Record<string, { score: number; weight: number }> = {};

  TFA_SECTIONS.forEach((section) => {
    const sectionQuestions = TFA_QUESTIONS.filter((q) => q.section === section.name);
    let sectionWeightedScore = 0;
    let sectionTotalWeight = 0;

    sectionQuestions.forEach((question) => {
      const response = responses[question.id.toString()];
      if (response) {
        const option = question.options.find((opt) => opt.value === response);
        if (option) {
          sectionWeightedScore += (option.score / 5) * question.weight;
          sectionTotalWeight += question.weight;
        }
      }
    });

    const sectionScore = sectionTotalWeight > 0 ? (sectionWeightedScore / sectionTotalWeight) * 5 : 0;
    sectionScores[section.name] = {
      score: sectionScore,
      weight: section.weight,
    };
  });

  return sectionScores;
}

// Group questions by section for frontend use
export const tfaSections = TFA_SECTIONS.map(section => ({
  section: section.name,
  weight: section.weight,
  questions: TFA_QUESTIONS.filter(q => q.section === section.name)
}));
