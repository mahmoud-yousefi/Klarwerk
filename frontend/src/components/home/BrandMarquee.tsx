import { brands } from '@/lib/catalog';

export function BrandMarquee() {
  const items = [...brands, ...brands];
  return (
    <section className="border-y border-ink-900/6 bg-white py-5" aria-label="Marken">
      <div className="group relative flex overflow-hidden mask-fade-x">
        <div className="flex shrink-0 animate-marquee items-center gap-12 pr-12 group-hover:[animation-play-state:paused]">
          {items.map((brand, index) => (
            <span
              key={`${brand.id}-${index}`}
              className="flex shrink-0 items-center gap-3 font-display text-[15px] font-medium tracking-[-0.01em] text-ink-900/30 transition hover:text-ink-900/70"
              aria-hidden={index >= brands.length}
            >
              {brand.name}
              <span className="h-1 w-1 rounded-full bg-electric-500/30" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
