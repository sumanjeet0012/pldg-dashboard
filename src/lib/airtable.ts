import { EngagementData } from '@/types/dashboard';
import useSWR from 'swr';

const REFRESH_INTERVAL = 60000; // 1 minute

async function fetchAirtableData(): Promise<EngagementData[]> {
  try {
    console.log('Starting Airtable data fetch...');
    const response = await fetch('/api/airtable');
    console.log('API Response:', response.status);

    if (!response.ok) {
      console.error('API error status:', response.status);
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Airtable response:', data);

    if (!data.records) {
      console.error('Invalid data format:', data);
      throw new Error('Invalid data format from Airtable');
    }
    
    // Transform the data
    const transformedData = data.records.map((record: any) => {
      console.log('Processing record fields:', record.fields);
      return {
        ...record.fields,
        'Program Week': record.fields['Program Week'] || '',
        'Engagement Participation ': record.fields['Engagement Participation '] || '',
        'Tech Partner Collaboration?': record.fields['Tech Partner Collaboration?'] || 'No',
        'Which Tech Partner': record.fields['Which Tech Partner'] || '',
        'How many issues, PRs, or projects this week?': record.fields['How many issues, PRs, or projects this week?'] || '0',
        'Name': record.fields['Name'] || '',
        'PLDG Feedback': record.fields['PLDG Feedback'] || '',
        'How likely are you to recommend the PLDG to others?': record.fields['How likely are you to recommend the PLDG to others?'] || '0'
      };
    });

    console.log('Transformed Airtable data:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching Airtable data:', error);
    return [];
  }
}

export function useAirtableData() {
  const { data, error, mutate } = useSWR<EngagementData[]>(
    '/api/airtable',
    fetchAirtableData,
    {
      refreshInterval: REFRESH_INTERVAL,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      onError: (error) => {
        console.error('SWR error:', error);
      }
    }
  );

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}
