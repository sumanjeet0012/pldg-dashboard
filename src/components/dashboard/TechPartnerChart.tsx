'use client';

import * as React from 'react';
import { TechPartnerPerformance } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: TechPartnerPerformance[];
}

export default function TechPartnerChart({ data }: Props) {
  const validPartners = ['IPFS', 'Libp2p', 'Fil-B', 'Fil-Oz', 'Coordination Network', 'Storacha', 'Helia'];
  
  React.useEffect(() => {
    console.log('TechPartner Data:', {
      rawData: data,
      validPartners
    });
  }, [data]);

  const consolidatedData = React.useMemo(() => {
    const partnerData = validPartners.map(partner => {
      const contributions = data
        .filter(item => item.partner === partner)
        .reduce((sum, curr) => sum + (curr.issues || 0), 0);
        
      return {
        partner,
        issues: contributions
      };
    });

    const sortedData = partnerData
      .filter(item => item.issues > 0)
      .sort((a, b) => b.issues - a.issues);

    console.log('Consolidated Partner Data:', sortedData);
    return sortedData;
  }, [data, validPartners]);

  if (!consolidatedData?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partner Activity Overview</CardTitle>
          <CardDescription>Cumulative contributions by tech partner</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className="text-muted-foreground">No tech partner data available</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Partner Activity Overview</CardTitle>
        <CardDescription>Cumulative contributions by tech partner</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={consolidatedData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="partner"
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
            <Bar 
              dataKey="issues" 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              label={{ 
                position: 'top',
                fontSize: 12,
                fill: '#666'
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
} 