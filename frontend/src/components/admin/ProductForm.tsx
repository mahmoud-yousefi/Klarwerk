import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ImagePlus, Loader2, Sparkles } from 'lucide-react';
import type { Category, CategoryId, Product } from '@/types/catalog';
import { slugify } from '@/lib/utils';
import { useAdminStore } from '@/stores/admin.store';
import { adminButtonGhost, adminButtonPrimary, adminInput, adminTextarea, FieldLabel } from '@/components/admin/AdminUi';

const availabilityOptions = ['in_stock', 'low_stock', 'preorder', 'out_of_stock'] as const;
const accentOptions = ['#5865F2', '#9B72F2', '#4FA3A5', '#D9587A', '#C28A3D', '#3E8BD8'];

const sampleImages = [
  '/assets/images/products/headphones-silver.webp',
  '/assets/images/products/mouse-dark.webp',
  '/assets/images/products/speaker-teal.webp',
  '/assets/images/products/keyboard.webp',
  '/assets/images/products/watch.webp',
  '/assets/images/products/circuit.webp',
];

export function ProductForm({
  categories,
  onDone,
  onCancel,
}: {
  categories: Category[];
  onDone: (product: Product) => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation('admin');
  const publishProduct = useAdminStore((state) => state.publishProduct);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    brand: 'Klarwerk',
    category: (categories[0]?.id ?? 'audio') as CategoryId,
    price: '',
    originalPrice: '',
    stock: '24',
    availability: 'in_stock' as (typeof availabilityOptions)[number],
    image: sampleImages[0],
    taglineDe: '',
    taglineEn: '',
    descriptionDe: '',
    descriptionEn: '',
    color: accentOptions[0],
    tags: '',
    featured: false,
    isNew: true,
    warrantyYears: '2',
  });

  const imageList = useMemo(
    () => [...sampleImages, form.image].filter((value, index, list) => value && list.indexOf(value) === index),
    [form.image],
  );

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((state) => ({ ...state, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim() || !form.price || Number(form.price) <= 0) {
      setError(t('products.form.required'));
      return;
    }
    setSaving(true);
    const id = `kw_custom_${Date.now().toString(36)}`;
    const taglineDe = form.taglineDe.trim() || form.name.trim();
    const taglineEn = form.taglineEn.trim() || taglineDe;
    const descriptionDe =
      form.descriptionDe.trim() ||
      `${form.name.trim()} von ${form.brand.trim()} – ausgewählt vom Klarwerk-Team.`;
    const descriptionEn = form.descriptionEn.trim() || descriptionDe;

    const product: Product = {
      id,
      sku: `KW-${slugify(form.brand).slice(0, 3).toUpperCase() || 'KLR'}-${Math.floor(100 + Math.random() * 899)}`,
      slug: `${slugify(form.name)}-${id.slice(-4)}`,
      name: form.name.trim(),
      brand: form.brand.trim() || 'Klarwerk',
      category: form.category,
      tagline: { de: taglineDe, en: taglineEn },
      description: { de: descriptionDe, en: descriptionEn },
      price: Math.round(Number(form.price) * 100) / 100,
      originalPrice: form.originalPrice ? Math.round(Number(form.originalPrice) * 100) / 100 : null,
      currency: 'EUR',
      availability: form.availability,
      stock: Math.max(0, Math.round(Number(form.stock) || 0)),
      images: [form.image],
      specs: [],
      highlights: [{ de: taglineDe, en: taglineEn }],
      rating: 5,
      reviewCount: 0,
      featured: form.featured,
      isNew: form.isNew,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      color: form.color,
      releaseYear: new Date().getFullYear(),
      warrantyYears: Math.max(1, Math.round(Number(form.warrantyYears) || 2)),
    };

    window.setTimeout(() => {
      publishProduct(product);
      setSaving(false);
      onDone(product);
    }, 900);
  };

  return (
    <form onSubmit={submit} className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-4 pr-8">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-electric-600">
            {t('products.form.eyebrow')}
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em]">
            {t('products.form.title')}
          </h3>
          <p className="mt-1 text-[11px] text-ink-900/45">{t('products.form.subtitle')}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric-500/10 text-electric-600">
          <Sparkles size={16} />
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FieldLabel>{t('products.form.name')}</FieldLabel>
          <input
            value={form.name}
            onChange={(event) => set('name', event.target.value)}
            placeholder={t('products.form.namePlaceholder')}
            className={adminInput}
            required
          />
        </div>
        <div>
          <FieldLabel>{t('products.form.brand')}</FieldLabel>
          <input
            value={form.brand}
            onChange={(event) => set('brand', event.target.value)}
            className={adminInput}
          />
        </div>
        <div>
          <FieldLabel>{t('products.form.category')}</FieldLabel>
          <select
            value={form.category}
            onChange={(event) => set('category', event.target.value as CategoryId)}
            className={adminInput}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name.de}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>{t('products.form.price')}</FieldLabel>
          <div className="relative">
            <input
              value={form.price}
              onChange={(event) => set('price', event.target.value.replace(',', '.'))}
              inputMode="decimal"
              placeholder="249"
              className={`${adminInput} pr-8`}
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-900/35">€</span>
          </div>
        </div>
        <div>
          <FieldLabel>{t('products.form.originalPrice')}</FieldLabel>
          <div className="relative">
            <input
              value={form.originalPrice}
              onChange={(event) => set('originalPrice', event.target.value.replace(',', '.'))}
              inputMode="decimal"
              placeholder={t('products.form.optional')}
              className={`${adminInput} pr-8`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-ink-900/35">€</span>
          </div>
        </div>
        <div>
          <FieldLabel>{t('products.form.stock')}</FieldLabel>
          <input
            value={form.stock}
            onChange={(event) => set('stock', event.target.value)}
            inputMode="numeric"
            className={adminInput}
          />
        </div>
        <div>
          <FieldLabel>{t('products.form.availability')}</FieldLabel>
          <select
            value={form.availability}
            onChange={(event) =>
              set('availability', event.target.value as (typeof availabilityOptions)[number])
            }
            className={adminInput}
          >
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {t(`products.availability.${option}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>{t('products.form.taglineDe')}</FieldLabel>
          <input
            value={form.taglineDe}
            onChange={(event) => set('taglineDe', event.target.value)}
            placeholder={t('products.form.taglinePlaceholder')}
            className={adminInput}
          />
        </div>
        <div>
          <FieldLabel>{t('products.form.taglineEn')}</FieldLabel>
          <input
            value={form.taglineEn}
            onChange={(event) => set('taglineEn', event.target.value)}
            placeholder={t('products.form.taglinePlaceholder')}
            className={adminInput}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>{t('products.form.descriptionDe')}</FieldLabel>
          <textarea
            value={form.descriptionDe}
            onChange={(event) => set('descriptionDe', event.target.value)}
            placeholder={t('products.form.descriptionPlaceholder')}
            className={adminTextarea}
          />
        </div>
        <div className="sm:col-span-2">
          <FieldLabel>{t('products.form.descriptionEn')}</FieldLabel>
          <textarea
            value={form.descriptionEn}
            onChange={(event) => set('descriptionEn', event.target.value)}
            placeholder={t('products.form.descriptionPlaceholder')}
            className={adminTextarea}
          />
        </div>
      </div>

      <div>
        <FieldLabel>{t('products.form.image')}</FieldLabel>
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-900/10 bg-ink-900/[0.03]">
            {form.image ? (
              <img src={form.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus size={18} className="text-ink-900/25" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <input
              value={form.image}
              onChange={(event) => set('image', event.target.value)}
              placeholder="/assets/images/products/… oder https://…"
              className={adminInput}
            />
            <div className="mt-1.5 flex flex-wrap gap-1">
              {imageList.slice(0, 7).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => set('image', src)}
                  className={
                    form.image === src
                      ? 'h-7 w-7 overflow-hidden rounded-md ring-2 ring-electric-500'
                      : 'h-7 w-7 overflow-hidden rounded-md ring-1 ring-ink-900/10 transition hover:ring-ink-900/30'
                  }
                  aria-label={t('products.form.pickImage')}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>{t('products.form.accent')}</FieldLabel>
          <div className="flex items-center gap-2">
            {accentOptions.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => set('color', color)}
                className="flex h-7 w-7 items-center justify-center rounded-full transition"
                style={{ backgroundColor: color }}
                aria-label={color}
              >
                {form.color === color && <Check size={13} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel>{t('products.form.tags')}</FieldLabel>
          <input
            value={form.tags}
            onChange={(event) => set('tags', event.target.value)}
            placeholder={t('products.form.tagsPlaceholder')}
            className={adminInput}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-ink-900/8 bg-ink-900/[0.015] px-3.5 py-2.5">
        <label className="flex items-center gap-2 text-[11px] text-ink-900/65">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) => set('featured', event.target.checked)}
            className="h-3.5 w-3.5 accent-electric-500"
          />
          {t('products.form.featured')}
        </label>
        <label className="flex items-center gap-2 text-[11px] text-ink-900/65">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(event) => set('isNew', event.target.checked)}
            className="h-3.5 w-3.5 accent-electric-500"
          />
          {t('products.form.isNew')}
        </label>
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-600">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-ink-900/8 pt-4">
        <button type="button" onClick={onCancel} className={adminButtonGhost}>
          {t('common.cancel')}
        </button>
        <button type="submit" disabled={saving} className={adminButtonPrimary}>
          {saving ? (
            <>
              <Loader2 size={13} className="animate-spin" /> {t('products.form.publishing')}
            </>
          ) : (
            <>
              <Check size={13} /> {t('products.form.publish')}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
