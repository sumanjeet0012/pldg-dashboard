'use client';

import * as React from 'react';
import { EnhancedTechPartnerData } from '@/types/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { ExternalLink, Star } from 'lucide-react';

interface ContributorViewProps {
  data: EnhancedTechPartnerData[];
}

interface ContributorWithDetails {
  name: string;
  githubUsername: string;
  partner: string;
  issuesCompleted: number;
  engagementScore: number;
  email?: string;
  recentIssues?: Array<{ title: string }>;
}

export function ContributorView({ data }: ContributorViewProps) {
  React.useEffect(() => {
    console.log('ContributorView data:', {
      hasData: !!data?.length,
      dataCount: data?.length,
      contributorDetails: data?.[0]?.contributorDetails,
    });
  }, [data]);

  const contributors = data.flatMap(partner =>
    partner.contributorDetails.map(contributor => ({
      ...contributor,
      partner: partner.partner
    }))
  );

  return (
    <TooltipProvider>
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>GitHub</TableHead>
              <TableHead>Tech Partner</TableHead>
              <TableHead>Issues</TableHead>
              <TableHead>Engagement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contributors.map((contributor: ContributorWithDetails, index) => (
              <TableRow key={`${contributor.githubUsername}-${index}`}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{contributor.name}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{contributor.name}</p>
                        {contributor.email && (
                          <p className="text-xs text-muted-foreground">
                            {contributor.email}
                          </p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <a
                    href={`https://github.com/${contributor.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    {contributor.githubUsername}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>{contributor.partner}</TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help">{contributor.issuesCompleted}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="text-sm">Recent Issues</p>
                        <ul className="text-xs space-y-1">
                          {contributor.recentIssues?.slice(0, 3).map((issue, i: number) => (
                            <li key={i}>{issue.title}</li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 touch-none">
                        <span>{contributor.engagementScore}</span>
                        {contributor.engagementScore >= 4 && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={5} className="touch-none">
                      <p className="text-sm">
                        {contributor.engagementScore >= 4
                          ? "High engagement - Active contributor"
                          : contributor.engagementScore >= 3
                          ? "Medium engagement - Regular contributor"
                          : "Low engagement - Occasional contributor"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
