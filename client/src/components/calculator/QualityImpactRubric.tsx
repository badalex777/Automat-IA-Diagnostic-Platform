import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface QualityImpactRubricProps {
  value: number;
  onChange: (value: number) => void;
}

export default function QualityImpactRubric({ value, onChange }: QualityImpactRubricProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Quality Impact Assessment</CardTitle>
          <Badge variant="secondary" data-testid="badge-quality-percentage">
            {value}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qualityPercent">Quality Improvement Percentage</Label>
          <Input
            id="qualityPercent"
            type="number"
            min="0"
            max="100"
            value={value}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) {
                onChange(Math.max(0, Math.min(100, val)));
              }
            }}
            data-testid="input-quality-percent"
          />
          <p className="text-xs text-muted-foreground">
            Enter the percentage improvement in quality/accuracy (0-100%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
