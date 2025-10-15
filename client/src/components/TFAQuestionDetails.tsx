import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, AlertCircle, Info, Search } from "lucide-react";
import { TFA_QUESTIONS, QUESTION_RECOMMENDATIONS } from "@shared/tfaQuestions";

interface TFAQuestionDetailsProps {
  responses: Record<string, string>;
  respondents: Array<{
    questionId: number;
    respondentName: string;
    respondentRole?: string;
    source?: string;
  }>;
}

type ScoreRange = "all" | "critical" | "weak" | "moderate" | "strong" | "optimal";
type SectionFilter = "all" | "System Environment" | "Data Quality" | "Integration Feasibility" | "Security/Compliance";

export function TFAQuestionDetails({ responses, respondents }: TFAQuestionDetailsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreRange>("all");
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");

  // Build question details with scores and recommendations
  const questionDetails = useMemo(() => {
    return TFA_QUESTIONS.map(question => {
      const response = responses[question.id.toString()];
      const selectedOption = question.options.find(opt => opt.value === response);
      const score = selectedOption?.score ?? null;
      
      // Get respondent info
      const respondent = respondents.find(r => r.questionId === question.id);
      
      // Get recommendation if score exists
      const recommendation = score !== null && score >= 1 && score <= 5
        ? QUESTION_RECOMMENDATIONS[question.id]?.[score]
        : null;

      return {
        id: question.id,
        question: question.question,
        section: question.section,
        score,
        selectedLabel: selectedOption?.label,
        selectedDescription: selectedOption?.description,
        respondentName: respondent?.respondentName,
        respondentRole: respondent?.respondentRole,
        source: respondent?.source,
        recommendation,
      };
    });
  }, [responses, respondents]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questionDetails.filter(q => {
      // Exclude "Don't Know" responses (null scores)
      if (q.score === null) return false;

      // Section filter
      if (sectionFilter !== "all" && q.section !== sectionFilter) return false;

      // Score range filter (mutually exclusive integer ranges)
      if (scoreFilter !== "all") {
        if (scoreFilter === "critical" && (q.score === null || q.score !== 1)) return false;  // 1 only
        if (scoreFilter === "weak" && (q.score === null || q.score !== 2)) return false;  // 2 only
        if (scoreFilter === "moderate" && (q.score === null || q.score !== 3)) return false;  // 3 only
        if (scoreFilter === "strong" && (q.score === null || q.score !== 4)) return false;  // 4 only
        if (scoreFilter === "optimal" && (q.score === null || q.score !== 5)) return false;  // 5 only
      }

      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          q.question.toLowerCase().includes(query) ||
          q.selectedLabel?.toLowerCase().includes(query) ||
          q.recommendation?.toLowerCase().includes(query) ||
          q.section.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [questionDetails, sectionFilter, scoreFilter, searchQuery]);

  // Get score badge
  const getScoreBadge = (score: number | null) => {
    if (score === null) return null;

    let variant: "default" | "destructive" | "secondary" | "outline" = "default";
    let icon = <Info className="h-3 w-3" />;
    let label = "";

    if (score === 1) {
      variant = "destructive";
      icon = <AlertTriangle className="h-3 w-3" />;
      label = "Critical";
    } else if (score === 2) {
      variant = "outline";
      icon = <AlertCircle className="h-3 w-3" />;
      label = "Weak";
    } else if (score === 3) {
      variant = "secondary";
      icon = <Info className="h-3 w-3" />;
      label = "Moderate";
    } else if (score === 4) {
      variant = "default";
      icon = <CheckCircle2 className="h-3 w-3" />;
      label = "Strong";
    } else if (score === 5) {
      variant = "default";
      icon = <CheckCircle2 className="h-3 w-3" />;
      label = "Optimal";
    }

    return (
      <Badge variant={variant} className="gap-1" data-testid={`badge-score-${label.toLowerCase()}`}>
        {icon}
        {label} ({score}/5)
      </Badge>
    );
  };

  const resolvedCount = questionDetails.filter(q => q.score !== null).length;
  const unresolvedCount = questionDetails.filter(q => q.score === null).length;

  return (
    <div className="space-y-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground" data-testid="text-resolved-count">
            {resolvedCount} answered · {unresolvedCount} pending
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions, answers, or recommendations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-questions"
          />
        </div>
        
        <Select value={sectionFilter} onValueChange={(value) => setSectionFilter(value as SectionFilter)}>
          <SelectTrigger className="w-[220px]" data-testid="select-section-filter">
            <SelectValue placeholder="All sections" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sections</SelectItem>
            <SelectItem value="System Environment">System Environment</SelectItem>
            <SelectItem value="Data Quality">Data Quality</SelectItem>
            <SelectItem value="Integration Feasibility">Integration Feasibility</SelectItem>
            <SelectItem value="Security/Compliance">Security/Compliance</SelectItem>
          </SelectContent>
        </Select>

        <Select value={scoreFilter} onValueChange={(value) => setScoreFilter(value as ScoreRange)}>
          <SelectTrigger className="w-[180px]" data-testid="select-score-filter">
            <SelectValue placeholder="All scores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All scores</SelectItem>
            <SelectItem value="critical">Critical (1)</SelectItem>
            <SelectItem value="weak">Weak (2)</SelectItem>
            <SelectItem value="moderate">Moderate (3)</SelectItem>
            <SelectItem value="strong">Strong (4)</SelectItem>
            <SelectItem value="optimal">Optimal (5)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Question list */}
      {filteredQuestions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p data-testid="text-no-results">No questions match your filters</p>
            <p className="text-sm mt-2">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredQuestions.map((q) => (
            <Card key={q.id} className="hover-elevate" data-testid={`question-detail-card-${q.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs" data-testid={`badge-section-${q.id}`}>
                        {q.section}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Q{q.id}</span>
                    </div>
                    <CardTitle className="text-base" data-testid={`text-question-${q.id}`}>
                      {q.question}
                    </CardTitle>
                  </div>
                  {getScoreBadge(q.score)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Selected answer */}
                <div className="space-y-1">
                  <p className="text-sm font-medium">Answer:</p>
                  <p className="text-sm" data-testid={`text-answer-${q.id}`}>
                    {q.selectedLabel}
                    {q.selectedDescription && (
                      <span className="text-muted-foreground"> — {q.selectedDescription}</span>
                    )}
                  </p>
                </div>

                {/* Respondent */}
                {q.respondentName && (
                  <div className="text-xs text-muted-foreground" data-testid={`text-respondent-${q.id}`}>
                    Answered by: {q.respondentName}
                    {q.respondentRole && ` (${q.respondentRole})`}
                    {q.source && ` · Source: ${q.source}`}
                  </div>
                )}

                {/* Recommendation */}
                {q.recommendation && (
                  <div className="rounded-md bg-muted/50 p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Recommendation
                    </p>
                    <p className="text-sm" data-testid={`text-recommendation-${q.id}`}>
                      {q.recommendation}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
