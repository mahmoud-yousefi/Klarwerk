import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'dark' | 'glass';

const variants: Record<Variant, string> = {
  neutral: 'bg-ink-900/[0.055] text-ink-700',
  accent: 'bg-electric-500/10 text-electric-600',
  success: 'bg-emerald-500/10 text-emerald-700',
  warning: 'bg-amber-500/12 text-amber-700',
  danger: 'bg-rose-500/10 text-rose-600',
  dark: 'bg-white/10 text-white/90',
  glass: 'glass text-white',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
