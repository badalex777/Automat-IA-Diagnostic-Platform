import ShareableLinkCard from '../ShareableLinkCard';

export default function ShareableLinkCardExample() {
  return (
    <div className="max-w-3xl">
      <ShareableLinkCard
        workflowId="abc123"
        companyName="TechCorp Solutions"
        workflowTitle="Invoice Processing Automation"
      />
    </div>
  );
}
