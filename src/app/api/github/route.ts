import { NextResponse } from 'next/server';
import { GitHubData } from '@/types/dashboard';

const PROJECT_ID = '7';
const USERNAME = 'kt-wawro';

// Add column mapping
const COLUMN_STATUS = {
  'In Progress': 'In Progress',
  'In Review': 'In Progress', // Count "In Review" as "In Progress"
  'Done': 'Done',
  'Backlog': 'Todo',
  'Tirage': 'Todo'
} as const;

interface ProjectItem {
  id: string;
  fieldValues: {
    nodes: Array<{
      field: { name: string };
      text: string;
    }>;
  };
  content: {
    title: string;
    state: string;
    createdAt: string;
    closedAt: string | null;
  } | null;
}

export async function GET() {
  try {
    console.log('GitHub API route called');
    
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GitHub token not found');
    }

    console.log('Fetching GitHub Project data...');

    const headers = {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'PLDG-Dashboard'
    };

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
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        field { name }
                        text
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

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const items = (data.data?.user?.projectV2?.items?.nodes || []) as ProjectItem[];

    // Group items by status
    const statusCounts = {
      todo: items.filter(item => getItemStatus(item) === 'Todo').length,
      inProgress: items.filter(item => getItemStatus(item) === 'In Progress').length,
      done: items.filter(item => getItemStatus(item) === 'Done').length // Changed from 'completed' to 'done'
    };

    console.log('Status counts:', statusCounts);

    const responseData: GitHubData = {
      project: data.data,
      issues: items.map(item => ({
        title: item.content?.title || '',
        state: item.content?.state || '',
        created_at: item.content?.createdAt || '',
        closed_at: item.content?.closedAt || null,
        status: getItemStatus(item)
      })),
      statusGroups: statusCounts // Now matches the GitHubData type
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json({ 
      project: { user: { projectV2: { items: { nodes: [] } } } },
      issues: [],
      statusGroups: {
        todo: 0,
        inProgress: 0,
        done: 0 // Changed from 'completed' to 'done'
      }
    } as GitHubData);
  }
}

function getItemStatus(item: ProjectItem): string {
  const statusField = item.fieldValues.nodes.find(node => 
    node.field.name.toLowerCase() === 'status'
  );
  const columnStatus = statusField?.text || 'Todo';
  return COLUMN_STATUS[columnStatus as keyof typeof COLUMN_STATUS] || 'Todo';
} 