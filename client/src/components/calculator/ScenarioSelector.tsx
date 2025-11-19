import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { scenarioMultipliers, ScenarioType } from '@shared/schema';

interface ScenarioSelectorProps {
  selectedScenario: ScenarioType;
  onScenarioChange: (scenario: ScenarioType) => void;
}

const scenarioNames: Record<ScenarioType, string> = {
  best: 'Best Case',
  base: 'Base Case',
  conservative: 'Conservative',
  worst: 'Worst Case',
};

const scenarioDescriptions: Record<ScenarioType, string> = {
  best: 'AI achieves maximum potential with full adoption and optimized workflows',
  base: 'Realistic implementation with typical challenges and gradual adoption',
  conservative: 'Cautious approach with minimal changes and slower adoption rates',
  worst: 'Pessimistic case with implementation challenges and resistance',
};

export default function ScenarioSelector({ selectedScenario, onScenarioChange }: ScenarioSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          Scenario Analysis
        </CardTitle>
        <CardDescription>
          Select a scenario to see how different assumptions affect your ROI calculation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(scenarioMultipliers).map(([key, scenario]) => (
            <div key={key} className="space-y-3 min-h-0">
              <Button
                variant={selectedScenario === key ? "default" : "outline"}
                className="w-full h-auto p-4 flex flex-col items-start gap-2 hover-elevate min-h-[100px] justify-start"
                onClick={() => onScenarioChange(key as ScenarioType)}
                data-testid={`button-scenario-${key}`}
              >
                <div className="font-semibold text-left">
                  {scenarioNames[key as ScenarioType]}
                </div>
                <div className="text-xs text-left opacity-80 leading-relaxed">
                  {scenarioDescriptions[key as ScenarioType]}
                </div>
              </Button>
              
              {selectedScenario === key && (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <div className="text-xs font-medium text-muted-foreground">Multipliers Applied:</div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <Badge variant="secondary" className="justify-between">
                      <span>Time</span>
                      <span>{(scenario.timeSavingsMultiplier * 100).toFixed(0)}%</span>
                    </Badge>
                    <Badge variant="secondary" className="justify-between">
                      <span>Error</span>
                      <span>{(scenario.errorReductionMultiplier * 100).toFixed(0)}%</span>
                    </Badge>
                    <Badge variant="secondary" className="justify-between">
                      <span>Realloc</span>
                      <span>{(scenario.reallocationMultiplier * 100).toFixed(0)}%</span>
                    </Badge>
                    <Badge variant="secondary" className="justify-between">
                      <span>Cost+</span>
                      <span>{(scenario.costOverrunMultiplier * 100).toFixed(0)}%</span>
                    </Badge>
                    <Badge variant="secondary" className="justify-between">
                      <span>Ramp-up</span>
                      <span>{(scenario.rampUpEfficiencyMultiplier * 100).toFixed(0)}%</span>
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
