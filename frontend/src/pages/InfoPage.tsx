import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  LifeBuoy,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import infoPages from '@/data/info.json';
import site from '@/data/site.json';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types/catalog';

export default function InfoPage() {
  const { slug = '' } = useParams();
  const { t, i18n } = useTranslation(['store', 'common']);
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const page = infoPages.find((entry) => entry.id === slug);

  if (!page) {
    return (
      <div className="container-x py-16">
        <EmptyState
          icon={<FileText size={24} />}
          title={t('store:info.notFound')}
          text={t('common:errors.notFoundText')}
          action={
            <Link
              to="/"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-5 text-[13px] font-medium text-white transition hover:bg-ink-800"
            >
              <ArrowLeft size={13} /> {t('common:actions.backHome')}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-mist">
      <div className="container-x py-8 sm:py-10">
        <Breadcrumbs
          items={[
            { label: t('common:product.breadcrumbHome'), to: '/' },
            { label: t('store:info.back'), to: '/' },
            { label: page.title[locale] },
          ]}
          className="mb-6"
        />

        <div className="grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink-900/8 bg-white p-3">
              <p className="px-2 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ink-900/35">
                {t('common:footer.help')}
              </p>
              <nav aria-label={t('common:footer.help')} className="mt-1 space-y-0.5">
                {infoPages.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/info/${entry.id}`}
                    aria-current={entry.id === page.id ? 'page' : undefined}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-2.5 py-2 text-[11px] transition',
                      entry.id === page.id
                        ? 'bg-ink-900 text-white'
                        : 'text-ink-900/55 hover:bg-ink-900/[0.045] hover:text-ink-900',
                    )}
                  >
                    {entry.title[locale]}
                    <ArrowRight
                      size={10}
                      className={entry.id === page.id ? 'opacity-70' : 'opacity-25'}
                    />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-4">
              <p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                <Sparkles size={11} /> {t('common:nav.advisor')}
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-ink-900/45">
                {t('assistant:meta.intro', {
                  defaultValue:
                    locale === 'de'
                      ? 'Finde das passende Gerät mit dem katalogbasierten KI-Berater.'
                      : 'Find the right device with the catalog-grounded AI advisor.',
                })}
              </p>
              <Link
                to="/advisor"
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-violet-700"
              >
                {t('common:actions.learnMore')} <ArrowRight size={10} />
              </Link>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-900/8 pb-6">
              <div>
                <p className="eyebrow text-electric-600">
                  <LifeBuoy size={13} /> {t('common:footer.help')}
                </p>
                <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-5xl">
                  {page.title[locale]}
                </h1>
                <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-900/50">
                  {page.subtitle[locale]}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {page.sections.map((section, index) => (
                <section
                  key={`${section.heading[locale]}-${index}`}
                  className="rounded-2xl border border-ink-900/8 bg-white p-5 sm:p-6"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-electric-500/10 text-[10px] font-semibold text-electric-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">
                        {section.heading[locale]}
                      </h2>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-900/55">
                        {section.body[locale]}
                      </p>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-ink-900/8 bg-white">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-electric-500/10 text-electric-600">
                    <Mail size={17} />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-semibold tracking-[-0.02em]">
                      {t('store:info.contactTitle')}
                    </h2>
                    <p className="mt-1 max-w-md text-[12px] leading-relaxed text-ink-900/50">
                      {t('store:info.contactText')}
                    </p>
                  </div>
                </div>
                <a
                  href={`mailto:${site.company.email}`}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full bg-ink-900 px-4 text-[11px] font-medium text-white transition hover:bg-ink-800"
                >
                  <Mail size={12} /> {t('store:info.email')}
                </a>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-900/8 bg-mist/60 px-5 py-3">
                <p className="flex items-center gap-1.5 text-[9px] text-ink-900/35">
                  <ShieldCheck size={10} /> {t('common:footer.madeIn')}
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 text-[10px] font-medium text-ink-900/45 transition hover:text-ink-900"
                >
                  {t('store:info.back')} <ArrowRight size={10} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
