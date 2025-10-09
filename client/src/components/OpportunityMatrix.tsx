import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkflowData {
  id: string;
  name: string;
  businessImpact: number;
  effortToImplement: number;
  status: string;
}

interface OpportunityMatrixProps {
  workflows: WorkflowData[];
  onWorkflowClick?: (id: string) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Card className="p-3 shadow-lg">
        <p className="font-semibold text-sm mb-1">{data.name}</p>
        <p className="text-xs text-muted-foreground">Impact: {data.businessImpact.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground">Effort: {data.effortToImplement.toFixed(1)}</p>
      </Card>
    );
  }
  return null;
};

export default function OpportunityMatrix({ workflows, onWorkflowClick }: OpportunityMatrixProps) {
  const maxImpact = Math.max(...workflows.map(w => w.businessImpact), 100);
  const maxEffort = Math.max(...workflows.map(w => w.effortToImplement), 100);
  
  const midImpact = maxImpact / 2;
  const midEffort = maxEffort / 2;

  return (
    <div className="space-y-4">
      <div className="h-[500px]" data-testid="chart-opportunity-matrix">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              type="number" 
              dataKey="businessImpact" 
              name="Business Impact" 
              domain={[0, maxImpact]}
              label={{ value: 'Business Impact (Annual Benefits + ROI) →', position: 'bottom', offset: 20, className: 'fill-muted-foreground text-xs' }}
              className="text-xs"
            />
            <YAxis 
              type="number" 
              dataKey="effortToImplement" 
              name="Effort to Implement"
              domain={[0, maxEffort]}
              label={{ value: '← Effort to Implement (Inverted TFA Score)', angle: -90, position: 'left', offset: 40, className: 'fill-muted-foreground text-xs' }}
              className="text-xs"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine x={midImpact} stroke="hsl(var(--border))" strokeDasharray="5 5" />
            <ReferenceLine y={midEffort} stroke="hsl(var(--border))" strokeDasharray="5 5" />
            <Scatter 
              data={workflows} 
              fill="hsl(var(--primary))"
              onClick={(data) => onWorkflowClick?.(data.id)}
              className="cursor-pointer"
            >
              {workflows.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-1" />
            <p className="text-sm font-medium">Quick Wins</p>
          </div>
          <p className="text-xs text-muted-foreground pl-5">High Impact, Low Effort</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-2" />
            <p className="text-sm font-medium">Strategic Projects</p>
          </div>
          <p className="text-xs text-muted-foreground pl-5">High Impact, High Effort</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-3" />
            <p className="text-sm font-medium">Fill-Ins</p>
          </div>
          <p className="text-xs text-muted-foreground pl-5">Low Impact, Low Effort</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-chart-4" />
            <p className="text-sm font-medium">Deprioritize</p>
          </div>
          <p className="text-xs text-muted-foreground pl-5">Low Impact, High Effort</p>
        </div>
      </div>
    </div>
  );
}
