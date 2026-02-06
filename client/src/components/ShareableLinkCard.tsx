import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TFAAssessment } from "@shared/schema";

interface ShareableLinkCardProps {
  workflowId: string;
  companyName: string;
  workflowTitle: string;
  type?: 'tfa' | 'pif';
  stepId?: string;
  stepName?: string;
}

interface PIFTemplate {
  shareableId: string;
}

export default function ShareableLinkCard({
  workflowId,
  companyName,
  workflowTitle,
  type = 'tfa',
  stepId,
  stepName,
}: ShareableLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [pifTemplate, setPifTemplate] = useState<PIFTemplate | null>(null);
  const { toast } = useToast();

  const { data: existingAssessment } = useQuery<TFAAssessment>({
    queryKey: [`/api/workflows/${workflowId}/tfa`],
    enabled: !!workflowId && type === 'tfa',
  });

  const generateTFALinkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/tfa', { workflowId });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workflows/${workflowId}/tfa`] });
      toast({
        title: "Shareable link generated",
        description: "A new shareable link has been created for this workflow.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generatePIFLinkMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', `/api/workflows/${workflowId}/pif/create-shareable`, { stepId });
      return await res.json();
    },
    onSuccess: (data) => {
      setPifTemplate({
        shareableId: data.shareableId,
      });
      toast({
        title: "PIF link generated",
        description: "A new shareable link has been created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error generating link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const shareableUrl = type === 'pif' && pifTemplate
    ? `${window.location.origin}/pif/${pifTemplate.shareableId}`
    : type === 'tfa' && existingAssessment?.shareableId 
    ? `${window.location.origin}/tfa/${existingAssessment.shareableId}`
    : '';

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

  const linkTitle = type === 'pif' 
    ? (stepId ? 'Step-Level Process Insight Form Link' : 'Process Insight Form Link') 
    : 'Shareable TFA Link';
  const linkDescription = type === 'pif' 
    ? (stepId 
      ? `Share this link to collect operational insights specifically for the "${stepName}" step. The response will be associated with this workflow step.`
      : 'Share this link with end users and process owners to collect operational insights. Multiple responses can be submitted.')
    : 'Send this link to the technical contact to complete the Technical Feasibility Assessment';

  if ((type === 'tfa' && (!existingAssessment || !shareableUrl)) || (type === 'pif' && !pifTemplate)) {
    return (
      <Card className="p-6" data-testid="card-shareable-link">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-base mb-1">{linkTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {type === 'pif' 
                ? 'Generate a unique link to share with end users and process owners for collecting operational insights.'
                : 'Generate a unique link to send to your technical contact for completing the assessment.'
              }
            </p>
          </div>
          {type === 'tfa' ? (
            <Button 
              onClick={() => generateTFALinkMutation.mutate()}
              disabled={generateTFALinkMutation.isPending}
              data-testid="button-generate-link"
            >
              {generateTFALinkMutation.isPending ? 'Generating...' : 'Generate Shareable Link'}
            </Button>
          ) : (
            <Button 
              onClick={() => generatePIFLinkMutation.mutate()}
              disabled={generatePIFLinkMutation.isPending}
              data-testid="button-generate-pif-link"
            >
              {generatePIFLinkMutation.isPending ? 'Generating...' : 'Generate PIF Link'}
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6" data-testid="card-shareable-link">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-base mb-1">{linkTitle}</h3>
          <p className="text-sm text-muted-foreground">
            {linkDescription}
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
          {stepId && stepName && (
            <p className="text-muted-foreground">• Step: {stepName}</p>
          )}
        </div>
        
        {type === 'tfa' && (
          <Button 
            onClick={() => generateTFALinkMutation.mutate()}
            variant="outline"
            size="sm"
            disabled={generateTFALinkMutation.isPending}
            data-testid="button-regenerate-link"
          >
            {generateTFALinkMutation.isPending ? 'Regenerating...' : 'Regenerate Link'}
          </Button>
        )}
        {type === 'pif' && (
          <Button 
            onClick={() => generatePIFLinkMutation.mutate()}
            variant="outline"
            size="sm"
            disabled={generatePIFLinkMutation.isPending}
            data-testid="button-regenerate-pif-link"
          >
            {generatePIFLinkMutation.isPending ? 'Regenerating...' : 'Regenerate PIF Link'}
          </Button>
        )}
      </div>
    </Card>
  );
}
