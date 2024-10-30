import useSWR from 'swr';
import { GitHubData } from '@/types/dashboard';
import _ from 'lodash';

const REFRESH_INTERVAL = 60000; // 1 minute

async function fetchGitHubData(): Promise<GitHubData> {
  const response = await fetch('/api/github');
  if (!response.ok) {
    throw new Error('Failed to fetch GitHub data');
  }
  return response.json();
}

export function useGitHubData() {
  const { data, error, mutate } = useSWR<GitHubData>(
    '/api/github',
    async () => {
      try {
        const response = await fetch('/api/github');
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
          project: {
            user: {
              projectV2: {
                items: { nodes: [] }
              }
            }
          },
          issues: data.issues || [],
          statusGroups: data.statusGroups || {
            todo: 0,
            inProgress: 0,
            done: 0
          }
        } as GitHubData;
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
        return {
          project: {
            user: {
              projectV2: {
                items: { nodes: [] }
              }
            }
          },
          issues: [],
          statusGroups: {
            todo: 0,
            inProgress: 0,
            done: 0
          }
        };
      }
    },
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 10000
    }
  );

  const processedData = {
    data: data || { 
      project: { user: { projectV2: { items: { nodes: [] } } } }, 
      issues: [] 
    },
    isLoading: !error && !data,
    isError: error,
    mutate
  };

  console.log('GitHub hook state:', {
    hasData: !!data,
    isLoading: processedData.isLoading,
    isError: !!error,
    issuesCount: processedData.data.issues.length
  });

  return processedData;
}

export { fetchGitHubData };

export function processGitHubData(data: GitHubData) {
  const weeklyData = _.groupBy(data.issues, issue => {
    const date = new Date(issue.created_at);
    return `Week ${getWeekNumber(date)}`;
  });

  return Object.entries(weeklyData).map(([week, issues]) => ({
    week,
    newIssues: issues.length,
    inProgress: issues.filter(issue => issue.status === 'In Progress').length,
    completed: issues.filter(issue => issue.status === 'Done').length
  }));
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
} 