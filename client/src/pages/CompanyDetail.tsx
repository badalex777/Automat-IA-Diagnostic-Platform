import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import WorkflowListItem from "@/components/WorkflowListItem";
import OpportunityMatrix from "@/components/OpportunityMatrix";
import { ThemeToggle } from "@/components/ThemeToggle";

//todo: remove mock functionality
const mockWorkflows = [
  { id: '1', name: 'Invoice Processing Automation', description: 'Automate invoice processing to reduce manual entry', status: 'complete' as const, tfaScore: 82, annualBenefits: 125000 },
  { id: '2', name: 'Customer Onboarding', description: 'Streamline onboarding with AI document analysis', status: 'tfa_readiness' as const, tfaScore: 68 },
  { id: '3', name: 'Report Generation', description: 'Automated monthly report generation', status: 'tfa_only' as const, tfaScore: 45 },
  { id: '4', name: 'Email Classification', description: 'Auto-classify and route customer emails', status: 'complete' as const, tfaScore: 75, annualBenefits: 85000 },
  { id: '5', name: 'Data Entry System', description: 'Automated data extraction from forms', status: 'complete' as const, tfaScore: 88, annualBenefits: 150000 },
];

const mockMatrixData = [
  { id: '1', name: 'Invoice Processing', businessImpact: 85, effortToImplement: 25, status: 'complete' },
  { id: '4', name: 'Email Classification', businessImpact: 72, effortToImplement: 35, status: 'complete' },
  { id: '5', name: 'Data Entry System', businessImpact: 90, effortToImplement: 20, status: 'complete' },
];

export default function CompanyDetail() {
  const [, params] = useRoute("/company/:id");
  const [workflows] = useState(mockWorkflows);
  const companyId = params?.id || '1';

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-3" data-testid="button-back">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-company-name">TechCorp Solutions</h1>
              <p className="text-sm text-muted-foreground mt-1">Technology • 12 workflows</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button data-testid="button-create-workflow">
                <Plus className="h-4 w-4 mr-2" />
                Add Workflow
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList>
            <TabsTrigger value="workflows" data-testid="tab-workflows">Workflows</TabsTrigger>
            <TabsTrigger value="matrix" data-testid="tab-matrix">Opportunity Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-4">
            <div className="bg-card rounded-lg border border-card-border p-6">
              {workflows.map((workflow) => (
                <WorkflowListItem key={workflow.id} {...workflow} companyId={companyId} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-4">
            <div className="bg-card rounded-lg border border-card-border p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Implementation Prioritization</h2>
                <p className="text-sm text-muted-foreground">
                  {mockMatrixData.length} completed workflows positioned for roadmap planning
                </p>
              </div>
              <OpportunityMatrix 
                workflows={mockMatrixData}
                onWorkflowClick={(id) => console.log('Navigate to workflow:', id)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
