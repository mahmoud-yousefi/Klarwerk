import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Sparkles,
  Wallpaper,
} from 'lucide-react';
import learnData from '@/data/learn.json';
import wallpapers from '@/data/wallpapers.json';
import { asset } from '@/lib/catalog';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function LearnPage() {
  const { t, i18n } = useTranslation(['store', 'common']);
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const prompts = [t('store:learn.prompt1'), t('store:learn.prompt2'), t('store:learn.prompt3')];

  return (
    <div className="bg-mist">
      <div className="container-x py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: t('common:product.breadcrumbHome'), to: '/' },
            { label: t('common:nav.learn') },
          ]}
          className="mb-6"
        />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-4xl bg-ink-900 text-white">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 78% 30%, rgba(155,114,242,0.22), transparent 46%), radial-gradient(circle at 20% 80%, rgba(88,101,242,0.18), transparent 44%)',
            }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" aria-hidden="true" />

          <div className="relative grid gap-9 p-7 sm:p-10 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:p-12">
            <div>
              <p className="eyebrow text-electric-300">
                <GraduationCap size={14} /> {t('store:learn.eyebrow')}
              </p>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                {t('store:learn.title')}
              </h1>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-white/55">
                {t('store:learn.intro')}
              </p>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link
                  to="/advisor"
                  className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[12px] font-semibold text-ink-900 transition hover:bg-electric-100"
                >
                  <Sparkles size={14} className="text-violet-600" />
                  {t('store:learn.advisorCta')}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#glossary"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[12px] font-medium text-white/75 transition hover:border-white/30 hover:text-white"
                >
                  <BookOpen size={14} /> {t('store:learn.glossaryTitle')}
                </a>
              </div>

              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-5">
                {[
                  { value: String(learnData.paths.length), label: t('store:learn.statPaths') },
                  { value: String(learnData.glossary.length), label: t('store:learn.statTerms') },
                  { value: '6', label: t('store:learn.statMinutes') },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-2xl font-semibold tracking-[-0.03em]">
                      {stat.value}
                    </dt>
                    <dd className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/35">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="hidden grid-cols-2 gap-3 lg:grid">
              {learnData.paths.slice(0, 4).map((path, index) => (
                <div
                  key={path.id}
                  className={
                    index === 0
                      ? 'relative col-span-2 aspect-[16/7] overflow-hidden rounded-2xl border border-white/10'
                      : 'relative aspect-square overflow-hidden rounded-2xl border border-white/10'
                  }
                >
                  <img
                    src={asset(path.image)}
                    alt=""
                    className="h-full w-full object-cover opacity-70 transition duration-700 hover:scale-105 hover:opacity-100"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/15 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 p-3">
                    <span className="block text-[11px] font-medium text-white/90">
                      {path.title[locale]}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-white/40">
                      {t('store:learn.topics', { count: path.topics.length })}
                    </span>
                  </span>
                  <span
                    className="absolute left-3 top-3 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: path.accent }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Learning paths */}
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow text-electric-600">
                <BookOpen size={13} /> {t('store:learn.pathsTitle')}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {t('store:learn.pathsText')}
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] text-ink-900/30">
              {t('store:learn.topics', { count: learnData.paths.length })}
            </span>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {learnData.paths.map((path, index) => (
              <Link
                key={path.id}
                to={`/magazine/${path.article}`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={asset(path.image)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-transparent" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-900/65 backdrop-blur">
                    {locale === 'de' ? 'Pfad' : 'Path'} {String(index + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="absolute bottom-3 left-3 h-1 w-10 rounded-full"
                    style={{ backgroundColor: path.accent }}
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">
                    {path.title[locale]}
                  </h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-900/50">
                    {path.text[locale]}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {path.topics.map((topic) => (
                      <span
                        key={topic.de}
                        className="rounded-full border border-ink-900/10 px-2 py-0.5 text-[9px] text-ink-900/45"
                      >
                        {topic[locale]}
                      </span>
                    ))}
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1 border-t border-ink-900/6 pt-3 text-[11px] font-medium text-electric-600">
                    {t('store:learn.pathCta')}
                    <ArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Glossary */}
        <section id="glossary" className="mt-14 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow text-violet-600">
                <BookOpen size={13} /> {t('store:learn.glossaryTitle')}
              </p>
              <h2 className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                {t('store:learn.glossaryText')}
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {learnData.glossary.map((entry) => (
              <div
                key={entry.term}
                className="rounded-2xl border border-ink-900/8 bg-white p-4 transition hover:border-violet-500/30"
              >
                <p className="font-display text-lg font-semibold tracking-[-0.02em]">{entry.term}</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-ink-900/50">
                  {entry.text[locale]}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AI advisor */}
        <section className="relative mt-14 overflow-hidden rounded-4xl bg-ink-900 p-7 text-white sm:p-10">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 85% 20%, rgba(155,114,242,0.25), transparent 46%), radial-gradient(circle at 10% 90%, rgba(88,101,242,0.2), transparent 42%)',
            }}
            aria-hidden="true"
          />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div>
              <p className="eyebrow text-violet-300">
                <Sparkles size={13} /> {t('store:learn.advisorEyebrow')}
              </p>
              <h2 className="mt-3 max-w-lg font-display text-3xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-4xl">
                {t('store:learn.advisorTitle')}
              </h2>
              <p className="mt-3 max-w-lg text-[12px] leading-relaxed text-white/50">
                {t('store:learn.advisorText')}
              </p>
              <Link
                to="/advisor"
                className="group mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[12px] font-semibold text-ink-900 transition hover:bg-electric-100"
              >
                <Sparkles size={14} className="text-violet-600" />
                {t('store:learn.advisorCta')}
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <p className="mt-3 text-[10px] text-white/30">{t('store:learn.advisorNote')}</p>
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('store:learn.prompts')}
              </p>
              <div className="mt-3 space-y-2">
                {prompts.map((prompt) => (
                  <Link
                    key={prompt}
                    to={`/advisor?q=${encodeURIComponent(prompt)}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] text-white/70 transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                  >
                    <span>„{prompt}“</span>
                    <ArrowUpRight size={13} className="shrink-0 text-white/35" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Wallpaper teaser */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-ink-900/8 bg-white">
          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric-500/10 text-electric-600">
                <Wallpaper size={17} />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">
                  {t('store:learn.wallpaperTitle')}
                </h2>
                <p className="mt-1 max-w-md text-[12px] leading-relaxed text-ink-900/50">
                  {t('store:learn.wallpaperText')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1.5 sm:flex">
                {wallpapers.slice(0, 3).map((wallpaper) => (
                  <img
                    key={wallpaper.id}
                    src={asset(wallpaper.file)}
                    alt=""
                    className="h-10 w-16 rounded-lg border border-ink-900/8 object-cover"
                  />
                ))}
              </div>
              <Link
                to="/wallpapers"
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-ink-900 px-4 text-[11px] font-medium text-white transition hover:bg-ink-800"
              >
                {t('store:learn.wallpaperCta')} <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
