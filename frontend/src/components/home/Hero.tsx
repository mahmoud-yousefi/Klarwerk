import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  ArrowDown,
  BatteryCharging,
  Feather,
  Monitor,
  Sparkles,
} from 'lucide-react';
import { getProduct, asset } from '@/lib/catalog';
import { formatPrice, cn } from '@/lib/utils';
import { useScrollParallax } from '@/hooks/useUi';

export function Hero() {
  const { t, i18n } = useTranslation('store');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const product = getProduct('nordvolt-aero-16');
  const stageRef = useScrollParallax(0.035);

  const stats = [
    { value: '122', label: t('home.stats.products') },
    { value: '8', label: t('home.stats.brands') },
    { value: '30', label: t('home.stats.returns') },
    { value: '24/7', label: t('home.stats.advisor') },
  ];

  return (
    <section className="noise relative isolate overflow-hidden bg-ink-900 text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
        style={{ backgroundImage: `url('${asset('/assets/images/hero/hero-circuit.webp')}')` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,#080D18_28%,rgba(8,13,24,0.92)_52%,rgba(8,13,24,0.55)_100%)]" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-[520px] w-[520px] rounded-full bg-electric-500/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-[420px] w-[420px] rounded-full bg-violet-500/12 blur-[120px]" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />

      <div className="container-x relative grid items-center gap-12 pb-12 pt-14 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pb-16 lg:pt-20">
        <div className="max-w-xl">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.045] py-1.5 pl-2 pr-3.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/65 backdrop-blur">
              <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-electric-500/20">
                <span className="absolute h-5 w-5 animate-pulse-ring rounded-full border border-electric-400/50" />
                <Sparkles size={10} className="text-electric-300" />
              </span>
              {t('home.hero.eyebrow')}
            </span>
          </div>

          <h1
            className="mt-7 animate-fade-up font-display font-semibold leading-[0.94] tracking-[-0.045em]"
            style={{ animationDelay: '80ms', fontSize: 'clamp(3.3rem, 7.6vw, 6.2rem)' }}
          >
            {t('home.hero.titleLine1')}
            <br />
            <span className="text-gradient">{t('home.hero.titleAccent')}</span>
          </h1>

          <p
            className="mt-6 max-w-md animate-fade-up text-[15px] leading-relaxed text-white/55 sm:text-base"
            style={{ animationDelay: '160ms' }}
          >
            {t('home.hero.subtitle')}
          </p>

          <div
            className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: '240ms' }}
          >
            <Link
              to="/shop"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-ink-900 transition hover:bg-white/90"
            >
              {t('home.hero.ctaPrimary')}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-900 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight size={12} />
              </span>
            </Link>
            <Link
              to="/advisor"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/18 px-6 text-[13px] font-medium text-white/85 transition hover:border-white/40 hover:bg-white/[0.06]"
            >
              <Sparkles size={14} className="text-violet-300" />
              {t('home.hero.ctaSecondary')}
            </Link>
          </div>

          <p
            className="mt-5 animate-fade-up text-[11px] text-white/30"
            style={{ animationDelay: '320ms' }}
          >
            {t('home.hero.note')}
          </p>

          <dl className="mt-10 grid max-w-lg animate-fade-up grid-cols-4 gap-3 border-t border-white/10 pt-6" style={{ animationDelay: '380ms' }}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                  {stat.value}
                  <span className="text-electric-400">.</span>
                </dd>
                <p className="mt-1 text-[9px] leading-tight text-white/35 sm:text-[10px]">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none" ref={stageRef}>
          <div className="pointer-events-none absolute inset-x-8 top-12 h-[70%] rounded-full bg-electric-500/20 blur-[90px]" />
          <div className="relative mx-auto w-[92%] sm:w-[86%] lg:w-full">
            <div className="animate-float overflow-hidden rounded-[2rem] border border-white/12 bg-ink-800 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={asset('/assets/images/hero/hero-laptop.webp')}
                  alt={t('home.hero.imageAlt')}
                  width={2000}
                  height={1500}
                  {...{ fetchpriority: 'high' }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,8,15,0.92)_0%,rgba(5,8,15,0.15)_50%,transparent_75%)]" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                  <span className="glass rounded-full px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/80">
                    {t('home.hero.featuredLabel')}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-ink-950/60 px-2.5 py-1 text-[9px] font-medium uppercase tracking-wider text-emerald-300 backdrop-blur">
                    <span className="h-1 w-1 rounded-full bg-emerald-400" /> {t('common:misc.new')}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
                        {product?.brand ?? 'Nordvolt'}
                      </p>
                      <p className="mt-1 font-display text-2xl font-medium tracking-[-0.02em] sm:text-[28px]">
                        {product?.name ?? 'Nordvolt Aero 16'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-wider text-white/35">
                        {t('common:misc.from')}
                      </p>
                      <p className="font-display text-lg font-semibold tabular-nums">
                        {formatPrice(product?.price ?? 1799, locale)}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={product ? `/product/${product.slug}` : '/shop'}
                    className="mt-4 flex h-10 items-center justify-between rounded-full bg-white/10 px-4 text-[11px] font-medium text-white/85 backdrop-blur transition hover:bg-white hover:text-ink-900"
                  >
                    {t('home.hero.featuredCta')}
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="glass absolute -left-3 top-[18%] flex animate-[float_8s_ease-in-out_infinite] items-center gap-2.5 rounded-2xl px-3.5 py-3 shadow-lift sm:-left-7">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-electric-500/20 text-electric-300">
                <BatteryCharging size={15} />
              </span>
              <div>
                <p className="text-[12px] font-semibold text-white">{t('home.hero.specBattery')}</p>
                <p className="text-[9px] text-white/40">{t('home.hero.specBatteryLabel')}</p>
              </div>
            </div>

            <div className="glass absolute -right-2 bottom-[22%] flex animate-[float_9s_ease-in-out_infinite_1s] items-center gap-2.5 rounded-2xl px-3.5 py-3 shadow-lift sm:-right-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300">
                <Feather size={15} />
              </span>
              <div>
                <p className="text-[12px] font-semibold text-white">{t('home.hero.specWeight')}</p>
                <p className="text-[9px] text-white/40">{t('home.hero.specWeightLabel')}</p>
              </div>
            </div>

            <div className="glass absolute -bottom-4 left-8 hidden items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-lift sm:flex">
              <Monitor size={14} className="text-white/55" />
              <div>
                <p className="text-[11px] font-medium text-white">{t('home.hero.specDisplay')}</p>
                <p className="text-[9px] text-white/40">{t('home.hero.specDisplayLabel')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-x relative hidden pb-8 lg:block">
        <a
          href="#collections"
          className={cn(
            'inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/30 transition hover:text-white/70',
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/12">
            <ArrowDown size={11} />
          </span>
          {t('home.hero.scroll')}
        </a>
      </div>
    </section>
  );
}
