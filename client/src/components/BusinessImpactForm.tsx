import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BusinessImpact } from "@shared/schema";

interface BusinessImpactFormProps {
  workflowId: string;
  initialData?: BusinessImpact;
}

export default function BusinessImpactForm({ workflowId, initialData }: BusinessImpactFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    hoursPerWeek: initialData?.hoursPerWeek?.toString() || '',
    hoursPerYear: initialData?.hoursPerYear?.toString() || '',
    fteEquivalent: initialData?.fteEquivalent?.toString() || '',
    annualBenefits: initialData?.annualBenefits?.toString() || '',
    roiPercentage: initialData?.roiPercentage?.toString() || '',
    paybackMonths: initialData?.paybackMonths?.toString() || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        hoursPerWeek: initialData.hoursPerWeek?.toString() || '',
        hoursPerYear: initialData.hoursPerYear?.toString() || '',
        fteEquivalent: initialData.fteEquivalent?.toString() || '',
        annualBenefits: initialData.annualBenefits?.toString() || '',
        roiPercentage: initialData.roiPercentage?.toString() || '',
        paybackMonths: initialData.paybackMonths?.toString() || '',
      });
    }
  }, [initialData]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', `/api/workflows/${workflowId}/business-impact`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/business-impact`] });
      toast({
        title: "Business impact saved",
        description: "The business impact data has been successfully saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving data",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      hoursPerWeek: parseFloat(formData.hoursPerWeek) || 0,
      hoursPerYear: parseFloat(formData.hoursPerYear) || 0,
      fteEquivalent: parseFloat(formData.fteEquivalent) || 0,
      annualBenefits: parseFloat(formData.annualBenefits) || 0,
      roiPercentage: parseFloat(formData.roiPercentage) || 0,
      paybackMonths: parseFloat(formData.paybackMonths) || 0,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Time Savings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hoursPerWeek">Hours Saved per Week</Label>
            <Input
              id="hoursPerWeek"
              type="number"
              step="0.1"
              placeholder="e.g., 40"
              value={formData.hoursPerWeek}
              onChange={(e) => handleChange('hoursPerWeek', e.target.value)}
              data-testid="input-hours-per-week"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hoursPerYear">Hours Saved per Year</Label>
            <Input
              id="hoursPerYear"
              type="number"
              step="0.1"
              placeholder="e.g., 2080"
              value={formData.hoursPerYear}
              onChange={(e) => handleChange('hoursPerYear', e.target.value)}
              data-testid="input-hours-per-year"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fteEquivalent">FTE Equivalent</Label>
            <Input
              id="fteEquivalent"
              type="number"
              step="0.01"
              placeholder="e.g., 1.5"
              value={formData.fteEquivalent}
              onChange={(e) => handleChange('fteEquivalent', e.target.value)}
              data-testid="input-fte-equivalent"
            />
            <p className="text-xs text-muted-foreground">Full-time employee equivalent</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Financial Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="annualBenefits">Annual Benefits ($)</Label>
            <Input
              id="annualBenefits"
              type="number"
              step="1000"
              placeholder="e.g., 125000"
              value={formData.annualBenefits}
              onChange={(e) => handleChange('annualBenefits', e.target.value)}
              data-testid="input-annual-benefits"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roiPercentage">ROI Percentage (%)</Label>
            <Input
              id="roiPercentage"
              type="number"
              step="1"
              placeholder="e.g., 250"
              value={formData.roiPercentage}
              onChange={(e) => handleChange('roiPercentage', e.target.value)}
              data-testid="input-roi-percentage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paybackMonths">Payback Period (months)</Label>
            <Input
              id="paybackMonths"
              type="number"
              step="0.5"
              placeholder="e.g., 8"
              value={formData.paybackMonths}
              onChange={(e) => handleChange('paybackMonths', e.target.value)}
              data-testid="input-payback-months"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" data-testid="button-cancel">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={saveMutation.isPending}
          data-testid="button-save-impact"
        >
          {saveMutation.isPending ? "Saving..." : "Save Business Impact"}
        </Button>
      </div>
    </form>
  );
}
