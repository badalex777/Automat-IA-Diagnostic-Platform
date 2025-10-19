import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Dashboard from "@/pages/Dashboard";
import CompanyDetail from "@/pages/CompanyDetail";
import WorkflowDetail from "@/pages/WorkflowDetail";
import TFAForm from "@/pages/TFAForm";
import TFAThankYou from "@/pages/TFAThankYou";
import PIFForm from "@/pages/PIFForm";
import PIFThankYou from "@/pages/PIFThankYou";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/company/:id" component={CompanyDetail} />
      <Route path="/company/:companyId/workflow/:workflowId" component={WorkflowDetail} />
      <Route path="/tfa/:shareableLink/thank-you" component={TFAThankYou} />
      <Route path="/tfa/:shareableLink" component={TFAForm} />
      <Route path="/pif/:shareableId/thank-you" component={PIFThankYou} />
      <Route path="/pif/:shareableId" component={PIFForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
