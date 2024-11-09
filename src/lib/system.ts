import { useCallback, useMemo } from 'react';
import { useAirtableData } from './airtable';
import { useGitHubData } from './github';
import { processData } from './data-processing';
import React from 'react';

export function useDashboardSystem() {
  const { 
    data: airtableData, 
    isLoading: isAirtableLoading,
    isError: isAirtableError,
    mutate: refreshAirtable,
    timestamp: airtableTimestamp 
  } = useAirtableData();

  const { 
    data: githubData, 
    isLoading: isGithubLoading,
    isError: isGithubError,
    mutate: refreshGithub,
    timestamp: githubTimestamp 
  } = useGitHubData();

  React.useEffect(() => {
    console.log('Data Sources State:', {
      airtable: {
        hasData: !!airtableData?.length,
        recordCount: airtableData?.length,
        isLoading: isAirtableLoading,
        timestamp: airtableTimestamp
      },
      github: {
        hasData: !!githubData,
        statusGroups: githubData?.statusGroups,
        isLoading: isGithubLoading,
        timestamp: githubTimestamp
      }
    });
  }, [airtableData, githubData, isAirtableLoading, isGithubLoading, airtableTimestamp, githubTimestamp]);

  const processedData = useMemo(() => {
    console.log('Processing State:', {
      airtable: {
        hasData: !!airtableData?.length,
        recordCount: airtableData?.length,
        sampleRecord: airtableData?.[0],
        isLoading: isAirtableLoading
      },
      github: {
        hasData: !!githubData,
        statusGroups: githubData?.statusGroups,
        isLoading: isGithubLoading
      },
      timestamp: new Date().toISOString()
    });

    if (isAirtableLoading || isGithubLoading) {
      console.log('Still loading data...');
      return null;
    }

    if (!airtableData?.length || !githubData?.statusGroups) {
      console.log('Missing required data:', {
        hasAirtable: !!airtableData?.length,
        airtableCount: airtableData?.length,
        hasGithub: !!githubData?.statusGroups,
        timestamp: new Date().toISOString()
      });
      return null;
    }

    try {
      const result = processData(airtableData, githubData);
      console.log('Data Processing Complete:', {
        hasResult: !!result,
        metrics: {
          contributors: result?.activeContributors,
          techPartners: result?.programHealth.activeTechPartners,
          engagementTrends: result?.engagementTrends.length,
          technicalProgress: result?.technicalProgress.length
        },
        timestamp: new Date().toISOString()
      });
      return result;
    } catch (error) {
      console.error('Processing Error:', error);
      return null;
    }
  }, [airtableData, githubData, isAirtableLoading, isGithubLoading]);

  return {
    data: processedData,
    isLoading: isAirtableLoading || isGithubLoading,
    isError: isAirtableError || isGithubError,
    isStale: false,
    lastUpdated: Math.max(airtableTimestamp || 0, githubTimestamp || 0),
    isFetching: isAirtableLoading || isGithubLoading,
    refresh: useCallback(async () => {
      console.log('Starting Refresh');
      try {
        await Promise.all([refreshAirtable(), refreshGithub()]);
        console.log('Refresh Complete');
      } catch (error) {
        console.error('Refresh Failed:', error);
        throw error;
      }
    }, [refreshAirtable, refreshGithub])
  };
}
