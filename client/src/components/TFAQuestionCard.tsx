import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface TFAQuestionCardProps {
  question: string;
  questionNumber: number;
  weight: number;
  options: { value: string; label: string; description: string }[];
  value?: string;
  onChange: (value: string) => void;
}

export default function TFAQuestionCard({
  question,
  questionNumber,
  weight,
  options,
  value,
  onChange,
}: TFAQuestionCardProps) {
  return (
    <div className="space-y-4" data-testid={`question-card-${questionNumber}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-xs font-mono">{questionNumber}</Badge>
            <h3 className="font-semibold text-base">{question}</h3>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs flex-shrink-0">
          Weight: {weight}%
        </Badge>
      </div>

      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {options.map((option) => (
          <div
            key={option.value}
            className={`flex items-start space-x-3 p-4 rounded-md border transition-all cursor-pointer ${
              value === option.value
                ? "border-primary bg-primary/5"
                : "border-border hover-elevate"
            }`}
            onClick={() => onChange(option.value)}
          >
            <RadioGroupItem 
              value={option.value} 
              id={`q${questionNumber}-${option.value}`} 
              className="mt-0.5"
              data-testid={`radio-option-${questionNumber}-${option.value}`}
            />
            <Label
              htmlFor={`q${questionNumber}-${option.value}`}
              className="flex-1 cursor-pointer space-y-1"
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.description}</div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
