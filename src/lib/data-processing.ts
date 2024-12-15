import { 
  ProcessedData, 
  EngagementData, 
  GitHubData, 
  ActionItem, 
  IssueMetrics 
} from '@/types/dashboard';
import _ from 'lodash';

// Helper function to parse tech partners consistently
function parseTechPartners(techPartner: string | string[]): string[] {
  if (Array.isArray(techPartner)) {
    return techPartner;
  }
  return techPartner?.split(',').map(p => p.trim()) ?? [];
}

// Helper function to parse week numbers consistently
function parseWeekNumber(weekString: string): number {
  const match = weekString.match(/Week #?(\d+)/i);
  return match ? parseInt(match[1]) : 0;
}

// Helper function to format week string consistently
function formatWeekString(weekString: string): string {
  return weekString.replace(/\(.*?\)/, '').trim();
}

// Calculate NPS Score
function calculateNPSScore(data: EngagementData[]): number {
  const scores = data
    .map(entry => parseInt(entry['How likely are you to recommend the PLDG to others?'] || '0'))
    .filter(score => score > 0);

  if (scores.length === 0) return 0;

  const promoters = scores.filter(score => score >= 9).length;
  const detractors = scores.filter(score => score <= 6).length;
  
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

// Calculate Engagement Rate
function calculateEngagementRate(data: EngagementData[]): number {
  const totalEntries = data.length;
  if (totalEntries === 0) return 0;

  const activeEntries = data.filter(entry => 
    entry['Engagement Participation ']?.includes('3 -') || 
    entry['Engagement Participation ']?.includes('2 -')
  ).length;

  return Math.round((activeEntries / totalEntries) * 100);
}

// Calculate Weekly Change
function calculateWeeklyChange(data: EngagementData[]): number {
  const weeks = _.groupBy(data, 'Program Week');
  const weekNumbers = Object.keys(weeks).sort((a, b) => {
    const weekA = parseWeekNumber(a);
    const weekB = parseWeekNumber(b);
    return weekA - weekB;
  });

  if (weekNumbers.length < 2) return 0;

  const currentWeek = weeks[weekNumbers[weekNumbers.length - 1]];
  const previousWeek = weeks[weekNumbers[weekNumbers.length - 2]];

  const currentTotal = currentWeek.reduce((sum, entry) => {
    const value = parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  const previousTotal = previousWeek.reduce((sum, entry) => {
    const value = parseInt(entry['How many issues, PRs, or projects this week?'] || '0');
    return sum + (isNaN(value) ? 0 : value);
  }, 0);

  if (previousTotal === 0) return currentTotal > 0 ? 100 : 0;
  
  return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
}

// Calculate Positive Feedback
function calculatePositiveFeedback(data: EngagementData[]): number {
  return data.filter(entry => 
    entry['PLDG Feedback']?.toLowerCase().includes('great') || 
    entry['PLDG Feedback']?.toLowerCase().includes('good')
  ).length;
}

// Calculate Top Performers
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

// Calculate Tech Partner Metrics
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

// Calculate Tech Partner Performance
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

// Calculate Action Items
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
        type: 'warning',
        title: 'Engagement Drop Detected',
        description: 'High engagement decreased from last week',
        action: 'Review recent program changes and gather feedback'
      });
    }
  }

  // Process tech partners
  const techPartners = new Set(
    data.flatMap(entry => parseTechPartners(entry['Which Tech Partner']))
  );

  const activeTechPartners = new Set(
    data.filter(e => e['Tech Partner Collaboration?'] === 'Yes')
      .flatMap(entry => parseTechPartners(entry['Which Tech Partner']))
  );

  // Fix Set iteration by converting to Array first
  const inactivePartners = Array.from(techPartners)
    .filter(partner => !activeTechPartners.has(partner));

  if (inactivePartners.length > 0) {
    actionItems.push({
      type: 'opportunity',
      title: 'Partner Engagement Opportunity',
      description: `${inactivePartners.length} tech partners need attention`,
      action: 'Schedule check-ins with inactive partners'
    });
  }

  return actionItems;
}

// Process Raw Issue Metrics
function processRawIssueMetrics(entries: EngagementData[]): IssueMetrics[] {
  const weeklyMetrics = _.groupBy(entries, 'Program Week');
  
  return Object.entries(weeklyMetrics).map(([week, weekEntries]) => {
    const totalIssues = weekEntries.reduce((sum, entry) => 
      sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
    );
    
    const hasGitHubLink = weekEntries.some(entry => entry['Issue Link 1']);
    const closedIssues = hasGitHubLink 
      ? weekEntries.filter(entry => entry['Issue Link 1']?.includes('closed')).length
      : Math.round(totalIssues * 0.7);
    
    return {
      week: week.replace(/\(.*?\)/, '').trim(),
      open: totalIssues - closedIssues,
      closed: closedIssues,
      total: totalIssues
    };
  });
}

// Main Process Data Function
export function processData(
  airtableData: EngagementData[],
  githubData: GitHubData
): ProcessedData {
  console.log('Starting data processing:', {
    airtableRecords: airtableData?.length,
    sampleRecord: airtableData?.[0],
    githubStatus: githubData?.statusGroups
  });

  if (!Array.isArray(airtableData) || !airtableData.length) {
    console.error('Invalid or empty Airtable data:', airtableData);
    throw new Error('Invalid Airtable data format');
  }

  // Sort data by week number consistently
  const sortByWeek = (a: string, b: string) => {
    const weekA = parseWeekNumber(a);
    const weekB = parseWeekNumber(b);
    return weekA - weekB;
  };

  // Calculate active weeks
  const activeWeeks = Array.from(new Set(airtableData.map(entry => entry['Program Week'])))
    .filter(Boolean)
    .sort(sortByWeek);

  // Calculate tech partners
  const techPartners = new Set(
    airtableData.flatMap(entry => parseTechPartners(entry['Which Tech Partner']))
  );

  const activeContributorsCount = new Set(airtableData.map(e => e.Name)).size;
  const totalContributions = airtableData.reduce((sum, entry) =>
    sum + parseInt(entry['How many issues, PRs, or projects this week?']?.toString() || '0'), 0
  );

  const result: ProcessedData = {
    weeklyChange: calculateWeeklyChange(airtableData),
    activeContributors: activeContributorsCount,
    totalContributions,
    programHealth: {
      npsScore: calculateNPSScore(airtableData),
      engagementRate: calculateEngagementRate(airtableData),
      activeTechPartners: techPartners.size
    },
    keyHighlights: {
      activeContributorsAcrossTechPartners: `${activeContributorsCount} across ${techPartners.size}`,
      totalContributions: `${totalContributions} total`,
      positiveFeedback: `${calculatePositiveFeedback(airtableData)} positive`,
      weeklyContributions: `${calculateWeeklyChange(airtableData)}% change`
    },
    topPerformers: calculateTopPerformers(airtableData),
    techPartnerMetrics: calculateTechPartnerMetrics(airtableData),
    techPartnerPerformance: calculateTechPartnerPerformance(airtableData),
    engagementTrends: Object.entries(_.groupBy(airtableData, 'Program Week'))
      .sort((a, b) => sortByWeek(a[0], b[0]))
      .map(([week, entries]) => ({
        week: formatWeekString(week),
        'High Engagement': entries.filter(e => e['Engagement Participation ']?.includes('3 -')).length,
        'Medium Engagement': entries.filter(e => e['Engagement Participation ']?.includes('2 -')).length,
        'Low Engagement': entries.filter(e => e['Engagement Participation ']?.includes('1 -')).length,
        total: entries.length
      })),
    technicalProgress: Object.entries(_.groupBy(airtableData, 'Program Week'))
      .sort((a, b) => sortByWeek(a[0], b[0]))
      .map(([week, entries]) => ({
        week: formatWeekString(week),
        'Total Issues': entries.reduce((sum, entry) =>
          sum + parseInt(entry['How many issues, PRs, or projects this week?'] || '0'), 0
        ),
        'In Progress': githubData?.statusGroups?.inProgress || 0,
        'Done': githubData?.statusGroups?.done || 0
      })),
    issueMetrics: processRawIssueMetrics(airtableData),
    actionItems: calculateActionItems(airtableData),
    feedbackSentiment: {
      positive: calculatePositiveFeedback(airtableData),
      neutral: 0,
      negative: 0
    },
    contributorGrowth: [{
      week: new Date().toISOString().split('T')[0],
      newContributors: activeContributorsCount,
      returningContributors: 0,
      totalActive: activeContributorsCount
    }]
  };

  console.log('Processing complete:', {
    result: {
      contributors: result.activeContributors,
      techPartners: result.programHealth.activeTechPartners,
      trends: result.engagementTrends.length
    }
  });

  return result;
}
