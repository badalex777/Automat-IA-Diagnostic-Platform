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
      fteSavings: initialData?.fteSavings,
      errorReductionPct: initialData?.errorReductionPct,
      errorsAvoidedAnnually: initialData?.errorsAvoidedAnnually,
      hoursReallocatedToRevenue: initialData?.hoursReallocatedToRevenue,
      revenueUpliftAnnual: initialData?.revenueUpliftAnnual,
      paybackPeriodMonths: initialData?.paybackPeriodMonths,
      trainingHoursPerEmployee: initialData?.trainingHoursPerEmployee,
      errorMetricsEnabled: initialData?.errorMetricsEnabled ?? false,
      revenueMetricsEnabled: initialData?.revenueMetricsEnabled ?? false,
    },
  });

  const errorMetricsEnabled = form.watch('errorMetricsEnabled');
  const revenueMetricsEnabled = form.watch('revenueMetricsEnabled');

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

  // Convert string values to numbers and auto-calculate annual hours on submit
  const handleSubmit = (data: any) => {
    const hoursSavedPerWeek = data.hoursSavedPerWeek ? parseFloat(data.hoursSavedPerWeek) : undefined;
    const annualHoursSaved = hoursSavedPerWeek ? hoursSavedPerWeek * 50 : undefined;
    
    const converted = {
      ...data,
      annualRoi: data.annualRoi ? parseFloat(data.annualRoi) : undefined,
      hoursSavedPerWeek,
      annualHoursSaved,
      fteSavings: data.fteSavings ? parseFloat(data.fteSavings) : undefined,
      errorReductionPct: data.errorReductionPct ? parseFloat(data.errorReductionPct) : undefined,
      errorsAvoidedAnnually: data.errorsAvoidedAnnually ? parseInt(data.errorsAvoidedAnnually) : undefined,
      hoursReallocatedToRevenue: data.hoursReallocatedToRevenue ? parseFloat(data.hoursReallocatedToRevenue) : undefined,
      revenueUpliftAnnual: data.revenueUpliftAnnual ? parseFloat(data.revenueUpliftAnnual) : undefined,
      paybackPeriodMonths: data.paybackPeriodMonths ? parseFloat(data.paybackPeriodMonths) : undefined,
      trainingHoursPerEmployee: data.trainingHoursPerEmployee ? parseFloat(data.trainingHoursPerEmployee) : undefined,
      errorMetricsEnabled: data.errorMetricsEnabled ?? false,
      revenueMetricsEnabled: data.revenueMetricsEnabled ?? false,
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
                  Annual hours will be calculated automatically (hours/week × 50 weeks)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fteSavings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FTE Savings</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="0.00"
                    data-testid="input-fte-savings"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Full-time equivalent savings (e.g., 0.5 FTE = half a full-time employee)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Implementation Effort Metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Implementation Effort</h3>
          
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
