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
  onChange: (value: number) => void;
  rubricAnswers: RubricAnswers;
  onRubricChange: (answers: RubricAnswers) => void;
}

export default function RampUpEfficiencyRubric({ 
  value, 
  onChange, 
  rubricAnswers, 
  onRubricChange 
}: RampUpEfficiencyRubricProps) {
  const handleAnswerChange = (field: keyof RubricAnswers, answer: string) => {
    const newAnswers = { ...rubricAnswers, [field]: answer };
    onRubricChange(newAnswers);
    
    const scores = {
      complexity: { simple: 20, moderate: 0, complex: -20 },
      digitalComfort: { high: 20, neutral: 0, low: -20 },
      rolloutApproach: { allAtOnce: 15, phased: 0, pilot: -10 },
      supportStructure: { dedicated: 15, basic: 0, minimal: -15 }
    };
    
    const totalAdjustment = 
      (scores.complexity[newAnswers.complexity as keyof typeof scores.complexity] || 0) +
      (scores.digitalComfort[newAnswers.digitalComfort as keyof typeof scores.digitalComfort] || 0) +
      (scores.rolloutApproach[newAnswers.rolloutApproach as keyof typeof scores.rolloutApproach] || 0) +
      (scores.supportStructure[newAnswers.supportStructure as keyof typeof scores.supportStructure] || 0);
    
    const newValue = Math.max(20, Math.min(150, 100 + totalAdjustment));
    onChange(newValue);
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
              <RadioGroupItem value="simple" id="complexity-simple" data-testid="radio-complexity-simple" />
              <Label htmlFor="complexity-simple" className="font-normal">Simple (+20%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="moderate" id="complexity-moderate" data-testid="radio-complexity-moderate" />
              <Label htmlFor="complexity-moderate" className="font-normal">Moderate (0%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="complex" id="complexity-complex" data-testid="radio-complexity-complex" />
              <Label htmlFor="complexity-complex" className="font-normal">Complex (-20%)</Label>
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
              <RadioGroupItem value="high" id="comfort-high" data-testid="radio-comfort-high" />
              <Label htmlFor="comfort-high" className="font-normal">High (+20%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="neutral" id="comfort-neutral" data-testid="radio-comfort-neutral" />
              <Label htmlFor="comfort-neutral" className="font-normal">Neutral (0%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="low" id="comfort-low" data-testid="radio-comfort-low" />
              <Label htmlFor="comfort-low" className="font-normal">Low (-20%)</Label>
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
              <RadioGroupItem value="allAtOnce" id="rollout-all" data-testid="radio-rollout-all" />
              <Label htmlFor="rollout-all" className="font-normal">All at Once (+15%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="phased" id="rollout-phased" data-testid="radio-rollout-phased" />
              <Label htmlFor="rollout-phased" className="font-normal">Phased (0%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pilot" id="rollout-pilot" data-testid="radio-rollout-pilot" />
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
              <RadioGroupItem value="dedicated" id="support-dedicated" data-testid="radio-support-dedicated" />
              <Label htmlFor="support-dedicated" className="font-normal">Dedicated Team (+15%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="basic" id="support-basic" data-testid="radio-support-basic" />
              <Label htmlFor="support-basic" className="font-normal">Basic Support (0%)</Label>
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
