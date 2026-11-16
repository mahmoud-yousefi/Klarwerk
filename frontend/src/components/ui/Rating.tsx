import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
  className?: string;
}

export function Rating({ value, count, size = 'sm', showValue = true, className }: RatingProps) {
  const { t } = useTranslation();
  const starSize = size === 'sm' ? 12 : 15;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={t('product.reviewSummary', {
          rating: value.toFixed(1),
          defaultValue: `${value} / 5`,
        })}
      >
        {[0, 1, 2, 3, 4].map((index) => {
          const fill = Math.max(0, Math.min(1, value - index));
          return (
            <span key={index} className="relative block" aria-hidden="true">
              <Star size={starSize} className="text-ink-900/18" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  size={starSize}
                  className="fill-amber-400 text-amber-400"
                />
              </span>
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-[12px] font-medium tabular-nums text-ink-900/60">
          {value.toFixed(1)}
          {typeof count === 'number' && (
            <span className="text-ink-900/40"> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
