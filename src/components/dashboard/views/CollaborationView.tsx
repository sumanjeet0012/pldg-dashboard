'use client';

import * as React from 'react';
import { EnhancedTechPartnerData } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CollaborationViewProps {
  data: EnhancedTechPartnerData[];
}

export function CollaborationView({ data }: CollaborationViewProps) {
  React.useEffect(() => {
    console.log('CollaborationView data:', {
      hasData: !!data?.length,
      dataCount: data?.length,
      collaborationMetrics: data?.[0]?.collaborationMetrics,
    });
  }, [data]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data.map((partner) => (
        <Card key={partner.partner}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">{partner.partner}</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Weekly Participation</p>
                <p className="font-medium">{partner.collaborationMetrics.weeklyParticipation}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Additional Calls</p>
                <div className="flex flex-wrap gap-2">
                  {partner.collaborationMetrics.additionalCalls.map((call, index) => (
                    <Badge key={index} variant="secondary">{call}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Feedback</p>
                <p className="text-sm">{partner.collaborationMetrics.feedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
