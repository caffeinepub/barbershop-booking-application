import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlySalesData } from '../backend';
import { Card, CardContent } from '@/components/ui/card';

interface MonthlySalesChartProps {
  data: MonthlySalesData[];
}

export default function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">No sales data available</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(item => ({
    month: `Month ${item.month}`,
    revenue: Number(item.totalRevenueCents) / 100,
    transactions: Number(item.transactionCount),
  })).slice(-12); // Show last 12 months

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'revenue') {
                return [`$${value.toFixed(2)}`, 'Revenue'];
              }
              return [value, 'Transactions'];
            }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue ($)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
