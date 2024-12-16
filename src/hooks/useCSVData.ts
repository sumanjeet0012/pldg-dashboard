import { useState, useEffect } from 'react';
import Papa, { ParseResult, ParseConfig } from 'papaparse';
import { EngagementData } from '@/types/dashboard';

export function useCSVData() {
  const [data, setData] = useState<EngagementData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [timestamp, setTimestamp] = useState<number>(0);

  useEffect(() => {
    async function fetchCSV() {
      try {
        console.log('Fetching CSV data...');
        const response = await fetch('/data/weekly-engagement-data.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch CSV: ' + response.statusText);
        }

        const csvText = await response.text();
        console.log('Parsing CSV data...');

        const parseConfig: ParseConfig<EngagementData> = {
          header: true,
          complete: (results: ParseResult<EngagementData>) => {
            console.log('CSV parsing complete:', {
              rows: results.data.length,
              fields: results.meta.fields,
              errors: results.errors
            });

            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }

            setData(results.data);
            setIsLoading(false);
            setTimestamp(Date.now());
          }
        };

        Papa.parse(csvText, parseConfig);
      } catch (error) {
        console.error('Error loading CSV:', error);
        setIsError(true);
        setIsLoading(false);
      }
    }

    fetchCSV();
  }, []);

  const mutate = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await fetch('/data/weekly-engagement-data.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch CSV: ' + response.statusText);
      }
      const csvText = await response.text();

      const parseConfig: ParseConfig<EngagementData> = {
        header: true,
        complete: (results: ParseResult<EngagementData>) => {
          setData(results.data);
          setIsLoading(false);
          setTimestamp(Date.now());
        }
      };

      Papa.parse(csvText, parseConfig);
    } catch (error) {
      console.error('Error refreshing CSV:', error);
      setIsError(true);
      setIsLoading(false);
    }
  };

  return {
    data,
    isLoading,
    isError,
    mutate,
    timestamp
  };
}
