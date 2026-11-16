import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';
import { asset } from '@/lib/catalog';

interface Collection {
  title: string;
  text: string;
  image: string;
  href: string;
  imagePosition?: string;
}

export function Collections() {
  const { t } = useTranslation('store');

  const collections: Collection[] = [
    {
      title: t('home.collections.audioTitle'),
      text: t('home.collections.audioText'),
      image: asset('/assets/images/products/headphones-black.webp'),
      href: '/shop?category=headphones',
      imagePosition: 'center 45%',
    },
    {
      title: t('home.collections.laptopTitle'),
      text: t('home.collections.laptopText'),
      image: asset('/assets/images/products/laptop-neon.webp'),
      href: '/shop?category=laptops',
      imagePosition: 'center 55%',
    },
    {
      title: t('home.collections.gamingTitle'),
      text: t('home.collections.gamingText'),
      image: asset('/assets/images/products/controller-purple.webp'),
      href: '/shop?category=gaming',
      imagePosition: 'center 50%',
    },
  ];

  return (
    <section id="collections" className="scroll-mt-24 bg-mist py-20 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-electric-600">{t('home.collections.eyebrow')}</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
                {t('home.collections.title')}
              </h2>
            </div>
            <p className="max-w-xs text-[13px] leading-relaxed text-ink-900/50">
              {t('home.collections.subtitle')}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 lg:grid-cols-12">
          <Reveal className="lg:col-span-7" delay={40}>
            <CollectionTile collection={collections[0]} className="h-[320px] sm:h-[420px] lg:h-full lg:min-h-[540px]" large />
          </Reveal>
          <div className="grid gap-4 lg:col-span-5">
            <Reveal delay={120}>
              <CollectionTile collection={collections[1]} className="h-[240px] sm:h-[300px]" />
            </Reveal>
            <Reveal delay={180}>
              <CollectionTile collection={collections[2]} className="h-[240px] sm:h-[300px]" />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionTile({
  collection,
  className,
  large = false,
}: {
  collection: Collection;
  className?: string;
  large?: boolean;
}) {
  const { t } = useTranslation('store');
  return (
    <Link
      to={collection.href}
      className={cn(
        'group relative block overflow-hidden rounded-3xl bg-ink-900 text-white',
        className,
      )}
    >
      <img
        src={collection.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        style={{ objectPosition: collection.imagePosition }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(5,8,15,0.92)_0%,rgba(5,8,15,0.35)_45%,rgba(5,8,15,0.05)_75%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(88,101,242,0.16),transparent_45%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col justify-end p-6 sm:p-8">
        <div className="flex items-end justify-between gap-6">
          <div className={cn('max-w-md', large && 'max-w-lg')}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
              {t('home.collections.eyebrow')}
            </p>
            <h3
              className={cn(
                'mt-2 font-display font-semibold leading-[1.06] tracking-[-0.03em]',
                large ? 'text-3xl sm:text-4xl' : 'text-2xl',
              )}
            >
              {collection.title}
            </h3>
            <p className="mt-2 max-w-sm text-[12px] leading-relaxed text-white/50">
              {collection.text}
            </p>
          </div>
          <span className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/70 transition duration-300 group-hover:border-white group-hover:bg-white group-hover:text-ink-900">
            <ArrowUpRight size={17} />
          </span>
        </div>
      </div>
    </Link>
  );
}
