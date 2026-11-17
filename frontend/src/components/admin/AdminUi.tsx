import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomerSegment, MessageStatus, OrderStatus } from '@/types/admin';

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  padded = true,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-ink-900/[0.07] bg-white shadow-[0_1px_2px_rgba(8,13,24,0.03)]',
        className,
      )}
    >
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-5 pt-4">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-900/45">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn(padded && 'p-5', title && padded && 'pt-3')}>{children}</div>
    </section>
  );
}

export function TabHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-electric-600">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-[26px] font-semibold tracking-[-0.03em] text-ink-900">
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-[12px] text-ink-900/50">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const accents = {
  electric: { bg: 'from-electric-500/12 to-electric-500/0', text: 'text-electric-600', ring: 'bg-electric-500/10' },
  violet: { bg: 'from-violet-500/12 to-violet-500/0', text: 'text-violet-600', ring: 'bg-violet-500/10' },
  teal: { bg: 'from-[#4FA3A5]/14 to-[#4FA3A5]/0', text: 'text-[#3B7F81]', ring: 'bg-[#4FA3A5]/12' },
  rose: { bg: 'from-[#D9587A]/12 to-[#D9587A]/0', text: 'text-[#B5385C]', ring: 'bg-[#D9587A]/12' },
  amber: { bg: 'from-[#C28A3D]/14 to-[#C28A3D]/0', text: 'text-[#9A6A25]', ring: 'bg-[#C28A3D]/12' },
} as const;

export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
  accent = 'electric',
  spark,
}: {
  label: string;
  value: string;
  delta?: number;
  hint?: string;
  icon: ReactNode;
  accent?: keyof typeof accents;
  spark?: ReactNode;
}) {
  const tone = accents[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-ink-900/[0.07] bg-white p-4 shadow-[0_1px_2px_rgba(8,13,24,0.03)] transition hover:shadow-soft">
      <div
        className={cn(
          'pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl',
          tone.bg,
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-ink-900/40">
            {label}
          </p>
          <p className="mt-1.5 font-display text-[25px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-ink-900">
            {value}
          </p>
        </div>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', tone.ring, tone.text)}>
          {icon}
        </span>
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-2">
        <div className="min-w-0">
          {typeof delta === 'number' && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums',
                delta >= 0 ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-600',
              )}
            >
              {delta >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {hint && <p className="mt-1 truncate text-[9.5px] text-ink-900/38">{hint}</p>}
        </div>
        {spark && <div className="w-20 shrink-0">{spark}</div>}
      </div>
    </div>
  );
}

const orderTones: Record<OrderStatus, string> = {
  paid: 'bg-emerald-500/10 text-emerald-700',
  processing: 'bg-electric-500/10 text-electric-600',
  shipped: 'bg-violet-500/10 text-violet-600',
  delivered: 'bg-teal-500/10 text-[#3B7F81]',
  refunded: 'bg-rose-500/10 text-rose-600',
  pending: 'bg-amber-500/10 text-[#9A6A25]',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-semibold capitalize',
        orderTones[status],
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

const segmentTones: Record<CustomerSegment, string> = {
  new: 'bg-electric-500/10 text-electric-600',
  returning: 'bg-teal-500/10 text-[#3B7F81]',
  vip: 'bg-violet-500/10 text-violet-600',
  'at-risk': 'bg-amber-500/10 text-[#9A6A25]',
};

export function SegmentBadge({ segment }: { segment: CustomerSegment }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em]',
        segmentTones[segment],
      )}
    >
      {segment}
    </span>
  );
}

const messageTones: Record<MessageStatus, string> = {
  open: 'bg-electric-500/10 text-electric-600',
  pending: 'bg-amber-500/10 text-[#9A6A25]',
  resolved: 'bg-emerald-500/10 text-emerald-700',
};

export function MessageBadge({ status }: { status: MessageStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize',
        messageTones[status],
      )}
    >
      {status}
    </span>
  );
}

export function Select({
  value,
  onChange,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      className={cn(
        'h-9 rounded-lg border border-ink-900/10 bg-white px-2.5 text-[11.5px] font-medium text-ink-900/70 outline-none transition hover:border-ink-900/20 focus:border-electric-500 focus:ring-2 focus:ring-electric-500/10',
        className,
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-900/45">
      {children}
    </label>
  );
}

export const adminInput =
  'h-10 w-full rounded-xl border border-ink-900/12 bg-white px-3 text-[12.5px] text-ink-900 outline-none transition placeholder:text-ink-900/30 hover:border-ink-900/20 focus:border-electric-500 focus:ring-2 focus:ring-electric-500/10';

export const adminTextarea =
  'min-h-[90px] w-full rounded-xl border border-ink-900/12 bg-white px-3 py-2.5 text-[12.5px] leading-relaxed text-ink-900 outline-none transition placeholder:text-ink-900/30 hover:border-ink-900/20 focus:border-electric-500 focus:ring-2 focus:ring-electric-500/10';

export const adminButtonPrimary =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-ink-900 px-4 text-[11.5px] font-semibold text-white transition hover:bg-ink-800 disabled:pointer-events-none disabled:opacity-60';

export const adminButtonGhost =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-3.5 text-[11.5px] font-medium text-ink-900/65 transition hover:border-ink-900/25 hover:text-ink-900';
