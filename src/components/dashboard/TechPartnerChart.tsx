'use client';

import * as React from 'react';
import { EnhancedTechPartnerData } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TimeSeriesView } from './views/TimeSeriesView';
import { ContributorView } from './views/ContributorView';
import { CollaborationView } from './views/CollaborationView';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LineChart, Users, GitPullRequest } from 'lucide-react';

interface Props {
  data: EnhancedTechPartnerData[];
  viewMode: 'timeline' | 'contributors' | 'collaboration';
  onViewChange: (view: 'timeline' | 'contributors' | 'collaboration') => void;
  onPartnerSelect?: (partner: string) => void;
}

export default function TechPartnerChart({ data, viewMode, onViewChange, onPartnerSelect }: Props) {
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

  const renderView = () => {
    switch (viewMode) {
      case 'timeline':
        return <TimeSeriesView data={data} />;
      case 'contributors':
        return <ContributorView data={data} />;
      case 'collaboration':
        return <CollaborationView data={data} />;
      default:
        return <TimeSeriesView data={data} />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Partner Activity Overview</CardTitle>
            <CardDescription>Comprehensive tech partner engagement metrics</CardDescription>
          </div>
          <ToggleGroup type="single" value={viewMode} onValueChange={onViewChange}>
            <ToggleGroupItem value="timeline" aria-label="Show timeline view">
              <LineChart className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="contributors" aria-label="Show contributors view">
              <Users className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="collaboration" aria-label="Show collaboration view">
              <GitPullRequest className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {renderView()}
      </CardContent>
    </Card>
  );
} 