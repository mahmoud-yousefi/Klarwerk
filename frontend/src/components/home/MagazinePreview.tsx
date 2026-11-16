import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { articles } from '@/lib/catalog';
import { formatDate } from '@/lib/utils';
import { Reveal } from '@/components/ui/Reveal';

export function MagazinePreview() {
  const { t, i18n } = useTranslation('editorial');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const items = articles.slice(0, 3);

  return (
    <section className="bg-mist py-20 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-electric-600">
                {t('store:home.magazine.eyebrow')}
              </p>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
                {t('store:home.magazine.title')}
              </h2>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <p className="max-w-xs text-[13px] leading-relaxed text-ink-900/50">
                {t('store:home.magazine.subtitle')}
              </p>
              <Link
                to="/magazine"
                className="group inline-flex items-center gap-1.5 text-[12px] font-medium text-electric-600"
              >
                {t('store:home.magazine.cta')}
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((article, index) => (
            <Reveal key={article.id} delay={index * 70}>
              <Link
                to={`/magazine/${article.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white transition duration-500 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={article.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-900/70 backdrop-blur">
                    {t(`categories.${article.category}`)}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-ink-900/35">
                    {formatDate(article.publishedAt, locale)} ·{' '}
                    {t('meta.readingTimeShort', { count: article.readingMinutes })}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold leading-snug tracking-[-0.02em]">
                    {article.title[locale]}
                  </h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-[12px] leading-relaxed text-ink-900/50">
                    {article.excerpt[locale]}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-medium text-electric-600">
                    {t('meta.readMore')}
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
