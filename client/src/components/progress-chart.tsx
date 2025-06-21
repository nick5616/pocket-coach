import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface ProgressChartProps {
  title: string;
  data: Array<{
    date: string;
    value: number;
  }>;
  color?: string;
  unit?: string;
}

export default function ProgressChart({ 
  title, 
  data, 
  color = "#58CC02", 
  unit = "" 
}: ProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `${value}${unit}`}
              />
              <Tooltip 
                formatter={(value) => [`${value}${unit}`, title]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={3}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
