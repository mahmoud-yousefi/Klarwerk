import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Price } from '@/components/ui/Price';
import { Rating } from '@/components/ui/Rating';
import { AvailabilityBadge } from './AvailabilityBadge';
import { WishlistButton } from './WishlistButton';
import { useProductActions } from '@/hooks/useProductActions';
import type { Product } from '@/types/catalog';

interface ProductCardProps {
  product: Product;
  className?: string;
  compact?: boolean;
  priority?: boolean;
}

export function ProductCard({ product, className, compact = false, priority = false }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useProductActions();

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className="relative overflow-hidden rounded-2xl bg-[#EDF0F6]">
        <Link
          to={`/product/${product.slug}`}
          className="block aspect-[4/3] overflow-hidden"
          aria-label={product.name}
        >
          <img
            src={product.images[0]}
            alt={product.name}
            width={800}
            height={600}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt=""
              loading="lazy"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100"
            />
          )}
        </Link>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col items-start gap-1.5">
            {product.isNew && (
              <span className="rounded-full bg-ink-900 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                {t('misc.new')}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-white">
                −{discount} %
              </span>
            )}
          </div>
          <div className="pointer-events-auto">
            <WishlistButton product={product} />
          </div>
        </div>

        <div className="absolute bottom-3 right-3 translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-sm:translate-y-0 max-sm:opacity-100">
          <button
            type="button"
            onClick={() => addToCart(product)}
            disabled={product.availability === 'out_of_stock'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white shadow-lift transition hover:bg-electric-500 disabled:opacity-40"
            aria-label={`${t('actions.addToCart')} – ${product.name}`}
          >
            <Plus size={17} />
          </button>
        </div>
      </div>

      <div className={cn('flex flex-1 flex-col pt-3.5', compact && 'pt-3')}>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900/35">
            {product.brand}
          </p>
          <Rating value={product.rating} size="sm" showValue={false} />
        </div>
        <h3 className="mt-1 text-[14px] font-medium leading-snug tracking-[-0.01em]">
          <Link to={`/product/${product.slug}`} className="transition hover:text-electric-600">
            {product.name}
          </Link>
        </h3>
        {!compact && (
          <p className="mt-1 line-clamp-1 text-[11px] text-ink-900/40">
            {product.tagline[i18n.language.startsWith('en') ? 'en' : 'de']}
          </p>
        )}
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <Price price={product.price} originalPrice={product.originalPrice} size="md" />
        </div>
        <div className="mt-1.5">
          <AvailabilityBadge availability={product.availability} />
        </div>
      </div>
    </article>
  );
}
