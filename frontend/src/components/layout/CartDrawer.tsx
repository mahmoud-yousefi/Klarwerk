import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Check,
  Leaf,
  Lock,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
} from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useUiStore } from '@/stores/ui.store';
import { useCartDetails } from '@/hooks/useCart';
import { maxQuantityFor, useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { installmentOptions, paymentMarks } from '@/lib/payments';
import site from '@/data/site.json';

type Plan = 'full' | 'short' | 'long';

export function CartDrawer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const { cartOpen, closeCart } = useUiStore();
  const { lines, subtotal, count, standardShipping } = useCartDetails();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const user = useAuthStore((state) => state.user);
  const [plan, setPlan] = useState<Plan>('full');
  const remaining = Math.max(0, site.freeShippingFrom - subtotal);
  const progress = Math.min(100, (subtotal / site.freeShippingFrom) * 100);
  const total = subtotal + standardShipping;
  const installments = installmentOptions(total);
  const activePlan =
    plan === 'full'
      ? null
      : plan === 'short'
        ? installments.short
        : installments.long;

  const plans: Array<{ id: Plan; label: string; hint: string; badge?: string }> = [
    {
      id: 'full',
      label: t('cart.plans.oneTime'),
      hint: formatPrice(total, locale),
    },
    {
      id: 'short',
      label: t('cart.plans.three'),
      hint: t('cart.plans.threeHint', { amount: formatPrice(installments.short.monthly, locale) }),
      badge: t('cart.plans.badge'),
    },
    {
      id: 'long',
      label: t('cart.plans.twelve'),
      hint: t('cart.plans.twelveHint', {
        apr: installments.long.apr.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB'),
        amount: formatPrice(installments.long.monthly, locale),
      }),
    },
  ];

  return (
    <Drawer
      open={cartOpen}
      onClose={closeCart}
      title={t('cart.drawerTitle')}
      className="border-l border-white/40 bg-white/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/65"
      ariaLabel={t('cart.drawerTitle')}
    >
      <div className="relative flex min-h-full flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-violet-500/[0.14] blur-[70px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-52 h-52 w-52 rounded-full bg-electric-500/[0.12] blur-[64px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/60 to-transparent"
        />

        {lines.length === 0 ? (
          <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/60 bg-white/80 shadow-soft backdrop-blur">
              <ShoppingBag size={24} className="text-ink-900/35" />
            </div>
            <h3 className="font-display text-xl font-semibold">{t('cart.empty')}</h3>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-ink-900/50">
              {t('cart.emptyHint')}
            </p>
            <Link
              to="/shop"
              onClick={closeCart}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-6 text-sm font-medium text-white transition hover:bg-ink-800"
            >
              {t('cart.emptyCta')} <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <div className="relative px-4 pt-4">
              <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/55 p-3.5 shadow-[0_10px_30px_-22px_rgba(8,13,24,0.35)] backdrop-blur-xl">
                {remaining > 0 ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11.5px] text-ink-900/60">
                        {t('cart.shippingNote', { amount: formatPrice(remaining, locale) })}
                      </p>
                      <Truck size={14} className="shrink-0 text-electric-500" />
                    </div>
                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-ink-900/8">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-electric-500 via-violet-500 to-electric-400 transition-[width] duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="flex items-center gap-2 text-[11.5px] font-medium text-emerald-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15">
                      <Check size={12} />
                    </span>
                    {t('cart.shippingFree')}
                  </p>
                )}
              </div>
            </div>

            <ul className="relative mt-1 divide-y divide-ink-900/6 px-5">
              {lines.map(({ product, quantity, lineTotal }) => (
                <li key={product.id} className="flex gap-3.5 py-4">
                  <Link to={`/product/${product.slug}`} onClick={closeCart} className="shrink-0">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-20 w-20 rounded-xl border border-white/70 object-cover shadow-[0_8px_20px_-14px_rgba(8,13,24,0.5)]"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-ink-900/35">
                          {product.brand}
                        </p>
                        <Link
                          to={`/product/${product.slug}`}
                          onClick={closeCart}
                          className="mt-0.5 block truncate text-[13px] font-medium hover:text-electric-600"
                        >
                          {product.name}
                        </Link>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(product.id)}
                        className="shrink-0 rounded-full p-1.5 text-ink-900/30 transition hover:bg-rose-50 hover:text-rose-500"
                        aria-label={t('cart.removeItem', { name: product.name })}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <QuantityStepper
                        size="sm"
                        value={quantity}
                        max={maxQuantityFor(product.id)}
                        onChange={(value) => setQuantity(product.id, value)}
                      />
                      <span className="text-[13px] font-semibold tabular-nums">
                        {formatPrice(lineTotal, locale)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="relative mt-2 px-4">
              <div className="rounded-2xl border border-white/70 bg-white/55 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-900/55">
                    <Sparkles size={12} className="text-violet-500" />
                    {t('cart.plans.title')}
                  </p>
                  <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
                    {t('cart.plans.flexible')}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  {plans.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPlan(option.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition',
                        plan === option.id
                          ? 'border-electric-500/45 bg-electric-500/[0.07] shadow-[0_0_0_3px_rgba(88,101,242,0.08)]'
                          : 'border-ink-900/8 bg-white/60 hover:border-ink-900/20',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition',
                          plan === option.id
                            ? 'border-electric-500 bg-electric-500 text-white'
                            : 'border-ink-900/20',
                        )}
                      >
                        {plan === option.id && <Check size={10} strokeWidth={3.2} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[12px] font-semibold text-ink-900">
                            {option.label}
                          </span>
                          {option.badge && (
                            <span className="rounded-full bg-emerald-500/14 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.06em] text-emerald-700">
                              {option.badge}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-[10.5px] text-ink-900/45">
                          {option.hint}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-2 border-t border-ink-900/6 pt-2.5">
                  <Lock size={11} className="shrink-0 text-ink-900/30" />
                  <p className="text-[9.5px] leading-relaxed text-ink-900/38">
                    {t('cart.plans.note')}
                  </p>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {paymentMarks.map((mark) => (
                    <span
                      key={mark.id}
                      className="flex h-7 items-center justify-center rounded-md border border-ink-900/8 bg-white px-1.5 shadow-[0_1px_2px_rgba(8,13,24,0.05)]"
                      title={mark.label}
                    >
                      <img
                        src={mark.src}
                        alt={mark.label}
                        style={{ height: mark.height, maxWidth: mark.maxWidth }}
                        className="w-auto object-contain"
                        loading="lazy"
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative mt-3 px-4">
              <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/35 px-3 py-2 backdrop-blur">
                {[
                  { icon: Truck, label: t('cart.trust.shipping') },
                  { icon: RefreshCw, label: t('cart.trust.returns') },
                  { icon: Leaf, label: t('cart.trust.climate') },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="flex items-center gap-1.5 text-[9.5px] font-medium text-ink-900/50"
                  >
                    <Icon size={12} className="text-emerald-600" />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mt-auto border-t border-ink-900/8 bg-white/70 p-5 backdrop-blur-xl">
              <div className="space-y-1.5 text-[13px]">
                <div className="flex items-center justify-between text-ink-900/55">
                  <span>
                    {t('cart.subtotal')} ·{' '}
                    {count === 1 ? t('cart.oneItem') : t('cart.items', { count })}
                  </span>
                  <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
                </div>
                <div className="flex items-center justify-between text-ink-900/55">
                  <span>{t('cart.shipping')}</span>
                  <span className="tabular-nums">
                    {standardShipping === 0 ? t('cart.free') : formatPrice(standardShipping, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-ink-900/8 pt-2.5 text-[15px] font-semibold">
                  <span>{t('cart.total')}</span>
                  <span className="tabular-nums">{formatPrice(total, locale)}</span>
                </div>
                {activePlan && (
                  <p className="text-right text-[10.5px] font-medium text-electric-600">
                    {t('cart.plans.selected', {
                      count: activePlan.months,
                      amount: formatPrice(activePlan.monthly, locale),
                    })}
                  </p>
                )}
                <p className="text-[10px] text-ink-900/35">{t('cart.taxesNote')}</p>
              </div>

              <Link
                to="/checkout"
                onClick={closeCart}
                className="mt-3.5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-violet-500 text-sm font-semibold text-white shadow-[0_18px_38px_-16px_rgba(88,101,242,0.95)] transition hover:brightness-110"
              >
                {t('cart.checkout')} <ArrowRight size={15} />
              </Link>

              <div className="mt-2.5 flex items-center justify-between gap-3">
                <Link
                  to="/cart"
                  onClick={closeCart}
                  className="text-[11px] text-ink-900/45 underline decoration-ink-900/20 underline-offset-4 hover:text-ink-900"
                >
                  {t('cart.viewCart')}
                </Link>
                {user ? (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700">
                    <Check size={11} /> {t('cart.signedIn', { name: user.name.split(' ')[0] })}
                  </span>
                ) : (
                  <Link
                    to="/login?redirect=%2Fcheckout"
                    onClick={closeCart}
                    className="flex items-center gap-1 text-[10px] font-medium text-electric-600 transition hover:text-electric-500"
                  >
                    <Lock size={10} /> {t('cart.signInHint')}
                  </Link>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Drawer>
  );
}
