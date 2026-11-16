import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Drawer } from '@/components/ui/Drawer';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import {
  FilterPanel,
  type FilterState,
} from '@/components/catalog/FilterPanel';
import {
  brands,
  categories,
  getPriceRangeForCategory,
  products,
  queryCatalog,
} from '@/lib/catalog';
import { useCatalog } from '@/hooks/useCatalogQuery';
import { cn } from '@/lib/utils';
import type { CategoryId, SortKey } from '@/types/catalog';

const PER_PAGE = 12;
const sortKeys: SortKey[] = ['relevance', 'price-asc', 'price-desc', 'rating', 'newest'];

const numberParam = (value: string | null) => {
  if (value === null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export default function CatalogPage() {
  const { t, i18n } = useTranslation(['common', 'store']);
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const [searchParams, setSearchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const brandsFilter = searchParams.getAll('brand');
  const availabilityFilter = searchParams.getAll('availability');
  const minPrice = numberParam(searchParams.get('minPrice'));
  const maxPrice = numberParam(searchParams.get('maxPrice'));
  const sortParam = searchParams.get('sort') as SortKey | null;
  const sort: SortKey = sortParam && sortKeys.includes(sortParam) ? sortParam : 'relevance';
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const [searchDraft, setSearchDraft] = useState(search);

  useEffect(() => {
    setSearchDraft(search);
  }, [search]);

  const filters: FilterState = {
    category,
    brands: brandsFilter,
    availability: availabilityFilter,
    minPrice,
    maxPrice,
  };

  const result = useCatalog({
    search,
    category,
    brands: brandsFilter,
    availability: availabilityFilter,
    minPrice,
    maxPrice,
    sort,
    page,
    perPage: PER_PAGE,
  });

  const updateParams = (
    patch: Record<string, string | string[] | undefined>,
    resetPage = true,
  ) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      next.delete(key);
      if (Array.isArray(value)) {
        value.forEach((entry) => next.append(key, entry));
      } else if (value) {
        next.set(key, value);
      }
    });
    if (resetPage) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const handleFilterChange = (patch: Partial<FilterState>) => {
    const nextPatch: Record<string, string | string[] | undefined> = {};
    if (patch.category !== undefined) {
      nextPatch.category = patch.category;
      nextPatch.brand = [];
    }
    if (patch.brands !== undefined) nextPatch.brand = patch.brands;
    if (patch.availability !== undefined) nextPatch.availability = patch.availability;
    if ('minPrice' in patch) nextPatch.minPrice = patch.minPrice?.toString();
    if ('maxPrice' in patch) nextPatch.maxPrice = patch.maxPrice?.toString();
    updateParams(nextPatch);
  };

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (search) next.set('search', search);
    setSearchParams(next, { replace: true });
  };

  const facetSource = useMemo(() => {
    if (!search.trim()) return products;
    return queryCatalog({ search, perPage: products.length + 1 }).items;
  }, [search]);

  const categoryPool = useMemo(
    () =>
      category ? facetSource.filter((product) => product.category === category) : facetSource,
    [facetSource, category],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((entry) => {
      counts[entry.id] = facetSource.filter((product) => product.category === entry.id).length;
    });
    return counts;
  }, [facetSource]);

  const brandOptions = useMemo(
    () =>
      brands
        .map((brand) => ({
          name: brand.name,
          count: categoryPool.filter((product) => product.brand === brand.name).length,
        }))
        .filter((brand) => brand.count > 0)
        .sort((a, b) => b.count - a.count),
    [categoryPool],
  );

  const availabilityCounts = useMemo(() => {
    const pool = categoryPool.filter((product) => {
      if (typeof minPrice === 'number' && product.price < minPrice) return false;
      if (typeof maxPrice === 'number' && product.price > maxPrice) return false;
      if (brandsFilter.length && !brandsFilter.includes(product.brand)) return false;
      return true;
    });
    return {
      in_stock: pool.filter((product) => product.availability === 'in_stock').length,
      low_stock: pool.filter((product) => product.availability === 'low_stock').length,
      preorder: pool.filter((product) => product.availability === 'preorder').length,
      out_of_stock: pool.filter((product) => product.availability === 'out_of_stock').length,
    };
  }, [categoryPool, brandsFilter, minPrice, maxPrice]);

  const priceBounds = useMemo(
    () => getPriceRangeForCategory(category ? (category as CategoryId) : undefined),
    [category],
  );

  const currentCategory = category
    ? categories.find((entry) => entry.id === category)
    : undefined;
  const title = currentCategory
    ? currentCategory.name[locale]
    : search
      ? t('store:catalog.resultsFor', { query: search })
      : t('store:catalog.title');
  const subtitle = currentCategory ? currentCategory.description[locale] : t('store:catalog.subtitle');

  const data = result.data;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const currentPage = data?.page ?? page;
  const isLoading = result.isLoading || result.isFetching;

  const activeChips = [
    ...(search
      ? [{ key: 'search', label: `„${search}“`, clear: { search: '' } }]
      : []),
    ...(currentCategory
      ? [
          {
            key: 'category',
            label: t('store:catalog.categoryChip', { name: currentCategory.name[locale] }),
            clear: { category: '' },
          },
        ]
      : []),
    ...brandsFilter.map((brand) => ({
      key: `brand-${brand}`,
      label: t('store:catalog.brandChip', { name: brand }),
      clear: { brand: brandsFilter.filter((entry) => entry !== brand) },
    })),
    ...(typeof minPrice === 'number' || typeof maxPrice === 'number'
      ? [
          {
            key: 'price',
            label: t('store:catalog.priceChip', {
              min: minPrice ?? priceBounds.min,
              max: maxPrice ?? priceBounds.max,
            }),
            clear: { minPrice: '', maxPrice: '' },
          },
        ]
      : []),
    ...availabilityFilter.map((value) => ({
      key: `availability-${value}`,
      label: t(`availability.${value}`),
      clear: { availability: availabilityFilter.filter((entry) => entry !== value) },
    })),
  ];

  const filterPanel = (
    <FilterPanel
      filters={filters}
      onChange={handleFilterChange}
      onReset={resetFilters}
      brandOptions={brandOptions}
      availabilityCounts={availabilityCounts}
      categoryCounts={categoryCounts}
      priceBounds={priceBounds}
      totalCount={facetSource.length}
    />
  );

  return (
    <div className="bg-mist">
      <div className="container-x pb-16 pt-8">
        <Breadcrumbs
          items={[
            { label: t('product.breadcrumbHome'), to: '/' },
            { label: t('nav.shop'), to: '/shop' },
            ...(currentCategory ? [{ label: currentCategory.name[locale] }] : []),
          ]}
          className="mb-6"
        />

        <div className="flex flex-col gap-5 border-b border-ink-900/8 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-electric-600">{t('store:catalog.pageTitle')}</p>
            <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-900/50">
              {subtitle}
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/35"
            />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') updateParams({ search: searchDraft.trim() });
              }}
              placeholder={t('store:catalog.searchPlaceholder')}
              aria-label={t('store:catalog.searchLabel')}
              className="h-11 w-full rounded-full border border-ink-900/12 bg-white pl-10 pr-10 text-[13px] outline-none transition focus:border-electric-500 focus:ring-4 focus:ring-electric-500/10"
            />
            {searchDraft && (
              <button
                type="button"
                onClick={() => {
                  setSearchDraft('');
                  updateParams({ search: '' });
                }}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-900/35 transition hover:bg-ink-900/5 hover:text-ink-900"
                aria-label={t('actions.clear')}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] text-ink-900/45">
              {t('filters.results', { count: total })}
            </p>
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => updateParams(chip.clear)}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-2.5 py-1 text-[10px] font-medium text-ink-900/60 transition hover:border-ink-900/25 hover:text-ink-900"
              >
                {chip.label}
                <X size={10} />
              </button>
            ))}
            {activeChips.length > 1 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] text-ink-900/40 underline decoration-ink-900/15 underline-offset-4 hover:text-ink-900"
              >
                {t('filters.clearAll')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="flex h-9 items-center gap-2 rounded-full border border-ink-900/12 bg-white px-3.5 text-[12px] font-medium lg:hidden"
            >
              <SlidersHorizontal size={13} />
              {t('store:catalog.mobileFilter')}
            </button>
            <label className="flex items-center gap-2 text-[11px] text-ink-900/40">
              <span className="hidden sm:inline">{t('store:catalog.sortLabel')}</span>
              <select
                value={sort}
                onChange={(event) => updateParams({ sort: event.target.value })}
                className="h-9 rounded-full border border-ink-900/12 bg-white px-3 pr-7 text-[12px] font-medium text-ink-900 outline-none transition focus:border-electric-500"
              >
                <option value="relevance">{t('sort.relevance')}</option>
                <option value="price-asc">{t('sort.priceAsc')}</option>
                <option value="price-desc">{t('sort.priceDesc')}</option>
                <option value="rating">{t('sort.rating')}</option>
                <option value="newest">{t('sort.newest')}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-7 grid gap-10 lg:grid-cols-[248px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-ink-900/8 bg-white p-5">
              {filterPanel}
            </div>
          </aside>

          <div>
            {isLoading && !data ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                title={t('store:catalog.emptyTitle')}
                text={t('store:catalog.emptyText')}
                action={
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex h-11 items-center rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
                  >
                    {t('store:catalog.clearFilters')}
                  </button>
                }
              />
            ) : (
              <>
                <div className={cn('transition-opacity duration-300', isLoading && 'opacity-60')}>
                  <ProductGrid products={items} />
                </div>

                {pages > 1 && (
                  <nav
                    className="mt-12 flex items-center justify-between border-t border-ink-900/8 pt-6"
                    aria-label={t('store:catalog.pageOf', { page: currentPage, pages })}
                  >
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => updateParams({ page: String(currentPage - 1) }, false)}
                      className="flex h-10 items-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-4 text-[12px] font-medium transition hover:border-ink-900/30 disabled:pointer-events-none disabled:opacity-35"
                    >
                      <ChevronLeft size={14} />
                      {t('store:catalog.prevPage')}
                    </button>
                    <p className="text-[11px] text-ink-900/45">
                      {t('store:catalog.pageOf', { page: currentPage, pages })}
                    </p>
                    <button
                      type="button"
                      disabled={currentPage >= pages}
                      onClick={() => updateParams({ page: String(currentPage + 1) }, false)}
                      className="flex h-10 items-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-4 text-[12px] font-medium transition hover:border-ink-900/30 disabled:pointer-events-none disabled:opacity-35"
                    >
                      {t('store:catalog.nextPage')}
                      <ChevronRight size={14} />
                    </button>
                  </nav>
                )}

                <p className="mt-6 text-center text-[10px] text-ink-900/30">
                  {t('demo.notice')}{' '}
                  <Link to="/info/about" className="underline underline-offset-2 hover:text-ink-900/60">
                    {t('footer.about')}
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t('filters.title')}
        side="left"
        className="max-w-[88vw] bg-white sm:max-w-sm"
        ariaLabel={t('filters.title')}
      >
        <div className="p-5">{filterPanel}</div>
      </Drawer>
    </div>
  );
}
