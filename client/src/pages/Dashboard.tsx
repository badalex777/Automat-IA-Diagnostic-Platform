import { useState } from "react";
import CompanyCard from "@/components/CompanyCard";
import CreateCompanyDialog from "@/components/CreateCompanyDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

//todo: remove mock functionality
const mockCompanies = [
  { id: '1', name: 'TechCorp Solutions', industry: 'Technology', workflowCount: 12, completedCount: 8 },
  { id: '2', name: 'Financial Services Inc', industry: 'Finance', workflowCount: 5, completedCount: 5 },
  { id: '3', name: 'Healthcare Plus', industry: 'Healthcare', workflowCount: 8, completedCount: 2 },
  { id: '4', name: 'Manufacturing Co', industry: 'Manufacturing', workflowCount: 15, completedCount: 6 },
  { id: '5', name: 'Retail Group', industry: 'Retail', workflowCount: 10, completedCount: 0 },
];

export default function Dashboard() {
  const [companies] = useState(mockCompanies);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-page-title">Automat-IA Diagnostic Platform</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage AI implementation diagnostics across all companies</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <CreateCompanyDialog />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1">All Companies</h2>
          <p className="text-sm text-muted-foreground">{companies.length} companies registered</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <CompanyCard key={company.id} {...company} />
          ))}
        </div>

        {companies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No companies yet</p>
            <CreateCompanyDialog />
          </div>
        )}
      </div>
    </div>
  );
}
