import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { articles, articleCategories, getArticlesByCategory } from '@/lib/catalog';
import { Newsletter } from '@/components/marketing/Newsletter';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { cn, formatDate } from '@/lib/utils';
import type { Locale } from '@/types/catalog';

export default function MagazinePage() {
  const { t, i18n } = useTranslation('editorial');
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const [searchParams, setSearchParams] = useSearchParams();
  const topic = searchParams.get('topic') ?? 'all';
  const featured = articles.find((article) => article.featured) ?? articles[0];
  const filtered = getArticlesByCategory(topic);
  const showFeatured = topic === 'all';
  const list = showFeatured
    ? filtered.filter((article) => article.id !== featured.id)
    : filtered;

  const setTopic = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('topic');
    else next.set('topic', value);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="bg-mist">
      <div className="container-x py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: t('common:product.breadcrumbHome', { defaultValue: 'Start' }), to: '/' },
            { label: t('meta.title') },
          ]}
          className="mb-6"
        />

        <div className="flex flex-col gap-5 border-b border-ink-900/8 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-electric-600">
              <BookOpen size={13} /> {t('meta.title')}
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
              {t('meta.subtitle')}
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-900/50">
              {t('meta.intro')}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-ink-900/10 bg-white px-4 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-900/35">
              {t('meta.latest')}
            </p>
            <p className="mt-1 font-display text-sm font-semibold tracking-[-0.01em]">
              {t('meta.issue')}
            </p>
            <p className="mt-0.5 text-[10px] text-ink-900/40">
              {t('common:search.results', { count: filtered.length })}
            </p>
          </div>
        </div>

        {showFeatured && (
          <article className="mt-8 overflow-hidden rounded-4xl border border-ink-900/8 bg-white">
            <div className="grid lg:grid-cols-[1.15fr_1fr]">
              <Link
                to={`/magazine/${featured.slug}`}
                className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[380px]"
              >
                <img
                  src={featured.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-900/65 backdrop-blur">
                  {t('meta.featured')}
                </span>
              </Link>

              <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
                <p className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-ink-900/35">
                  <span className="rounded-full bg-electric-500/10 px-2 py-1 font-semibold text-electric-600">
                    {t(`categories.${featured.category}`)}
                  </span>
                  {formatDate(featured.publishedAt, locale)} ·{' '}
                  {t('meta.readingTime', { count: featured.readingMinutes })}
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.06] tracking-[-0.04em] sm:text-4xl">
                  <Link to={`/magazine/${featured.slug}`} className="transition hover:text-electric-600">
                    {featured.title[locale]}
                  </Link>
                </h2>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-900/55">
                  {featured.excerpt[locale]}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/8 pt-4">
                  <p className="text-[10px] text-ink-900/40">
                    {t('meta.by', { author: featured.author })}
                  </p>
                  <Link
                    to={`/magazine/${featured.slug}`}
                    className="group inline-flex items-center gap-1.5 text-[12px] font-medium text-electric-600"
                  >
                    {t('meta.readMore')}
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900/35">
            {t('meta.filterLabel')}
          </span>
          {['all', ...articleCategories].map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setTopic(category)}
              aria-pressed={topic === category}
              className={cn(
                'rounded-full border px-3 py-1.5 text-[11px] transition',
                topic === category
                  ? 'border-ink-900 bg-ink-900 text-white'
                  : 'border-ink-900/12 bg-white text-ink-900/55 hover:border-ink-900/30 hover:text-ink-900',
              )}
            >
              {t(`categories.${category}`)}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
            {topic === 'all' ? t('meta.latest') : t(`categories.${topic}`)}
          </h2>
          <span className="text-[10px] text-ink-900/35">{t('meta.allArticles')}</span>
        </div>

        {list.length === 0 ? (
          <div className="mt-5 rounded-3xl border border-dashed border-ink-900/15 bg-white/60 px-6 py-14 text-center">
            <p className="text-[13px] text-ink-900/50">{t('meta.empty')}</p>
            <button
              type="button"
              onClick={() => setTopic('all')}
              className="mt-3 text-[11px] font-medium text-electric-600"
            >
              {t('meta.emptyCta')}
            </button>
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((article) => (
              <article
                key={article.id}
                className="group flex flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <Link to={`/magazine/${article.slug}`} className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={article.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-900/65 backdrop-blur">
                    {t(`categories.${article.category}`)}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-ink-900/35">
                    <Clock size={10} />
                    {t('meta.readingTimeShort', { count: article.readingMinutes })} ·{' '}
                    {formatDate(article.publishedAt, locale)}
                  </p>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug tracking-[-0.02em]">
                    <Link to={`/magazine/${article.slug}`} className="transition hover:text-electric-600">
                      {article.title[locale]}
                    </Link>
                  </h3>
                  <p className="mt-1.5 line-clamp-3 flex-1 text-[12px] leading-relaxed text-ink-900/50">
                    {article.excerpt[locale]}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-ink-900/6 pt-3">
                    <span className="text-[10px] text-ink-900/35">{article.author}</span>
                    <Link
                      to={`/magazine/${article.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-electric-600"
                    >
                      {t('meta.readMore')} <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-ink-900/8 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
                {t('meta.about')}
              </h2>
              <p className="mt-1.5 max-w-xl text-[12px] leading-relaxed text-ink-900/50">
                {t('meta.aboutText')}
              </p>
            </div>
            <span className="rounded-full border border-ink-900/10 px-3 py-1.5 text-[10px] text-ink-900/40">
              {t('meta.authorRole')}
            </span>
          </div>
        </div>

        <div className="mt-10">
          <Newsletter />
        </div>
      </div>
    </div>
  );
}
