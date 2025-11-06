import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Check, Copy, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { pifTranslations } from "@shared/pifTranslations";

export default function PIFThankYou() {
  const [, params] = useRoute("/pif/:shareableId/thank-you");
  const [, setLocation] = useLocation();
  const shareableId = params?.shareableId || '';
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<'en' | 'es'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('pif_language') as 'en' | 'es' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const t = pifTranslations[language];
  
  const shareableLink = `${window.location.origin}/pif/${shareableId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    toast({
      title: "Link Copied",
      description: "The survey link has been copied to your clipboard.",
    });
  };

  const handleSubmitAnother = () => {
    setLocation(`/pif/${shareableId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t.ui.title}</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">{t.ui.thankYouTitle}</h2>
                <p className="text-muted-foreground">
                  {t.ui.thankYouMessage}
                </p>
              </div>
            </div>

            {/* Shareable Link */}
            <div className="space-y-2 pt-4 border-t">
              <Label className="text-sm font-medium">Survey Link</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Share this link to collect additional responses for this workflow
              </p>
              <div className="flex gap-2">
                <Input
                  value={shareableLink}
                  readOnly
                  className="font-mono text-sm"
                  data-testid="input-shareable-link"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  data-testid="button-copy-link"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Submit Another Response */}
            <div className="space-y-3 pt-2">
              <Button
                className="w-full"
                onClick={handleSubmitAnother}
                data-testid="button-submit-another"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Submit Another Response
              </Button>
              
              <p className="text-sm text-muted-foreground text-center">
                {t.ui.closePageMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
