import { useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TFAQuestionCard from "@/components/TFAQuestionCard";

//todo: remove mock functionality
const mockQuestions = [
  {
    section: 'System Environment',
    weight: 20,
    questions: [
      {
        id: 1,
        question: 'Deployment model: How are the main systems for this workflow deployed?',
        weight: 5,
        options: [
          { value: '1', label: 'Legacy on-prem only', description: 'Very Low Feasibility / Major Limitation' },
          { value: '2', label: 'Mostly on-prem, some cloud', description: 'Low Feasibility / Several Limitations' },
          { value: '3', label: 'Mixed/hybrid', description: 'Moderate Feasibility / Some Workarounds Possible' },
          { value: '4', label: 'Mostly cloud SaaS', description: 'Good Feasibility / Minor Constraints' },
          { value: '5', label: 'Modern cloud SaaS only', description: 'Excellent Feasibility / Fully Ready' },
        ],
      },
    ],
  },
];

export default function TFAForm() {
  const [, params] = useRoute("/tfa/:workflowId");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(0);

  const searchParams = new URLSearchParams(window.location.search);
  const companyName = searchParams.get('company') || 'Company Name';
  const workflowTitle = searchParams.get('workflow') || 'Workflow Title';

  const totalQuestions = mockQuestions.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleSubmit = () => {
    console.log('TFA submitted:', answers);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold" data-testid="text-tfa-title">Technical Feasibility Assessment</h1>
            <p className="text-sm text-muted-foreground mt-1">{companyName} • {workflowTitle}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-mono">{answeredQuestions} / {totalQuestions}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {mockQuestions[currentSection].questions.map((q) => (
            <TFAQuestionCard
              key={q.id}
              questionNumber={q.id}
              question={q.question}
              weight={q.weight}
              options={q.options}
              value={answers[q.id.toString()]}
              onChange={(value) => setAnswers({ ...answers, [q.id.toString()]: value })}
            />
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
          <Button variant="outline" data-testid="button-save-draft">
            Save Draft
          </Button>
          <Button onClick={handleSubmit} data-testid="button-submit-tfa">
            Submit Assessment
          </Button>
        </div>
      </div>
    </div>
  );
}
