import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    console.log('Fetching Airtable data...');
    
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.error('Missing Airtable credentials');
      throw new Error('Missing Airtable credentials');
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    console.log('Querying Airtable base:', process.env.AIRTABLE_BASE_ID);

    const records = await base('Engagement Tracking').select({
      view: 'Grid view'
    }).all();

    console.log('Airtable records fetched:', {
      count: records.length,
      sampleFields: records[0]?.fields
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Airtable API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Airtable data' },
      { status: 500 }
    );
  }
} 