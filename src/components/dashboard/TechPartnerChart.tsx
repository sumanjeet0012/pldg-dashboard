'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { EnhancedTechPartnerData, ActionableInsight } from '@/types/dashboard';
import { TimeSeriesView } from './views/TimeSeriesView';
import { ContributorView } from './views/ContributorView';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TechPartnerChartProps {
  data: EnhancedTechPartnerData[];
}

export function TechPartnerChart({ data }: TechPartnerChartProps) {
  const [selectedPartner, setSelectedPartner] = useState<string>('all');
  const [view, setView] = useState<'timeline' | 'contributors'>('timeline');

  const getHighlightedIssues = (partnerData: EnhancedTechPartnerData): ActionableInsight[] => {
    const insights: ActionableInsight[] = [];

    if (!partnerData?.timeSeriesData?.length) {
      return insights;
    }

    const latestWeekData = [...partnerData.timeSeriesData]
      .sort((a, b) => new Date(b.weekEndDate).getTime() - new Date(a.weekEndDate).getTime())[0];

    if (latestWeekData?.issues?.length > 0) {
      const mostActive = latestWeekData.issues.find(issue => issue?.status === 'open');
      if (mostActive) {
        insights.push({
          type: 'success',
          title: 'Active Issue',
          description: mostActive.title || 'Latest issue',
          link: mostActive.url || '#'
        });
      }
    }

    const staleIssues = partnerData.timeSeriesData
      .flatMap(week => week.issues || [])
      .filter(issue =>
        issue?.status === 'open' &&
        issue?.lastUpdated &&
        new Date(issue.lastUpdated) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

    if (staleIssues.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Needs Review',
        description: `${staleIssues.length} stale issue${staleIssues.length > 1 ? 's' : ''}`,
        link: staleIssues[0]?.url || '#'
      });
    }

    return insights;
  };

  const filteredData = React.useMemo(() => {
    if (selectedPartner === 'all') return data;
    return data.filter(item => item.partner === selectedPartner);
  }, [data, selectedPartner]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Partner Activity Overview</CardTitle>
            <CardDescription>Comprehensive tech partner engagement metrics</CardDescription>
          </div>
          <Select
            value={selectedPartner}
            onValueChange={setSelectedPartner}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Partners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Partners</SelectItem>
              {Array.from(new Set(data.map(item => item.partner))).map(partner => (
                <SelectItem key={partner} value={partner}>
                  {partner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => value && setView(value as 'timeline' | 'contributors')}
          className="justify-start"
        >
          <ToggleGroupItem value="timeline" aria-label="Show timeline view">
            Timeline
          </ToggleGroupItem>
          <ToggleGroupItem value="contributors" aria-label="Show contributors view">
            Contributors
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        {filteredData.map(partner => (
          <div key={partner.partner} className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{partner.partner}</h3>
              <div className="flex gap-2">
                {getHighlightedIssues(partner).map((insight, index) => (
                  <TooltipProvider key={`${partner.partner}-${insight.title}-${index}`}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={insight.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                            insight.type === 'warning'
                              ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {insight.type === 'warning' ? (
                            <AlertCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {insight.title}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        <p className="text-sm">{insight.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div className="mt-4">
          {view === 'timeline' ? (
            <TimeSeriesView data={filteredData} />
          ) : (
            <ContributorView data={filteredData} />
          )}
        </div>
      </CardContent>
    </Card>
  );
} 