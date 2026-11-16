import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { asset } from '@/lib/catalog';

interface ProductGalleryProps {
  images: string[];
  name: string;
  isNew?: boolean;
  discount?: number;
  className?: string;
}

export function ProductGallery({ images, name, isNew, discount, className }: ProductGalleryProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const gallery = images.length ? images : [asset('/assets/images/products/phone-green.webp')];

  useEffect(() => {
    setActive(0);
  }, [name]);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setActive((index) => (index + 1) % gallery.length);
      if (event.key === 'ArrowLeft')
        setActive((index) => (index - 1 + gallery.length) % gallery.length);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [lightbox, gallery.length]);

  return (
    <div className={cn('', className)}>
      <div className="group relative overflow-hidden rounded-3xl bg-[#EDF0F6]">
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="block aspect-[4/3] w-full cursor-zoom-in"
          aria-label={t('product.viewGallery')}
        >
          <img
            key={gallery[active]}
            src={gallery[active]}
            alt={`${name} – ${active + 1}`}
            className="h-full w-full animate-[fade-in_0.4s_ease] object-cover"
          />
        </button>
        <div className="pointer-events-none absolute left-4 top-4 flex gap-2">
          {isNew && <Badge variant="dark" className="backdrop-blur-md">{t('misc.new')}</Badge>}
          {Boolean(discount) && (
            <Badge className="bg-rose-500 text-white">−{discount} %</Badge>
          )}
        </div>
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink-900/60 opacity-0 shadow-soft backdrop-blur transition group-hover:opacity-100"
          aria-label={t('product.viewGallery')}
        >
          <Expand size={15} />
        </button>
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 flex gap-2.5">
          {gallery.map((image, index) => (
            <button
              key={image + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={t('product.galleryThumb', { index: index + 1, total: gallery.length })}
              aria-pressed={active === index}
              className={cn(
                'overflow-hidden rounded-xl border-2 transition',
                active === index
                  ? 'border-ink-900'
                  : 'border-transparent opacity-55 hover:opacity-100',
              )}
            >
              <img
                src={image}
                alt=""
                loading="lazy"
                className="h-16 w-20 object-cover sm:h-[72px] sm:w-24"
              />
            </button>
          ))}
        </div>
      )}

      <Modal
        open={lightbox}
        onClose={() => setLightbox(false)}
        title={name}
        className="max-w-5xl overflow-hidden bg-ink-950"
        hideClose
      >
        <div className="relative flex items-center justify-center bg-ink-950">
          <img
            src={gallery[active]}
            alt={`${name} – ${active + 1}`}
            className="max-h-[80vh] w-full object-contain"
          />
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={() =>
                  setActive((index) => (index - 1 + gallery.length) % gallery.length)
                }
                className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label={t('product.prevImage')}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => setActive((index) => (index + 1) % gallery.length)}
                className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                aria-label={t('product.nextImage')}
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-white/80 transition hover:bg-white/20"
          >
            {t('product.closeGallery')}
          </button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70">
            {active + 1} / {gallery.length}
          </span>
        </div>
      </Modal>
    </div>
  );
}
