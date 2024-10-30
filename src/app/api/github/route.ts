import { NextResponse } from 'next/server';
import { GitHubData } from '@/types/dashboard';
import { isValidGitHubData } from '@/lib/validation';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PROJECT_ID = '7';
const USERNAME = 'kt-wawro';

interface ProjectItem {
  id: string;
  fieldValues: {
    nodes: Array<{
      field: { name: string }
      text: string
    }>
  }
  content: {
    title: string;
    state: string;
    createdAt: string;
    closedAt: string | null;
  } | null;
}

export async function GET(): Promise<NextResponse<GitHubData>> {
  try {
    console.log('GitHub API route called');
    
    if (!GITHUB_TOKEN) {
      console.error('GitHub token not found');
      throw new Error('GitHub token not found');
    }

    console.log('Fetching GitHub Project data...');

    const headers = {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PLDG-Dashboard'
    };

    // Fetch project data using the GraphQL API
    const projectQuery = {
      query: `
        query {
          user(login: "${USERNAME}") {
            projectV2(number: ${PROJECT_ID}) {
              items(first: 100) {
                nodes {
                  id
                  fieldValues(first: 8) {
                    nodes {
                      ... on ProjectV2ItemFieldTextValue {
                        field { name }
                        text
                      }
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        field { name }
                        name
                      }
                    }
                  }
                  content {
                    ... on Issue {
                      title
                      state
                      createdAt
                      closedAt
                    }
                    ... on PullRequest {
                      title
                      state
                      createdAt
                      closedAt
                    }
                  }
                }
              }
            }
          }
        }
      `
    };

    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify(projectQuery)
    });

    console.log('GitHub API Response Status:', response.status);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const items = (data.data?.user?.projectV2?.items?.nodes || []) as ProjectItem[];

    // Group items by status
    const statusGroups = {
      todo: items.filter(item => getItemStatus(item) === 'Todo').length,
      inProgress: items.filter(item => getItemStatus(item) === 'In Progress').length,
      done: items.filter(item => getItemStatus(item) === 'Done').length
    };

    // Transform the data
    const issues = items
      .filter((item: ProjectItem) => item.content)
      .map((item: ProjectItem) => ({
        title: item.content!.title,
        state: item.content!.state,
        created_at: item.content!.createdAt,
        closed_at: item.content!.closedAt,
        status: getItemStatus(item)
      }));

    console.log('GitHub Project data fetched:', {
      itemsCount: items.length,
      issuesCount: issues.length
    });

    const responseData: GitHubData = { 
      project: data.data,
      issues,
      statusGroups
    };

    // Validate the response data
    if (!isValidGitHubData(responseData)) {
      throw new Error('Invalid GitHub data structure');
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ 
      issues: [],
      project: { user: { projectV2: { items: { nodes: [] } } } },
      statusGroups: {
        todo: 0,
        inProgress: 0,
        done: 0
      },
      _error: error instanceof Error ? error.message : 'Unknown error'
    } as GitHubData);
  }
}

function getItemStatus(item: ProjectItem): string {
  const statusField = item.fieldValues.nodes.find(node => 
    node.field.name.toLowerCase() === 'status'
  );
  return statusField?.text || 'Todo';
} 