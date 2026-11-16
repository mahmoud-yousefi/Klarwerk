import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Heart,
  Share2,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { AvailabilityBadge } from '@/components/product/AvailabilityBadge';
import { getProductById } from '@/lib/catalog';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useCartStore } from '@/stores/cart.store';
import { useToastStore } from '@/stores/toast.store';
import type { Product } from '@/types/catalog';

export default function WishlistPage() {
  const { t, i18n } = useTranslation(['common', 'store']);
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const ids = useWishlistStore((state) => state.ids);
  const remove = useWishlistStore((state) => state.remove);
  const addToCart = useCartStore((state) => state.add);
  const push = useToastStore((state) => state.push);
  const products = ids
    .map((id) => getProductById(id))
    .filter((product): product is Product => Boolean(product));

  const addAll = () => {
    products
      .filter((product) => product.availability !== 'out_of_stock')
      .forEach((product) => addToCart(product.id, 1));
    push(t('toast.addedToCart', { name: t('wishlist.title') }), 'success');
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      push(t('toast.linkCopied'), 'info');
    } catch {
      push(t('errors.generic'), 'error');
    }
  };

  return (
    <div className="bg-mist">
      <div className="container-x py-10 sm:py-12">
        <Breadcrumbs
          items={[
            { label: t('product.breadcrumbHome'), to: '/' },
            { label: t('store:wishlistPage.title') },
          ]}
          className="mb-6"
        />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              {t('store:wishlistPage.title')}
            </h1>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-900/50">
              {t('store:wishlistPage.subtitle')}
            </p>
          </div>
          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-[10px] text-ink-900/45">
                {t('wishlist.count', { count: products.length })}
              </span>
              <button
                type="button"
                onClick={share}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-3.5 text-[11px] font-medium text-ink-900/60 transition hover:border-ink-900/30 hover:text-ink-900"
              >
                <Share2 size={12} /> {t('store:wishlistPage.share')}
              </button>
              <button
                type="button"
                onClick={addAll}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink-900 px-4 text-[11px] font-medium text-white transition hover:bg-ink-800"
              >
                <ShoppingBag size={12} /> {t('store:wishlistPage.addAll')}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8">
          {products.length === 0 ? (
            <EmptyState
              icon={<Heart size={24} />}
              title={t('store:wishlistPage.emptyTitle')}
              text={t('store:wishlistPage.emptyText')}
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
                  >
                    {t('wishlist.emptyCta')} <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/advisor"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-ink-900/12 px-5 text-[13px] font-medium text-ink-900/70 transition hover:border-ink-900/30 hover:text-ink-900"
                  >
                    <Sparkles size={14} className="text-violet-500" />
                    {t('nav.advisor')}
                  </Link>
                </div>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-ink-900/8 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative overflow-hidden bg-[#EDF0F6]">
                    <Link to={`/product/${product.slug}`} className="block aspect-[4/3]">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        remove(product.id);
                        push(t('toast.removedFromWishlist'), 'info');
                      }}
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-soft backdrop-blur transition hover:bg-white"
                      aria-label={t('store:wishlistPage.remove')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/35">
                        {product.brand}
                      </p>
                      <Rating value={product.rating} showValue={false} />
                    </div>
                    <h2 className="mt-1 text-[14px] font-medium leading-snug">
                      <Link
                        to={`/product/${product.slug}`}
                        className="transition hover:text-electric-600"
                      >
                        {product.name}
                      </Link>
                    </h2>
                    <p className="mt-1 line-clamp-1 text-[11px] text-ink-900/40">
                      {product.tagline[locale]}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <Price price={product.price} originalPrice={product.originalPrice} />
                    </div>
                    <div className="mt-1.5">
                      <AvailabilityBadge availability={product.availability} />
                    </div>

                    <div className="mt-3.5 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={product.availability === 'out_of_stock'}
                        onClick={() => {
                          addToCart(product.id, 1);
                          push(t('toast.addedToCart', { name: product.name }), 'success');
                        }}
                        className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 text-[11px] font-medium text-white transition hover:bg-ink-800 disabled:pointer-events-none disabled:opacity-40"
                      >
                        <ShoppingBag size={12} />
                        {t('wishlist.moveToCart')}
                      </button>
                      <Link
                        to={`/product/${product.slug}`}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-900/12 text-ink-900/50 transition hover:border-ink-900/30 hover:text-ink-900"
                        aria-label={t('actions.viewProduct')}
                      >
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
