export interface TFATranslations {
  sections: {
    systemEnvironment: { name: string; description: string };
    dataQuality: { name: string; description: string };
    integrationFeasibility: { name: string; description: string };
    securityCompliance: { name: string; description: string };
  };
  questions: {
    [questionId: number]: {
      question: string;
      options: {
        [value: string]: {
          label: string;
          description: string;
        };
      };
    };
  };
  gapMetadata: {
    whyCantAnswer: string;
    whoMightKnow: string;
  };
  ui: {
    selectLanguage: string;
    title: string;
    aboutAssessment: string;
    aboutDescription: string;
    importantNotice: string;
    progress: string;
    yourName: string;
    enterFullName: string;
    nameHelperText: string;
    pleaseEnterNameBeforeSubmitting: string;
    section: string;
    knowledgeGapDetails: string;
    knowledgeGapDescription: string;
    question: string;
    additionalComments: string;
    additionalCommentsDescription: string;
    commentsOptional: string;
    commentsPlaceholder: string;
    previous: string;
    next: string;
    submitting: string;
    submitAssessment: string;
    nameRequired: string;
    nameRequiredDescription: string;
    requiredQuestions: string;
    requiredQuestionsDescription: string;
    incompleteAssessment: string;
    incompleteAssessmentDescription: string;
    gapDetailsRequired: string;
    gapDetailsRequiredDescription: string;
    loadingAssessment: string;
    assessmentNotFound: string;
    errorLoadingAssessment: string;
    submissionFailed: string;
    dontKnowGapPlaceholder: string;
    whoMightKnowPlaceholder: string;
  };
}

export const tfaTranslations: { en: TFATranslations; es: TFATranslations } = {
  en: {
    sections: {
      systemEnvironment: {
        name: "System Environment",
        description: "Help us understand your technical infrastructure so we can recommend AI solutions that integrate smoothly with your existing systems"
      },
      dataQuality: {
        name: "Data Quality",
        description: "Share details about your data so we can determine if you have the necessary foundation for reliable AI performance"
      },
      integrationFeasibility: {
        name: "Integration Feasibility",
        description: "Tell us about your system connectivity so we can assess integration complexity and plan the technical implementation path"
      },
      securityCompliance: {
        name: "Security/Compliance",
        description: "Provide information about your security and compliance requirements so we can ensure AI solutions meet your organization's standards"
      }
    },
    questions: {
      1: {
        question: "Deployment model: How are the main systems for this workflow deployed?",
        options: {
          "1": { label: "Legacy on-premises only", description: "Mainframe, physical servers, no cloud access" },
          "2": { label: "Mostly on-premises, some cloud", description: "Traditional data centers with limited cloud services" },
          "3": { label: "Mixed hybrid environment", description: "Combination of on-prem and cloud, some integration exists" },
          "4": { label: "Mostly cloud SaaS", description: "Salesforce, Microsoft 365, some legacy systems remain" },
          "5": { label: "Modern cloud SaaS only", description: "100% cloud-based systems (AWS, Azure, Google Cloud)" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      2: {
        question: "Can these systems send and receive data automatically with other software? (via APIs, webhooks, or similar interfaces)",
        options: {
          "1": { label: "No APIs available", description: "Manual exports only, screen scraping required" },
          "2": { label: "Limited or legacy APIs", description: "Old SOAP endpoints, limited documentation" },
          "3": { label: "Some modern APIs available", description: "Mix of REST and legacy, partial coverage" },
          "4": { label: "Good API coverage", description: "Well-documented REST APIs for most functions" },
          "5": { label: "Comprehensive modern APIs", description: "Full REST/GraphQL, webhooks, real-time updates" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      3: {
        question: "Can bots or automation connect to these systems without someone logging in manually?",
        options: {
          "1": { label: "No programmatic access", description: "UI-only, requires manual interaction" },
          "2": { label: "Very limited access", description: "Database-level access only, no application APIs" },
          "3": { label: "Moderate access with workarounds", description: "RPA/scripting possible but not officially supported" },
          "4": { label: "Good programmatic access", description: "Service accounts, API keys, OAuth supported" },
          "5": { label: "Full programmatic access", description: "Native automation support, SDKs available" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      4: {
        question: "How fast and reliable are these systems in day-to-day use?",
        options: {
          "1": { label: "Frequent failures or timeouts", description: "Systems often down, >10 second response times" },
          "2": { label: "Below average performance", description: "Regular slowdowns, 5-10 second responses, occasional outages" },
          "3": { label: "Acceptable performance", description: "2-5 second responses, 95% uptime" },
          "4": { label: "Good performance", description: "<2 second responses, 99% uptime" },
          "5": { label: "Excellent performance", description: "Sub-second responses, 99.9%+ uptime, high availability" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      5: {
        question: "If something breaks in an automated process, will we know and be alerted?",
        options: {
          "1": { label: "No monitoring", description: "No logs, no visibility into system operations" },
          "2": { label: "Basic logging only", description: "System logs exist but hard to access or search" },
          "3": { label: "Standard monitoring", description: "Basic dashboards, manual log review needed" },
          "4": { label: "Good monitoring", description: "Centralized logging, alerting, basic dashboards" },
          "5": { label: "Advanced observability", description: "Real-time monitoring, automated alerts, detailed analytics" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      6: {
        question: "How quickly can these systems be restored if something goes wrong?",
        options: {
          "1": { label: "No backup strategy", description: "No backups, data loss would be catastrophic" },
          "2": { label: "Minimal backups", description: "Irregular backups, long recovery time (days)" },
          "3": { label: "Basic backup system", description: "Daily backups, recovery time 4-24 hours" },
          "4": { label: "Good backup system", description: "Hourly backups, point-in-time recovery, < 4 hour RTO" },
          "5": { label: "Enterprise disaster recovery", description: "Real-time replication, automated failover, < 1 hour RTO" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      7: {
        question: "Data structure: How structured and consistent is the input data for this workflow?",
        options: {
          "1": { label: "Highly unstructured", description: "Free-form text, emails, scanned documents" },
          "2": { label: "Mostly unstructured", description: "PDFs, Word docs with inconsistent formats" },
          "3": { label: "Semi-structured", description: "Excel files with varying columns, some templates" },
          "4": { label: "Mostly structured", description: "Database tables, CSV files with standard schema" },
          "5": { label: "Fully structured", description: "Standardized JSON/XML, database with strict schema" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      8: {
        question: "Data quality: How accurate and complete is the data typically? (Consider missing fields, errors, duplicates)",
        options: {
          "1": { label: "Poor quality, frequent errors", description: "20%+ error rate, many missing required fields" },
          "2": { label: "Below average quality", description: "10-20% errors, regular cleanup required" },
          "3": { label: "Acceptable quality", description: "5-10% errors, manageable with validation" },
          "4": { label: "Good quality", description: "1-5% errors, mostly complete records" },
          "5": { label: "Excellent quality", description: "<1% errors, validated data with mandatory fields" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      9: {
        question: "Is there enough past data to train automation or AI to work reliably?",
        options: {
          "1": { label: "No historical data", description: "New process, less than 100 records" },
          "2": { label: "Very limited data", description: "100-1,000 records, insufficient for training" },
          "3": { label: "Some historical data", description: "1,000-10,000 records, minimal patterns" },
          "4": { label: "Good historical data", description: "10,000-100,000 records, clear patterns" },
          "5": { label: "Extensive historical data", description: "100,000+ records, rich training examples" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      10: {
        question: "Data consistency: How consistent is the data format and values across different sources and time periods?",
        options: {
          "1": { label: "Highly inconsistent", description: "Different formats per source, conflicting values, no standards" },
          "2": { label: "Mostly inconsistent", description: "Frequent format variations, manual mapping needed" },
          "3": { label: "Moderately consistent", description: "Some standardization exists, occasional mismatches" },
          "4": { label: "Mostly consistent", description: "Well-defined standards, minor variations" },
          "5": { label: "Fully consistent", description: "Single source of truth, enforced data standards" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      11: {
        question: "Data validation: Are there validation rules and error handling mechanisms in place for incoming data?",
        options: {
          "1": { label: "No validation", description: "Any data accepted, no checks or error handling" },
          "2": { label: "Minimal validation", description: "Basic type checks only, errors cause failures" },
          "3": { label: "Moderate validation", description: "Some business rules enforced, basic error logging" },
          "4": { label: "Strong validation", description: "Comprehensive rules, error handling with retry logic" },
          "5": { label: "Robust validation framework", description: "Multi-layer validation, automated correction, detailed error tracking" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      12: {
        question: "How many different systems are involved in this workflow? (More systems = harder to automate)",
        options: {
          "1": { label: "10+ systems", description: "Highly complex integration landscape" },
          "2": { label: "6-9 systems", description: "Multiple touchpoints across departments" },
          "3": { label: "3-5 systems", description: "Several key systems (e.g., CRM + ERP + email)" },
          "4": { label: "2 systems", description: "Simple point-to-point integration" },
          "5": { label: "Single system", description: "All data within one platform" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      13: {
        question: "Authentication: How complex is the authentication/authorization setup for system access?",
        options: {
          "1": { label: "Very complex or custom", description: "Proprietary auth, multiple MFA layers, manual approvals" },
          "2": { label: "Complex multi-factor", description: "SAML with complex roles, frequent re-auth" },
          "3": { label: "Moderate complexity", description: "Standard SSO with some permission complexity" },
          "4": { label: "Standard OAuth/SSO", description: "OAuth 2.0, Microsoft/Google SSO" },
          "5": { label: "Simple API keys", description: "Long-lived API tokens, straightforward permissions" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      14: {
        question: "API rate limits: Are there rate limiting or throttling restrictions that could impact automation throughput?",
        options: {
          "1": { label: "Severe restrictions", description: "Very low limits (10-50 requests/hour), strict throttling" },
          "2": { label: "Significant restrictions", description: "Limited throughput (100-500 requests/hour)" },
          "3": { label: "Moderate limits", description: "Standard limits (1000-5000 requests/hour), manageable" },
          "4": { label: "Generous limits", description: "High throughput (10,000+ requests/hour)" },
          "5": { label: "No limits or unlimited", description: "No throttling, enterprise tier, or self-hosted" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      15: {
        question: "Error handling: How robust are the existing integration error handling and retry mechanisms?",
        options: {
          "1": { label: "No error handling", description: "Failures cause complete stops, manual intervention required" },
          "2": { label: "Basic error handling", description: "Simple failure logs, no automatic retry" },
          "3": { label: "Moderate error handling", description: "Some retry logic, basic error categorization" },
          "4": { label: "Good error handling", description: "Automatic retries, error queues, notification system" },
          "5": { label: "Advanced error handling", description: "Circuit breakers, exponential backoff, dead letter queues" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      16: {
        question: "API versioning and stability: How stable are the APIs, and how are version changes managed?",
        options: {
          "1": { label: "Unstable, frequent breaking changes", description: "APIs change without notice, no versioning strategy" },
          "2": { label: "Poorly managed versions", description: "Breaking changes common, short deprecation windows" },
          "3": { label: "Moderate version management", description: "Some versioning, occasional breaking changes with notice" },
          "4": { label: "Good version control", description: "Semantic versioning, 6+ month deprecation period" },
          "5": { label: "Enterprise-grade stability", description: "Long-term support, backwards compatibility guaranteed, 12+ month deprecation" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      17: {
        question: "Data sensitivity: What type of data does this workflow process?",
        options: {
          "1": { label: "Highly regulated data", description: "Health data, credit card data, government IDs, or any data covered by laws like HIPAA or PCI" },
          "2": { label: "Sensitive business or personal data", description: "Customer names, emails, addresses, financial records, contracts, internal company data" },
          "3": { label: "Moderately sensitive internal data", description: "Operational data, internal metrics, non-confidential customer references" },
          "4": { label: "Low sensitivity data", description: "General business data, product catalogs, internal documentation" },
          "5": { label: "Public or non-sensitive data", description: "Marketing content, public information, published materials" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      18: {
        question: "Compliance requirements: What compliance standards or regulations apply to this workflow?",
        options: {
          "1": { label: "Strict regulatory compliance", description: "HIPAA, SOC 2, PCI-DSS, GDPR with heavy auditing" },
          "2": { label: "High compliance needs", description: "Industry-specific regulations, annual audits" },
          "3": { label: "Moderate compliance", description: "Basic GDPR/privacy requirements, standard policies" },
          "4": { label: "Basic compliance", description: "Company policies, minimal external requirements" },
          "5": { label: "No specific compliance", description: "General business practices, no special requirements" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      19: {
        question: "Security approval: How long does security/compliance approval typically take for new tools?",
        options: {
          "1": { label: "6+ months", description: "Extensive review, penetration testing, legal review" },
          "2": { label: "3-6 months", description: "Security questionnaires, compliance reviews, multiple approvals" },
          "3": { label: "1-3 months", description: "Standard security review process" },
          "4": { label: "2-4 weeks", description: "Quick IT review, standard vendor assessment" },
          "5": { label: "Less than 2 weeks", description: "Self-service approval, pre-approved vendors" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      },
      20: {
        question: "Data retention: What are the data retention and archival requirements for this workflow?",
        options: {
          "1": { label: "Complex long-term retention", description: "10+ years, strict legal requirements, complex archival" },
          "2": { label: "Significant retention needs", description: "5-10 years, industry compliance standards" },
          "3": { label: "Moderate retention", description: "1-5 years, standard business requirements" },
          "4": { label: "Short retention", description: "Less than 1 year, flexible deletion policies" },
          "5": { label: "Minimal retention", description: "No specific requirements, data deleted after use" },
          "0": { label: "Not sure / Don't have this information", description: "Select this if you're unsure or don't have enough information to answer" }
        }
      }
    },
    gapMetadata: {
      whyCantAnswer: "Why couldn't you answer this question? *",
      whoMightKnow: "Who might be able to provide this information? *"
    },
    ui: {
      selectLanguage: "Select Language",
      title: "Technical Feasibility Assessment",
      aboutAssessment: "About This Assessment",
      aboutDescription: "This assessment is designed to evaluate the technical feasibility of automating the workflow described above. Your responses will help us understand the current state of data structure, process definition, and system capabilities.",
      importantNotice: "This data is collected solely for technical feasibility analysis and workflow automation assessment purposes. It is not used for employee performance evaluation or any personnel-related decisions.",
      progress: "Progress",
      yourName: "Your Name *",
      enterFullName: "Enter your full name",
      nameHelperText: "This helps us track who completed the initial assessment and contact the right person for follow-ups.",
      pleaseEnterNameBeforeSubmitting: "Please enter your name before submitting the assessment.",
      section: "Section",
      knowledgeGapDetails: "Knowledge Gap Details",
      knowledgeGapDescription: "question{s}. Please help us understand why and who might have this information.",
      question: "Question",
      additionalComments: "Additional Comments",
      additionalCommentsDescription: "Please share any additional information, disclaimers, or context that might be relevant to this workflow's automation feasibility.",
      commentsOptional: "Comments (Optional)",
      commentsPlaceholder: "Enter any additional information, concerns, or context that might be helpful...",
      previous: "Previous",
      next: "Next",
      submitting: "Submitting...",
      submitAssessment: "Submit Assessment",
      nameRequired: "Name required",
      nameRequiredDescription: "Please enter your name before submitting.",
      requiredQuestions: "Required questions",
      requiredQuestionsDescription: "Please answer all required questions in this section before continuing. {count} question(s) remaining.",
      incompleteAssessment: "Incomplete assessment",
      incompleteAssessmentDescription: "Please answer all questions before submitting.",
      gapDetailsRequired: "Gap details required",
      gapDetailsRequiredDescription: "Please provide why you couldn't answer and who might know for all 'Don't Know' questions.",
      loadingAssessment: "Loading assessment...",
      assessmentNotFound: "Assessment not found",
      errorLoadingAssessment: "Error loading assessment",
      submissionFailed: "Submission failed",
      dontKnowGapPlaceholder: "e.g., I don't have access to this system, This is managed by another department...",
      whoMightKnowPlaceholder: "e.g., John Smith - IT Manager, Data Analytics Team..."
    }
  },
  es: {
    sections: {
      systemEnvironment: {
        name: "Entorno del Sistema",
        description: "Ayúdenos a comprender su infraestructura técnica para poder recomendar soluciones de IA que se integren sin problemas con sus sistemas existentes"
      },
      dataQuality: {
        name: "Calidad de Datos",
        description: "Comparta detalles sobre sus datos para que podamos determinar si tiene la base necesaria para un rendimiento de IA confiable"
      },
      integrationFeasibility: {
        name: "Viabilidad de Integración",
        description: "Cuéntenos sobre la conectividad de su sistema para que podamos evaluar la complejidad de integración y planificar la ruta de implementación técnica"
      },
      securityCompliance: {
        name: "Seguridad/Cumplimiento",
        description: "Proporcione información sobre sus requisitos de seguridad y cumplimiento para garantizar que las soluciones de IA cumplan con los estándares de su organización"
      }
    },
    questions: {
      1: {
        question: "Modelo de implementación: ¿Cómo se implementan los sistemas principales para este flujo de trabajo?",
        options: {
          "1": { label: "Solo sistemas heredados locales", description: "Mainframe, servidores físicos, sin acceso a la nube" },
          "2": { label: "Principalmente local, algo de nube", description: "Centros de datos tradicionales con servicios limitados en la nube" },
          "3": { label: "Entorno híbrido mixto", description: "Combinación de local y nube, existe cierta integración" },
          "4": { label: "Principalmente SaaS en la nube", description: "Salesforce, Microsoft 365, algunos sistemas heredados permanecen" },
          "5": { label: "Solo SaaS moderno en la nube", description: "Sistemas 100% basados en la nube (AWS, Azure, Google Cloud)" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      2: {
        question: "¿Pueden estos sistemas enviar y recibir datos automáticamente con otro software? (a través de APIs, webhooks o interfaces similares)",
        options: {
          "1": { label: "No hay APIs disponibles", description: "Solo exportaciones manuales, se requiere web scraping" },
          "2": { label: "APIs limitadas o heredadas", description: "Endpoints SOAP antiguos, documentación limitada" },
          "3": { label: "Algunas APIs modernas disponibles", description: "Mezcla de REST y heredadas, cobertura parcial" },
          "4": { label: "Buena cobertura de API", description: "APIs REST bien documentadas para la mayoría de las funciones" },
          "5": { label: "APIs modernas completas", description: "REST/GraphQL completo, webhooks, actualizaciones en tiempo real" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      3: {
        question: "¿Pueden los bots o la automatización conectarse a estos sistemas sin que alguien inicie sesión manualmente?",
        options: {
          "1": { label: "Sin acceso programático", description: "Solo interfaz de usuario, requiere interacción manual" },
          "2": { label: "Acceso muy limitado", description: "Solo acceso a nivel de base de datos, sin APIs de aplicación" },
          "3": { label: "Acceso moderado con soluciones alternativas", description: "RPA/scripting posible pero no oficialmente soportado" },
          "4": { label: "Buen acceso programático", description: "Cuentas de servicio, claves API, OAuth compatible" },
          "5": { label: "Acceso programático completo", description: "Soporte nativo de automatización, SDKs disponibles" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      4: {
        question: "¿Qué tan rápidos y confiables son estos sistemas en el uso diario?",
        options: {
          "1": { label: "Fallos frecuentes o tiempos de espera", description: "Sistemas frecuentemente caídos, tiempos de respuesta >10 segundos" },
          "2": { label: "Rendimiento por debajo del promedio", description: "Ralentizaciones regulares, respuestas de 5-10 segundos, interrupciones ocasionales" },
          "3": { label: "Rendimiento aceptable", description: "Respuestas de 2-5 segundos, 95% de tiempo activo" },
          "4": { label: "Buen rendimiento", description: "Respuestas <2 segundos, 99% de tiempo activo" },
          "5": { label: "Rendimiento excelente", description: "Respuestas subsegundos, 99.9%+ de tiempo activo, alta disponibilidad" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      5: {
        question: "Si algo falla en un proceso automatizado, ¿lo sabremos y seremos alertados?",
        options: {
          "1": { label: "Sin monitoreo", description: "Sin registros, sin visibilidad de las operaciones del sistema" },
          "2": { label: "Solo registro básico", description: "Los registros del sistema existen pero son difíciles de acceder o buscar" },
          "3": { label: "Monitoreo estándar", description: "Paneles básicos, revisión manual de registros necesaria" },
          "4": { label: "Buen monitoreo", description: "Registro centralizado, alertas, paneles básicos" },
          "5": { label: "Observabilidad avanzada", description: "Monitoreo en tiempo real, alertas automatizadas, análisis detallados" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      6: {
        question: "¿Qué tan rápido pueden restaurarse estos sistemas si algo sale mal?",
        options: {
          "1": { label: "Sin estrategia de respaldo", description: "Sin respaldos, la pérdida de datos sería catastrófica" },
          "2": { label: "Respaldos mínimos", description: "Respaldos irregulares, tiempo de recuperación largo (días)" },
          "3": { label: "Sistema de respaldo básico", description: "Respaldos diarios, tiempo de recuperación de 4-24 horas" },
          "4": { label: "Buen sistema de respaldo", description: "Respaldos por hora, recuperación a un punto en el tiempo, RTO < 4 horas" },
          "5": { label: "Recuperación ante desastres empresarial", description: "Replicación en tiempo real, conmutación por error automatizada, RTO < 1 hora" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      7: {
        question: "Estructura de datos: ¿Qué tan estructurados y consistentes son los datos de entrada para este flujo de trabajo?",
        options: {
          "1": { label: "Altamente no estructurado", description: "Texto libre, correos electrónicos, documentos escaneados" },
          "2": { label: "Principalmente no estructurado", description: "PDFs, documentos Word con formatos inconsistentes" },
          "3": { label: "Semiestructurado", description: "Archivos Excel con columnas variables, algunas plantillas" },
          "4": { label: "Principalmente estructurado", description: "Tablas de base de datos, archivos CSV con esquema estándar" },
          "5": { label: "Completamente estructurado", description: "JSON/XML estandarizado, base de datos con esquema estricto" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      8: {
        question: "Calidad de datos: ¿Qué tan precisos y completos son los datos típicamente? (Considere campos faltantes, errores, duplicados)",
        options: {
          "1": { label: "Mala calidad, errores frecuentes", description: "Tasa de error >20%, muchos campos requeridos faltantes" },
          "2": { label: "Calidad por debajo del promedio", description: "10-20% de errores, limpieza regular requerida" },
          "3": { label: "Calidad aceptable", description: "5-10% de errores, manejable con validación" },
          "4": { label: "Buena calidad", description: "1-5% de errores, registros mayormente completos" },
          "5": { label: "Calidad excelente", description: "<1% de errores, datos validados con campos obligatorios" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      9: {
        question: "¿Hay suficientes datos históricos para entrenar la automatización o IA para que funcione de manera confiable?",
        options: {
          "1": { label: "Sin datos históricos", description: "Proceso nuevo, menos de 100 registros" },
          "2": { label: "Datos muy limitados", description: "100-1,000 registros, insuficiente para entrenamiento" },
          "3": { label: "Algunos datos históricos", description: "1,000-10,000 registros, patrones mínimos" },
          "4": { label: "Buenos datos históricos", description: "10,000-100,000 registros, patrones claros" },
          "5": { label: "Datos históricos extensos", description: "100,000+ registros, ejemplos de entrenamiento ricos" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      10: {
        question: "Consistencia de datos: ¿Qué tan consistente es el formato y los valores de datos entre diferentes fuentes y períodos de tiempo?",
        options: {
          "1": { label: "Altamente inconsistente", description: "Diferentes formatos por fuente, valores conflictivos, sin estándares" },
          "2": { label: "Principalmente inconsistente", description: "Variaciones de formato frecuentes, mapeo manual necesario" },
          "3": { label: "Moderadamente consistente", description: "Existe cierta estandarización, desajustes ocasionales" },
          "4": { label: "Principalmente consistente", description: "Estándares bien definidos, variaciones menores" },
          "5": { label: "Completamente consistente", description: "Fuente única de verdad, estándares de datos aplicados" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      11: {
        question: "Validación de datos: ¿Existen reglas de validación y mecanismos de manejo de errores para los datos entrantes?",
        options: {
          "1": { label: "Sin validación", description: "Cualquier dato aceptado, sin verificaciones ni manejo de errores" },
          "2": { label: "Validación mínima", description: "Solo verificaciones de tipo básicas, los errores causan fallos" },
          "3": { label: "Validación moderada", description: "Algunas reglas de negocio aplicadas, registro básico de errores" },
          "4": { label: "Validación fuerte", description: "Reglas completas, manejo de errores con lógica de reintento" },
          "5": { label: "Marco de validación robusto", description: "Validación de múltiples capas, corrección automatizada, seguimiento detallado de errores" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      12: {
        question: "¿Cuántos sistemas diferentes están involucrados en este flujo de trabajo? (Más sistemas = más difícil de automatizar)",
        options: {
          "1": { label: "10+ sistemas", description: "Panorama de integración altamente complejo" },
          "2": { label: "6-9 sistemas", description: "Múltiples puntos de contacto en departamentos" },
          "3": { label: "3-5 sistemas", description: "Varios sistemas clave (ej., CRM + ERP + correo electrónico)" },
          "4": { label: "2 sistemas", description: "Integración simple punto a punto" },
          "5": { label: "Un solo sistema", description: "Todos los datos dentro de una plataforma" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      13: {
        question: "Autenticación: ¿Qué tan compleja es la configuración de autenticación/autorización para el acceso al sistema?",
        options: {
          "1": { label: "Muy complejo o personalizado", description: "Autenticación propietaria, múltiples capas MFA, aprobaciones manuales" },
          "2": { label: "Multifactor complejo", description: "SAML con roles complejos, reautenticación frecuente" },
          "3": { label: "Complejidad moderada", description: "SSO estándar con cierta complejidad de permisos" },
          "4": { label: "OAuth/SSO estándar", description: "OAuth 2.0, SSO de Microsoft/Google" },
          "5": { label: "Claves API simples", description: "Tokens API de larga duración, permisos directos" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      14: {
        question: "Límites de tasa de API: ¿Hay restricciones de limitación de tasa o throttling que podrían afectar el rendimiento de la automatización?",
        options: {
          "1": { label: "Restricciones severas", description: "Límites muy bajos (10-50 solicitudes/hora), throttling estricto" },
          "2": { label: "Restricciones significativas", description: "Rendimiento limitado (100-500 solicitudes/hora)" },
          "3": { label: "Límites moderados", description: "Límites estándar (1000-5000 solicitudes/hora), manejables" },
          "4": { label: "Límites generosos", description: "Alto rendimiento (10,000+ solicitudes/hora)" },
          "5": { label: "Sin límites o ilimitado", description: "Sin throttling, nivel empresarial, o auto-alojado" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      15: {
        question: "Manejo de errores: ¿Qué tan robustos son los mecanismos de manejo de errores y reintento de integración existentes?",
        options: {
          "1": { label: "Sin manejo de errores", description: "Los fallos causan paradas completas, intervención manual requerida" },
          "2": { label: "Manejo básico de errores", description: "Registros simples de fallos, sin reintento automático" },
          "3": { label: "Manejo moderado de errores", description: "Cierta lógica de reintento, categorización básica de errores" },
          "4": { label: "Buen manejo de errores", description: "Reintentos automáticos, colas de errores, sistema de notificaciones" },
          "5": { label: "Manejo avanzado de errores", description: "Circuit breakers, backoff exponencial, colas de letra muerta" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      16: {
        question: "Versionado y estabilidad de API: ¿Qué tan estables son las APIs y cómo se gestionan los cambios de versión?",
        options: {
          "1": { label: "Inestable, cambios disruptivos frecuentes", description: "Las APIs cambian sin aviso, sin estrategia de versionado" },
          "2": { label: "Versiones mal gestionadas", description: "Cambios disruptivos comunes, ventanas cortas de deprecación" },
          "3": { label: "Gestión moderada de versiones", description: "Cierto versionado, cambios disruptivos ocasionales con aviso" },
          "4": { label: "Buen control de versiones", description: "Versionado semántico, período de deprecación de 6+ meses" },
          "5": { label: "Estabilidad de grado empresarial", description: "Soporte a largo plazo, compatibilidad hacia atrás garantizada, deprecación de 12+ meses" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      17: {
        question: "Sensibilidad de datos: ¿Qué tipo de datos procesa este flujo de trabajo?",
        options: {
          "1": { label: "Datos altamente regulados", description: "Datos de salud, tarjetas de crédito, identificaciones gubernamentales, o cualquier dato cubierto por leyes como HIPAA o PCI" },
          "2": { label: "Datos empresariales o personales sensibles", description: "Nombres de clientes, correos electrónicos, direcciones, registros financieros, contratos, datos internos de la empresa" },
          "3": { label: "Datos internos moderadamente sensibles", description: "Datos operacionales, métricas internas, referencias de clientes no confidenciales" },
          "4": { label: "Datos de baja sensibilidad", description: "Datos empresariales generales, catálogos de productos, documentación interna" },
          "5": { label: "Datos públicos o no sensibles", description: "Contenido de marketing, información pública, materiales publicados" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      18: {
        question: "Requisitos de cumplimiento: ¿Qué estándares o regulaciones de cumplimiento se aplican a este flujo de trabajo?",
        options: {
          "1": { label: "Cumplimiento regulatorio estricto", description: "HIPAA, SOC 2, PCI-DSS, GDPR con auditoría pesada" },
          "2": { label: "Altas necesidades de cumplimiento", description: "Regulaciones específicas de la industria, auditorías anuales" },
          "3": { label: "Cumplimiento moderado", description: "Requisitos básicos GDPR/privacidad, políticas estándar" },
          "4": { label: "Cumplimiento básico", description: "Políticas de la empresa, requisitos externos mínimos" },
          "5": { label: "Sin cumplimiento específico", description: "Prácticas comerciales generales, sin requisitos especiales" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      19: {
        question: "Aprobación de seguridad: ¿Cuánto tiempo toma típicamente la aprobación de seguridad/cumplimiento para nuevas herramientas?",
        options: {
          "1": { label: "6+ meses", description: "Revisión extensa, pruebas de penetración, revisión legal" },
          "2": { label: "3-6 meses", description: "Cuestionarios de seguridad, revisiones de cumplimiento, múltiples aprobaciones" },
          "3": { label: "1-3 meses", description: "Proceso estándar de revisión de seguridad" },
          "4": { label: "2-4 semanas", description: "Revisión rápida de IT, evaluación estándar de proveedores" },
          "5": { label: "Menos de 2 semanas", description: "Aprobación de autoservicio, proveedores pre-aprobados" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      },
      20: {
        question: "Retención de datos: ¿Cuáles son los requisitos de retención y archivo de datos para este flujo de trabajo?",
        options: {
          "1": { label: "Retención compleja a largo plazo", description: "10+ años, requisitos legales estrictos, archivo complejo" },
          "2": { label: "Necesidades significativas de retención", description: "5-10 años, estándares de cumplimiento de la industria" },
          "3": { label: "Retención moderada", description: "1-5 años, requisitos empresariales estándar" },
          "4": { label: "Retención corta", description: "Menos de 1 año, políticas de eliminación flexibles" },
          "5": { label: "Retención mínima", description: "Sin requisitos específicos, datos eliminados después del uso" },
          "0": { label: "No estoy seguro / No tengo esta información", description: "Seleccione esto si no está seguro o no tiene suficiente información para responder" }
        }
      }
    },
    gapMetadata: {
      whyCantAnswer: "¿Por qué no pudo responder esta pregunta? *",
      whoMightKnow: "¿Quién podría proporcionar esta información? *"
    },
    ui: {
      selectLanguage: "Seleccionar Idioma",
      title: "Evaluación de Viabilidad Técnica",
      aboutAssessment: "Acerca de Esta Evaluación",
      aboutDescription: "Esta evaluación está diseñada para evaluar la viabilidad técnica de automatizar el flujo de trabajo descrito anteriormente. Sus respuestas nos ayudarán a comprender el estado actual de la estructura de datos, la definición de procesos y las capacidades del sistema.",
      importantNotice: "Estos datos se recopilan únicamente para fines de análisis de viabilidad técnica y evaluación de automatización de flujos de trabajo. No se utiliza para evaluación del desempeño de empleados ni para ninguna decisión relacionada con el personal.",
      progress: "Progreso",
      yourName: "Su Nombre *",
      enterFullName: "Ingrese su nombre completo",
      nameHelperText: "Esto nos ayuda a rastrear quién completó la evaluación inicial y contactar a la persona adecuada para seguimientos.",
      pleaseEnterNameBeforeSubmitting: "Por favor ingrese su nombre antes de enviar la evaluación.",
      section: "Sección",
      knowledgeGapDetails: "Detalles de Brecha de Conocimiento",
      knowledgeGapDescription: "pregunta{s}. Por favor ayúdenos a entender por qué y quién podría tener esta información.",
      question: "Pregunta",
      additionalComments: "Comentarios Adicionales",
      additionalCommentsDescription: "Por favor comparta cualquier información adicional, descargos de responsabilidad o contexto que pueda ser relevante para la viabilidad de automatización de este flujo de trabajo.",
      commentsOptional: "Comentarios (Opcional)",
      commentsPlaceholder: "Ingrese cualquier información adicional, inquietudes o contexto que pueda ser útil...",
      previous: "Anterior",
      next: "Siguiente",
      submitting: "Enviando...",
      submitAssessment: "Enviar Evaluación",
      nameRequired: "Nombre requerido",
      nameRequiredDescription: "Por favor ingrese su nombre antes de enviar.",
      requiredQuestions: "Preguntas requeridas",
      requiredQuestionsDescription: "Por favor responda todas las preguntas requeridas en esta sección antes de continuar. {count} pregunta(s) restante(s).",
      incompleteAssessment: "Evaluación incompleta",
      incompleteAssessmentDescription: "Por favor responda todas las preguntas antes de enviar.",
      gapDetailsRequired: "Detalles de brecha requeridos",
      gapDetailsRequiredDescription: "Por favor proporcione por qué no pudo responder y quién podría saber para todas las preguntas 'No sé'.",
      loadingAssessment: "Cargando evaluación...",
      assessmentNotFound: "Evaluación no encontrada",
      errorLoadingAssessment: "Error al cargar la evaluación",
      submissionFailed: "Error al enviar",
      dontKnowGapPlaceholder: "ej., No tengo acceso a este sistema, Esto es gestionado por otro departamento...",
      whoMightKnowPlaceholder: "ej., Juan Pérez - Gerente de TI, Equipo de Análisis de Datos..."
    }
  }
};

export function getSectionTranslation(sectionName: string, language: 'en' | 'es'): { name: string; description: string } {
  const translations = tfaTranslations[language].sections;
  
  switch (sectionName) {
    case "System Environment":
      return translations.systemEnvironment;
    case "Data Quality":
      return translations.dataQuality;
    case "Integration Feasibility":
      return translations.integrationFeasibility;
    case "Security/Compliance":
      return translations.securityCompliance;
    default:
      return { name: sectionName, description: "" };
  }
}

export function getQuestionTranslation(questionId: number, language: 'en' | 'es') {
  return tfaTranslations[language].questions[questionId];
}

export function getGapMetadataTranslation(language: 'en' | 'es') {
  return tfaTranslations[language].gapMetadata;
}

export function getUITranslation(language: 'en' | 'es') {
  return tfaTranslations[language].ui;
}
