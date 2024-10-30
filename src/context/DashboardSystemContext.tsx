"use client";

import * as React from 'react';
import { ProcessedData, ActionItem } from '@/types/dashboard';
import { useProcessedData } from '@/lib/data-processing';

interface DashboardSystemContextType {
  data: ProcessedData | null;
  isLoading: boolean;
  isError: boolean;
  refresh: () => Promise<void>;
}

const DashboardSystemContext = React.createContext<DashboardSystemContextType | undefined>(undefined);

export function DashboardSystemProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, isError, refresh } = useProcessedData();

  // Add type assertion to ensure data matches ProcessedData type
  const typedData = data as ProcessedData | null;

  const value = React.useMemo(() => ({
    data: typedData,
    isLoading,
    isError,
    refresh
  }), [typedData, isLoading, isError, refresh]);

  return (
    <DashboardSystemContext.Provider value={value}>
      {children}
    </DashboardSystemContext.Provider>
  );
}

export function useDashboardSystem() {
  const context = React.useContext(DashboardSystemContext);
  if (context === undefined) {
    throw new Error('useDashboardSystem must be used within a DashboardSystemProvider');
  }
  return context;
} 