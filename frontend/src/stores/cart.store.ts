import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartLine } from '@/types/catalog';
import { getProductById } from '@/lib/catalog';
import { clamp } from '@/lib/utils';

export const MAX_LINE_QUANTITY = 10;

export function maxQuantityFor(productId: string) {
  const product = getProductById(productId);
  if (!product) return 0;
  if (product.availability === 'out_of_stock') return 0;
  if (product.availability === 'preorder') return Math.min(5, MAX_LINE_QUANTITY);
  return Math.min(Math.max(product.stock, 1), MAX_LINE_QUANTITY);
}

interface CartState {
  lines: CartLine[];
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (productId, quantity = 1) =>
        set((state) => {
          const max = maxQuantityFor(productId);
          if (max === 0) return state;
          const existing = state.lines.find((line) => line.productId === productId);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.productId === productId
                  ? { ...line, quantity: clamp(line.quantity + quantity, 1, max) }
                  : line,
              ),
            };
          }
          return {
            lines: [...state.lines, { productId, quantity: clamp(quantity, 1, max) }],
          };
        }),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => {
          const max = maxQuantityFor(productId);
          if (max === 0) {
            return { lines: state.lines.filter((line) => line.productId !== productId) };
          }
          return {
            lines: state.lines.map((line) =>
              line.productId === productId
                ? { ...line, quantity: clamp(quantity, 1, max) }
                : line,
            ),
          };
        }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: 'klarwerk.cart.v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export const useCartCount = () =>
  useCartStore((state) => state.lines.reduce((sum, line) => sum + line.quantity, 0));
