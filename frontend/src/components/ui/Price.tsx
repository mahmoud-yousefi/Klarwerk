import { useTranslation } from 'react-i18next';
import { cn, formatPrice } from '@/lib/utils';
import type { Locale } from '@/types/catalog';

interface PriceProps {
  price: number;
  originalPrice?: number | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSave?: boolean;
  className?: string;
}

export function Price({ price, originalPrice, size = 'md', showSave = false, className }: PriceProps) {
  const { i18n, t } = useTranslation();
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const sizes = {
    sm: 'text-sm',
    md: 'text-[17px]',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };
  const saving = originalPrice ? originalPrice - price : 0;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span
        className={cn(
          'font-display font-semibold tracking-[-0.02em] tabular-nums',
          sizes[size],
        )}
      >
        {formatPrice(price, locale)}
      </span>
      {originalPrice ? (
        <span className="text-[13px] text-ink-900/40 line-through tabular-nums">
          {formatPrice(originalPrice, locale)}
        </span>
      ) : null}
      {showSave && saving > 0 ? (
        <span className="text-[12px] font-medium text-emerald-600">
          {t('product.save', { amount: formatPrice(saving, locale) })}
        </span>
      ) : null}
    </div>
  );
}
