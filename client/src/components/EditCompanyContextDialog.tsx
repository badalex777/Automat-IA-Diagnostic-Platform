import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import type { Company } from "@shared/schema";

interface EditCompanyContextDialogProps {
  company: Company;
  onSubmit?: (data: { 
    annualRevenue?: number;
    totalEmployees?: number;
    annualLaborCosts?: number;
  }) => void;
}

export default function EditCompanyContextDialog({ company, onSubmit }: EditCompanyContextDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    annualRevenue: '',
    totalEmployees: '',
    annualLaborCosts: '',
  });

  useEffect(() => {
    if (open && company) {
      setFormData({
        annualRevenue: company.annualRevenue?.toString() || '',
        totalEmployees: company.totalEmployees?.toString() || '',
        annualLaborCosts: company.annualLaborCosts?.toString() || '',
      });
    }
  }, [open, company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
      totalEmployees: formData.totalEmployees ? parseInt(formData.totalEmployees) : undefined,
      annualLaborCosts: formData.annualLaborCosts ? parseFloat(formData.annualLaborCosts) : undefined,
    };
    
    onSubmit?.(submitData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline"
          data-testid="button-edit-company-context"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit Financial Context
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Company Financial Context</DialogTitle>
          <DialogDescription>
            Update financial metrics to calibrate opportunity analysis for {company.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annualRevenue">Annual Revenue ($)</Label>
              <Input
                id="annualRevenue"
                type="number"
                step="0.01"
                placeholder="e.g., 5000000"
                value={formData.annualRevenue}
                onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                data-testid="input-edit-annual-revenue"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalEmployees">Total Employees</Label>
              <Input
                id="totalEmployees"
                type="number"
                step="1"
                placeholder="e.g., 50"
                value={formData.totalEmployees}
                onChange={(e) => setFormData({ ...formData, totalEmployees: e.target.value })}
                data-testid="input-edit-total-employees"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="annualLaborCosts">Annual Labor Costs ($)</Label>
            <Input
              id="annualLaborCosts"
              type="number"
              step="0.01"
              placeholder="e.g., 3000000"
              value={formData.annualLaborCosts}
              onChange={(e) => setFormData({ ...formData, annualLaborCosts: e.target.value })}
              data-testid="input-edit-annual-labor-costs"
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-edit-context">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-edit-context">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
