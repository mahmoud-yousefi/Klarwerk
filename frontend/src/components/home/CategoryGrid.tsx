import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  Gamepad2,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Smartphone,
  Speaker,
  Tablet,
  Watch,
  Wifi,
} from 'lucide-react';
import { categories, getCategoryCount } from '@/lib/catalog';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';

const icons = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  monitor: Monitor,
  headphones: Headphones,
  watch: Watch,
  gamepad: Gamepad2,
  keyboard: Keyboard,
  mouse: Mouse,
  speaker: Speaker,
  'hard-drive': HardDrive,
  wifi: Wifi,
} as const;

export function CategoryGrid() {
  const { t, i18n } = useTranslation('store');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-x">
        <Reveal>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-electric-600">{t('home.categories.eyebrow')}</p>
              <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-5xl">
                {t('home.categories.title')}
              </h2>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <p className="max-w-xs text-[13px] leading-relaxed text-ink-900/50">
                {t('home.categories.subtitle')}
              </p>
              <Link
                to="/shop"
                className="group inline-flex items-center gap-1.5 text-[12px] font-medium text-electric-600"
              >
                {t('home.categories.all')}
                <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {categories.map((category, index) => {
            const Icon = icons[category.icon as keyof typeof icons] ?? Monitor;
            return (
              <Reveal key={category.id} delay={Math.min(index, 5) * 40}>
                <Link
                  to={`/shop?category=${category.id}`}
                  className={cn(
                    'group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-ink-900/8 bg-mist p-4 transition duration-300',
                    'hover:-translate-y-1 hover:border-ink-900/15 hover:bg-white hover:shadow-lift',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: category.accent }}
                    >
                      <Icon size={18} strokeWidth={1.7} />
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="translate-y-1 text-ink-900/20 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                    />
                  </div>
                  <div className="mt-6">
                    <h3 className="text-[13px] font-semibold tracking-[-0.01em]">
                      {category.name[locale]}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-ink-900/40">
                      {getCategoryCount(category.id)} {locale === 'de' ? 'Produkte' : 'products'}
                    </p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
