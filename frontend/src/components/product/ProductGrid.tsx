import type { Product } from '@/types/catalog';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

export function ProductGrid({
  products,
  className,
}: {
  products: Product[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
