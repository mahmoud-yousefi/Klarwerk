import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Check,
  Mail,
  MapPin,
  Package,
  Receipt,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { getDemoOrder } from '@/services/checkout.service';
import { formatDate, formatPrice } from '@/lib/utils';
import type { Locale } from '@/types/catalog';

export default function ConfirmationPage() {
  const { id = '' } = useParams();
  const { t, i18n } = useTranslation();
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const order = getDemoOrder(id);

  if (!order) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon={<ShoppingBag size={24} />}
          title={t('checkout:confirmation.emptyTitle')}
          text={t('checkout:confirmation.emptyText')}
          action={
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
            >
              {t('checkout:confirmation.backToShop')} <ArrowRight size={14} />
            </Link>
          }
        />
      </div>
    );
  }

  const customer = order.customer;

  return (
    <div className="bg-mist">
      <div className="container-x py-10 sm:py-14">
        <Breadcrumbs
          items={[
            { label: t('common:product.breadcrumbHome'), to: '/' },
            { label: t('checkout:meta.title'), to: '/checkout' },
            { label: t('checkout:confirmation.demoBadge') },
          ]}
          className="mb-8"
        />

        <div className="mx-auto max-w-3xl">
          <div className="relative overflow-hidden rounded-4xl bg-ink-900 p-8 text-white sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-electric-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                  <Check size={22} />
                </span>
                <span className="rounded-full border border-white/15 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  {t('checkout:confirmation.demoBadge')}
                </span>
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl">
                {t('checkout:confirmation.title', {
                  name: customer.firstName || customer.lastName || '–',
                })}
              </h1>
              <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/50">
                {t('checkout:confirmation.subtitle')}
              </p>

              <div className="mt-7 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">
                    {t('checkout:confirmation.orderNumber')}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold tracking-[-0.01em]">
                    {order.id}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">
                    {t('checkout:confirmation.orderDate', {
                      date: formatDate(order.createdAt, locale),
                    })}
                  </p>
                  <p className="mt-1 text-[12px] text-white/60">
                    {order.shippingLabel} · {order.paymentLabel}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">
                    {t('checkout:confirmation.total')}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold tabular-nums">
                    {formatPrice(order.total, locale)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-2xl border border-ink-900/8 bg-white px-4 py-3 text-[11px] leading-relaxed text-ink-900/50">
            <Mail size={14} className="mt-0.5 shrink-0 text-ink-900/35" />
            {t('checkout:confirmation.emailSent', { email: customer.email })}
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-ink-900/8 bg-white p-6">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-[-0.02em]">
                <Package size={17} className="text-ink-900/40" />
                {t('checkout:confirmation.summary')}
              </h2>

              <ul className="mt-4 divide-y divide-ink-900/6">
                {order.items.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 py-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium">{item.name}</p>
                      <p className="text-[10px] text-ink-900/40">
                        {t('common:cart.quantity')}: {item.quantity}
                      </p>
                    </div>
                    <span className="text-[12px] font-medium tabular-nums">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-2 border-t border-ink-900/8 pt-4 text-[12px]">
                <div className="flex justify-between text-ink-900/55">
                  <span>{t('checkout:confirmation.subtotal')}</span>
                  <span className="tabular-nums">{formatPrice(order.subtotal, locale)}</span>
                </div>
                <div className="flex justify-between text-ink-900/55">
                  <span>{t('checkout:confirmation.shipping')}</span>
                  <span className="tabular-nums">
                    {order.shipping === 0
                      ? t('common:cart.free')
                      : formatPrice(order.shipping, locale)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-ink-900/8 pt-2.5 text-[15px] font-semibold">
                  <span>{t('checkout:confirmation.total')}</span>
                  <span className="tabular-nums">{formatPrice(order.total, locale)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-ink-900/8 bg-white p-5">
                <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-900/40">
                  <MapPin size={13} /> {t('checkout:confirmation.deliveryTo')}
                </h3>
                <div className="mt-2.5 space-y-0.5 text-[12px] leading-relaxed text-ink-900/60">
                  <p className="font-medium text-ink-900">
                    {customer.firstName} {customer.lastName}
                  </p>
                  {customer.company && <p>{customer.company}</p>}
                  <p>
                    {customer.street} {customer.houseNumber}
                  </p>
                  <p>
                    {customer.postalCode} {customer.city}
                  </p>
                  <p>{customer.country}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-ink-900/8 bg-white p-5">
                <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-900/40">
                  <Receipt size={13} /> {t('checkout:confirmation.payment')}
                </h3>
                <p className="mt-2.5 text-[12px] font-medium">{order.paymentLabel}</p>
                <p className="mt-1 text-[10px] text-ink-900/35">
                  {t('checkout:payment.securityNote')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-ink-900/8 bg-white p-6">
            <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
              {t('checkout:confirmation.nextTitle')}
            </h2>
            <ol className="mt-4 space-y-3">
              {[
                t('checkout:confirmation.next1'),
                t('checkout:confirmation.next2'),
                t('checkout:confirmation.next3'),
              ].map((text, index) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900/[0.055] text-[10px] font-semibold text-ink-900/50">
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-[12px] leading-relaxed text-ink-900/55">{text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-7 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-[11px] text-ink-900/40">{t('checkout:confirmation.support')}</p>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/advisor"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-ink-900/12 bg-white px-5 text-[12px] font-medium text-ink-900/70 transition hover:border-ink-900/30 hover:text-ink-900"
              >
                <Sparkles size={13} className="text-violet-500" />
                {t('common:nav.advisor')}
              </Link>
              <Link
                to="/shop"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[12px] font-medium text-white transition hover:bg-ink-800"
              >
                {t('checkout:confirmation.continueShopping')} <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
