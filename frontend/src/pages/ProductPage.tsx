import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Check,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';

import { EmptyState } from '@/components/ui/EmptyState';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { ProductGallery } from '@/components/product/ProductGallery';
import { AvailabilityBadge } from '@/components/product/AvailabilityBadge';
import { WishlistButton } from '@/components/product/WishlistButton';
import { CompareButton } from '@/components/product/CompareButton';
import { SpecsTable } from '@/components/product/SpecsTable';
import { ReviewSummary } from '@/components/product/ReviewSummary';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getProduct, getRelatedProducts } from '@/lib/catalog';
import { useProductActions } from '@/hooks/useProductActions';
import { maxQuantityFor } from '@/stores/cart.store';
import { formatPrice, intlLocale } from '@/lib/utils';
import type { Locale } from '@/types/catalog';
import site from '@/data/site.json';

export default function ProductPage() {
  const { slug = '' } = useParams();
  const { t, i18n } = useTranslation();
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const product = getProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useProductActions();

  useEffect(() => {
    setQuantity(1);
  }, [slug]);

  if (!product) {
    return (
      <div className="container-x py-20">
        <EmptyState
          title={t('errors.productNotFound')}
          text={t('errors.productNotFoundText')}
          action={
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
            >
              {t('errors.toShop')} <ArrowRight size={14} />
            </Link>
          }
        />
      </div>
    );
  }

  const maxQty = maxQuantityFor(product.id);
  const soldOut = product.availability === 'out_of_stock';
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const related = getRelatedProducts(product, 4);
  const shippingDays = site.shippingMethods[0].days[locale];
  const advisorHref = `/advisor?q=${encodeURIComponent(
    locale === 'de'
      ? `Passt der ${product.name} zu meinem Alltag? Vergleiche ihn mit einer Alternative.`
      : `Does the ${product.name} fit my everyday? Compare it with an alternative.`,
  )}`;

  const detailRows = [
    { label: t('product.brand'), value: product.brand },
    { label: t('product.color'), value: product.color },
    { label: t('product.year'), value: String(product.releaseYear) },
    { label: t('product.sku'), value: product.sku },
  ];

  return (
    <div className="bg-white">
      <div className="container-x pb-16 pt-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-1.5"
        >
          <Link to="/" className="text-[11px] text-ink-900/45 transition hover:text-ink-900">
            {t('product.breadcrumbHome')}
          </Link>
          <ChevronRight size={11} className="text-ink-900/25" />
          <Link to="/shop" className="text-[11px] text-ink-900/45 transition hover:text-ink-900">
            {t('product.breadcrumbShop')}
          </Link>
          <ChevronRight size={11} className="text-ink-900/25" />
          <Link
            to={`/shop?category=${product.category}`}
            className="text-[11px] text-ink-900/45 transition hover:text-ink-900"
          >
            {t(`categories.${product.category}`, { defaultValue: product.category })}
          </Link>
          <ChevronRight size={11} className="text-ink-900/25" />
          <span className="text-[11px] text-ink-900/70">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <div>
            <ProductGallery
              images={product.images}
              name={product.name}
              isNew={product.isNew}
              discount={discount}
            />

            <div className="mt-10 hidden lg:block">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                {t('store:productPage.highlightsTitle')}
              </h2>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {product.highlights.map((highlight) => (
                  <li
                    key={highlight[locale]}
                    className="flex items-start gap-2.5 rounded-xl bg-mist p-3 text-[12px] leading-relaxed text-ink-900/65"
                  >
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                    {highlight[locale]}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-900/40">
              {product.brand}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Rating value={product.rating} count={product.reviewCount} />
              <a
                href="#reviews"
                className="text-[11px] text-ink-900/45 underline decoration-ink-900/15 underline-offset-4 transition hover:text-ink-900"
              >
                {t('store:productPage.reviewsTitle')}
              </a>
            </div>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-900/55">
              {product.tagline[locale]}
            </p>

            <div className="mt-7 rounded-3xl border border-ink-900/8 bg-mist p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <Price
                    price={product.price}
                    originalPrice={product.originalPrice}
                    size="xl"
                  />
                  <p className="mt-1.5 text-[10px] text-ink-900/40">
                    {t('product.inclVat')} · {t('product.exclShipping')}
                  </p>
                </div>
                {discount > 0 && (
                  <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                    −{discount} %
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-ink-900/8 pt-4">
                <AvailabilityBadge availability={product.availability} />
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="text-[10px] text-ink-900/40">
                    {t('product.stockLeft', { count: product.stock })}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <QuantityStepper
                  value={quantity}
                  min={1}
                  max={Math.max(1, Math.min(maxQty, 10))}
                  onChange={setQuantity}
                />
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => addToCart(product, quantity)}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-electric-500 px-5 text-[13px] font-semibold text-white shadow-[0_16px_36px_-18px_rgba(88,101,242,0.9)] transition hover:bg-electric-400 disabled:pointer-events-none disabled:opacity-40"
                >
                  {soldOut ? t('availability.out_of_stock') : t('actions.addToCart')}
                  {!soldOut && <ArrowRight size={14} />}
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <WishlistButton
                  product={product}
                  variant="plain"
                  withLabel
                  className="flex-1 justify-center text-[12px]"
                />
                <CompareButton
                  product={product}
                  variant="outline"
                  className="flex-1 justify-center text-[12px]"
                />
              </div>

              <p className="mt-3 text-center text-[10px] text-ink-900/35">
                {t('store:productPage.addToCartNote')} · {t('store:productPage.demoNote')}
              </p>
            </div>

            <ul className="mt-6 space-y-3">
              {[
                {
                  icon: Truck,
                  title: t('product.trustShipping'),
                  text: t('product.trustShippingText'),
                  meta: `${t('product.delivery')}: ${shippingDays}`,
                },
                {
                  icon: RotateCcw,
                  title: t('product.trustReturns'),
                  text: t('product.trustReturnsText'),
                  meta: `${site.returnDays} ${t('misc.days')}`,
                },
                {
                  icon: ShieldCheck,
                  title: t('product.trustWarranty'),
                  text: t('product.trustWarrantyText'),
                  meta: t('product.warrantyValue', { count: product.warrantyYears }),
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-900/[0.045] text-ink-900/50">
                    <item.icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[12px] font-medium">{item.title}</p>
                      <span className="text-[10px] text-ink-900/35">{item.meta}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-ink-900/45">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              to={advisorHref}
              className="mt-6 flex items-start gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.055] p-4 transition hover:border-violet-500/35 hover:bg-violet-500/[0.09]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-600">
                <Sparkles size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12px] font-semibold">
                  {t('product.askAdvisorTitle')}
                </span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-ink-900/50">
                  {t('product.askAdvisorText')}
                </span>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-violet-600">
                  {t('product.askAdvisorCta')} <ArrowRight size={11} />
                </span>
              </span>
            </Link>

            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-2 border-t border-ink-900/8 pt-4">
              {detailRows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-2">
                  <dt className="text-[10px] uppercase tracking-[0.08em] text-ink-900/35">
                    {row.label}
                  </dt>
                  <dd className="truncate text-[11px] font-medium text-ink-900/70">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 grid gap-10 border-t border-ink-900/8 pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
              {t('store:productPage.descriptionTitle')}
            </h2>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-900/60">
              {product.description[locale]}
            </p>

            <div className="mt-8 lg:hidden">
              <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">
                {t('store:productPage.highlightsTitle')}
              </h3>
              <ul className="mt-3 space-y-2">
                {product.highlights.map((highlight) => (
                  <li
                    key={highlight[locale]}
                    className="flex items-start gap-2.5 text-[12px] leading-relaxed text-ink-900/60"
                  >
                    <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                    {highlight[locale]}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
              {t('store:productPage.specsTitle')}
            </h2>
            <SpecsTable specs={product.specs} className="mt-4" />
            <p className="mt-4 text-[10px] text-ink-900/35">{t('product.specsNote')}</p>
          </div>
        </div>

        <section id="reviews" className="mt-14 scroll-mt-24 border-t border-ink-900/8 pt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
                {t('store:productPage.reviewsTitle')}
              </h2>
              <p className="mt-1 text-[11px] text-ink-900/40">
                {t('store:productPage.reviewDemo')}
              </p>
            </div>
            <span className="text-[12px] text-ink-900/45">
              {t('store:productPage.reviewSummary', {
                rating: new Intl.NumberFormat(intlLocale(locale), {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                }).format(product.rating),
              })}{' '}
              · {t('store:productPage.reviewCount', { count: product.reviewCount })}
            </span>
          </div>
          <div className="mt-6">
            <ReviewSummary product={product} />
          </div>
        </section>

        <section className="mt-14 border-t border-ink-900/8 pt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
              {t('store:productPage.relatedTitle')}
            </h2>
            <Link
              to={`/shop?category=${product.category}`}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-electric-600"
            >
              {t('nav.viewAll')} <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-6">
            {related.length ? (
              <ProductGrid products={related} className="lg:grid-cols-4" />
            ) : (
              <EmptyState title={t('store:productPage.relatedEmpty')} />
            )}
          </div>
        </section>

        <p className="mt-12 text-[10px] leading-relaxed text-ink-900/30">
          {t('store:productPage.demoNote')} {t('product.specsNote')}{' '}
          {t('product.freeFrom', { amount: formatPrice(site.freeShippingFrom, locale) })}.
        </p>
      </div>
    </div>
  );
}
