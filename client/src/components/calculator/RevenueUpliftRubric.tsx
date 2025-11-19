import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface RevenueUpliftRubricProps {
  value: number;
  onChange: (value: number) => void;
}

export default function RevenueUpliftRubric({ value, onChange }: RevenueUpliftRubricProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Revenue Uplift Assessment</CardTitle>
          <Badge variant="secondary" data-testid="badge-revenue-percentage">
            {value}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="revenuePercent">Revenue Uplift Percentage</Label>
          <Input
            id="revenuePercent"
            type="number"
            min="0"
            max="200"
            value={value}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) {
                onChange(Math.max(0, Math.min(200, val)));
              }
            }}
            data-testid="input-revenue-percent"
          />
          <p className="text-xs text-muted-foreground">
            Enter the percentage increase in revenue (0-200%)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
