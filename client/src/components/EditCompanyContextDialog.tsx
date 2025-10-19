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
import { useLanguage } from "@/contexts/LanguageContext";

interface EditCompanyContextDialogProps {
  company: Company;
  trigger?: React.ReactNode;
  onSubmit?: (data: { 
    annualRevenue?: number;
    totalEmployees?: number;
  }) => void;
}

export default function EditCompanyContextDialog({ company, trigger, onSubmit }: EditCompanyContextDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    annualRevenue: '',
    totalEmployees: '',
  });

  useEffect(() => {
    if (open && company) {
      setFormData({
        annualRevenue: company.annualRevenue?.toString() || '',
        totalEmployees: company.totalEmployees?.toString() || '',
      });
    }
  }, [open, company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
      totalEmployees: formData.totalEmployees ? parseInt(formData.totalEmployees) : undefined,
    };
    
    onSubmit?.(submitData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            size="sm" 
            variant="outline"
            data-testid="button-edit-company-context"
          >
            <Pencil className="h-4 w-4 mr-2" />
            {t.actions.editFinancialContext}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.dialogs.editFinancialContext}</DialogTitle>
          <DialogDescription>
            {t.dialogs.editFinancialContextDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annualRevenue">{t.company.annualRevenue} ($)</Label>
              <Input
                id="annualRevenue"
                type="number"
                step="0.01"
                placeholder={t.forms.annualRevenuePlaceholder}
                value={formData.annualRevenue}
                onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                data-testid="input-edit-annual-revenue"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalEmployees">{t.company.totalEmployees}</Label>
              <Input
                id="totalEmployees"
                type="number"
                step="1"
                placeholder={t.forms.totalEmployeesPlaceholder}
                value={formData.totalEmployees}
                onChange={(e) => setFormData({ ...formData, totalEmployees: e.target.value })}
                data-testid="input-edit-total-employees"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-edit-context">
              {t.common.cancel}
            </Button>
            <Button type="submit" data-testid="button-submit-edit-context">
              {t.actions.saveChanges}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
