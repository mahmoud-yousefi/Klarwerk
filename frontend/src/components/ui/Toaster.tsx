import { useEffect } from 'react';
import { Check, Info, AlertCircle } from 'lucide-react';
import { useToastStore, type Toast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), 3600);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismiss]);

  const Icon = toast.type === 'success' ? Check : toast.type === 'error' ? AlertCircle : Info;

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-lift backdrop-blur-xl animate-fade-up',
        toast.type === 'error'
          ? 'border-rose-200 bg-white/95'
          : 'border-white/12 bg-ink-800/95 text-white',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
          toast.type === 'error'
            ? 'bg-rose-500/10 text-rose-600'
            : toast.type === 'success'
              ? 'bg-electric-500/20 text-electric-300'
              : 'bg-white/10 text-white/80',
        )}
      >
        <Icon size={15} />
      </span>
      <p className={cn('flex-1 pt-1 text-[13px] leading-relaxed', toast.type === 'error' ? 'text-ink-800' : 'text-white/90')}>
        {toast.message}
      </p>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className={cn(
          'text-[11px] uppercase tracking-wider opacity-50 transition hover:opacity-100',
          toast.type === 'error' ? 'text-ink-900' : 'text-white',
        )}
      >
        OK
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2 sm:bottom-7 sm:right-7">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
