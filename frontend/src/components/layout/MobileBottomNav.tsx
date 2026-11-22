import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Home, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHideOnScroll } from '@/hooks/useUi';
import { useCartCount } from '@/stores/cart.store';
import { useWishlistCount } from '@/stores/wishlist.store';
import { useUiStore } from '@/stores/ui.store';

type Tab =
  | { key: string; label: string; icon: any; to: string; count?: number }
  | { key: string; label: string; icon: any; action: 'search' | 'cart'; count?: number };

export function MobileBottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const hidden = useHideOnScroll();
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
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 px-3 transition-[transform,opacity] duration-300 ease-out will-change-transform lg:hidden',
        hidden ? 'pointer-events-none translate-y-[140%] opacity-0' : 'translate-y-0 opacity-100',
      )}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.55rem)' }}
    >
      <ul className="mx-auto grid w-full max-w-[420px] grid-cols-5 items-center gap-0.5 rounded-[24px] border border-white/70 bg-white/75 px-1.5 py-1.5 shadow-[0_18px_50px_-16px_rgba(8,13,24,0.35),0_2px_10px_-2px_rgba(8,13,24,0.08)] ring-1 ring-black/[0.03] backdrop-blur-2xl backdrop-saturate-150">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = 'to' in tab ? isActive(tab.to) : false;
          const content = (
            <>
              <span
                className={cn(
                  'relative flex h-8 w-full items-center justify-center rounded-2xl transition',
                  active
                    ? 'bg-electric-500 text-white shadow-[0_6px_16px_-8px_rgba(88,101,242,0.95)]'
                    : 'text-ink-900/45',
                )}
              >
                <Icon size={19} strokeWidth={1.9} />
                {tab.count ? (
                  <span className="absolute right-1.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-electric-500 px-1 text-[9px] font-bold text-white ring-2 ring-white/90">
                    {tab.count > 9 ? '9+' : tab.count}
                  </span>
                ) : null}
              </span>
              <span
                className={cn(
                  'w-full max-w-full truncate text-center text-[9.5px] font-semibold tracking-tight transition-colors',
                  active ? 'text-electric-600' : 'text-ink-900/45',
                )}
              >
                {tab.label}
              </span>
            </>
          );

          const className =
            'flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-0.5 transition active:scale-95';

          if ('action' in tab && tab.action === 'search') {
            return (
              <li key={tab.key} className="min-w-0">
                <button type="button" onClick={openSearch} className={className} aria-label={tab.label}>
                  {content}
                </button>
              </li>
            );
          }
          if ('action' in tab && tab.action === 'cart') {
            return (
              <li key={tab.key} className="min-w-0">
                <button type="button" onClick={openCart} className={className} aria-label={tab.label}>
                  {content}
                </button>
              </li>
            );
          }
          return (
            <li key={tab.key} className="min-w-0">
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
