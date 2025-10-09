import WorkflowListItem from '../WorkflowListItem';

export default function WorkflowListItemExample() {
  return (
    <div className="border rounded-md">
      <WorkflowListItem
        id="1"
        name="Invoice Processing Automation"
        description="Automate the invoice processing workflow to reduce manual data entry and improve accuracy"
        status="complete"
        tfaScore={82}
        annualBenefits={125000}
        companyId="1"
      />
      <WorkflowListItem
        id="2"
        name="Customer Onboarding"
        description="Streamline customer onboarding process with AI-powered document analysis"
        status="tfa_readiness"
        tfaScore={68}
        companyId="1"
      />
      <WorkflowListItem
        id="3"
        name="Report Generation"
        description="Automated monthly report generation and distribution"
        status="tfa_only"
        tfaScore={45}
        companyId="1"
      />
    </div>
  );
}
