'use client';

import * as React from 'react';
import { EngagementTrend } from '../../types/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';

interface Props {
  data: EngagementTrend[];
}

export default function EngagementChart({ data }: Props) {
  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle>Engagement Trends</CardTitle>
        <CardDescription>Weekly engagement levels</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <defs>
              <linearGradient id="highEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="mediumEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FFC107" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FFC107" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="lowEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF5722" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF5722" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
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
            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
            <Bar dataKey="High Engagement" stackId="a" fill="url(#highEngagement)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Medium Engagement" stackId="a" fill="url(#mediumEngagement)" />
            <Bar dataKey="Low Engagement" stackId="a" fill="url(#lowEngagement)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}