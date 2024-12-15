import { NextResponse } from 'next/server';
import { processData } from '../../../../lib/data-processing';
import { GitHubData } from '../../../../types/dashboard';

export async function GET() {
  try {
    // Fetch raw data from main Airtable endpoint
    const response = await fetch('http://localhost:3000/api/airtable');
    if (!response.ok) {
      throw new Error(`Failed to fetch Airtable data: ${response.statusText}`);
    }

    const rawData = await response.json();
    console.log('Processing raw data:', {
      recordCount: rawData.length,
      sampleRecord: rawData[0],
      timestamp: new Date().toISOString()
    });

    // Create empty GitHub data for now since we're only processing Airtable data
    const githubData: GitHubData = {
      project: {
        user: {
          projectV2: {
            items: {
              nodes: []
            }
          }
        }
      },
      issues: [],
      statusGroups: {
        todo: 0,
        inProgress: 0,
        done: 0
      },
      timestamp: Date.now()
    };

    // Process the data using our enhanced processing functions
    const processedData = processData(rawData, githubData);
    console.log('Processed data:', {
      weeklyChange: processedData.weeklyChange,
      activeContributors: processedData.activeContributors,
      totalContributions: processedData.totalContributions,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('Error processing Airtable data:', error);
    return NextResponse.json(
      { error: 'Failed to process Airtable data' },
      { status: 500 }
    );
  }
}
