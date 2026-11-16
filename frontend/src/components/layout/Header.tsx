import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Heart,
  Search,
  ShoppingBag,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { categories, getCategoryCount } from '@/lib/catalog';
import { cn } from '@/lib/utils';
import { useCartCount } from '@/stores/cart.store';
import { useWishlistCount } from '@/stores/wishlist.store';
import { useUiStore } from '@/stores/ui.store';
import { useScrolled } from '@/hooks/useUi';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const scrolled = useScrolled(20);
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const { openCart, openSearch } = useUiStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'relative py-2 text-[13px] font-medium tracking-[-0.01em] transition',
      isActive ? 'text-white' : 'text-white/60 hover:text-white',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-white/8 bg-ink-900/95 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl'
          : 'border-white/10 bg-ink-900/75 shadow-[0_8px_30px_-24px_rgba(0,0,0,0.5)] backdrop-blur-lg',
      )}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <div className="flex items-center gap-10">
          <Logo variant="light" />
          <nav className="hidden items-center gap-7 lg:flex" aria-label={t('nav.menu')}>
            <div
              className="relative"
              ref={menuRef}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1 py-2 text-[13px] font-medium transition',
                  menuOpen ? 'text-white' : 'text-white/60 hover:text-white',
                )}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {t('nav.shop')}
                <ChevronDown
                  size={13}
                  className={cn('transition-transform duration-300', menuOpen && 'rotate-180')}
                />
              </button>

              {menuOpen && (
                <div className="absolute left-1/2 top-full w-[min(860px,84vw)] -translate-x-1/2 pt-3">
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-800/95 p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-1">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/shop?category=${category.id}`}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.06]"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-150"
                            style={{ backgroundColor: category.accent }}
                          />
                          <span className="flex-1">
                            <span className="block text-[13px] font-medium text-white/85">
                              {category.name[locale]}
                            </span>
                            <span className="block text-[11px] text-white/35">
                              {t('filters.results', { count: getCategoryCount(category.id) })}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                      <p className="text-[11px] text-white/35">{t('demo.notice')}</p>
                      <Link
                        to="/shop"
                        className="flex items-center gap-1 text-[12px] font-medium text-electric-300 transition hover:text-white"
                      >
                        {t('nav.allProducts')} <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/shop?sort=newest" className={navClass}>
              {t('nav.new')}
            </NavLink>
            <NavLink to="/magazine" className={navClass}>
              {t('nav.magazine')}
            </NavLink>
            <NavLink to="/advisor" className={navClass}>
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-violet-300" />
                {t('nav.advisor')}
              </span>
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={openSearch}
            className="hidden h-9 items-center gap-2 rounded-full border border-white/12 px-3 text-[12px] text-white/50 transition hover:border-white/25 hover:text-white sm:flex"
            aria-label={t('search.open')}
          >
            <Search size={14} />
            <span className="hidden xl:inline">{t('search.placeholder')}</span>
            <kbd className="hidden rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/40 xl:inline">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={openSearch}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/65 transition hover:bg-white/8 hover:text-white sm:hidden"
            aria-label={t('search.open')}
          >
            <Search size={18} />
          </button>

          <LanguageSwitcher className="hidden sm:flex" />

          <Link
            to="/wishlist"
            className="relative hidden h-9 w-9 items-center justify-center rounded-full text-white/65 transition hover:bg-white/8 hover:text-white sm:flex"
            aria-label={t('nav.wishlist')}
          >
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative flex h-9 items-center gap-2 rounded-full bg-white/[0.07] px-3 text-white/80 transition hover:bg-white/[0.12] hover:text-white"
            aria-label={t('misc.cartOpen')}
          >
            <ShoppingBag size={16} />
            <span className="hidden text-[12px] font-medium sm:inline">{t('nav.cart')}</span>
            {cartCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-electric-500 px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
