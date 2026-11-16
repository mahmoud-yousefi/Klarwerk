import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  ids: string[];
  toggle: (productId: string) => 'added' | 'removed' | 'limit';
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const { ids } = get();
        if (ids.includes(productId)) {
          set({ ids: ids.filter((id) => id !== productId) });
          return 'removed';
        }
        if (ids.length >= MAX_COMPARE_ITEMS) return 'limit';
        set({ ids: [...ids, productId] });
        return 'added';
      },
      remove: (productId) => set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
    }),
    {
      name: 'klarwerk.compare.v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export const useCompareCount = () => useCompareStore((state) => state.ids.length);
