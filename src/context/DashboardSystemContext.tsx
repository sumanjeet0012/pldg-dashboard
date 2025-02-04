"use client";

import * as React from 'react';
import { ProcessedData } from '@/types/dashboard';
import { useDashboardSystem } from '@/lib/system';
import { createContext, useContext, useState, useEffect } from 'react';
import { CohortId, COHORT_DATA } from '@/types/cohort';
import Papa from 'papaparse';

interface DashboardSystemContextType {
  data: ProcessedData | null;
  isLoading: boolean;
  isError: boolean;
  isStale: boolean;
  lastUpdated: number;
  isFetching: boolean;
  refresh: () => Promise<void>;
  selectedCohort: CohortId;
  setSelectedCohort: (cohort: CohortId) => void;
}

export const DashboardSystemContext = createContext<DashboardSystemContextType | undefined>(undefined);

export function DashboardSystemProvider({ children }: { children: React.ReactNode }) {
  const [selectedCohort, setSelectedCohort] = useState<CohortId>('2'); // Default to Cohort 2
  const systemData = useDashboardSystem();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const csvText = await loadCohortData(selectedCohort);
        
        Papa.parse<EngagementData>(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim(),
          complete: (results) => {
            const processedData = processData(results.data, githubData, selectedCohort);
            setData(processedData);
            setLastUpdated(new Date().toISOString());
            setIsLoading(false);
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            setError(error.message);
            setIsLoading(false);
          }
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load data');
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedCohort, githubData]);

  return (
    <DashboardSystemContext.Provider value={{
      data,
      isLoading,
      isError,
      error,
      refresh,
      lastUpdated,
      isFetching,
      selectedCohort,
      setSelectedCohort
    }}>
      {children}
    </DashboardSystemContext.Provider>
  );
}

export function useDashboardSystemContext() {
  const context = React.useContext(DashboardSystemContext);
  if (!context) {
    throw new Error('useDashboardSystemContext must be used within a DashboardSystemProvider');
  }
  return context;
}