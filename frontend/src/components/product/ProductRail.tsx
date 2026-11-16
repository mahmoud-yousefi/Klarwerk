import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';
import { ProductCard } from './ProductCard';

interface ProductRailProps {
  products: Product[];
  className?: string;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function ProductRail({
  products,
  className,
  title,
  eyebrow,
  subtitle,
  ctaLabel,
  ctaHref = '/shop',
}: ProductRailProps) {
  return (
    <div className={cn('', className)}>
      {(title || eyebrow) && (
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && <p className="eyebrow text-electric-600">{eyebrow}</p>}
            {title && (
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && <p className="mt-2 max-w-xl text-[13px] text-ink-900/50">{subtitle}</p>}
          </div>
          {ctaLabel && (
            <Link
              to={ctaHref}
              className="group inline-flex shrink-0 items-center gap-2 text-[13px] font-medium text-ink-900/70 transition hover:text-ink-900"
            >
              {ctaLabel}
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ink-900/15 transition group-hover:border-ink-900/35 group-hover:bg-ink-900 group-hover:text-white">
                <ArrowRight size={13} />
              </span>
            </Link>
          )}
        </div>
      )}

      <div className="hide-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:px-0">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[66vw] max-w-[270px] shrink-0 snap-start sm:w-[42vw] lg:w-auto lg:max-w-none"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
