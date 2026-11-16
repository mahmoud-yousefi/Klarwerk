import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ShoppingBag, GitCompare } from 'lucide-react';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { AvailabilityBadge } from '@/components/product/AvailabilityBadge';
import { useProductActions } from '@/hooks/useProductActions';
import { useCompareStore } from '@/stores/compare.store';
import { matchForProduct } from '@/services/assistant.service';
import type { Product } from '@/types/catalog';

interface RecommendationCardProps {
  product: Product;
  context: string;
}

export function RecommendationCard({ product, context }: RecommendationCardProps) {
  const { t } = useTranslation('assistant');
  const { addToCart, toggleCompare } = useProductActions();
  const isCompared = useCompareStore((state) => state.ids.includes(product.id));
  const match = matchForProduct(product.id, context);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-900/8 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-[#EDF0F6]"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
        />
        <span className="absolute right-2.5 top-2.5 rounded-full bg-white/90 px-2 py-1 text-[9px] font-semibold text-emerald-700 backdrop-blur">
          {t('recommendations.match', { percent: match })}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-900/35">
            {product.brand}
          </p>
          <Rating value={product.rating} showValue={false} />
        </div>
        <h4 className="mt-0.5 text-[12px] font-medium leading-snug">
          <Link to={`/product/${product.slug}`} className="transition hover:text-electric-600">
            {product.name}
          </Link>
        </h4>
        <div className="mt-1.5">
          <Price price={product.price} originalPrice={product.originalPrice} size="sm" />
        </div>
        <div className="mt-1.5">
          <AvailabilityBadge availability={product.availability} />
        </div>

        <div className="mt-2.5 flex items-center gap-1.5">
          <button
            type="button"
            disabled={product.availability === 'out_of_stock'}
            onClick={() => addToCart(product)}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink-900 text-[10px] font-medium text-white transition hover:bg-ink-800 disabled:pointer-events-none disabled:opacity-40"
          >
            <ShoppingBag size={11} />
            {t('recommendations.add')}
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(product)}
            aria-pressed={isCompared}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
              isCompared
                ? 'border-electric-500/30 bg-electric-500/10 text-electric-600'
                : 'border-ink-900/12 text-ink-900/45 hover:border-ink-900/30 hover:text-ink-900'
            }`}
            aria-label={
              isCompared ? t('comparison.removeFromCompare') : t('comparison.addToCompare')
            }
            title={isCompared ? t('comparison.removeFromCompare') : t('comparison.addToCompare')}
          >
            <GitCompare size={12} />
          </button>
          <Link
            to={`/product/${product.slug}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-900/12 text-ink-900/45 transition hover:border-ink-900/30 hover:text-ink-900"
            aria-label={t('recommendations.view')}
            title={t('recommendations.view')}
          >
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </article>
  );
}
