import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, GitCompare, ShoppingBag, Trash2, X } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { AvailabilityBadge } from '@/components/product/AvailabilityBadge';
import { getProductById } from '@/lib/catalog';
import { useCompareStore } from '@/stores/compare.store';
import { useCartStore } from '@/stores/cart.store';
import { useToastStore } from '@/stores/toast.store';
import { cn } from '@/lib/utils';
import type { Locale, Product } from '@/types/catalog';

export default function ComparePage() {
  const { t, i18n } = useTranslation(['common', 'store']);
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const ids = useCompareStore((state) => state.ids);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);
  const addToCart = useCartStore((state) => state.add);
  const push = useToastStore((state) => state.push);
  const [differencesOnly, setDifferencesOnly] = useState(false);

  const products = ids
    .map((id) => getProductById(id))
    .filter((product): product is Product => Boolean(product));

  const rows = useMemo(() => {
    const keys: string[] = [];
    const labels = new Map<string, string>();
    products.forEach((product) => {
      product.specs.forEach((spec) => {
        if (!keys.includes(spec.key)) {
          keys.push(spec.key);
          labels.set(spec.key, spec.label[locale]);
        }
      });
    });

    return keys
      .map((key) => {
        const values = products.map(
          (product) => product.specs.find((spec) => spec.key === key)?.value ?? '—',
        );
        const isDifference = new Set(values.filter((value) => value !== '—')).size > 1;
        return { key, label: labels.get(key) ?? key, values, isDifference };
      })
      .filter((row) => (differencesOnly ? row.isDifference : true));
  }, [products, locale, differencesOnly]);

  return (
    <div className="bg-mist">
      <div className="container-x py-10 sm:py-12">
        <Breadcrumbs
          items={[
            { label: t('product.breadcrumbHome'), to: '/' },
            { label: t('store:comparePage.title') },
          ]}
          className="mb-6"
        />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
              {t('store:comparePage.title')}
            </h1>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-ink-900/50">
              {t('store:comparePage.subtitle')}
            </p>
          </div>
          {products.length > 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-[11px] text-ink-900/55">
                <span
                  className={cn(
                    'relative h-5 w-9 rounded-full transition',
                    differencesOnly ? 'bg-electric-500' : 'bg-ink-900/15',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={differencesOnly}
                    onChange={(event) => setDifferencesOnly(event.target.checked)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                      differencesOnly ? 'left-[18px]' : 'left-0.5',
                    )}
                  />
                </span>
                {t('store:comparePage.filterDifferences')}
              </label>
              <button
                type="button"
                onClick={clear}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-3.5 text-[11px] text-ink-900/50 transition hover:border-rose-300 hover:text-rose-500"
              >
                <Trash2 size={12} /> {t('filters.clearAll')}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8">
          {products.length === 0 ? (
            <EmptyState
              icon={<GitCompare size={24} />}
              title={t('store:comparePage.emptyTitle')}
              text={t('store:comparePage.emptyText')}
              action={
                <Link
                  to="/shop"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
                >
                  {t('store:comparePage.addProducts')} <ArrowRight size={14} />
                </Link>
              }
            />
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-ink-900/8 bg-white">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-36 border-b border-ink-900/8 bg-white p-4 align-bottom">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900/35">
                        {t('compare.feature')}
                      </span>
                    </th>
                    {products.map((product) => (
                      <th
                        key={product.id}
                        className="min-w-[200px] border-b border-l border-ink-900/8 p-4 align-top"
                      >
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              remove(product.id);
                              push(t('toast.compareRemoved'), 'info');
                            }}
                            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink-900/5 text-ink-900/40 transition hover:bg-rose-50 hover:text-rose-500"
                            aria-label={t('store:comparePage.removeProduct', { name: product.name })}
                          >
                            <X size={13} />
                          </button>
                          <Link to={`/product/${product.slug}`} className="block overflow-hidden rounded-xl bg-[#EDF0F6]">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
                            />
                          </Link>
                          <p className="mt-2 text-[9px] uppercase tracking-[0.12em] text-ink-900/35">
                            {product.brand}
                          </p>
                          <Link
                            to={`/product/${product.slug}`}
                            className="mt-0.5 block text-[13px] font-medium leading-snug hover:text-electric-600"
                          >
                            {product.name}
                          </Link>
                          <div className="mt-1.5">
                            <Price price={product.price} originalPrice={product.originalPrice} size="sm" />
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            <Rating value={product.rating} showValue={false} />
                            <AvailabilityBadge availability={product.availability} />
                          </div>
                          <button
                            type="button"
                            disabled={product.availability === 'out_of_stock'}
                            onClick={() => {
                              addToCart(product.id, 1);
                              push(t('toast.addedToCart', { name: product.name }), 'success');
                            }}
                            className="mt-2.5 flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-ink-900 text-[11px] font-medium text-white transition hover:bg-ink-800 disabled:pointer-events-none disabled:opacity-40"
                          >
                            <ShoppingBag size={12} /> {t('actions.addToCart')}
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.key}
                      className={row.isDifference ? 'bg-amber-50/40' : undefined}
                    >
                      <th
                        scope="row"
                        className={cn(
                          'sticky left-0 z-10 border-b border-ink-900/6 p-4 text-[11px] font-medium',
                          row.isDifference ? 'bg-amber-50/80 text-ink-900/70' : 'bg-white text-ink-900/45',
                        )}
                      >
                        {row.label}
                        {row.isDifference && (
                          <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                        )}
                      </th>
                      {row.values.map((value, index) => (
                        <td
                          key={`${row.key}-${index}`}
                          className={cn(
                            'border-b border-l border-ink-900/6 p-4 text-[12px]',
                            value === '—' ? 'text-ink-900/25' : 'text-ink-900/70',
                          )}
                        >
                          {value === '—' ? t('store:comparePage.specMissing') : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={products.length + 1}
                        className="p-10 text-center text-[12px] text-ink-900/40"
                      >
                        {t('compare.same')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {products.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[10px] text-ink-900/35">
              {t('compare.count', { count: products.length, max: 4 })}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-electric-600"
            >
              {t('store:comparePage.addProducts')} <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
