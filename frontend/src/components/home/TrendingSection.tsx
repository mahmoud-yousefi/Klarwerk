import { useTranslation } from 'react-i18next';
import { getTrendingProducts } from '@/lib/catalog';
import { ProductRail } from '@/components/product/ProductRail';
import { Reveal } from '@/components/ui/Reveal';

export function TrendingSection() {
  const { t } = useTranslation('store');
  const products = getTrendingProducts(4);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="container-x">
        <Reveal>
          <ProductRail
            products={products}
            eyebrow={t('home.trending.eyebrow')}
            title={t('home.trending.title')}
            subtitle={t('home.trending.subtitle')}
            ctaLabel={t('home.trending.cta')}
            ctaHref="/shop"
          />
        </Reveal>
      </div>
    </section>
  );
}
