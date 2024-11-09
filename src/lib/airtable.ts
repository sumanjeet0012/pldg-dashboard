import { EngagementData } from '@/types/dashboard';
import useSWR from 'swr';

export function useAirtableData() {
  const { data, error, isValidating, mutate } = useSWR<{ records: any[] }>(
    '/api/airtable',
    async () => {
      console.log('Fetching Airtable data...');
      const response = await fetch('/api/airtable');
      
      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log('Airtable raw response:', {
        hasRecords: !!rawData.records,
        recordCount: rawData.records?.length
      });
      
      return rawData;
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 10000
    }
  );

  // Transform the data after fetching
  const transformedData: EngagementData[] = data?.records?.map(record => ({
    'Program Week': record.fields['Program Week'] || '',
    'Name': record.fields['Name'] || '',
    'Engagement Participation ': record.fields['Engagement Participation '] || '',
    'Tech Partner Collaboration?': record.fields['Tech Partner Collaboration?'] || 'No',
    'Which Tech Partner': record.fields['Which Tech Partner'] || '',
    'How many issues, PRs, or projects this week?': record.fields['How many issues, PRs, or projects this week?'] || '0',
    'How likely are you to recommend the PLDG to others?': record.fields['How likely are you to recommend the PLDG to others?'] || '0',
    'PLDG Feedback': record.fields['PLDG Feedback'] || ''
  })) || [];

  const result = {
    data: transformedData,
    isLoading: !error && !data && isValidating,
    isError: !!error,
    mutate,
    timestamp: Date.now()
  };

  console.log('Airtable Hook Result:', {
    hasData: !!result.data.length,
    recordCount: result.data.length,
    sampleRecord: result.data[0],
    isLoading: result.isLoading,
    isError: result.isError,
    timestamp: new Date(result.timestamp).toISOString()
  });

  return result;
}
