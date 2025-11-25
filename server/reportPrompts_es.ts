// Reporte Ejecutivo de Diagnóstico - Secciones Textuales Verbatim
// Estas plantillas contienen el texto exacto de las indicaciones del PDF proporcionado
// Las variables en {{llaves_dobles}} se rellenan con datos de la base de datos
// Las variables en [corchetes] se dejan para comentarios manuales del analista

/**
 * Utilidad de reemplazo de variables
 * Reemplaza {{variables}} con valores de datos reales
 * Convierte marcadores de comentarios al formato [entre_corchetes] para llenado manual
 */
export function replaceVariables(
  template: string,
  data: Record<string, any>,
  commentaryKeys: string[] = []
): string {
  let result = template;

  // First, convert commentary placeholders from {{key}} to [key]
  commentaryKeys.forEach(key => {
    const commentaryPattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(commentaryPattern, `[${key}]`);
  });

  // Then replace data variables
  Object.entries(data).forEach(([key, value]) => {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    
    // Format value based on type
    let formattedValue = value;
    if (typeof value === 'number') {
      // Format currency if it looks like a money value
      if (key.includes('benefit') || key.includes('cost') || key.includes('revenue')) {
        formattedValue = value.toLocaleString('es-ES', { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 0 
        });
      } else if (key.includes('percent') || key.includes('roi')) {
        formattedValue = value.toFixed(1);
      } else if (key.includes('payback') || key.includes('months')) {
        formattedValue = Math.round(value).toString();
      } else {
        formattedValue = value.toLocaleString('es-ES', { 
          minimumFractionDigits: 0, 
          maximumFractionDigits: 2 
        });
      }
    }
    
    result = result.replace(pattern, String(formattedValue));
  });

  return result;
}

/**
 * Formatear fecha como "MMM YYYY"
 */
export function formatDiagnosticDate(date: Date): string {
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
}

/**
 * MAPEO COMPLETO DE VARIABLES
 * ================================
 * Este mapeo relaciona las {{variables}} de plantilla con sus fuentes de base de datos y cálculos
 * 
 * CONTEXTO DE EMPRESA:
 * - {{company_name}} → company.name
 * - {{annual_revenue}} → company.annualRevenue (opcional, para normalización)
 * - {{total_employees}} → company.totalEmployees (opcional, para normalización)
 * 
 * MÉTRICAS A NIVEL DE PORTAFOLIO (calculadas en todos los flujos/oportunidades):
 * - {{total_workflows}} → conteo de flujos de trabajo
 * - {{workflow_count}} → mismo que total_workflows
 * - {{total_opportunities}} → conteo de oportunidades
 * - {{opportunity_count}} → mismo que total_opportunities
 * - {{annual_benefit}} → suma de todos los opportunity.annualBenefit
 * - {{avg_payback}} → promedio de todos los opportunity.paybackPeriodMonths
 * - {{payback_period}} → mismo que avg_payback
 * - {{roi_percent}} → ROI promedio entre oportunidades
 * - {{fte_savings}} → suma de todos los opportunity.fteSavings
 * - {{functions_list}} → lista separada por comas de departamentos/funciones únicos de flujos de trabajo
 * 
 * TOP 3 OPORTUNIDADES (ordenadas por impacto empresarial):
 * - Top 3 oportunidades con: nombre, beneficio anual, ROI, retorno, FTE, descripción
 * 
 * CONTEOS POR CUADRANTE DE MATRIZ:
 * - {{quickwin_count}} → conteo de oportunidades en cuadrante Logros Rápidos
 * - Conteos y listas de Logros Rápidos, Estratégicas, Deseables, Despriorizar
 * 
 * DETALLES POR OPORTUNIDAD (para tablas y Apéndice D):
 * - {{workflow_name}} → workflow.name
 * - {{opportunity_name}} → opportunity.name
 * - {{annual_benefit}} → opportunity.annualBenefit
 * - {{payback_months}} → opportunity.paybackPeriodMonths
 * - {{fte_saved}} → opportunity.fteSavings
 * - {{implementation_cost}} → opportunity.implementationCost
 * - {{net_benefit_3yr}} → opportunity.netBenefit3Year (opcional)
 * - {{net_benefit_5yr}} → opportunity.netBenefit5Year (opcional)
 * - {{annual_hours_saved}} → opportunity.annualHoursSaved (del calculador ROI basado en la definición de FTE de la empresa cliente)
 * - {{weekly_hours_saved}} → opportunity.hoursSavedPerWeek (del calculador ROI)
 * - {{dominant_component}} → calculado desde desglose de impacto
 * 
 * PUNTUACIONES DE PREPARACIÓN (por flujo de trabajo):
 * - {{tfa_score}} → Puntuación TFA 0-100
 * - {{pif_score}} → Puntuación PIF agregada 0-100
 * - {{readiness_score}} → Preparación combinada (TFA 60% + PIF 40%)
 * - {{readiness_band}} → Muy Alta/Alta/Moderada/Baja/Muy Baja
 * 
 * FORMATEO DE FECHA:
 * - {{diagnostic_date}} → Formatear como "MMM YYYY" (ej., "Oct 2025")
 * 
 * MARCADORES DE COMENTARIOS (convertidos de {{}} a []):
 * - [commentary] → Análisis manual del analista
 * - [readiness_commentary] → Análisis de preparación
 * - [roi_commentary] → Interpretación de ROI
 * - [matrix_distribution_commentary] → Análisis de matriz
 * - [executive_analysis_commentary] → Interpretación ejecutiva
 * - [quickwin_commentary] → Análisis de logros rápidos
 * - [foundational_commentary] → Análisis de fase fundacional
 * - [strategic_commentary] → Análisis de fase estratégica
 * - [roadmap_summary_commentary] → Resumen de hoja de ruta
 */

export const EXECUTIVE_SUMMARY = `
Automat-IA realizó un diagnóstico basado en datos para evaluar la preparación de {{company_name}} 
para la automatización de operaciones administrativas impulsada por IA y cuantificar el retorno 
financiero de las implementaciones potenciales.
El objetivo de este diagnóstico fue ayudar a {{company_name}} a identificar, priorizar y trazar 
una hoja de ruta de oportunidades de automatización alineadas con sus objetivos empresariales y 
realidades operacionales.

El compromiso analizó {{total_workflows}} flujos de trabajo, identificando {{total_opportunities}} 
oportunidades de automatización válidas con un beneficio anual total estimado de {{annual_benefit}}, 
un retorno promedio de {{payback_period}} meses y un ROI promedio de {{roi_percent}}%.

Cada flujo de trabajo fue evaluado utilizando la metodología de diagnóstico dual de Automat-IA, que 
combina la Evaluación de Factibilidad Técnica (TFA) y el Formulario de Perspectivas de Proceso (PIF), 
para establecer una puntuación de preparación integrada que captura tanto la viabilidad técnica como 
la operacional.

Este análisis reveló variaciones significativas entre los flujos de trabajo:

[Inserte 1–2 oraciones destacando Logros Rápidos (oportunidades de alta factibilidad y retorno corto)]

[Inserte 1–2 oraciones describiendo brechas fundacionales (ej., calidad de datos, integración de 
sistemas, documentación)]

Todos los hallazgos se consolidaron en un modelo cuantitativo de ROI, una Matriz de Oportunidades 
de dos capas (Impacto Empresarial vs. Esfuerzo de Implementación) y una Hoja de Ruta de Automatización 
de 18 meses que describe las prioridades de implementación a corto, mediano y largo plazo.

Al seguir la hoja de ruta descrita en este informe, {{company_name}} puede establecer una base de 
automatización escalable, acelerar las ganancias de eficiencia y crear ventajas operacionales y 
financieras medibles dentro del próximo ciclo fiscal.

[Interpretación Estratégica: Resuma la postura de preparación para la automatización, destaque las 
oportunidades de mayor impacto y explique qué implican estos hallazgos para el viaje de adopción de 
IA de la empresa y la estrategia de priorización.]
`;

export const CONFIDENTIALITY_DISCLAIMER = `
Este documento ha sido preparado exclusivamente para {{company_name}} por Automat-IA como parte de la 
Evaluación de Preparación y Diagnóstico de Automatización de IA. Todos los análisis, modelos financieros 
y evaluaciones de flujos de trabajo contenidos en este documento son confidenciales y están destinados 
únicamente para el uso interno de los equipos ejecutivos y técnicos del cliente. Ninguna parte de este 
informe puede ser reproducida, distribuida o divulgada a terceros sin el consentimiento previo por escrito 
de Automat-IA.

Todos los hallazgos, métricas y recomendaciones se basan en información proporcionada por el cliente a 
través de entrevistas, encuestas(Evaluaciones de Factibilidad Técnica (TFA) y Formularios de Perspectivas 
de Proceso (PIF)) y documentación relacionada. Automat-IA asume que esta información es precisa y completa 
según el mejor conocimiento del cliente en el momento de la presentación. Cualquier omisión o inexactitud 
puede afectar la validez de las conclusiones presentadas.

Este informe representa una evaluación en etapa de diagnóstico preparada con fines estratégicos y de 
planificación. No constituye una garantía de resultados específicos ni un compromiso de implementar las 
soluciones propuestas. Todas las actividades de implementación requieren alcance y acuerdo contractual 
por separado.

Cuando los datos están incompletos o son inciertos, Automat-IA aplica parámetros de supuestos controlados 
para preservar la continuidad analítica sin distorsionar los resultados. Estos controles de supuestos siguen 
una jerarquía estandarizada que incluye la aplicación de puntuación de punto medio a respuestas TFA no 
resueltas y ponderación conservadora o exclusión de datos operacionales no verificados como tasas de error 
o incremento de ingresos.

Todos los resultados cuantitativos, incluyendo puntuaciones de preparación, proyecciones de ROI, períodos 
de retorno y estimaciones de beneficios, se modelan utilizando el Marco de Escenario Conservador de 
Automat-IA. Este marco aplica supuestos ajustados por riesgo que reflejan condiciones realistas de adopción, 
integración y ejecución. Los resultados reales de implementación pueden variar dependiendo de factores como 
el alcance final del proyecto y la arquitectura técnica, selección de proveedores, efectividad de la gestión 
del cambio, adopción del usuario, integridad de datos, cumplimiento de procesos y rendimiento del sistema.

Los análisis y estimaciones contenidos en este documento tienen como objetivo guiar la priorización, 
presupuestación y toma de decisiones estratégicas en el contexto de la preparación para la automatización 
de IA. Automat-IA recomienda que los clientes validen todos los supuestos durante la fase de implementación 
y rastreen los beneficios realizados contra las proyecciones presentadas en este documento.
`;

export const METHODOLOGY_OVERVIEW = `
Nuestro enfoque de diagnóstico integra el análisis de factibilidad técnica y viabilidad operacional con la evaluación de impacto 
empresarial para producir una visión completa y basada en datos del potencial de automatización. La 
metodología se desarrolla a través de doce fases clave, asegurando profundidad analítica, validación de 
partes interesadas y trazabilidad de hallazgos.

Fase 1: Recopilación Preliminar de Datos

Se recopilan los Ingresos Anuales y el Número Total de FTE de {{company_name}} para cálculos de 
impacto empresarial de oportunidades específicos de la empresa y realistas. La recopilación preliminar 
de datos también incluye proporcionar nombres e información de contacto para el encuestado del TFA 
(representante de TI/contacto técnico dentro de la organización del cliente) e información de contacto 
del propietario del proceso de back-office para la distribución de evaluaciones en etapas posteriores.

Fase 2: Descubrimiento de Partes Interesadas y Definición de Contexto

Entrevistas estructuradas con propietarios de procesos, expertos en la materia y líderes departamentales 
establecen una identificación y comprensión base de los flujos de trabajo críticos, puntos de dolor y objetivos de 
automatización. Esto asegura que el alcance del diagnóstico y las prioridades empresariales estén alineados.

Fase 3: Identificación de Encuestados PIF

Después del descubrimiento de partes interesadas y definición de contexto, las partes interesadas entrevistadas (propietarios de procesos, expertos en la materia y líderes departamentales) o el contacto de RR.HH. proporcionado dentro de {{company_name}} proporcionan el nombre e información de contacto de los empleados que realizan el flujo de trabajo analizado (usuarios finales) para la identificación de encuestados PIF. Idealmente, los datos salariales para estos representantes a nivel de paso de cada flujo de trabajo de back-office identificado también se proporcionan aquí para el modelado preciso de ROI de oportunidades en etapas posteriores. Esto incluye salario promedio, horas semanales o anuales de FTE y multiplicador de gastos generales.

Fase 4: Evaluación de Factibilidad Técnica (TFA)

El TFA se realiza a nivel de flujo de trabajo y se comparte en todos los pasos dentro de ese flujo. Cada 
flujo de trabajo se evalúa en cuatro dimensiones ponderadas: Entorno del Sistema, Calidad de Datos, 
Factibilidad de Integración y Seguridad y Cumplimiento, utilizando la rúbrica de 21 preguntas de Automat-IA. 
Las respuestas generan una Calificación de Preparación Técnica (0 a 100), con brechas de conocimiento 
registradas para aclaración para mantener la integridad de datos. Esta evaluación a nivel de flujo de trabajo 
proporciona una base para comprender el entorno técnico que afecta todos los pasos dentro del proceso.

Fase 5: Formulario de Perspectivas de Proceso (PIF)

Los PIF se recopilan a nivel de paso: cada paso de proceso individual dentro de un flujo de trabajo recibe 
su propia evaluación PIF optimizada. El formulario consiste en hasta 29 preguntas (dependiendo de la lógica 
condicional), principalmente de opción múltiple con hasta 6 entradas numéricas simples requeridas de los encuestados. 
Los participantes operacionales proporcionan datos cuantitativos incluyendo información de claridad de 
proceso, indicadores de preparación al cambio, métricas de fragilidad de flujo de trabajo, datos de 
tiempo/volumen, potencial de incremento de ingresos y mediciones de impacto de calidad. Este enfoque cuantitativo y enfocado minimiza la fatiga 
de encuesta mientras captura puntuaciones de preparación operacional estandarizadas y entradas precisas de 
modelado de ROI a nivel de paso, permitiendo la identificación precisa de oportunidades de automatización sin 
depender de promedios agregados de flujo de trabajo.

Fase 6: Validación de Usuario Final y Mapeo de Flujo de Trabajo

Las sesiones de validación con usuarios finales confirman entradas PIF y mapean cada flujo de trabajo en 
detalle, identificando ineficiencias específicas, tareas repetitivas, cuellos de botella, bucles de 
reelaboración, actividades propensas a errores, casos extremos y excepciones a través de entrevistas 
estructuradas. Estas entrevistas recopilan las perspectivas cualitativas necesarias para comprender los 
matices del flujo de trabajo, requisitos de conocimiento crítico, limitaciones de herramientas y puntos de 
dolor del proceso. Esto asegura que los supuestos técnicos se alineen con las condiciones reales de 
ejecución y que las estrategias de automatización aborden las oportunidades de mejora más impactantes.

Fase 7: Identificación de Oportunidades

Al combinar datos TFA a nivel de flujo de trabajo, datos PIF a nivel de paso y datos de entrevistas con 
partes interesadas y usuarios finales, se identifican y alcanzan preliminarmente oportunidades potenciales 
de automatización. Cada oportunidad está vinculada a su paso de flujo de trabajo de origen específico para 
auditabilidad y atribución precisa de impacto.

Fase 8: Modelado y Cuantificación de ROI

Cada oportunidad validada se modela utilizando el Marco de Calculadora de ROI de Automat-IA para estimar 
el impacto financiero, incluyendo ahorro de tiempo, reducción de errores e incremento potencial de ingresos. 
Los resultados incluyen beneficio anualizado, porcentaje de ROI y período de retorno, calculados a través 
del Marco de Escenario Conservador para asegurar realismo y disciplina analítica. El modelado de ROI se 
basa principalmente en datos de respuesta PIF, sin embargo, otras entradas de datos como costos de 
implementación, horas de capacitación por empleado y período de adaptación son estimadas por Automat-IA 
y pueden estar sujetas a cambios si {{company_name}} decide proceder con la implementación.

Fase 9: Priorización de Matriz de Oportunidades

7.1 Descripción General

La Matriz de Oportunidades es un modelo de apoyo a la toma de decisiones utilizado para priorizar 
iniciativas de automatización basadas en perspectivas tanto empresariales como técnicas. Visualiza cada 
oportunidad en un marco unificado que compara la creación de valor esperado contra la factibilidad de 
implementación, permitiendo priorización basada en datos en lugar de clasificación subjetiva.

7.2 Ejes de la Matriz

La matriz traza dos dimensiones principales:

**Eje Vertical:** Impacto Empresarial combina ROI anual, FTE ahorrados y, cuando corresponda, 
beneficios adicionales como reducción de errores e incremento de ingresos.

**Eje Horizontal:** Esfuerzo de Implementación refleja la dificultad técnica, complejidad de integración y 
puntuaciones de preparación a nivel de paso derivadas de la combinación de evaluaciones TFA a nivel de 
flujo de trabajo y PIF específicas de paso.

Este enfoque de dos ejes destaca qué oportunidades entregan el mayor retorno por el menor esfuerzo relativo.

7.3 Cuadrantes de la Matriz

La matriz se divide en cuatro cuadrantes que guían la priorización:

**Logros Rápidos:** Alto impacto y bajo esfuerzo; candidatos inmediatos para implementación temprana.

**Apuestas Estratégicas:** Alto impacto y alto esfuerzo; proyectos a largo plazo con potencial de valor 
significativo.

**Deseables:** Impacto moderado o bajo y bajo esfuerzo; útiles para optimización o prueba de concepto.

**Despriorizar:** Bajo impacto y alto esfuerzo; baja prioridad hasta que los cambios fundacionales mejoren 
la factibilidad.

Este modelo de cuadrantes asegura que las decisiones de automatización equilibren el valor a corto plazo 
con la escalabilidad a largo plazo.

7.4 Matriz de Oportunidades Estándar vs. Mejorada

Automat-IA aplica un Marco de Dos Matrices:

1. La Matriz de Oportunidades de Impacto Base calcula el Impacto Empresarial combinando el ROI anual de las 
oportunidades identificadas dividido por los Ingresos Anuales de la empresa para producir un ROI-como-porcentaje-de-ingresos, 
que luego se combina con el ahorro de FTE. Esto proporciona una priorización inicial que respalda la visibilidad ejecutiva y 
secuenciación rápida de oportunidades.
2. La Matriz de Oportunidades Mejorada aplica un modelo de bonificación aditiva solo al eje de Impacto 
Empresarial, expandiendo la escala de 0-100 a 0-150 para oportunidades que demuestran valor adicional a 
través de reducción de errores o incremento de ingresos. Esta matriz refinada ajusta las clasificaciones 
de oportunidades para reflejar interdependencias estratégicas, asegurando un portafolio equilibrado de 
ganancias a corto plazo y valor de automatización sostenible a largo plazo.

Fase 10: Sesión de Validación y Alineación de Partes Interesadas

Después de que se genera la Matriz de Oportunidades, se realiza una sesión de validación con partes 
interesadas clave para confirmar la priorización, abordar riesgos ocultos y alinear las oportunidades de 
automatización con la estrategia y cultura organizacional. Esta revisión colaborativa asegura que la hoja 
de ruta refleje tanto rigor analítico como consideraciones empresariales prácticas. Las partes interesadas 
proporcionan información sobre factibilidad de implementación, disponibilidad de recursos y ajuste 
estratégico, permitiendo al equipo ajustar clasificaciones y secuenciación según sea necesario. La Matriz 
de Oportunidades validada luego alimenta directamente la hoja de ruta de automatización final y se convierte 
en la base del Reporte Ejecutivo de Diagnóstico.

Fase 11: Desarrollo de Hoja de Ruta de Automatización

Las oportunidades seleccionadas de las matrices validadas se secuencian en una hoja de ruta de tres fases que convierte los hallazgos de diagnóstico en pasos de implementación accionables:

• **Fase 1: Logros Rápidos (0 a 6 meses)** – Se enfoca en automatizaciones de baja complejidad que entregan ROI temprano y demuestran resultados medibles.

• **Fase 2: Fundacional (6 a 12 meses)** – Construye las estructuras de integración, datos y gobernanza requeridas para automatización escalable.

• **Fase 3: Estratégica (12 a 18+ meses)** – Entrega transformaciones de alto valor y transdepartamentales que aprovechan la base construida anteriormente.

La hoja de ruta actúa como un plan de ejecución estructurado, asegurando una transición lógica desde ganancias de eficiencia inmediatas hasta habilitación de IA a nivel organizacional.

Fase 12: Entregables Finales

El proceso de diagnóstico concluye con la entrega de dos productos completos:

1. **Reporte Ejecutivo de Diagnóstico (EDR):** Este documento consolida todos los hallazgos, evaluaciones de preparación, análisis FODA, proyecciones de ROI, matrices de oportunidades y la hoja de ruta de automatización de 18 meses. El EDR incluye un Resumen Ejecutivo, metodología detallada (Fases 1-12), descripción general del diagnóstico, hallazgos y análisis, hoja de ruta de automatización, Conclusiones y Próximos Pasos, y seis apéndices completos (A: Metodología Detallada, B: Ponderación de Métricas de Puntuación de Preparación, C: Análisis FODA a Nivel de Paso, D: Descripción Detallada de ROI, E: Metodología de Cálculo de ROI, F: Procedencia de Datos y Pista de Auditoría). Diseñado para partes interesadas ejecutivas y técnicas para guiar la toma de decisiones estratégicas y planificación de implementación.

2. **Presentación Ejecutiva:** Una presentación resumida destacando hallazgos clave, oportunidades validadas y la hoja de ruta recomendada, adaptada para comunicación a nivel de junta directiva y liderazgo senior.
`;

export const DIAGNOSTIC_OVERVIEW_PART1 = `
4.1 Alcance de la Evaluación

Automat-IA realizó un diagnóstico completo de {{company_name}} para evaluar la preparación para la 
automatización y cuantificar el impacto financiero de las mejoras de procesos impulsadas por IA. El 
análisis cubrió {{workflow_count}} flujos de trabajo en funciones administrativas clave que incluyen 
{{functions_list}}.

Cada flujo de trabajo fue evaluado en tres dimensiones:

• **Factibilidad Técnica** – La capacidad de los sistemas actuales, estructuras de datos, rutas de integración y postura de seguridad para soportar la automatización de manera segura y confiable.

• **Preparación Organizacional** – El grado de estandarización de procesos, consistencia de datos y adaptabilidad 
al cambio dentro de la organización.

• **Impacto Empresarial** – ROI cuantificado, período de retorno, FTE ahorrados, potencial de beneficio anual, reducción de errores e incremento de ingresos, derivados de oportunidades de automatización modeladas. El Impacto Empresarial se calcula utilizando dos enfoques: la Matriz de Impacto Base (ROI-como-porcentaje de ingresos + ahorro de FTE) y la Matriz de Impacto Mejorada (Impacto Base + bonificaciones aditivas por reducción de errores e incremento de ingresos cuando sea aplicable).

Todas las oportunidades de automatización fueron posicionadas dentro de la Matriz de Oportunidades de 
Automat-IA, alineando la preparación técnica con el valor financiero. El objetivo fue identificar y 
priorizar automatizaciones que sean tanto técnicamente factibles como financieramente justificadas.

4.2 Hallazgos Clave del Diagnóstico

• **Total de Flujos de Trabajo Analizados:** {{workflow_count}}
• **Oportunidades de Automatización Validadas:** {{opportunity_count}}
• **Potencial de Beneficio Anual Total:** {{annual_benefit}}
• **Período de Retorno Promedio:** {{avg_payback}} meses
• **FTE Ahorrados:** {{fte_savings}}

Las puntuaciones de preparación variaron entre los flujos de trabajo, reflejando diferencias en calidad de 
datos, estructura de proceso y madurez de integración.
Los flujos de trabajo de alta preparación indican potencial de automatización inmediato, mientras que los 
de menor preparación destacan brechas fundacionales en documentación, conectividad API o propiedad de 
procesos.

[Comentario: Resuma las tendencias generales de preparación, como "Finanzas y RRHH exhiben preparación 
técnica madura, mientras que Compras y Operaciones requieren estandarización de datos y procesos."]
`;

export const DIAGNOSTIC_OVERVIEW_PART2 = `
[Comentario: Explique por qué estas oportunidades principales se clasifican más altas, su impacto esperado 
en las operaciones y cualquier interdependencia.]
`;

export const DIAGNOSTIC_OVERVIEW_PART3 = `
4.5 Potencial de Implementación Inmediata (Logros Rápidos)

{{quickwin_count}} oportunidades demostraron alta preparación y bajo esfuerzo de implementación, 
clasificándolas como Logros Rápidos. Estas oportunidades abarcan los siguientes flujos de trabajo y pasos:

{{quickwin_list}}

Estas pueden ejecutarse a corto plazo para generar ROI temprano e impulso interno. Los Logros Rápidos se 
caracterizan por puntuaciones de preparación a nivel de paso altas (fuerte factibilidad técnica combinada 
con datos operacionales claros), requisitos mínimos de integración de sistemas y procesos bien documentados 
con partes interesadas comprometidas.

[Comentario del Analista: Describa cada oportunidad de Logro Rápido, qué automatiza y el impacto esperado]

4.6 Apuestas Estratégicas para Valor a Largo Plazo

Un subconjunto de oportunidades de alto impacto ofrece potencial significativo pero requiere mayor esfuerzo 
de implementación debido a deuda técnica, dependencias de sistemas legados o requisitos de coordinación 
transdepartamental. Estas Apuestas Estratégicas incluyen:

{{strategic_bets_list}}

Estas oportunidades deben priorizarse para fases posteriores de la hoja de ruta (Fase 2: Fundacional o 
Fase 3: Estratégica) una vez que se fortalezcan los habilitadores fundacionales, mejore la preparación 
técnica y los Logros Rápidos tempranos hayan construido capacidad y momentum organizacional.

[Comentario del Analista: Describa cada oportunidad de Apuesta Estratégica, qué automatiza y la propuesta 
de valor a largo plazo]

4.7 Oportunidades Deseables

Un conjunto de oportunidades de impacto moderado o bajo ofrece potencial de optimización con esfuerzo de 
implementación relativamente bajo. Estas oportunidades Deseables pueden servir como iniciativas de prueba 
de concepto, ejercicios de capacitación o mejoras incrementales:

{{nice_to_have_list}}

Aunque no se priorizan para la hoja de ruta inmediata de 18 meses, estas oportunidades pueden volverse más 
estratégicas a medida que maduran las capacidades fundacionales o cambian las prioridades empresariales. 
También pueden proporcionar experiencias valiosas de aprendizaje para equipos nuevos en tecnologías de 
automatización.

[Comentario del Analista: Describa cada oportunidad Deseable, qué automatiza y el potencial de optimización]

4.8 Oportunidades Despriorizadas (No Recomendadas)

Un subconjunto de oportunidades de automatización identificadas ha sido explícitamente despriorizado debido 
a relaciones costo-beneficio desfavorables. Estas oportunidades caen en el cuadrante superior izquierdo de 
la Matriz de Oportunidades, caracterizadas por alto esfuerzo de implementación combinado con bajo impacto 
empresarial. Perseguir estas representaría una mala asignación de recursos—lo que denominamos "pozos de 
dinero":

{{deprioritize_list}}

Las oportunidades despriorizadas típicamente exhiben una o más de las siguientes características: 
dependencias extensivas de sistemas legados que requieren modernización significativa, bajos volúmenes de 
transacciones que no pueden justificar los costos de implementación, alta complejidad técnica con beneficio 
operacional mínimo, o requisitos de coordinación transdepartamental desproporcionados respecto a los 
retornos esperados.

Identificar qué NO automatizar es igualmente valioso que identificar Logros Rápidos. Estas oportunidades 
deben revisarse solo si las condiciones fundacionales cambian significativamente (por ejemplo, 
actualizaciones de sistemas, aumentos de volumen o cambios de prioridad estratégica).

[Comentario del Analista: Explique por qué cada oportunidad despriorizada no es recomendada y las condiciones bajo las cuales podría justificarse una reevaluación]

4.9 Oportunidades Consolidadas

Algunos resultados de alto impacto requieren coordinar múltiples iniciativas de automatización en
pasos de flujo de trabajo relacionados. Estas Oportunidades Consolidadas agrupan oportunidades
individuales en paquetes estratégicos que entregan mayor valor combinado que implementándolas
por separado:

{{consolidations_list}}

Las consolidaciones consideran sobrecarga de integración, complejidad de coordinación y requisitos
de despliegue por fases. Representan escenarios de inversión estratégica que pueden abarcar múltiples
fases de la hoja de ruta, permitiendo transformación integral del flujo de trabajo en lugar de mejoras
puntuales.

[Comentario del Analista: Describa cada consolidación, su justificación estratégica y el impacto organizacional esperado]

4.10 Brechas Fundacionales que Dificultan la Escala

El análisis de preparación a nivel de paso reveló debilidades recurrentes que limitan la escalabilidad en 
múltiples flujos de trabajo. Las brechas fundacionales comunes incluyen:

{{foundational_gaps_list}}

Las acciones de remediación recomendadas incluyen actualizaciones de integración de sistemas, mejoras de 
gobernanza de datos, iniciativas de documentación de procesos y establecimiento de propiedad clara de 
procesos. Abordar estas brechas fundacionales mejorará las puntuaciones de preparación para oportunidades 
de esfuerzo medio y permitirá el escalamiento exitoso de iniciativas de automatización.

[Comentario del Analista: Explique cada categoría de brecha fundacional, flujos de trabajo afectados y 
cronograma de remediación recomendado]

4.11 Preparación Organizacional y Cultural

Las entrevistas con partes interesadas y las respuestas PIF a nivel de paso revelaron diferentes niveles 
de conciencia de automatización y adaptabilidad al cambio entre departamentos. Los factores de preparación 
cultural incluyen:

{{cultural_readiness_summary}}

Las recomendaciones para la preparación organizacional incluyen programas de gestión del cambio enfocados, 
iniciativas de comunicación transdepartamental, capacitación en alfabetización de automatización y 
establecimiento de campeones internos para construir confianza y capacidad. Una fuerte preparación cultural 
acelera los cronogramas de implementación y mejora las tasas de adopción para todas las iniciativas de 
automatización.

[Comentario del Analista: Proporcione perspectivas cualitativas de las entrevistas con partes interesadas y usuarios finales sobre dinámicas culturales, patrones de resistencia, campeones del cambio y observaciones de preparación organizacional no capturadas en las evaluaciones cuantitativas]

4.12 Enfoque Recomendado

● Priorizar Logros Rápidos en la Fase 1 para demostrar ROI y construir confianza interna.

● Abordar brechas de preparación fundacional antes de iniciar iniciativas de alto esfuerzo.

● Reevaluar puntuaciones de oportunidades después de cada ciclo de implementación para actualizar la Matriz 
de Oportunidades dinámicamente.

● Usar éxitos tempranos para fortalecer la defensa y competencia técnica para fases subsiguientes.
`;

export const FINDINGS_ANALYSIS_PART1 = `
5.1 Resumen de Preparación

La tabla a continuación consolida los resultados de evaluación de preparación para todos los flujos de 
trabajo analizados durante la fase de diagnóstico. Cada flujo de trabajo fue evaluado a través de los 
resultados combinados de la Evaluación de Factibilidad Técnica (TFA) y el Formulario de Perspectivas de 
Proceso (PIF).

La puntuación de preparación agregada proporciona una medida objetiva de preparación para implementación, 
formando la base analítica para priorización dentro de la Matriz de Oportunidades y la Hoja de Ruta de 
Automatización.
`;

export const FINDINGS_ANALYSIS_PART2 = `
[readiness_commentary]

Para hallazgos cualitativos detallados por paso incluyendo fortalezas identificadas, debilidades y 
dependencias, consulte el Apéndice C: Análisis FODA a Nivel de Paso por Flujo de Trabajo.
`;

export const FINDINGS_ANALYSIS_PART3 = `
5.2 Hallazgos de ROI

Esta sección resume los resultados cuantitativos del modelado de ROI realizado para las oportunidades de 
automatización validadas. Todos los resultados financieros se derivan utilizando el Marco de Calculadora 
de ROI de Automat-IA, que aplica supuestos conservadores basados en evidencia para estimar beneficios 
operacionales.

El beneficio anual de cada oportunidad representa el efecto combinado de ahorro de tiempo, reducción de 
errores e incremento potencial de ingresos, modelado bajo el Marco de Escenario Conservador para asegurar 
proyecciones realistas.

El ROI% de Tasa de Ejecución Anual representa el retorno de inversión de estado estable una vez que cada 
implementación está completamente operacional, reflejando el retorno anual logrado después del período de 
arranque inicial. Esta métrica proporciona una vista normalizada de la creación de valor a largo plazo en 
todas las oportunidades.
`;

export const FINDINGS_ANALYSIS_PART4 = `
[roi_commentary]

Todos los resultados se modelan bajo el Marco de Escenario Conservador.
Para desgloses financieros detallados, consulte el Apéndice D: Modelo de ROI y Componentes de Beneficio.
`;

export const FINDINGS_ANALYSIS_PART5 = `
5.3 Análisis de Matriz de Oportunidades

La Matriz de Oportunidades visualiza el posicionamiento de todas las oportunidades de automatización dentro de un modelo único que ubica las oportunidades en la matriz bajo los ejes de Impacto Empresarial y Esfuerzo de Implementación. Esto proporciona una vista basada en evidencia de dónde la automatización puede crear el mayor retorno relativo a la complejidad y preparación.
`;

export const FINDINGS_ANALYSIS_PART6 = `
[matrix_distribution_commentary]
`;

export const AUTOMATION_ROADMAP_INTRO = `
La Hoja de Ruta de Automatización traduce los hallazgos del diagnóstico en una secuencia estructurada de 
iniciativas que guían a {{company_name}} desde el análisis hasta la ejecución. Consolida hallazgos de la 
Rúbrica de Preparación, Análisis de ROI y Matriz de Oportunidades en un plan de implementación práctico 
y por fases.

La hoja de ruta está diseñada para:

● Entregar valor medible temprano a través de Logros Rápidos que validen la estrategia de automatización.

● Fortalecer las bases de datos, procesos e integración requeridas para escalar.

● Construir capacidad organizacional para soportar automatizaciones cada vez más complejas con el tiempo.

Este enfoque por fases asegura momentum, minimiza la interrupción y alinea el ritmo de implementación con 
la preparación organizacional.
`;

export const AUTOMATION_ROADMAP_PHASE1 = `
6.1 Fase 1 – Logros Rápidos (Corto Plazo, 0 a 6 meses)

**Objetivo:** Lograr mejoras operacionales inmediatas con complejidad y riesgo mínimos.

Los Logros Rápidos típicamente involucran flujos de trabajo repetitivos basados en reglas con datos limpios 
y conectividad de sistemas existente. Su implementación demuestra el valor de la automatización mientras 
establece confianza interna y bases de gobernanza.
`;

export const AUTOMATION_ROADMAP_PHASE1_OUTCOMES = `
**Resultados Esperados:**

● Realización rápida de ROI y ganancias de eficiencia visibles.

● Reducción de carga de trabajo manual y precisión mejorada en procesos de alto volumen.

● Establecimiento temprano de mecanismos de gobernanza y monitoreo de automatización.

[quickwin_commentary]
`;

export const AUTOMATION_ROADMAP_PHASE2 = `
6.2 Fase 2 – Mejoras Fundacionales (Mediano Plazo, 6 a 12 meses)

**Objetivo:** Fortalecer las bases tecnológicas y procedimentales requeridas para automatización escalable.

Esta fase se enfoca en flujos de trabajo que tienen potencial de ROI fuerte pero requieren mejora en 
calidad de datos, integración de sistemas o claridad de proceso antes del despliegue. Construye la columna 
vertebral operacional que permite la expansión sostenible de la capacidad de automatización.
`;

export const AUTOMATION_ROADMAP_PHASE2_OUTCOMES = `
**Áreas de Enfoque:**

● Remediación de limitaciones técnicas y de datos identificadas durante el TFA.

● Estandarización y documentación de flujos de trabajo principales para reducir la variabilidad.

● Mejora de rutas de integración y accesibilidad de datos.

● Implementación piloto de automatizaciones de complejidad media para validar mejoras de preparación.

● Fortalecimiento de procesos de gobernanza de automatización y compartición de conocimiento interno.

**Resultados Esperados:**

● Mejora de la confiabilidad de datos, interoperabilidad de sistemas y transparencia de procesos.

● Niveles de preparación más altos en múltiples flujos de trabajo.

● Fricción operacional reducida y coordinación transdepartamental mejorada.

[foundational_commentary]
`;

export const AUTOMATION_ROADMAP_PHASE3 = `
6.3 Fase 3 – Implementaciones Estratégicas (Largo Plazo, 12 a 18+ meses)

**Objetivo:** Desplegar automatizaciones de alto impacto y complejas que impulsen eficiencia transformadora 
y valor empresarial a largo plazo.

Estas iniciativas, extraídas del cuadrante de Alto Impacto / Alto Esfuerzo de la Matriz de Oportunidades, 
requieren infraestructura más fuerte y colaboración transdepartamental. En esta etapa, los Logros Rápidos 
y las fases Fundacionales habrán validado el modelo de gobernanza, haciendo viables estas transformaciones 
a gran escala.
`;

export const AUTOMATION_ROADMAP_PHASE3_OUTCOMES = `
**Áreas de Enfoque:**

● Despliegue de automatizaciones impulsadas por IA o de múltiples sistemas en todos los departamentos.

● Integración de tecnologías avanzadas como procesamiento de lenguaje natural, análisis predictivo y 
orquestación inteligente de flujos de trabajo.

● Optimización de APIs, pipelines de datos y tableros de monitoreo para sostener el rendimiento.

● Escalamiento de cobertura de automatización para asegurar continuidad de proceso de extremo a extremo.

**Resultados Esperados:**

● Mejoras medibles en velocidad, precisión y rendimiento de procesos.

● Reducción significativa de intervención manual para flujos de trabajo críticos.

● Adopción institucional de la automatización como capacidad estratégica central.

● Integridad de datos fortalecida y trazabilidad de sistemas en todas las operaciones.

[strategic_commentary]
`;

export const AUTOMATION_ROADMAP_SUMMARY = `
6.5 Resumen Narrativo

Esta hoja de ruta permite a {{company_name}} avanzar la madurez de automatización en etapas estructuradas 
y medibles. Los Logros Rápidos crean momentum y retornos financieros tempranos, las Mejoras Fundacionales 
fortalecen la infraestructura digital de la organización y las Implementaciones Estratégicas desbloquean 
valor transformador y escalabilidad transfuncional.

Cada fase está directamente informada por la evidencia de diagnóstico recopilada a través del marco de 
Automat-IA. Esto asegura que las prioridades estén fundamentadas en preparación verificada, ROI y datos 
de esfuerzo en lugar de juicio subjetivo. A medida que avanza la ejecución, la hoja de ruta debe 
actualizarse continuamente para reflejar nuevas oportunidades, puntuaciones de preparación refinadas y 
prioridades empresariales en evolución.

[roadmap_summary_commentary]
`;

export const APPENDIX_A = `
A.1 Fuentes de Datos y Recopilación

El diagnóstico integra entradas cuantitativas y cualitativas de múltiples capas organizacionales para 
asegurar profundidad analítica, integridad de datos y trazabilidad. Cada flujo captura una dimensión 
distinta de los flujos de trabajo analizados.

**Evaluaciones de Factibilidad Técnica (TFA):** Completadas por propietarios de TI y sistemas para documentar 
el entorno del sistema, calidad de datos, factibilidad de integración y postura de seguridad. Los TFA 
establecen las condiciones técnicas que determinan si la automatización es factible dentro de cada flujo 
de trabajo.

**Formularios de Perspectivas de Proceso (PIF):** Completados por propietarios de procesos y usuarios finales 
para capturar realidades operacionales. Los PIF miden claridad de proceso, magnitud de cambio y fragilidad 
de flujo de trabajo, y recopilan métricas como volumen de proceso, frecuencia, duración promedio y tasas 
de error observadas. Las entradas PIF alimentan la puntuación de preparación y el modelado de ROI.

**Entrevistas con Partes Interesadas:** Sesiones con líderes departamentales y expertos en la materia validan 
candidatos de automatización, contextualizan respuestas TFA y PIF y proporcionan datos no encontrados en 
la documentación del sistema, incluyendo rangos salariales, conteos de roles por flujo de trabajo y mapas 
de procesos de alto nivel.

**Entrevistas con Usuarios Finales:** Discusiones con quienes realizan el trabajo verifican entradas PIF, 
permiten mapeo detallado de flujos de trabajo, identifican casos extremos y aíslan etapas de alta fricción 
o propensas a errores.

**Revisión de Documentación:** Revisión de diagramas de flujos de trabajo, procedimientos operativos estándar (SOP) y documentación de sistemas 
para verificar datos de formularios y confirmar condiciones de proceso. Cuando estén disponibles, se 
incorporan documentos de política, capturas de pantalla o registros de tareas como evidencia de respaldo.

Para un registro completo de entradas de datos, vea el Apéndice F: Procedencia de Datos y Pista de 
Auditoría. Lista, por paso, el tipo de dato, fuente, nombre y rol del encuestado, departamento, método 
de recopilación y fecha.

A.2 Marcos de Diagnóstico

Automat-IA aplica un marco estructurado de múltiples capas que traduce entradas técnicas y operacionales 
en indicadores medibles de preparación y rendimiento financiero.

Evaluación de Factibilidad Técnica (TFA):
21 preguntas ponderadas puntuadas de 1 a 5, con opción "No sé" para marcar brechas. Pesos de sección: 
Entorno del Sistema 25 por ciento, Calidad de Datos 30 por ciento, Factibilidad de Integración 30 por 
ciento, Seguridad y Cumplimiento 15 por ciento. TFA produce una puntuación de preparación técnica de 0 
a 100.

Formulario de Perspectivas de Proceso (PIF):
40 preguntas capturando preparación operacional en claridad de proceso, magnitud de cambio y fragilidad 
de flujo de trabajo, más métricas cuantitativas para volúmenes, tiempos, participantes y calidad. Cuando 
existen múltiples encuestados, las respuestas se agregan con seguimiento de varianza.

Rúbrica de Preparación:
Puntuación de preparación combinada por paso usando TFA (compartido a nivel de flujo de trabajo, 60%) y 
PIF específico de paso (40%), normalizado de 0 a 100. Esta puntuación de preparación a nivel de paso es 
la entrada principal para el cálculo de Esfuerzo de Implementación en la Matriz de Oportunidades, como 
se detalla en la Sección A.5.

Calculadora de ROI de Automat-IA:
Cuantifica el impacto financiero usando datos operacionales PIF y supuestos de costos del diagnóstico. La 
calculadora aplica un modelo de conservadurismo de doble capa, produciendo beneficio anual, período de 
retorno y métricas empresariales relacionadas. Todos los cálculos son versionados y auditables.

Matriz de Oportunidades:
Capa analítica final que unifica preparación y ROI en un marco único de priorización.

● **Eje X:** Impacto Empresarial, una puntuación normalizada derivada de eficiencia y valor.

● **Eje Y:** Esfuerzo de Implementación, una puntuación compuesta ponderada que combina preparación, período 
de arranque, período de retorno y horas de capacitación. Vea la Sección A.5 para metodología detallada.

A.3 Integridad de Datos y Manejo de Brechas de Conocimiento

**Captura de brechas en TFA:** Cada pregunta soporta una respuesta "No sé" que registra razones y fuentes 
potenciales. Automat-IA luego: 1) extrae las brechas, 2) asigna seguimientos, 3) actualiza respuestas 
una vez verificadas y 4) registra el contribuyente.

**Regla de respuesta de punto medio:** Si ninguna parte interesada puede proporcionar una respuesta verificada, 
se aplica una puntuación de punto medio neutral de 3 en la escala de 1 a 5 para preservar la completitud 
del conjunto de datos. Cada sustitución de punto medio se registra explícitamente para auditabilidad.

A.4 Metodología de Puntuación de Impacto Empresarial

El Impacto Empresarial expresa el valor esperado relativo a la escala de la empresa para comparación justa 
entre clientes.

Componentes de Impacto Base y normalización.

● **Puntuación de ROI:** (ROI de tasa de ejecución anual ÷ Ingresos anuales de la empresa) × 1000, con tope 
en 100.

● **Puntuación de Horas:** (Ahorro de FTE ÷ Total de empleados) × 1000, con tope en 100.

● **Impacto Base (0 a 100)** igual a Puntuación de ROI 60 por ciento más Puntuación de Horas 40 por ciento.

La normalización por ingresos y FTEs previene sesgo hacia empresas más grandes y captura la significancia 
relativa de los beneficios.

A.5 Metodología de Puntuación de Esfuerzo de Implementación

El Esfuerzo de Implementación representa el eje vertical de la Matriz de Oportunidades y mide la complejidad 
y requisitos de recursos para llevar una oportunidad de automatización a producción. Puntuaciones más bajas 
indican implementación más fácil.

**Fórmula y pesos.**

El Esfuerzo de Implementación se calcula como un compuesto ponderado de cuatro factores:

● **Puntuación de Preparación (invertida):** 50 por ciento. Derivada de la evaluación combinada TFA (60 por 
ciento) y PIF (40 por ciento). Mayor preparación resulta en menor esfuerzo. Este es el impulsor principal 
porque refleja datos completos de evaluación del cliente en 61 preguntas combinadas.

● **Período de Arranque:** 20 por ciento. Meses estimados desde el inicio hasta la operación de estado estable. 
Normalizado en una escala donde 2 meses o menos equivale a 0 (menor esfuerzo) y 12+ meses equivale a 100 
(mayor esfuerzo).

● **Período de Retorno:** 20 por ciento. Meses estimados para recuperar costos de implementación. Normalizado 
donde 3 meses o menos equivale a 0 (menor esfuerzo) y 18+ meses equivale a 100 (mayor esfuerzo).

● **Horas de Capacitación por Empleado:** 10 por ciento. Capacitación de usuario final estimada requerida. 
Normalizada donde 1 hora o menos equivale a 0 (menor esfuerzo) y 20+ horas equivale a 100 (mayor esfuerzo).

**Fundamento para ponderación de preparación del 50 por ciento:** La Rúbrica de Preparación sintetiza datos 
reales del cliente tanto de evaluaciones técnicas (TFA) como operacionales (PIF), mientras que arranque, 
retorno y capacitación representan estimaciones generadas por analistas sujetas a refinamiento durante el 
alcance. Ponderar la preparación en 50 por ciento asegura que los datos reales del cliente anclen el 
cálculo de esfuerzo, mientras aún permite diferenciación entre oportunidades dentro del mismo flujo de 
trabajo según sus características específicas de implementación.

**Ejemplo de cálculo.**

Oportunidad con 38 por ciento de preparación, arranque de 12 meses, retorno de 18 meses, 15 horas de 
capacitación:

● **Esfuerzo de preparación (invertido):** 100 − 38 = 62 → 62 × 0.50 = 31.0

● **Esfuerzo de arranque:** ((12 − 2) ÷ (12 − 2)) × 100 = 100 → 100 × 0.20 = 20.0

● **Esfuerzo de retorno:** ((18 − 3) ÷ (18 − 3)) × 100 = 100 → 100 × 0.20 = 20.0

● **Esfuerzo de capacitación:** ((15 − 1) ÷ (20 − 1)) × 100 = 73.7 → 73.7 × 0.10 = 7.4

Esfuerzo de Implementación Total = 31.0 + 20.0 + 20.0 + 7.4 = 78.4

Esta puntuación posiciona la oportunidad en la región superior de la matriz, indicando alta complejidad 
de implementación.

A.6 Metodología de Modelado de ROI

Conservadurismo de doble capa.

**Capa 1: Estimación base basada en rúbrica.**
Rúbricas estructuradas convierten entradas PIF en porcentajes base para ahorro de tiempo, mejora de 
calidad y reasignación de ingresos, considerando tipo de proceso, complejidad, repetición y estructura 
de datos.

**Capa 2: Multiplicadores de escenario.**
Multiplicadores ajustados por riesgo reflejan tasas de adopción, manejo de excepciones, cobertura y 
madurez de integración. El escenario conservador aplica ajustes a la baja en todas las categorías de 
beneficio.

**Fórmulas clave.**

● **Beneficio Anual =** Valor de ahorro de tiempo + Valor de mejora de calidad + Valor de incremento de 
ingresos.

● **Retorno (meses) =** Costo de implementación ÷ Beneficio Anual × 12.

● **ROI por ciento** (usado en metodología y matrices, incluso si no se muestra en cada tabla) **=** 
(Beneficio Anual − Costo anual) ÷ Costo anual × 100.

Las entradas, parámetros y versiones están documentados en el Apéndice E: Metodología de Calculadora 
de ROI.

A.7 Metodología de Matriz de Oportunidades

La Matriz de Oportunidades convierte preparación e impacto empresarial en un modelo de priorización 
transparente.

**Marco de dos matrices:**
1. **Matriz de Oportunidades Base 0 a 100:** Comparación de eficiencia pura en base consistente relativa a 
la empresa usando Impacto Base.
2. **Matriz de Oportunidades Mejorada 0 a 150:** Agrega valor más allá de la eficiencia:

○ Bonificación de Reducción de Errores hasta 25 puntos basada en tasas de error medidas y reelaboración 
evitada.

○ Bonificación de Incremento de Ingresos hasta 25 puntos basada en reasignación de capacidad validada 
hacia actividades de ingresos.

Impacto Mejorado = Impacto Base + Bonificación de Errores + Bonificación de Ingresos. Mejorado es 
siempre mayor o igual a Base.

**Ejes:**

● **Eje X:** Impacto Empresarial (Base o Mejorado, dependiendo de la vista presentada).

● **Eje Y:** Esfuerzo de Implementación (0 a 100), un compuesto ponderado que combina puntuación de preparación 
(50 por ciento), período de arranque (20 por ciento), período de retorno (20 por ciento) y horas de 
capacitación (10 por ciento). Vea la Sección A.5 para metodología detallada.

**Cuadrantes:**

● **Logros Rápidos:** Alto impacto y bajo esfuerzo.

● **Apuestas Estratégicas:** Alto impacto y alto esfuerzo.

● **Deseables:** Bajo impacto y bajo esfuerzo.

● **Despriorizar:** Bajo impacto y alto esfuerzo.

A.8 Metodología de Desarrollo de Hoja de Ruta

La secuenciación de la hoja de ruta se deriva directamente de posiciones en la matriz y evidencia de 
diagnóstico.

Fase 1 Logros Rápidos 0 a 6 meses. Elementos de bajo esfuerzo y alto impacto ejecutados primero para 
entregar ROI rápidamente y validar gobernanza, conexiones de datos y monitoreo.

Fase 2 Mejoras Fundacionales 6 a 12 meses. Abordar calidad de datos, integración y brechas de 
documentación y pilotear automatizaciones de complejidad media para elevar la preparación.

Fase 3 Implementaciones Estratégicas 12 a 18 meses más. Automatizaciones de alto impacto y mayor esfuerzo 
que se extienden entre sistemas y funciones, a menudo con componentes de IA y requisitos de orquestación.

La secuenciación también considera dependencias técnicas, temporización de realización de valor, capacidad 
de recursos, cadencia de gestión del cambio y ciclos presupuestarios.

A.9 Limitaciones Metodológicas

Este diagnóstico es una evaluación puntual de preparación y valor potencial, no un plan de implementación 
detallado.

**Dependencia de datos del cliente:** Los TFA, PIF y entrevistas son autoreportados. Las inexactitudes u 
omisiones pueden afectar la precisión. Las reglas de punto medio y seguimientos mitigan pero no eliminan 
este riesgo.

**Límite de alcance:** Los hallazgos se enfocan en factibilidad, madurez e impacto a profundidad de diagnóstico. 
El diseño de solución, validación de integración y selección de proveedores ocurren en fases subsiguientes.

**Incertidumbre y cambio:** Los cambios de sistema, cambios de política o condiciones de mercado pueden alterar 
la factibilidad y los beneficios. Se usa modelado conservador y normalización para evitar sobreestimar el 
impacto.
`;

export const APPENDIX_D_INTRO = `
Este apéndice proporciona una vista financiera auditable de cada oportunidad de automatización validada. 
Los resultados se modelan utilizando el Marco de Escenario Conservador de Automat-IA a menos que se 
indique lo contrario. Las cifras financieras se redondean al centenar más cercano.

D.1 Tabla de Resumen de Portafolio
`;

export const APPENDIX_D_MODELING_NOTES = `
D.3 Notas de Modelado y Trazabilidad

● Los cálculos siguen la Calculadora de ROI de Automat-IA y el Marco de Escenario Conservador.

● Las entradas se originan de respuestas PIF validadas, entrevistas con partes interesadas y revisión 
de documentación; vea el Apéndice F: Procedencia de Datos y Pista de Auditoría para nombres de 
encuestados, roles, fechas y cualquier supuesto de punto medio.

● Cuando los datos de calidad o ingresos no están verificados, los valores se mantienen en cero hasta 
que se validen para evitar inflar el beneficio.

● El período de retorno se calcula usando el motor de ROI basado en costo de implementación y beneficio 
anual.

● Las conversiones de FTE se basan en 2,080 horas por año (equivalente estándar de tiempo completo).
`;

export const APPENDIX_E_PART1 = `
Este apéndice documenta la lógica financiera y controles de escenarios utilizados para generar las 
proyecciones de ROI, retorno y beneficios de Automat-IA. Todos los cálculos se realizan bajo el Marco 
de Escenario Conservador, asegurando que cada cifra en este informe sea realista, ajustada por riesgo 
y auditable.

E.1 Fórmulas Financieras Centrales

**Retorno de Inversión (ROI)**

**ROI (%)** = (Beneficio Neto / Costos Totales) × 100

**Componentes:**
**Beneficio Neto** = Beneficios Anuales Totales − Costos Anuales Totales
**Costos Totales** = Implementación + Software + Capacitación + Gestión del Cambio

**Interpretación:**
El ROI expresa el retorno financiero anual de estado estable después de que la automatización está 
completamente operacional. Un ROI positivo indica que los beneficios anualizados exceden los costos totales.

**Período de Retorno (Meses)**

**Retorno** = Inversión Total / Beneficio Neto Mensual

**Beneficio Neto Mensual** = (Beneficios Anuales − Costos Recurrentes) / 12

**Interpretación:**
Mide cuántos meses se requieren para que los beneficios netos acumulativos recuperen la inversión inicial, 
incluyendo un factor de arranque de Año-1 para reflejar adopción progresiva en lugar de realización 
instantánea.

E.2 Fórmulas de Beneficio Neto
`;

export const APPENDIX_E_PART2 = `
E.3 Conversiones de FTE y Horas

**FTE Ahorrados** = Horas Anuales Ahorradas / 2,080

**Horas Anuales Ahorradas** = (Horas de Proceso Semanales × Empleados Involucrados × % de Ahorro de Tiempo) × 52

**Año de Trabajo Estándar:** 2,080 horas (52 semanas × 40 horas)

**Interpretación:** Convierte el tiempo ahorrado en capacidad equivalente de tiempo completo. Los FTE 
fraccionarios indican tiempo redesplegable en lugar de reducción de plantilla.

E.4 Desglose de Beneficio Anual

**Beneficios Anuales Totales** = Beneficios de Ahorro de Tiempo + Beneficios de Reducción de Errores + 
Beneficios de Incremento de Ingresos
`;

export const APPENDIX_E_PART3 = `
E.5 Marco de Ajuste de Escenarios

Para reflejar las realidades de ejecución del mundo real, Automat-IA aplica cinco capas de ajuste que 
moderan tanto las estimaciones de beneficios como de costos:
`;

export const APPENDIX_E_PART4 = `
E.6 Supuestos Clave de Modelado
`;

export const APPENDIX_E_PART5 = `
E.7 Integridad de Fórmulas y Pista de Auditoría

Todos los cálculos se realizan utilizando el Marco de Calculadora de ROI propietario de Automat-IA, un 
motor analítico estructurado construido sobre el Marco de Escenario Conservador. Esta metodología 
prioriza la credibilidad sobre el optimismo a través de:

● **Sistema de rúbrica de múltiples capas:** TFA (21 preguntas ponderadas en 4 dimensiones técnicas) y 
PIF (40 preguntas en 8 dimensiones operacionales) proporcionan granularidad a nivel de paso para 
evaluación de preparación precisa.

● **Pista de auditoría transparente:** Cada entrada está vinculada a su encuestado fuente, método de 
recopilación y fecha de validación, permitiendo trazabilidad completa desde datos brutos hasta 
proyecciones finales.

● **Metodología respaldada por investigación:** Los multiplicadores conservadores reflejan desafíos de 
implementación del mundo real, asegurando estimaciones financieras defendibles que los clientes 
pueden verificar internamente.

● **Arquitectura de análisis a nivel de paso:** Cada paso de flujo de trabajo recibe evaluación independiente, 
con TFA compartido a nivel de flujo de trabajo (60% de peso) y PIF recopilado por paso (40% de peso) 
para cálculo preciso de Esfuerzo de Implementación.

Cada cifra en este informe puede rastrearse hasta su conjunto de datos de origen en el Apéndice F: 
Procedencia de Datos y Pista de Auditoría.
`;

/**
 * Importar y re-exportar traducciones desde archivo de traducción centralizado
 * Esto asegura consistencia entre las traducciones en Inglés y Español
 */
import { es as TRANSLATIONS } from './reportTranslations';
export { TRANSLATIONS };
