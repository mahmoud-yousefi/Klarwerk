import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Search, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useUiStore } from '@/stores/ui.store';
import { quickSearch, categories } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useUi';

const popular = ['laptop', 'kopfhörer', 'smartphone', 'gaming', 'monitor'];

export function SearchOverlay() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const { searchOpen, closeSearch } = useUiStore();
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 120);
  const navigate = useNavigate();
  const popularTerms = (t('search.popular', { returnObjects: true }) as unknown as string[]) ?? popular;

  useEffect(() => {
    if (!searchOpen) setQuery('');
  }, [searchOpen]);

  const results = useMemo(() => quickSearch(debounced, 6), [debounced]);


  const submit = (value: string) => {
    const term = value.trim();
    if (!term) return;
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    closeSearch();
  };

  return (
    <Modal open={searchOpen} onClose={closeSearch} title={t('search.title')} hideClose align="top" className="max-w-2xl">
      <div className="p-5 sm:p-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-900/35" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submit(query);
            }}
            placeholder={t('search.placeholder')}
            aria-label={t('search.title')}
            className="h-12 w-full rounded-2xl border border-ink-900/12 bg-mist pl-11 pr-20 text-[15px] outline-none transition focus:border-electric-500 focus:ring-4 focus:ring-electric-500/10"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-ink-900/40 transition hover:bg-ink-900/5 hover:text-ink-900"
              aria-label={t('actions.clear')}
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 rounded border border-ink-900/12 px-1.5 py-0.5 text-[10px] text-ink-900/35">
              ESC
            </kbd>
          )}
        </div>

        {!debounced.trim() ? (
          <div className="mt-5">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-900/35">
              {t('search.suggestions')}
            </p>
            <div className="flex flex-wrap gap-2">
              {popularTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                  }}
                  className="rounded-full border border-ink-900/12 px-3 py-1.5 text-[12px] text-ink-900/60 transition hover:border-ink-900/30 hover:text-ink-900"
                >
                  {term}
                </button>
              ))}
            </div>

            <p className="mb-3 mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-900/35">
              {t('nav.categories')}
            </p>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.id}`}
                  onClick={closeSearch}
                  className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[12px] text-ink-900/60 transition hover:bg-mist hover:text-ink-900"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: category.accent }}
                  />
                  {category.name[locale]}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-900/35">
                {t('search.results', { count: results.length })}
              </p>
              <button
                type="button"
                onClick={() => submit(query)}
                className="flex items-center gap-1 text-[11px] font-medium text-electric-600"
              >
                {t('search.viewAllResults')} <ArrowRight size={12} />
              </button>
            </div>

            {results.length === 0 ? (
              <div className="rounded-2xl bg-mist px-4 py-10 text-center">
                <p className="text-sm font-medium">{t('search.empty', { query: debounced })}</p>
                <p className="mt-1 text-[12px] text-ink-900/45">{t('search.emptyHint')}</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      to={`/product/${product.slug}`}
                      onClick={closeSearch}
                      className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-mist"
                    >
                      <img
                        src={product.images[0]}
                        alt=""
                        className="h-12 w-14 rounded-lg object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{product.name}</p>
                        <p className="text-[11px] text-ink-900/45">
                          {product.brand} · {product.category}
                        </p>
                      </div>
                      <span className="text-[12px] font-semibold tabular-nums">
                        {formatPrice(product.price, locale)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-ink-900/8 pt-4 text-[10px] text-ink-900/35">
          <span>{t('search.hint')}</span>
          <span>{t('search.shortcut')} · ESC</span>
        </div>
      </div>
    </Modal>
  );
}
