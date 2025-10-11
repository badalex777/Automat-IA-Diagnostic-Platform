import { TFA_QUESTIONS } from "./tfaQuestions";

export interface KnowledgeGap {
  questionId: number;
  question: string;
  section: string;
}

/**
 * Detects knowledge gaps in TFA responses
 * Returns list of questions answered with "Don't Know" (value "0")
 */
export function detectKnowledgeGaps(responses: Record<string, string>): KnowledgeGap[] {
  const gaps: KnowledgeGap[] = [];

  TFA_QUESTIONS.forEach((question) => {
    const response = responses[question.id.toString()];
    
    // Check if response is "Don't Know" (value "0") or missing
    if (response === "0") {
      gaps.push({
        questionId: question.id,
        question: question.question,
        section: question.section,
      });
    }
  });

  return gaps;
}

/**
 * Checks if assessment has any knowledge gaps
 */
export function hasKnowledgeGaps(responses: Record<string, string>): boolean {
  return detectKnowledgeGaps(responses).length > 0;
}

/**
 * Groups knowledge gaps by section for better display
 */
export function groupGapsBySection(gaps: KnowledgeGap[]): Record<string, KnowledgeGap[]> {
  const grouped: Record<string, KnowledgeGap[]> = {};
  
  gaps.forEach(gap => {
    if (!grouped[gap.section]) {
      grouped[gap.section] = [];
    }
    grouped[gap.section].push(gap);
  });
  
  return grouped;
}
