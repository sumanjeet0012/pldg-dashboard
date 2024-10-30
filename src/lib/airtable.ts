import { EngagementData } from '@/types/dashboard';
import useSWR from 'swr';

export function useAirtableData() {
  const { data, error, mutate } = useSWR<EngagementData[]>(
    '/api/airtable',
    async () => {
      console.log('Fetching Airtable data...');
      const response = await fetch('/api/airtable');
      
      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Airtable response:', {
        hasRecords: !!data.records,
        recordCount: data.records?.length
      });
      
      if (!data.records) {
        throw new Error('Invalid Airtable response format');
      }

      return data.records.map((record: any) => ({
        'Program Week': record.fields['Program Week'] || '',
        'Name': record.fields['Name'] || '',
        'Engagement Participation ': record.fields['Engagement Participation '] || '',
        'Tech Partner Collaboration?': record.fields['Tech Partner Collaboration?'] || 'No',
        'Which Tech Partner': record.fields['Which Tech Partner'] || '',
        'How many issues, PRs, or projects this week?': record.fields['How many issues, PRs, or projects this week?'] || '0',
        'How likely are you to recommend the PLDG to others?': record.fields['How likely are you to recommend the PLDG to others?'] || '0',
        'PLDG Feedback': record.fields['PLDG Feedback'] || ''
      }));
    },
    {
      refreshInterval: 60000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      onError: (error) => {
        console.error('Airtable data fetch error:', error);
      }
    }
  );

  return {
    data: data || [],
    isLoading: !error && !data,
    isError: !!error,
    mutate
  };
}
