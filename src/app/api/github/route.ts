import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { cache } from 'react';

// Cache the GitHub data fetching
const getGitHubData = cache(async () => {
  try {
    console.log('Fetching GitHub data...');
    console.log('Using GitHub token:', process.env.GITHUB_TOKEN ? 'Present' : 'Missing');
    
    const response = await fetch(`https://api.github.com/repos/protocol-labs/pldg/issues`, {
      next: { revalidate: 300 }, // Cache for 5 minutes
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    });

    console.log('GitHub API Response Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('GitHub data fetched:', {
      issuesCount: data.length,
      sampleIssue: data[0]?.title
    });

    return data;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    throw error;
  }
});

export async function GET() {
  try {
    console.log('GitHub API route called');
    const data = await getGitHubData();
    console.log('GitHub data processed successfully');
    return NextResponse.json({ issues: data });
  } catch (error) {
    console.error('GitHub API route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data' },
      { status: 500 }
    );
  }
} 