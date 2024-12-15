'use client';

import * as React from 'react';
import { EnhancedTechPartnerData } from '@/types/dashboard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface TimeSeriesViewProps {
  data: EnhancedTechPartnerData[];
}

export function TimeSeriesView({ data }: TimeSeriesViewProps) {
  const timeSeriesData = data.flatMap(partner =>
    partner.timeSeriesData.map(series => ({
      week: series.week,
      partner: partner.partner,
      issues: series.issueCount,
      contributors: series.contributors.length,
      engagementLevel: series.engagementLevel
    }))
  );

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={timeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '6px',
            padding: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        <Line
          type="monotone"
          dataKey="issues"
          stroke="#8884d8"
          name="Issues"
        />
        <Line
          type="monotone"
          dataKey="contributors"
          stroke="#82ca9d"
          name="Contributors"
        />
        <Line
          type="monotone"
          dataKey="engagementLevel"
          stroke="#ffc658"
          name="Engagement Level"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
