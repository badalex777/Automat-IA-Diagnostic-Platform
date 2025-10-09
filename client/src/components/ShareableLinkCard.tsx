import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareableLinkCardProps {
  workflowId: string;
  companyName: string;
  workflowTitle: string;
}

export default function ShareableLinkCard({
  workflowId,
  companyName,
  workflowTitle,
}: ShareableLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareableUrl = `${window.location.origin}/tfa/${workflowId}?company=${encodeURIComponent(companyName)}&workflow=${encodeURIComponent(workflowTitle)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The shareable link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Card className="p-6" data-testid="card-shareable-link">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-base mb-1">Shareable TFA Link</h3>
          <p className="text-sm text-muted-foreground">
            Send this link to the technical contact to complete the Technical Feasibility Assessment
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            value={shareableUrl}
            readOnly
            className="font-mono text-sm"
            data-testid="input-shareable-url"
          />
          <Button
            onClick={handleCopy}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            data-testid="button-copy-link"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            onClick={() => window.open(shareableUrl, '_blank')}
            variant="outline"
            size="icon"
            className="flex-shrink-0"
            data-testid="button-open-link"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div className="bg-muted rounded-md p-3 text-sm space-y-1">
          <p className="font-medium">Pre-filled Information:</p>
          <p className="text-muted-foreground">• Company: {companyName}</p>
          <p className="text-muted-foreground">• Workflow: {workflowTitle}</p>
        </div>
      </div>
    </Card>
  );
}
