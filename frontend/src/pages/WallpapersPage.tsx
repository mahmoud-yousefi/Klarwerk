import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Download, Image as ImageIcon, Sparkles } from 'lucide-react';
import wallpapers from '@/data/wallpapers.json';
import { asset } from '@/lib/catalog';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { cn } from '@/lib/utils';

type Filter = 'all' | 'dark' | 'light' | 'minimal';

export default function WallpapersPage() {
  const { t, i18n } = useTranslation(['store', 'common']);
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const [filter, setFilter] = useState<Filter>('all');

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: t('store:wallpapers.filterAll') },
    { id: 'dark', label: t('store:wallpapers.filterDark') },
    { id: 'light', label: t('store:wallpapers.filterLight') },
    { id: 'minimal', label: t('store:wallpapers.filterMinimal') },
  ];

  const visible = useMemo(
    () => (filter === 'all' ? wallpapers : wallpapers.filter((item) => item.tag === filter)),
    [filter],
  );

  return (
    <div className="bg-mist">
      <div className="container-x py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: t('common:product.breadcrumbHome'), to: '/' },
            { label: t('common:nav.wallpapers') },
          ]}
          className="mb-6"
        />

        <div className="flex flex-col gap-5 border-b border-ink-900/8 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-electric-600">
              <ImageIcon size={13} /> {t('store:wallpapers.eyebrow')}
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              {t('store:wallpapers.title')}
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-900/50">
              {t('store:wallpapers.intro')}
            </p>
          </div>

          <Link
            to="/learn"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 self-start rounded-full border border-ink-900/12 bg-white px-4 text-[11px] font-medium text-ink-900/60 transition hover:border-ink-900/30 hover:text-ink-900 lg:self-auto"
          >
            {t('store:wallpapers.backToLearn')} <ArrowRight size={11} />
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {filters.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setFilter(entry.id)}
              aria-pressed={filter === entry.id}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-[11px] transition',
                filter === entry.id
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-ink-900/12 bg-white text-ink-900/55 hover:border-ink-900/30 hover:text-ink-900',
              )}
            >
              {entry.label}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-ink-900/35">
            {t('common:search.results', { count: visible.length })}
          </span>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((wallpaper) => {
            const file = asset(wallpaper.file);
            const name = wallpaper.name[locale];
            return (
              <article
                key={wallpaper.id}
                className="group overflow-hidden rounded-3xl border border-ink-900/8 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <a
                  href={file}
                  download={`klarwerk-${wallpaper.id}.svg`}
                  className="relative block aspect-[16/9] overflow-hidden bg-ink-900"
                  aria-label={t('store:wallpapers.downloadAria', { name })}
                >
                  <img
                    src={file}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink-950/0 transition duration-300 group-hover:bg-ink-950/35">
                    <span className="inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold text-ink-900 opacity-0 shadow-sm transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <Download size={11} /> {t('store:wallpapers.download')}
                    </span>
                  </span>
                </a>

                <div className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <h2 className="font-display text-base font-semibold tracking-[-0.02em]">
                      {name}
                    </h2>
                    <p className="mt-0.5 text-[10px] text-ink-900/40">{wallpaper.mood[locale]}</p>
                    <div className="mt-2 flex items-center gap-1">
                      {wallpaper.colors.map((color) => (
                        <span
                          key={color}
                          className="h-2.5 w-2.5 rounded-full border border-ink-900/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <a
                    href={file}
                    download={`klarwerk-${wallpaper.id}.svg`}
                    aria-label={t('store:wallpapers.downloadAria', { name })}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-900/12 text-ink-900/45 transition hover:border-ink-900/30 hover:bg-ink-900 hover:text-white"
                  >
                    <Download size={13} />
                  </a>
                </div>
                <p className="border-t border-ink-900/6 px-4 py-2 text-[9px] uppercase tracking-[0.1em] text-ink-900/30">
                  {t('store:wallpapers.format')}
                </p>
              </article>
            );
          })}
        </div>

        <p className="mt-5 text-center text-[10px] text-ink-900/30">
          {t('store:wallpapers.note')}
        </p>

        <section className="relative mt-12 overflow-hidden rounded-4xl bg-ink-900 p-7 text-white sm:p-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 80% 25%, rgba(155,114,242,0.25), transparent 45%), radial-gradient(circle at 12% 90%, rgba(88,101,242,0.2), transparent 42%)',
            }}
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-violet-300">
                <Sparkles size={13} /> Klarwerk AI
              </p>
              <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-4xl">
                {t('store:wallpapers.advisorTitle')}
              </h2>
              <p className="mt-3 max-w-lg text-[12px] leading-relaxed text-white/50">
                {t('store:wallpapers.advisorText')}
              </p>
            </div>
            <Link
              to="/advisor"
              className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-white px-5 text-[12px] font-semibold text-ink-900 transition hover:bg-electric-100 sm:self-auto"
            >
              <Sparkles size={14} className="text-violet-600" />
              {t('store:wallpapers.advisorCta')}
              <ArrowRight size={13} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
