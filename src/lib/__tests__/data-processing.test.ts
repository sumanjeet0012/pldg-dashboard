import { processData, loadCohortData } from '../data-processing';
import { CohortId } from '@/types/cohort';

describe('Data Processing', () => {
  describe('loadCohortData', () => {
    it('should load data for cohort 1', async () => {
      const data = await loadCohortData('1');
      expect(data).toBeTruthy();
    });

    it('should load data for cohort 2', async () => {
      const data = await loadCohortData('2');
      expect(data).toBeTruthy();
    });

    it('should handle errors gracefully', async () => {
      await expect(loadCohortData('3' as CohortId)).rejects.toThrow();
    });
  });

  describe('processData', () => {
    const mockCsvData = [
      {
        Name: 'Test User',
        'Program Week': 'Week 1 (2024-01-01)',
        'Engagement Participation ': '3 - High',
        'How many issues, PRs, or projects this week?': '2',
        'Which Tech Partner': 'Partner A',
      }
    ];

    it('should process data correctly', () => {
      const result = processData(mockCsvData, null, '2');
      expect(result).toHaveProperty('activeContributors', 1);
      expect(result).toHaveProperty('cohortInfo');
      expect(result.cohortInfo?.id).toBe('2');
    });

    it('should filter data by cohort date range', () => {
      const result = processData([
        ...mockCsvData,
        {
          Name: 'Test User 2',
          'Program Week': 'Week 5 (2024-02-01)',
          'Engagement Participation ': '3 - High',
          'How many issues, PRs, or projects this week?': '2',
          'Which Tech Partner': 'Partner B',
        }
      ], null, '1');

      // Should only include data within cohort 1's date range
      expect(result.activeContributors).toBe(1);
    });
  });
}); 