import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from "recharts";

interface SectionScore {
  name: string;
  score: number;
  weight: number;
}

interface TFAVisualAnalyticsProps {
  sections: SectionScore[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
];

export default function TFAVisualAnalytics({ sections }: TFAVisualAnalyticsProps) {
  const radarData = sections.map(section => ({
    subject: section.name,
    score: section.score,
    fullMark: 5,
  }));

  const pieData = sections.map(section => ({
    name: section.name,
    value: section.weight,
  }));

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-lg mb-4">Visual Analysis</h3>
      <Tabs defaultValue="radar" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="radar" data-testid="tab-radar">Score Profile</TabsTrigger>
          <TabsTrigger value="pie" data-testid="tab-pie">Weight Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="radar" className="mt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This radar chart shows the score profile across all assessment dimensions. Areas closer to the center indicate lower scores requiring attention.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 5]} 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.6} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="pie" className="mt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This pie chart illustrates how different sections contribute to the overall feasibility score. Larger sections have greater impact on the final assessment.
            </p>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
