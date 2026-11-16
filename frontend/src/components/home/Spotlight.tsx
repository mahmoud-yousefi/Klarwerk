import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUpRight, BatteryCharging, Cpu, HardDrive, Feather } from 'lucide-react';
import { getProduct, asset } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { Price } from '@/components/ui/Price';
import { Reveal } from '@/components/ui/Reveal';
import { WishlistButton } from '@/components/product/WishlistButton';

export function Spotlight() {
  const { t, i18n } = useTranslation('store');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const product = getProduct('nordvolt-aero-16');

  if (!product) return null;

  const spec = (key: string) => product.specs.find((entry) => entry.key === key)?.value;

  const specs = [
    { icon: Cpu, label: t('home.spotlight.specs'), value: spec('cpu') ?? t('home.spotlight.value1') },
    { icon: HardDrive, label: 'RAM', value: spec('ram') ?? t('home.spotlight.value2') },
    { icon: BatteryCharging, label: t('home.hero.specBatteryLabel'), value: spec('battery') ?? '18 h' },
    { icon: Feather, label: t('home.hero.specWeightLabel'), value: spec('weight') ?? '1,4 kg' },
  ];

  return (
    <section className="relative overflow-hidden bg-ink-900 py-20 text-white sm:py-24">
      <div className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-electric-500/12 blur-[140px]" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_60%_40%,black,transparent_70%)]" />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative">
            <div className="overflow-hidden rounded-[2rem] border border-white/10">
              <img
                src={asset('/assets/images/products/laptop-screen.webp')}
                alt={product.name}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
            <div className="glass absolute -bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl px-4 py-3 sm:left-8 sm:right-8">
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/35">
                  {t('home.spotlight.specs')}
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-white/85">
                  {spec('display')}
                </p>
              </div>
              <Link
                to={`/product/${product.slug}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-900 transition hover:bg-electric-500 hover:text-white"
                aria-label={t('home.spotlight.cta')}
              >
                <ArrowUpRight size={15} />
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <p className="eyebrow text-electric-300">{t('home.spotlight.eyebrow')}</p>
          <h2 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-[1.03] tracking-[-0.035em] sm:text-5xl">
            {t('home.spotlight.title')}
          </h2>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-white/50">
            {t('home.spotlight.subtitle')}
          </p>

          <div className="mt-7 flex items-center gap-4">
            <p className="font-display text-3xl font-semibold tracking-[-0.03em]">
              {formatPrice(product.price, locale)}
            </p>
            <Price price={product.price} originalPrice={product.originalPrice} className="hidden" />
            <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] text-white/45">
              {t('product.inclVat', { ns: 'common' })}
            </span>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-white/10 py-5">
            {specs.map((entry) => (
              <div key={entry.label} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/45">
                  <entry.icon size={13} />
                </span>
                <div className="min-w-0">
                  <dt className="text-[9px] uppercase tracking-[0.12em] text-white/30">
                    {entry.label}
                  </dt>
                  <dd className="mt-0.5 truncate text-[12px] font-medium text-white/80">
                    {entry.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to={`/product/${product.slug}`}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-ink-900 transition hover:bg-white/90"
            >
              {t('home.spotlight.cta')}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <WishlistButton product={product} variant="plain" withLabel className="border-white/15 text-white/70 hover:border-white/35 hover:text-white" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
