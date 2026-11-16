import { useTranslation } from 'react-i18next';
import { GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompareStore } from '@/stores/compare.store';
import { useProductActions } from '@/hooks/useProductActions';
import type { Product } from '@/types/catalog';

export function CompareButton({
  product,
  className,
  variant = 'ghost',
}: {
  product: Product;
  className?: string;
  variant?: 'ghost' | 'outline';
}) {
  const { t } = useTranslation();
  const isCompared = useCompareStore((state) => state.ids.includes(product.id));
  const { toggleCompare } = useProductActions();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleCompare(product);
      }}
      aria-pressed={isCompared}
      className={cn(
        'inline-flex items-center gap-2 text-[12px] font-medium transition',
        variant === 'outline'
          ? 'h-11 rounded-full border border-ink-900/12 px-4 hover:border-ink-900/25'
          : 'text-ink-900/45 hover:text-ink-900',
        isCompared && 'text-electric-600',
        className,
      )}
    >
      <GitCompare size={15} />
      {isCompared ? t('product.inCompare') : t('product.compare')}
    </button>
  );
}
