"use client";

import { DashboardSystemProvider } from '@/context/DashboardSystemContext';
import { TooltipProvider } from '@/components/ui/tooltip';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <DashboardSystemProvider>
        {children}
      </DashboardSystemProvider>
    </TooltipProvider>
  );
} 