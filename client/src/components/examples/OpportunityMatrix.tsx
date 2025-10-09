import OpportunityMatrix from '../OpportunityMatrix';

export default function OpportunityMatrixExample() {
  const workflows = [
    { id: '1', name: 'Invoice Processing', businessImpact: 85, effortToImplement: 25, status: 'complete' },
    { id: '2', name: 'Customer Onboarding', businessImpact: 72, effortToImplement: 45, status: 'complete' },
    { id: '3', name: 'Report Generation', businessImpact: 35, effortToImplement: 60, status: 'complete' },
    { id: '4', name: 'Data Entry Automation', businessImpact: 90, effortToImplement: 30, status: 'complete' },
    { id: '5', name: 'Email Classification', businessImpact: 40, effortToImplement: 20, status: 'complete' },
  ];

  return (
    <OpportunityMatrix 
      workflows={workflows} 
      onWorkflowClick={(id) => console.log('Workflow clicked:', id)} 
    />
  );
}
