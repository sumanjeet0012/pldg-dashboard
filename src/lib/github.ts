import useSWR from 'swr';
import { GitHubData } from '@/types/dashboard';

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
        console.log('Fetching GitHub data in SWR...');
        const response = await fetch('/api/github');
        
        console.log('GitHub API client response:', response.status);
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('GitHub data received:', {
          hasIssues: !!data.issues,
          issuesCount: data.issues?.length,
          sampleIssue: data.issues?.[0]?.title
        });

        // Ensure issues array exists
        return {
          project: {
            user: {
              projectV2: {
                items: { nodes: [] }
              }
            }
          },
          issues: data.issues || []
        };
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
        // Return default structure
        return {
          project: {
            user: {
              projectV2: {
                items: { nodes: [] }
              }
            }
          },
          issues: []
        };
      }
    },
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      onError: (error) => {
        console.error('SWR GitHub error:', error);
      }
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
  console.log('Processing GitHub data:', {
    hasData: !!data,
    issuesCount: data.issues?.length
  });

  return {
    issues: data.issues.map(issue => ({
      title: issue.title,
      state: issue.state,
      created_at: issue.created_at,
      closed_at: issue.closed_at
    })),
    project: data.project
  };
} 