import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, X } from 'lucide-react';
import { useCompareStore } from '@/stores/compare.store';
import { getProductById } from '@/lib/catalog';

export function CompareBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const ids = useCompareStore((state) => state.ids);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);
  const products = ids.map((id) => getProductById(id)).filter(Boolean);

  if (pathname === '/compare' || products.length === 0) return null;

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-1/2 z-[70] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 lg:bottom-6">
      <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-ink-800/95 p-2.5 pl-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-fade-up">
        <div className="flex -space-x-2">
          {products.slice(0, 4).map((product) => (
            <span key={product!.id} className="relative">
              <img
                src={product!.images[0]}
                alt={product!.name}
                className="h-9 w-9 rounded-lg border border-white/20 object-cover"
              />
              <button
                type="button"
                onClick={() => remove(product!.id)}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink-950 text-white/70 hover:text-white"
                aria-label={t('compare.remove')}
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-white/85">{t('compare.title')}</p>
          <p className="text-[10px] text-white/40">
            {t('compare.count', { count: products.length, max: 4 })}
          </p>
        </div>
        <Link
          to="/compare"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-electric-500 px-4 text-[12px] font-medium text-white transition hover:bg-electric-400"
        >
          {t('compare.show')} <ArrowRight size={13} />
        </Link>
        <button
          type="button"
          onClick={clear}
          className="hidden shrink-0 rounded-full px-2 py-1 text-[10px] text-white/35 transition hover:text-white sm:block"
        >
          {t('filters.clearAll')}
        </button>
      </div>
    </div>
  );
}
