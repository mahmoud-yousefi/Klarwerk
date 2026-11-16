import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { categories } from '@/lib/catalog';
import site from '@/data/site.json';

export function Footer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';

  const shopLinks = categories.slice(0, 6).map((category) => ({
    to: `/shop?category=${category.id}`,
    label: category.name[locale],
  }));

  const companyLinks = [
    { to: '/info/about', label: t('footer.about') },
    { to: '/magazine', label: t('footer.magazine') },
    { to: '/advisor', label: t('footer.advisor') },
  ];

  const serviceLinks = [
    { to: '/info/shipping', label: t('footer.shipping') },
    { to: '/info/returns', label: t('footer.returns') },
    { to: '/info/warranty', label: t('footer.warranty') },
    { to: '/info/faq', label: t('footer.faq') },
  ];

  const legalLinks = [
    { to: '/info/privacy', label: t('footer.privacy') },
    { to: '/info/terms', label: t('footer.terms') },
    { to: '/info/imprint', label: t('footer.imprint') },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-electric-500/8 blur-3xl" />

      <div className="container-x relative">
        <div className="grid gap-10 border-b border-white/8 py-14 lg:grid-cols-[1.3fr_2fr] lg:gap-16">
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-xs font-display text-2xl font-medium leading-snug tracking-[-0.02em] text-white/80">
              {t('brand.tagline')}
            </p>
            <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-white/35">
              {t('footer.demoNote')}
            </p>

            <Link
              to="/advisor"
              className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-violet-300">
                <Sparkles size={15} />
              </span>
              <span>
                <span className="block text-[12px] font-medium text-white/85">
                  {t('nav.advisor')}
                </span>
                <span className="block text-[10px] text-white/35">{t('assistant:welcome.text').slice(0, 64)}…</span>
              </span>
              <ArrowUpRight size={14} className="ml-2 text-white/35" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.shop')}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {shopLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[12px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/shop" className="text-[12px] font-medium text-electric-300 hover:text-white">
                    {t('nav.allProducts')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.company')}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[12px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${site.company.email}`}
                    className="text-[12px] text-white/55 transition hover:text-white"
                  >
                    {t('footer.contact')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.help')}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {serviceLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[12px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[10px] leading-relaxed text-white/30">
                {site.supportHours[locale]}
              </p>
            </div>

            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.legal')}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[12px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/30">
            <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
            <span className="hidden h-3 w-px bg-white/15 sm:block" />
            <span>{t('footer.madeIn')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {['Visa', 'Mastercard', 'PayPal', 'SEPA', 'Rechnung'].map((method) => (
              <span
                key={method}
                className="rounded-md border border-white/10 px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-white/35"
              >
                {method}
              </span>
            ))}
            <span className="ml-1 text-[9px] uppercase tracking-[0.08em] text-white/20">
              {t('demo.label')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
