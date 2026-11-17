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
  const [menuLeft, setMenuLeft] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const positionMenu = () => {
    const element = menuRef.current;
    if (!element || typeof window === 'undefined') return;
    const width = Math.min(980, window.innerWidth * 0.9);
    setMenuLeft((window.innerWidth - width) / 2 - element.getBoundingClientRect().left);
  };

  const openMenu = () => {
    positionMenu();
    setMenuOpen(true);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onResize = () => positionMenu();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [menuOpen]);

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
      'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-electric-400 after:to-violet-400 after:transition-transform after:duration-300',
      isActive
        ? 'text-white after:scale-x-100'
        : 'text-white/60 hover:text-white hover:after:scale-x-100',
    );

  const featuredCategory = categories.find((category) => category.id === 'headphones') ?? categories[0];

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
          <nav className="hidden items-center gap-6 lg:flex" aria-label={t('nav.menu')}>
            <div
              className="relative"
              ref={menuRef}
              onMouseEnter={openMenu}
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
                onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
              >
                {t('nav.shop')}
                <ChevronDown
                  size={13}
                  className={cn('transition-transform duration-300', menuOpen && 'rotate-180')}
                />
              </button>

              {menuOpen && (
                <div
                  className="absolute top-full w-[min(980px,90vw)] pt-3"
                  style={menuLeft === null ? { left: 0 } : { left: menuLeft }}
                >
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-ink-800/95 p-5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:p-6">
                    <div className="grid gap-5 sm:grid-cols-[1fr_240px]">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-4 px-1">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
                            {t('nav.categories')}
                          </p>
                          <Link
                            to="/shop"
                            className="flex items-center gap-1 text-[11px] font-medium text-electric-300 transition hover:text-white"
                          >
                            {t('nav.allProducts')} <ArrowUpRight size={12} />
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-x-5 gap-y-0.5 sm:grid-cols-3">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              to={`/shop?category=${category.id}`}
                              className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition hover:bg-white/[0.06]"
                            >
                              <span
                                className="h-1.5 w-1.5 shrink-0 rounded-full transition-transform group-hover:scale-150"
                                style={{ backgroundColor: category.accent }}
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[12px] font-medium text-white/85">
                                  {category.name[locale]}
                                </span>
                                <span className="block text-[10px] text-white/35">
                                  {t('filters.results', { count: getCategoryCount(category.id) })}
                                </span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <Link
                        to={`/shop?category=${featuredCategory.id}`}
                        className="group relative hidden overflow-hidden rounded-2xl border border-white/10 sm:block"
                      >
                        <img
                          src={featuredCategory.image}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                        <span className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-transparent" />
                        <span className="absolute inset-x-0 bottom-0 p-4">
                          <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-electric-300">
                            {t('nav.inFocus')}
                          </span>
                          <span className="mt-1 block font-display text-lg font-semibold tracking-[-0.02em] text-white">
                            {featuredCategory.name[locale]}
                          </span>
                          <span className="mt-1 block text-[10px] leading-relaxed text-white/50">
                            {featuredCategory.description[locale]}
                          </span>
                          <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-white/80">
                            {t('nav.discover')} <ArrowUpRight size={12} />
                          </span>
                        </span>
                      </Link>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
                      <p className="text-[10px] text-white/30">{t('demo.notice')}</p>
                      <div className="flex items-center gap-3">
                        <Link
                          to="/wallpapers"
                          className="text-[11px] text-white/45 transition hover:text-white"
                        >
                          {t('nav.wallpapers')}
                        </Link>
                        <Link
                          to="/learn"
                          className="text-[11px] text-white/45 transition hover:text-white"
                        >
                          {t('nav.learn')}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/shop?sort=newest" className={navClass}>
              {t('nav.new')}
            </NavLink>
            <NavLink to="/learn" className={navClass}>
              {t('nav.learn')}
            </NavLink>
            <NavLink to="/magazine" className={navClass}>
              {t('nav.magazine')}
            </NavLink>
            <NavLink
              to="/advisor"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition',
                  isActive
                    ? 'border-violet-300/45 bg-violet-500/20 text-white'
                    : 'border-violet-400/25 bg-violet-500/10 text-violet-200 hover:border-violet-300/45 hover:bg-violet-500/20 hover:text-white',
                )
              }
            >
              <Sparkles size={12} />
              {t('nav.advisor')}
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

          <LanguageSwitcher showIcon={false} className="flex sm:hidden" />
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
