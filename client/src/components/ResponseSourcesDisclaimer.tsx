import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Info, Users } from "lucide-react";
import { TFA_QUESTIONS } from "@shared/tfaQuestions";

interface ResponseSource {
  answeredBy: string;
  reason: string;
  answeredAt: string;
}

interface ResponseSourcesDisclaimerProps {
  initialRespondent?: string;
  responseSources?: Record<string, ResponseSource>;
}

export default function ResponseSourcesDisclaimer({ 
  initialRespondent, 
  responseSources 
}: ResponseSourcesDisclaimerProps) {
  // If no response sources, don't show anything
  if (!responseSources || Object.keys(responseSources).length === 0) {
    if (initialRespondent) {
      return (
        <Alert variant="default" className="border-primary/50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <p className="text-sm">
              <strong>Assessment completed by:</strong> {initialRespondent}
            </p>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  }

  // Group sources by person
  const sourcesByPerson: Record<string, { questionIds: number[], reason: string }> = {};
  
  Object.entries(responseSources).forEach(([questionId, source]) => {
    if (!sourcesByPerson[source.answeredBy]) {
      sourcesByPerson[source.answeredBy] = {
        questionIds: [],
        reason: source.reason,
      };
    }
    sourcesByPerson[source.answeredBy].questionIds.push(parseInt(questionId));
  });

  const getQuestionText = (questionId: number): string => {
    const question = TFA_QUESTIONS.find(q => q.id === questionId);
    return question ? question.question.split(':')[0] : `Question ${questionId}`;
  };

  return (
    <Card className="p-6 border-2 border-primary/50 bg-primary/5">
      <div className="flex items-start gap-3">
        <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-base mb-1">Multi-Source Assessment</h3>
            <p className="text-sm text-muted-foreground">
              This assessment incorporates information from multiple sources within the organization for complete accuracy.
            </p>
          </div>

          {initialRespondent && (
            <div className="text-sm">
              <span className="font-medium">Initial assessment by:</span> {initialRespondent}
            </div>
          )}

          <div className="space-y-3 pt-2 border-t border-border">
            <p className="text-sm font-medium">Additional information provided by:</p>
            {Object.entries(sourcesByPerson).map(([person, data]) => (
              <div key={person} className="bg-background/50 rounded-lg p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{person}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <strong>Reason:</strong> {data.reason}
                    </p>
                  </div>
                </div>
                <div className="pl-0">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Questions answered:</p>
                  <ul className="list-disc list-inside text-xs text-muted-foreground space-y-0.5">
                    {data.questionIds.map(qId => (
                      <li key={qId}>{getQuestionText(qId)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground pt-2 border-t border-border">
            All responses have been verified and consolidated for this comprehensive assessment. The multi-source approach ensures complete and accurate technical feasibility evaluation.
          </p>
        </div>
      </div>
    </Card>
  );
}
