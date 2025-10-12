import { Check } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Card, CardContent } from "@/components/ui/card";

export default function PISThankYou() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Process Insight Survey</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Thank You!</h2>
              <p className="text-muted-foreground">
                Your Process Insight Survey response has been submitted successfully. Your insights will help assess the operational readiness for AI automation.
              </p>
            </div>
            <p className="text-sm text-muted-foreground pt-4">
              You can now close this page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
