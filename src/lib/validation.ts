import { EngagementData, TechPartnerMetrics, ProcessedData, GitHubData } from '../types/dashboard';
import * as z from 'zod';

// GitHub data validation schema
export const githubDataSchema = z.object({
  project: z.object({
    user: z.object({
      projectV2: z.object({
        items: z.object({
          nodes: z.array(z.object({
            id: z.string(),
            content: z.object({
              title: z.string(),
              state: z.enum(['OPEN', 'CLOSED']),
              createdAt: z.string(),
              closedAt: z.string().nullable()
            }).nullable()
          }))
        })
      })
    })
  }),
  issues: z.array(z.object({
    title: z.string(),
    state: z.string(),
    created_at: z.string(),
    closed_at: z.string().nullable()
  }))
}) satisfies z.ZodType<GitHubData>;

// Engagement data validation schema
export const engagementDataSchema = z.object({
  'Program Week': z.string(),
  'Engagement Participation ': z.string(),
  'Tech Partner Collaboration?': z.string(),
  'Which Tech Partner': z.string(),
  'How many issues, PRs, or projects this week?': z.string(),
  'Name': z.string(),
  'PLDG Feedback': z.string().optional(),
  'How likely are you to recommend the PLDG to others?': z.string().optional()
});

// Add this function to help with type checking
export function isGitHubData(data: unknown): data is GitHubData {
  try {
    githubDataSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

// Update the validateGitHubData function to be more strongly typed
export function validateGitHubData(data: unknown): GitHubData | null {
  try {
    return githubDataSchema.parse(data);
  } catch (error) {
    console.error('GitHub data validation error:', error);
    return null;
  }
}

export function validateEngagementData(data: unknown) {
  try {
    return engagementDataSchema.array().parse(data);
  } catch (error) {
    console.error('Engagement data validation error:', error);
    return null;
  }
}

export function sanitizeNumber(value: string): number {
  const num = parseInt(value);
  return isNaN(num) ? 0 : num;
}

export function validateMetrics(metrics: TechPartnerMetrics[]) {
  return metrics.map(metric => ({
    ...metric,
    totalIssues: Math.max(0, metric.totalIssues),
    activeContributors: Math.max(0, metric.activeContributors),
    avgIssuesPerContributor: Math.max(0, metric.avgIssuesPerContributor),
    collaborationScore: Math.max(0, Math.min(100, metric.collaborationScore))
  }));
}

export function validateRealTimeData(data: unknown) {
  const timestamp = Date.now();
  const validated = validateGitHubData(data);
  
  if (!validated) {
    console.error(`Data validation failed at ${new Date(timestamp).toISOString()}`);
    return null;
  }

  return {
    ...validated,
    timestamp,
    isStale: false
  };
}

export function isValidGitHubData(data: any): data is GitHubData {
  return (
    data &&
    Array.isArray(data.issues) &&
    data.project?.user?.projectV2?.items?.nodes !== undefined
  );
}