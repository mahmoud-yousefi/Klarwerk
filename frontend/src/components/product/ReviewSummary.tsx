import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import type { Product } from '@/types/catalog';
import { cn, getInitials } from '@/lib/utils';

export function ReviewSummary({ product }: { product: Product }) {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as 'de' | 'en';

  const weights = [0.7, 0.18, 0.07, 0.03, 0.02];
  if (product.rating >= 4.6) weights.splice(0, 5, 0.82, 0.12, 0.04, 0.015, 0.005);
  if (product.rating < 4.3) weights.splice(0, 5, 0.55, 0.25, 0.12, 0.05, 0.03);

  const samples =
    locale === 'de'
      ? [
          {
            name: 'Anna K.',
            text: 'Verarbeitung und Alltagstauglichkeit überzeugen. Genau das, was ich gesucht habe – ohne unnötige Kompromisse.',
          },
          {
            name: 'Tim R.',
            text: 'Schnelle Lieferung, klare Anleitung, funktioniert wie beschrieben. Für den Preis eine sehr runde Sache.',
          },
        ]
      : [
          {
            name: 'Anna K.',
            text: 'Build quality and everyday usability are convincing. Exactly what I was looking for – without unnecessary compromises.',
          },
          {
            name: 'Tim R.',
            text: 'Fast delivery, clear instructions, works as described. A very well-rounded package for the price.',
          },
        ];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 rounded-3xl border border-ink-900/8 bg-white p-6 sm:grid-cols-[auto_1fr] sm:p-8">
        <div className="text-center sm:pr-8 sm:text-left">
          <p className="font-display text-5xl font-semibold tracking-[-0.04em]">
            {product.rating.toFixed(1)}
          </p>
          <div className="mt-2 flex justify-center gap-0.5 sm:justify-start">
            {[0, 1, 2, 3, 4].map((index) => (
              <Star
                key={index}
                size={15}
                className={
                  index < Math.round(product.rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-ink-900/15'
                }
              />
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-900/40">
            {t('product.basedOn', { count: product.reviewCount })}
          </p>
        </div>

        <div className="space-y-1.5">
          {weights.map((weight, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="w-3 text-[10px] tabular-nums text-ink-900/40">{5 - index}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-900/6">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${weight * 100}%` }}
                />
              </div>
              <span className="w-8 text-right text-[10px] tabular-nums text-ink-900/35">
                {Math.round(weight * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {samples.map((sample, index) => (
          <figure
            key={sample.name}
            className={cn(
              'rounded-2xl border border-ink-900/8 bg-white p-5',
              index === 1 && 'hidden sm:block',
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/6 text-[10px] font-semibold text-ink-900/50">
                {getInitials(sample.name)}
              </span>
              <div>
                <figcaption className="text-[12px] font-medium">{sample.name}</figcaption>
                <div className="flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((star) => (
                    <Star key={star} size={9} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
            <blockquote className="mt-3 text-[13px] leading-relaxed text-ink-900/65">
              {locale === 'de' ? `„${sample.text}“` : `“${sample.text}”`}
            </blockquote>
          </figure>
        ))}
      </div>

      <p className="text-[11px] text-ink-900/35">{t('product.reviewsNote')}</p>
    </div>
  );
}
