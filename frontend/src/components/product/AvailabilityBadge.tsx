import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Availability } from '@/types/catalog';

const styles: Record<Availability, { dot: string; text: string }> = {
  in_stock: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  low_stock: { dot: 'bg-amber-500', text: 'text-amber-700' },
  preorder: { dot: 'bg-electric-500', text: 'text-electric-600' },
  out_of_stock: { dot: 'bg-ink-900/25', text: 'text-ink-900/40' },
};

export function AvailabilityBadge({
  availability,
  hint = false,
  className,
}: {
  availability: Availability;
  hint?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const style = styles[availability];

  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-medium', style.text, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {t(`availability.${availability}`)}
      {hint && (
        <span className="font-normal text-ink-900/40">
          · {t(`availability.${availability}_hint`)}
        </span>
      )}
    </span>
  );
}
