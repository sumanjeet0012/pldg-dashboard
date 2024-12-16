'use client';

import * as React from 'react';
import { EnhancedTechPartnerData } from '@/types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface TimeSeriesViewProps {
  data: EnhancedTechPartnerData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <Card className="p-3 bg-white/95 shadow-lg border-0">
      <div className="space-y-2">
        <div className="font-medium">Week {label}</div>
        <div className="grid gap-1 text-sm">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span>
                {entry.name}: {entry.value} {entry.value === 1 ? 'issue' : 'issues'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export function TimeSeriesView({ data }: TimeSeriesViewProps) {
  const chartData = React.useMemo(() => {
    // Get all unique weeks
    const allWeeks = new Set<string>();
    data.forEach(partner => {
      partner.timeSeriesData.forEach(ts => {
        allWeeks.add(ts.week);
      });
    });

    // Sort weeks by number
    const sortedWeeks = Array.from(allWeeks).sort((a, b) => {
      const weekA = parseInt(a.match(/\d+/)?.[0] || '0');
      const weekB = parseInt(b.match(/\d+/)?.[0] || '0');
      return weekA - weekB;
    });

    // Create data points for each week
    return sortedWeeks.map(week => {
      const point: Record<string, any> = { week };
      data.forEach(partner => {
        const weekData = partner.timeSeriesData.find(ts => ts.week === week);
        point[partner.partner] = weekData?.issueCount || 0;
      });
      return point;
    });
  }, [data]);

  // Add debug logging
  React.useEffect(() => {
    console.log('TimeSeriesView Data:', {
      rawData: data,
      processedData: chartData,
      weekCount: chartData.length,
      partners: data.map(p => p.partner)
    });
  }, [data, chartData]);

  const COLORS = {
    'Libp2p': '#3B82F6',
    'IPFS': '#14B8A6',
    'Fil-B': '#A855F7',
    'Fil-Oz': '#6366F1',
    'Coordination Network': '#F43F5E',
    'Storacha': '#F59E0B',
    'Drand': '#10B981'
  };

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 40, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis 
            dataKey="week"
            tickFormatter={(value) => `Week ${value}`}
            tick={{ fontSize: 12 }}
            height={60}
          />
          <YAxis 
            label={{ 
              value: 'Issues', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={48}
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
          
          {data.map((partner) => (
            <Bar
              key={partner.partner}
              dataKey={partner.partner}
              name={partner.partner}
              stackId="issues"
              fill={COLORS[partner.partner as keyof typeof COLORS] || '#CBD5E1'}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
