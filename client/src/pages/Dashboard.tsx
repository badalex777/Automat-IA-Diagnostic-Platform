import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company } from "@shared/schema";
import CompanyCard from "@/components/CompanyCard";
import CreateCompanyDialog from "@/components/CreateCompanyDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: companies = [], isLoading, error } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const createCompanyMutation = useMutation({
    mutationFn: async (data: { 
      name: string; 
      industry: string; 
      contact?: string;
      leadAnalystName?: string;
      annualRevenue?: number;
      totalEmployees?: number;
      annualLaborCosts?: number;
    }) => {
      const res = await apiRequest('POST', '/api/companies', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company created",
        description: "The company has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold" data-testid="text-page-title">Athenia Diagnostic Platform</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage AI feasibility assessments for client companies</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/documentation">
                <Button variant="ghost" size="icon" data-testid="button-documentation">
                  <BookOpen className="h-5 w-5" />
                </Button>
              </Link>
              <ThemeToggle />
              <CreateCompanyDialog 
                onSubmit={(data) => createCompanyMutation.mutate(data)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Companies</h2>
            <p className="text-sm text-muted-foreground">
              {filteredCompanies.length} {filteredCompanies.length !== companies.length ? `of ${companies.length}` : ''} companies
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-companies"
            />
          </div>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Error</p>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/companies'] })} data-testid="button-retry">
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCompanies.map((company) => (
                <CompanyCard 
                  key={company.id} 
                  id={company.id}
                  name={company.name}
                  industry={company.industry}
                  workflowCount={(company as any).workflowCount || 0}
                  completedCount={(company as any).completedCount || 0}
                />
              ))}
            </div>

            {filteredCompanies.length === 0 && companies.length > 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No companies match your search.</p>
              </div>
            )}

            {companies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No companies yet. Create one to get started.</p>
                <CreateCompanyDialog 
                  onSubmit={(data) => createCompanyMutation.mutate(data)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
