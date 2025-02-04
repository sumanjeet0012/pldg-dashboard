export type CohortId = '1' | '2';

export interface CohortMetadata {
  id: CohortId;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export const COHORT_DATA: Record<CohortId, CohortMetadata> = {
  '1': {
    id: '1',
    name: 'Cohort 1',
    startDate: '2024-01-01',
    endDate: '2024-01-19',
    description: 'First PLDG cohort'
  },
  '2': {
    id: '2',
    name: 'Cohort 2',
    startDate: '2024-01-20',
    endDate: '2024-02-02',
    description: 'Current active cohort'
  }
};

export interface CohortState {
  selectedCohort: CohortId;
  cohorts: CohortMetadata[];
} 