import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CreditCard,
  Headphones,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Youtube,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from './LanguageSwitcher';
import { categories } from '@/lib/catalog';
import site from '@/data/site.json';

export function Footer() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';

  const shopLinks = categories.slice(0, 8).map((category) => ({
    to: `/shop?category=${category.id}`,
    label: category.name[locale],
  }));

  const discoverLinks = [
    { to: '/magazine', label: t('footer.magazine') },
    { to: '/learn', label: t('footer.learn') },
    { to: '/wallpapers', label: t('footer.wallpapers') },
    { to: '/advisor', label: t('footer.advisor') },
  ];

  const companyLinks = [
    { to: '/info/about', label: t('footer.about') },
    { to: '/info/faq', label: t('footer.faq') },
    { to: '/info/warranty', label: t('footer.warranty') },
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

  const trust = [
    {
      icon: Truck,
      title: t('footer.trustShipping'),
      text: t('footer.trustShippingText'),
    },
    {
      icon: RotateCcw,
      title: t('footer.trustReturns'),
      text: t('footer.trustReturnsText'),
    },
    {
      icon: ShieldCheck,
      title: t('footer.trustWarranty'),
      text: t('footer.trustWarrantyText'),
    },
    {
      icon: Headphones,
      title: t('footer.trustSupport'),
      text: t('footer.trustSupportText'),
    },
  ];

  return (
    <footer className="relative overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-electric-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="container-x relative">
        {/* AI CTA */}
        <div className="grid gap-6 border-b border-white/8 py-11 lg:grid-cols-[1.45fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-violet-300">
              <Sparkles size={12} /> {t('footer.ctaEyebrow')}
            </p>
            <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-4xl">
              {t('footer.ctaTitle')}
            </h2>
            <p className="mt-3 max-w-lg text-[12px] leading-relaxed text-white/45">
              {t('footer.ctaText')}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 lg:justify-end">
            <Link
              to="/advisor"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[12px] font-semibold text-ink-900 transition hover:bg-electric-100"
            >
              <Sparkles size={14} className="text-violet-600" />
              {t('footer.ctaAdvisor')}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/learn"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-[12px] font-medium text-white/75 transition hover:border-white/30 hover:text-white"
            >
              <BookOpen size={14} />
              {t('footer.learn')}
            </Link>
          </div>
        </div>

        {/* Trust row */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-5 border-b border-white/8 py-6 md:grid-cols-4">
          {trust.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-electric-300">
                  <Icon size={13} strokeWidth={1.7} />
                </span>
                <span>
                  <span className="block text-[11px] font-medium text-white/80">{item.title}</span>
                  <span className="mt-0.5 block text-[10px] leading-relaxed text-white/35">
                    {item.text}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        {/* Main columns */}
        <div className="grid gap-10 py-12 lg:grid-cols-[1.15fr_2fr] lg:gap-16">
          <div>
            <Logo variant="light" />
            <p className="mt-4 max-w-xs font-display text-2xl font-medium leading-snug tracking-[-0.02em] text-white/80">
              {t('brand.tagline')}
            </p>
            <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-white/35">
              {t('footer.demoNote')}
            </p>

            <div className="mt-5 space-y-2 text-[11px] text-white/45">
              <p className="flex items-center gap-2">
                <MapPin size={12} className="text-white/25" />
                {site.company.street}, {site.company.city}
              </p>
              <a
                href={`mailto:${site.company.email}`}
                className="flex items-center gap-2 transition hover:text-white"
              >
                <Mail size={12} className="text-white/25" />
                {site.company.email}
              </a>
            </div>

            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com' },
                { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com' },
                { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/45 transition hover:border-white/25 hover:bg-white/[0.06] hover:text-white"
                  >
                    <Icon size={13} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.shop')}
              </h3>
              <ul className="mt-4 grid gap-2.5">
                {shopLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[11px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/shop"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-electric-300 hover:text-white"
                  >
                    {t('nav.allProducts')} <ArrowUpRight size={10} />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.discover')}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {discoverLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[11px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.company')}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[11px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.help')}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {serviceLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[11px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={`mailto:${site.company.email}`}
                    className="text-[11px] text-white/55 transition hover:text-white"
                  >
                    {t('footer.contact')}
                  </a>
                </li>
              </ul>
              <p className="mt-5 text-[10px] leading-relaxed text-white/30">
                {site.supportHours[locale]}
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t('footer.legal')}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {legalLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[11px] text-white/55 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                <CreditCard size={11} /> {t('footer.payment')}
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Visa', 'Mastercard', 'PayPal', 'SEPA', 'Rechnung'].map((method) => (
                  <span
                    key={method}
                    className="rounded-md border border-white/10 px-1.5 py-1 text-[8px] uppercase tracking-[0.06em] text-white/35"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative border-t border-white/8 py-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 left-0 select-none font-display text-[18vw] font-semibold leading-none tracking-[-0.07em] text-white/[0.02] lg:text-[11rem]"
          >
            klarwerk.
          </span>
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-white/30">
              <span>{t('footer.rights', { year: new Date().getFullYear() })}</span>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <span>{t('footer.madeIn')}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher />
              <span className="rounded-full border border-white/10 px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-white/25">
                {t('demo.label')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
