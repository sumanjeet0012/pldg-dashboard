import { NextResponse } from 'next/server';
import Airtable from 'airtable';

export async function GET() {
  try {
    console.log('Airtable API route called');
    
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Missing Airtable credentials');
    }

    const base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
      endpointUrl: 'https://api.airtable.com'
    }).base(process.env.AIRTABLE_BASE_ID);

    console.log('Querying Airtable base:', process.env.AIRTABLE_BASE_ID);

    const records = await base('Weekly Engagement Survey').select({
      maxRecords: 100,
      view: 'Weekly Breakdown'
    }).all();

    console.log('Airtable records fetched:', {
      count: records.length,
      sampleFields: records[0]?.fields ? Object.keys(records[0].fields) : []
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Airtable API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Airtable data', details: error },
      { status: 500 }
    );
  }
} 