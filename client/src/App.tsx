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
import WorkflowStepDetail from "@/pages/WorkflowStepDetail";
import TFAForm from "@/pages/TFAForm";
import TFAThankYou from "@/pages/TFAThankYou";
import PIFForm from "@/pages/PIFForm";
import PIFThankYou from "@/pages/PIFThankYou";
import Documentation from "@/pages/Documentation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/company/:id" component={CompanyDetail} />
      <Route path="/company/:companyId/workflow/:workflowId/step/:stepId" component={WorkflowStepDetail} />
      <Route path="/company/:companyId/workflow/:workflowId" component={WorkflowDetail} />
      {/* Bilingual survey routes wrapped with LanguageProvider */}
      <Route path="/tfa/:shareableLink/thank-you">
        <LanguageProvider>
          <TFAThankYou />
        </LanguageProvider>
      </Route>
      <Route path="/tfa/:shareableLink">
        <LanguageProvider>
          <TFAForm />
        </LanguageProvider>
      </Route>
      <Route path="/pif/:shareableId/thank-you">
        <LanguageProvider>
          <PIFThankYou />
        </LanguageProvider>
      </Route>
      <Route path="/pif/:shareableId">
        <LanguageProvider>
          <PIFForm />
        </LanguageProvider>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
