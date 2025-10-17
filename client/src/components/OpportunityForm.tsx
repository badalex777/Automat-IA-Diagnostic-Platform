import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertImplementationOpportunitySchema, type InsertImplementationOpportunity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface OpportunityFormProps {
  workflowId: string;
  initialData?: Partial<InsertImplementationOpportunity>;
  onSubmit: (data: InsertImplementationOpportunity) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function OpportunityForm({ 
  workflowId, 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading 
}: OpportunityFormProps) {
  const form = useForm<InsertImplementationOpportunity>({
    resolver: zodResolver(insertImplementationOpportunitySchema),
    defaultValues: {
      workflowId,
      name: initialData?.name || "",
      description: initialData?.description || "",
      annualRoi: initialData?.annualRoi,
      hoursSavedPerWeek: initialData?.hoursSavedPerWeek,
      annualHoursSaved: initialData?.annualHoursSaved,
      // fteSavings removed - auto-calculated from hours
      errorReductionPct: initialData?.errorReductionPct,
      errorsAvoidedAnnually: initialData?.errorsAvoidedAnnually,
      hoursReallocatedToRevenue: initialData?.hoursReallocatedToRevenue,
      revenueUpliftAnnual: initialData?.revenueUpliftAnnual,
      rampupPeriodMonths: initialData?.rampupPeriodMonths,
      paybackPeriodMonths: initialData?.paybackPeriodMonths,
      trainingHoursPerEmployee: initialData?.trainingHoursPerEmployee,
      errorMetricsEnabled: initialData?.errorMetricsEnabled ?? false,
      revenueMetricsEnabled: initialData?.revenueMetricsEnabled ?? false,
      employeeAnnualSalary: initialData?.employeeAnnualSalary,
      overheadMultiplier: initialData?.overheadMultiplier ?? 1.3,
    },
  });

  const errorMetricsEnabled = form.watch('errorMetricsEnabled');
  const revenueMetricsEnabled = form.watch('revenueMetricsEnabled');
  const employeeAnnualSalary = form.watch('employeeAnnualSalary');
  const overheadMultiplier = form.watch('overheadMultiplier');

  // Calculate hourly rate for display
  const calculateHourlyRate = () => {
    const salary = parseFloat(employeeAnnualSalary?.toString() || "0");
    const overhead = parseFloat(overheadMultiplier?.toString() || "1.3");
    if (salary <= 0) {
      return { rate: "50.00", isFallback: true };
    }
    return { rate: ((salary * overhead) / 2080).toFixed(2), isFallback: false };
  };

  // Clear error metrics when toggle is disabled
  useEffect(() => {
    if (!errorMetricsEnabled) {
      form.setValue('errorReductionPct', undefined);
      form.setValue('errorsAvoidedAnnually', undefined);
    }
  }, [errorMetricsEnabled, form]);

  // Clear revenue metrics when toggle is disabled
  useEffect(() => {
    if (!revenueMetricsEnabled) {
      form.setValue('hoursReallocatedToRevenue', undefined);
      form.setValue('revenueUpliftAnnual', undefined);
    }
  }, [revenueMetricsEnabled, form]);

  // Convert string values to numbers, auto-calculate annual hours and FTE on submit
  const handleSubmit = (data: any) => {
    const hoursSavedPerWeek = data.hoursSavedPerWeek ? parseFloat(data.hoursSavedPerWeek) : undefined;
    const annualHoursSaved = hoursSavedPerWeek ? hoursSavedPerWeek * 50 : undefined;
    // Auto-calculate FTE from hours: FTE = hours/week ÷ 40
    const fteSavings = hoursSavedPerWeek ? hoursSavedPerWeek / 40 : undefined;
    
    const converted = {
      ...data,
      annualRoi: data.annualRoi ? parseFloat(data.annualRoi) : undefined,
      hoursSavedPerWeek,
      annualHoursSaved,
      fteSavings, // Auto-calculated from hours
      errorReductionPct: data.errorReductionPct ? parseFloat(data.errorReductionPct) : undefined,
      errorsAvoidedAnnually: data.errorsAvoidedAnnually ? parseInt(data.errorsAvoidedAnnually) : undefined,
      hoursReallocatedToRevenue: data.hoursReallocatedToRevenue ? parseFloat(data.hoursReallocatedToRevenue) : undefined,
      revenueUpliftAnnual: data.revenueUpliftAnnual ? parseFloat(data.revenueUpliftAnnual) : undefined,
      rampupPeriodMonths: data.rampupPeriodMonths ? parseFloat(data.rampupPeriodMonths) : undefined,
      paybackPeriodMonths: data.paybackPeriodMonths ? parseFloat(data.paybackPeriodMonths) : undefined,
      trainingHoursPerEmployee: data.trainingHoursPerEmployee ? parseFloat(data.trainingHoursPerEmployee) : undefined,
      errorMetricsEnabled: data.errorMetricsEnabled ?? false,
      revenueMetricsEnabled: data.revenueMetricsEnabled ?? false,
      employeeAnnualSalary: data.employeeAnnualSalary ? parseFloat(data.employeeAnnualSalary) : undefined,
      overheadMultiplier: data.overheadMultiplier ? parseFloat(data.overheadMultiplier) : undefined,
    };
    onSubmit(converted);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Basic Information</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Implementation Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., AI-Powered Lead Qualification" 
                    data-testid="input-opportunity-name"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the implementation opportunity..."
                    data-testid="input-opportunity-description"
                    className="resize-none"
                    rows={3}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Core ROI Metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Core ROI Metrics</h3>
          
          <FormField
            control={form.control}
            name="annualRoi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual ROI (Post Ramp-up) $</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="0.00"
                    data-testid="input-annual-roi"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Long-term annual return on investment after ramp-up period
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hoursSavedPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hours Saved / Week</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="0.00"
                    data-testid="input-hours-saved-per-week"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Annual hours calculated automatically (hrs/week × 50 weeks). FTE auto-calculated as hrs/week ÷ 40 for display.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Labor Cost Data */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Labor Cost Data</h3>
          <p className="text-xs text-muted-foreground">
            Employee salary data from stakeholder interviews. Used to calculate actual hourly rate for accurate ROI scoring.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="employeeAnnualSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee Annual Salary ($)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="any"
                      placeholder="e.g., 60000"
                      data-testid="input-employee-salary"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Yearly compensation for employees performing this work
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overheadMultiplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overhead Multiplier</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="3.0"
                      placeholder="1.3"
                      data-testid="input-overhead-multiplier"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Cost multiplier (typically 1.2-1.5)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {(() => {
            const result = calculateHourlyRate();
            return (
              <div className="bg-muted/50 rounded-md p-3 border border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  {result.isFallback ? "Hourly Rate (Fallback)" : "Calculated Hourly Rate"}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  ${result.rate}/hour
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.isFallback 
                    ? "Using $50/hour default (no salary data provided)" 
                    : "Based on ROI Calculator formula: (Salary × Overhead) ÷ 2,080 hours"}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Implementation Effort Metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Implementation Effort</h3>
          
          <FormField
            control={form.control}
            name="rampupPeriodMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ramp-up Period (Months)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="0.0"
                    data-testid="input-rampup-period"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Time until the implementation becomes fully functional and delivers expected results
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="paybackPeriodMonths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payback Period (Months)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="any"
                      placeholder="0.0"
                      data-testid="input-payback-period"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="trainingHoursPerEmployee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Training Hours / Employee</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="any"
                      placeholder="0.0"
                      data-testid="input-training-hours"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Optional: Error Reduction Metrics */}
        <FormField
          control={form.control}
          name="errorMetricsEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 pt-2">
              <FormControl>
                <Switch
                  id="error-metrics-toggle"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-error-metrics-form"
                />
              </FormControl>
              <FormLabel htmlFor="error-metrics-toggle" className="text-sm font-semibold cursor-pointer !mt-0">
                Include Error Reduction Metrics
              </FormLabel>
            </FormItem>
          )}
        />

        {errorMetricsEnabled && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Error Reduction (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="errorReductionPct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Error Reduction %</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        placeholder="0.0"
                        data-testid="input-error-reduction-pct"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="errorsAvoidedAnnually"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Errors Avoided / Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder="0"
                        data-testid="input-errors-avoided"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Optional: Revenue Growth Metrics */}
        <FormField
          control={form.control}
          name="revenueMetricsEnabled"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 pt-2">
              <FormControl>
                <Switch
                  id="revenue-metrics-toggle"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-revenue-metrics-form"
                />
              </FormControl>
              <FormLabel htmlFor="revenue-metrics-toggle" className="text-sm font-semibold cursor-pointer !mt-0">
                Include Revenue Impact Metrics
              </FormLabel>
            </FormItem>
          )}
        />

        {revenueMetricsEnabled && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Revenue Growth (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hoursReallocatedToRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Reallocated to Revenue / Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder="0.00"
                        data-testid="input-hours-reallocated"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="revenueUpliftAnnual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revenue Uplift / Year $</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder="0.00"
                        data-testid="input-revenue-uplift"
                        {...field}
                        value={field.value || ""}
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-submit-opportunity"
          >
            {isLoading ? "Saving..." : initialData ? "Update" : "Create"} Opportunity
          </Button>
        </div>
      </form>
    </Form>
  );
}
