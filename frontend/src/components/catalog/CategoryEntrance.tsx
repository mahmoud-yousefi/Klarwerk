import { useTranslation } from 'react-i18next';
import { CategoryLoader } from '@/components/ui/CategoryLoader';
import { categories } from '@/lib/catalog';

/**
 * Full category reveal shown once before a category's products appear.
 * Kept intentionally short and calm: one real product image, one accent,
 * one line of copy.
 */
export function CategoryEntrance({ category }: { category: string }) {
  const { t, i18n } = useTranslation(['store', 'common']);
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const entry = categories.find((item) => item.id === category);

  if (!entry) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background: `radial-gradient(circle at 30% 50%, ${entry.accent}, transparent 55%)`,
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${entry.accent}66, transparent)` }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center gap-7 px-6 py-12 text-center sm:flex-row sm:justify-center sm:gap-10 sm:px-10 sm:py-16 sm:text-left">
        <CategoryLoader category={category} size="xl" label={t('store:catalog.loading')} />

        <div className="max-w-sm">
          <p className="eyebrow" style={{ color: entry.accent }}>
            {t('store:catalog.preparing')}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-[1.05] tracking-[-0.035em]">
            {entry.name[locale]}
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-900/50">
            {entry.description[locale]}
          </p>

          <span className="mt-5 block h-[3px] w-44 overflow-hidden rounded-full bg-ink-900/10">
            <span
              className="kw-loader-progress block h-full w-1/2 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${entry.accent})` }}
            />
          </span>
          <p className="mt-2 text-[10px] text-ink-900/30">{t('store:catalog.loadingHint')}</p>
        </div>
      </div>
    </div>
  );
}
