import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { categories, getCategoryCount } from '@/lib/catalog';
import { Drawer } from '@/components/ui/Drawer';
import { useUiStore } from '@/stores/ui.store';
import { useCartCount } from '@/stores/cart.store';
import { useWishlistCount } from '@/stores/wishlist.store';
import { LanguageSwitcher } from './LanguageSwitcher';

export function MobileMenu() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const { mobileMenuOpen, closeMobileMenu } = useUiStore();
  const location = useLocation();
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname, location.search, closeMobileMenu]);

  const links = [
    { to: '/shop', label: t('nav.allProducts') },
    { to: '/shop?sort=newest', label: t('nav.new') },
    { to: '/magazine', label: t('nav.magazine') },
    { to: '/advisor', label: t('nav.advisor'), highlight: true },
  ];

  return (
    <Drawer
      open={mobileMenuOpen}
      onClose={closeMobileMenu}
      title={t('nav.menu')}
      side="left"
      className="max-w-[92vw] bg-mist sm:max-w-sm"
      ariaLabel={t('nav.menu')}
    >
      <div className="flex h-full flex-col">
        <div className="space-y-1 px-4 py-5">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 transition hover:bg-white"
            >
              <span className="flex items-center gap-2.5 font-display text-lg font-medium tracking-tight">
                {link.highlight && <Sparkles size={16} className="text-violet-500" />}
                {link.label}
              </span>
              <ArrowRight size={16} className="text-ink-900/25" />
            </Link>
          ))}
        </div>

        <div className="border-y border-ink-900/8 px-5 py-5">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-900/40">
            {t('nav.categories')}
          </h3>
          <div className="grid grid-cols-2 gap-1">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.id}`}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-ink-900/70 transition hover:bg-white hover:text-ink-900"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: category.accent }}
                />
                {category.name[locale]}
                <span className="ml-auto text-[10px] tabular-nums text-ink-900/30">
                  {getCategoryCount(category.id)}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-auto space-y-3 p-5">
          <Link
            to="/wishlist"
            className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-ink-900/70 transition hover:text-ink-900"
          >
            <Heart size={16} /> {t('nav.wishlist')}
            {wishlistCount > 0 && (
              <span className="ml-auto rounded-full bg-ink-900/8 px-2 py-0.5 text-[11px]">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-ink-900/70 transition hover:text-ink-900"
          >
            <ShoppingBag size={16} /> {t('nav.cart')}
            {cartCount > 0 && (
              <span className="ml-auto rounded-full bg-ink-900/8 px-2 py-0.5 text-[11px]">
                {cartCount}
              </span>
            )}
          </Link>
          <div className="flex items-center justify-between border-t border-ink-900/8 pt-4">
            <span className="text-[11px] uppercase tracking-[0.14em] text-ink-900/35">
              {t('misc.language')}
            </span>
            <LanguageSwitcher variant="light" />
          </div>
          <p className="text-[10px] leading-relaxed text-ink-900/35">{t('demo.notice')}</p>
        </div>
      </div>
    </Drawer>
  );
}
