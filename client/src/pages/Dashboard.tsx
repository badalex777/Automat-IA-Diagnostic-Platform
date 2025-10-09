import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Company } from "@shared/schema";
import CompanyCard from "@/components/CompanyCard";
import CreateCompanyDialog from "@/components/CreateCompanyDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: companies = [], isLoading, error } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading companies",
        description: error.message,
        variant: "destructive",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const createCompanyMutation = useMutation({
    mutationFn: async (data: { name: string; industry: string; contact?: string }) => {
      const res = await apiRequest('POST', '/api/companies', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      toast({
        title: "Company created",
        description: "The company has been successfully added.",
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
              <CreateCompanyDialog 
                onSubmit={(data) => createCompanyMutation.mutate(data)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1">All Companies</h2>
          <p className="text-sm text-muted-foreground">{companies.length} companies registered</p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load companies</p>
            <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/companies'] })} data-testid="button-retry">
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading companies...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <CompanyCard 
                  key={company.id} 
                  id={company.id}
                  name={company.name}
                  industry={company.industry}
                  workflowCount={0}
                  completedCount={0}
                />
              ))}
            </div>

            {companies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No companies yet</p>
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
