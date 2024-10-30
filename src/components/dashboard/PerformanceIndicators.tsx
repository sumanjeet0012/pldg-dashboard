import { ProcessedData } from "@/types/dashboard";
import { KPICard } from "./KPICard";

interface ExtendedProcessedData extends ProcessedData {
  programHealth: {
    engagementRate: number;
    nps: number;
  };
}

export function PerformanceIndicators({ data }: { data: ExtendedProcessedData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <KPICard
        title="Engagement Rate"
        value={`${data.programHealth.engagementRate}%`}
        trend={+5}
        status="positive"
        description="Weekly active participation"
      />
      <KPICard
        title="NPS Score"
        value={data.programHealth.nps}
        trend={-2}
        status="neutral"
        description="Net Promoter Score"
      />
      <KPICard
        title="Retention Rate"
        value="92%"
        trend={+3}
        status="positive"
        description="30-day contributor retention"
      />
      <KPICard
        title="Project Completion"
        value="87%"
        trend={+12}
        status="positive"
        description="On-time delivery rate"
      />
    </div>
  );
} 