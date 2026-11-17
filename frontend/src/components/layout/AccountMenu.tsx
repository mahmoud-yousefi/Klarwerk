import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';

export function AccountMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useToastStore((state) => state.push);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const signOut = () => {
    logout();
    setOpen(false);
    pushToast(t('account.signedOut'), 'info');
    navigate('/');
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-9 items-center justify-center rounded-full transition',
          user
            ? 'w-9 ring-1 ring-white/20 hover:ring-white/40'
            : 'w-9 text-white/65 hover:bg-white/8 hover:text-white',
        )}
        aria-label={user ? t('account.account') : t('account.signIn')}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {user ? (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: user.color }}
          >
            {getInitials(user.name)}
          </span>
        ) : (
          <UserRound size={18} />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2.5 w-[268px] animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-ink-800/95 p-2 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
        >
          {user ? (
            <>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.05] p-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                  style={{ backgroundColor: user.color }}
                >
                  {getInitials(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-semibold text-white">{user.name}</p>
                  <p className="truncate text-[10.5px] text-white/45">{user.email}</p>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between px-2 py-1">
                <span className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                  {t('account.signedInAs')}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]',
                    user.role === 'admin'
                      ? 'bg-violet-500/20 text-violet-200'
                      : 'bg-emerald-500/15 text-emerald-300',
                  )}
                >
                  {user.role === 'admin' && <ShieldCheck size={10} />}
                  {t(user.role === 'admin' ? 'account.roleAdmin' : 'account.roleCustomer')}
                </span>
              </div>

              <div className="mt-1 space-y-0.5">
                <Link
                  to="/wishlist"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-white/70 transition hover:bg-white/8 hover:text-white"
                >
                  <Heart size={14} /> {t('account.wishlist')}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-electric-500/15 to-violet-500/15 px-2.5 py-2 text-[12px] font-medium text-white transition hover:from-electric-500/25 hover:to-violet-500/25"
                  >
                    <LayoutDashboard size={14} className="text-electric-300" />
                    {t('account.admin')}
                    <ChevronDown size={12} className="-rotate-90 text-white/30" />
                  </Link>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[12px] text-white/60 transition hover:bg-rose-500/10 hover:text-rose-200"
                >
                  <LogOut size={14} /> {t('account.signOut')}
                </button>
              </div>
            </>
          ) : (
            <div className="p-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                {t('account.account')}
              </p>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/55">
                {t('gate.text')}
              </p>
              <div className="mt-3 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex h-9 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-ink-900 transition hover:bg-white/90"
                >
                  {t('account.signIn')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="flex h-9 items-center justify-center rounded-full border border-white/15 text-[12px] font-medium text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  {t('account.signUp')}
                </Link>
              </div>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="mt-2.5 flex items-center gap-1.5 px-1 py-1 text-[10.5px] text-white/35 transition hover:text-white/70"
              >
                <ShieldCheck size={11} /> {t('admin.eyebrow')}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
