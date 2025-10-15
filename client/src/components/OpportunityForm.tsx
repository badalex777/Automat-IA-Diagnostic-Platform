import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertImplementationOpportunitySchema, type InsertImplementationOpportunity } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    step="0.01"
                    placeholder="0.00"
                    data-testid="input-annual-roi"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Long-term annual return on investment after ramp-up period
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hoursSavedPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Saved / Week</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      data-testid="input-hours-saved-per-week"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="annualHoursSaved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Annual Hours Saved</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      data-testid="input-annual-hours-saved"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="fteSavings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>FTE Savings</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    data-testid="input-fte-savings"
                    {...field}
                    value={field.value || ""}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                      step="0.1"
                      placeholder="0.0"
                      data-testid="input-payback-period"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                      step="0.1"
                      placeholder="0.0"
                      data-testid="input-training-hours"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Optional: Error Reduction Metrics */}
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
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="0.0"
                      data-testid="input-error-reduction-pct"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                      step="1"
                      placeholder="0"
                      data-testid="input-errors-avoided"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Optional: Revenue Growth Metrics */}
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
                      step="0.01"
                      placeholder="0.00"
                      data-testid="input-hours-reallocated"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
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
                      step="0.01"
                      placeholder="0.00"
                      data-testid="input-revenue-uplift"
                      {...field}
                      value={field.value || ""}
                      onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

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
