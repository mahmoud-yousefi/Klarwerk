import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  ImagePlus,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import type { Product } from '@/types/catalog';
import { categories as baseCategories, products as baseProducts, withBase } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/stores/admin.store';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from '@/components/admin/ProductForm';
import {
  Panel,
  Select,
  TabHeader,
  adminButtonGhost,
  adminButtonPrimary,
  adminInput,
} from '@/components/admin/AdminUi';

export function ProductsTab({ query }: { query: string }) {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const customProducts = useAdminStore((state) => state.customProducts);
  const deleteProduct = useAdminStore((state) => state.deleteProduct);
  const [localQuery, setLocalQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('newest');
  const [open, setOpen] = useState(false);
  const [created, setCreated] = useState<Product | null>(null);

  const allProducts = useMemo(() => {
    const seen = new Set(customProducts.map((product) => product.id));
    return [...customProducts, ...baseProducts.filter((product) => !seen.has(product.id))];
  }, [customProducts]);

  const search = `${query} ${localQuery}`.trim().toLowerCase();
  const filtered = allProducts
    .filter((product) => {
      if (category !== 'all' && product.category !== category) return false;
      if (!search) return true;
      return [product.name, product.brand, product.sku, product.category]
        .join(' ')
        .toLowerCase()
        .includes(search);
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'stock') return a.stock - b.stock;
      return Number(b.isNew) - Number(a.isNew) || b.releaseYear - a.releaseYear;
    });

  const customIds = new Set(customProducts.map((product) => product.id));
  const lowStock = allProducts.filter((product) => product.stock <= 8).length;
  const stockValue = allProducts.reduce((sum, product) => sum + product.price * product.stock, 0);
  const usedCategories = baseCategories.filter((entry) =>
    allProducts.some((product) => product.category === entry.id),
  );

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('products.eyebrow')}
        title={t('products.title')}
        subtitle={t('products.subtitle')}
        actions={
          <button type="button" onClick={() => setOpen(true)} className={adminButtonPrimary}>
            <Plus size={14} /> {t('products.create')}
          </button>
        }
      />

      {created && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700">
              <CheckCircle2 size={17} />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-emerald-900">
                {t('products.published.title', { name: created.name })}
              </p>
              <p className="text-[10.5px] text-emerald-800/60">{t('products.published.hint')}</p>
            </div>
          </div>
          <a
            href={withBase('/shop?sort=newest')}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-emerald-700 px-4 text-[11px] font-semibold text-white transition hover:bg-emerald-800"
          >
            {t('products.published.view')} <ArrowUpRight size={12} />
          </a>
        </div>
      )}

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('products.stats.total'), value: allProducts.length.toString(), icon: Package, tone: 'text-electric-600' },
          { label: t('products.stats.custom'), value: customProducts.length.toString(), icon: Sparkles, tone: 'text-violet-600' },
          { label: t('products.stats.lowStock'), value: lowStock.toString(), icon: TriangleAlert, tone: 'text-amber-600' },
          { label: t('products.stats.stockValue'), value: formatPrice(stockValue, locale), icon: Boxes, tone: 'text-[#3B7F81]' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-ink-900/[0.07] bg-white px-4 py-3"
          >
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-ink-900/38">
                {label}
              </p>
              <p className="mt-1 text-[16px] font-semibold tabular-nums">{value}</p>
            </div>
            <Icon size={16} className={tone} />
          </div>
        ))}
      </div>

      <Panel padded={false}>
        <div className="flex flex-col gap-2 border-b border-ink-900/6 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/30" />
            <input
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder={t('products.search')}
              className={`${adminInput} pl-8`}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-ink-900/40">
              {t('products.count', { count: filtered.length })}
            </span>
            <Select
              value={category}
              onChange={setCategory}
              ariaLabel={t('products.form.category')}
              options={[
                { value: 'all', label: t('common.allCategories') },
                ...usedCategories.map((entry) => ({ value: entry.id, label: entry.name[locale] })),
              ]}
            />
            <Select
              value={sort}
              onChange={setSort}
              ariaLabel={t('products.sortLabel')}
              options={[
                { value: 'newest', label: t('products.sort.newest') },
                { value: 'price-asc', label: t('products.sort.priceAsc') },
                { value: 'price-desc', label: t('products.sort.priceDesc') },
                { value: 'stock', label: t('products.sort.stock') },
              ]}
            />
            <button type="button" onClick={() => setOpen(true)} className={adminButtonGhost}>
              <ImagePlus size={13} /> {t('products.quickAdd')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-ink-900/6 text-[8.5px] uppercase tracking-[0.12em] text-ink-900/35">
                <th className="px-4 py-2.5 font-medium">{t('products.table.product')}</th>
                <th className="px-3 py-2.5 font-medium">{t('products.table.category')}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t('products.table.price')}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t('products.table.stock')}</th>
                <th className="px-3 py-2.5 font-medium">{t('products.table.source')}</th>
                <th className="w-10 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[0.045]">
              {filtered.slice(0, 30).map((product) => {
                const isCustom = customIds.has(product.id);
                const categoryName =
                  baseCategories.find((entry) => entry.id === product.category)?.name[locale] ??
                  product.category;
                return (
                  <tr key={product.id} className="text-[11.5px] transition hover:bg-ink-900/[0.02]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg border border-ink-900/8 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-900">{product.name}</p>
                          <p className="text-[9.5px] text-ink-900/35">
                            {product.brand} · {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-ink-900/55">{categoryName}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                      {formatPrice(product.price, locale)}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span
                        className={
                          product.stock <= 8
                            ? 'rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9.5px] font-semibold tabular-nums text-amber-700'
                            : 'tabular-nums text-ink-900/60'
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={
                          isCustom
                            ? 'inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[9px] font-semibold text-violet-600'
                            : 'inline-flex rounded-full bg-ink-900/5 px-2 py-0.5 text-[9px] font-medium text-ink-900/45'
                        }
                      >
                        {isCustom ? t('products.source.custom') : t('products.source.catalog')}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => deleteProduct(product.id)}
                          className="rounded-full p-1.5 text-ink-900/25 transition hover:bg-rose-50 hover:text-rose-500"
                          aria-label={t('common.delete')}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-[12px] text-ink-900/40">{t('products.empty')}</p>
        )}
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('products.form.title')}
        className="max-w-2xl"
      >
        <ProductForm
          categories={baseCategories}
          onCancel={() => setOpen(false)}
          onDone={(product) => {
            setOpen(false);
            setCreated(product);
          }}
        />
      </Modal>
    </div>
  );
}
