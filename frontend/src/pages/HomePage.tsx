import { Hero } from '@/components/home/Hero';
import { BrandMarquee } from '@/components/home/BrandMarquee';
import { Collections } from '@/components/home/Collections';
import { TrendingSection } from '@/components/home/TrendingSection';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { Spotlight } from '@/components/home/Spotlight';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AdvisorTeaser } from '@/components/home/AdvisorTeaser';
import { MagazinePreview } from '@/components/home/MagazinePreview';
import { TrustStrip } from '@/components/home/TrustStrip';
import { Newsletter } from '@/components/marketing/Newsletter';

export function HomePage() {
  return (
    <>
      <Hero />
      <BrandMarquee />
      <Collections />
      <TrendingSection />
      <NewArrivalsSection />
      <Spotlight />
      <CategoryGrid />
      <AdvisorTeaser />
      <MagazinePreview />
      <TrustStrip />
      <section className="bg-mist py-16 sm:py-20">
        <div className="container-x">
          <Newsletter />
        </div>
      </section>
    </>
  );
}
