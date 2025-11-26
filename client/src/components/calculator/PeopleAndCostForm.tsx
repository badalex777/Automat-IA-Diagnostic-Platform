import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, AlertCircle } from 'lucide-react';
import { PeopleAndCost } from '@shared/schema';
import { useEffect, useState } from 'react';

interface PeopleAndCostFormProps {
  data: PeopleAndCost;
  onChange: (data: PeopleAndCost) => void;
  showManualRequiredBadge?: boolean;
  showPartialPIFBadge?: boolean;
}

export default function PeopleAndCostForm({ data, onChange, showManualRequiredBadge, showPartialPIFBadge }: PeopleAndCostFormProps) {
  const [workingHoursError, setWorkingHoursError] = useState<string>('');

  const handleChange = (field: keyof PeopleAndCost, value: string | number | boolean) => {
    onChange({ ...data, [field]: value });
  };

  const validateWorkingHours = (hours: number) => {
    if (hours === 0 || hours === null) {
      setWorkingHoursError('Annual working hours is required');
      return false;
    }
    if (hours < 1500) {
      setWorkingHoursError('Annual working hours must be at least 1500');
      return false;
    }
    if (hours > 2200) {
      setWorkingHoursError('Annual working hours cannot exceed 2200');
      return false;
    }
    setWorkingHoursError('');
    return true;
  };

  const calculateHoursFromProcesses = () => {
    if (!data.processesPerPeriod || !data.timePerProcessMinutes) {
      return 0;
    }
    
    const hoursPerProcess = data.timePerProcessMinutes / 60;
    const totalHoursPerPeriod = data.processesPerPeriod * hoursPerProcess;
    
    if (data.processFrequency === 'daily') {
      return totalHoursPerPeriod * 5;
    } else if (data.processFrequency === 'weekly') {
      return totalHoursPerPeriod;
    } else {
      return totalHoursPerPeriod / 4.33;
    }
  };

  useEffect(() => {
    const calculatedHours = calculateHoursFromProcesses();
    if (calculatedHours !== data.hoursPerWeekPerEmployee) {
      handleChange('hoursPerWeekPerEmployee', calculatedHours);
    }
  }, [data.processesPerPeriod, data.timePerProcessMinutes, data.processFrequency]);

  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle>People & Cost Data</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {showPartialPIFBadge && (
                <Badge 
                  variant="secondary" 
                  className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 text-xs"
                >
                  Partial PIF
                </Badge>
              )}
              {showManualRequiredBadge && (
                <Badge 
                  variant="secondary" 
                  className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 text-xs"
                >
                  Manual input required
                </Badge>
              )}
              <Badge variant="outline" className="w-fit">Step 2 of 6</Badge>
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Capture labor costs and workforce allocation. These metrics form the foundation for calculating potential cost savings and determining the financial impact of AI automation.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employees">Number of Employees</Label>
          <Input
            id="employees"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.employees || ''}
            onChange={(e) => {
              const filtered = e.target.value.replace(/[^0-9]/g, '');
              const val = filtered === '' ? 0 : parseInt(filtered);
              handleChange('employees', isNaN(val) ? 0 : val);
            }}
            data-testid="input-employees"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="processesPerPeriod">Number of Processes</Label>
            <Input
              id="processesPerPeriod"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={data.processesPerPeriod || ''}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9]/g, '');
                const val = filtered === '' ? 0 : parseInt(filtered);
                handleChange('processesPerPeriod', isNaN(val) ? 0 : val);
              }}
              data-testid="input-processes-per-period"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timePerProcess">Time per Process (minutes)</Label>
            <Input
              id="timePerProcess"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={data.timePerProcessMinutes || ''}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9.]/g, '');
                const val = filtered === '' ? 0 : parseFloat(filtered);
                handleChange('timePerProcessMinutes', isNaN(val) ? 0 : val);
              }}
              data-testid="input-time-per-process"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={data.processFrequency}
              onValueChange={(value: 'daily' | 'weekly' | 'monthly') => handleChange('processFrequency', value)}
            >
              <SelectTrigger data-testid="select-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {(data.processesPerPeriod > 0 && data.timePerProcessMinutes > 0) && (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Calculated Hours per Week:</span>
            <Badge variant="secondary" data-testid="badge-calculated-hours">
              {calculateHoursFromProcesses().toFixed(1)} hours/week
            </Badge>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="hours">Hours per Week per Employee</Label>
          <Input
            id="hours"
            type="number"
            step="0.1"
            value={data.hoursPerWeekPerEmployee}
            readOnly
            disabled
            className="bg-muted"
            data-testid="input-hours-per-week"
          />
          <p className="text-xs text-muted-foreground">
            Automatically calculated from processes, time per process, and frequency
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary">Average Annual Salary (USD)</Label>
            <Input
              id="salary"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={data.averageAnnualSalary || ''}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9]/g, '');
                const val = filtered === '' ? 0 : parseInt(filtered);
                handleChange('averageAnnualSalary', isNaN(val) ? 0 : val);
              }}
              data-testid="input-annual-salary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="workingHours">
              Annual Working Hours (Company-Specific)
              <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
            </Label>
            <Input
              id="workingHours"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={data.annualWorkingHours || ''}
              onChange={(e) => {
                const filtered = e.target.value.replace(/[^0-9]/g, '');
                const val = filtered === '' ? 0 : parseInt(filtered);
                handleChange('annualWorkingHours', isNaN(val) ? 0 : val);
                validateWorkingHours(isNaN(val) ? 0 : val);
              }}
              onBlur={() => validateWorkingHours(data.annualWorkingHours)}
              placeholder="e.g., 1920"
              data-testid="input-working-hours"
              aria-invalid={workingHoursError ? 'true' : 'false'}
              className={workingHoursError ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {workingHoursError && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs" role="alert" data-testid="error-working-hours">
                <AlertCircle className="h-3 w-3" />
                <span>{workingHoursError}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Calculate: Work days/year × hours/day. Example: 240 days × 8 hours = 1920 hours
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="overhead">Overhead Multiplier</Label>
          <Input
            id="overhead"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={data.overheadMultiplier ?? ''}
            onChange={(e) => {
              const filtered = e.target.value.replace(/[^0-9.]/g, '');
              // Keep as string during editing to allow typing decimals like "1."
              handleChange('overheadMultiplier', filtered);
            }}
            onBlur={(e) => {
              // Convert to number on blur for final storage
              const val = e.target.value === '' ? 1.0 : parseFloat(e.target.value);
              handleChange('overheadMultiplier', isNaN(val) ? 1.0 : val);
            }}
            placeholder="1.0"
            data-testid="input-overhead-multiplier"
          />
          <p className="text-xs text-muted-foreground">
            1.0 = salary only, 1.2-1.4 = includes benefits/overhead
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="peopleSource">
            Source
            <Badge variant="secondary" className="ml-2 text-xs">Required</Badge>
          </Label>
          <Input
            id="peopleSource"
            value={data.source}
            onChange={(e) => handleChange('source', e.target.value)}
            placeholder="e.g., HR records, Finance team estimate"
            data-testid="input-people-source"
          />
        </div>
      </CardContent>
    </Card>
  );
}
