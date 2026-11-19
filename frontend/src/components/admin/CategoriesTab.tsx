import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  CheckCircle2,
  FolderPlus,
  Layers,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { Category, CategoryId } from '@/types/catalog';
import { categories as baseCategories, getCategoryCount, withBase } from '@/lib/catalog';
import { slugify } from '@/lib/utils';
import { useAdminStore } from '@/stores/admin.store';
import { Modal } from '@/components/ui/Modal';
import { CategoryGifLoader } from '@/components/admin/CategoryGifLoader';
import {
  FieldLabel,
  Panel,
  TabHeader,
  adminButtonGhost,
  adminButtonPrimary,
  adminInput,
  adminTextarea,
} from '@/components/admin/AdminUi';

const accents = ['#5865F2', '#9B72F2', '#4FA3A5', '#D9587A', '#C28A3D', '#3E8BD8'];
const icons = ['speaker', 'headphones', 'monitor', 'laptop', 'keyboard', 'mouse', 'camera', 'wifi'];
const sampleImages = [
  '/assets/images/categories/audio.webp',
  '/assets/images/categories/desk.webp',
  '/assets/images/categories/gaming.webp',
  '/assets/images/categories/wearables.webp',
  '/assets/images/editorial/camera.webp',
  '/assets/images/products/speaker-teal.webp',
];

export function CategoriesTab({ query }: { query: string }) {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const customCategories = useAdminStore((state) => state.customCategories);
  const publishCategory = useAdminStore((state) => state.publishCategory);
  const deleteCategory = useAdminStore((state) => state.deleteCategory);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState<Category | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nameDe: '',
    nameEn: '',
    descriptionDe: '',
    descriptionEn: '',
    image: sampleImages[0],
    accent: accents[0],
    icon: icons[0],
  });

  const allCategories = useMemo(() => {
    const seen = new Set(customCategories.map((category) => category.id));
    return [...customCategories, ...baseCategories.filter((category) => !seen.has(category.id))];
  }, [customCategories]);

  const customIds = new Set(customCategories.map((category) => category.id));
  const search = query.trim().toLowerCase();
  const filtered = allCategories.filter(
    (category) =>
      !search ||
      `${category.name.de} ${category.name.en} ${category.id}`.toLowerCase().includes(search),
  );

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((state) => ({ ...state, [key]: value }));

  const steps: [string, string, string] = [
    t('categories.loader.structure'),
    t('categories.loader.visuals'),
    t('categories.loader.publish'),
  ];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.nameDe.trim()) {
      setError(t('categories.form.required'));
      return;
    }
    setCreating(true);
    setStep(0);
    const category: Category = {
      id: (slugify(form.nameDe) || `category-${Date.now()}`) as CategoryId,
      name: { de: form.nameDe.trim(), en: form.nameEn.trim() || form.nameDe.trim() },
      short: { de: form.nameDe.trim(), en: form.nameEn.trim() || form.nameDe.trim() },
      description: {
        de: form.descriptionDe.trim() || t('categories.form.defaultDescription'),
        en:
          form.descriptionEn.trim() ||
          form.descriptionDe.trim() ||
          t('categories.form.defaultDescription'),
      },
      image: form.image,
      icon: form.icon,
      accent: form.accent,
    };

    window.setTimeout(() => setStep(1), 850);
    window.setTimeout(() => setStep(2), 1750);
    window.setTimeout(() => {
      publishCategory(category);
      setCreating(false);
      setStep(0);
      setOpen(false);
      setCreated(category);
      setForm({
        nameDe: '',
        nameEn: '',
        descriptionDe: '',
        descriptionEn: '',
        image: sampleImages[0],
        accent: accents[0],
        icon: icons[0],
      });
    }, 2700);
  };

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('categories.eyebrow')}
        title={t('categories.title')}
        subtitle={t('categories.subtitle')}
        actions={
          <button type="button" onClick={() => setOpen(true)} className={adminButtonPrimary}>
            <FolderPlus size={14} /> {t('categories.create')}
          </button>
        }
      />

      {created && (
        <div className="flex flex-col gap-3 rounded-2xl border border-violet-500/25 bg-violet-500/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-600">
              <CheckCircle2 size={17} />
            </span>
            <div>
              <p className="text-[12px] font-semibold text-violet-950">
                {t('categories.created.title', { name: created.name[locale] })}
              </p>
              <p className="text-[10.5px] text-violet-900/55">{t('categories.created.hint')}</p>
            </div>
          </div>
          <a
            href={withBase(`/shop?category=${created.id}`)}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-violet-600 px-4 text-[11px] font-semibold text-white transition hover:bg-violet-700"
          >
            {t('categories.created.view')} <ArrowUpRight size={12} />
          </a>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: t('categories.stats.total'), value: allCategories.length, icon: Layers, tone: 'text-electric-600' },
          { label: t('categories.stats.custom'), value: customCategories.length, icon: Sparkles, tone: 'text-violet-600' },
          {
            label: t('categories.stats.products'),
            value: allCategories.reduce((sum, category) => sum + getCategoryCount(category.id), 0),
            icon: FolderPlus,
            tone: 'text-[#3B7F81]',
          },
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

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-3">
        {filtered.map((category) => {
          const isCustom = customIds.has(category.id);
          return (
            <article
              key={category.id}
              className="group relative overflow-hidden rounded-2xl border border-ink-900/[0.07] bg-white shadow-[0_1px_2px_rgba(8,13,24,0.03)]"
            >
              <div className="relative h-24 overflow-hidden">
                <img
                  src={isCustom ? withBase(category.image) : category.image}
                  alt=""
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-white/50">
                      {category.id}
                    </p>
                    <h3 className="font-display text-[15px] font-semibold text-white">
                      {category.name[locale]}
                    </h3>
                  </div>
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur">
                    {getCategoryCount(category.id)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="line-clamp-1 text-[10.5px] text-ink-900/45">
                  {category.description[locale]}
                </p>
                <div className="flex shrink-0 items-center gap-1">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: category.accent }}
                  />
                  {isCustom ? (
                    <button
                      type="button"
                      onClick={() => deleteCategory(category.id)}
                      className="rounded-full p-1 text-ink-900/25 transition hover:bg-rose-50 hover:text-rose-500"
                      aria-label={t('common.delete')}
                    >
                      <Trash2 size={12} />
                    </button>
                  ) : (
                    <span className="rounded-full bg-ink-900/5 px-1.5 py-0.5 text-[8.5px] font-medium text-ink-900/40">
                      {t('categories.builtIn')}
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Panel
        title={t('categories.engine.title')}
        subtitle={t('categories.engine.subtitle')}
        className="border-violet-500/15 bg-gradient-to-r from-violet-500/[0.04] to-white"
      >
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-[11px] leading-relaxed text-ink-900/55">
            {t('categories.engine.text')}
          </p>
          <button type="button" onClick={() => setOpen(true)} className={adminButtonGhost}>
            <Sparkles size={13} /> {t('categories.engine.cta')}
          </button>
        </div>
      </Panel>

      <Modal
        open={open}
        onClose={() => {
          if (!creating) setOpen(false);
        }}
        title={t('categories.form.title')}
        className="max-w-xl"
      >
        {creating ? (
          <div className="p-6">
            <div className="mb-4 pr-8">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-violet-600">
                {t('categories.form.eyebrow')}
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em]">
                {t('categories.loader.title')}
              </h3>
              <p className="mt-1 text-[11px] text-ink-900/45">{t('categories.loader.subtitle')}</p>
            </div>
            <CategoryGifLoader step={step} steps={steps} />
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-6">
            <div className="pr-8">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-electric-600">
                {t('categories.form.eyebrow')}
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em]">
                {t('categories.form.title')}
              </h3>
              <p className="mt-1 text-[11px] text-ink-900/45">{t('categories.form.subtitle')}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>{t('categories.form.nameDe')}</FieldLabel>
                <input
                  value={form.nameDe}
                  onChange={(event) => set('nameDe', event.target.value)}
                  placeholder="Studio & Desk"
                  className={adminInput}
                  required
                />
              </div>
              <div>
                <FieldLabel>{t('categories.form.nameEn')}</FieldLabel>
                <input
                  value={form.nameEn}
                  onChange={(event) => set('nameEn', event.target.value)}
                  placeholder="Studio & Desk"
                  className={adminInput}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>{t('categories.form.descriptionDe')}</FieldLabel>
                <textarea
                  value={form.descriptionDe}
                  onChange={(event) => set('descriptionDe', event.target.value)}
                  placeholder={t('categories.form.descriptionPlaceholder')}
                  className={adminTextarea}
                />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>{t('categories.form.descriptionEn')}</FieldLabel>
                <textarea
                  value={form.descriptionEn}
                  onChange={(event) => set('descriptionEn', event.target.value)}
                  placeholder={t('categories.form.descriptionPlaceholder')}
                  className={adminTextarea}
                />
              </div>
            </div>

            <div>
              <FieldLabel>{t('categories.form.image')}</FieldLabel>
              <div className="flex items-center gap-3">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-ink-900/10">
                  <img src={form.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    value={form.image}
                    onChange={(event) => set('image', event.target.value)}
                    className={adminInput}
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {sampleImages.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => set('image', src)}
                        className={
                          form.image === src
                            ? 'h-7 w-10 overflow-hidden rounded-md ring-2 ring-electric-500'
                            : 'h-7 w-10 overflow-hidden rounded-md ring-1 ring-ink-900/10 transition hover:ring-ink-900/30'
                        }
                        aria-label={t('categories.form.pickImage')}
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
                <FieldLabel>{t('categories.form.accent')}</FieldLabel>
                <div className="flex items-center gap-2">
                  {accents.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => set('accent', color)}
                      className="flex h-7 w-7 items-center justify-center rounded-full transition"
                      style={{ backgroundColor: color }}
                      aria-label={color}
                    >
                      {form.accent === color && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <FieldLabel>{t('categories.form.icon')}</FieldLabel>
                <select
                  value={form.icon}
                  onChange={(event) => set('icon', event.target.value)}
                  className={adminInput}
                >
                  {icons.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-ink-900/8 pt-4">
              <button type="button" onClick={() => setOpen(false)} className={adminButtonGhost}>
                {t('common.cancel')}
              </button>
              <button type="submit" className={adminButtonPrimary}>
                <Sparkles size={13} /> {t('categories.form.create')}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
