import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useCartDetails } from '@/hooks/useCart';
import { maxQuantityFor, useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/lib/utils';
import site from '@/data/site.json';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const { lines, subtotal, count, standardShipping } = useCartDetails();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const remaining = Math.max(0, site.freeShippingFrom - subtotal);
  const progress = Math.min(100, (subtotal / site.freeShippingFrom) * 100);
  const total = subtotal + standardShipping;

  if (lines.length === 0) {
    return (
      <div className="container-x py-12 sm:py-16">
        <Breadcrumbs
          items={[
            { label: t('product.breadcrumbHome'), to: '/' },
            { label: t('cart.title') },
          ]}
          className="mb-8"
        />
        <EmptyState
          icon={<ShoppingBag size={24} />}
          title={t('store:cartPage.emptyTitle')}
          text={t('store:cartPage.emptyText')}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/shop"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
              >
                {t('cart.emptyCta')} <ArrowRight size={14} />
              </Link>
              <Link
                to="/advisor"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-ink-900/12 px-5 text-[13px] font-medium text-ink-900/70 transition hover:border-ink-900/30 hover:text-ink-900"
              >
                <Sparkles size={14} className="text-violet-500" />
                {t('store:cartPage.advisor')}
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-mist">
      <div className="container-x py-10 sm:py-12">
        <Breadcrumbs
          items={[
            { label: t('product.breadcrumbHome'), to: '/' },
            { label: t('cart.title') },
          ]}
          className="mb-6"
        />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              {t('store:cartPage.title')}
            </h1>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-900/50">
              {t('store:cartPage.subtitle')}
            </p>
          </div>
          <p className="text-[12px] text-ink-900/45">
            {count === 1 ? t('cart.oneItem') : t('cart.items', { count })}
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.55fr_0.85fr] lg:items-start">
          <div className="overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
            <div className="hidden grid-cols-[1fr_auto_auto] gap-4 border-b border-ink-900/8 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900/35 sm:grid">
              <span>{t('store:cartPage.itemsTitle')}</span>
              <span className="w-32 text-center">{t('cart.quantity')}</span>
              <span className="w-20 text-right">{t('cart.total')}</span>
            </div>

            <ul className="divide-y divide-ink-900/6">
              {lines.map(({ product, quantity, lineTotal }) => (
                <li
                  key={product.id}
                  className="grid gap-4 px-5 py-5 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                >
                  <div className="flex gap-4">
                    <Link
                      to={`/product/${product.slug}`}
                      className="shrink-0 overflow-hidden rounded-xl bg-[#EDF0F6]"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-20 w-20 object-cover transition duration-500 hover:scale-105"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.12em] text-ink-900/35">
                        {product.brand}
                      </p>
                      <Link
                        to={`/product/${product.slug}`}
                        className="mt-0.5 block text-[14px] font-medium leading-snug hover:text-electric-600"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-[11px] text-ink-900/40">
                        {product.tagline[locale]}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-ink-900/35">
                        <span>{t(`availability.${product.availability}`)}</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatPrice(product.price, locale)} / {t('misc.quantityShort')}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-[10px] text-ink-900/35 transition hover:text-rose-500"
                      >
                        <Trash2 size={11} />
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>

                  <div className="flex sm:block">
                    <QuantityStepper
                      size="sm"
                      value={quantity}
                      max={Math.max(1, maxQuantityFor(product.id))}
                      onChange={(value) => setQuantity(product.id, value)}
                    />
                  </div>

                  <div className="text-right sm:w-20">
                    <p className="text-[14px] font-semibold tabular-nums">
                      {formatPrice(lineTotal, locale)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/8 bg-mist/60 px-5 py-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-900/55 transition hover:text-ink-900"
              >
                <ArrowLeft size={12} />
                {t('cart.continueShopping')}
              </Link>
              <button
                type="button"
                onClick={clear}
                className="text-[10px] text-ink-900/35 underline decoration-ink-900/15 underline-offset-4 transition hover:text-rose-500"
              >
                {t('store:cartPage.clearCart')}
              </button>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-3xl border border-ink-900/8 bg-white p-6">
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                {t('cart.summary')}
              </h2>

              <div className="mt-5 space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between text-ink-900/55">
                  <span>{t('cart.subtotal')}</span>
                  <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
                </div>
                <div className="flex items-center justify-between text-ink-900/55">
                  <span>{t('cart.shipping')}</span>
                  <span className="tabular-nums">
                    {standardShipping === 0
                      ? t('cart.free')
                      : formatPrice(standardShipping, locale)}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-t border-ink-900/8 pt-3 text-[16px] font-semibold">
                  <span>{t('cart.total')}</span>
                  <span className="tabular-nums">{formatPrice(total, locale)}</span>
                </div>
                <p className="text-[10px] text-ink-900/35">{t('cart.taxesNote')}</p>
              </div>

              {remaining > 0 ? (
                <div className="mt-5 rounded-xl bg-mist p-3">
                  <p className="text-[10px] text-ink-900/50">
                    {t('cart.shippingNote', { amount: formatPrice(remaining, locale) })}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-900/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-electric-500 to-violet-500 transition-[width] duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-emerald-50 px-3 py-2 text-[10px] font-medium text-emerald-700">
                  {t('cart.shippingFree')}
                </p>
              )}

              <Link
                to="/checkout"
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-electric-500 text-sm font-semibold text-white shadow-[0_16px_36px_-16px_rgba(88,101,242,0.9)] transition hover:bg-electric-400"
              >
                {t('cart.checkout')} <ArrowRight size={15} />
              </Link>
              <p className="mt-2 text-center text-[10px] text-ink-900/35">
                {t('cart.demoNote')}
              </p>

              <ul className="mt-5 space-y-2 border-t border-ink-900/8 pt-4">
                {[
                  { icon: Truck, text: t('store:cartPage.deliveryValue') },
                  { icon: RotateCcw, text: `${site.returnDays} ${t('misc.days')} ${t('store:cartPage.returns')}` },
                  { icon: ShieldCheck, text: t('store:cartPage.secure') },
                ].map((item) => (
                  <li
                    key={item.text}
                    className="flex items-center gap-2 text-[11px] text-ink-900/45"
                  >
                    <item.icon size={13} className="text-ink-900/30" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/advisor"
              className="mt-4 flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-white p-4 transition hover:border-violet-500/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
                <Sparkles size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium">
                  {t('store:cartPage.question')}
                </span>
                <span className="mt-0.5 block text-[10px] text-ink-900/40">
                  {t('store:cartPage.advisor')}
                </span>
              </span>
              <ArrowRight size={13} className="text-ink-900/25" />
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
