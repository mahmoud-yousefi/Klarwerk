import { useTranslation } from 'react-i18next';
import { Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';

export function TrustStrip() {
  const { t } = useTranslation('store');

  const items = [
    {
      icon: Truck,
      title: t('home.trust.shippingTitle'),
      text: t('home.trust.shippingText'),
      accent: 'bg-electric-500/10 text-electric-600',
    },
    {
      icon: RotateCcw,
      title: t('home.trust.returnsTitle'),
      text: t('home.trust.returnsText'),
      accent: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      icon: ShieldCheck,
      title: t('home.trust.warrantyTitle'),
      text: t('home.trust.warrantyText'),
      accent: 'bg-violet-500/10 text-violet-600',
    },
    {
      icon: Headphones,
      title: t('home.trust.supportTitle'),
      text: t('home.trust.supportText'),
      accent: 'bg-amber-500/10 text-amber-600',
    },
  ];

  return (
    <section className="border-y border-ink-900/6 bg-white py-14 sm:py-16">
      <div className="container-x">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map((item, index) => (
            <Reveal key={item.title} delay={index * 60}>
              <div className="flex gap-3.5">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.accent}`}
                >
                  <item.icon size={17} strokeWidth={1.8} />
                </span>
                <div>
                  <h3 className="text-[13px] font-semibold tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-900/45">{item.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
