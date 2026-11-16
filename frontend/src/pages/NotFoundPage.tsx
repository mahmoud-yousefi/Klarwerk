import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Home,
  Search,
  Sparkles,
} from 'lucide-react';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(88,101,242,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full bg-violet-500/15 blur-[130px]" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="container-x relative flex min-h-[72vh] flex-col items-center justify-center py-20 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/50">
          <Compass size={11} /> 404
        </span>

        <p className="mt-6 font-display text-[92px] font-semibold leading-none tracking-[-0.07em] text-white/[0.08] sm:text-[140px]">
          404
        </p>
        <h1 className="-mt-2 max-w-xl font-display text-3xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-4xl">
          {t('errors.notFound')}
        </h1>
        <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/45">
          {t('errors.notFoundText')}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[12px] font-semibold text-ink-900 transition hover:bg-white/90"
          >
            <Home size={14} /> {t('errors.backHome')}
          </Link>
          <Link
            to="/shop"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[12px] font-medium text-white/85 transition hover:border-white/40 hover:bg-white/10"
          >
            {t('errors.toShop')} <ArrowRight size={13} />
          </Link>
          <Link
            to="/advisor"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-5 text-[12px] font-medium text-violet-200 transition hover:border-violet-400/50 hover:bg-violet-500/15"
          >
            <Sparkles size={13} /> {t('nav.advisor')}
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {[
            { to: '/shop', icon: Search, label: t('nav.allProducts') },
            { to: '/magazine', icon: BookOpen, label: t('nav.magazine') },
            { to: '/wishlist', icon: Compass, label: t('nav.wishlist') },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] text-white/35 transition hover:bg-white/[0.06] hover:text-white/80"
            >
              <item.icon size={11} /> {item.label}
            </Link>
          ))}
        </div>

        <p className="mt-10 max-w-xs text-[9px] leading-relaxed text-white/20">
          {t('demo.banner')}
        </p>
      </div>
    </div>
  );
}
