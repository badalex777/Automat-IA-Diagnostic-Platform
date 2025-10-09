import { useState } from 'react';
import TFAQuestionCard from '../TFAQuestionCard';

export default function TFAQuestionCardExample() {
  const [value, setValue] = useState<string>('4');

  return (
    <div className="max-w-3xl">
      <TFAQuestionCard
        question="Deployment model: How are the main systems for this workflow deployed?"
        questionNumber={1}
        weight={5}
        options={[
          { value: '1', label: 'Legacy on-prem only', description: 'Very Low Feasibility / Major Limitation' },
          { value: '2', label: 'Mostly on-prem, some cloud', description: 'Low Feasibility / Several Limitations' },
          { value: '3', label: 'Mixed/hybrid', description: 'Moderate Feasibility / Some Workarounds Possible' },
          { value: '4', label: 'Mostly cloud SaaS', description: 'Good Feasibility / Minor Constraints' },
          { value: '5', label: 'Modern cloud SaaS only', description: 'Excellent Feasibility / Fully Ready' },
        ]}
        value={value}
        onChange={setValue}
      />
    </div>
  );
}
