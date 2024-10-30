import { Clock } from 'lucide-react';
import { formatLastUpdated } from '@/lib/time';

export function LastUpdated() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sm">
      <Clock className="w-4 h-4" />
      <span>Updated {formatLastUpdated(new Date())}</span>
    </div>
  );
} 