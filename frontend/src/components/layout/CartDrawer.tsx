import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useUiStore } from '@/stores/ui.store';
import { useCartDetails } from '@/hooks/useCart';
import { maxQuantityFor, useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/lib/utils';
import site from '@/data/site.json';

export function CartDrawer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const { cartOpen, closeCart } = useUiStore();
  const { lines, subtotal, count, standardShipping } = useCartDetails();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const remaining = Math.max(0, site.freeShippingFrom - subtotal);
  const progress = Math.min(100, (subtotal / site.freeShippingFrom) * 100);

  return (
    <Drawer
      open={cartOpen}
      onClose={closeCart}
      title={t('cart.drawerTitle')}
      className="bg-mist"
      ariaLabel={t('cart.drawerTitle')}
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-soft">
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
          <div className="border-b border-ink-900/8 bg-white/60 px-5 py-3.5">
            {remaining > 0 ? (
              <>
                <p className="text-[11px] text-ink-900/55">
                  {t('cart.shippingNote', { amount: formatPrice(remaining, locale) })}
                </p>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink-900/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-electric-500 to-violet-500 transition-[width] duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <p className="text-[11px] font-medium text-emerald-600">{t('cart.shippingFree')}</p>
            )}
          </div>

          <ul className="divide-y divide-ink-900/6 px-5">
            {lines.map(({ product, quantity, lineTotal }) => (
              <li key={product.id} className="flex gap-3.5 py-4">
                <Link to={`/product/${product.slug}`} onClick={closeCart} className="shrink-0">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-20 w-20 rounded-xl object-cover"
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

          <div className="mt-auto border-t border-ink-900/8 bg-white p-5">
            <div className="space-y-2 text-[13px]">
              <div className="flex items-center justify-between text-ink-900/55">
                <span>
                  {t('cart.subtotal')} · {count === 1 ? t('cart.oneItem') : t('cart.items', { count })}
                </span>
                <span className="tabular-nums">{formatPrice(subtotal, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-ink-900/55">
                <span>{t('cart.shipping')}</span>
                <span className="tabular-nums">
                  {standardShipping === 0 ? t('cart.free') : formatPrice(standardShipping, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-ink-900/8 pt-3 text-[15px] font-semibold">
                <span>{t('cart.total')}</span>
                <span className="tabular-nums">
                  {formatPrice(subtotal + standardShipping, locale)}
                </span>
              </div>
              <p className="text-[10px] text-ink-900/35">{t('cart.taxesNote')}</p>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-electric-500 text-sm font-semibold text-white shadow-[0_16px_36px_-16px_rgba(88,101,242,0.9)] transition hover:bg-electric-400"
            >
              {t('cart.checkout')} <ArrowRight size={15} />
            </Link>
            <div className="mt-2 flex items-center justify-between">
              <Link
                to="/cart"
                onClick={closeCart}
                className="text-[11px] text-ink-900/45 underline decoration-ink-900/20 underline-offset-4 hover:text-ink-900"
              >
                {t('cart.viewCart')}
              </Link>
              <span className="text-[10px] text-ink-900/35">{t('cart.demoNote')}</span>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
