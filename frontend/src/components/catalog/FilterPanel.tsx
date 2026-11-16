import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { categories } from '@/lib/catalog';
import { cn, formatPrice } from '@/lib/utils';
import type { Availability, CategoryId, Locale } from '@/types/catalog';

const availabilityOptions: Availability[] = [
  'in_stock',
  'low_stock',
  'preorder',
  'out_of_stock',
];

export interface FilterState {
  category: string;
  brands: string[];
  availability: string[];
  minPrice?: number;
  maxPrice?: number;
}

interface FilterPanelProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
  brandOptions: { name: string; count: number }[];
  availabilityCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  priceBounds: { min: number; max: number };
  totalCount: number;
  className?: string;
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  brandOptions,
  availabilityCounts,
  categoryCounts,
  priceBounds,
  totalCount,
  className,
}: FilterPanelProps) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const [minInput, setMinInput] = useState(filters.minPrice?.toString() ?? '');
  const [maxInput, setMaxInput] = useState(filters.maxPrice?.toString() ?? '');

  useEffect(() => {
    setMinInput(filters.minPrice?.toString() ?? '');
    setMaxInput(filters.maxPrice?.toString() ?? '');
  }, [filters.minPrice, filters.maxPrice]);

  const applyPrice = () => {
    const min = minInput.trim() === '' ? undefined : Math.max(0, Number(minInput));
    const max = maxInput.trim() === '' ? undefined : Math.max(0, Number(maxInput));
    onChange({
      minPrice: Number.isFinite(min) ? min : undefined,
      maxPrice: Number.isFinite(max) ? max : undefined,
    });
  };

  const toggleValue = (key: 'brands' | 'availability', value: string) => {
    const current = filters[key];
    onChange({
      [key]: current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    });
  };

  const activeCount =
    (filters.category ? 1 : 0) +
    filters.brands.length +
    filters.availability.length +
    (typeof filters.minPrice === 'number' || typeof filters.maxPrice === 'number' ? 1 : 0);

  return (
    <div className={cn('space-y-7', className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-tight">
          <SlidersHorizontal size={14} />
          {t('filters.title')}
          {activeCount > 0 && (
            <span className="rounded-full bg-electric-500/10 px-2 py-0.5 text-[10px] font-semibold text-electric-600">
              {t('filters.active', { count: activeCount })}
            </span>
          )}
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-ink-900/40 underline decoration-ink-900/15 underline-offset-4 transition hover:text-ink-900"
        >
          {t('filters.reset')}
        </button>
      </div>

      <div>
        <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-900/40">
          {t('filters.category')}
        </h3>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onChange({ category: '' })}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[12px] transition',
                filters.category === ''
                  ? 'bg-ink-900 text-white'
                  : 'text-ink-900/60 hover:bg-ink-900/[0.045] hover:text-ink-900',
              )}
            >
              {t('filters.allCategories')}
              <span className="text-[10px] tabular-nums opacity-50">{totalCount}</span>
            </button>
          </li>
          {categories.map((category) => {
            const count = categoryCounts[category.id] ?? 0;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      category: filters.category === category.id ? '' : (category.id as CategoryId),
                    })
                  }
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-[12px] transition',
                    filters.category === category.id
                      ? 'bg-ink-900 text-white'
                      : 'text-ink-900/60 hover:bg-ink-900/[0.045] hover:text-ink-900',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: category.accent }}
                    />
                    {category.name[locale]}
                  </span>
                  <span className="text-[10px] tabular-nums opacity-50">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-ink-900/8 pt-6">
        <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-900/40">
          {t('filters.brand')}
        </h3>
        <ul className="space-y-1">
          {brandOptions.map((brand) => (
            <li key={brand.name}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] text-ink-900/60 transition hover:bg-ink-900/[0.035] hover:text-ink-900">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand.name)}
                  onChange={() => toggleValue('brands', brand.name)}
                  className="h-3.5 w-3.5 rounded border-ink-900/25 text-electric-500 focus:ring-electric-500/20"
                />
                <span className="flex-1">{brand.name}</span>
                <span className="text-[10px] tabular-nums text-ink-900/30">{brand.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-ink-900/8 pt-6">
        <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-900/40">
          {t('filters.availability')}
        </h3>
        <ul className="space-y-1">
          {availabilityOptions.map((value) => (
            <li key={value}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[12px] text-ink-900/60 transition hover:bg-ink-900/[0.035] hover:text-ink-900">
                <input
                  type="checkbox"
                  checked={filters.availability.includes(value)}
                  onChange={() => toggleValue('availability', value)}
                  className="h-3.5 w-3.5 rounded border-ink-900/25 text-electric-500 focus:ring-electric-500/20"
                />
                <span className="flex-1">{t(`availability.${value}`)}</span>
                <span className="text-[10px] tabular-nums text-ink-900/30">
                  {availabilityCounts[value] ?? 0}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-ink-900/8 pt-6">
        <h3 className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-900/40">
          {t('filters.price')}
        </h3>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <span className="sr-only">{t('filters.priceFrom')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={`${formatPrice(priceBounds.min, locale)}`}
              value={minInput}
              onChange={(event) => setMinInput(event.target.value)}
              onBlur={applyPrice}
              onKeyDown={(event) => event.key === 'Enter' && applyPrice()}
              className="h-9 w-full rounded-lg border border-ink-900/12 bg-white px-2 text-[12px] outline-none transition focus:border-electric-500 focus:ring-2 focus:ring-electric-500/10"
            />
          </label>
          <span className="text-ink-900/25">–</span>
          <label className="flex-1">
            <span className="sr-only">{t('filters.priceTo')}</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder={`${formatPrice(priceBounds.max, locale)}`}
              value={maxInput}
              onChange={(event) => setMaxInput(event.target.value)}
              onBlur={applyPrice}
              onKeyDown={(event) => event.key === 'Enter' && applyPrice()}
              className="h-9 w-full rounded-lg border border-ink-900/12 bg-white px-2 text-[12px] outline-none transition focus:border-electric-500 focus:ring-2 focus:ring-electric-500/10"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={applyPrice}
          className="mt-2 h-8 w-full rounded-lg bg-ink-900/[0.055] text-[11px] font-medium text-ink-900/70 transition hover:bg-ink-900/10 hover:text-ink-900"
        >
          {t('filters.apply')}
        </button>
      </div>
    </div>
  );
}
