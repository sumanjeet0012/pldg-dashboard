import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const TABLE_NAME = 'Weekly Engagement Survey';

export async function GET() {
  try {
    console.log('Fetching Airtable data...');
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      throw new Error('Missing Airtable credentials');
    }

    // Initialize Airtable with proper authentication
    const base = new Airtable({
      apiKey: AIRTABLE_API_KEY,
      endpointUrl: 'https://api.airtable.com'
    }).base(AIRTABLE_BASE_ID);

    console.log('Querying Airtable base:', AIRTABLE_BASE_ID);

    // Remove view specification to get all records
    const records = await base(TABLE_NAME).select({
      maxRecords: 100,
      pageSize: 100
    }).all();

    console.log('Airtable records fetched:', {
      count: records.length,
      sampleFields: records[0]?.fields
    });

    return NextResponse.json({ 
      records: records.map(record => ({
        id: record.id,
        fields: record.fields
      }))
    });
  } catch (error) {
    console.error('Airtable API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Airtable data', details: error },
      { status: 500 }
    );
  }
} 