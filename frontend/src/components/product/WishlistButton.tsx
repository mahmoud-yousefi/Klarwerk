import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useProductActions } from '@/hooks/useProductActions';
import type { Product } from '@/types/catalog';

interface WishlistButtonProps {
  product: Product;
  className?: string;
  variant?: 'card' | 'plain';
  withLabel?: boolean;
}

export function WishlistButton({
  product,
  className,
  variant = 'card',
  withLabel = false,
}: WishlistButtonProps) {
  const { t } = useTranslation();
  const isSaved = useWishlistStore((state) => state.ids.includes(product.id));
  const { toggleWishlist } = useProductActions();

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleWishlist(product);
      }}
      aria-pressed={isSaved}
      aria-label={isSaved ? t('product.removeFromWishlist') : t('product.addToWishlist')}
      className={cn(
        'flex items-center justify-center gap-2 transition',
        variant === 'card'
          ? 'h-9 w-9 rounded-full border border-ink-900/8 bg-white/85 text-ink-900/50 shadow-soft backdrop-blur-md hover:bg-white hover:text-rose-500'
          : 'h-11 rounded-full border border-ink-900/12 px-4 text-[13px] font-medium hover:border-ink-900/25',
        isSaved && (variant === 'card' ? 'border-rose-200 bg-white text-rose-500' : 'border-rose-200 bg-rose-50 text-rose-500'),
        className,
      )}
    >
      <Heart size={16} className={cn(isSaved && 'fill-rose-500')} />
      {withLabel && (isSaved ? t('product.removeFromWishlist') : t('product.addToWishlist'))}
    </button>
  );
}
