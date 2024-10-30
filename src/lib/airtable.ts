import { EngagementData } from '@/types/dashboard';
import useSWR from 'swr';

const REFRESH_INTERVAL = 60000; // 1 minute

async function fetchAirtableData(): Promise<EngagementData[]> {
  try {
    console.log('Starting Airtable data fetch...');
    const response = await fetch('/api/airtable');
    console.log('Airtable API Response Status:', response.status);

    if (!response.ok) {
      console.error('Airtable API error status:', response.status);
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Airtable response:', {
      hasRecords: !!data.records,
      recordCount: data.records?.length,
      sampleFields: data.records?.[0]?.fields ? Object.keys(data.records[0].fields) : []
    });

    if (!data.records) {
      console.error('Invalid data format:', data);
      throw new Error('Invalid data format from Airtable');
    }
    
    // Transform the data
    const transformedData = data.records.map((record: any) => {
      console.log('Processing record:', {
        hasFields: !!record.fields,
        fieldNames: record.fields ? Object.keys(record.fields) : []
      });
      
      return {
        'Program Week': record.fields['Program Week'] || '',
        'Name': record.fields['Name'] || '',
        'Engagement Participation ': record.fields['Engagement Participation '] || '',
        'Tech Partner Collaboration?': record.fields['Tech Partner Collaboration?'] || 'No',
        'Which Tech Partner': record.fields['Which Tech Partner'] || '',
        'How many issues, PRs, or projects this week?': record.fields['How many issues, PRs, or projects this week?'] || '0',
        'How likely are you to recommend the PLDG to others?': record.fields['How likely are you to recommend the PLDG to others?'] || '0',
        'PLDG Feedback': record.fields['PLDG Feedback'] || ''
      };
    });

    console.log('Transformed Airtable data:', {
      count: transformedData.length,
      sampleEntry: transformedData[0]
    });

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
        console.error('SWR Airtable error:', error);
      }
    }
  );

  console.log('Airtable hook state:', {
    hasData: !!data,
    dataLength: data?.length,
    isError: !!error,
    errorMessage: error?.message
  });

  return {
    data,
    isLoading: !error && !data,
    isError: error,
    mutate
  };
}
