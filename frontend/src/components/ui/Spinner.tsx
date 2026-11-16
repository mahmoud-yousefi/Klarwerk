import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
      <Loader2 className={cn('h-6 w-6 animate-spin text-electric-500', className)} />
      {label && <span className="text-xs text-ink-900/45">{label}</span>}
      <span className="sr-only">{label ?? 'Loading'}</span>
    </div>
  );
}
