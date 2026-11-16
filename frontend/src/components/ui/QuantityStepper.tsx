import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  size = 'md',
  className,
}: QuantityStepperProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-ink-900/15 bg-white',
        size === 'sm' ? 'h-9' : 'h-11',
        className,
      )}
      role="group"
      aria-label={t('product.quantity')}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center rounded-full text-ink-900/70 transition hover:bg-ink-900/5 disabled:opacity-30',
          size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
        )}
        aria-label={t('product.quantity')}
      >
        <Minus size={14} />
      </button>
      <span
        className={cn('min-w-7 text-center text-sm font-medium tabular-nums', size === 'sm' && 'min-w-6')}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(
          'flex items-center justify-center rounded-full text-ink-900/70 transition hover:bg-ink-900/5 disabled:opacity-30',
          size === 'sm' ? 'h-9 w-9' : 'h-11 w-11',
        )}
        aria-label={t('product.quantity')}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
