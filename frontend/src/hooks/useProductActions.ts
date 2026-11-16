import { useTranslation } from 'react-i18next';
import { useToastStore } from '@/stores/toast.store';
import { useCartStore, maxQuantityFor } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useCompareStore } from '@/stores/compare.store';
import type { Product } from '@/types/catalog';

export function useProductActions() {
  const { t } = useTranslation();
  const push = useToastStore((state) => state.push);
  const addToCartStore = useCartStore((state) => state.add);
  const toggleWishlistStore = useWishlistStore((state) => state.toggle);
  const toggleCompareStore = useCompareStore((state) => state.toggle);

  const addToCart = (product: Product, quantity = 1) => {
    if (product.availability === 'out_of_stock') {
      push(t('availability.out_of_stock'), 'error');
      return false;
    }
    addToCartStore(product.id, quantity);
    push(t('toast.addedToCart', { name: product.name }), 'success');
    return true;
  };

  const toggleWishlist = (product: Product) => {
    const added = toggleWishlistStore(product.id);
    push(added ? t('toast.addedToWishlist') : t('toast.removedFromWishlist'), 'info');
    return added;
  };

  const toggleCompare = (product: Product) => {
    const result = toggleCompareStore(product.id);
    if (result === 'limit') {
      push(t('toast.compareLimit', { count: 4 }), 'error');
      return result;
    }
    push(result === 'added' ? t('toast.compareAdded') : t('toast.compareRemoved'), 'info');
    return result;
  };

  return { addToCart, toggleWishlist, toggleCompare, maxQuantityFor };
}
