import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Copy,
  Sparkles,
} from 'lucide-react';
import { articles, getArticle } from '@/lib/catalog';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Newsletter } from '@/components/marketing/Newsletter';
import { useToastStore } from '@/stores/toast.store';
import { formatDate } from '@/lib/utils';
import type { Locale } from '@/types/catalog';

export default function ArticlePage() {
  const { slug = '' } = useParams();
  const { t, i18n } = useTranslation(['editorial', 'common']);
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const push = useToastStore((state) => state.push);
  const article = getArticle(slug);

  if (!article) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon={<BookOpen size={24} />}
          title={t('editorial:meta.empty')}
          text={t('common:errors.notFoundText')}
          action={
            <Link
              to="/magazine"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
            >
              <ArrowLeft size={13} /> {t('editorial:meta.back')}
            </Link>
          }
        />
      </div>
    );
  }

  const paragraphs = article.body[locale];
  const related = [
    ...articles.filter(
      (entry) => entry.id !== article.id && entry.category === article.category,
    ),
    ...articles.filter(
      (entry) => entry.id !== article.id && entry.category !== article.category,
    ),
  ].slice(0, 3);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      push(t('common:toast.linkCopied'), 'info');
    } catch {
      push(t('common:errors.generic'), 'error');
    }
  };

  return (
    <div className="bg-mist">
      <div className="container-x py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: t('common:product.breadcrumbHome'), to: '/' },
            { label: t('editorial:meta.title'), to: '/magazine' },
            { label: t(`editorial:categories.${article.category}`) },
          ]}
          className="mb-6"
        />

        <article className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="eyebrow justify-center text-electric-600">
              <BookOpen size={13} /> {t(`editorial:categories.${article.category}`)}
            </p>
            <h1 className="mx-auto mt-3 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {article.title[locale]}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[14px] leading-relaxed text-ink-900/55">
              {article.excerpt[locale]}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-ink-900/40">
              <span>{t('editorial:meta.by', { author: article.author })}</span>
              <span aria-hidden="true">·</span>
              <span>{formatDate(article.publishedAt, locale)}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Clock size={11} /> {t('editorial:meta.readingTime', { count: article.readingMinutes })}
              </span>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-2.5 py-1 text-[10px] font-medium text-ink-900/50 transition hover:border-ink-900/30 hover:text-ink-900"
              >
                <Copy size={10} /> {t('editorial:meta.share')}
              </button>
            </div>
          </div>

          <figure className="mt-8 overflow-hidden rounded-4xl border border-ink-900/8 bg-white">
            <img
              src={article.image}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          </figure>

          <div className="mt-10 grid gap-8 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-12">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-900/35">
                  {t('editorial:meta.topics')}
                </p>
                <p className="mt-1 text-[12px] font-medium">
                  {t(`editorial:categories.${article.category}`)}
                </p>
                <div className="mt-3 border-t border-ink-900/8 pt-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-900/35">
                    {t('editorial:meta.authorRole')}
                  </p>
                  <p className="mt-1 text-[12px] font-medium">{article.author}</p>
                </div>
                <button
                  type="button"
                  onClick={share}
                  className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-full border border-ink-900/12 text-[10px] font-medium text-ink-900/55 transition hover:border-ink-900/30 hover:text-ink-900"
                >
                  <Copy size={10} /> {t('editorial:meta.share')}
                </button>
              </div>

              <div className="mt-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
                <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                  <Sparkles size={11} /> {t('editorial:meta.editorsPick')}
                </p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-ink-900/45">
                  {t('editorial:meta.aboutText')}
                </p>
                <Link
                  to="/advisor"
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-violet-700"
                >
                  {t('common:nav.advisor')} <ArrowRight size={10} />
                </Link>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="space-y-5">
                {paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={
                      index === 0
                        ? 'text-[16px] leading-[1.75] text-ink-900/75 first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-ink-900'
                        : 'text-[14px] leading-[1.8] text-ink-900/65'
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-ink-900/8 bg-white p-5">
                <p className="text-[10px] leading-relaxed text-ink-900/40">
                  {t('editorial:meta.articleEnd')}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link
                    to="/magazine"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-ink-900/55 transition hover:text-ink-900"
                  >
                    <ArrowLeft size={11} /> {t('editorial:meta.back')}
                  </Link>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-electric-600"
                  >
                    {t('common:actions.shopNow')} <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </article>

        <section className="mx-auto mt-12 max-w-5xl border-t border-ink-900/8 pt-8">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
            {t('editorial:meta.related')}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {related.map((entry) => (
              <Link
                key={entry.id}
                to={`/magazine/${entry.slug}`}
                className="group overflow-hidden rounded-2xl border border-ink-900/8 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={entry.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-ink-900/35">
                    {t(`editorial:categories.${entry.category}`)} ·{' '}
                    {t('editorial:meta.readingTimeShort', { count: entry.readingMinutes })}
                  </p>
                  <h3 className="mt-1.5 text-[13px] font-medium leading-snug transition group-hover:text-electric-600">
                    {entry.title[locale]}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="mx-auto mt-10 max-w-5xl">
          <Newsletter />
        </div>
      </div>
    </div>
  );
}
