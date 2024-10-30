import { useCallback, useMemo } from 'react';
import { useAirtableData } from './airtable';
import { useGitHubData } from './github';
import { validateRealTimeData } from './validation';
import { processData } from './data-processing';
import { EngagementData, GitHubData } from '@/types/dashboard';

export function useDashboardSystem() {
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

  const refresh = useCallback(async () => {
    await Promise.all([refreshAirtable(), refreshGithub()]);
  }, [refreshAirtable, refreshGithub]);

  const processedData = useMemo(async () => {
    if (!airtableData || !githubData) return null;
    return await processData(airtableData);
  }, [airtableData, githubData]);

  return {
    data: processedData,
    isLoading: isAirtableLoading || isGithubLoading,
    isError: isAirtableError || isGithubError,
    refresh
  };
}
