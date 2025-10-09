import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import TFAScoreDisplay from "@/components/TFAScoreDisplay";
import ShareableLinkCard from "@/components/ShareableLinkCard";
import BusinessImpactForm from "@/components/BusinessImpactForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function WorkflowDetail() {
  const [, params] = useRoute("/company/:companyId/workflow/:workflowId");
  const companyId = params?.companyId || '1';
  const workflowId = params?.workflowId || '1';

  const tfaSections = [
    { name: 'System Environment', score: 4.2, weight: 20 },
    { name: 'Data Quality', score: 3.8, weight: 25 },
    { name: 'Integration', score: 4.0, weight: 25 },
    { name: 'Security', score: 3.5, weight: 15 },
    { name: 'Process Stability', score: 4.5, weight: 10 },
    { name: 'Ownership', score: 4.0, weight: 5 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href={`/company/${companyId}`}>
            <Button variant="ghost" size="sm" className="mb-3" data-testid="button-back-company">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Company
            </Button>
          </Link>
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-workflow-title">Invoice Processing Automation</h1>
              <p className="text-sm text-muted-foreground mt-1">TechCorp Solutions • Complete</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="tfa" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tfa" data-testid="tab-tfa">Technical Feasibility</TabsTrigger>
            <TabsTrigger value="readiness" data-testid="tab-readiness">Readiness Rubric</TabsTrigger>
            <TabsTrigger value="impact" data-testid="tab-impact">Business Impact</TabsTrigger>
          </TabsList>

          <TabsContent value="tfa" className="space-y-6">
            <TFAScoreDisplay score={82} sections={tfaSections} />
            <ShareableLinkCard
              workflowId={workflowId}
              companyName="TechCorp Solutions"
              workflowTitle="Invoice Processing Automation"
            />
          </TabsContent>

          <TabsContent value="readiness" className="space-y-6">
            <div className="bg-card rounded-lg border border-card-border p-6">
              <h2 className="text-lg font-semibold mb-4">Readiness Rubric</h2>
              <p className="text-muted-foreground">
                Readiness data entry interface would go here (prefilled from TFA where applicable, fully editable)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="impact" className="space-y-6">
            <BusinessImpactForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
