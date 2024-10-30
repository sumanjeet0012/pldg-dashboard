'use client';

import * as React from 'react';
import { TechPartnerPerformance } from '@/types/dashboard';
import { GitPullRequest, Users, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: TechPartnerPerformance[];
}

export default function TechPartnerChart({ data }: Props) {
  const githubBoardUrl = "https://github.com/users/kt-wawro/projects/7/views/1";
  const validPartners = ['IPFS', 'Libp2p', 'Fil-B', 'Fil-Oz', 'Coordination Network', 'Storacha', 'Helia'];
  
  // Consolidate data by partner
  const consolidatedData = validPartners.map(partner => {
    const contributions = data
      .filter(item => item.partner === partner)
      .reduce((sum, curr) => sum + curr.issues, 0);
      
    return {
      partner,
      issues: contributions
    };
  });

  // Sort by total issues
  const sortedData = consolidatedData.sort((a, b) => b.issues - a.issues);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Activity Overview</CardTitle>
        <CardDescription>Cumulative contributions by tech partner</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="partner" />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="issues" 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              label={{ position: 'top' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 