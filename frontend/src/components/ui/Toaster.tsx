import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Info, AlertCircle, X } from 'lucide-react';
import { useToastStore, type Toast } from '@/stores/toast.store';
import { cn } from '@/lib/utils';

const DURATION = 3600;

const styles = {
  success: {
    shell: 'border-electric-400/30 bg-ink-900/95',
    icon: 'bg-electric-500/18 text-electric-300 ring-electric-400/25',
    edge: 'bg-gradient-to-b from-electric-400 to-violet-500',
    bar: 'bg-gradient-to-r from-electric-400 via-electric-300 to-violet-300',
  },
  error: {
    shell: 'border-rose-400/30 bg-ink-900/95',
    icon: 'bg-rose-500/15 text-rose-300 ring-rose-400/25',
    edge: 'bg-gradient-to-b from-rose-400 to-rose-600',
    bar: 'bg-gradient-to-r from-rose-400 via-rose-300 to-orange-300',
  },
  info: {
    shell: 'border-violet-400/25 bg-ink-900/95',
    icon: 'bg-violet-500/18 text-violet-300 ring-violet-400/25',
    edge: 'bg-gradient-to-b from-violet-400 to-violet-600',
    bar: 'bg-gradient-to-r from-violet-400 via-violet-300 to-electric-300',
  },
} as const;

function ToastItem({ toast }: { toast: Toast }) {
  const { t } = useTranslation();
  const dismiss = useToastStore((state) => state.dismiss);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(toast.id), DURATION);
    return () => window.clearTimeout(timer);
  }, [toast.id, dismiss]);

  const Icon = toast.type === 'success' ? Check : toast.type === 'error' ? AlertCircle : Info;
  const tone = styles[toast.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-auto relative w-full overflow-hidden rounded-[18px] border shadow-[0_26px_60px_-24px_rgba(5,8,15,0.7)] backdrop-blur-2xl animate-toast-in sm:w-[352px]',
        tone.shell,
      )}
    >
      <span aria-hidden="true" className={cn('absolute inset-y-0 left-0 w-[3px]', tone.edge)} />

      <div className="flex items-start gap-3 py-3.5 pl-4 pr-2.5">
        <span
          className={cn(
            'mt-px flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1',
            tone.icon,
          )}
        >
          <Icon size={16} strokeWidth={2.4} />
        </span>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[12.5px] font-medium leading-snug tracking-[-0.01em] text-white/95">
            {toast.message}
          </p>
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
            {t(`toast.types.${toast.type}`)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => dismiss(toast.id)}
          aria-label={t('nav.close')}
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/35 transition hover:bg-white/10 hover:text-white"
        >
          <X size={13} />
        </button>
      </div>

      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] bg-white/8">
        <span
          className={cn('block h-full w-full origin-left animate-toast-progress', tone.bar)}
          style={{ animationDuration: `${DURATION}ms` }}
        />
      </span>
    </div>
  );
}

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[120] flex flex-col items-center gap-2 px-3 sm:px-4 lg:inset-x-auto lg:bottom-7 lg:right-7 lg:items-end lg:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
