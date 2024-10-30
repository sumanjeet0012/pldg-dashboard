'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useDashboardSystem } from '@/context/DashboardSystemContext';
import ExecutiveSummary from './ExecutiveSummary';
import { ActionableInsights } from './ActionableInsights';
import EngagementChart from './EngagementChart';
import TechnicalProgressChart from './TechnicalProgressChart';
import { LoadingCard } from '@/components/ui/loading-card';
import { LastUpdated } from './LastUpdated';
import TopPerformersTable from './TopPerformersTable';
import TechPartnerChart from './TechPartnerChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DeveloperEngagementDashboard() {
  const { data, isLoading } = useDashboardSystem();

  const handleExport = React.useCallback(() => {
    if (!data) return;
    const exportData = JSON.stringify(data, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pldg-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [data]);

  if (isLoading || !data) {
    return <LoadingCard />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <header className="mb-8 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">PLDG Developer Engagement</h1>
            <p className="mt-2 text-indigo-100">Real-time insights and engagement metrics</p>
          </div>
          <LastUpdated />
        </div>
      </header>

      {/* Executive Summary - Most important metrics */}
      <div className="mb-6">
        <ExecutiveSummary data={data} onExport={handleExport} />
      </div>

      {/* Action Items - Critical attention areas */}
      <div className="mb-6">
        <ActionableInsights data={data} />
      </div>

      {/* Key Charts - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Suspense fallback={<LoadingCard />}>
          <EngagementChart data={data.engagementTrends} />
        </Suspense>
        <Suspense fallback={<LoadingCard />}>
          <TechnicalProgressChart 
            data={data.technicalProgress} 
            githubData={{
              inProgress: data.issueMetrics[0]?.open || 0,
              done: data.issueMetrics[0]?.closed || 0
            }}
          />
        </Suspense>
      </div>

      {/* Tech Partner Overview */}
      <div className="mb-6">
        <TechPartnerChart data={data.techPartnerPerformance} />
      </div>

      {/* Top Performers */}
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <TopPerformersTable data={data.topPerformers} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 