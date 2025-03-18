"use client";

import * as React from 'react';
import { useContext, useState, useEffect } from 'react';
import { processedDataCohort1, processedDataCohort2 } from 'src/components/dashboard/DeveloperEngagementDashboard';
import { ProcessedData } from 'src/types/dashboard';
interface CohortContextType {
  selectedCohort: string;
  cohorts: string[];
  processedData: ProcessedData;
  selectCohort: (cohort: string) => void;
}

const CohortContext = React.createContext<CohortContextType | undefined>(undefined);

export function CohortProvider({ children }: { children: React.ReactNode }) {
  const mockCohorts = ['Cohort 1', 'Cohort 2', 'Cohort 3'];

  const [selectedCohort, setSelectedCohort] = useState<string>(mockCohorts[0]);
  // const [processedData, setProcessedData] = useState<ProcessedData>(processedDataCohort1);
  // useEffect(() => {
  //   switch(selectedCohort) {
  //     case 'Cohort 1':
  //       setProcessedData(processedDataCohort1);
  //       break;
  //     case 'Cohort 2':
  //       setProcessedData(processedDataCohort2);
  //       break;
  //     default:
  //       setProcessedData(processedDataCohort1);
  //   }
  // }, [selectedCohort]);
  
  const selectCohort = (cohort: string) => {
    setSelectedCohort(cohort);
  };
  
  const value = {
    selectedCohort,
    cohorts: mockCohorts,
    // processedData,
    selectCohort
  };
  
  return (
    <CohortContext.Provider value={value}>
      {children}
    </CohortContext.Provider>
  );
}

export function useCohortContext() {
  const context = useContext(CohortContext);
  if (!context) {
    throw new Error('useCohortContext must be used within a CohortProvider');
  }
  return context;
}