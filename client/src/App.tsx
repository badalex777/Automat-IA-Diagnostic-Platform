import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from "@/pages/Dashboard";
import CompanyDetail from "@/pages/CompanyDetail";
import WorkflowDetail from "@/pages/WorkflowDetail";
import TFAForm from "@/pages/TFAForm";
import TFAThankYou from "@/pages/TFAThankYou";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/company/:id" component={CompanyDetail} />
      <Route path="/company/:companyId/workflow/:workflowId" component={WorkflowDetail} />
      <Route path="/tfa/:shareableLink/thank-you" component={TFAThankYou} />
      <Route path="/tfa/:shareableLink" component={TFAForm} />
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
