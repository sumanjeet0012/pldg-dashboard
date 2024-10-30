import { useMemo, useCallback } from 'react';
import { useAirtableData } from './airtable';
import { useGitHubData } from './github';
import { ProcessedData, EngagementData, ActionItem } from '@/types/dashboard';
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

export function useProcessedData() {
  const { 
    data: airtableData, 
    isLoading: isAirtableLoading, 
    isError: isAirtableError,
    mutate: refreshAirtable 
  } = useAirtableData();

  console.log('Airtable Data in useProcessedData:', {
    hasData: !!airtableData,
    dataLength: airtableData?.length,
    isLoading: isAirtableLoading,
    isError: isAirtableError
  });

  const { 
    data: githubData, 
    isLoading: isGithubLoading, 
    isError: isGithubError,
    mutate: refreshGithub 
  } = useGitHubData();

  console.log('GitHub Data in useProcessedData:', {
    hasData: !!githubData,
    issuesLength: githubData?.issues?.length,
    isLoading: isGithubLoading,
    isError: isGithubError
  });

  const refresh = useCallback(async () => {
    await Promise.all([refreshAirtable(), refreshGithub()]);
  }, [refreshAirtable, refreshGithub]);

  // Add debug logging
  console.log('Raw Data:', {
    airtable: airtableData,
    github: githubData
  });

  const processedData = useMemo(() => {
    if (!airtableData || !githubData) {
      console.log('Missing data:', { hasAirtable: !!airtableData, hasGithub: !!githubData });
      return null;
    }

    // Add null check for githubData.issues
    const issues = githubData?.issues || [];

    // 1. Weekly Performance
    const totalContributions = airtableData.reduce((sum, entry) => {
      const issueCount = entry['How many issues, PRs, or projects this week?'];
      return sum + (parseInt(issueCount as string) || 0);
    }, 0);

    const activeContributors = new Set(airtableData.map(entry => entry.Name)).size;

    // Calculate week-over-week change
    const currentWeekEntries = airtableData.filter(entry => 
      entry['Program Week']?.includes('Week 4')
    );
    const previousWeekEntries = airtableData.filter(entry => 
      entry['Program Week']?.includes('Week 3')
    );

    const currentWeekContributions = currentWeekEntries.reduce((sum, entry) => 
      sum + (parseInt(entry['How many issues, PRs, or projects this week?'] || '0')), 0
    );
    const previousWeekContributions = previousWeekEntries.reduce((sum, entry) => 
      sum + (parseInt(entry['How many issues, PRs, or projects this week?'] || '0')), 0
    );

    const weeklyChange = previousWeekContributions ? 
      ((currentWeekContributions - previousWeekContributions) / previousWeekContributions) * 100 : 0;

    // 2. Program Health
    const npsScore = calculateNPSScore(airtableData);
    const engagementRate = calculateEngagementRate(airtableData);
    const activeTechPartnersCount = new Set(
      airtableData.flatMap(entry => parseTechPartners(entry['Which Tech Partner']))
    ).size;

    // 3. Key Highlights
    const positiveFeedback = airtableData.filter(entry => 
      entry['PLDG Feedback']?.toLowerCase().includes('great') || 
      entry['PLDG Feedback']?.toLowerCase().includes('good')
    ).length;

    // 4. Top Performers
    const topPerformers = Object.values(
      airtableData.reduce((acc, entry) => {
        const name = entry.Name;
        if (!acc[name]) {
          acc[name] = {
            name,
            totalIssues: 0,
            avgEngagement: 0,
            engagementCount: 0
          };
        }
        acc[name].totalIssues += parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
        const engagementLevel = entry['Engagement Participation ']?.includes('3 -') ? 3 :
                              entry['Engagement Participation ']?.includes('2 -') ? 2 : 1;
        acc[name].avgEngagement += engagementLevel;
        acc[name].engagementCount += 1;
        return acc;
      }, {} as Record<string, any>)
    ).map(performer => ({
      name: performer.name,
      totalIssues: performer.totalIssues,
      avgEngagement: performer.avgEngagement / performer.engagementCount
    })).sort((a, b) => b.totalIssues - a.totalIssues || b.avgEngagement - a.avgEngagement);

    // Add action items
    const actionItems = calculateActionItems(airtableData);

    // Add missing required properties
    const baseProcessedData = {
      weeklyChange,
      activeContributors,
      totalContributions,
      programHealth: {
        npsScore,
        engagementRate,
        activeTechPartners: activeTechPartnersCount
      },
      keyHighlights: {
        activeContributorsAcrossTechPartners: `${activeContributors} active contributors across ${activeTechPartnersCount} tech partners`,
        totalContributions: `${totalContributions} total contributions`,
        positiveFeedback: `${positiveFeedback} positive feedback responses`,
        weeklyContributions: `${Math.abs(Math.round(weeklyChange))}% ${weeklyChange > 0 ? 'increase' : 'decrease'} in weekly contributions`
      },
      topPerformers,
      actionItems,
      // Add these required properties
      engagementTrends: Object.entries(_.groupBy(airtableData, 'Program Week')).map(([week, entries]) => ({
        week,
        'High Engagement': entries.filter(e => e['Engagement Participation ']?.includes('3 -')).length,
        'Medium Engagement': entries.filter(e => e['Engagement Participation ']?.includes('2 -')).length,
        'Low Engagement': entries.filter(e => e['Engagement Participation ']?.includes('1 -')).length,
        total: entries.length
      })),
      technicalProgress: Object.entries(_.groupBy(airtableData, 'Program Week')).map(([week, entries]) => ({
        week,
        'Total Issues': entries.reduce((sum, entry) => 
          sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
        )
      })),
      issueMetrics: [{
        week: new Date().toISOString().split('T')[0],
        open: issues.filter(i => i.state === 'open').length || 0,
        closed: issues.filter(i => i.state === 'closed').length || 0,
        total: issues.length || 0
      }],
      feedbackSentiment: {
        positive: airtableData.filter(e => e['PLDG Feedback']?.toLowerCase().includes('great') || 
                                         e['PLDG Feedback']?.toLowerCase().includes('good')).length,
        neutral: airtableData.filter(e => e['PLDG Feedback'] && 
                                        !e['PLDG Feedback'].toLowerCase().includes('great') && 
                                        !e['PLDG Feedback'].toLowerCase().includes('good') &&
                                        !e['PLDG Feedback'].toLowerCase().includes('bad')).length,
        negative: airtableData.filter(e => e['PLDG Feedback']?.toLowerCase().includes('bad')).length
      },
      techPartnerMetrics: Array.from(new Set(airtableData.flatMap(e => 
        parseTechPartners(e['Which Tech Partner'])))).map(partner => ({
          partner,
          totalIssues: airtableData.filter(e => e['Which Tech Partner']?.includes(partner))
            .reduce((sum, e) => sum + parseInt(e['How many issues, PRs, or projects this week?'] || '0'), 0),
          activeContributors: new Set(airtableData.filter(e => e['Which Tech Partner']?.includes(partner))
            .map(e => e.Name)).size,
          avgIssuesPerContributor: 0, // Calculate this if needed
          collaborationScore: 0 // Calculate this if needed
      })),
      techPartnerPerformance: Array.from(new Set(airtableData.flatMap(e => 
        parseTechPartners(e['Which Tech Partner'])))).map(partner => ({
          partner,
          issues: airtableData.filter(e => e['Which Tech Partner']?.includes(partner))
            .reduce((sum, e) => sum + parseInt(e['How many issues, PRs, or projects this week?'] || '0'), 0)
      })),
      contributorGrowth: Object.entries(_.groupBy(airtableData, 'Program Week')).map(([week, entries]) => ({
        week,
        newContributors: new Set(entries.map(e => e.Name)).size,
        returningContributors: 0, // Calculate this if needed
        totalActive: entries.length
      }))
    };

    // Enhance the data with AI insights
    return enhanceProcessedData(baseProcessedData);
  }, [airtableData, githubData]);

  return {
    data: processedData,
    isLoading: isAirtableLoading || isGithubLoading,
    isError: isAirtableError || isGithubError,
    refresh
  };
}
