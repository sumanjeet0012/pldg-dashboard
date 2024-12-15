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
    console.log('Starting data processing...', {
      airtable: {
        hasData: !!airtableData?.length,
        recordCount: airtableData?.length,
        sampleRecord: airtableData?.[0],
        isLoading: isAirtableLoading,
        error: isAirtableError
      },
      github: {
        hasData: !!githubData,
        statusGroups: githubData?.statusGroups,
        isLoading: isGithubLoading,
        error: isGithubError
      },
      timestamp: new Date().toISOString()
    });

    // Only return null if we have no data AND we're loading
    if ((isAirtableLoading && !airtableData?.length) || (isGithubLoading && !githubData?.statusGroups)) {
      console.log('Still loading initial data...');
      return null;
    }

    if (!airtableData?.length) {
      console.log('Airtable data missing or empty:', {
        hasData: !!airtableData,
        length: airtableData?.length,
        timestamp: new Date().toISOString()
      });
      return null;
    }

    if (!githubData?.statusGroups) {
      console.log('GitHub data missing or invalid:', {
        hasData: !!githubData,
        statusGroups: githubData?.statusGroups,
        timestamp: new Date().toISOString()
      });
      return null;
    }

    try {
      console.log('Processing data with:', {
        airtableRecords: airtableData.length,
        githubStatusGroups: githubData.statusGroups,
        timestamp: new Date().toISOString()
      });

      const result = processData(airtableData, githubData);

      console.log('Data Processing Result:', {
        hasResult: !!result,
        metrics: result ? {
          contributors: result.activeContributors,
          techPartners: result.programHealth.activeTechPartners,
          engagementTrends: result.engagementTrends.length,
          technicalProgress: result.technicalProgress.length
        } : null,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      console.error('Data Processing Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }, [airtableData, githubData, isAirtableLoading, isGithubLoading, isAirtableError, isGithubError]);

  return {
    data: processedData,
    isLoading: (isAirtableLoading && !airtableData?.length) || (isGithubLoading && !githubData?.statusGroups),
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
