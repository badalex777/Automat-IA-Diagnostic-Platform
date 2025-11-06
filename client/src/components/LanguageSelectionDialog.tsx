import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FileText, Globe } from "lucide-react";

interface LanguageSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (language: 'en' | 'es') => void;
  isPending?: boolean;
}

export default function LanguageSelectionDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: LanguageSelectionDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es' | null>(null);

  // Reset language selection whenever dialog opens to require explicit user choice
  useEffect(() => {
    if (open) {
      setSelectedLanguage(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedLanguage) {
      onConfirm(selectedLanguage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-language-selection">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle>Generate Executive Diagnostic Report</DialogTitle>
          </div>
          <DialogDescription>
            Select the language for your report. All data and analysis will remain the same, only the narrative text will be translated.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Report Language</Label>
          </div>
          
          <RadioGroup 
            value={selectedLanguage || undefined} 
            onValueChange={(value) => setSelectedLanguage(value as 'en' | 'es')}
            className="space-y-3"
            data-testid="radio-group-language"
          >
            <div className="flex items-center space-x-3 border rounded-md p-3 hover-elevate active-elevate-2">
              <RadioGroupItem value="en" id="lang-en" data-testid="radio-language-en" />
              <Label 
                htmlFor="lang-en" 
                className="flex-1 cursor-pointer text-sm"
              >
                <div className="font-medium">English</div>
                <div className="text-muted-foreground text-xs">Full diagnostic report in English</div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 border rounded-md p-3 hover-elevate active-elevate-2">
              <RadioGroupItem value="es" id="lang-es" data-testid="radio-language-es" />
              <Label 
                htmlFor="lang-es" 
                className="flex-1 cursor-pointer text-sm"
              >
                <div className="font-medium">Español (Spanish)</div>
                <div className="text-muted-foreground text-xs">Informe diagnóstico completo en español</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            data-testid="button-cancel-language"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isPending || !selectedLanguage}
            data-testid="button-confirm-language"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isPending ? 'Generating...' : 'Generate Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
