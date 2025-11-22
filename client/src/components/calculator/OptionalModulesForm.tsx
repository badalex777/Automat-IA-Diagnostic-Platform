import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { TimeSavings, QualityImpact, RevenueUplift } from '@shared/schema';
import AITimeSavedRubric from './AITimeSavedRubric';
import QualityImpactRubric from './QualityImpactRubric';
import RevenueUpliftRubric from './RevenueUpliftRubric';
import { useState, useEffect } from 'react';

interface OptionalModulesFormProps {
  timeSavings: TimeSavings;
  qualityImpact: QualityImpact;
  revenueUplift: RevenueUplift;
  onTimeSavingsChange: (data: TimeSavings) => void;
  onQualityImpactChange: (data: QualityImpact) => void;
  onRevenueUpliftChange: (data: RevenueUplift) => void;
  averageAnnualSalary: number;
  annualWorkingHours: number;
  overheadMultiplier: number;
  employees: number;
  processesPerPeriod: number;
  processFrequency: 'daily' | 'weekly' | 'monthly';
  showFromPIFBadge?: boolean;
}

export default function OptionalModulesForm({
  timeSavings,
  qualityImpact,
  revenueUplift,
  onTimeSavingsChange,
  onQualityImpactChange,
  onRevenueUpliftChange,
  averageAnnualSalary,
  annualWorkingHours,
  overheadMultiplier,
  employees,
  processesPerPeriod,
  processFrequency,
  showFromPIFBadge,
}: OptionalModulesFormProps) {
  const [showRubric, setShowRubric] = useState(false);
  const [showQualityRubric, setShowQualityRubric] = useState(false);
  const [showRevenueRubric, setShowRevenueRubric] = useState(false);

  const calculatedRevenuePerHour = annualWorkingHours > 0 
    ? Math.round((averageAnnualSalary / annualWorkingHours) * overheadMultiplier * 100) / 100
    : 0;

  const calculateTransactionsPerWeek = () => {
    if (!processesPerPeriod || processesPerPeriod === 0 || !employees || employees === 0) {
      return 0;
    }
    
    let weeklyPerEmployee = 0;
    if (processFrequency === 'daily') {
      weeklyPerEmployee = processesPerPeriod * 5;
    } else if (processFrequency === 'weekly') {
      weeklyPerEmployee = processesPerPeriod;
    } else {
      weeklyPerEmployee = processesPerPeriod / 4.33;
    }
    
    return Math.round(weeklyPerEmployee * employees);
  };

  useEffect(() => {
    const calculatedTransactions = calculateTransactionsPerWeek();
    if (calculatedTransactions !== qualityImpact.transactionsPerWeek) {
      onQualityImpactChange({ 
        ...qualityImpact, 
        transactionsPerWeek: calculatedTransactions 
      });
    }
  }, [processesPerPeriod, processFrequency, employees]);

  return (
    <div className="space-y-6">
      {/* Time Savings Module */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle>Time Savings Module</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {showFromPIFBadge && (
                  <Badge 
                    variant="secondary" 
                    className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs"
                  >
                    From PIF
                  </Badge>
                )}
                <Badge variant="outline">Step 3 of 6</Badge>
                <Switch
                  checked={timeSavings.enabled}
                  onCheckedChange={(enabled) => onTimeSavingsChange({ ...timeSavings, enabled })}
                  data-testid="switch-time-savings"
                />
              </div>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              Quantify productivity gains from AI automation. Time savings directly translate to cost reductions and are often the largest contributor to ROI calculations.
            </CardDescription>
          </div>
        </CardHeader>
        {timeSavings.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Percentage Time Saved by AI (%)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRubric(!showRubric)}
                  className="gap-2"
                  data-testid="button-toggle-rubric"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Use Rubric
                </Button>
              </div>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={timeSavings.percentTimeSaved || ''}
                onChange={(e) => {
                  const filtered = e.target.value.replace(/[^0-9.]/g, '');
                  const val = filtered === '' ? 0 : parseFloat(filtered);
                  onTimeSavingsChange({ ...timeSavings, percentTimeSaved: isNaN(val) ? 0 : val });
                }}
                data-testid="input-percent-time-saved"
              />
            </div>
            
            {showRubric && (
              <div className="mt-4">
                <AITimeSavedRubric 
                  value={timeSavings.percentTimeSaved}
                  onChange={(percentage) => {
                    onTimeSavingsChange({ 
                      ...timeSavings, 
                      percentTimeSaved: percentage,
                      enabled: true 
                    });
                  }}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>
                Source
                <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
              </Label>
              <Input
                value={timeSavings.source}
                onChange={(e) => onTimeSavingsChange({ ...timeSavings, source: e.target.value })}
                placeholder="e.g., Process analysis by Operations Manager"
                data-testid="input-time-savings-source"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Quality Impact Module */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle>Quality Impact Module</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {showFromPIFBadge && (
                  <Badge 
                    variant="secondary" 
                    className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs"
                  >
                    From PIF
                  </Badge>
                )}
                <Badge variant="outline">Step 4 of 6</Badge>
                <Switch
                  checked={qualityImpact.enabled}
                  onCheckedChange={(enabled) => onQualityImpactChange({ ...qualityImpact, enabled })}
                  data-testid="switch-quality-impact"
                />
              </div>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              Calculate savings from improved quality, reduced errors, and eliminated rework. AI systems improve accuracy and consistency, reducing costly mistakes and quality issues.
            </CardDescription>
          </div>
        </CardHeader>
        {qualityImpact.enabled && (
          <CardContent className="space-y-6">
            {/* Required Data Section */}
            <div className="border-2 border-primary/20 rounded-lg p-4 bg-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-sm">Required Data (Always Needed)</h4>
                <Badge variant="default" className="text-xs">Required</Badge>
              </div>
              
              {calculateTransactionsPerWeek() === 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Process volume data needed: Complete Step 2 (People & Cost) to enable Quality Impact calculations. Enter employees, processes per period, and frequency to calculate organizational transactions.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Transactions per Week</Label>
                  <Input
                    type="number"
                    value={calculateTransactionsPerWeek()}
                    readOnly
                    disabled
                    className="bg-muted"
                    data-testid="input-transactions-per-week"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from processes in Step 2
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Current Error Rate (%)
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={qualityImpact.currentErrorRate || ''}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(/[^0-9.]/g, '');
                      const val = filtered === '' ? 0 : parseFloat(filtered);
                      onQualityImpactChange({ ...qualityImpact, currentErrorRate: isNaN(val) ? 0 : val });
                    }}
                    data-testid="input-current-error-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Rework Minutes per Error
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={qualityImpact.reworkMinutesPerError || ''}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(/[^0-9.]/g, '');
                      const val = filtered === '' ? 0 : parseFloat(filtered);
                      onQualityImpactChange({ ...qualityImpact, reworkMinutesPerError: isNaN(val) ? 0 : val });
                    }}
                    data-testid="input-rework-minutes-per-error"
                  />
                  <p className="text-xs text-muted-foreground">
                    Time to fix each error (in minutes)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Financial Cost per Error (USD)
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*\.?[0-9]*"
                    value={qualityImpact.financialCostPerError || ''}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(/[^0-9.]/g, '');
                      const val = filtered === '' ? 0 : parseFloat(filtered);
                      onQualityImpactChange({ ...qualityImpact, financialCostPerError: isNaN(val) ? 0 : val });
                    }}
                    data-testid="input-financial-cost-per-error"
                  />
                  <p className="text-xs text-muted-foreground">
                    Direct costs (refunds, penalties, etc.)
                  </p>
                </div>
              </div>
            </div>

            {/* Calculation Method Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Choose Calculation Method</h4>
              <div className="flex gap-4">
                <Button
                  variant={qualityImpact.calculationMethod === 'manual' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    onQualityImpactChange({ 
                      ...qualityImpact, 
                      calculationMethod: 'manual'
                    });
                    setShowQualityRubric(false);
                  }}
                  data-testid="button-calculation-method-manual"
                >
                  Manual Entry
                </Button>
                <Button
                  variant={qualityImpact.calculationMethod === 'rubric' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => {
                    onQualityImpactChange({ 
                      ...qualityImpact, 
                      calculationMethod: 'rubric'
                    });
                  }}
                  data-testid="button-calculation-method-rubric"
                >
                  Use Assessment Rubric
                </Button>
              </div>
            </div>

            {/* Manual Entry Method */}
            {qualityImpact.calculationMethod === 'manual' && (
              <div className="space-y-2">
                <Label>Post-AI Error Rate (%)</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  value={qualityImpact.postAIErrorRate || ''}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^0-9.]/g, '');
                    const val = filtered === '' ? 0 : parseFloat(filtered);
                    onQualityImpactChange({ ...qualityImpact, postAIErrorRate: isNaN(val) ? 0 : val });
                  }}
                  data-testid="input-post-ai-error-rate"
                />
                <p className="text-xs text-muted-foreground">
                  Expected error rate after AI implementation
                </p>
              </div>
            )}

            {/* Rubric Method */}
            {qualityImpact.calculationMethod === 'rubric' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Percent Quality Improvement (%)</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {qualityImpact.percentQualityImprovement > 0 
                        ? 'Calculated from rubric assessment' 
                        : 'Click button to run assessment'}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQualityRubric(!showQualityRubric)}
                    className="gap-2"
                    data-testid="button-toggle-quality-rubric"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    {showQualityRubric ? 'Hide' : 'Show'} Rubric
                  </Button>
                </div>
                {qualityImpact.percentQualityImprovement > 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                      Quality Improvement: {qualityImpact.percentQualityImprovement}%
                    </p>
                  </div>
                )}
                {showQualityRubric && (
                  <div className="mt-4">
                    <QualityImpactRubric 
                      value={qualityImpact.percentQualityImprovement}
                      onChange={(percentage) => {
                        onQualityImpactChange({ 
                          ...qualityImpact, 
                          percentQualityImprovement: percentage,
                          enabled: true 
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label>
                Source
                <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
              </Label>
              <Input
                value={qualityImpact.source}
                onChange={(e) => onQualityImpactChange({ ...qualityImpact, source: e.target.value })}
                placeholder="e.g., Quality metrics from last quarter"
                data-testid="input-quality-impact-source"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Revenue Uplift Module */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <CardTitle>Revenue Uplift Module</CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {showFromPIFBadge && (
                  <Badge 
                    variant="secondary" 
                    className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs"
                  >
                    From PIF
                  </Badge>
                )}
                <Badge variant="outline">Step 5 of 6</Badge>
                <Switch
                  checked={revenueUplift.enabled}
                  onCheckedChange={(enabled) => onRevenueUpliftChange({ ...revenueUplift, enabled })}
                  data-testid="switch-revenue-uplift"
                />
              </div>
            </div>
            <CardDescription className="text-sm text-muted-foreground">
              Calculate revenue gains from reallocating saved time to higher-value activities. Time freed by AI can be redirected to revenue-generating tasks, multiplying ROI impact.
            </CardDescription>
          </div>
        </CardHeader>
        {revenueUplift.enabled && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Percent Time Reallocated to Revenue Activities (%)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRevenueRubric(!showRevenueRubric)}
                    className="gap-2"
                    data-testid="button-toggle-revenue-rubric"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Use Rubric
                  </Button>
                </div>
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*\.?[0-9]*"
                  value={revenueUplift.percentReallocated || ''}
                  onChange={(e) => {
                    const filtered = e.target.value.replace(/[^0-9.]/g, '');
                    const val = filtered === '' ? 0 : parseFloat(filtered);
                    onRevenueUpliftChange({ ...revenueUplift, percentReallocated: isNaN(val) ? 0 : val });
                  }}
                  placeholder="40"
                  data-testid="input-percent-reallocated"
                />
                <p className="text-xs text-muted-foreground">Conservative default: 30-50%</p>
              </div>
              <div className="space-y-2">
                <Label>Effective Hourly Rate (USD)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={calculatedRevenuePerHour}
                    disabled
                    className="bg-muted"
                    data-testid="input-revenue-value-per-hour"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-calculated from salary ÷ annual hours × overhead
                  </p>
                </div>
              </div>
            </div>
            
            {showRevenueRubric && (
              <div className="mt-4">
                <RevenueUpliftRubric 
                  value={revenueUplift.percentReallocated}
                  onChange={(percentage) => {
                    onRevenueUpliftChange({ 
                      ...revenueUplift, 
                      percentReallocated: percentage,
                      enabled: true 
                    });
                  }}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>
                Source
                <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
              </Label>
              <Input
                value={revenueUplift.source}
                onChange={(e) => onRevenueUpliftChange({ ...revenueUplift, source: e.target.value })}
                placeholder="e.g., Sales team revenue per hour analysis"
                data-testid="input-revenue-uplift-source"
              />
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
