export interface PIFTranslations {
  sections: {
    processClarity: { name: string; description: string };
    changeMagnitude: { name: string; description: string };
    workflowBrittleness: { name: string; description: string };
    timeSavings: { name: string; description: string };
    revenueUplift: { name: string; description: string };
    experienceInsights: { name: string; description: string };
    timeVolumeData: { name: string; description: string };
    qualityImpactModule: { name: string; description: string };
  };
  questions: {
    [questionId: number]: {
      question: string;
      placeholder?: string;
      options?: {
        [value: string]: {
          label: string;
          description?: string;
        };
      };
    };
  };
  disclaimer: {
    title: string;
    welcome: string;
    paragraph1: string;
    paragraph2: string;
    paragraph3: string;
    paragraph4: string;
    paragraph5: string;
    paragraph6: string;
    checkboxLabel: string;
  };
  respondentInfo: {
    title: string;
    description: string;
    nameLabel: string;
    namePlaceholder: string;
    roleLabel: string;
    rolePlaceholder: string;
    responsibilitiesLabel: string;
    responsibilitiesPlaceholder: string;
  };
  ui: {
    selectLanguage: string;
    title: string;
    section: string;
    of: string;
    complete: string;
    previous: string;
    next: string;
    submitting: string;
    submit: string;
    acceptanceRequired: string;
    acceptanceRequiredDescription: string;
    requiredFields: string;
    requiredFieldsDescription: string;
    requiredQuestions: string;
    requiredQuestionsDescription: string;
    nameRequired: string;
    nameRequiredDescription: string;
    roleRequired: string;
    roleRequiredDescription: string;
    responsibilitiesRequired: string;
    responsibilitiesRequiredDescription: string;
    incompleteSurvey: string;
    incompleteSurveyDescription: string;
    loadingSurvey: string;
    surveyNotFound: string;
    errorLoadingSurvey: string;
    submissionFailed: string;
    thankYouTitle: string;
    thankYouMessage: string;
    closePageMessage: string;
  };
}

export const pifTranslations: { en: PIFTranslations; es: PIFTranslations } = {
  en: {
    sections: {
      processClarity: {
        name: "Process Clarity",
        description: "Help us understand how structured and consistent your work process is so we can identify where AI could provide the most reliable support"
      },
      changeMagnitude: {
        name: "Change Magnitude",
        description: "Share your comfort level with new tools so we can plan the right training and transition approach for you"
      },
      workflowBrittleness: {
        name: "Workflow Brittleness",
        description: "Tell us about challenges you face so we can identify where AI could reduce errors and manual workarounds in your daily work"
      },
      timeSavings: {
        name: "Time Savings",
        description: "Describe the type of work you do so we can accurately estimate how much time AI could save you each week"
      },
      revenueUplift: {
        name: "Revenue Uplift",
        description: "Help us understand if the time you save could create opportunities to generate additional revenue for the business"
      },
      experienceInsights: {
        name: "Your Experience & Insights",
        description: "Share your hands-on knowledge about this process - you're the expert, and your insights are critical for identifying the best automation opportunities"
      },
      timeVolumeData: {
        name: "Time & Volume Data",
        description: "Provide details about how often you perform this work so we can calculate the total time savings and ROI potential"
      },
      qualityImpactModule: {
        name: "Quality Impact Module",
        description: "Tell us about errors or quality issues so we can show how AI could help you produce more accurate, consistent work"
      }
    },
    questions: {
      1: {
        question: "How clearly defined are the steps in this workflow?",
        options: {
          "1": { label: "Not defined at all", description: "Steps vary each time" },
          "2": { label: "Loosely defined", description: "General approach exists" },
          "3": { label: "Moderately defined", description: "Some documentation available" },
          "4": { label: "Well defined", description: "Clear procedures to follow" },
          "5": { label: "Fully standardized and documented", description: "Comprehensive documentation" }
        }
      },
      2: {
        question: "When you perform this process, do you always follow the same sequence of steps?",
        options: {
          "1": { label: "Steps vary each time" },
          "2": { label: "Mostly different, some consistency" },
          "3": { label: "Generally consistent" },
          "4": { label: "Usually the same steps" },
          "5": { label: "Always the same steps" }
        }
      },
      3: {
        question: "Are instructions, templates, or reference materials easily available when you need to perform this task?",
        options: {
          "1": { label: "None available" },
          "2": { label: "Rarely available or outdated" },
          "3": { label: "Sometimes available" },
          "4": { label: "Usually available" },
          "5": { label: "Always accessible and up to date" }
        }
      },
      4: {
        question: "How often do the rules or requirements for this workflow change?",
        options: {
          "1": { label: "Weekly or more often" },
          "2": { label: "Monthly" },
          "3": { label: "Quarterly" },
          "4": { label: "Annually" },
          "5": { label: "Rarely or never" }
        }
      },
      5: {
        question: "How much do you think your daily work would change if parts of this process were automated?",
        options: {
          "1": { label: "Completely different", description: "Significantly evolve my role" },
          "2": { label: "Meaningful change", description: "Develop new capabilities" },
          "3": { label: "Moderate change", description: "Some adaptation required" },
          "4": { label: "Minor change", description: "Slight adjustment" },
          "5": { label: "Almost no change", description: "Business as usual" }
        }
      },
      6: {
        question: "How comfortable do you feel adopting new tools or digital solutions at work?",
        options: {
          "1": { label: "Very uncomfortable", description: "Prefer traditional methods" },
          "2": { label: "Somewhat uncomfortable", description: "Need significant support" },
          "3": { label: "Neutral", description: "Can adapt with guidance" },
          "4": { label: "Comfortable", description: "Quick to learn" },
          "5": { label: "Very comfortable", description: "Early adopter" }
        }
      },
      7: {
        question: "How often do errors, missing data, or inconsistencies occur during this process?",
        options: {
          "1": { label: "Very often", description: "More than 30% of the time" },
          "2": { label: "Often", description: "15-30% of the time" },
          "3": { label: "Sometimes", description: "5-15% of the time" },
          "4": { label: "Rarely", description: "Less than 5%" },
          "5": { label: "Almost never", description: "Exceptional cases only" }
        }
      },
      8: {
        question: "How dependent is this workflow on manual workarounds (e.g., Excel files, copy-paste, manual rework)?",
        options: {
          "1": { label: "Extremely dependent", description: "Cannot function without them" },
          "2": { label: "Very dependent", description: "Frequent workarounds needed" },
          "3": { label: "Moderately dependent", description: "Occasional workarounds" },
          "4": { label: "Slightly dependent", description: "Rare workarounds" },
          "5": { label: "Fully automated or structured", description: "No workarounds needed" }
        }
      },
      9: {
        question: "If something goes wrong, is there a clear way to detect and fix the issue quickly?",
        options: {
          "1": { label: "No process / takes long", description: "Hard to troubleshoot" },
          "2": { label: "Unclear process", description: "Takes significant time" },
          "3": { label: "Some process exists", description: "Moderate effort to fix" },
          "4": { label: "Clear process", description: "Can fix relatively quickly" },
          "5": { label: "Clear and efficient correction process", description: "Fast resolution" }
        }
      },
      10: {
        question: "How consistent are the inputs or requests you receive for this process?",
        options: {
          "1": { label: "Always different", description: "Highly variable" },
          "2": { label: "Mostly different", description: "Significant variation" },
          "3": { label: "Somewhat consistent", description: "Some patterns" },
          "4": { label: "Mostly consistent", description: "Predictable inputs" },
          "5": { label: "Very consistent and predictable", description: "Standardized inputs" }
        }
      },
      11: {
        question: "Which of these best describes the primary work you perform in this step?",
        options: {
          "financial": { label: "Financial Analyst / Strategic Accountant", description: "Finance & Accounting: FP&A Analyst, Financial Controller" },
          "finance_ops": { label: "Accounts Payable / Receivable", description: "Finance & Accounting: AP/AR Clerk, Invoice Processor, Collections Specialist" },
          "sales_ops": { label: "Sales Operations / CRM Administrator", description: "Sales & Customer Operations: Sales Ops Analyst, CRM Specialist, Deal Desk Coordinator" },
          "customer_success": { label: "Customer Success Manager / Analyst", description: "Sales & Customer Operations: Retention Analyst, Account Manager Post-Sale" },
          "support": { label: "Customer Support / Help Desk", description: "Sales & Customer Operations: Tier 1 Support, IT Help Desk, CSR" },
          "procurement": { label: "Procurement / Sourcing Specialist", description: "Operations & Logistics: Purchasing Agent, Vendor Manager, Supply Chain Coordinator" },
          "inventory": { label: "Inventory / Warehouse Coordinator", description: "Operations & Logistics: Inventory Analyst, Stock Controller, Warehouse Admin" },
          "facilities": { label: "Facilities / Operations Coordinator", description: "Operations & Logistics: Facilities Manager, Office Coordinator, Logistics Admin" },
          "hr": { label: "HR Generalist / People Operations", description: "HR & Administration: HR Admin, Payroll Specialist, Benefits Coordinator" },
          "admin": { label: "General Admin / Office Manager", description: "HR & Administration: Office Administrator, Executive Assistant, General Clerk" },
          "it_ops": { label: "IT Operations / Systems Administrator", description: "IT & Data: System Admin, IT Support, Infrastructure Manager" },
          "data_analyst": { label: "Data Analyst / Business Intelligence", description: "IT & Data: BI Analyst, Data Ops, Reporting Specialist" },
          "marketing_ops": { label: "Marketing Operations / Campaign Coordinator", description: "Marketing & Growth: Marketing Ops, Email Campaign Manager, Content Coordinator" },
          "quality_assurance": { label: "Quality Assurance / Process Auditor", description: "Compliance & Quality: QA Specialist, Compliance Auditor, Process Analyst" },
          "legal": { label: "Legal / Compliance / Internal Audit", description: "Compliance & Quality: Compliance Officer, Internal Auditor, Risk Manager" },
          "other": { label: "Other / Unspecified Back-Office Role", description: "Other: Not listed above" }
        }
      },
      12: {
        question: "How complex is the task?",
        options: {
          "simple": { label: "Simple", description: "Examples: Data entry from forms, copy-paste, checklists" },
          "moderate": { label: "Moderate", description: "Examples: Reviewing for completeness, categorizing, troubleshooting" },
          "complex": { label: "Complex", description: "Examples: Financial modeling, technical diagnostics, strategic recommendations" }
        }
      },
      13: {
        question: "How structured is the data you work with?",
        options: {
          "structured": { label: "Highly structured", description: "Examples: CRM entries, Excel spreadsheets, database forms" },
          "semi_structured": { label: "Semi-structured", description: "Examples: Email threads, PDF documents, templated reports" },
          "unstructured": { label: "Unstructured", description: "Examples: Handwritten notes, transcripts, customer feedback, photos" }
        }
      },
      14: {
        question: "What is the relationship between current capacity and available opportunities?",
        options: {
          "high_demand": { label: "High demand with team at/above capacity", description: "Turning away opportunities, clear revenue potential" },
          "strong_pipeline": { label: "Strong pipeline with team near capacity", description: "Could pursue more with freed time" },
          "moderate": { label: "Moderate opportunities with balanced capacity", description: "Some room to grow" },
          "limited": { label: "Limited opportunities or low utilization", description: "Team has spare capacity or demand is constrained" }
        }
      },
      15: {
        question: "How does more time translate to more revenue?",
        options: {
          "direct": { label: "Direct & predictable", description: "Example: More hours = more billable consulting, more service appointments, more deals closed" },
          "somewhat": { label: "Somewhat predictable", description: "Example: More time helps close deals faster or handle more accounts, but other factors also matter" },
          "indirect": { label: "Indirect or complex", description: "Example: Long sales cycles with many stakeholders, revenue depends on market timing, not just time invested" },
          "limited": { label: "Limited by other factors", description: "Example: Can't sell more due to limited inventory, small market, regulatory constraints, or lead availability" }
        }
      },
      17: {
        question: "What specific steps do you personally perform in this workflow?",
        placeholder: "Example: I receive requests via email, verify customer data in CRM, create order in system, send confirmation. Be specific about your actions."
      },
      18: {
        question: "What critical knowledge or expertise is needed to handle this workflow correctly?",
        placeholder: "Example: Understanding company pricing policies, knowing how to interpret technical specifications, familiarity with compliance requirements"
      },
      19: {
        question: "Are there exceptions or special cases you need to watch out for during this process?",
        placeholder: "Example: Urgent requests (2-3 times/week, depend on client escalations), International orders (10% of volume, require tax verification), VIP customers (need director approval)"
      },
      20: {
        question: "What tools or systems do you use most in your daily work?",
        placeholder: "Example: Excel, Google Sheets, ERP, CRM, Email, Slack, internal systems"
      },
      21: {
        question: "What do you find most frustrating or limiting about these tools?",
        placeholder: "Describe the main pain points or limitations you experience"
      },
      22: {
        question: "What are the biggest time-wasters in your current workflow?",
        placeholder: "Describe tasks that take longer than they should"
      },
      23: {
        question: "If you could automate one part of this process, what would it be and why?",
        placeholder: "Describe what you'd automate and the impact it would have"
      },
      24: {
        question: "What do you usually produce or complete at the end of your step?",
        placeholder: "Example: Approved file, completed report, data entry in system, email sent to customer, invoice processed"
      },
      25: {
        question: "What makes this process slow, repetitive, or error-prone in your experience?",
        placeholder: "Describe key difficulties or pain points you encounter"
      },
      26: {
        question: "What happens if this process is delayed or done incorrectly?",
        placeholder: "Describe the business impact of delays or errors"
      },
      27: {
        question: "Is there anything else about this workflow that we should know?",
        placeholder: "Any additional context, edge cases, or important details"
      },
      28: {
        question: "How many employees perform this task?",
        placeholder: "Enter number of employees"
      },
      29: {
        question: "How often is this task performed?",
        options: {
          "daily": { label: "Daily" },
          "weekly": { label: "Weekly" },
          "monthly": { label: "Monthly" }
        }
      },
      30: {
        question: "How many times is this process completed in the selected period?",
        placeholder: "e.g., 5 times per day"
      },
      31: {
        question: "How many minutes does each process take?",
        placeholder: "Enter minutes per process"
      },
      32: {
        question: "Does this workflow have measurable quality impact (errors that cost time or money)?",
        options: {
          "no": { label: "No", description: "Quality impact is not a significant factor" },
          "yes": { label: "Yes", description: "We have measurable quality issues (errors, rework, defects)" }
        }
      },
      33: {
        question: "How often do errors or quality issues currently occur in this process?",
        options: {
          "very_frequent": { label: "Very frequent", description: "Errors occur in more than 30% of cases" },
          "frequent": { label: "Frequent", description: "Errors occur in 15-30% of cases" },
          "occasional": { label: "Occasional", description: "Errors occur in 5-15% of cases" },
          "rare": { label: "Rare", description: "Errors occur in less than 5% of cases" }
        }
      },
      34: {
        question: "What is the primary cause of errors or quality issues?",
        options: {
          "fatigue": { label: "Manual, repetitive work leading to human fatigue or oversight" },
          "missing_info": { label: "Missing or incomplete information when making decisions" },
          "interpretation": { label: "Inconsistent interpretation of rules or standards" },
          "complexity": { label: "High complexity requiring significant expertise or judgment" },
          "communication": { label: "Communication gaps or misunderstandings between people" }
        }
      },
      35: {
        question: "When are errors or quality issues typically discovered?",
        options: {
          "after_delivery": { label: "After delivery to customer", description: "Customer complaints, returns, escalations" },
          "end_process": { label: "At the end of the process", description: "Final review or quality check" },
          "during_process": { label: "During the process", description: "Spotted before completion" },
          "early": { label: "Early in the process", description: "Caught quickly with minimal rework" }
        }
      },
      36: {
        question: "How standardized is the current process?",
        options: {
          "variable": { label: "Highly variable", description: "Each case is handled differently" },
          "guidelines": { label: "Some guidelines", description: "General approach but flexibility in execution" },
          "documented": { label: "Documented process", description: "Clear steps and procedures to follow" },
          "strict": { label: "Strict standards", description: "Detailed rules and quality requirements" }
        }
      },
      37: {
        question: "How well-suited is this work for AI quality improvement?",
        options: {
          "rule_based": { label: "Rule-based decisions", description: "Clear if/then rules that can be programmed" },
          "pattern": { label: "Pattern recognition", description: "AI can learn from examples and spot patterns" },
          "contextual": { label: "Contextual judgment", description: "Requires understanding context and nuance" },
          "subjective": { label: "Highly subjective", description: "Depends heavily on personal opinion or taste" }
        }
      },
      38: {
        question: "What is the current error rate?",
        placeholder: "Enter percentage (e.g., 15 for 15%)"
      },
      39: {
        question: "How many minutes of rework does each error require?",
        placeholder: "Enter minutes per error"
      },
      40: {
        question: "What is the estimated cost per error (in USD)?",
        placeholder: "Enter cost in USD (e.g., 50)"
      }
    },
    disclaimer: {
      title: "Welcome to the Process Insight Form",
      welcome: "Welcome to the Process Insight Form",
      paragraph1: "This form is part of Automat-IA's diagnostic process for identifying workflows that can benefit from artificial intelligence (AI) implementations.",
      paragraph2: "Its purpose is to collect your direct insights about how specific tasks are currently performed — including time spent, frequency, and common challenges — so we can model realistic improvements and prioritize solutions that truly make your work easier.",
      paragraph3: "AI at Automat-IA is not about replacing people. It's about augmenting human work — reducing repetitive tasks, minimizing errors, and freeing time for higher-value activities.",
      paragraph4: "Your input is essential to ensure any AI solution we propose genuinely supports you and your team.",
      paragraph5: "All information you share will be treated as confidential, used only for analysis within the current project between Automat-IA and your company, and aggregated where possible before inclusion in any report. It will never be used to evaluate individual performance or shared outside this collaboration.",
      paragraph6: "There are no right or wrong answers — we're looking for realism, not perfection.",
      checkboxLabel: "I understand and agree to proceed with the survey"
    },
    respondentInfo: {
      title: "About You",
      description: "Your insights about this workflow are valuable. Please tell us about yourself and your experience with this process.",
      nameLabel: "Your Name",
      namePlaceholder: "Enter your full name",
      roleLabel: "Your Role / Job Title",
      rolePlaceholder: "e.g., Customer Service Representative, Accounts Payable Clerk",
      responsibilitiesLabel: "What are your main responsibilities in this workflow?",
      responsibilitiesPlaceholder: "Briefly describe what you do in this process and how often you perform these tasks"
    },
    ui: {
      selectLanguage: "Select Language",
      title: "Process Insight Form",
      section: "Section",
      of: "of",
      complete: "complete",
      previous: "Previous",
      next: "Next",
      submitting: "Submitting...",
      submit: "Submit Survey",
      acceptanceRequired: "Acceptance required",
      acceptanceRequiredDescription: "Please check 'I understand' to continue.",
      requiredFields: "Required fields",
      requiredFieldsDescription: "Please enter your name, role, and responsibilities before continuing.",
      requiredQuestions: "Required questions",
      requiredQuestionsDescription: "Please answer all required questions in this section before continuing.",
      nameRequired: "Name required",
      nameRequiredDescription: "Please enter your name before submitting.",
      roleRequired: "Role required",
      roleRequiredDescription: "Please enter your role before submitting.",
      responsibilitiesRequired: "Responsibilities required",
      responsibilitiesRequiredDescription: "Please describe your responsibilities before submitting.",
      incompleteSurvey: "Incomplete survey",
      incompleteSurveyDescription: "Please answer all required questions.",
      loadingSurvey: "Loading survey...",
      surveyNotFound: "Survey not found",
      errorLoadingSurvey: "Error loading survey",
      submissionFailed: "Submission failed",
      thankYouTitle: "Thank you for your input!",
      thankYouMessage: "Your responses have been successfully submitted and will help us better understand this workflow.",
      closePageMessage: "You can safely close this page now."
    }
  },
  es: {
    sections: {
      processClarity: {
        name: "Claridad del Proceso",
        description: "Ayúdenos a comprender qué tan estructurado y consistente es su proceso de trabajo para que podamos identificar dónde la IA podría brindar el soporte más confiable"
      },
      changeMagnitude: {
        name: "Magnitud del Cambio",
        description: "Comparta su nivel de comodidad con nuevas herramientas para que podamos planificar el enfoque de capacitación y transición adecuado para usted"
      },
      workflowBrittleness: {
        name: "Fragilidad del Flujo de Trabajo",
        description: "Cuéntenos sobre los desafíos que enfrenta para que podamos identificar dónde la IA podría reducir errores y soluciones manuales en su trabajo diario"
      },
      timeSavings: {
        name: "Ahorro de Tiempo",
        description: "Describa el tipo de trabajo que realiza para que podamos estimar con precisión cuánto tiempo podría ahorrarle la IA cada semana"
      },
      revenueUplift: {
        name: "Incremento de Ingresos",
        description: "Ayúdenos a comprender si el tiempo que ahorra podría crear oportunidades para generar ingresos adicionales para el negocio"
      },
      experienceInsights: {
        name: "Su Experiencia y Conocimientos",
        description: "Comparta su conocimiento práctico sobre este proceso: usted es el experto y sus conocimientos son fundamentales para identificar las mejores oportunidades de automatización"
      },
      timeVolumeData: {
        name: "Datos de Tiempo y Volumen",
        description: "Proporcione detalles sobre con qué frecuencia realiza este trabajo para que podamos calcular el ahorro total de tiempo y el potencial de ROI"
      },
      qualityImpactModule: {
        name: "Módulo de Impacto en la Calidad",
        description: "Cuéntenos sobre errores o problemas de calidad para que podamos mostrar cómo la IA podría ayudarle a producir un trabajo más preciso y consistente"
      }
    },
    questions: {
      1: {
        question: "¿Qué tan claramente definidos están los pasos en este flujo de trabajo?",
        options: {
          "1": { label: "No definidos en absoluto", description: "Los pasos varían cada vez" },
          "2": { label: "Vagamente definidos", description: "Existe un enfoque general" },
          "3": { label: "Moderadamente definidos", description: "Hay algo de documentación disponible" },
          "4": { label: "Bien definidos", description: "Procedimientos claros a seguir" },
          "5": { label: "Completamente estandarizados y documentados", description: "Documentación completa" }
        }
      },
      2: {
        question: "Cuando realiza este proceso, ¿siempre sigue la misma secuencia de pasos?",
        options: {
          "1": { label: "Los pasos varían cada vez" },
          "2": { label: "Mayormente diferentes, algo de consistencia" },
          "3": { label: "Generalmente consistente" },
          "4": { label: "Usualmente los mismos pasos" },
          "5": { label: "Siempre los mismos pasos" }
        }
      },
      3: {
        question: "¿Están las instrucciones, plantillas o materiales de referencia fácilmente disponibles cuando necesita realizar esta tarea?",
        options: {
          "1": { label: "Ninguno disponible" },
          "2": { label: "Raramente disponibles o desactualizados" },
          "3": { label: "A veces disponibles" },
          "4": { label: "Usualmente disponibles" },
          "5": { label: "Siempre accesibles y actualizados" }
        }
      },
      4: {
        question: "¿Con qué frecuencia cambian las reglas o requisitos de este flujo de trabajo?",
        options: {
          "1": { label: "Semanalmente o más frecuente" },
          "2": { label: "Mensualmente" },
          "3": { label: "Trimestralmente" },
          "4": { label: "Anualmente" },
          "5": { label: "Rara vez o nunca" }
        }
      },
      5: {
        question: "¿Cuánto cree que cambiaría su trabajo diario si se automatizaran partes de este proceso?",
        options: {
          "1": { label: "Completamente diferente", description: "Evolucionar significativamente mi rol" },
          "2": { label: "Cambio significativo", description: "Desarrollar nuevas capacidades" },
          "3": { label: "Cambio moderado", description: "Se requiere algo de adaptación" },
          "4": { label: "Cambio menor", description: "Ajuste ligero" },
          "5": { label: "Casi ningún cambio", description: "Todo normal" }
        }
      },
      6: {
        question: "¿Qué tan cómodo se siente adoptando nuevas herramientas o soluciones digitales en el trabajo?",
        options: {
          "1": { label: "Muy incómodo", description: "Prefiero métodos tradicionales" },
          "2": { label: "Algo incómodo", description: "Necesito apoyo significativo" },
          "3": { label: "Neutral", description: "Puedo adaptarme con orientación" },
          "4": { label: "Cómodo", description: "Aprendo rápido" },
          "5": { label: "Muy cómodo", description: "Adoptador temprano" }
        }
      },
      7: {
        question: "¿Con qué frecuencia ocurren errores, datos faltantes o inconsistencias durante este proceso?",
        options: {
          "1": { label: "Muy frecuentemente", description: "Más del 30% del tiempo" },
          "2": { label: "Frecuentemente", description: "15-30% del tiempo" },
          "3": { label: "A veces", description: "5-15% del tiempo" },
          "4": { label: "Rara vez", description: "Menos del 5%" },
          "5": { label: "Casi nunca", description: "Solo casos excepcionales" }
        }
      },
      8: {
        question: "¿Qué tan dependiente es este flujo de trabajo de soluciones manuales (ej. archivos Excel, copiar-pegar, retrabajo manual)?",
        options: {
          "1": { label: "Extremadamente dependiente", description: "No puede funcionar sin ellas" },
          "2": { label: "Muy dependiente", description: "Se necesitan soluciones frecuentes" },
          "3": { label: "Moderadamente dependiente", description: "Soluciones ocasionales" },
          "4": { label: "Ligeramente dependiente", description: "Soluciones raras" },
          "5": { label: "Totalmente automatizado o estructurado", description: "No se necesitan soluciones" }
        }
      },
      9: {
        question: "Si algo sale mal, ¿hay una forma clara de detectar y solucionar el problema rápidamente?",
        options: {
          "1": { label: "Sin proceso / toma mucho tiempo", description: "Difícil de solucionar" },
          "2": { label: "Proceso poco claro", description: "Toma tiempo significativo" },
          "3": { label: "Existe algún proceso", description: "Esfuerzo moderado para solucionar" },
          "4": { label: "Proceso claro", description: "Se puede solucionar relativamente rápido" },
          "5": { label: "Proceso de corrección claro y eficiente", description: "Resolución rápida" }
        }
      },
      10: {
        question: "¿Qué tan consistentes son las entradas o solicitudes que recibe para este proceso?",
        options: {
          "1": { label: "Siempre diferentes", description: "Altamente variable" },
          "2": { label: "Mayormente diferentes", description: "Variación significativa" },
          "3": { label: "Algo consistente", description: "Algunos patrones" },
          "4": { label: "Mayormente consistente", description: "Entradas predecibles" },
          "5": { label: "Muy consistente y predecible", description: "Entradas estandarizadas" }
        }
      },
      11: {
        question: "¿Cuál de estas opciones describe mejor el trabajo principal que realiza en este paso?",
        options: {
          "financial": { label: "Analista Financiero / Contador Estratégico", description: "Finanzas y Contabilidad: Analista FP&A, Controlador Financiero" },
          "finance_ops": { label: "Cuentas por Pagar / Cobrar", description: "Finanzas y Contabilidad: Auxiliar AP/AR, Procesador de Facturas, Especialista en Cobranzas" },
          "sales_ops": { label: "Operaciones de Ventas / Administrador de CRM", description: "Ventas y Operaciones con Clientes: Analista de Ops de Ventas, Especialista CRM, Coordinador de Acuerdos" },
          "customer_success": { label: "Gerente / Analista de Éxito del Cliente", description: "Ventas y Operaciones con Clientes: Analista de Retención, Gerente de Cuenta Post-Venta" },
          "support": { label: "Soporte al Cliente / Mesa de Ayuda", description: "Ventas y Operaciones con Clientes: Soporte Nivel 1, Mesa de Ayuda IT, CSR" },
          "procurement": { label: "Especialista en Adquisiciones / Abastecimiento", description: "Operaciones y Logística: Agente de Compras, Gerente de Proveedores, Coordinador de Cadena de Suministro" },
          "inventory": { label: "Coordinador de Inventario / Almacén", description: "Operaciones y Logística: Analista de Inventario, Controlador de Stock, Administrador de Almacén" },
          "facilities": { label: "Coordinador de Instalaciones / Operaciones", description: "Operaciones y Logística: Gerente de Instalaciones, Coordinador de Oficina, Administrador de Logística" },
          "hr": { label: "Generalista de RH / Operaciones de Personal", description: "RH y Administración: Admin de RH, Especialista en Nómina, Coordinador de Beneficios" },
          "admin": { label: "Administrador General / Gerente de Oficina", description: "RH y Administración: Administrador de Oficina, Asistente Ejecutivo, Auxiliar General" },
          "it_ops": { label: "Operaciones de TI / Administrador de Sistemas", description: "TI y Datos: Administrador de Sistemas, Soporte TI, Gerente de Infraestructura" },
          "data_analyst": { label: "Analista de Datos / Inteligencia de Negocios", description: "TI y Datos: Analista BI, Operaciones de Datos, Especialista en Reportes" },
          "marketing_ops": { label: "Operaciones de Marketing / Coordinador de Campañas", description: "Marketing y Crecimiento: Ops de Marketing, Gerente de Campañas de Email, Coordinador de Contenido" },
          "quality_assurance": { label: "Aseguramiento de Calidad / Auditor de Procesos", description: "Cumplimiento y Calidad: Especialista QA, Auditor de Cumplimiento, Analista de Procesos" },
          "legal": { label: "Legal / Cumplimiento / Auditoría Interna", description: "Cumplimiento y Calidad: Oficial de Cumplimiento, Auditor Interno, Gerente de Riesgos" },
          "other": { label: "Otro / Rol de Back-Office No Especificado", description: "Otro: No listado arriba" }
        }
      },
      12: {
        question: "¿Qué tan compleja es la tarea?",
        options: {
          "simple": { label: "Simple", description: "Ejemplos: Entrada de datos de formularios, copiar-pegar, listas de verificación" },
          "moderate": { label: "Moderada", description: "Ejemplos: Revisar completitud, categorizar, solución de problemas" },
          "complex": { label: "Compleja", description: "Ejemplos: Modelado financiero, diagnósticos técnicos, recomendaciones estratégicas" }
        }
      },
      13: {
        question: "¿Qué tan estructurados están los datos con los que trabaja?",
        options: {
          "structured": { label: "Altamente estructurados", description: "Ejemplos: Entradas de CRM, hojas de cálculo Excel, formularios de base de datos" },
          "semi_structured": { label: "Semi-estructurados", description: "Ejemplos: Hilos de correo electrónico, documentos PDF, reportes con plantilla" },
          "unstructured": { label: "No estructurados", description: "Ejemplos: Notas manuscritas, transcripciones, retroalimentación de clientes, fotos" }
        }
      },
      14: {
        question: "¿Cuál es la relación entre la capacidad actual y las oportunidades disponibles?",
        options: {
          "high_demand": { label: "Alta demanda con equipo a/sobre capacidad", description: "Rechazando oportunidades, potencial de ingresos claro" },
          "strong_pipeline": { label: "Pipeline fuerte con equipo cerca de capacidad", description: "Podría perseguir más con tiempo liberado" },
          "moderate": { label: "Oportunidades moderadas con capacidad equilibrada", description: "Algo de espacio para crecer" },
          "limited": { label: "Oportunidades limitadas o baja utilización", description: "El equipo tiene capacidad de sobra o la demanda está limitada" }
        }
      },
      15: {
        question: "¿Cómo se traduce más tiempo en más ingresos?",
        options: {
          "direct": { label: "Directo y predecible", description: "Ejemplo: Más horas = más consultoría facturable, más citas de servicio, más acuerdos cerrados" },
          "somewhat": { label: "Algo predecible", description: "Ejemplo: Más tiempo ayuda a cerrar acuerdos más rápido o manejar más cuentas, pero otros factores también importan" },
          "indirect": { label: "Indirecto o complejo", description: "Ejemplo: Ciclos de venta largos con muchas partes interesadas, los ingresos dependen del timing del mercado, no solo del tiempo invertido" },
          "limited": { label: "Limitado por otros factores", description: "Ejemplo: No se puede vender más debido a inventario limitado, mercado pequeño, restricciones regulatorias o disponibilidad de clientes potenciales" }
        }
      },
      17: {
        question: "¿Qué pasos específicos realiza personalmente en este flujo de trabajo?",
        placeholder: "Ejemplo: Recibo solicitudes por correo electrónico, verifico datos del cliente en CRM, creo pedido en el sistema, envío confirmación. Sea específico sobre sus acciones."
      },
      18: {
        question: "¿Qué conocimiento crítico o experiencia se necesita para manejar este flujo de trabajo correctamente?",
        placeholder: "Ejemplo: Comprender las políticas de precios de la empresa, saber cómo interpretar especificaciones técnicas, familiaridad con requisitos de cumplimiento"
      },
      19: {
        question: "¿Hay excepciones o casos especiales que debe tener en cuenta durante este proceso?",
        placeholder: "Ejemplo: Solicitudes urgentes (2-3 veces/semana, dependen de escalaciones de clientes), Pedidos internacionales (10% del volumen, requieren verificación fiscal), Clientes VIP (necesitan aprobación del director)"
      },
      20: {
        question: "¿Qué herramientas o sistemas utiliza más en su trabajo diario?",
        placeholder: "Ejemplo: Excel, Google Sheets, ERP, CRM, Email, Slack, sistemas internos"
      },
      21: {
        question: "¿Qué encuentra más frustrante o limitante sobre estas herramientas?",
        placeholder: "Describa los principales puntos de dolor o limitaciones que experimenta"
      },
      22: {
        question: "¿Cuáles son los mayores desperdicios de tiempo en su flujo de trabajo actual?",
        placeholder: "Describa tareas que toman más tiempo del que deberían"
      },
      23: {
        question: "Si pudiera automatizar una parte de este proceso, ¿cuál sería y por qué?",
        placeholder: "Describa qué automatizaría y el impacto que tendría"
      },
      24: {
        question: "¿Qué produce o completa usualmente al final de su paso?",
        placeholder: "Ejemplo: Archivo aprobado, reporte completado, entrada de datos en sistema, correo enviado al cliente, factura procesada"
      },
      25: {
        question: "¿Qué hace que este proceso sea lento, repetitivo o propenso a errores en su experiencia?",
        placeholder: "Describa las dificultades clave o puntos de dolor que encuentra"
      },
      26: {
        question: "¿Qué sucede si este proceso se retrasa o se hace incorrectamente?",
        placeholder: "Describa el impacto comercial de retrasos o errores"
      },
      27: {
        question: "¿Hay algo más sobre este flujo de trabajo que debamos saber?",
        placeholder: "Cualquier contexto adicional, casos extremos o detalles importantes"
      },
      28: {
        question: "¿Cuántos empleados realizan esta tarea?",
        placeholder: "Ingrese el número de empleados"
      },
      29: {
        question: "¿Con qué frecuencia se realiza esta tarea?",
        options: {
          "daily": { label: "Diariamente" },
          "weekly": { label: "Semanalmente" },
          "monthly": { label: "Mensualmente" }
        }
      },
      30: {
        question: "¿Cuántas veces se completa este proceso en el período seleccionado?",
        placeholder: "ej., 5 veces por día"
      },
      31: {
        question: "¿Cuántos minutos toma cada proceso?",
        placeholder: "Ingrese minutos por proceso"
      },
      32: {
        question: "¿Este flujo de trabajo tiene un impacto medible en la calidad (errores que cuestan tiempo o dinero)?",
        options: {
          "no": { label: "No", description: "El impacto en la calidad no es un factor significativo" },
          "yes": { label: "Sí", description: "Tenemos problemas de calidad medibles (errores, retrabajo, defectos)" }
        }
      },
      33: {
        question: "¿Con qué frecuencia ocurren actualmente errores o problemas de calidad en este proceso?",
        options: {
          "very_frequent": { label: "Muy frecuente", description: "Los errores ocurren en más del 30% de los casos" },
          "frequent": { label: "Frecuente", description: "Los errores ocurren en el 15-30% de los casos" },
          "occasional": { label: "Ocasional", description: "Los errores ocurren en el 5-15% de los casos" },
          "rare": { label: "Raro", description: "Los errores ocurren en menos del 5% de los casos" }
        }
      },
      34: {
        question: "¿Cuál es la causa principal de los errores o problemas de calidad?",
        options: {
          "fatigue": { label: "Trabajo manual repetitivo que lleva a fatiga u omisión humana" },
          "missing_info": { label: "Información faltante o incompleta al tomar decisiones" },
          "interpretation": { label: "Interpretación inconsistente de reglas o estándares" },
          "complexity": { label: "Alta complejidad que requiere experiencia o juicio significativo" },
          "communication": { label: "Brechas de comunicación o malentendidos entre personas" }
        }
      },
      35: {
        question: "¿Cuándo se descubren típicamente los errores o problemas de calidad?",
        options: {
          "after_delivery": { label: "Después de la entrega al cliente", description: "Quejas de clientes, devoluciones, escalaciones" },
          "end_process": { label: "Al final del proceso", description: "Revisión final o control de calidad" },
          "during_process": { label: "Durante el proceso", description: "Detectado antes de completarse" },
          "early": { label: "Temprano en el proceso", description: "Capturado rápidamente con retrabajo mínimo" }
        }
      },
      36: {
        question: "¿Qué tan estandarizado está el proceso actual?",
        options: {
          "variable": { label: "Altamente variable", description: "Cada caso se maneja de manera diferente" },
          "guidelines": { label: "Algunas pautas", description: "Enfoque general pero flexibilidad en la ejecución" },
          "documented": { label: "Proceso documentado", description: "Pasos y procedimientos claros a seguir" },
          "strict": { label: "Estándares estrictos", description: "Reglas detalladas y requisitos de calidad" }
        }
      },
      37: {
        question: "¿Qué tipo de trabajo describe mejor este proceso?",
        options: {
          "rule_based": { label: "Decisiones basadas en reglas", description: "Reglas claras de si/entonces" },
          "pattern": { label: "Reconocimiento de patrones", description: "Identificar similitudes o tendencias" },
          "contextual": { label: "Juicio contextual", description: "Requiere comprender situaciones únicas" },
          "subjective": { label: "Altamente subjetivo", description: "Basado en opinión personal o preferencias" }
        }
      },
      38: {
        question: "¿Cuál es la tasa de error actual?",
        placeholder: "Ingrese porcentaje (ej., 15 para 15%)"
      },
      39: {
        question: "¿Cuántos minutos de retrabajo requiere cada error?",
        placeholder: "Ingrese minutos por error"
      },
      40: {
        question: "¿Cuál es el costo estimado por error (en USD)?",
        placeholder: "Ingrese costo en USD (ej., 50)"
      }
    },
    disclaimer: {
      title: "Bienvenido al Formulario de Conocimientos del Proceso",
      welcome: "Bienvenido al Formulario de Conocimientos del Proceso",
      paragraph1: "Este formulario es parte del proceso de diagnóstico de Automat-IA para identificar flujos de trabajo que pueden beneficiarse de implementaciones de inteligencia artificial (IA).",
      paragraph2: "Su propósito es recopilar sus conocimientos directos sobre cómo se realizan actualmente las tareas específicas, incluido el tiempo dedicado, la frecuencia y los desafíos comunes, para que podamos modelar mejoras realistas y priorizar soluciones que realmente faciliten su trabajo.",
      paragraph3: "La IA en Automat-IA no se trata de reemplazar personas. Se trata de aumentar el trabajo humano: reducir tareas repetitivas, minimizar errores y liberar tiempo para actividades de mayor valor.",
      paragraph4: "Su aportación es esencial para garantizar que cualquier solución de IA que propongamos realmente lo apoye a usted y a su equipo.",
      paragraph5: "Toda la información que comparta se tratará como confidencial, se utilizará solo para análisis dentro del proyecto actual entre Automat-IA y su empresa, y se agregará cuando sea posible antes de su inclusión en cualquier informe. Nunca se utilizará para evaluar el desempeño individual ni se compartirá fuera de esta colaboración.",
      paragraph6: "No hay respuestas correctas o incorrectas: buscamos realismo, no perfección.",
      checkboxLabel: "Entiendo y acepto continuar con la encuesta"
    },
    respondentInfo: {
      title: "Acerca de Usted",
      description: "Sus conocimientos sobre este flujo de trabajo son valiosos. Por favor, cuéntenos sobre usted y su experiencia con este proceso.",
      nameLabel: "Su Nombre",
      namePlaceholder: "Ingrese su nombre completo",
      roleLabel: "Su Rol / Título del Puesto",
      rolePlaceholder: "ej., Representante de Servicio al Cliente, Auxiliar de Cuentas por Pagar",
      responsibilitiesLabel: "¿Cuáles son sus principales responsabilidades en este flujo de trabajo?",
      responsibilitiesPlaceholder: "Describa brevemente qué hace en este proceso y con qué frecuencia realiza estas tareas"
    },
    ui: {
      selectLanguage: "Seleccionar Idioma",
      title: "Formulario de Conocimientos del Proceso",
      section: "Sección",
      of: "de",
      complete: "completo",
      previous: "Anterior",
      next: "Siguiente",
      submitting: "Enviando...",
      submit: "Enviar Encuesta",
      acceptanceRequired: "Se requiere aceptación",
      acceptanceRequiredDescription: "Por favor, marque 'Entiendo' para continuar.",
      requiredFields: "Campos requeridos",
      requiredFieldsDescription: "Por favor, ingrese su nombre, rol y responsabilidades antes de continuar.",
      requiredQuestions: "Preguntas requeridas",
      requiredQuestionsDescription: "Por favor, responda todas las preguntas requeridas en esta sección antes de continuar.",
      nameRequired: "Nombre requerido",
      nameRequiredDescription: "Por favor, ingrese su nombre antes de enviar.",
      roleRequired: "Rol requerido",
      roleRequiredDescription: "Por favor, ingrese su rol antes de enviar.",
      responsibilitiesRequired: "Responsabilidades requeridas",
      responsibilitiesRequiredDescription: "Por favor, describa sus responsabilidades antes de enviar.",
      incompleteSurvey: "Encuesta incompleta",
      incompleteSurveyDescription: "Por favor, responda todas las preguntas requeridas.",
      loadingSurvey: "Cargando encuesta...",
      surveyNotFound: "Encuesta no encontrada",
      errorLoadingSurvey: "Error al cargar la encuesta",
      submissionFailed: "Envío fallido",
      thankYouTitle: "¡Gracias por tu aportación!",
      thankYouMessage: "Tus respuestas han sido enviadas exitosamente y nos ayudarán a comprender mejor este flujo de trabajo.",
      closePageMessage: "Ahora puedes cerrar esta página de forma segura."
    }
  }
};
