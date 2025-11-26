import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CostsAndRampup } from '@shared/schema';
import RampUpEfficiencyRubric from './RampUpEfficiencyRubric';

interface CostsAndRampupFormProps {
  data: CostsAndRampup;
  onChange: (data: CostsAndRampup) => void;
  showManualRequiredBadge?: boolean;
}

export default function CostsAndRampupForm({ data, onChange, showManualRequiredBadge = true }: CostsAndRampupFormProps) {
  const [efficiencyInput, setEfficiencyInput] = useState<string>(String(data.rampUpEfficiencyPercent || 100));
  
  useEffect(() => {
    setEfficiencyInput(String(data.rampUpEfficiencyPercent || 100));
  }, [data.rampUpEfficiencyPercent]);
  
  const handleChange = (field: keyof CostsAndRampup, value: string | number) => {
    onChange({ ...data, [field]: value });
  };
  
  const handleBatchChange = (updates: Partial<CostsAndRampup>) => {
    onChange({ ...data, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle>Costs & Implementation</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {showManualRequiredBadge && (
                <Badge 
                  variant="secondary" 
                  className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 text-xs"
                >
                  Manual input required
                </Badge>
              )}
              <Badge variant="outline" className="w-fit">Step 6 of 6</Badge>
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Define total investment required for AI implementation. These costs are essential for calculating true ROI and determining payback period accurately.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="implementationCost">One-time Implementation Cost (USD)</Label>
            <Input
              id="implementationCost"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={data.implementationCost || ''}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9.]/g, '');
                const val = filtered === '' ? 0 : parseFloat(filtered);
                handleChange('implementationCost', isNaN(val) ? 0 : val);
              }}
              data-testid="input-implementation-cost"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="annualSoftwareCost">Annual Software/Subscription Cost (USD)</Label>
            <Input
              id="annualSoftwareCost"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={data.annualSoftwareCost || ''}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9.]/g, '');
                const val = filtered === '' ? 0 : parseFloat(filtered);
                handleChange('annualSoftwareCost', isNaN(val) ? 0 : val);
              }}
              data-testid="input-annual-software-cost"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trainingHours">Training Hours per Employee</Label>
            <Input
              id="trainingHours"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={data.trainingHoursPerEmployee || ''}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9.]/g, '');
                const val = filtered === '' ? 0 : parseFloat(filtered);
                handleChange('trainingHoursPerEmployee', isNaN(val) ? 0 : val);
              }}
              data-testid="input-training-hours"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="changeMgmtCosts">Change Management/Misc Costs (USD)</Label>
            <Input
              id="changeMgmtCosts"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={data.changeMgmtCosts || ''}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9.]/g, '');
                const val = filtered === '' ? 0 : parseFloat(filtered);
                handleChange('changeMgmtCosts', isNaN(val) ? 0 : val);
              }}
              data-testid="input-change-mgmt-costs"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="rampUpMonths">
            Implementation Ramp-Up Period (Months)
            <span className="ml-2 text-xs text-muted-foreground">
              How long until full benefits are realized? (1-12 months)
            </span>
          </Label>
          <Input
            id="rampUpMonths"
            type="text"
            inputMode="numeric"
            value={data.rampUpMonths === 0 ? '' : data.rampUpMonths}
            onChange={(e) => {
              const filtered = e.target.value.replace(/[^0-9]/g, '');
              if (filtered === '') {
                handleChange('rampUpMonths', 0);
              } else {
                const num = parseInt(filtered, 10);
                if (!isNaN(num)) {
                  handleChange('rampUpMonths', num);
                }
              }
            }}
            onBlur={(e) => {
              const val = data.rampUpMonths;
              if (val === 0 || val === null || val === undefined) {
                handleChange('rampUpMonths', 6);
              } else if (val < 1) {
                handleChange('rampUpMonths', 1);
              } else if (val > 12) {
                handleChange('rampUpMonths', 12);
              }
            }}
            placeholder="6"
            data-testid="input-ramp-up-months"
          />
          <p className="text-xs text-muted-foreground">
            Base ramp-up factor calculation. For example, 6 months = 75% base factor.
          </p>
        </div>
        
        <div className="pt-4 space-y-4 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Implementation Efficiency Assessment
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (Optional - affects Year 1 ramp-up speed)
                </span>
              </Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="rampUpMethodToggle" className="text-sm font-normal">
                  {data.rampUpCalculationMethod === 'rubric' ? 'Use Rubric' : 'Manual Entry'}
                </Label>
                <Switch
                  id="rampUpMethodToggle"
                  checked={data.rampUpCalculationMethod === 'rubric'}
                  onCheckedChange={(checked) => 
                    handleChange('rampUpCalculationMethod', checked ? 'rubric' : 'manual')
                  }
                  data-testid="switch-rampup-method"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Assess implementation factors to refine Year 1 adoption speed. Higher efficiency = faster ramp-up.
            </p>
          </div>

          {data.rampUpCalculationMethod === 'manual' ? (
            <div className="space-y-2">
              <Label htmlFor="rampUpEfficiency">
                Implementation Efficiency (%)
                <span className="ml-2 text-xs text-muted-foreground">
                  20-150% (100% = ideal, 20% = severely delayed, 150% = accelerated)
                </span>
              </Label>
              <Input
                id="rampUpEfficiency"
                type="text"
                inputMode="numeric"
                value={efficiencyInput}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^0-9]/g, '');
                  setEfficiencyInput(filtered);
                }}
                onBlur={() => {
                  if (efficiencyInput === '') {
                    setEfficiencyInput('100');
                    handleChange('rampUpEfficiencyPercent', 100);
                  } else {
                    const val = parseInt(efficiencyInput, 10);
                    if (!isNaN(val)) {
                      const clamped = Math.max(20, Math.min(150, val));
                      setEfficiencyInput(String(clamped));
                      handleChange('rampUpEfficiencyPercent', clamped);
                    } else {
                      setEfficiencyInput('100');
                      handleChange('rampUpEfficiencyPercent', 100);
                    }
                  }
                }}
                placeholder="100"
                data-testid="input-rampup-efficiency"
              />
              <p className="text-xs text-muted-foreground">
                Manually set efficiency percentage. Lower values reflect delayed rollouts or adoption challenges.
              </p>
            </div>
          ) : (
            <RampUpEfficiencyRubric
              value={data.rampUpEfficiencyPercent || 100}
              rubricAnswers={{
                complexity: data.rubricComplexity || 'moderate',
                digitalComfort: data.rubricDigitalComfort || 'neutral',
                rolloutApproach: data.rubricRolloutApproach || 'phased',
                supportStructure: data.rubricSupportStructure || 'basic'
              } as { complexity: string; digitalComfort: string; rolloutApproach: string; supportStructure: string }}
              onRubricChange={(answers, newEfficiencyValue) => {
                setEfficiencyInput(String(newEfficiencyValue));
                handleBatchChange({
                  rubricComplexity: answers.complexity as CostsAndRampup['rubricComplexity'],
                  rubricDigitalComfort: answers.digitalComfort as CostsAndRampup['rubricDigitalComfort'],
                  rubricRolloutApproach: answers.rolloutApproach as CostsAndRampup['rubricRolloutApproach'],
                  rubricSupportStructure: answers.supportStructure as CostsAndRampup['rubricSupportStructure'],
                  rampUpEfficiencyPercent: newEfficiencyValue
                });
              }}
            />
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="costsSource">
            Source
            <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
          </Label>
          <Input
            id="costsSource"
            value={data.source}
            onChange={(e) => handleChange('source', e.target.value)}
            placeholder="e.g., Vendor quotes, IT department estimates"
            data-testid="input-costs-source"
          />
        </div>
      </CardContent>
    </Card>
  );
}
