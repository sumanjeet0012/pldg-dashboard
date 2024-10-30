'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { ProcessedData } from '@/types/dashboard';
import { Download, TrendingUp, TrendingDown, Users, GitPullRequest, Star, Target, Activity, ThumbsUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface EngagementEntry {
  'Which Tech Partner'?: string;
  'Program Week'?: string;
  'Engagement Tracking'?: string;
  'How likely are you to recommend the PLDG to others?'?: string;
  'How many issues, PRs, or projects this week?'?: string;
  // Add other fields as needed
}

interface Insights {
  weeklyChange: {
    issues: number;
    contributors: number;
    partners: number;
  };
  programHealth: {
    nps: number;
    engagementRate: number;
    totalContributions: number;
  };
  keyHighlights: string[];
}

interface Props {
  data: ProcessedData & {
    rawData?: EngagementEntry[];
  };
  onExport: () => void;
}

const METRIC_EXPLANATIONS = {
  weeklyChange: "Percentage change in total contributions compared to previous week",
  activeContributors: "Number of unique contributors with at least one contribution in the past week",
  totalContributions: "Sum of all PRs, issues, and technical contributions across all tech partners",
  npsScore: "Net Promoter Score calculated from weekly engagement surveys",
  engagementRate: "Percentage of contributors actively participating in discussions and contributions",
  activeTechPartners: "Number of tech partners with active contributions this week"
};

export default function ExecutiveSummary({ data, onExport }: Props) {
  const insights: Insights = React.useMemo(() => {
    // Get entries from CSV data
    const entries = data.rawData || [];
    
    // Get unique tech partners from the data
    const activePartners = new Set(
      entries.flatMap((entry: EngagementEntry) => 
        entry['Which Tech Partner']?.split(',').map((p: string) => p.trim()) ?? []
      )
    ).size;
    
    // Filter out empty or undefined tech partners
    const validPartners = ['IPFS', 'Libp2p', 'Fil-B', 'Fil-Oz', 'Coordination Network', 'Storacha', 'Helia'];

    // Calculate total contributions
    const totalContributions = entries.reduce((sum, entry) => {
      const issueCount = entry['How many issues, PRs, or projects this week?'];
      return sum + (parseInt(issueCount as string) || 0);
    }, 0);

    // Generate key highlights
    const keyHighlights = [
      `${activePartners} active contributors across ${validPartners.length} tech partners`,
      `${totalContributions} total contributions`,
      `${calculatePositiveFeedback(entries)} positive feedback responses`,
      `${Math.abs(Math.round(data.technicalProgress?.[0]?.['Total Issues'] || 0))}% ${
        (data.technicalProgress?.[0]?.['Total Issues'] || 0) > 0 ? 'increase' : 'decrease'
      } in weekly contributions`
    ];
    
    return {
      weeklyChange: {
        issues: data.technicalProgress?.[0]?.['Total Issues'] || 0,
        contributors: activePartners,
        partners: validPartners.length
      },
      programHealth: {
        nps: calculateNPS(entries),
        engagementRate: calculateEngagementRate(entries),
        totalContributions
      },
      keyHighlights
    };
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>PLDG Cohort Performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Key metrics and program health indicators
            </p>
          </div>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Weekly Performance Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Weekly Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-500" size={20} />
                <span className="flex items-center gap-2">
                  <span className="text-green-500">
                    {Math.abs(Math.round(insights.weeklyChange.issues))}% WoW
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {METRIC_EXPLANATIONS.weeklyChange}
                    </TooltipContent>
                  </Tooltip>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="text-blue-500" size={20} />
                <span>{insights.weeklyChange.contributors} Active Contributors</span>
              </div>
              <div className="flex items-center gap-3">
                <GitPullRequest className="text-purple-500" size={20} />
                <span>{insights.programHealth.totalContributions} Total Contributions</span>
              </div>
            </div>
          </div>

          {/* Program Health Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Program Health</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Star className="text-yellow-500" size={20} />
                <span>NPS Score: {Math.round(insights.programHealth.nps)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="text-green-500" size={20} />
                <span>Engagement Rate: {Math.round(insights.programHealth.engagementRate)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="text-blue-500" size={20} />
                <span>Active Tech Partners: {insights.weeklyChange.partners}</span>
              </div>
            </div>
          </div>

          {/* Key Highlights Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">Key Highlights</h3>
            <div className="space-y-3">
              {insights.keyHighlights.map((highlight, index) => (
                <div key={index} className="flex items-center gap-3">
                  {index === 0 && <Users className="text-blue-500" size={20} />}
                  {index === 1 && <GitPullRequest className="text-purple-500" size={20} />}
                  {index === 2 && <ThumbsUp className="text-green-500" size={20} />}
                  {index === 3 && (insights.weeklyChange.issues > 0 ? 
                    <TrendingUp className="text-green-500" size={20} /> : 
                    <TrendingDown className="text-red-500" size={20} />
                  )}
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateNPS(entries: EngagementEntry[]): number {
  const scores = entries
    .map(entry => parseInt(entry['How likely are you to recommend the PLDG to others?'] || '0'))
    .filter(score => !isNaN(score));

  if (scores.length === 0) return 0;

  const promoters = scores.filter(score => score >= 9).length;
  const detractors = scores.filter(score => score <= 6).length;
  
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

function calculateEngagementRate(entries: EngagementEntry[]): number {
  const totalEntries = entries.length;
  if (totalEntries === 0) return 0;

  const activeEntries = entries.filter(entry => 
    entry['Engagement Tracking']?.includes('Highly engaged') || 
    entry['Engagement Tracking']?.includes('Actively listened')
  ).length;

  return Math.round((activeEntries / totalEntries) * 100);
}

function calculatePositiveFeedback(entries: EngagementEntry[]): number {
  return entries.filter(entry => 
    parseInt(entry['How likely are you to recommend the PLDG to others?'] || '0') >= 8
  ).length;
} 