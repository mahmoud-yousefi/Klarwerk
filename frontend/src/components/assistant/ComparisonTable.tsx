import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, GitCompare, X } from 'lucide-react';
import { Price } from '@/components/ui/Price';
import { getProductById } from '@/lib/catalog';
import { useCompareStore } from '@/stores/compare.store';
import { useProductActions } from '@/hooks/useProductActions';
import { cn } from '@/lib/utils';
import type { Locale, Product } from '@/types/catalog';

interface ComparisonTableProps {
  ids: string[];
}

export function ComparisonTable({ ids }: ComparisonTableProps) {
  const { t, i18n } = useTranslation('assistant');
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const navigate = useNavigate();
  const compareIds = useCompareStore((state) => state.ids);
  const { toggleCompare } = useProductActions();

  const products = useMemo(
    () =>
      ids
        .map((id) => getProductById(id))
        .filter((product): product is Product => Boolean(product))
        .slice(0, 3),
    [ids],
  );

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
        const unique = new Set(values.filter((value) => value !== '—'));
        return { key, label: labels.get(key) ?? key, values, isDifference: unique.size > 1 };
      })
      .sort((a, b) => Number(b.isDifference) - Number(a.isDifference))
      .filter((row, index) => row.isDifference || index < 4);
  }, [products, locale]);

  if (products.length < 2) return null;

  const openComparison = () => {
    products.forEach((product) => {
      if (!compareIds.includes(product.id)) toggleCompare(product);
    });
    navigate('/compare');
  };

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-violet-500/20 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-ink-900/8 bg-violet-500/[0.045] px-3.5 py-2.5">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-violet-700">
          <GitCompare size={12} />
          {t('comparison.title')}
        </p>
        <button
          type="button"
          onClick={openComparison}
          className="inline-flex items-center gap-1 text-[10px] font-medium text-violet-600 transition hover:text-violet-700"
        >
          {t('actions.viewComparison')} <ArrowRight size={10} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-24 border-b border-ink-900/8 p-2.5 align-bottom">
                <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-900/30">
                  {t('comparison.feature')}
                </span>
              </th>
              {products.map((product) => (
                <th key={product.id} className="min-w-[130px] border-b border-l border-ink-900/8 p-2.5 align-top">
                  <Link to={`/product/${product.slug}`} className="group flex items-center gap-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      loading="lazy"
                      className="h-9 w-9 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[10px] font-medium leading-tight group-hover:text-electric-600">
                        {product.name}
                      </span>
                      <Price price={product.price} size="sm" className="mt-0.5 text-[10px]" />
                    </span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className={row.isDifference ? 'bg-amber-50/40' : undefined}>
                <th
                  scope="row"
                  className={cn(
                    'border-b border-ink-900/6 p-2.5 text-[10px] font-medium',
                    row.isDifference ? 'text-ink-900/70' : 'text-ink-900/40',
                  )}
                >
                  <span className="flex items-center gap-1">
                    {row.label}
                    {row.isDifference && (
                      <span className="h-1 w-1 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
                    )}
                  </span>
                </th>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.key}-${index}`}
                    className={cn(
                      'border-b border-l border-ink-900/6 p-2.5 text-[10px] leading-relaxed',
                      value === '—' ? 'text-ink-900/25' : 'text-ink-900/65',
                    )}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 px-3.5 py-2">
        <p className="text-[9px] text-ink-900/30">{t('comparison.onlyCatalog')}</p>
        <button
          type="button"
          onClick={openComparison}
          className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-900/45 transition hover:text-ink-900"
        >
          <X size={10} className="rotate-45" />
          {t('actions.viewComparison')}
        </button>
      </div>
    </div>
  );
}
