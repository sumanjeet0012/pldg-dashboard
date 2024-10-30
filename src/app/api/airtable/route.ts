import { NextResponse } from 'next/server';
import Airtable from 'airtable';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const TABLE_NAME = 'Weekly Engagement Survey';

export async function GET() {
  try {
    console.log('Fetching Airtable data...');
    
    console.log('Airtable API called with credentials:', {
      hasApiKey: !!AIRTABLE_API_KEY,
      hasBaseId: !!AIRTABLE_BASE_ID,
      tableName: TABLE_NAME
    });

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable credentials');
      throw new Error('Missing Airtable credentials');
    }

    // Initialize Airtable with proper authentication
    const base = new Airtable({
      apiKey: AIRTABLE_API_KEY,
      endpointUrl: 'https://api.airtable.com'
    }).base(AIRTABLE_BASE_ID);

    console.log('Querying Airtable base:', AIRTABLE_BASE_ID);

    // Remove view specification and just get all records
    const records = await base(TABLE_NAME).select({
      maxRecords: 100
    }).all();

    console.log('Airtable records fetched:', {
      count: records.length,
      fields: records[0]?.fields ? Object.keys(records[0].fields) : []
    });

    return NextResponse.json({ 
      records: records.map(record => ({
        id: record.id,
        fields: record.fields
      }))
    });
  } catch (error: any) {
    console.error('Airtable API error:', {
      message: error.message,
      error: error,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to fetch Airtable data', details: error.message },
      { status: 500 }
    );
  }
} 