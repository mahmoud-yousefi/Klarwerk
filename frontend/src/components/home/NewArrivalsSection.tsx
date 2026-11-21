import { useTranslation } from 'react-i18next';
import { getNewProducts } from '@/lib/catalog';
import { ProductRail } from '@/components/product/ProductRail';
import { Reveal } from '@/components/ui/Reveal';

export function NewArrivalsSection() {
  const { t } = useTranslation('store');
  const products = getNewProducts(8);

  return (
    <section className="bg-mist py-20 sm:py-24">
      <div className="container-x overflow-hidden">
        <Reveal>
          <ProductRail
            products={products}
            eyebrow={t('home.newArrivals.eyebrow')}
            title={t('home.newArrivals.title')}
            subtitle={t('home.newArrivals.subtitle')}
            ctaLabel={t('home.newArrivals.cta')}
            ctaHref="/shop?sort=newest"
          />
        </Reveal>
      </div>
    </section>
  );
}
