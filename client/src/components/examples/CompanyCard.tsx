import CompanyCard from '../CompanyCard';

export default function CompanyCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CompanyCard
        id="1"
        name="TechCorp Solutions"
        industry="Technology"
        workflowCount={12}
        completedCount={8}
      />
      <CompanyCard
        id="2"
        name="Financial Services Inc"
        industry="Finance"
        workflowCount={5}
        completedCount={5}
      />
      <CompanyCard
        id="3"
        name="Healthcare Plus"
        industry="Healthcare"
        workflowCount={8}
        completedCount={2}
      />
    </div>
  );
}
