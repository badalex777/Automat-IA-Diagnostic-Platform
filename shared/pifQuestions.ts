// Process Insight Form (PIF) Questions
// Streamlined quantitative survey (29 questions max, multiple choice with 3 numeric inputs)
// Collects operational readiness scores and ROI modeling data
// Qualitative insights gathered separately through end-user interviews

export interface PIFOption {
  value: string;
  label: string;
  description?: string;
}

export interface PIFQuestion {
  id: number;
  question: string;
  section: string;
  type: 'radio' | 'number' | 'text' | 'textarea';
  options?: PIFOption[];
  weight?: number;
  inverseScoring?: boolean;
  placeholder?: string;
  conditional?: {
    dependsOn: number;
    showWhen: string;
  };
}

export interface PIFSection {
  section: string;
  weight: number;
  questions: PIFQuestion[];
  description: string;
}

// Operational Readiness Sections (for Readiness Rubric - 40% of total)
export const PIF_SECTIONS: PIFSection[] = [
  {
    section: "Process Clarity",
    weight: 20, // 20% of PIF contribution to Readiness Rubric
    description: "Help us understand how structured and consistent your work process is so we can identify where AI could provide the most reliable support",
    questions: [
      {
        id: 1,
        question: "How clearly defined are the steps in this workflow?",
        section: "Process Clarity",
        type: "radio",
        weight: 1,
        options: [
          { value: "1", label: "Not defined at all", description: "Steps vary each time" },
          { value: "2", label: "Loosely defined", description: "General approach exists" },
          { value: "3", label: "Moderately defined", description: "Some documentation available" },
          { value: "4", label: "Well defined", description: "Clear procedures to follow" },
          { value: "5", label: "Fully standardized and documented", description: "Comprehensive documentation" }
        ]
      },
      {
        id: 2,
        question: "When you perform this process, do you always follow the same sequence of steps?",
        section: "Process Clarity",
        type: "radio",
        weight: 1,
        options: [
          { value: "1", label: "Steps vary each time" },
          { value: "2", label: "Mostly different, some consistency" },
          { value: "3", label: "Generally consistent" },
          { value: "4", label: "Usually the same steps" },
          { value: "5", label: "Always the same steps" }
        ]
      },
      {
        id: 3,
        question: "Are instructions, templates, or reference materials easily available when you need to perform this task?",
        section: "Process Clarity",
        type: "radio",
        weight: 1,
        options: [
          { value: "1", label: "None available" },
          { value: "2", label: "Rarely available or outdated" },
          { value: "3", label: "Sometimes available" },
          { value: "4", label: "Usually available" },
          { value: "5", label: "Always accessible and up to date" }
        ]
      }
    ]
  },
  {
    section: "Change Magnitude",
    weight: 20, // 20% of PIF contribution to Readiness Rubric
    description: "Share your comfort level with new tools so we can plan the right training and transition approach for you",
    questions: [
      {
        id: 4,
        question: "How often do the rules or requirements for this workflow change?",
        section: "Change Magnitude",
        type: "radio",
        weight: 1,
        inverseScoring: true,
        options: [
          { value: "1", label: "Weekly or more often" },
          { value: "2", label: "Monthly" },
          { value: "3", label: "Quarterly" },
          { value: "4", label: "Annually" },
          { value: "5", label: "Rarely or never" }
        ]
      },
      {
        id: 5,
        question: "How much do you think your daily work would change if parts of this process were automated?",
        section: "Change Magnitude",
        type: "radio",
        weight: 1,
        options: [
          { value: "1", label: "Completely different", description: "Significantly evolve my role" },
          { value: "2", label: "Meaningful change", description: "Develop new capabilities" },
          { value: "3", label: "Moderate change", description: "Some adaptation required" },
          { value: "4", label: "Minor change", description: "Slight adjustment" },
          { value: "5", label: "Almost no change", description: "Business as usual" }
        ]
      },
      {
        id: 6,
        question: "How comfortable do you feel adopting new tools or digital solutions at work?",
        section: "Change Magnitude",
        type: "radio",
        weight: 1,
        options: [
          { value: "1", label: "Very uncomfortable", description: "Prefer traditional methods" },
          { value: "2", label: "Somewhat uncomfortable", description: "Need significant support" },
          { value: "3", label: "Neutral", description: "Can adapt with guidance" },
          { value: "4", label: "Comfortable", description: "Quick to learn" },
          { value: "5", label: "Very comfortable", description: "Early adopter" }
        ]
      }
    ]
  },
  {
    section: "Workflow Brittleness",
    weight: 15, // 15% of PIF contribution to Readiness Rubric
    description: "Tell us about challenges you face so we can identify where AI could reduce errors and manual workarounds in your daily work",
    questions: [
      {
        id: 7,
        question: "How often do errors, missing data, or inconsistencies occur during this process?",
        section: "Workflow Brittleness",
        type: "radio",
        weight: 1,
        inverseScoring: true,
        options: [
          { value: "1", label: "Very often", description: "More than 30% of the time" },
          { value: "2", label: "Often", description: "15-30% of the time" },
          { value: "3", label: "Sometimes", description: "5-15% of the time" },
          { value: "4", label: "Rarely", description: "Less than 5%" },
          { value: "5", label: "Almost never", description: "Exceptional cases only" }
        ]
      },
      {
        id: 8,
        question: "How dependent is this workflow on manual workarounds (e.g., Excel files, copy-paste, manual rework)?",
        section: "Workflow Brittleness",
        type: "radio",
        weight: 1,
        inverseScoring: true,
        options: [
          { value: "1", label: "Extremely dependent", description: "Cannot function without them" },
          { value: "2", label: "Very dependent", description: "Frequent workarounds needed" },
          { value: "3", label: "Moderately dependent", description: "Occasional workarounds" },
          { value: "4", label: "Slightly dependent", description: "Rare workarounds" },
          { value: "5", label: "Fully automated or structured", description: "No workarounds needed" }
        ]
      },
      {
        id: 9,
        question: "If something goes wrong, is there a clear way to detect and fix the issue quickly?",
        section: "Workflow Brittleness",
        type: "radio",
        weight: 1,
        options: [
          { value: "1", label: "No process / takes long", description: "Hard to troubleshoot" },
          { value: "2", label: "Unclear process", description: "Takes significant time" },
          { value: "3", label: "Some process exists", description: "Moderate effort to fix" },
          { value: "4", label: "Clear process", description: "Can fix relatively quickly" },
          { value: "5", label: "Clear and efficient correction process", description: "Fast resolution" }
        ]
      },
      {
        id: 10,
        question: "How consistent are the inputs or requests you receive for this process?",
        section: "Workflow Brittleness",
        type: "radio",
        weight: 1,
        options: [
          { value: "1", label: "Always different", description: "Highly variable" },
          { value: "2", label: "Mostly different", description: "Significant variation" },
          { value: "3", label: "Somewhat consistent", description: "Some patterns" },
          { value: "4", label: "Mostly consistent", description: "Predictable inputs" },
          { value: "5", label: "Very consistent and predictable", description: "Standardized inputs" }
        ]
      }
    ]
  },
  {
    section: "Time Savings",
    weight: 0, // Used for ROI estimation, not Readiness Rubric
    description: "Describe the type of work you do so we can accurately estimate how much time AI could save you each week",
    questions: [
      {
        id: 11,
        question: "Which of these best describes the primary work you perform in this step?",
        section: "Time Savings",
        type: "radio",
        options: [
          // Finance & Accounting
          { value: "financial", label: "Financial Analyst / Strategic Accountant", description: "Finance & Accounting: FP&A Analyst, Financial Controller" },
          { value: "finance_ops", label: "Accounts Payable / Receivable", description: "Finance & Accounting: AP/AR Clerk, Invoice Processor, Collections Specialist" },
          
          // Sales & Customer Operations
          { value: "sales_ops", label: "Sales Operations / CRM Administrator", description: "Sales & Customer Operations: Sales Ops Analyst, CRM Specialist, Deal Desk Coordinator" },
          { value: "customer_success", label: "Customer Success Manager / Analyst", description: "Sales & Customer Operations: Retention Analyst, Account Manager Post-Sale" },
          { value: "support", label: "Customer Support / Help Desk", description: "Sales & Customer Operations: Tier 1 Support, IT Help Desk, CSR" },
          
          // Operations & Logistics
          { value: "procurement", label: "Procurement / Sourcing Specialist", description: "Operations & Logistics: Purchasing Agent, Vendor Manager, Supply Chain Coordinator" },
          { value: "inventory", label: "Inventory / Warehouse Coordinator", description: "Operations & Logistics: Inventory Analyst, Stock Controller, Warehouse Admin" },
          { value: "facilities", label: "Facilities / Operations Coordinator", description: "Operations & Logistics: Facilities Manager, Office Coordinator, Logistics Admin" },
          
          // HR & Administration
          { value: "hr", label: "HR Generalist / People Operations", description: "HR & Administration: HR Admin, Payroll Specialist, Benefits Coordinator" },
          { value: "admin", label: "General Admin / Office Manager", description: "HR & Administration: Office Administrator, Executive Assistant, General Clerk" },
          
          // IT & Data
          { value: "it_ops", label: "IT Operations / Systems Administrator", description: "IT & Data: System Admin, IT Support, Infrastructure Manager" },
          { value: "data_analyst", label: "Data Analyst / Business Intelligence", description: "IT & Data: BI Analyst, Data Ops, Reporting Specialist" },
          
          // Marketing & Growth
          { value: "marketing_ops", label: "Marketing Operations / Campaign Coordinator", description: "Marketing & Growth: Marketing Ops, Email Campaign Manager, Content Coordinator" },
          
          // Compliance & Quality
          { value: "quality_assurance", label: "Quality Assurance / Process Auditor", description: "Compliance & Quality: QA Specialist, Compliance Auditor, Process Analyst" },
          { value: "legal", label: "Legal / Compliance / Internal Audit", description: "Compliance & Quality: Compliance Officer, Internal Auditor, Risk Manager" },
          
          // Other
          { value: "other", label: "Other / Unspecified Back-Office Role", description: "Other: Not listed above" }
        ]
      },
      {
        id: 12,
        question: "How complex is the task?",
        section: "Time Savings",
        type: "radio",
        options: [
          { value: "simple", label: "Simple", description: "Examples: Data entry from forms, copy-paste, checklists" },
          { value: "moderate", label: "Moderate", description: "Examples: Reviewing for completeness, categorizing, troubleshooting" },
          { value: "complex", label: "Complex", description: "Examples: Financial modeling, technical diagnostics, strategic recommendations" }
        ]
      },
      {
        id: 13,
        question: "How structured is the data you work with?",
        section: "Time Savings",
        type: "radio",
        options: [
          { value: "structured", label: "Highly structured", description: "Examples: CRM entries, Excel spreadsheets, database forms" },
          { value: "semi_structured", label: "Semi-structured", description: "Examples: Email threads, PDF documents, templated reports" },
          { value: "unstructured", label: "Unstructured", description: "Examples: Handwritten notes, transcripts, customer feedback, photos" }
        ]
      }
    ]
  },
  {
    section: "Revenue Uplift",
    weight: 0, // Used for ROI estimation, not Readiness Rubric
    description: "Help us understand if the time you save could create opportunities to generate additional revenue for the business",
    questions: [
      {
        id: 14,
        question: "What is the relationship between current capacity and available opportunities?",
        section: "Revenue Uplift",
        type: "radio",
        options: [
          { value: "high_demand", label: "High demand with team at/above capacity", description: "Turning away opportunities, clear revenue potential" },
          { value: "strong_pipeline", label: "Strong pipeline with team near capacity", description: "Could pursue more with freed time" },
          { value: "moderate", label: "Moderate opportunities with balanced capacity", description: "Some room to grow" },
          { value: "limited", label: "Limited opportunities or low utilization", description: "Team has spare capacity or demand is constrained" }
        ]
      },
      {
        id: 15,
        question: "How does more time translate to more revenue?",
        section: "Revenue Uplift",
        type: "radio",
        options: [
          { value: "direct", label: "Direct & predictable", description: "Example: More hours = more billable consulting, more service appointments, more deals closed" },
          { value: "somewhat", label: "Somewhat predictable", description: "Example: More time helps close deals faster or handle more accounts, but other factors also matter" },
          { value: "indirect", label: "Indirect or complex", description: "Example: Long sales cycles with many stakeholders, revenue depends on market timing, not just time invested" },
          { value: "limited", label: "Limited by other factors", description: "Example: Can't sell more due to limited inventory, small market, regulatory constraints, or lead availability" }
        ]
      }
    ]
  },
  {
    section: "Time & Volume Data",
    weight: 0, // Used for ROI calculations, not Readiness Rubric
    description: "Provide details about how often you perform this work so we can calculate the total time savings and ROI potential",
    questions: [
      {
        id: 17,
        question: "How many employees perform this task?",
        section: "Time & Volume Data",
        type: "number",
        placeholder: "Enter number of employees"
      },
      {
        id: 18,
        question: "How often is this task performed?",
        section: "Time & Volume Data",
        type: "radio",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" }
        ]
      },
      {
        id: 19,
        question: "How many times is this process completed in the selected period?",
        section: "Time & Volume Data",
        type: "number",
        placeholder: "e.g., 5 times per day"
      },
      {
        id: 20,
        question: "How many minutes does each process take?",
        section: "Time & Volume Data",
        type: "number",
        placeholder: "Enter minutes per process"
      }
    ]
  },
  {
    section: "Quality Impact Module",
    weight: 0, // Used for ROI estimation, not Readiness Rubric (conditional section)
    description: "Tell us about errors or quality issues so we can show how AI could help you produce more accurate, consistent work",
    questions: [
      {
        id: 21,
        question: "Does this workflow have measurable quality impact (errors that cost time or money)?",
        section: "Quality Impact Module",
        type: "radio",
        options: [
          { value: "no", label: "No", description: "Quality impact is not a significant factor" },
          { value: "yes", label: "Yes", description: "We have measurable quality issues (errors, rework, defects)" }
        ]
      },
      {
        id: 22,
        question: "How often do errors or quality issues currently occur in this process?",
        section: "Quality Impact Module",
        type: "radio",
        conditional: {
          dependsOn: 21,
          showWhen: "yes"
        },
        options: [
          { value: "very_frequent", label: "Very frequent", description: "Errors occur in more than 30% of cases" },
          { value: "frequent", label: "Frequent", description: "Errors occur in 15-30% of cases" },
          { value: "occasional", label: "Occasional", description: "Errors occur in 5-15% of cases" },
          { value: "rare", label: "Rare", description: "Errors occur in less than 5% of cases" }
        ]
      },
      {
        id: 23,
        question: "What is the primary cause of errors or quality issues?",
        section: "Quality Impact Module",
        type: "radio",
        conditional: {
          dependsOn: 21,
          showWhen: "yes"
        },
        options: [
          { value: "fatigue", label: "Manual, repetitive work leading to human fatigue or oversight" },
          { value: "missing_info", label: "Missing or incomplete information when making decisions" },
          { value: "interpretation", label: "Inconsistent interpretation of rules or standards" },
          { value: "complexity", label: "High complexity requiring significant expertise or judgment" },
          { value: "communication", label: "Communication gaps or misunderstandings between people" }
        ]
      },
      {
        id: 24,
        question: "When are errors or quality issues typically discovered?",
        section: "Quality Impact Module",
        type: "radio",
        conditional: {
          dependsOn: 21,
          showWhen: "yes"
        },
        options: [
          { value: "after_delivery", label: "After delivery to customer", description: "Customer complaints, returns, escalations" },
          { value: "end_process", label: "At the end of the process", description: "Final review or quality check" },
          { value: "during_process", label: "During the process", description: "Spotted before completion" },
          { value: "early", label: "Early in the process", description: "Caught quickly with minimal rework" }
        ]
      },
      {
        id: 25,
        question: "How standardized is the current process?",
        section: "Quality Impact Module",
        type: "radio",
        conditional: {
          dependsOn: 21,
          showWhen: "yes"
        },
        options: [
          { value: "variable", label: "Highly variable", description: "Each case is handled differently" },
          { value: "guidelines", label: "Some guidelines", description: "General approach but flexibility in execution" },
          { value: "documented", label: "Documented process", description: "Clear steps and procedures to follow" },
          { value: "strict", label: "Strict standards", description: "Detailed rules and quality requirements" }
        ]
      },
      {
        id: 26,
        question: "What type of work best describes this process?",
        section: "Quality Impact Module",
        type: "radio",
        conditional: {
          dependsOn: 21,
          showWhen: "yes"
        },
        options: [
          { value: "rule_based", label: "Rule-based decisions", description: "Clear if/then rules" },
          { value: "pattern", label: "Pattern recognition", description: "Identifying similarities or trends" },
          { value: "contextual", label: "Contextual judgment", description: "Requires understanding unique situations" },
          { value: "subjective", label: "Highly subjective", description: "Based on personal opinion or preferences" }
        ]
      },
      {
        id: 27,
        question: "What is the current error rate?",
        section: "Quality Impact Module",
        type: "number",
        placeholder: "Enter percentage (e.g., 15 for 15%)",
        conditional: {
          dependsOn: 21,
          showWhen: "yes"
        }
      },
      {
        id: 28,
        question: "How many minutes of rework does each error require?",
        section: "Quality Impact Module",
        type: "number",
        placeholder: "Enter minutes per error",
        conditional: {
          dependsOn: 21,
          showWhen: "yes"
        }
      },
      {
        id: 29,
        question: "What is the estimated cost per error (in USD)?",
        section: "Quality Impact Module",
        type: "number",
        placeholder: "Enter cost in USD (e.g., 50)",
        conditional: {
          dependsOn: 21,
          showWhen: "yes"
        }
      }
    ]
  }
];

// Helper function to get all questions flattened
export function getAllPIFQuestions(): PIFQuestion[] {
  return PIF_SECTIONS.flatMap(section => section.questions);
}

// Helper function to get question by ID
export function getPIFQuestionById(id: number): PIFQuestion | undefined {
  return getAllPIFQuestions().find(q => q.id === id);
}

// Export flattened questions array for backwards compatibility
export const ALL_PIF_QUESTIONS = getAllPIFQuestions();

// Calculate PIF operational scores from responses
export function calculatePIFScores(responses: Record<string, string>): {
  processClarity: number;
  changeMagnitude: number;
  workflowBrittleness: number;
} {
  const calculateSectionScore = (sectionName: string): number => {
    const section = PIF_SECTIONS.find(s => s.section === sectionName);
    if (!section) return 0;

    const questions = section.questions.filter(q => q.weight && q.weight > 0);
    if (questions.length === 0) return 0;

    let totalScore = 0;
    let totalWeight = 0;

    questions.forEach(q => {
      const answer = responses[q.id.toString()];
      if (!answer) return;

      const numericValue = parseInt(answer);
      if (isNaN(numericValue)) return;

      const score = q.inverseScoring ? numericValue : numericValue;
      totalScore += score * (q.weight || 1);
      totalWeight += q.weight || 1;
    });

    if (totalWeight === 0) return 0;
    // Normalize to 0-100 scale (questions are 1-5, so (avg/5)*100)
    return Math.round((totalScore / totalWeight / 5) * 100);
  };

  return {
    processClarity: calculateSectionScore("Process Clarity"),
    changeMagnitude: calculateSectionScore("Change Magnitude"),
    workflowBrittleness: calculateSectionScore("Workflow Brittleness"),
  };
}

// Extract ROI inputs from responses
export function extractROIInputs(responses: Record<string, string>): {
  employeeCount: number | null;
  frequency: 'daily' | 'weekly' | 'monthly' | null;
  processesPerPeriod: number | null;
  minutesPerProcess: number | null;
  hasQualityImpact: boolean;
  errorRate: number | null;
  reworkMinutesPerError: number | null;
  costPerError: number | null;
} {
  // Q17-Q20: Time & Volume Data - Always captured
  const employeeCount = responses['17'] ? parseInt(responses['17']) : null;
  const frequency = responses['18'] as 'daily' | 'weekly' | 'monthly' | null || null;
  const processesPerPeriod = responses['19'] ? parseInt(responses['19']) : null;
  const minutesPerProcess = responses['20'] ? parseInt(responses['20']) : null;

  // Q21: Quality Impact yes/no
  const hasQualityImpact = responses['21'] === 'yes';

  // Q27-Q29: Only captured when Q21 is 'yes'
  const errorRate = hasQualityImpact && responses['27'] ? parseFloat(responses['27']) : null;
  const reworkMinutesPerError = hasQualityImpact && responses['28'] ? parseInt(responses['28']) : null;
  const costPerError = hasQualityImpact && responses['29'] ? parseFloat(responses['29']) : null;

  return {
    employeeCount,
    frequency,
    processesPerPeriod,
    minutesPerProcess,
    hasQualityImpact,
    errorRate,
    reworkMinutesPerError,
    costPerError,
  };
}

// Extract qualitative responses (REMOVED - qualitative questions 17-27 have been deleted)
// Qualitative insights are now gathered through End-User interviews
export function extractQualitativeResponses(responses: Record<string, string>): {
  role?: string; // Q11: Role selection for revenue uplift calculations
} {
  return {
    role: responses['11'] || undefined, // Q11: Role selection (for revenue uplift modeling)
  };
}
