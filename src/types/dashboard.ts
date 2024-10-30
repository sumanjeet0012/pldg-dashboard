import { DateRange } from 'react-day-picker';

export type ActionItemType = 'warning' | 'opportunity' | 'success';

export interface ActionItem {
  type: ActionItemType;
  title: string;
  description: string;
  action: string;
}

export interface EngagementData {
  Name: string;
  'Program Week': string;
  'Engagement Participation ': string;
  'Tech Partner Collaboration?': string;
  'Which Tech Partner': string | string[];
  'How many issues, PRs, or projects this week?': string;
  'How likely are you to recommend the PLDG to others?': string;
  'PLDG Feedback'?: string;
  'Issue Title 1'?: string;
  'Issue Link 1'?: string;
  'Which session(s) did you find most informative or impactful, and why?'?: string;
}

export interface IssueMetrics {
  week: string;
  open: number;
  closed: number;
  total: number;
}

export interface RawIssueMetric {
  category: string;
  count: number;
  percentComplete: number;
}

export interface FeedbackSentiment {
  positive: number;
  neutral: number;
  negative: number;
}

export interface TopPerformer {
  name: string;
  totalIssues: number;
  avgEngagement: number;
}

export interface TechPartnerMetrics {
  partner: string;
  totalIssues: number;
  activeContributors: number;
  avgIssuesPerContributor: number;
  collaborationScore: number;
}

export interface TechPartnerPerformance {
  partner: string;
  issues: number;
}

export interface EngagementTrend {
  week: string;
  'High Engagement': number;
  'Medium Engagement': number;
  'Low Engagement': number;
  total: number;
}

export interface TechnicalProgress {
  week: string;
  'Total Issues': number;
}

export interface ContributorGrowth {
  week: string;
  newContributors: number;
  returningContributors: number;
  totalActive: number;
}

export interface ProcessedData {
  weeklyChange: number;
  activeContributors: number;
  totalContributions: number;
  programHealth: {
    npsScore: number;
    engagementRate: number;
    activeTechPartners: number;
  };
  keyHighlights: {
    activeContributorsAcrossTechPartners: string;
    totalContributions: string;
    positiveFeedback: string;
    weeklyContributions: string;
  };
  topPerformers: TopPerformer[];
  actionItems: ActionItem[];
  engagementTrends: EngagementTrend[];
  technicalProgress: TechnicalProgress[];
  issueMetrics: IssueMetrics[];
  feedbackSentiment: FeedbackSentiment;
  techPartnerMetrics: TechPartnerMetrics[];
  techPartnerPerformance: TechPartnerPerformance[];
  contributorGrowth: ContributorGrowth[];
}

export interface AIMetrics {
  engagementScore: number;
  technicalProgress: number;
  collaborationIndex: number;
}

export interface AIInsights {
  keyTrends: string[];
  areasOfConcern: string[];
  recommendations: string[];
  achievements: string[];
  metrics: AIMetrics;
}

export interface EnhancedProcessedData extends ProcessedData {
  insights: AIInsights;
}

export interface GitHubData {
  project: {
    user: {
      projectV2: {
        items: {
          nodes: Array<{
            id: string;
            content: {
              title: string;
              state: string;
              createdAt: string;
              closedAt: string | null;
            } | null;
          }>;
        };
      };
    };
  };
  issues: Array<{
    title: string;
    state: string;
    created_at: string;
    closed_at: string | null;
    status?: string;
  }>;
  statusGroups?: {
    todo: number;
    inProgress: number;
    done: number;
  };
} 