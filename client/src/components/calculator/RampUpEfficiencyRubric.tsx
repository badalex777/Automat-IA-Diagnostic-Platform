import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface RubricAnswers {
  complexity: string;
  digitalComfort: string;
  rolloutApproach: string;
  supportStructure: string;
}

interface RampUpEfficiencyRubricProps {
  value: number;
  rubricAnswers: RubricAnswers;
  onRubricChange: (answers: RubricAnswers, newEfficiencyValue: number) => void;
}

/**
 * Ramp-Up Efficiency Rubric (per spec)
 * 
 * Formula: efficiency = 100 × complexity × digitalComfort × rolloutApproach × supportStructure
 * 
 * Weights per spec:
 * Q1: Complexity - Low=1.1, Moderate=1.0, High=0.85, Very High=0.7
 * Q2: Digital Comfort - Very uncomfortable=0.7, Somewhat=0.85, Neutral=1.0, Comfortable=1.1, Very comfortable=1.2
 * Q3: Rollout Approach - Pilot first=1.1, Phased=1.0, Parallel=0.9, Big bang=0.8
 * Q4: Support Structure - Strong=1.1, Basic=0.95, Minimal=0.8
 * 
 * Capping: Result is capped 20-150%
 */
export default function RampUpEfficiencyRubric({ 
  value, 
  rubricAnswers, 
  onRubricChange 
}: RampUpEfficiencyRubricProps) {
  const handleAnswerChange = (field: keyof RubricAnswers, answer: string) => {
    const newAnswers = { ...rubricAnswers, [field]: answer };
    
    // Per spec: Multiplicative weights
    const weights = {
      complexity: { low: 1.1, moderate: 1.0, high: 0.85, very_high: 0.7 },
      digitalComfort: { very_comfortable: 1.2, comfortable: 1.1, neutral: 1.0, somewhat_uncomfortable: 0.85, very_uncomfortable: 0.7 },
      rolloutApproach: { pilot_first: 1.1, phased: 1.0, parallel: 0.9, bigbang: 0.8 },
      supportStructure: { strong: 1.1, basic: 0.95, minimal: 0.8 }
    };
    
    // Get multipliers (default to 1.0 if not selected)
    const complexityMult = weights.complexity[newAnswers.complexity as keyof typeof weights.complexity] || 1.0;
    const comfortMult = weights.digitalComfort[newAnswers.digitalComfort as keyof typeof weights.digitalComfort] || 1.0;
    const rolloutMult = weights.rolloutApproach[newAnswers.rolloutApproach as keyof typeof weights.rolloutApproach] || 1.0;
    const supportMult = weights.supportStructure[newAnswers.supportStructure as keyof typeof weights.supportStructure] || 1.0;
    
    // Per spec: efficiency = 100 × complexity × digitalComfort × rolloutApproach × supportStructure
    const rawEfficiency = 100 * complexityMult * comfortMult * rolloutMult * supportMult;
    
    // Per spec: Result is capped 20-150%
    const newEfficiencyValue = Math.round(Math.max(20, Math.min(150, rawEfficiency)));
    
    onRubricChange(newAnswers, newEfficiencyValue);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Ramp-Up Efficiency Factors</CardTitle>
          <Badge variant="secondary" data-testid="badge-rampup-percentage">
            {value}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Implementation Complexity</Label>
          <RadioGroup
            value={rubricAnswers.complexity}
            onValueChange={(val) => handleAnswerChange('complexity', val)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="complexity-low" data-testid="radio-complexity-low" />
              <Label htmlFor="complexity-low" className="font-normal">Low (1.1x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="complexity-moderate" data-testid="radio-complexity-moderate" />
              <Label htmlFor="complexity-moderate" className="font-normal">Moderate (1.0x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="complexity-high" data-testid="radio-complexity-high" />
              <Label htmlFor="complexity-high" className="font-normal">High (0.85x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="very_high" id="complexity-very-high" data-testid="radio-complexity-very-high" />
              <Label htmlFor="complexity-very-high" className="font-normal">Very High (0.7x)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Team Digital Comfort</Label>
          <RadioGroup
            value={rubricAnswers.digitalComfort}
            onValueChange={(val) => handleAnswerChange('digitalComfort', val)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="very_comfortable" id="comfort-very-comfortable" data-testid="radio-comfort-very-comfortable" />
              <Label htmlFor="comfort-very-comfortable" className="font-normal">Very Comfortable (1.2x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="comfort-comfortable" data-testid="radio-comfort-comfortable" />
              <Label htmlFor="comfort-comfortable" className="font-normal">Comfortable (1.1x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="neutral" id="comfort-neutral" data-testid="radio-comfort-neutral" />
              <Label htmlFor="comfort-neutral" className="font-normal">Neutral (1.0x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="somewhat_uncomfortable" id="comfort-somewhat-uncomfortable" data-testid="radio-comfort-somewhat-uncomfortable" />
              <Label htmlFor="comfort-somewhat-uncomfortable" className="font-normal">Somewhat Uncomfortable (0.85x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="very_uncomfortable" id="comfort-very-uncomfortable" data-testid="radio-comfort-very-uncomfortable" />
              <Label htmlFor="comfort-very-uncomfortable" className="font-normal">Very Uncomfortable (0.7x)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Rollout Approach</Label>
          <RadioGroup
            value={rubricAnswers.rolloutApproach}
            onValueChange={(val) => handleAnswerChange('rolloutApproach', val)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pilot_first" id="rollout-pilot" data-testid="radio-rollout-pilot" />
              <Label htmlFor="rollout-pilot" className="font-normal">Pilot First (1.1x - Safest)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phased" id="rollout-phased" data-testid="radio-rollout-phased" />
              <Label htmlFor="rollout-phased" className="font-normal">Phased (1.0x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="parallel" id="rollout-parallel" data-testid="radio-rollout-parallel" />
              <Label htmlFor="rollout-parallel" className="font-normal">Parallel (0.9x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bigbang" id="rollout-bigbang" data-testid="radio-rollout-bigbang" />
              <Label htmlFor="rollout-bigbang" className="font-normal">Big Bang (0.8x - Riskiest)</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label>Support Structure</Label>
          <RadioGroup
            value={rubricAnswers.supportStructure}
            onValueChange={(val) => handleAnswerChange('supportStructure', val)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="strong" id="support-strong" data-testid="radio-support-strong" />
              <Label htmlFor="support-strong" className="font-normal">Strong (1.1x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="basic" id="support-basic" data-testid="radio-support-basic" />
              <Label htmlFor="support-basic" className="font-normal">Basic (0.95x)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="support-minimal" data-testid="radio-support-minimal" />
              <Label htmlFor="support-minimal" className="font-normal">Minimal (0.8x)</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
