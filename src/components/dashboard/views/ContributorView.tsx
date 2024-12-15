'use client';

import * as React from 'react';
import { EnhancedTechPartnerData } from '@/types/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ContributorViewProps {
  data: EnhancedTechPartnerData[];
}

export function ContributorView({ data }: ContributorViewProps) {
  const contributors = data.flatMap(partner =>
    partner.contributorDetails.map(contributor => ({
      ...contributor,
      partner: partner.partner
    }))
  );

  return (
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
          {contributors.map((contributor, index) => (
            <TableRow key={`${contributor.githubUsername}-${index}`}>
              <TableCell>{contributor.name}</TableCell>
              <TableCell>{contributor.githubUsername}</TableCell>
              <TableCell>{contributor.partner}</TableCell>
              <TableCell>{contributor.issuesCompleted}</TableCell>
              <TableCell>{contributor.engagementScore}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
