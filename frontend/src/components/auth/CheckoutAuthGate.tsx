import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ArrowRight, Lock, ShieldCheck, ShoppingBag } from 'lucide-react';
import { AuthForm } from '@/components/auth/AuthForm';
import { formatPrice } from '@/lib/utils';
import { useCartDetails } from '@/hooks/useCart';
import { useAuthStore } from '@/stores/auth.store';

export function CheckoutAuthGate() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const { subtotal, count } = useCartDetails();
  const loginAsAdmin = useAuthStore((state) => state.loginAsAdmin);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="bg-mist">
      <div className="container-x py-8 sm:py-12">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="overflow-hidden rounded-[28px] border border-ink-900/10 bg-white shadow-lift">
            <div className="relative p-6 sm:p-9">
              <div
                aria-hidden
                className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-electric-500/10 blur-3xl"
              />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-electric-600">
                  {t('auth:gate.eyebrow')}
                </p>
                <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  {t('auth:gate.title')}
                </h1>
                <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-900/55">
                  {t('auth:gate.text')}
                </p>
                <div className="mt-5">
                  <AuthForm mode="login" />
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-ink-900/8 bg-white p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-white">
                  <ShoppingBag size={15} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900/35">
                    {t('auth:gate.title')}
                  </p>
                  <p className="text-[13px] font-semibold text-ink-900">
                    {count} {t('cart.items', { count })}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-900/[0.03] px-3.5 py-3">
                <span className="text-[11px] text-ink-900/50">{t('cart.total')}</span>
                <span className="font-display text-xl font-semibold tabular-nums">
                  {formatPrice(subtotal, locale)}
                </span>
              </div>
              <ul className="mt-4 space-y-2 text-[11px] text-ink-900/55">
                {[
                  t('auth:meta.benefit1'),
                  t('auth:meta.benefit2'),
                  t('auth:meta.benefit3'),
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                      <Lock size={9} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[10px] text-ink-900/35">{t('auth:gate.note')}</p>
            </div>

            {!user && (
              <div className="rounded-3xl border border-electric-500/20 bg-gradient-to-br from-electric-500/[0.06] to-violet-500/[0.06] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-electric-600">
                  {t('auth:admin.eyebrow')}
                </p>
                <p className="mt-1 text-[12px] font-semibold text-ink-900">{t('auth:admin.title')}</p>
                <p className="mt-1 text-[10.5px] leading-relaxed text-ink-900/50">
                  {t('auth:admin.text')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    loginAsAdmin();
                    window.location.href = `/admin`;
                  }}
                  className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-violet-500 text-[11.5px] font-semibold text-white shadow-[0_16px_36px_-18px_rgba(88,101,242,0.95)] transition hover:brightness-110"
                >
                  <ShieldCheck size={13} /> {t('auth:admin.button')}
                </button>
              </div>
            )}

            <Link
              to="/cart"
              className="flex items-center justify-center gap-1.5 text-[11px] text-ink-900/45 underline decoration-ink-900/20 underline-offset-4 hover:text-ink-900"
            >
              <ArrowRight size={11} className="rotate-180" /> {t('cart.backToCart')}
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
