import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import _ from 'lodash'
import { 
  IssueMetrics, 
  RawIssueMetric, 
  ProcessedData, 
  EnhancedProcessedData,
  EngagementData
} from '../types/dashboard'
import { processDataWithAI } from './ai';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function processEngagementData(rawData: EngagementData[]): Promise<EnhancedProcessedData> {
  // Sort data by week
  const sortedData = _.sortBy(rawData, 'Program Week');
  const engagementByWeek = _.groupBy(sortedData, 'Program Week');

  // Calculate NPS score
  const npsScore = calculateNPSScore(sortedData);

  // Process engagement trends
  const engagementTrends = Object.entries(engagementByWeek)
    .map(([week, entries]) => ({
      week: week.replace(/\(.*?\)/, '').trim(),
      'High Engagement': entries.filter(e => e['Engagement Participation ']?.includes('3 -')).length,
      'Medium Engagement': entries.filter(e => e['Engagement Participation ']?.includes('2 -')).length,
      'Low Engagement': entries.filter(e => e['Engagement Participation ']?.includes('1 -')).length,
      total: entries.length
    }));

  // Process tech partner performance
  const techPartnerPerformance = _(sortedData)
    .groupBy('Which Tech Partner')
    .map((items, partner) => ({
      partner,
      issues: _.sumBy(items, item => 
        parseInt(item['How many issues, PRs, or projects this week?'] || '0')
      )
    }))
    .value();

  // Process tech partner metrics
  const techPartnerMetrics = _(sortedData)
    .groupBy('Which Tech Partner')
    .map((items, partner) => ({
      partner,
      totalIssues: _.sumBy(items, item => 
        parseInt(item['How many issues, PRs, or projects this week?'] || '0')
      ),
      activeContributors: new Set(items.map(item => item.Name)).size,
      avgIssuesPerContributor: 0,
      collaborationScore: 0
    }))
    .value();

  // Process feedback sentiment
  const feedbackSentiment = {
    positive: sortedData.filter(e => e['PLDG Feedback']?.toLowerCase().includes('great') || 
                                   e['PLDG Feedback']?.toLowerCase().includes('good')).length,
    neutral: sortedData.filter(e => e['PLDG Feedback'] && 
                                  !e['PLDG Feedback'].toLowerCase().includes('great') && 
                                  !e['PLDG Feedback'].toLowerCase().includes('good') &&
                                  !e['PLDG Feedback'].toLowerCase().includes('bad')).length,
    negative: sortedData.filter(e => e['PLDG Feedback']?.toLowerCase().includes('bad')).length
  };

  // Process technical progress
  const technicalProgress = Object.entries(engagementByWeek)
    .map(([week, entries]) => ({
      week: week.replace(/\(.*?\)/, '').trim(),
      'Total Issues': _.sumBy(entries, entry => 
        parseInt(entry['How many issues, PRs, or projects this week?'] || '0')
      )
    }));

  // Calculate top performers
  const topPerformers = _(sortedData)
    .groupBy('Name')
    .map((entries, name) => ({
      name,
      totalIssues: _.sumBy(entries, e => parseInt(e['How many issues, PRs, or projects this week?'] || '0')),
      avgEngagement: _.meanBy(entries, e => {
        const participation = e['Engagement Participation ']?.trim() || '';
        return participation.startsWith('3') ? 3 :
               participation.startsWith('2') ? 2 :
               participation.startsWith('1') ? 1 : 0;
      })
    }))
    .filter(p => p.totalIssues > 0)
    .orderBy(['totalIssues', 'avgEngagement'], ['desc', 'desc'])
    .value();

  // Process issue metrics
  const issueMetrics = processRawIssueMetrics(sortedData);

  // Calculate program health metrics
  const techPartnerSet = new Set(
    sortedData.flatMap(entry => 
      Array.isArray(entry['Which Tech Partner']) 
        ? entry['Which Tech Partner']
        : entry['Which Tech Partner']?.split(',').map(p => p.trim()) ?? []
    )
  );
  
  const programHealth = {
    npsScore,
    engagementRate: calculateEngagementRate(sortedData),
    activeTechPartners: Array.from(techPartnerSet).length
  };

  // Calculate key metrics before using them
  const contributorsSet = new Set(sortedData.map(e => e.Name));
  const activeContributors = Array.from(contributorsSet).length;
  
  const activeTechPartnersSet = new Set(
    sortedData.flatMap(entry => 
      Array.isArray(entry['Which Tech Partner']) 
        ? entry['Which Tech Partner']
        : entry['Which Tech Partner']?.split(',').map(p => p.trim()) ?? []
    )
  );
  const activeTechPartners = Array.from(activeTechPartnersSet).length;

  const totalContributions = sortedData.reduce((sum, entry) => 
    sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
  );

  const positiveFeedback = sortedData.filter(entry => 
    entry['PLDG Feedback']?.toLowerCase().includes('great') || 
    entry['PLDG Feedback']?.toLowerCase().includes('good')
  ).length;

  // Calculate weekly change
  const currentWeekData = sortedData.filter(entry => 
    entry['Program Week'] === sortedData[sortedData.length - 1]['Program Week']
  );
  const previousWeekData = sortedData.filter(entry => 
    entry['Program Week'] === sortedData[sortedData.length - 2]?.['Program Week']
  );

  const currentWeekContributions = currentWeekData.reduce((sum, entry) => 
    sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
  );
  const previousWeekContributions = previousWeekData.reduce((sum, entry) => 
    sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
  );

  const weeklyChange = previousWeekContributions 
    ? Math.round(((currentWeekContributions - previousWeekContributions) / previousWeekContributions) * 100)
    : 0;

  // Update baseProcessedData with calculated metrics
  const baseProcessedData: ProcessedData = {
    weeklyChange,
    activeContributors,
    totalContributions,
    keyHighlights: {
      activeContributorsAcrossTechPartners: `${activeContributors} across ${activeTechPartners}`,
      totalContributions: `${totalContributions} total`,
      positiveFeedback: `${positiveFeedback} positive`,
      weeklyContributions: `${weeklyChange}% change`
    },
    actionItems: [], // This will be populated later
    engagementTrends,
    techPartnerPerformance,
    techPartnerMetrics,
    topPerformers,
    technicalProgress,
    issueMetrics,
    feedbackSentiment,
    contributorGrowth: [],
    programHealth
  };
  
  try {
    const enhancedData = await processDataWithAI(baseProcessedData);
    return {
      ...baseProcessedData,
      insights: {
        keyTrends: enhancedData.insights?.keyTrends || [],
        areasOfConcern: enhancedData.insights?.areasOfConcern || [],
        recommendations: enhancedData.insights?.recommendations || [],
        achievements: enhancedData.insights?.achievements || [],
        metrics: {
          engagementScore: enhancedData.insights?.metrics.engagementScore || 0,
          technicalProgress: enhancedData.insights?.metrics.technicalProgress || 0,
          collaborationIndex: enhancedData.insights?.metrics.collaborationIndex || 0,
        }
      }
    };
  } catch (error) {
    console.error('AI processing error:', error);
    // Return with default insights
    return {
      ...baseProcessedData,
      insights: {
        keyTrends: [],
        areasOfConcern: [],
        recommendations: [],
        achievements: [],
        metrics: {
          engagementScore: 0,
          technicalProgress: 0,
          collaborationIndex: 0
        }
      }
    };
  }
} 

export function calculateTechnicalProgress(data: ProcessedData): number {
  if (!data.issueMetrics.length) return 0;
  
  const latestMetrics = data.issueMetrics[data.issueMetrics.length - 1];
  return latestMetrics.total > 0 
    ? Math.round((latestMetrics.closed / latestMetrics.total) * 100) 
    : 0;
}

// Convert raw metrics to IssueMetrics format
function processIssueMetrics(rawMetrics: RawIssueMetric[]): IssueMetrics[] {
  const currentDate = new Date();
  const weekStr = currentDate.toISOString().split('T')[0];
  
  return rawMetrics.map(metric => ({
    week: weekStr,
    open: Math.round(metric.count * (1 - metric.percentComplete / 100)),
    closed: Math.round(metric.count * (metric.percentComplete / 100)),
    total: metric.count
  }));
}

// Update the processData function to use the correct issue metrics processing
export function processData(rawData: any): ProcessedData {
  const processedIssueMetrics = processIssueMetrics(rawData.issueMetrics || []);
  
  return {
    weeklyChange: rawData.weeklyChange || 0,
    activeContributors: rawData.activeContributors || 0,
    totalContributions: rawData.totalContributions || 0,
    keyHighlights: rawData.keyHighlights || {
      activeContributorsAcrossTechPartners: '0 across 0',
      totalContributions: '0 total',
      positiveFeedback: '0 positive',
      weeklyContributions: '0% change'
    },
    actionItems: rawData.actionItems || [],
    engagementTrends: rawData.engagementTrends || [],
    techPartnerPerformance: rawData.techPartnerPerformance || [],
    techPartnerMetrics: rawData.techPartnerMetrics || [],
    topPerformers: rawData.topPerformers || [],
    technicalProgress: rawData.technicalProgress || [],
    issueMetrics: processedIssueMetrics,
    feedbackSentiment: rawData.feedbackSentiment || { positive: 0, neutral: 0, negative: 0 },
    contributorGrowth: rawData.contributorGrowth || [],
    programHealth: {
      npsScore: rawData.programHealth?.npsScore || 0,
      engagementRate: rawData.programHealth?.engagementRate || 0,
      activeTechPartners: rawData.programHealth?.activeTechPartners || 0
    }
  };
}

// Helper function to combine and prioritize insights
export function combineAndPrioritize(insights1: string[] = [], insights2: string[] = []): string[] {
  const uniqueInsights = new Set([...insights1, ...insights2]);
  const combined = Array.from(uniqueInsights);
  return combined.slice(0, 5); // Return top 5 insights
}

// Calculate engagement score based on engagement trends and NPS
export function calculateEngagementScore(data: ProcessedData): number {
  const recentEngagement = data.engagementTrends[data.engagementTrends.length - 1];
  const engagementRate = (recentEngagement['High Engagement'] / recentEngagement.total) * 100;
  return Math.round((engagementRate + data.programHealth.npsScore) / 2);
}

// Calculate collaboration index based on tech partner interactions
export function calculateCollaborationIndex(data: ProcessedData): number {
  const partnersSet = new Set(data.techPartnerMetrics.map(m => m.partner));
  const activePartners = Array.from(partnersSet).length;
  const totalContributors = data.topPerformers.length;
  return Math.round((activePartners / totalContributors) * 100);
}

// Helper function to fetch and process insights
export async function generateEnhancedInsights(data: ProcessedData): Promise<EnhancedProcessedData> {
  try {
    const metricsResponse = await fetch('/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engagementMetrics: {
          trends: data.engagementTrends,
          npsScore: data.programHealth.npsScore,
          feedbackSentiment: data.feedbackSentiment
        },
        techPartnerMetrics: data.techPartnerPerformance,
        contributorMetrics: {
          topPerformers: data.topPerformers,
          growth: data.contributorGrowth
        },
        githubMetrics: data.issueMetrics
      })
    });

    const [metricsResult, programResult] = await Promise.all([
      metricsResponse.json(),
      fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json())
    ]);

    const enhancedData: EnhancedProcessedData = {
      ...data,
      insights: {
        keyTrends: metricsResult.insights?.keyTrends || [],
        areasOfConcern: combineAndPrioritize(
          metricsResult.insights?.areasOfConcern || [],
          programResult.insights?.riskFactors || []
        ),
        recommendations: combineAndPrioritize(
          metricsResult.insights?.recommendations || [],
          programResult.insights?.strategicRecommendations || []
        ),
        achievements: combineAndPrioritize(
          metricsResult.insights?.achievements || [],
          programResult.insights?.successStories || []
        ),
        metrics: {
          engagementScore: calculateEngagementScore(data),
          technicalProgress: calculateTechnicalProgress(data),
          collaborationIndex: calculateCollaborationIndex(data)
        }
      }
    };

    return enhancedData;
  } catch (error) {
    console.error('Error generating enhanced insights:', error);
    // Return with default insights structure
    return {
      ...data,
      insights: {
        keyTrends: [],
        areasOfConcern: [],
        recommendations: [],
        achievements: [],
        metrics: {
          engagementScore: 0,
          technicalProgress: 0,
          collaborationIndex: 0
        }
      }
    };
  }
}

// Type guard for insights
export function isValidInsights(insights: any): insights is {
  keyTrends: string[];
  areasOfConcern: string[];
  recommendations: string[];
  achievements: string[];
} {
  return (
    Array.isArray(insights?.keyTrends) &&
    Array.isArray(insights?.areasOfConcern) &&
    Array.isArray(insights?.recommendations) &&
    Array.isArray(insights?.achievements)
  );
}

// Fix the issue metrics processing
function processRawIssueMetrics(entries: EngagementData[]): IssueMetrics[] {
  const currentDate = new Date();
  const weekStr = currentDate.toISOString().split('T')[0];
  
  const metrics = _(entries)
    .flatMap(entry => {
      if (!entry['Issue Title 1']) return [];
      return [{
        week: weekStr,
        open: entry['Issue Link 1']?.includes('closed') ? 0 : 1,
        closed: entry['Issue Link 1']?.includes('closed') ? 1 : 0,
        total: 1
      }];
    })
    .groupBy('week')
    .map((items, week) => ({
      week,
      open: _.sumBy(items, 'open'),
      closed: _.sumBy(items, 'closed'),
      total: items.length
    }))
    .value();

  return metrics;
}

export function formatMetricName(key: string): string {
  return key
    .split(/(?=[A-Z])/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Add helper functions for program health calculations
function calculateEngagementRate(data: EngagementData[]): number {
  const totalEntries = data.length;
  if (totalEntries === 0) return 0;

  const activeEntries = data.filter(entry => 
    entry['Engagement Participation ']?.includes('3 -') || 
    entry['Engagement Participation ']?.includes('2 -')
  ).length;

  return Math.round((activeEntries / totalEntries) * 100);
}

function calculateNPSScore(data: EngagementData[]): number {
  const scores = data
    .map(entry => parseInt(entry['How likely are you to recommend the PLDG to others?'] || '0'))
    .filter(score => score > 0);

  if (scores.length === 0) return 0;

  const promoters = scores.filter(score => score >= 9).length;
  const detractors = scores.filter(score => score <= 6).length;
  
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

// Add the helper function here too
function parseTechPartners(techPartner: string | string[]): string[] {
  if (Array.isArray(techPartner)) {
    return techPartner;
  }
  return techPartner?.split(',').map(p => p.trim()) ?? [];
}