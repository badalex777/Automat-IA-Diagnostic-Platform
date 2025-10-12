// Process Insight Survey (PIS) Questions
// Collects operational readiness data and ROI inputs from end users

export interface PISOption {
  value: string;
  label: string;
  description?: string;
}

export interface PISQuestion {
  id: number;
  question: string;
  section: string;
  type: 'radio' | 'number' | 'text' | 'textarea';
  options?: PISOption[];
  weight?: number;
  inverseScoring?: boolean;
  placeholder?: string;
  conditional?: {
    dependsOn: number;
    showWhen: string;
  };
}

export interface PISSection {
  section: string;
  weight: number;
  questions: PISQuestion[];
  description: string;
}

// Operational Readiness Sections (for Readiness Rubric - 40% of total)
export const PIS_SECTIONS: PISSection[] = [
  {
    section: "Process Clarity",
    weight: 20, // 20% of Readiness Rubric
    description: "Assess whether the workflow is clearly defined, consistent, and repeatable",
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
    weight: 20, // 20% of Readiness Rubric
    description: "Understand how much employee behavior, retraining, or adaptation will be needed when introducing automation/AI",
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
          { value: "1", label: "Completely different", description: "Major shift in responsibilities" },
          { value: "2", label: "Significant change", description: "New skills needed" },
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
    weight: 15, // 15% of Readiness Rubric (Total operational = 55%, but we use 40% for PIS in final calc)
    description: "Identify hidden fragility — processes that break easily, depend on manual steps, or lack error handling",
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
        question: "How dependent is this workflow on manual workarounds (Excel files, copy-paste, rework)?",
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
    section: "Quality Impact Rubric",
    weight: 0, // Used for ROI, not Readiness Rubric
    description: "Answer questions about your process to estimate how much AI can improve quality and reduce errors",
    questions: [
      {
        id: 11,
        question: "What type of work process will be automated?",
        section: "Quality Impact Rubric",
        type: "radio",
        options: [
          { value: "data_entry", label: "Data Entry & Validation", description: "Entering, checking, or verifying data" },
          { value: "document", label: "Document Review & Processing", description: "Reading, extracting, or classifying documents" },
          { value: "communication", label: "Communication & Customer Service", description: "Emails, inquiries, customer interactions" },
          { value: "analysis", label: "Analysis & Reporting", description: "Analyzing data, creating reports, generating insights" },
          { value: "compliance", label: "Compliance & Validation", description: "Checking compliance, quality assurance, auditing" },
          { value: "coordination", label: "Coordination & Scheduling", description: "Managing schedules, coordinating resources" },
          { value: "creative", label: "Creative & Strategic Work", description: "Strategy, creative content, complex decisions" }
        ]
      },
      {
        id: 12,
        question: "How often do errors or quality issues currently occur in this process?",
        section: "Quality Impact Rubric",
        type: "radio",
        options: [
          { value: "very_frequent", label: "Very frequent", description: "Errors occur in more than 30% of cases" },
          { value: "frequent", label: "Frequent", description: "Errors occur in 15-30% of cases" },
          { value: "occasional", label: "Occasional", description: "Errors occur in 5-15% of cases" },
          { value: "rare", label: "Rare", description: "Errors occur in less than 5% of cases" }
        ]
      },
      {
        id: 13,
        question: "What is the primary cause of errors or quality issues?",
        section: "Quality Impact Rubric",
        type: "radio",
        options: [
          { value: "fatigue", label: "Manual, repetitive work leading to human fatigue or oversight" },
          { value: "missing_info", label: "Missing or incomplete information when making decisions" },
          { value: "interpretation", label: "Inconsistent interpretation of rules or standards" },
          { value: "complexity", label: "High complexity requiring significant expertise or judgment" },
          { value: "communication", label: "Communication gaps or misunderstandings between people" }
        ]
      },
      {
        id: 14,
        question: "When are errors or quality issues typically discovered?",
        section: "Quality Impact Rubric",
        type: "radio",
        options: [
          { value: "after_delivery", label: "After delivery to customer", description: "Customer complaints, returns, escalations" },
          { value: "end_process", label: "At the end of the process", description: "Final review or quality check" },
          { value: "during_process", label: "During the process", description: "Spotted before completion" },
          { value: "early", label: "Early in the process", description: "Caught quickly with minimal rework" }
        ]
      },
      {
        id: 15,
        question: "How standardized is the current process?",
        section: "Quality Impact Rubric",
        type: "radio",
        options: [
          { value: "variable", label: "Highly variable", description: "Each case is handled differently" },
          { value: "guidelines", label: "Some guidelines", description: "General approach but flexibility in execution" },
          { value: "documented", label: "Documented process", description: "Clear steps and procedures to follow" },
          { value: "strict", label: "Strict standards", description: "Detailed rules and quality requirements" }
        ]
      },
      {
        id: 16,
        question: "How well-suited is this work for AI quality improvement?",
        section: "Quality Impact Rubric",
        type: "radio",
        options: [
          { value: "rule_based", label: "Rule-based decisions", description: "Clear if/then rules that can be programmed" },
          { value: "pattern", label: "Pattern recognition", description: "AI can learn from examples and spot patterns" },
          { value: "contextual", label: "Contextual judgment", description: "Requires understanding context and nuance" },
          { value: "subjective", label: "Highly subjective", description: "Depends heavily on personal opinion or taste" }
        ]
      }
    ]
  },
  {
    section: "Time Savings Rubric",
    weight: 0, // Used for ROI, not Readiness Rubric
    description: "Answer a few questions to get a personalized time savings estimate",
    questions: [
      {
        id: 18,
        question: "What type of process will be automated?",
        section: "Time Savings Rubric",
        type: "radio",
        options: [
          { value: "data_entry", label: "Data Entry & Validation" },
          { value: "document", label: "Document Processing & Review" },
          { value: "communication", label: "Communication & Coordination" },
          { value: "research", label: "Research & Analysis" },
          { value: "qa", label: "Quality Assurance & Compliance" }
        ]
      },
      {
        id: 19,
        question: "How complex is the task?",
        section: "Time Savings Rubric",
        type: "radio",
        options: [
          { value: "simple", label: "Simple", description: "Follows clear rules and patterns" },
          { value: "moderate", label: "Moderate", description: "Requires some decision-making" },
          { value: "complex", label: "Complex", description: "Requires significant analysis" }
        ]
      },
      {
        id: 20,
        question: "How structured is the data you work with?",
        section: "Time Savings Rubric",
        type: "radio",
        options: [
          { value: "structured", label: "Highly structured", description: "Forms, databases, spreadsheets" },
          { value: "semi_structured", label: "Semi-structured", description: "Emails, documents with templates" },
          { value: "unstructured", label: "Unstructured", description: "Free-form text, images, audio" }
        ]
      }
    ]
  },
  {
    section: "Revenue Uplift Rubric",
    weight: 0, // Used for ROI, not Readiness Rubric
    description: "Answer questions to determine if and how much saved time can realistically convert to revenue generation",
    questions: [
      {
        id: 21,
        question: "Who gets the time back from this AI implementation?",
        section: "Revenue Uplift Rubric",
        type: "radio",
        options: [
          { value: "sales_ops", label: "Sales Operations / CRM Administrator", description: "Sales Ops Analyst, CRM Specialist, Deal Desk Coordinator" },
          { value: "customer_success", label: "Customer Success Manager / Analyst", description: "Retention Analyst, Account Manager Post-Sale" },
          { value: "financial", label: "Financial Analyst / Strategic Accountant", description: "FP&A Analyst, Financial Controller" },
          { value: "support", label: "Customer Support / Help Desk", description: "Tier 1 Support, IT Help Desk, CSR" },
          { value: "procurement", label: "Procurement / Sourcing Specialist", description: "Purchasing Agent, Vendor Manager, Supply Chain Coordinator" },
          { value: "hr", label: "HR Generalist / People Operations", description: "HR Admin, Payroll Specialist, Benefits Coordinator" },
          { value: "admin", label: "General Admin / Office Manager", description: "Office Administrator, Executive Assistant, General Clerk" },
          { value: "legal", label: "Legal / Compliance / Internal Audit", description: "Compliance Officer, Internal Auditor, Risk Manager" },
          { value: "other", label: "Other / Unspecified Back-Office Role", description: "Not listed above - defaults to 0% for conservative estimates" }
        ]
      },
      {
        id: 22,
        question: "What is the relationship between current capacity and available opportunities?",
        section: "Revenue Uplift Rubric",
        type: "radio",
        options: [
          { value: "high_demand", label: "High demand with team at/above capacity", description: "Turning away opportunities, clear revenue potential" },
          { value: "strong_pipeline", label: "Strong pipeline with team near capacity", description: "Could pursue more with freed time" },
          { value: "moderate", label: "Moderate opportunities with balanced capacity", description: "Some room to grow" },
          { value: "limited", label: "Limited opportunities or low utilization", description: "Team has spare capacity or demand is constrained" }
        ]
      },
      {
        id: 23,
        question: "How does more time translate to more revenue?",
        section: "Revenue Uplift Rubric",
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
    section: "ROI Data Collection",
    weight: 0, // Used for ROI calculator
    description: "Numerical inputs for ROI calculation",
    questions: [
      {
        id: 24,
        question: "How many employees perform this task?",
        section: "ROI Data Collection",
        type: "number",
        placeholder: "Enter number of employees"
      },
      {
        id: 25,
        question: "How often is this task performed?",
        section: "ROI Data Collection",
        type: "radio",
        options: [
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
          { value: "monthly", label: "Monthly" }
        ]
      },
      {
        id: 26,
        question: "How many times is this process completed in the selected period?",
        section: "ROI Data Collection",
        type: "number",
        placeholder: "e.g., 5 times per day"
      },
      {
        id: 27,
        question: "How many minutes does each process take?",
        section: "ROI Data Collection",
        type: "number",
        placeholder: "Enter minutes per process"
      },
      {
        id: 37,
        question: "Does this workflow have measurable quality impact (errors that cost time or money)?",
        section: "ROI Data Collection",
        type: "radio",
        options: [
          { value: "yes", label: "Yes - This workflow has error-related costs" },
          { value: "no", label: "No - Quality impact is not a factor" }
        ]
      },
      {
        id: 28,
        question: "What is the current error rate?",
        section: "ROI Data Collection",
        type: "number",
        placeholder: "Enter percentage (e.g., 15 for 15%)",
        conditional: {
          dependsOn: 37,
          showWhen: "yes"
        }
      },
      {
        id: 29,
        question: "How many minutes of rework does each error require?",
        section: "ROI Data Collection",
        type: "number",
        placeholder: "Enter minutes per error",
        conditional: {
          dependsOn: 37,
          showWhen: "yes"
        }
      },
      {
        id: 30,
        question: "What is the financial cost per error (if applicable)?",
        section: "ROI Data Collection",
        type: "number",
        placeholder: "Enter cost in dollars (or 0 if not applicable)",
        conditional: {
          dependsOn: 37,
          showWhen: "yes"
        }
      }
    ]
  },
  {
    section: "Qualitative Insights",
    weight: 0, // Used for analysis, not Readiness Rubric
    description: "Open-ended questions to gather context and insights",
    questions: [
      {
        id: 31,
        question: "What tools or systems do you use most in your daily work?",
        section: "Qualitative Insights",
        type: "text",
        placeholder: "Example: Excel, Google Sheets, ERP, CRM, Email, Slack, internal systems"
      },
      {
        id: 32,
        question: "What do you find most frustrating or limiting about these tools?",
        section: "Qualitative Insights",
        type: "textarea",
        placeholder: "Describe the main pain points or limitations you experience"
      },
      {
        id: 33,
        question: "What are the biggest time-wasters in your current workflow?",
        section: "Qualitative Insights",
        type: "textarea",
        placeholder: "Describe tasks that take longer than they should"
      },
      {
        id: 34,
        question: "If you could automate one part of this process, what would it be and why?",
        section: "Qualitative Insights",
        type: "textarea",
        placeholder: "Describe what you'd automate and the impact it would have"
      },
      {
        id: 35,
        question: "What concerns do you have about automation of this workflow?",
        section: "Qualitative Insights",
        type: "textarea",
        placeholder: "Any worries about job security, reliability, or changes to your role"
      },
      {
        id: 36,
        question: "Is there anything else about this workflow that we should know?",
        section: "Qualitative Insights",
        type: "textarea",
        placeholder: "Any additional context, edge cases, or important details"
      }
    ]
  }
];

// Get all questions in order
export const ALL_PIS_QUESTIONS = PIS_SECTIONS.flatMap(section => section.questions);

// Calculate operational readiness scores
export function calculatePISScores(responses: Record<string, string>): {
  processClarity: number;
  changeMagnitude: number;
  workflowBrittleness: number;
} {
  const calculateSectionScore = (sectionName: string): number => {
    const section = PIS_SECTIONS.find(s => s.section === sectionName);
    if (!section || section.questions.length === 0) return 0;

    const scores = section.questions
      .filter(q => q.weight) // Only weighted questions
      .map(q => {
        const responseValue = responses[q.id.toString()];
        if (!responseValue) return 0;
        
        let score = parseInt(responseValue, 10);
        if (isNaN(score)) return 0;
        
        // Apply inverse scoring if needed (higher value = worse)
        if (q.inverseScoring) {
          score = 6 - score; // Convert 1->5, 2->4, 3->3, 4->2, 5->1
        }
        
        return score * 20; // Convert 1-5 scale to 0-100
      });

    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  return {
    processClarity: calculateSectionScore("Process Clarity"),
    changeMagnitude: calculateSectionScore("Change Magnitude"),
    workflowBrittleness: calculateSectionScore("Workflow Brittleness")
  };
}

// Extract ROI inputs from responses
export function extractROIInputs(responses: Record<string, string>): {
  employeeCount?: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
  processesPerPeriod?: number;
  minutesPerProcess?: number;
  hasQualityImpact?: boolean;
  errorRate?: number;
  reworkMinutesPerError?: number;
  costPerError?: number;
} {
  const hasQualityImpact = responses['37'] === 'yes';
  
  return {
    employeeCount: responses['24'] ? parseInt(responses['24'], 10) : undefined,
    frequency: responses['25'] as 'daily' | 'weekly' | 'monthly' | undefined,
    processesPerPeriod: responses['26'] ? parseInt(responses['26'], 10) : undefined,
    minutesPerProcess: responses['27'] ? parseInt(responses['27'], 10) : undefined,
    hasQualityImpact,
    errorRate: hasQualityImpact && responses['28'] ? parseFloat(responses['28']) : undefined,
    reworkMinutesPerError: hasQualityImpact && responses['29'] ? parseInt(responses['29'], 10) : undefined,
    costPerError: hasQualityImpact && responses['30'] ? parseFloat(responses['30']) : undefined,
  };
}

// Extract qualitative responses
export function extractQualitativeResponses(responses: Record<string, string>): Record<string, string> {
  const qualitativeQuestionIds = [31, 32, 33, 34, 35, 36];
  const qualitative: Record<string, string> = {};
  
  qualitativeQuestionIds.forEach(id => {
    if (responses[id.toString()]) {
      qualitative[id.toString()] = responses[id.toString()];
    }
  });
  
  return qualitative;
}
