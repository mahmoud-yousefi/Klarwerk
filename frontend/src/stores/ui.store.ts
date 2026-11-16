import { create } from 'zustand';

interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  closeAll: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  openCart: () => set({ cartOpen: true, searchOpen: false, mobileMenuOpen: false }),
  closeCart: () => set({ cartOpen: false }),
  openSearch: () => set({ searchOpen: true, cartOpen: false, mobileMenuOpen: false }),
  closeSearch: () => set({ searchOpen: false }),
  openMobileMenu: () => set({ mobileMenuOpen: true, cartOpen: false, searchOpen: false }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  closeAll: () => set({ cartOpen: false, searchOpen: false, mobileMenuOpen: false }),
}));
