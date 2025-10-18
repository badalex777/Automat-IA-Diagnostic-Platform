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
  { 
    name: "System Environment", 
    weight: 25,
    description: "Help us understand your technical infrastructure so we can recommend AI solutions that integrate smoothly with your existing systems"
  },
  { 
    name: "Data Quality", 
    weight: 30,
    description: "Share details about your data so we can determine if you have the necessary foundation for reliable AI performance"
  },
  { 
    name: "Integration Feasibility", 
    weight: 30,
    description: "Tell us about your system connectivity so we can assess integration complexity and plan the technical implementation path"
  },
  { 
    name: "Security/Compliance", 
    weight: 15,
    description: "Provide information about your security and compliance requirements so we can ensure AI solutions meet your organization's standards"
  },
];

export interface QuestionWithImpact {
  id: number;
  question: string;
  section: string;
  sectionWeight: number;
  score: number;
  impactScore: number;
  respondent?: string;
}

export function calculateQuestionImpact(
  questionId: number,
  score: number | null,
  sectionWeight: number
): number {
  if (score === null) return 0;
  return (5 - score) * sectionWeight;
}

export function getSectionWeight(sectionName: string): number {
  const section = TFA_SECTIONS.find(s => s.name === sectionName);
  return section?.weight || 0;
}

export const TFA_QUESTIONS: TFAQuestion[] = [
  // System Environment (25%) - 6 questions
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
    weight: 4,
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
    weight: 3,
    options: [
      { value: "1", label: "No monitoring", description: "No logs, no visibility into system operations", score: 1 },
      { value: "2", label: "Basic logging only", description: "System logs exist but hard to access or search", score: 2 },
      { value: "3", label: "Standard monitoring", description: "Basic dashboards, manual log review needed", score: 3 },
      { value: "4", label: "Good monitoring", description: "Centralized logging, alerting, basic dashboards", score: 4 },
      { value: "5", label: "Advanced observability", description: "Real-time monitoring, automated alerts, detailed analytics", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 6,
    section: "System Environment",
    question: "Backup and disaster recovery: What backup and recovery capabilities exist for the systems involved?",
    weight: 3,
    options: [
      { value: "1", label: "No backup strategy", description: "No backups, data loss would be catastrophic", score: 1 },
      { value: "2", label: "Minimal backups", description: "Irregular backups, long recovery time (days)", score: 2 },
      { value: "3", label: "Basic backup system", description: "Daily backups, recovery time 4-24 hours", score: 3 },
      { value: "4", label: "Good backup system", description: "Hourly backups, point-in-time recovery, < 4 hour RTO", score: 4 },
      { value: "5", label: "Enterprise disaster recovery", description: "Real-time replication, automated failover, < 1 hour RTO", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  
  // Data Quality (30%) - 5 questions
  {
    id: 7,
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
    id: 8,
    section: "Data Quality",
    question: "Data quality: How accurate and complete is the data typically? (Consider missing fields, errors, duplicates)",
    weight: 6,
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
    id: 9,
    section: "Data Quality",
    question: "Data availability: Is sufficient historical/training data available for AI to learn patterns?",
    weight: 6,
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
    id: 10,
    section: "Data Quality",
    question: "Data consistency: How consistent is the data format and values across different sources and time periods?",
    weight: 6,
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
    id: 11,
    section: "Data Quality",
    question: "Data validation: Are there validation rules and error handling mechanisms in place for incoming data?",
    weight: 6,
    options: [
      { value: "1", label: "No validation", description: "Any data accepted, no checks or error handling", score: 1 },
      { value: "2", label: "Minimal validation", description: "Basic type checks only, errors cause failures", score: 2 },
      { value: "3", label: "Moderate validation", description: "Some business rules enforced, basic error logging", score: 3 },
      { value: "4", label: "Strong validation", description: "Comprehensive rules, error handling with retry logic", score: 4 },
      { value: "5", label: "Robust validation framework", description: "Multi-layer validation, automated correction, detailed error tracking", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },

  // Integration Feasibility (30%) - 6 questions
  {
    id: 12,
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
    id: 13,
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
    id: 14,
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
    id: 15,
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
    id: 16,
    section: "Integration Feasibility",
    question: "Error handling: How robust are the existing integration error handling and retry mechanisms?",
    weight: 5,
    options: [
      { value: "1", label: "No error handling", description: "Failures cause complete stops, manual intervention required", score: 1 },
      { value: "2", label: "Basic error handling", description: "Simple failure logs, no automatic retry", score: 2 },
      { value: "3", label: "Moderate error handling", description: "Some retry logic, basic error categorization", score: 3 },
      { value: "4", label: "Good error handling", description: "Automatic retries, error queues, notification system", score: 4 },
      { value: "5", label: "Advanced error handling", description: "Circuit breakers, exponential backoff, dead letter queues", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },
  {
    id: 17,
    section: "Integration Feasibility",
    question: "API versioning and stability: How stable are the APIs, and how are version changes managed?",
    weight: 4,
    options: [
      { value: "1", label: "Unstable, frequent breaking changes", description: "APIs change without notice, no versioning strategy", score: 1 },
      { value: "2", label: "Poorly managed versions", description: "Breaking changes common, short deprecation windows", score: 2 },
      { value: "3", label: "Moderate version management", description: "Some versioning, occasional breaking changes with notice", score: 3 },
      { value: "4", label: "Good version control", description: "Semantic versioning, 6+ month deprecation period", score: 4 },
      { value: "5", label: "Enterprise-grade stability", description: "Long-term support, backwards compatibility guaranteed, 12+ month deprecation", score: 5 },
      { value: "0", label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer", score: null },
    ],
  },

  // Security/Compliance (15%) - 4 questions
  {
    id: 18,
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
    id: 19,
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
    id: 20,
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
    id: 21,
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
];

// Group questions by section for form display
export const tfaSections = TFA_SECTIONS.map(section => ({
  section: section.name,
  weight: section.weight,
  description: section.description,
  questions: TFA_QUESTIONS.filter(q => q.section === section.name),
}));

// Calculate weighted score
export function calculateTFAScore(responses: Record<string, string>): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  TFA_QUESTIONS.forEach((question) => {
    const response = responses[question.id.toString()];
    if (response) {
      const selectedOption = question.options.find(opt => opt.value === response);
      if (selectedOption && selectedOption.score !== null) {
        totalWeightedScore += selectedOption.score * question.weight;
        totalWeight += question.weight;
      }
    }
  });

  // Return normalized score (0-100)
  return totalWeight > 0 ? Math.round((totalWeightedScore / (totalWeight * 5)) * 100) : 0;
}

// Calculate scores per section
export function calculateSectionScores(responses: Record<string, string>): Array<{ name: string; score: number; weight: number }> {
  return tfaSections.map(section => {
    const sectionQuestions = section.questions;
    const totalWeight = sectionQuestions.reduce((acc, q) => acc + q.weight, 0);
    const weightedScore = sectionQuestions.reduce((acc, q) => {
      const response = responses[q.id.toString()];
      if (!response) return acc;
      const selectedOption = q.options.find(opt => opt.value === response);
      if (selectedOption && selectedOption.score !== null) {
        return acc + (selectedOption.score * q.weight);
      }
      return acc;
    }, 0);
    
    const score = totalWeight > 0 ? (weightedScore / totalWeight) : 0;
    
    return {
      name: section.section,
      score: parseFloat(score.toFixed(1)),
      weight: section.weight,
    };
  });
}

// Score-specific recommendations for each question
export const QUESTION_RECOMMENDATIONS: Record<number, Record<number, string>> = {
  // Q1: Deployment model
  1: {
    1: "CRITICAL: Legacy on-premises infrastructure severely limits AI integration. Recommendation: Initiate cloud migration assessment for target systems. Consider hybrid cloud architecture or cloud-native API gateway to enable modern integrations without full migration.",
    2: "WARNING: Limited cloud adoption restricts automation capabilities. Recommendation: Identify quick-win systems to migrate to cloud or implement cloud connectivity layers (VPN, Direct Connect). Evaluate hybrid integration platforms like MuleSoft or Azure Integration Services.",
    3: "MODERATE: Hybrid environment provides some flexibility but adds complexity. Recommendation: Standardize integration patterns across on-prem and cloud. Implement unified API management to simplify connectivity. Document which systems are cloud-ready for prioritization.",
    4: "GOOD: Mostly cloud-based infrastructure supports AI implementation well. Recommendation: Leverage existing SaaS connectors and native APIs. Migrate remaining legacy systems or implement abstraction layers to maintain cloud-first approach.",
    5: "EXCELLENT: Full cloud deployment maximizes automation potential. Recommendation: Utilize native cloud AI services (AWS SageMaker, Azure AI, Google Vertex). Implement serverless architectures for scalability. Focus on optimizing API consumption and cost management."
  },
  
  // Q2: API availability
  2: {
    1: "CRITICAL: No API access blocks automated integration. Recommendation: Evaluate RPA (UiPath, Automation Anywhere) for screen automation as interim solution. Pressure vendors for API roadmap or consider system replacement. Assess feasibility of database-level integration with IT approval.",
    2: "WARNING: Limited API coverage creates integration gaps. Recommendation: Document all available endpoints and identify gaps. Negotiate with vendors for REST API access. Consider hybrid approach: APIs where available, RPA for gaps. Budget for custom connector development.",
    3: "MODERATE: Partial API coverage requires workarounds. Recommendation: Prioritize workflows using existing APIs. Create abstraction layer to normalize legacy and modern endpoints. Plan API expansion roadmap with vendors. Implement API documentation and governance.",
    4: "GOOD: Strong API foundation enables smooth integration. Recommendation: Build comprehensive API catalog with usage examples. Implement API monitoring and rate limit tracking. Create reusable integration templates. Focus on security and error handling best practices.",
    5: "EXCELLENT: Full API ecosystem accelerates implementation. Recommendation: Leverage webhooks for real-time automation. Implement GraphQL if complex data queries needed. Use API-first AI platforms. Focus on optimizing payload size and response times for performance."
  },
  
  // Q3: System access
  3: {
    1: "CRITICAL: UI-only access severely limits automation options. Recommendation: Urgently evaluate RPA tools for attended/unattended automation. Engage IT security to explore service account provisioning. Consider cloud-based alternatives with better programmatic access.",
    2: "WARNING: Database-only access creates security and maintenance risks. Recommendation: Request vendor support for application-level APIs. If unavailable, implement secure database integration with read-only accounts, change data capture (CDC), and strict auditing. Avoid direct writes.",
    3: "MODERATE: Workaround-based access is fragile and maintenance-heavy. Recommendation: Document RPA scripts thoroughly with change management process. Plan transition to proper APIs. Implement robust error handling and monitoring for script failures. Consider API-first platform migration.",
    4: "GOOD: Programmatic access via service accounts works well. Recommendation: Implement OAuth 2.0 or API key rotation policies. Use secret management tools (Azure Key Vault, AWS Secrets Manager). Document authentication flows. Set up monitoring for token expiration and access issues.",
    5: "EXCELLENT: Native automation support is ideal. Recommendation: Leverage vendor SDKs and libraries for faster development. Implement CI/CD pipelines for automated deployment. Use infrastructure-as-code for reproducible environments. Focus on optimization and advanced features."
  },
  
  // Q4: System performance
  4: {
    1: "CRITICAL: Poor performance will cause automation failures and timeouts. Recommendation: Implement aggressive timeout/retry logic with exponential backoff. Schedule automation during off-peak hours. Pressure IT/vendors for infrastructure upgrades. Consider caching strategies to reduce API calls.",
    2: "WARNING: Unreliable performance requires defensive programming. Recommendation: Build circuit breaker patterns to prevent cascade failures. Implement request queuing with rate limiting. Monitor performance trends to predict outages. Establish SLA requirements with vendors.",
    3: "MODERATE: Acceptable performance but plan for edge cases. Recommendation: Implement moderate timeout values (10-15 seconds). Use async processing where possible. Monitor 95th percentile response times. Create performance benchmarks and alert on degradation.",
    4: "GOOD: Reliable performance supports standard automation patterns. Recommendation: Implement standard timeout values (5-7 seconds). Focus on optimizing batch operations. Use connection pooling and keep-alive. Monitor for anomalies and capacity planning.",
    5: "EXCELLENT: High performance enables advanced real-time automation. Recommendation: Leverage low latency for real-time processing and streaming. Implement webhooks instead of polling. Focus on minimizing payload sizes. Use CDN and edge computing where applicable for global deployment."
  },
  
  // Q5: Monitoring capabilities
  5: {
    1: "CRITICAL: Blind automation is extremely risky. Recommendation: Immediately implement application-level logging (Winston, Serilog, Log4j). Use structured logging (JSON) for parsing. Deploy log aggregation tool (ELK, Splunk, CloudWatch). Create basic dashboards before proceeding.",
    2: "WARNING: Limited visibility hampers debugging. Recommendation: Centralize logs using cloud services (CloudWatch, Azure Monitor, Google Cloud Logging). Implement correlation IDs for tracing. Create alerts for critical errors. Build basic operational dashboards.",
    3: "MODERATE: Basic monitoring exists but needs enhancement. Recommendation: Implement distributed tracing (Jaeger, Zipkin) for multi-system workflows. Add business metrics beyond technical logs. Create runbooks for common error patterns. Improve alert signal-to-noise ratio.",
    4: "GOOD: Solid monitoring foundation in place. Recommendation: Enhance with AI/ML anomaly detection. Implement proactive alerting based on trends. Create executive dashboards for business KPIs. Integrate with incident management (PagerDuty, Opsgenie).",
    5: "EXCELLENT: Advanced observability enables proactive management. Recommendation: Leverage monitoring for predictive analytics and capacity planning. Implement AIOps for automated remediation. Create detailed SLA reports. Use observability data for continuous optimization."
  },
  
  // Q6: Backup and disaster recovery
  6: {
    1: "CRITICAL: No backup puts business at catastrophic risk. Recommendation: Immediately implement automated daily backups with offsite storage. Use cloud backup services (AWS Backup, Azure Backup) for reliability. Test restore procedures monthly. This is a blocker - do not proceed without backups.",
    2: "WARNING: Inadequate backup creates unacceptable risk. Recommendation: Increase backup frequency to at least daily. Implement point-in-time recovery capability. Reduce RTO to under 4 hours. Store backups in separate geographic region. Create and test disaster recovery runbook.",
    3: "MODERATE: Basic backup exists but enhance for automation. Recommendation: Implement hourly or continuous backups for critical data. Add automated restore testing. Document RTO/RPO requirements. Create failover procedures for automation workflows.",
    4: "GOOD: Robust backup supports business continuity. Recommendation: Implement automated failover testing. Create geo-redundant backup strategy. Use backup data for dev/test environments. Monitor backup success rates and storage costs.",
    5: "EXCELLENT: Enterprise DR enables high availability. Recommendation: Leverage active-active or active-passive failover for zero-downtime. Implement automated disaster recovery drills. Use backups for compliance and audit trails. Focus on cost optimization and retention policies."
  },
  
  // Q7: Data structure
  7: {
    1: "CRITICAL: Unstructured data requires heavy AI/NLP investment. Recommendation: Implement document AI (Azure Form Recognizer, AWS Textract, Google Document AI) for extraction. Plan for 70-80% accuracy initially. Budget significant time for training/validation. Consider human-in-the-loop workflows.",
    2: "WARNING: Document processing needs robust handling. Recommendation: Use OCR with template matching for common formats. Implement confidence scoring and manual review queues. Standardize document formats where possible. Build validation rules to catch extraction errors.",
    3: "MODERATE: Semi-structured data needs normalization. Recommendation: Create data mapping templates for common variations. Implement validation rules to enforce consistency. Build data quality dashboards. Consider master data management (MDM) for key entities.",
    4: "GOOD: Structured data simplifies processing. Recommendation: Leverage existing schema for validation and transformation. Implement data contracts with upstream/downstream systems. Focus on handling edge cases and null values. Monitor for schema changes.",
    5: "EXCELLENT: Clean structured data accelerates implementation. Recommendation: Use schema-based validation for zero-touch processing. Implement automated data quality checks. Focus on performance optimization and parallel processing. Build comprehensive data lineage tracking."
  },
  
  // Q8: Data quality
  8: {
    1: "CRITICAL: High error rates will cause automation failures. Recommendation: Implement aggressive data cleansing pipeline before automation. Build comprehensive validation rules with reject queues. Establish data quality metrics and improvement targets. Consider data quality tools (Talend, Informatica).",
    2: "WARNING: Frequent errors require robust error handling. Recommendation: Build multi-layer validation (syntax, business rules, cross-field). Implement fuzzy matching for common errors. Create data quality scorecards by source. Engage data owners to improve upstream quality.",
    3: "MODERATE: Manageable quality but needs validation. Recommendation: Implement standard validation framework with configurable rules. Create data quality monitoring dashboards. Build automated correction for common issues. Track quality trends and set improvement goals.",
    4: "GOOD: Quality data supports reliable automation. Recommendation: Maintain data quality with ongoing monitoring and alerting. Implement anomaly detection for quality degradation. Use AI for advanced validation patterns. Focus on edge cases and rare errors.",
    5: "EXCELLENT: High-quality data enables straight-through processing. Recommendation: Leverage quality for zero-touch automation. Implement predictive quality monitoring. Use data profiling for continuous improvement. Focus on maintaining quality as volume scales."
  },
  
  // Q9: Data availability
  9: {
    1: "CRITICAL: Insufficient data blocks ML/AI training. Recommendation: DO NOT pursue complex AI/ML initially. Use rule-based automation instead. Plan 6-12 month data collection period. Consider synthetic data generation or transfer learning from similar domains. Start with simple heuristics.",
    2: "WARNING: Limited data restricts ML model accuracy. Recommendation: Use simple models (decision trees, linear regression) that work with smaller datasets. Implement active learning to optimize labeling efforts. Consider data augmentation techniques. Plan for iterative model improvement as data grows.",
    3: "MODERATE: Sufficient data for basic ML models. Recommendation: Start with classical ML algorithms before deep learning. Implement cross-validation to maximize limited data. Use feature engineering to extract maximum value. Monitor model performance and retrain as more data accumulates.",
    4: "GOOD: Strong dataset enables robust ML models. Recommendation: Leverage data for ensemble models and advanced techniques. Implement automated model retraining pipelines. Use A/B testing for model improvements. Build comprehensive training/validation/test splits.",
    5: "EXCELLENT: Rich historical data accelerates AI implementation. Recommendation: Leverage deep learning and transformer models. Implement automated feature engineering and hyperparameter tuning. Build real-time model updating. Use data for advanced analytics and predictions."
  },
  
  // Q10: Data consistency
  10: {
    1: "CRITICAL: Data chaos requires major standardization effort. Recommendation: Implement master data management (MDM) platform. Create canonical data model and mapping rules for all sources. Build data transformation layer. Establish data governance committee and standards.",
    2: "WARNING: Inconsistency creates integration complexity. Recommendation: Document all format variations and create mapping dictionary. Implement data normalization layer. Use data quality tools for standardization. Create data steward role to enforce consistency.",
    3: "MODERATE: Some standardization exists, build upon it. Recommendation: Extend existing standards to cover edge cases. Implement automated format detection and conversion. Create data catalog with lineage tracking. Monitor for new inconsistencies.",
    4: "GOOD: Well-defined standards simplify integration. Recommendation: Maintain standards with automated validation. Implement change management for schema updates. Use API contracts to enforce consistency. Focus on handling minor variations gracefully.",
    5: "EXCELLENT: Single source of truth is ideal. Recommendation: Leverage consistency for zero-transformation integration. Implement real-time data quality monitoring. Use canonical model for all integrations. Focus on maintaining standards as systems evolve."
  },
  
  // Q11: Data validation
  11: {
    1: "CRITICAL: No validation creates data corruption risk. Recommendation: Immediately implement comprehensive validation framework. Build multi-tier validation: format, business rules, referential integrity. Create reject/quarantine queues. Implement detailed error logging. This is a must-have before automation.",
    2: "WARNING: Basic validation is insufficient for automation. Recommendation: Enhance validation with business rule engine. Implement cross-field validation and referential checks. Add retry logic with exponential backoff. Create validation metrics dashboard.",
    3: "MODERATE: Standard validation needs enhancement. Recommendation: Implement advanced validation patterns (regex, range checks, lookup validation). Add data quality scoring. Create automated correction for common errors. Build validation rule versioning.",
    4: "GOOD: Strong validation supports reliable automation. Recommendation: Enhance with ML-based validation for anomaly detection. Implement real-time validation feedback. Create comprehensive error categorization. Build self-healing capabilities for known error patterns.",
    5: "EXCELLENT: Robust validation framework is production-ready. Recommendation: Leverage validation for data quality insights and trend analysis. Implement predictive validation to prevent errors. Use validation metrics for SLA reporting. Focus on performance optimization for high-volume processing."
  },
  
  // Q12: Integration complexity
  12: {
    1: "CRITICAL: 10+ systems create extreme integration risk. Recommendation: Phase implementation - start with 2-3 core systems. Use integration platform (MuleSoft, Dell Boomi) for centralized management. Create integration architecture blueprint. Build comprehensive error handling and compensation logic.",
    2: "WARNING: Multiple systems require careful orchestration. Recommendation: Map complete data flow across all 6-9 systems. Implement integration hub pattern. Use workflow orchestration (Airflow, Azure Logic Apps). Create detailed integration testing strategy.",
    3: "MODERATE: 3-5 systems are manageable with planning. Recommendation: Design integration sequence to minimize dependencies. Implement retry and idempotency patterns. Use message queues for decoupling. Create integration monitoring dashboard.",
    4: "GOOD: Simple integration is low risk. Recommendation: Implement direct API integration with standard error handling. Use connection pooling and caching. Monitor integration health and performance. Build comprehensive integration tests.",
    5: "EXCELLENT: Single system minimizes integration risk. Recommendation: Leverage platform-native automation features. Focus on optimizing performance and user experience. Implement advanced platform-specific features. Build comprehensive test coverage."
  },
  
  // Q13: System compatibility
  13: {
    1: "CRITICAL: Proprietary systems require custom development. Recommendation: Budget 3-6 months for custom connector development. Evaluate specialist integration vendors. Consider replacing systems with modern alternatives. Build abstraction layer to isolate proprietary logic.",
    2: "WARNING: Custom coding slows implementation significantly. Recommendation: Allocate development resources for integration layer. Consider iPaaS platforms with developer tools. Document all custom code thoroughly. Implement automated testing for custom integrations.",
    3: "MODERATE: Mixed compatibility requires selective custom work. Recommendation: Use pre-built connectors where available. Develop custom adapters for unsupported systems. Implement standard integration patterns. Create reusable connector library.",
    4: "GOOD: Standard connectors accelerate implementation. Recommendation: Leverage existing connectors and community libraries. Focus on configuration over customization. Implement connector health monitoring. Build connector governance and versioning.",
    5: "EXCELLENT: Native integrations minimize development effort. Recommendation: Utilize drag-and-drop integration builders (Zapier, Make). Implement rapid prototyping. Focus on business logic over integration code. Leverage pre-built templates and workflows."
  },
  
  // Q14: Authentication
  14: {
    1: "CRITICAL: Complex auth is major implementation barrier. Recommendation: Engage security team early for auth strategy. Document complete authentication flow. Implement secure credential storage (vault). Consider RPA with credential management if APIs unavailable. Budget extra time for auth complexity.",
    2: "WARNING: Multi-factor auth complicates automation. Recommendation: Negotiate with security team for service account exemptions. Implement secure token refresh logic. Use certificate-based auth where possible. Create comprehensive auth failure handling.",
    3: "MODERATE: Standard SSO is manageable. Recommendation: Implement OAuth 2.0 client credentials flow. Use token caching to minimize auth calls. Create auth abstraction layer. Monitor token expiration and refresh proactively.",
    4: "GOOD: Standard OAuth simplifies implementation. Recommendation: Leverage existing OAuth libraries and SDKs. Implement secure token storage and rotation. Build comprehensive auth error handling. Monitor auth performance and failures.",
    5: "EXCELLENT: Simple API keys accelerate implementation. Recommendation: Implement key rotation policies for security. Use environment variables and secret management. Create key usage monitoring. Focus on securing keys in deployment pipelines."
  },
  
  // Q15: API rate limits
  15: {
    1: "CRITICAL: Severe limits block high-volume automation. Recommendation: Implement aggressive request queuing and throttling. Negotiate higher rate limits with vendors. Consider batch processing during off-peak hours. Evaluate alternative vendors with better limits. Use caching extensively.",
    2: "WARNING: Significant restrictions require careful management. Recommendation: Implement rate limit tracking and backoff logic. Use Redis for distributed rate limiting. Create request prioritization logic. Monitor usage to stay within limits. Consider upgrading to higher tiers.",
    3: "MODERATE: Standard limits are manageable with planning. Recommendation: Implement rate limit headers monitoring. Use adaptive throttling based on remaining quota. Create rate limit dashboard. Build request batching where possible.",
    4: "GOOD: Generous limits support normal operations. Recommendation: Implement basic rate limit awareness. Monitor usage trends for capacity planning. Use rate limit buffer (stay at 80% max). Build alerts for approaching limits.",
    5: "EXCELLENT: No limits enable maximum throughput. Recommendation: Focus on optimizing request efficiency over rate limits. Implement parallel processing for performance. Monitor system capacity instead of rate limits. Design for future scalability."
  },
  
  // Q16: Error handling
  16: {
    1: "CRITICAL: No error handling guarantees failures. Recommendation: Immediately implement comprehensive try-catch blocks. Build error logging and alerting. Implement manual intervention queues. Create incident response procedures. This must be addressed before production.",
    2: "WARNING: Basic error handling is insufficient. Recommendation: Implement retry logic with exponential backoff. Add error categorization (transient, permanent). Create dead letter queues. Build error notification system. Develop comprehensive error recovery procedures.",
    3: "MODERATE: Some error handling exists, enhance it. Recommendation: Implement circuit breaker patterns to prevent cascade failures. Add error correlation and root cause analysis. Create automated recovery for common errors. Build error trends dashboard.",
    4: "GOOD: Robust error handling supports reliability. Recommendation: Enhance with automated remediation for known patterns. Implement sophisticated retry strategies (exponential backoff, jitter). Add error prediction based on patterns. Focus on reducing MTTR.",
    5: "EXCELLENT: Advanced error handling is production-grade. Recommendation: Leverage error patterns for proactive monitoring. Implement chaos engineering to test resilience. Use error data for system improvements. Focus on self-healing and autonomous recovery."
  },
  
  // Q17: API versioning and stability
  17: {
    1: "CRITICAL: Unstable APIs create maintenance nightmare. Recommendation: Pin to specific API versions if available. Implement comprehensive integration tests to detect breaking changes. Create API change monitoring. Build abstraction layer to isolate API changes. Pressure vendors for stability commitment.",
    2: "WARNING: Poor version management requires defensive coding. Recommendation: Implement API version detection and adaptation logic. Build comprehensive regression testing. Create change notification monitoring. Negotiate better deprecation policies with vendors.",
    3: "MODERATE: Moderate stability requires monitoring. Recommendation: Subscribe to API change notifications. Implement version compatibility checks. Build automated testing for version changes. Create version migration procedures.",
    4: "GOOD: Good version control provides stability. Recommendation: Track API versions in use. Implement gradual version migration strategy. Build version compatibility matrix. Monitor deprecation timelines proactively.",
    5: "EXCELLENT: Enterprise stability enables long-term planning. Recommendation: Leverage long-term support for stable implementations. Implement version governance and planning. Focus on feature optimization over compatibility. Use stable platform for innovation."
  },
  
  // Q18: Data sensitivity
  18: {
    1: "CRITICAL: Highly sensitive data requires extensive security. Recommendation: Implement end-to-end encryption (at rest and in transit). Use data masking/tokenization for non-production environments. Conduct security audit before implementation. Ensure HIPAA/PCI compliance. Implement comprehensive audit logging.",
    2: "WARNING: Sensitive data needs strong security controls. Recommendation: Implement field-level encryption for PII. Use role-based access control (RBAC). Create data classification and handling procedures. Implement data loss prevention (DLP) tools. Regular security reviews required.",
    3: "MODERATE: Standard security measures required. Recommendation: Implement encryption in transit (TLS 1.2+). Use secure credential management. Implement access logging and monitoring. Create data retention policies. Conduct periodic security assessments.",
    4: "GOOD: Low sensitivity reduces compliance burden. Recommendation: Implement standard security best practices. Use encrypted connections. Implement basic access controls. Monitor for security anomalies. Focus on operational security.",
    5: "EXCELLENT: Public data minimizes security requirements. Recommendation: Implement basic authentication and access logging. Focus on availability over confidentiality. Use standard cloud security. Optimize for performance and cost over security overhead."
  },
  
  // Q19: Compliance requirements
  19: {
    1: "CRITICAL: Strict compliance requires specialized expertise. Recommendation: Engage compliance/legal team immediately. Hire compliance consultant if needed. Implement BAA (Business Associate Agreement) for HIPAA. Use compliant cloud regions. Conduct regular compliance audits. Budget 6-12 months for compliance certification.",
    2: "WARNING: High compliance needs careful planning. Recommendation: Document compliance requirements and controls. Implement audit trails for all data access. Create compliance monitoring dashboard. Engage compliance team for review and approval. Plan for annual audits.",
    3: "MODERATE: Standard compliance is manageable. Recommendation: Implement GDPR-compliant data processing (consent, right to deletion). Create privacy policy and terms. Implement data subject request procedures. Conduct annual privacy review.",
    4: "GOOD: Basic compliance follows standard practices. Recommendation: Document internal policies and adherence. Implement standard security controls. Create compliance checklist. Conduct periodic self-assessments.",
    5: "EXCELLENT: Minimal compliance accelerates implementation. Recommendation: Implement business-standard security and privacy. Focus on operational efficiency. Document practices for governance. Maintain general best practices."
  },
  
  // Q20: Security approval
  20: {
    1: "CRITICAL: 6+ month approval delays implementation significantly. Recommendation: Start security review process immediately - this is on critical path. Prepare comprehensive security documentation. Consider POC in isolated environment while approval pending. Engage CISO office early. Budget timeline accordingly.",
    2: "WARNING: Long approval requires early planning. Recommendation: Initiate security review in parallel with development. Prepare vendor security assessments. Complete security questionnaires proactively. Schedule regular check-ins with security team. Plan for multiple review cycles.",
    3: "MODERATE: Standard review fits normal timelines. Recommendation: Submit security review request early in project. Prepare standard documentation (architecture diagram, data flow, security controls). Respond promptly to security questions. Build security review time into project plan.",
    4: "GOOD: Quick review supports agile delivery. Recommendation: Follow standard security review process. Prepare lightweight documentation. Leverage pre-approved vendor lists where possible. Maintain good relationship with security team.",
    5: "EXCELLENT: Fast approval enables rapid deployment. Recommendation: Leverage self-service approval processes. Use pre-approved vendors and platforms. Focus on delivery speed. Maintain compliance with security standards for continued self-service access."
  },
  
  // Q21: Data retention
  21: {
    1: "CRITICAL: Long-term retention adds complexity and cost. Recommendation: Implement compliant archival system (AWS Glacier, Azure Archive). Create automated retention policy enforcement. Implement legal hold capabilities. Plan for e-discovery requirements. Budget for long-term storage costs. Ensure tamper-proof audit logs.",
    2: "WARNING: Significant retention requires planning. Recommendation: Implement tiered storage strategy (hot/warm/cold). Create automated archival workflows. Document retention policy and procedures. Implement data lifecycle management. Plan for retrieval processes.",
    3: "MODERATE: Standard retention is manageable. Recommendation: Implement automated data retention policies. Create deletion workflows for expired data. Document retention periods by data type. Implement backup and archival strategy. Monitor storage costs.",
    4: "GOOD: Short retention simplifies management. Recommendation: Implement time-based deletion policies. Create data lifecycle automation. Monitor retention compliance. Focus on operational efficiency over long-term archival.",
    5: "EXCELLENT: Minimal retention reduces overhead. Recommendation: Implement aggressive data cleanup policies. Focus on minimizing storage costs. Use ephemeral data patterns where possible. Optimize for performance over retention."
  }
};
