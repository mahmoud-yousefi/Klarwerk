import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, text, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-900/15 bg-white/60 px-6 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900/[0.045] text-ink-900/45">
          {icon}
        </div>
      )}
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      {text && <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-900/55">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
