import { NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'protocol-labs';
const REPO = 'pldg';

export async function GET() {
  try {
    console.log('GitHub API route called');
    
    if (!GITHUB_TOKEN) {
      console.error('GitHub token not found');
      throw new Error('GitHub token not found');
    }

    console.log('Fetching GitHub data with token:', GITHUB_TOKEN.slice(0, 4) + '...');

    const headers = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PLDG-Dashboard'
    };

    // Test the token first
    const testResponse = await fetch('https://api.github.com/user', { headers });
    if (!testResponse.ok) {
      console.error('GitHub token validation failed:', testResponse.status);
      throw new Error(`GitHub token validation failed: ${testResponse.statusText}`);
    }

    // Fetch both issues and PRs
    const [issuesResponse, prsResponse] = await Promise.all([
      fetch(`https://api.github.com/repos/${OWNER}/${REPO}/issues?state=all&per_page=100`, {
        headers
      }),
      fetch(`https://api.github.com/repos/${OWNER}/${REPO}/pulls?state=all&per_page=100`, {
        headers
      })
    ]);

    console.log('GitHub API Response Status:', {
      issues: issuesResponse.status,
      prs: prsResponse.status
    });

    if (!issuesResponse.ok || !prsResponse.ok) {
      throw new Error(`GitHub API error: ${issuesResponse.statusText || prsResponse.statusText}`);
    }

    const [issues, prs] = await Promise.all([
      issuesResponse.json(),
      prsResponse.json()
    ]);

    console.log('GitHub data fetched:', {
      issuesCount: issues.length,
      prsCount: prs.length
    });

    return NextResponse.json({ issues: [...issues, ...prs] });
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub data', details: error },
      { status: 500 }
    );
  }
} 