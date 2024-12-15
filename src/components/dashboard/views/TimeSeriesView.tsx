'use client';

import * as React from 'react';
import { EnhancedTechPartnerData } from '@/types/dashboard';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { GitPullRequest, Users, TrendingUp } from 'lucide-react';

interface TimeSeriesViewProps {
  data: EnhancedTechPartnerData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const parseWeekNumber = (weekString: string): number => {
  const match = weekString?.match(/Week (\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <Card className="p-3 bg-white/95 shadow-lg border-0">
      <div className="space-y-2">
        <div className="font-medium">{data.partner} - Week {label ? parseWeekNumber(label) : ''}</div>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-4 w-4" />
            <span>Issues: {data.issues}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Contributors: {data.contributors}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Engagement: {data.engagementLevel}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export function TimeSeriesView({ data }: TimeSeriesViewProps) {
  const timeSeriesData = React.useMemo(() => {
    const allData = data.flatMap(partner =>
      partner.timeSeriesData.map(series => ({
        week: series.week,
        weekNumber: parseWeekNumber(series.week),
        partner: partner.partner,
        issues: series.issueCount,
        contributors: series.contributors.length,
        engagementLevel: series.engagementLevel
      }))
    );

    // Sort by week number
    return allData.sort((a, b) => a.weekNumber - b.weekNumber);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={timeSeriesData}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 12 }}
          tickMargin={10}
          tickFormatter={(value) => `Week ${parseWeekNumber(value)}`}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="issues"
          stroke="#8884d8"
          name="Issues"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="contributors"
          stroke="#82ca9d"
          name="Contributors"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="engagementLevel"
          stroke="#ffc658"
          name="Engagement Level"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
