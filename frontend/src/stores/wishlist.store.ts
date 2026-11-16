import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => boolean;
  add: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const exists = get().ids.includes(productId);
        set((state) => ({
          ids: exists
            ? state.ids.filter((id) => id !== productId)
            : [productId, ...state.ids],
        }));
        return !exists;
      },
      add: (productId) =>
        set((state) =>
          state.ids.includes(productId) ? state : { ids: [productId, ...state.ids] },
        ),
      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'klarwerk.wishlist.v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useWishlistCount = () => useWishlistStore((state) => state.ids.length);
