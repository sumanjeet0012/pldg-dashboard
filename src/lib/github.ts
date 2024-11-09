import { GitHubData } from '@/types/dashboard';
import useSWR from 'swr';

const fetcher = async (): Promise<GitHubData> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const response = await fetch(`${baseUrl}/api/github`);
  if (!response.ok) {
    throw new Error('Failed to fetch GitHub data');
  }
  const rawData = await response.json();
  
  console.log('GitHub raw data:', {
    hasData: !!rawData,
    statusGroups: rawData?.statusGroups,
    timestamp: new Date().toISOString()
  });

  return {
    issues: rawData.issues || [],
    statusGroups: {
      inProgress: rawData.statusGroups?.inProgress || 0,
      done: rawData.statusGroups?.done || 0,
      todo: rawData.statusGroups?.todo || 0
    },
    project: {
      user: {
        projectV2: {
          items: {
            nodes: rawData.project?.user?.projectV2?.items?.nodes || []
          }
        }
      }
    },
    projectBoard: {
      issues: rawData.projectBoard?.issues || [],
      statusGroups: {
        todo: rawData.projectBoard?.statusGroups?.todo || 0,
        inProgress: rawData.projectBoard?.statusGroups?.inProgress || 0,
        done: rawData.projectBoard?.statusGroups?.done || 0
      },
      project: rawData.projectBoard?.project || {}
    },
    userContributions: rawData.userContributions || {},
    timestamp: Date.now()
  };
};

export function useGitHubData() {
  const { data, error, isValidating, mutate } = useSWR<GitHubData>(
    '/api/github',
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      }
    }
  );

  return {
    data,
    isLoading: !error && !data && isValidating,
    isError: !!error,
    mutate,
    timestamp: data?.timestamp
  };
}