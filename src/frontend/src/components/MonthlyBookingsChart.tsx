import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { MonthlyBookingStats } from '../backend';

interface MonthlyBookingsChartProps {
  data: MonthlyBookingStats[];
}

export default function MonthlyBookingsChart({ data }: MonthlyBookingsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-muted-foreground">No booking data available</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(item => ({
    month: `Month ${item.month}`,
    bookings: Number(item.totalBookings),
  })).slice(-12); // Show last 12 months

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [value, 'Bookings']}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="bookings" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            name="Bookings"
            dot={{ fill: 'hsl(var(--primary))', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
