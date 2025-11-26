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

export default function RampUpEfficiencyRubric({ 
  value, 
  rubricAnswers, 
  onRubricChange 
}: RampUpEfficiencyRubricProps) {
  const handleAnswerChange = (field: keyof RubricAnswers, answer: string) => {
    const newAnswers = { ...rubricAnswers, [field]: answer };
    
    const scores = {
      complexity: { low: 20, moderate: 0, high: -15, very_high: -20 },
      digitalComfort: { very_comfortable: 20, comfortable: 10, neutral: 0, somewhat_uncomfortable: -10, very_uncomfortable: -20 },
      rolloutApproach: { bigbang: 15, parallel: 10, phased: 0, pilot_first: -10 },
      supportStructure: { strong: 15, basic: 0, minimal: -15 }
    };
    
    const totalAdjustment = 
      (scores.complexity[newAnswers.complexity as keyof typeof scores.complexity] || 0) +
      (scores.digitalComfort[newAnswers.digitalComfort as keyof typeof scores.digitalComfort] || 0) +
      (scores.rolloutApproach[newAnswers.rolloutApproach as keyof typeof scores.rolloutApproach] || 0) +
      (scores.supportStructure[newAnswers.supportStructure as keyof typeof scores.supportStructure] || 0);
    
    const newEfficiencyValue = Math.max(20, Math.min(150, 100 + totalAdjustment));
    
    onRubricChange(newAnswers, newEfficiencyValue);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
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
              <Label htmlFor="complexity-low" className="font-normal">Low (+20%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="complexity-moderate" data-testid="radio-complexity-moderate" />
              <Label htmlFor="complexity-moderate" className="font-normal">Moderate (0%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="high" id="complexity-high" data-testid="radio-complexity-high" />
              <Label htmlFor="complexity-high" className="font-normal">High (-15%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="very_high" id="complexity-very-high" data-testid="radio-complexity-very-high" />
              <Label htmlFor="complexity-very-high" className="font-normal">Very High (-20%)</Label>
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
              <Label htmlFor="comfort-very-comfortable" className="font-normal">Very Comfortable (+20%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="comfortable" id="comfort-comfortable" data-testid="radio-comfort-comfortable" />
              <Label htmlFor="comfort-comfortable" className="font-normal">Comfortable (+10%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="neutral" id="comfort-neutral" data-testid="radio-comfort-neutral" />
              <Label htmlFor="comfort-neutral" className="font-normal">Neutral (0%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="somewhat_uncomfortable" id="comfort-somewhat-uncomfortable" data-testid="radio-comfort-somewhat-uncomfortable" />
              <Label htmlFor="comfort-somewhat-uncomfortable" className="font-normal">Somewhat Uncomfortable (-10%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="very_uncomfortable" id="comfort-very-uncomfortable" data-testid="radio-comfort-very-uncomfortable" />
              <Label htmlFor="comfort-very-uncomfortable" className="font-normal">Very Uncomfortable (-20%)</Label>
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
              <RadioGroupItem value="bigbang" id="rollout-bigbang" data-testid="radio-rollout-bigbang" />
              <Label htmlFor="rollout-bigbang" className="font-normal">Big Bang (+15%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="parallel" id="rollout-parallel" data-testid="radio-rollout-parallel" />
              <Label htmlFor="rollout-parallel" className="font-normal">Parallel (+10%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phased" id="rollout-phased" data-testid="radio-rollout-phased" />
              <Label htmlFor="rollout-phased" className="font-normal">Phased (0%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pilot_first" id="rollout-pilot" data-testid="radio-rollout-pilot" />
              <Label htmlFor="rollout-pilot" className="font-normal">Pilot First (-10%)</Label>
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
              <Label htmlFor="support-strong" className="font-normal">Strong (+15%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="basic" id="support-basic" data-testid="radio-support-basic" />
              <Label htmlFor="support-basic" className="font-normal">Basic (0%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="minimal" id="support-minimal" data-testid="radio-support-minimal" />
              <Label htmlFor="support-minimal" className="font-normal">Minimal (-15%)</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}
