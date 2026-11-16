import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Home, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartCount } from '@/stores/cart.store';
import { useWishlistCount } from '@/stores/wishlist.store';
import { useUiStore } from '@/stores/ui.store';

type Tab =
  | { key: string; label: string; icon: any; to: string; count?: number }
  | { key: string; label: string; icon: any; action: 'search' | 'cart'; count?: number };

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const { openSearch, openCart } = useUiStore();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  const isActive = (path: string) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const tabs: Tab[] = [
    { key: 'home', label: t('nav.home'), icon: Home, to: '/' },
    { key: 'shop', label: t('nav.shop'), icon: Sparkles, to: '/shop' },
    { key: 'search', label: t('nav.search'), icon: Search, action: 'search' },
    { key: 'wishlist', label: t('nav.wishlist'), icon: Heart, to: '/wishlist', count: wishlistCount },
    { key: 'cart', label: t('nav.cart'), icon: ShoppingBag, action: 'cart', count: cartCount },
  ];

  return (
    <nav
      aria-label={t('nav.menu')}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/70 px-2 pt-2 backdrop-blur-xl backdrop-saturate-150 shadow-[0_-12px_40px_-18px_rgba(8,13,24,0.25)] lg:hidden"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
    >
      <ul className="flex items-stretch justify-around gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = 'to' in tab ? isActive(tab.to) : false;
          const content = (
            <>
              <span
                className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-2xl transition',
                  active ? 'bg-electric-500/12 text-electric-600' : 'text-ink-900/45',
                )}
              >
                <Icon size={20} strokeWidth={1.8} />
                {tab.count ? (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-electric-500 px-1 text-[9px] font-bold text-white">
                    {tab.count > 9 ? '9+' : tab.count}
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium tracking-tight',
                  active ? 'text-electric-600' : 'text-ink-900/45',
                )}
              >
                {tab.label}
              </span>
            </>
          );

          const className = 'flex flex-1 flex-col items-center gap-0.5 py-1';

          if ('action' in tab && tab.action === 'search') {
            return (
              <li key={tab.key} className="flex-1">
                <button type="button" onClick={openSearch} className={className} aria-label={tab.label}>
                  {content}
                </button>
              </li>
            );
          }
          if ('action' in tab && tab.action === 'cart') {
            return (
              <li key={tab.key} className="flex-1">
                <button type="button" onClick={openCart} className={className} aria-label={tab.label}>
                  {content}
                </button>
              </li>
            );
          }
          return (
            <li key={tab.key} className="flex-1">
              <Link to={'to' in tab ? tab.to : '/'} className={className} aria-current={active ? 'page' : undefined}>
                {content}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
