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
    <Card>
      <CardHeader>
        <CardTitle>Engagement Trends</CardTitle>
        <CardDescription>Weekly engagement levels</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px] w-full min-w-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="week" 
                tick={{ fill: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
              />
              <YAxis 
                tick={{ fill: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="High Engagement" stackId="a" fill="url(#highEngagement)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Medium Engagement" stackId="a" fill="url(#mediumEngagement)" />
              <Bar dataKey="Low Engagement" stackId="a" fill="url(#lowEngagement)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}