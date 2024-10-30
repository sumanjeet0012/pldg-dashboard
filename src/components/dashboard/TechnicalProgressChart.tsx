'use client';

import * as React from 'react';
import { TechnicalProgress } from '../../types/dashboard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  data: TechnicalProgress[];
}

const GITHUB_LINKS = {
  board: "https://github.com/users/kt-wawro/projects/7/views/1",
  issues: "https://github.com/users/kt-wawro/projects/7/views/1?filterQuery=is%3Aissue"
};

export default function TechnicalProgressChart({ data }: Props) {
  const maxIssues = Math.max(...data.map(d => d['Total Issues']));
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => Math.round(maxIssues * i / 4));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Technical Progress</CardTitle>
            <CardDescription>Weekly contribution tracking</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(GITHUB_LINKS.board, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Project Board
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(GITHUB_LINKS.issues, '_blank')}
              className="flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Issues
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, maxIssues]} ticks={yAxisTicks} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="Total Issues" 
                stroke="#2196F3"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 