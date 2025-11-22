import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ProcessInfo } from '@shared/schema';

interface ProcessInfoFormProps {
  data: ProcessInfo;
  onChange: (data: ProcessInfo) => void;
  showFromPIFBadge?: boolean;
}

export default function ProcessInfoForm({ data, onChange, showFromPIFBadge }: ProcessInfoFormProps) {
  const handleChange = (field: keyof ProcessInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle>Process Information</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {showFromPIFBadge && (
                <Badge 
                  variant="secondary" 
                  className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs"
                >
                  From PIF
                </Badge>
              )}
              <Badge variant="outline" className="w-fit">Step 1 of 6</Badge>
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Define the business process being analyzed. This establishes the baseline context for calculating time savings and operational improvements from AI implementation.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="processName">Process Name</Label>
          <Input
            id="processName"
            value={data.processName}
            onChange={(e) => handleChange('processName', e.target.value)}
            placeholder="e.g., Invoice Processing"
            data-testid="input-process-name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessUnit">Business Unit</Label>
          <Input
            id="businessUnit"
            value={data.businessUnit}
            onChange={(e) => handleChange('businessUnit', e.target.value)}
            placeholder="e.g., Finance Department"
            data-testid="input-business-unit"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dataSource">
            Data Source
            <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
          </Label>
          <Input
            id="dataSource"
            value={data.dataSource}
            onChange={(e) => handleChange('dataSource', e.target.value)}
            placeholder="e.g., Greg from Operations"
            data-testid="input-data-source"
          />
          <p className="text-xs text-muted-foreground">
            Who provided this information? Include their role for transparency.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
