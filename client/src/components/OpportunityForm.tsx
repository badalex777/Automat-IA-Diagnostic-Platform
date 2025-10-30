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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const form = useForm<InsertImplementationOpportunity>({
    resolver: zodResolver(insertImplementationOpportunitySchema),
    defaultValues: {
      workflowId,
      name: initialData?.name || "",
      description: initialData?.description || "",
      annualRoi: initialData?.annualRoi,
      implementationCost: initialData?.implementationCost,
      cumulativeNetBenefit3Year: initialData?.cumulativeNetBenefit3Year,
      cumulativeNetBenefit5Year: initialData?.cumulativeNetBenefit5Year,
      hoursSavedPerWeek: initialData?.hoursSavedPerWeek,
      annualHoursSaved: initialData?.annualHoursSaved,
      errorReductionPct: initialData?.errorReductionPct,
      errorsAvoidedAnnually: initialData?.errorsAvoidedAnnually,
      hoursReallocatedToRevenue: initialData?.hoursReallocatedToRevenue,
      revenueUpliftAnnual: initialData?.revenueUpliftAnnual,
      rampupPeriodMonths: initialData?.rampupPeriodMonths,
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

  // Convert string values to numbers, auto-calculate annual hours and FTE on submit
  const handleSubmit = (data: any) => {
    const hoursSavedPerWeek = data.hoursSavedPerWeek ? parseFloat(data.hoursSavedPerWeek) : undefined;
    const annualHoursSaved = hoursSavedPerWeek ? hoursSavedPerWeek * 50 : undefined;
    // Auto-calculate FTE from hours: FTE = hours/week ÷ 40
    const fteSavings = hoursSavedPerWeek ? hoursSavedPerWeek / 40 : undefined;
    
    const converted = {
      ...data,
      annualRoi: data.annualRoi ? parseFloat(data.annualRoi) : undefined,
      implementationCost: data.implementationCost ? parseFloat(data.implementationCost) : undefined,
      cumulativeNetBenefit3Year: data.cumulativeNetBenefit3Year ? parseFloat(data.cumulativeNetBenefit3Year) : undefined,
      cumulativeNetBenefit5Year: data.cumulativeNetBenefit5Year ? parseFloat(data.cumulativeNetBenefit5Year) : undefined,
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
    };
    onSubmit(converted);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">{t.opportunities.title}</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.forms.opportunityName}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={t.forms.opportunityNamePlaceholder} 
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
                <FormLabel>{t.forms.opportunityDescription}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={t.forms.opportunityDescriptionPlaceholder}
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
          <h3 className="text-sm font-semibold">{t.forms.financialMetrics}</h3>
          
          <FormField
            control={form.control}
            name="annualRoi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.opportunities.annualRoi}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="any"
                    placeholder={t.forms.annualRoiPlaceholder}
                    data-testid="input-annual-roi"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  {t.forms.annualBenefitsPlaceholder}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="implementationCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Implementation Cost</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="any"
                    placeholder="e.g., 15000"
                    data-testid="input-implementation-cost"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Total cost to implement this opportunity (consulting, software, training, etc.)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cumulativeNetBenefit3Year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>3-Year Cumulative Net Benefit</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="any"
                      placeholder="e.g., 135000"
                      data-testid="input-net-benefit-3year"
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
              name="cumulativeNetBenefit5Year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>5-Year Cumulative Net Benefit</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="any"
                      placeholder="e.g., 235000"
                      data-testid="input-net-benefit-5year"
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

          <FormField
            control={form.control}
            name="hoursSavedPerWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.forms.hoursSavedPerWeek}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="any"
                    placeholder={t.forms.hoursSavedPerWeekPlaceholder}
                    data-testid="input-hours-saved-per-week"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  {t.forms.fteEquivalentHelp}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Implementation Effort Metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">{t.forms.implementationDetails}</h3>
          
          <FormField
            control={form.control}
            name="rampupPeriodMonths"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t.forms.rampupPeriodMonths}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="any"
                    placeholder={t.forms.rampupPeriodMonthsPlaceholder}
                    data-testid="input-rampup-period"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  {t.forms.rampupPeriodMonths}
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
                  <FormLabel>{t.forms.paybackPeriodMonths}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="any"
                      placeholder={t.forms.paybackPeriodMonthsPlaceholder}
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
                  <FormLabel>{t.forms.trainingHoursPerEmployee}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="any"
                      placeholder={t.forms.trainingHoursPerEmployeePlaceholder}
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
                {t.opportunities.enableErrorMetrics}
              </FormLabel>
            </FormItem>
          )}
        />

        {errorMetricsEnabled && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">{t.forms.errorMetrics}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="errorReductionPct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.forms.errorReductionPct}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        placeholder={t.forms.errorReductionPctPlaceholder}
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
                    <FormLabel>{t.forms.errorsAvoidedAnnually}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder={t.forms.errorsAvoidedAnnuallyPlaceholder}
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
                {t.opportunities.enableRevenueMetrics}
              </FormLabel>
            </FormItem>
          )}
        />

        {revenueMetricsEnabled && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">{t.forms.revenueMetrics}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hoursReallocatedToRevenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.forms.hoursReallocatedToRevenue}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder={t.forms.hoursReallocatedToRevenuePlaceholder}
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
                    <FormLabel>{t.forms.revenueUpliftAnnual}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="any"
                        placeholder={t.forms.revenueUpliftAnnualPlaceholder}
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
              {t.common.cancel}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-submit-opportunity"
          >
            {isLoading ? t.actions.saving : initialData ? t.common.update : t.common.create}
          </Button>
        </div>
      </form>
    </Form>
  );
}
