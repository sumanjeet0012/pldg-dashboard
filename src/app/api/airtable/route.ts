import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Fetching from Airtable API...');
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Weekly Engagement Survey`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store' // Disable caching
      }
    );

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform data at API level
    const transformedData = data.records.map((record: any) => ({
      fields: {
        'Program Week': record.fields['Program Week'] || '',
        'Name': record.fields['Name'] || '',
        'Engagement Participation ': record.fields['Engagement Participation '] || '',
        'Tech Partner Collaboration?': record.fields['Tech Partner Collaboration?'] || 'No',
        'Which Tech Partner': record.fields['Which Tech Partner'] || '',
        'How many issues, PRs, or projects this week?': record.fields['How many issues, PRs, or projects this week?'] || '0',
        'How likely are you to recommend the PLDG to others?': record.fields['How likely are you to recommend the PLDG to others?'] || '0',
        'PLDG Feedback': record.fields['PLDG Feedback'] || ''
      },
      id: record.id
    }));
    
    console.log('Airtable API Response:', {
      recordCount: transformedData.length,
      sampleRecord: transformedData[0],
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ records: transformedData });
  } catch (error) {
    console.error('Airtable API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Airtable data' },
      { status: 500 }
    );
  }
} 