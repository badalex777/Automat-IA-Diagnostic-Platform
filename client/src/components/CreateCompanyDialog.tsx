import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface CreateCompanyDialogProps {
  onSubmit?: (data: { 
    name: string; 
    industry: string; 
    contact?: string;
    leadAnalystName?: string;
    annualRevenue?: number;
    totalEmployees?: number;
  }) => void;
}

export default function CreateCompanyDialog({ onSubmit }: CreateCompanyDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    contact: '',
    leadAnalystName: '',
    annualRevenue: '',
    totalEmployees: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      name: formData.name,
      industry: formData.industry,
      contact: formData.contact || undefined,
      leadAnalystName: formData.leadAnalystName || undefined,
      annualRevenue: parseFloat(formData.annualRevenue),
      totalEmployees: parseInt(formData.totalEmployees),
    };
    
    onSubmit?.(submitData);
    setOpen(false);
    setFormData({ 
      name: '', 
      industry: '', 
      contact: '',
      leadAnalystName: '',
      annualRevenue: '',
      totalEmployees: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-company">
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
          <DialogDescription>
            Add a new company to manage their AI implementation diagnostics
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              placeholder="e.g., Acme Corporation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-company-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Input
              id="industry"
              placeholder="e.g., Manufacturing, Healthcare, Finance"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              required
              data-testid="input-industry"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information</Label>
            <Textarea
              id="contact"
              placeholder="Email, phone, or contact name"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              rows={3}
              data-testid="input-contact"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="leadAnalyst">Lead Analyst Name</Label>
            <Input
              id="leadAnalyst"
              placeholder="Primary analyst managing this diagnostic"
              value={formData.leadAnalystName}
              onChange={(e) => setFormData({ ...formData, leadAnalystName: e.target.value })}
              data-testid="input-lead-analyst"
            />
          </div>
          
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Financial Context</h4>
              <p className="text-xs text-muted-foreground">
                Update financial metrics used for opportunity scoring and ROI calculations
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Annual Revenue ($) *</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 5000000"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                  required
                  data-testid="input-annual-revenue"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalEmployees">Total Employees *</Label>
                <Input
                  id="totalEmployees"
                  type="number"
                  step="1"
                  placeholder="e.g., 250"
                  value={formData.totalEmployees}
                  onChange={(e) => setFormData({ ...formData, totalEmployees: e.target.value })}
                  required
                  data-testid="input-total-employees"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-company">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-company">
              Create Company
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
