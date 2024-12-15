'use client';

import * as React from 'react';
import { EnhancedTechPartnerData, IssueHighlight, IssueTracking } from '@/types/dashboard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { TimeSeriesView } from './views/TimeSeriesView';
import { ContributorView } from './views/ContributorView';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  data: EnhancedTechPartnerData[];
  viewMode: 'timeline' | 'contributors';
  onViewChange: (view: 'timeline' | 'contributors') => void;
  onPartnerSelect?: (partner: string) => void;
}

const weekOrder = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

function getHighlightedIssues(partnerData: EnhancedTechPartnerData): IssueHighlight[] {
  const issues: IssueHighlight[] = [];

  const mostActive = partnerData.issueTracking
    .sort((a: IssueTracking, b: IssueTracking) => b.engagement - a.engagement)[0];
  if (mostActive) {
    issues.push({
      type: 'success',
      title: 'Most Active Issue',
      description: mostActive.title,
      link: mostActive.link
    });
  }

  const staleIssues = partnerData.issueTracking
    .filter((issue: IssueTracking) => issue.status === 'open' && issue.engagement < 1);
  if (staleIssues.length > 0) {
    issues.push({
      type: 'warning',
      title: 'Needs Review',
      description: `${staleIssues.length} stale issues need attention`,
      link: staleIssues[0].link
    });
  }

  return issues;
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
      .map(item => ({
        ...item,
        timeSeriesData: item.timeSeriesData
          .sort((a, b) => weekOrder.indexOf(a.week) - weekOrder.indexOf(b.week)),
        highlightedIssues: getHighlightedIssues(item)
      }))
      .sort((a, b) => {
        const weekA = weekOrder.indexOf(a.timeSeriesData[0]?.week || 'Week 0');
        const weekB = weekOrder.indexOf(b.timeSeriesData[0]?.week || 'Week 0');
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
        <div className="space-y-6">
          {processedData.map((partner) => (
            <div key={partner.partner} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{partner.partner}</h3>
                <div className="flex gap-2">
                  {partner.highlightedIssues?.map((issue, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={issue.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                              issue.type === 'warning'
                                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {issue.type === 'warning' ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {issue.title}
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm">{issue.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        {viewMode === 'timeline' && <TimeSeriesView data={processedData} />}
        {viewMode === 'contributors' && <ContributorView data={processedData} />}
      </CardContent>
    </Card>
  );
} 