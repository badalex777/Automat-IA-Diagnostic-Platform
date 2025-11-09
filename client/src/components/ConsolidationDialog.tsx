import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ImplementationOpportunity, WorkflowStep, InsertWorkflowConsolidation } from "@shared/schema";
import { calculateConsolidatedMetrics, getConsolidationSummary } from "@shared/consolidationCalculations";
import { ArrowUpCircle, Clock, Wallet, TrendingUp, Users } from "lucide-react";

const consolidationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  opportunityIds: z.array(z.string()).min(1, "Select at least one opportunity"),
});

type ConsolidationFormData = z.infer<typeof consolidationFormSchema>;

interface ConsolidationDialogProps {
  workflowId: string;
  opportunities: ImplementationOpportunity[];
  steps: WorkflowStep[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertWorkflowConsolidation) => void;
  isLoading?: boolean;
  initialData?: {
    id?: string;
    name: string;
    opportunityIds: string[];
  };
}

export function ConsolidationDialog({
  workflowId,
  opportunities,
  steps,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  initialData,
}: ConsolidationDialogProps) {
  const form = useForm<ConsolidationFormData>({
    resolver: zodResolver(consolidationFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      opportunityIds: initialData?.opportunityIds || [],
    },
  });

  const selectedIds = form.watch("opportunityIds");

  // Calculate aggregated metrics in real-time
  const aggregatedMetrics = useMemo(() => {
    const selectedOpps = opportunities.filter(opp => selectedIds.includes(opp.id));
    return calculateConsolidatedMetrics(selectedOpps);
  }, [selectedIds, opportunities]);

  // Group opportunities by step for better organization
  const groupedOpportunities = useMemo(() => {
    const groups: Record<string, ImplementationOpportunity[]> = {};
    
    opportunities.forEach(opp => {
      if (opp.stepId) {
        if (!groups[opp.stepId]) {
          groups[opp.stepId] = [];
        }
        groups[opp.stepId].push(opp);
      }
    });
    
    return groups;
  }, [opportunities]);

  const handleSubmit = (data: ConsolidationFormData) => {
    const consolidation: InsertWorkflowConsolidation = {
      workflowId,
      name: data.name,
      opportunityIds: data.opportunityIds,
    };
    onSubmit(consolidation);
  };

  const handleToggleOpportunity = (opportunityId: string, checked: boolean) => {
    const current = form.getValues("opportunityIds");
    if (checked) {
      form.setValue("opportunityIds", [...current, opportunityId]);
    } else {
      form.setValue("opportunityIds", current.filter(id => id !== opportunityId));
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "$0";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return "0";
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="dialog-consolidation">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Workflow Consolidation" : "Create Workflow Consolidation"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column: Form Inputs */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consolidation Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Customer Service Platform"
                          data-testid="input-consolidation-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="opportunityIds"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select Opportunities to Consolidate</FormLabel>
                      <ScrollArea className="h-[300px] border rounded-md p-4">
                        <div className="space-y-4">
                          {Object.keys(groupedOpportunities).length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No step-level opportunities available. Create opportunities from the Opportunities tab first.
                            </p>
                          ) : (
                            Object.entries(groupedOpportunities).map(([stepId, stepOpps]) => {
                              const step = steps.find(s => s.id === stepId);
                              return (
                                <div key={stepId} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      Step {step?.stepOrder || '?'}
                                    </Badge>
                                    <span className="text-sm font-medium">{step?.stepName || 'Unknown Step'}</span>
                                  </div>
                                  <div className="pl-4 space-y-2">
                                    {stepOpps.map(opp => (
                                      <div key={opp.id} className="flex items-start gap-2">
                                        <Checkbox
                                          id={`opp-${opp.id}`}
                                          checked={selectedIds.includes(opp.id)}
                                          onCheckedChange={(checked) => handleToggleOpportunity(opp.id, checked as boolean)}
                                          data-testid={`checkbox-opportunity-${opp.id}`}
                                        />
                                        <label
                                          htmlFor={`opp-${opp.id}`}
                                          className="text-sm cursor-pointer leading-tight"
                                        >
                                          {opp.name}
                                          <span className="text-xs text-muted-foreground ml-2">
                                            ({formatCurrency(parseFloat(opp.annualRoi?.toString() || '0'))} ROI,{' '}
                                            {formatNumber(parseFloat(opp.fteSavings?.toString() || '0'))} FTE)
                                          </span>
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </ScrollArea>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column: Aggregated Metrics Preview */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Consolidated Metrics Preview</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    {getConsolidationSummary(opportunities.filter(opp => selectedIds.includes(opp.id)))}
                  </p>
                </div>

                {selectedIds.length > 0 ? (
                  <div className="space-y-3">
                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total Annual ROI</p>
                          <p className="text-2xl font-bold" data-testid="text-preview-annual-roi">
                            {formatCurrency(aggregatedMetrics.totalAnnualRoi)}
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-md">
                          <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Total FTE Savings</p>
                          <p className="text-2xl font-bold" data-testid="text-preview-fte">
                            {formatNumber(aggregatedMetrics.totalFteSavings)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatNumber(aggregatedMetrics.totalAnnualHoursSaved)} hours/year
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-md">
                          <Wallet className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Implementation Cost</p>
                          <p className="text-2xl font-bold" data-testid="text-preview-cost">
                            {formatCurrency(aggregatedMetrics.totalImplementationCost)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Includes 15% integration overhead
                          </p>
                        </div>
                      </div>
                    </Card>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Avg. Ramp-up Period
                        </span>
                        <span className="font-medium" data-testid="text-preview-rampup">
                          {formatNumber(aggregatedMetrics.weightedAvgRampupPeriodMonths)} months
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-4">
                        Includes 20% coordination buffer
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <ArrowUpCircle className="h-3 w-3" />
                          Avg. Payback Period
                        </span>
                        <span className="font-medium" data-testid="text-preview-payback">
                          {formatNumber(aggregatedMetrics.weightedAvgPaybackPeriodMonths)} months
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-4">
                        Includes 20% coordination buffer
                      </p>

                      {aggregatedMetrics.hasErrorMetrics && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Errors Avoided/Year</span>
                          <span className="font-medium" data-testid="text-preview-errors">
                            {formatNumber(aggregatedMetrics.totalErrorsAvoidedAnnually)}
                          </span>
                        </div>
                      )}

                      {aggregatedMetrics.hasRevenueMetrics && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Revenue Uplift/Year</span>
                          <span className="font-medium" data-testid="text-preview-revenue">
                            {formatCurrency(aggregatedMetrics.totalRevenueUpliftAnnual)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <Card className="p-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Select opportunities to see consolidated metrics
                    </p>
                  </Card>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || selectedIds.length === 0}
                data-testid="button-save-consolidation"
              >
                {isLoading ? "Saving..." : initialData ? "Update Consolidation" : "Create Consolidation"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
