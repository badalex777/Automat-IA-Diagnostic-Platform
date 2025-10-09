import BusinessImpactForm from '../BusinessImpactForm';

export default function BusinessImpactFormExample() {
  return (
    <div className="max-w-4xl">
      <BusinessImpactForm onSubmit={(data) => console.log('Submitted:', data)} />
    </div>
  );
}
