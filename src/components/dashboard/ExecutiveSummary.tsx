'use client';

import * as React from 'react';
import { ProcessedData } from '@/types/dashboard';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { exportDashboardAction } from '@/lib/actions';
import { toast } from '../ui/use-toast';

interface Props {
  data: ProcessedData;
}

export default function ExecutiveSummary({ data }: Props) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await exportDashboardAction(data);
      
      if (result.success && result.data) {
        // Create and trigger download
        const blob = new Blob(
          [Buffer.from(result.data, 'base64')], 
          { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename || 'dashboard-export.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Export successful',
          description: 'Dashboard data has been downloaded.'
        });
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Unable to export dashboard data.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid gap-4 p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">PLDG Cohort Performance</h2>
          <p className="text-muted-foreground">Key metrics and program health indicators</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
          Export Report
        </Button>
      </div>
      {/* ... rest of component ... */}
    </div>
  );
} 