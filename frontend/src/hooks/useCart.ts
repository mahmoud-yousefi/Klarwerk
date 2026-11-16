import { useMemo } from 'react';
import site from '@/data/site.json';
import { getProductById } from '@/lib/catalog';
import { useCartStore } from '@/stores/cart.store';
import type { Product } from '@/types/catalog';

export interface DetailedCartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

export function useCartDetails() {
  const lines = useCartStore((state) => state.lines);

  return useMemo(() => {
    const detailed: DetailedCartLine[] = lines
      .map((line) => {
        const product = getProductById(line.productId);
        if (!product) return null;
        return {
          product,
          quantity: line.quantity,
          lineTotal: product.price * line.quantity,
        };
      })
      .filter((line): line is DetailedCartLine => line !== null);

    const subtotal = detailed.reduce((sum, line) => sum + line.lineTotal, 0);
    const count = detailed.reduce((sum, line) => sum + line.quantity, 0);
    const standardShipping = subtotal >= site.freeShippingFrom || subtotal === 0 ? 0 : 4.9;

    return { lines: detailed, subtotal, count, standardShipping };
  }, [lines]);
}

export function shippingCost(subtotal: number, method: 'standard' | 'express' = 'standard') {
  if (method === 'express') return 9.9;
  return subtotal >= site.freeShippingFrom ? 0 : 4.9;
}
