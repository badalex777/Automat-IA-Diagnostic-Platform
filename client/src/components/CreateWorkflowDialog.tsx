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

interface CreateWorkflowDialogProps {
  onSubmit?: (data: { name: string; description: string }) => void;
}

export default function CreateWorkflowDialog({ onSubmit }: CreateWorkflowDialogProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    setOpen(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-create-workflow">
          <Plus className="h-4 w-4 mr-2" />
          {t.actions.addWorkflow}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t.dialogs.createWorkflow}</DialogTitle>
          <DialogDescription>
            {t.dialogs.createWorkflowDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="workflowName">{t.forms.workflowName} *</Label>
            <Input
              id="workflowName"
              placeholder={t.forms.workflowNamePlaceholder}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="input-workflow-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t.forms.workflowDescription} *</Label>
            <Textarea
              id="description"
              placeholder={t.forms.workflowDescriptionPlaceholder}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
              data-testid="input-workflow-description"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} data-testid="button-cancel-workflow">
              {t.common.cancel}
            </Button>
            <Button type="submit" data-testid="button-submit-workflow">
              {t.company.createWorkflow}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
