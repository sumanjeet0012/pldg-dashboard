import { ErrorBoundary } from '@/components/ErrorBoundary';
import DeveloperEngagementDashboard from '@/components/dashboard/DeveloperEngagementDashboard';

export default function Home() {
  return (
    <ErrorBoundary>
      <DeveloperEngagementDashboard />
    </ErrorBoundary>
  );
} 