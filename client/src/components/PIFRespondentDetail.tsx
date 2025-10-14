import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase, FileText } from "lucide-react";
import { format } from "date-fns";
import type { PIFResponse } from "@shared/schema";
import { ALL_PIF_QUESTIONS } from "@shared/pifQuestions";

interface PIFRespondentDetailProps {
  response: PIFResponse;
}

export function PIFRespondentDetail({ response }: PIFRespondentDetailProps) {
  const responses = response.responses as Record<string, string>;
  const roiInputs = response.roiInputs as any;
  const qualitative = response.qualitativeResponses as Record<string, string>;

  // Group questions by section
  const sections = ALL_PIF_QUESTIONS.reduce((acc, q) => {
    if (!acc[q.section]) {
      acc[q.section] = [];
    }
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, typeof ALL_PIF_QUESTIONS>);

  const getQuestionResponse = (questionId: number) => {
    const question = ALL_PIF_QUESTIONS.find(q => q.id === questionId);
    const responseValue = responses[questionId.toString()];
    
    if (!responseValue) return null;
    
    if (question?.type === 'radio' && question.options) {
      const option = question.options.find(o => o.value === responseValue);
      return option?.label || responseValue;
    }
    
    return responseValue;
  };

  return (
    <div className="space-y-6">
      {/* Respondent Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Respondent Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Name</p>
              <p className="font-medium" data-testid="text-detail-name">{response.respondentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Role</p>
              <Badge variant="secondary" data-testid="badge-detail-role">{response.respondentRole}</Badge>
            </div>
          </div>
          
          {response.respondentResponsibilities && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Responsibilities</p>
              <p className="text-sm">{response.respondentResponsibilities}</p>
            </div>
          )}
          
          {response.completedAt && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-sm">{format(new Date(response.completedAt), 'PPP')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Operational Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Operational Readiness Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {response.processClarity && (
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{response.processClarity}</p>
                <p className="text-sm text-muted-foreground">Process Clarity</p>
              </div>
            )}
            {response.changeMagnitude && (
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{response.changeMagnitude}</p>
                <p className="text-sm text-muted-foreground">Change Magnitude</p>
              </div>
            )}
            {response.workflowBrittleness && (
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{response.workflowBrittleness}</p>
                <p className="text-sm text-muted-foreground">Workflow Brittleness</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ROI Inputs */}
      {roiInputs && Object.keys(roiInputs).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ROI Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {roiInputs.employeeCount && (
                <div>
                  <p className="text-muted-foreground mb-1">Employees</p>
                  <p className="font-medium">{roiInputs.employeeCount}</p>
                </div>
              )}
              {roiInputs.frequency && (
                <div>
                  <p className="text-muted-foreground mb-1">Frequency</p>
                  <p className="font-medium capitalize">{roiInputs.frequency}</p>
                </div>
              )}
              {roiInputs.processesPerPeriod && (
                <div>
                  <p className="text-muted-foreground mb-1">Processes per Period</p>
                  <p className="font-medium">{roiInputs.processesPerPeriod}</p>
                </div>
              )}
              {roiInputs.minutesPerProcess && (
                <div>
                  <p className="text-muted-foreground mb-1">Minutes per Process</p>
                  <p className="font-medium">{roiInputs.minutesPerProcess}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Detailed Responses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(sections).map(([sectionName, questions]) => (
            <div key={sectionName}>
              <h4 className="font-semibold mb-3">{sectionName}</h4>
              <div className="space-y-3">
                {questions.map((question) => {
                  const answer = getQuestionResponse(question.id);
                  if (!answer) return null;
                  
                  return (
                    <div key={question.id} className="text-sm">
                      <p className="text-muted-foreground mb-1">Q{question.id}. {question.question}</p>
                      <p className="font-medium">{answer}</p>
                    </div>
                  );
                })}
              </div>
              {sectionName !== Object.keys(sections).pop() && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Qualitative Responses */}
      {qualitative && Object.keys(qualitative).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(qualitative).map(([questionId, answer]) => {
              const question = ALL_PIF_QUESTIONS.find(q => q.id.toString() === questionId);
              if (!question || !answer) return null;
              
              return (
                <div key={questionId} className="text-sm">
                  <p className="text-muted-foreground mb-1">Q{question.id}. {question.question}</p>
                  <p className="whitespace-pre-wrap">{answer}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
