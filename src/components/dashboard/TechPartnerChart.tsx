'use client';

import * as React from 'react';
import { EnhancedTechPartnerData } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TimeSeriesView } from './views/TimeSeriesView';
import { ContributorView } from './views/ContributorView';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Users } from 'lucide-react';

interface Props {
  data: EnhancedTechPartnerData[];
  viewMode: 'timeline' | 'contributors';
  onViewChange: (view: 'timeline' | 'contributors') => void;
  onPartnerSelect?: (partner: string) => void;
}

export default function TechPartnerChart({ data, viewMode, onViewChange, onPartnerSelect }: Props) {
  const [selectedPartner, setSelectedPartner] = React.useState<string>('all');
  const validPartners = React.useMemo(() =>
    Array.from(new Set(data.map(item => item.partner))).sort(),
    [data]
  );

  const processedData = React.useMemo(() => {
    return data
      .filter(item => selectedPartner === 'all' || item.partner === selectedPartner)
      .sort((a, b) => {
        const weekA = parseInt(a.timeSeriesData[0]?.week.split(' ')[1] || '0');
        const weekB = parseInt(b.timeSeriesData[0]?.week.split(' ')[1] || '0');
        return weekA - weekB;
      });
  }, [data, selectedPartner]);

  React.useEffect(() => {
    onPartnerSelect?.(selectedPartner);
  }, [selectedPartner, onPartnerSelect]);

  if (!data?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Partner Activity Overview</CardTitle>
          <CardDescription>Comprehensive tech partner engagement metrics</CardDescription>
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
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Partner Activity Overview</CardTitle>
            <CardDescription>Comprehensive tech partner engagement metrics</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedPartner}
              onValueChange={setSelectedPartner}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Partner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Partners</SelectItem>
                {validPartners.map(partner => (
                  <SelectItem key={partner} value={partner}>
                    {partner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && onViewChange(value as 'timeline' | 'contributors')}
              aria-label="View mode selection"
            >
              <ToggleGroupItem value="timeline" aria-label="Show timeline view">
                <LineChart className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="contributors" aria-label="Show contributors view">
                <Users className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'timeline' && <TimeSeriesView data={processedData} />}
        {viewMode === 'contributors' && <ContributorView data={processedData} />}
      </CardContent>
    </Card>
  );
} 