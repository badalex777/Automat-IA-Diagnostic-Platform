import { useRoute } from "wouter";
import { CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function TFAThankYou() {
  const [, params] = useRoute("/tfa/:shareableLink/thank-you");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-primary" data-testid="icon-success" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold" data-testid="text-thank-you-title">Thank You!</h1>
          <p className="text-muted-foreground" data-testid="text-confirmation-message">
            Your technical feasibility assessment has been successfully submitted and recorded.
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Your responses will be used to evaluate the automation feasibility of the workflow. 
            The results will help prioritize AI implementation opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
