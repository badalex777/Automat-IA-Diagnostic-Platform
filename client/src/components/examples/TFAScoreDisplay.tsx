import TFAScoreDisplay from '../TFAScoreDisplay';

export default function TFAScoreDisplayExample() {
  const sections = [
    { name: 'System Environment', score: 4.2, weight: 20 },
    { name: 'Data Quality', score: 3.8, weight: 25 },
    { name: 'Integration', score: 4.0, weight: 25 },
    { name: 'Security', score: 3.5, weight: 15 },
    { name: 'Process Stability', score: 4.5, weight: 10 },
    { name: 'Ownership', score: 4.0, weight: 5 },
  ];

  return (
    <div className="max-w-2xl">
      <TFAScoreDisplay score={78} sections={sections} />
    </div>
  );
}
