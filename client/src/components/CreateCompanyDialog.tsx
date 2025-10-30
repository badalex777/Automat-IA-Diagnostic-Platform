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
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
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
          {t.actions.addCompany}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.dialogs.createCompany}</DialogTitle>
          <DialogDescription>
            {t.dialogs.createCompanyDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">{t.forms.companyName} *</Label>
            <Input
              id="companyName"
              placeholder={t.forms.companyNamePlaceholder}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-company-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">{t.forms.industry} *</Label>
            <Input
              id="industry"
              placeholder={t.forms.industryPlaceholder}
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              required
              data-testid="input-industry"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">{t.forms.contact}</Label>
            <Textarea
              id="contact"
              placeholder={t.forms.contactPlaceholder}
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
              <h4 className="text-sm font-semibold">{t.company.financialContext}</h4>
              <p className="text-xs text-muted-foreground">
                {t.dialogs.editFinancialContextDesc}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="annualRevenue">{t.company.annualRevenue} ($) *</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  step="0.01"
                  placeholder={t.forms.annualRevenuePlaceholder}
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                  required
                  data-testid="input-annual-revenue"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalEmployees">{t.company.totalEmployees} *</Label>
                <Input
                  id="totalEmployees"
                  type="number"
                  step="1"
                  placeholder={t.forms.totalEmployeesPlaceholder}
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
              {t.common.cancel}
            </Button>
            <Button type="submit" data-testid="button-submit-company">
              {t.dashboard.createCompany}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
