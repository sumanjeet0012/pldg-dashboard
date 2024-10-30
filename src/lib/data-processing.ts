import { useMemo, useCallback } from 'react';
import { useAirtableData } from './airtable';
import { useGitHubData } from './github';
import { ProcessedData, EngagementData, ActionItem, IssueMetrics } from '@/types/dashboard';
import _ from 'lodash';
import { enhanceProcessedData } from './ai';

// Add these helper functions at the top
function calculateNPSScore(data: EngagementData[]): number {
  const scores = data
    .map(entry => parseInt(entry['How likely are you to recommend the PLDG to others?'] || '0'))
    .filter(score => score > 0);

  if (scores.length === 0) return 0;

  const promoters = scores.filter(score => score >= 9).length;
  const detractors = scores.filter(score => score <= 6).length;
  
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

function calculateEngagementRate(data: EngagementData[]): number {
  const totalEntries = data.length;
  if (totalEntries === 0) return 0;

  const activeEntries = data.filter(entry => 
    entry['Engagement Participation ']?.includes('3 -') || 
    entry['Engagement Participation ']?.includes('2 -')
  ).length;

  return Math.round((activeEntries / totalEntries) * 100);
}

// Add function to calculate action items
function calculateActionItems(data: EngagementData[]): ActionItem[] {
  const actionItems: ActionItem[] = [];

  // Check for engagement drops
  const weeklyEngagement = Object.entries(
    _.groupBy(data, 'Program Week')
  ).map(([week, entries]) => ({
    week,
    highEngagement: entries.filter(e => e['Engagement Participation ']?.includes('3 -')).length
  })).sort((a, b) => a.week.localeCompare(b.week));

  if (weeklyEngagement.length >= 2) {
    const lastTwo = weeklyEngagement.slice(-2);
    if (lastTwo[1].highEngagement < lastTwo[0].highEngagement) {
      actionItems.push({
        type: 'warning' as const,
        title: 'Engagement Drop Detected',
        description: 'High engagement decreased from last week',
        action: 'Review recent program changes and gather feedback'
      });
    }
  }

  // Check for inactive tech partners
  const techPartners = new Set(
    data.flatMap(entry => parseTechPartners(entry['Which Tech Partner']))
  );

  const activeTechPartners = new Set(
    data.filter(e => e['Tech Partner Collaboration?'] === 'Yes')
      .flatMap(entry => parseTechPartners(entry['Which Tech Partner']))
  );

  const inactivePartners = [...techPartners].filter(p => !activeTechPartners.has(p));
  if (inactivePartners.length > 0) {
    actionItems.push({
      type: 'opportunity' as const,
      title: 'Partner Engagement Opportunity',
      description: `${inactivePartners.length} tech partners need attention`,
      action: 'Schedule check-ins with inactive partners'
    });
  }

  // Check for new contributors
  const newContributors = data.filter(entry => 
    entry['Program Week']?.includes('Week 4') || entry['Program Week']?.includes('Week 5')
  ).length;

  if (newContributors > 2) {
    actionItems.push({
      type: 'success' as const,
      title: 'New Contributor Influx',
      description: `${newContributors} new contributors this week`,
      action: 'Schedule onboarding sessions and assign mentors'
    });
  }

  return actionItems;
}

// Helper function to handle tech partner string parsing
function parseTechPartners(techPartner: string | string[]): string[] {
  if (Array.isArray(techPartner)) {
    return techPartner;
  }
  return techPartner?.split(',').map(p => p.trim()) ?? [];
}

// Add missing helper functions
function calculateActiveTechPartners(data: EngagementData[]): number {
  return new Set(
    data.filter(e => e['Tech Partner Collaboration?'] === 'Yes')
      .flatMap(entry => parseTechPartners(entry['Which Tech Partner']))
  ).size;
}

function calculatePositiveFeedback(data: EngagementData[]): number {
  return data.filter(entry => 
    entry['PLDG Feedback']?.toLowerCase().includes('great') || 
    entry['PLDG Feedback']?.toLowerCase().includes('good')
  ).length;
}

// Add this function near the top with other helper functions
function processRawIssueMetrics(entries: EngagementData[]): IssueMetrics[] {
  const currentDate = new Date();
  const weekStr = currentDate.toISOString().split('T')[0];
  
  // Group entries by week
  const weeklyMetrics = _.groupBy(entries, 'Program Week');
  
  return Object.entries(weeklyMetrics).map(([week, weekEntries]) => {
    const totalIssues = weekEntries.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
    );
    
    // Estimate open/closed based on GitHub status if available
    const hasGitHubLink = weekEntries.some(entry => entry['Issue Link 1']);
    const closedIssues = hasGitHubLink 
      ? weekEntries.filter(entry => entry['Issue Link 1']?.includes('closed')).length
      : Math.round(totalIssues * 0.7); // Default assumption: 70% completion rate
    
    return {
      week: week.replace(/\(.*?\)/, '').trim(),
      open: totalIssues - closedIssues,
      closed: closedIssues,
      total: totalIssues
    };
  });
}

// Export the processData function
export function processData(rawData: EngagementData[]): ProcessedData {
  // Group by week and ensure proper week sorting
  const weeks = _.groupBy(rawData, 'Program Week');
  const weekNumbers = Object.keys(weeks).sort((a, b) => {
    const weekA = parseInt(a.match(/Week (\d+)/)?.[1] || '0');
    const weekB = parseInt(b.match(/Week (\d+)/)?.[1] || '0');
    return weekA - weekB;
  });

  // Calculate all metrics
  const processedData: ProcessedData = {
    weeklyChange: calculateWeeklyChange(rawData),
    activeContributors: new Set(rawData.map(e => e.Name)).size,
    totalContributions: rawData.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
    ),
    programHealth: {
      npsScore: calculateNPSScore(rawData),
      engagementRate: calculateEngagementRate(rawData),
      activeTechPartners: calculateActiveTechPartners(rawData)
    },
    keyHighlights: {
      activeContributorsAcrossTechPartners: `${new Set(rawData.map(e => e.Name)).size} across ${calculateActiveTechPartners(rawData)}`,
      totalContributions: `${rawData.reduce((sum, entry) => sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0)} total`,
      positiveFeedback: `${calculatePositiveFeedback(rawData)} positive`,
      weeklyContributions: `${calculateWeeklyChange(rawData)}% change`
    },
    technicalProgress: Object.entries(weeks).map(([week, entries]) => ({
      week,
      'Total Issues': entries.reduce((sum, entry) => 
        sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
      ),
      'In Progress': 0,
      'Done': 0
    })),
    engagementTrends: Object.entries(weeks).map(([week, entries]) => ({
      week,
      'High Engagement': entries.filter(e => e['Engagement Participation ']?.includes('3 -')).length,
      'Medium Engagement': entries.filter(e => e['Engagement Participation ']?.includes('2 -')).length,
      'Low Engagement': entries.filter(e => e['Engagement Participation ']?.includes('1 -')).length,
      total: entries.length
    })),
    techPartnerPerformance: calculateTechPartnerPerformance(rawData),
    techPartnerMetrics: calculateTechPartnerMetrics(rawData),
    topPerformers: calculateTopPerformers(rawData),
    issueMetrics: processRawIssueMetrics(rawData),
    feedbackSentiment: {
      positive: calculatePositiveFeedback(rawData),
      neutral: 0,
      negative: 0
    },
    contributorGrowth: [],
    actionItems: calculateActionItems(rawData)
  };

  return processedData;
}

// Add helper function for tech partner performance
function calculateTechPartnerPerformance(data: EngagementData[]) {
  return _(data)
    .groupBy('Which Tech Partner')
    .map((items, partner) => ({
      partner,
      issues: _.sumBy(items, item => 
        parseInt(item['How many issues, PRs, or projects this week?'] || '0')
      )
    }))
    .value();
}

// Add helper function for tech partner metrics
function calculateTechPartnerMetrics(data: EngagementData[]) {
  return _(data)
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
}

export function useProcessedData() {
  const { 
    data: airtableData, 
    isLoading: isAirtableLoading, 
    isError: isAirtableError,
    mutate: refreshAirtable 
  } = useAirtableData();

  const { 
    data: githubData, 
    isLoading: isGithubLoading, 
    isError: isGithubError,
    mutate: refreshGithub 
  } = useGitHubData();

  // Add debug logging
  console.log('Data Processing State:', {
    airtable: {
      hasData: !!airtableData,
      length: airtableData?.length,
      isLoading: isAirtableLoading,
      isError: isAirtableError
    },
    github: {
      hasData: !!githubData,
      issuesCount: githubData?.issues?.length,
      isLoading: isGithubLoading,
      isError: isGithubError
    }
  });

  const processedData = useMemo(() => {
    if (!airtableData?.length || isAirtableLoading || isGithubLoading) {
      console.log('Skipping data processing - data not ready');
      return null;
    }

    console.log('Processing data with:', {
      airtableRecords: airtableData.length,
      githubStatus: githubData?.statusGroups
    });

    // Calculate all required metrics
    const technicalProgress = Object.entries(_.groupBy(airtableData, 'Program Week')).map(([week, entries]) => ({
      week,
      'Total Issues': entries.reduce((sum, entry) => 
        sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
      ),
      'In Progress': githubData?.statusGroups?.inProgress || 0,
      'Done': githubData?.statusGroups?.done || 0
    }));

    const activeContributors = new Set(airtableData.map(e => e.Name)).size;
    const totalContributions = airtableData.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
    );

    // Calculate engagement trends
    const engagementTrends = Object.entries(_.groupBy(airtableData, 'Program Week'))
      .map(([week, entries]) => ({
        week,
        'High Engagement': entries.filter(e => e['Engagement Participation ']?.includes('3 -')).length,
        'Medium Engagement': entries.filter(e => e['Engagement Participation ']?.includes('2 -')).length,
        'Low Engagement': entries.filter(e => e['Engagement Participation ']?.includes('1 -')).length,
        total: entries.length
      }));

    // Calculate issue metrics
    const issueMetrics = processRawIssueMetrics(airtableData);

    // Calculate tech partner metrics
    const techPartnerMetrics = _(airtableData)
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

    const activeTechPartnersCount = calculateActiveTechPartners(airtableData);

    return {
      weeklyChange: calculateWeeklyChange(airtableData),
      activeContributors,
      totalContributions,
      programHealth: {
        npsScore: calculateNPSScore(airtableData),
        engagementRate: calculateEngagementRate(airtableData),
        activeTechPartners: activeTechPartnersCount
      },
      keyHighlights: {
        activeContributorsAcrossTechPartners: `${activeContributors} across ${activeTechPartnersCount}`,
        totalContributions: `${totalContributions} total`,
        positiveFeedback: `${calculatePositiveFeedback(airtableData)} positive`,
        weeklyContributions: `${calculateWeeklyChange(airtableData)}% change`
      },
      technicalProgress,
      engagementTrends,
      issueMetrics,
      techPartnerMetrics,
      techPartnerPerformance: techPartnerMetrics.map(m => ({
        partner: m.partner,
        issues: m.totalIssues
      })),
      topPerformers: calculateTopPerformers(airtableData),
      actionItems: calculateActionItems(airtableData),
      feedbackSentiment: {
        positive: calculatePositiveFeedback(airtableData),
        neutral: 0,
        negative: 0
      },
      contributorGrowth: []
    } as ProcessedData;
  }, [airtableData, githubData, isAirtableLoading, isGithubLoading]);

  return {
    data: processedData,
    isLoading: isAirtableLoading || isGithubLoading,
    isError: isAirtableError || isGithubError,
    refresh: useCallback(async () => {
      console.log('Refreshing data...');
      await Promise.all([refreshAirtable(), refreshGithub()]);
    }, [refreshAirtable, refreshGithub])
  };
}

// Helper functions
function calculateWeeklyChange(data: EngagementData[]): number {
  // Group by week and ensure proper week sorting
  const weeks = _.groupBy(data, 'Program Week');
  const weekNumbers = Object.keys(weeks).sort((a, b) => {
    // Extract week numbers for proper sorting
    const weekA = parseInt(a.match(/Week (\d+)/)?.[1] || '0');
    const weekB = parseInt(b.match(/Week (\d+)/)?.[1] || '0');
    return weekA - weekB;
  });

  if (weekNumbers.length < 2) return 0;

  // Get the last two weeks
  const currentWeek = weeks[weekNumbers[weekNumbers.length - 1]];
  const previousWeek = weeks[weekNumbers[weekNumbers.length - 2]];

  // Calculate totals with better error handling
  const currentTotal = currentWeek.reduce((sum, entry) => {
    const value = parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const previousTotal = previousWeek.reduce((sum, entry) => {
    const value = parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  // Add debug logging
  console.log('Weekly Change Calculation:', {
    currentWeek: weekNumbers[weekNumbers.length - 1],
    previousWeek: weekNumbers[weekNumbers.length - 2],
    currentTotal,
    previousTotal
  });

  // Calculate percentage change
  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
  
  const change = ((currentTotal - previousTotal) / previousTotal) * 100;
  return Math.round(change);
}

// Add helper function for top performers
function calculateTopPerformers(data: EngagementData[]) {
  return _(data)
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
    .orderBy(['totalIssues', 'avgEngagement'], ['desc', 'desc'])
    .value();
}
