import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching from Airtable API...');

    // Validate environment variables
    const baseId = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
    const apiKey = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;

    if (!baseId || !apiKey) {
      console.error('Missing required Airtable environment variables');
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Weekly%20Engagement%20Survey`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      }
    );

    console.log('Airtable API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        requestUrl: `https://api.airtable.com/v0/${baseId}/Weekly%20Engagement%20Survey`
      });
      throw new Error(`Airtable API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw Airtable response:', {
      hasRecords: !!data.records,
      recordCount: data.records?.length || 0,
      sampleRecord: data.records?.[0]
    });

    if (!data.records || !Array.isArray(data.records)) {
      console.error('Invalid Airtable response format:', data);
      throw new Error('Invalid Airtable response format');
    }

    // Transform data at API level to match expected EngagementData type
    const transformedData = data.records.map((record: any) => ({
      'Program Week': record.fields['Program Week'] || '',
      'Name': record.fields['Name'] || '',
      'Engagement Participation ': record.fields['Engagement Participation '] || '',
      'Tech Partner Collaboration?': record.fields['Tech Partner Collaboration?'] || 'No',
      'Which Tech Partner': parseTechPartners(record.fields['Which Tech Partner'] || []),
      'How many issues, PRs, or projects this week?': record.fields['How many issues, PRs, or projects this week?'] || '0',
      'How likely are you to recommend the PLDG to others?': record.fields['How likely are you to recommend the PLDG to others?'] || '0',
      'PLDG Feedback': record.fields['PLDG Feedback'] || '',
      'Created': record.fields['Created'] || record.createdTime || ''
    }));

    console.log('Airtable API Response:', {
      recordCount: transformedData.length,
      sampleRecord: transformedData[0],
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Airtable API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Airtable data' },
      { status: 500 }
    );
  }
}

function parseTechPartners(techPartner: string | string[]): string[] {
  if (Array.isArray(techPartner)) {
    return techPartner;
  }
  return techPartner?.split(',').map(p => p.trim()) ?? [];
} 