export interface TFAQuestion {
  id: number;
  question: string;
  section: string;
  weight: number;
  options: {
    value: string;
    label: string;
    description: string;
    score: number | null;  // null for "Don't Know" responses
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
  // System Environment (20%) - 5 questions
  {
    id: 1,
    section: "System Environment",
    question: "Deployment model: How are the main systems for this workflow deployed?",
    weight: 4,
    options: [
      { value: "1", label: "Legacy on-premises only", description: "Mainframe, physical servers, no cloud access", score: 1 },
      { value: "2", label: "Mostly on-premises, some cloud", description: "Traditional data centers with limited cloud services", score: 2 },
      { value: "3", label: "Mixed hybrid environment", description: "Combination of on-prem and cloud, some integration exists", score: 3 },
      { value: "4", label: "Mostly cloud SaaS", description: "Salesforce, Microsoft 365, some legacy systems remain", score: 4 },
      { value: "5", label: "Modern cloud SaaS only", description: "100% cloud-based systems (AWS, Azure, Google Cloud)", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 2,
    section: "System Environment",
    question: "API availability: Do the systems expose REST/SOAP APIs or webhooks for data exchange?",
    weight: 6,
    options: [
      { value: "1", label: "No APIs available", description: "Manual exports only, screen scraping required", score: 1 },
      { value: "2", label: "Limited or legacy APIs", description: "Old SOAP endpoints, limited documentation", score: 2 },
      { value: "3", label: "Some modern APIs available", description: "Mix of REST and legacy, partial coverage", score: 3 },
      { value: "4", label: "Good API coverage", description: "Well-documented REST APIs for most functions", score: 4 },
      { value: "5", label: "Comprehensive modern APIs", description: "Full REST/GraphQL, webhooks, real-time updates", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 3,
    section: "System Environment",
    question: "System access: Can automation tools access these systems programmatically (without human login)?",
    weight: 5,
    options: [
      { value: "1", label: "No programmatic access", description: "UI-only, requires manual interaction", score: 1 },
      { value: "2", label: "Very limited access", description: "Database-level access only, no application APIs", score: 2 },
      { value: "3", label: "Moderate access with workarounds", description: "RPA/scripting possible but not officially supported", score: 3 },
      { value: "4", label: "Good programmatic access", description: "Service accounts, API keys, OAuth supported", score: 4 },
      { value: "5", label: "Full programmatic access", description: "Native automation support, SDKs available", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 4,
    section: "System Environment",
    question: "System performance: What is the typical response time and reliability of the systems involved?",
    weight: 3,
    options: [
      { value: "1", label: "Frequent failures or timeouts", description: "Systems often down, >10 second response times", score: 1 },
      { value: "2", label: "Below average performance", description: "Regular slowdowns, 5-10 second responses, occasional outages", score: 2 },
      { value: "3", label: "Acceptable performance", description: "2-5 second responses, 95% uptime", score: 3 },
      { value: "4", label: "Good performance", description: "<2 second responses, 99% uptime", score: 4 },
      { value: "5", label: "Excellent performance", description: "Sub-second responses, 99.9%+ uptime, high availability", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 5,
    section: "System Environment",
    question: "Monitoring capabilities: Are there monitoring/logging tools to track automation performance and errors?",
    weight: 2,
    options: [
      { value: "1", label: "No monitoring", description: "No logs, no visibility into system operations", score: 1 },
      { value: "2", label: "Basic logging only", description: "System logs exist but hard to access or search", score: 2 },
      { value: "3", label: "Standard monitoring", description: "Basic dashboards, manual log review needed", score: 3 },
      { value: "4", label: "Good monitoring", description: "Centralized logging, alerting, basic dashboards", score: 4 },
      { value: "5", label: "Advanced observability", description: "Real-time monitoring, automated alerts, detailed analytics", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  
  // Data Quality (25%) - 5 questions
  {
    id: 6,
    section: "Data Quality",
    question: "Data structure: How structured and consistent is the input data for this workflow?",
    weight: 6,
    options: [
      { value: "1", label: "Highly unstructured", description: "Free-form text, emails, scanned documents", score: 1 },
      { value: "2", label: "Mostly unstructured", description: "PDFs, Word docs with inconsistent formats", score: 2 },
      { value: "3", label: "Semi-structured", description: "Excel files with varying columns, some templates", score: 3 },
      { value: "4", label: "Mostly structured", description: "Database tables, CSV files with standard schema", score: 4 },
      { value: "5", label: "Fully structured", description: "Standardized JSON/XML, database with strict schema", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 7,
    section: "Data Quality",
    question: "Data quality: How accurate and complete is the data typically? (Consider missing fields, errors, duplicates)",
    weight: 5,
    options: [
      { value: "1", label: "Poor quality, frequent errors", description: "20%+ error rate, many missing required fields", score: 1 },
      { value: "2", label: "Below average quality", description: "10-20% errors, regular cleanup required", score: 2 },
      { value: "3", label: "Acceptable quality", description: "5-10% errors, manageable with validation", score: 3 },
      { value: "4", label: "Good quality", description: "1-5% errors, mostly complete records", score: 4 },
      { value: "5", label: "Excellent quality", description: "<1% errors, validated data with mandatory fields", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 8,
    section: "Data Quality",
    question: "Data availability: Is sufficient historical/training data available for AI to learn patterns?",
    weight: 4,
    options: [
      { value: "1", label: "No historical data", description: "New process, less than 100 records", score: 1 },
      { value: "2", label: "Very limited data", description: "100-1,000 records, insufficient for training", score: 2 },
      { value: "3", label: "Some historical data", description: "1,000-10,000 records, minimal patterns", score: 3 },
      { value: "4", label: "Good historical data", description: "10,000-100,000 records, clear patterns", score: 4 },
      { value: "5", label: "Extensive historical data", description: "100,000+ records, rich training examples", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 9,
    section: "Data Quality",
    question: "Data consistency: How consistent is the data format and values across different sources and time periods?",
    weight: 5,
    options: [
      { value: "1", label: "Highly inconsistent", description: "Different formats per source, conflicting values, no standards", score: 1 },
      { value: "2", label: "Mostly inconsistent", description: "Frequent format variations, manual mapping needed", score: 2 },
      { value: "3", label: "Moderately consistent", description: "Some standardization exists, occasional mismatches", score: 3 },
      { value: "4", label: "Mostly consistent", description: "Well-defined standards, minor variations", score: 4 },
      { value: "5", label: "Fully consistent", description: "Single source of truth, enforced data standards", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 10,
    section: "Data Quality",
    question: "Data validation: Are there validation rules and error handling mechanisms in place for incoming data?",
    weight: 5,
    options: [
      { value: "1", label: "No validation", description: "Any data accepted, no checks or error handling", score: 1 },
      { value: "2", label: "Minimal validation", description: "Basic type checks only, errors cause failures", score: 2 },
      { value: "3", label: "Moderate validation", description: "Some business rules enforced, basic error logging", score: 3 },
      { value: "4", label: "Strong validation", description: "Comprehensive rules, error handling with retry logic", score: 4 },
      { value: "5", label: "Robust validation framework", description: "Multi-layer validation, automated correction, detailed error tracking", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },

  // Integration Feasibility (25%) - 5 questions
  {
    id: 11,
    section: "Integration Feasibility",
    question: "Integration complexity: How many different systems need to be integrated for this workflow?",
    weight: 5,
    options: [
      { value: "1", label: "10+ systems", description: "Highly complex integration landscape", score: 1 },
      { value: "2", label: "6-9 systems", description: "Multiple touchpoints across departments", score: 2 },
      { value: "3", label: "3-5 systems", description: "Several key systems (e.g., CRM + ERP + email)", score: 3 },
      { value: "4", label: "2 systems", description: "Simple point-to-point integration", score: 4 },
      { value: "5", label: "Single system", description: "All data within one platform", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 12,
    section: "Integration Feasibility",
    question: "System compatibility: Are the systems compatible with modern integration platforms? (Zapier, MuleSoft, custom middleware)",
    weight: 6,
    options: [
      { value: "1", label: "No compatibility", description: "Proprietary/legacy systems with no connectors", score: 1 },
      { value: "2", label: "Poor compatibility", description: "Custom coding required for all integrations", score: 2 },
      { value: "3", label: "Moderate compatibility", description: "Some pre-built connectors, custom work needed", score: 3 },
      { value: "4", label: "Good compatibility", description: "Most systems have standard connectors", score: 4 },
      { value: "5", label: "Excellent compatibility", description: "Native integrations, Zapier/Make.com ready", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 13,
    section: "Integration Feasibility",
    question: "Authentication: How complex is the authentication/authorization setup for system access?",
    weight: 5,
    options: [
      { value: "1", label: "Very complex or custom", description: "Proprietary auth, multiple MFA layers, manual approvals", score: 1 },
      { value: "2", label: "Complex multi-factor", description: "SAML with complex roles, frequent re-auth", score: 2 },
      { value: "3", label: "Moderate complexity", description: "Standard SSO with some permission complexity", score: 3 },
      { value: "4", label: "Standard OAuth/SSO", description: "OAuth 2.0, Microsoft/Google SSO", score: 4 },
      { value: "5", label: "Simple API keys", description: "Long-lived API tokens, straightforward permissions", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 14,
    section: "Integration Feasibility",
    question: "API rate limits: Are there rate limiting or throttling restrictions that could impact automation throughput?",
    weight: 5,
    options: [
      { value: "1", label: "Severe restrictions", description: "Very low limits (10-50 requests/hour), strict throttling", score: 1 },
      { value: "2", label: "Significant restrictions", description: "Limited throughput (100-500 requests/hour)", score: 2 },
      { value: "3", label: "Moderate limits", description: "Standard limits (1000-5000 requests/hour), manageable", score: 3 },
      { value: "4", label: "Generous limits", description: "High throughput (10,000+ requests/hour)", score: 4 },
      { value: "5", label: "No limits or unlimited", description: "No throttling, enterprise tier, or self-hosted", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 15,
    section: "Integration Feasibility",
    question: "Error handling: How robust are the existing integration error handling and retry mechanisms?",
    weight: 4,
    options: [
      { value: "1", label: "No error handling", description: "Failures cause complete stops, manual intervention required", score: 1 },
      { value: "2", label: "Basic error handling", description: "Simple failure logs, no automatic retry", score: 2 },
      { value: "3", label: "Moderate error handling", description: "Some retry logic, basic error categorization", score: 3 },
      { value: "4", label: "Good error handling", description: "Automatic retries, error queues, notification system", score: 4 },
      { value: "5", label: "Advanced error handling", description: "Circuit breakers, exponential backoff, dead letter queues", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },

  // Security/Compliance (15%) - 4 questions
  {
    id: 16,
    section: "Security/Compliance",
    question: "Data sensitivity: What type of data does this workflow process?",
    weight: 5,
    options: [
      { value: "1", label: "Highly sensitive regulated data", description: "Healthcare (PHI/HIPAA), financial (PCI), personal identifiable info", score: 1 },
      { value: "2", label: "Sensitive business data", description: "Customer data, financials, confidential contracts", score: 2 },
      { value: "3", label: "Moderately sensitive", description: "Internal operations data, some customer info", score: 3 },
      { value: "4", label: "Low sensitivity", description: "General business data, public information", score: 4 },
      { value: "5", label: "Non-sensitive public data", description: "Marketing content, public documentation", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 17,
    section: "Security/Compliance",
    question: "Compliance requirements: What compliance standards or regulations apply to this workflow?",
    weight: 4,
    options: [
      { value: "1", label: "Strict regulatory compliance", description: "HIPAA, SOC 2, PCI-DSS, GDPR with heavy auditing", score: 1 },
      { value: "2", label: "High compliance needs", description: "Industry-specific regulations, annual audits", score: 2 },
      { value: "3", label: "Moderate compliance", description: "Basic GDPR/privacy requirements, standard policies", score: 3 },
      { value: "4", label: "Basic compliance", description: "Company policies, minimal external requirements", score: 4 },
      { value: "5", label: "No specific compliance", description: "General business practices, no special requirements", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 18,
    section: "Security/Compliance",
    question: "Security approval: How long does security/compliance approval typically take for new tools?",
    weight: 3,
    options: [
      { value: "1", label: "6+ months", description: "Extensive review, penetration testing, legal review", score: 1 },
      { value: "2", label: "3-6 months", description: "Security questionnaires, compliance reviews, multiple approvals", score: 2 },
      { value: "3", label: "1-3 months", description: "Standard security review process", score: 3 },
      { value: "4", label: "2-4 weeks", description: "Quick IT review, standard vendor assessment", score: 4 },
      { value: "5", label: "Less than 2 weeks", description: "Self-service approval, pre-approved vendors", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 19,
    section: "Security/Compliance",
    question: "Data retention: What are the data retention and archival requirements for this workflow?",
    weight: 3,
    options: [
      { value: "1", label: "Complex long-term retention", description: "10+ years, strict legal requirements, complex archival", score: 1 },
      { value: "2", label: "Significant retention needs", description: "5-10 years, industry compliance standards", score: 2 },
      { value: "3", label: "Moderate retention", description: "1-5 years, standard business requirements", score: 3 },
      { value: "4", label: "Short retention", description: "Less than 1 year, flexible deletion policies", score: 4 },
      { value: "5", label: "Minimal retention", description: "No specific requirements, data deleted after use", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },

  // Process Stability (10%) - 3 questions
  {
    id: 20,
    section: "Process Stability",
    question: "Process definition: How well-defined and documented is this workflow?",
    weight: 4,
    options: [
      { value: "1", label: "Undefined or ad-hoc", description: "Different approach every time, tribal knowledge", score: 1 },
      { value: "2", label: "Poorly defined", description: "Rough guidelines, lots of exceptions, minimal docs", score: 2 },
      { value: "3", label: "Moderately defined", description: "Basic documentation, known steps with some variation", score: 3 },
      { value: "4", label: "Well defined", description: "Clear SOPs, documented decision trees", score: 4 },
      { value: "5", label: "Fully documented with examples", description: "Detailed process maps, training materials, decision logic", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 21,
    section: "Process Stability",
    question: "Process changes: How frequently do the rules or steps for this workflow change?",
    weight: 3,
    options: [
      { value: "1", label: "Weekly changes", description: "Constant tweaks, seasonal variations, reactive adjustments", score: 1 },
      { value: "2", label: "Monthly changes", description: "Regular updates, new exceptions frequently added", score: 2 },
      { value: "3", label: "Quarterly changes", description: "Periodic reviews, some updates per year", score: 3 },
      { value: "4", label: "Annual changes", description: "Stable process with yearly refinements", score: 4 },
      { value: "5", label: "Rarely changes", description: "Established process, only changes for major events", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 22,
    section: "Process Stability",
    question: "Exception handling: How frequently do exceptions or edge cases occur that require manual intervention?",
    weight: 3,
    options: [
      { value: "1", label: "Very frequent exceptions", description: "50%+ of cases need manual handling, unpredictable variations", score: 1 },
      { value: "2", label: "Frequent exceptions", description: "20-50% exceptions, many edge cases", score: 2 },
      { value: "3", label: "Moderate exceptions", description: "10-20% exceptions, known edge cases", score: 3 },
      { value: "4", label: "Few exceptions", description: "5-10% exceptions, well-documented patterns", score: 4 },
      { value: "5", label: "Rare exceptions", description: "<5% exceptions, highly standardized process", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },

  // Ownership (5%) - 2 questions
  {
    id: 23,
    section: "Ownership",
    question: "Business sponsorship: Is there executive or business leadership support for automating this workflow?",
    weight: 3,
    options: [
      { value: "1", label: "No sponsorship", description: "No executive awareness or interest", score: 1 },
      { value: "2", label: "Weak sponsorship", description: "Passive support, no active involvement", score: 2 },
      { value: "3", label: "Moderate sponsorship", description: "Manager-level support, budget unclear", score: 3 },
      { value: "4", label: "Strong sponsorship", description: "Director/VP champion, approved budget", score: 4 },
      { value: "5", label: "Executive champion", description: "C-level sponsor, strategic priority, dedicated resources", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 24,
    section: "Ownership",
    question: "Technical ownership: Is there clear technical ownership and support for implementing automation?",
    weight: 2,
    options: [
      { value: "1", label: "No technical owner", description: "No one assigned, unclear responsibility", score: 1 },
      { value: "2", label: "Unclear ownership", description: "Shared responsibility, no dedicated resource", score: 2 },
      { value: "3", label: "Moderate ownership", description: "Part-time owner, competing priorities", score: 3 },
      { value: "4", label: "Clear ownership", description: "Designated technical lead, allocated time", score: 4 },
      { value: "5", label: "Dedicated owner with team", description: "Full-time owner, supporting team, clear mandate", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
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
      if (option && option.score !== null) {
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
        if (option && option.score !== null) {
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
