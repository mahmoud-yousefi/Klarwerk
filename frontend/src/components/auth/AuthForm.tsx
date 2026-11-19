import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/Field';
import { ADMIN_EMAIL, ADMIN_PASSWORD, useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';

type Mode = 'login' | 'signup';

interface AuthFormProps {
  mode: Mode;
}

interface AuthValues {
  name?: string;
  email: string;
  password: string;
}

export function AuthForm({ mode }: AuthFormProps) {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const loginAsAdmin = useAuthStore((state) => state.loginAsAdmin);
  const pushToast = useToastStore((state) => state.push);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const redirect = params.get('redirect') || '/';
  const isAdminTarget = redirect.startsWith('/admin');

  const schema = useMemo(
    () =>
      z.object({
        name:
          mode === 'signup'
            ? z.string().trim().min(2, t('form.errorName'))
            : z.string().optional(),
        email: z.string().trim().min(1, t('form.errorEmail')).email(t('form.errorEmail')),
        password: z.string().min(6, t('form.errorPassword')),
      }),
    [mode, t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 520));
    const user =
      mode === 'login'
        ? login(values.email, values.password)
        : signup(values.name ?? '', values.email, values.password);
    pushToast(
      t(mode === 'login' ? 'form.successLogin' : 'form.successSignup', { name: user.name }),
      'success',
    );
    setSubmitting(false);
    navigate(user.role === 'admin' ? '/admin' : redirect, { replace: true });
  });

  const onAdmin = async () => {
    setAdminLoading(true);
    await new Promise((resolve) => window.setTimeout(resolve, 620));
    const user = loginAsAdmin();
    setAdminLoading(false);
    pushToast(t('form.successLogin', { name: user.name }), 'success');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="grid overflow-hidden rounded-[24px] border border-ink-900/10 bg-white shadow-lift sm:rounded-[28px] lg:grid-cols-[1.08fr_0.92fr]">
      <div className="relative p-6 sm:p-9 lg:p-11">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-electric-500/10 blur-3xl"
        />
        <div className="relative">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-electric-600">
            {t(mode === 'login' ? 'meta.loginEyebrow' : 'meta.signupEyebrow')}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-[38px]">
            {t(mode === 'login' ? 'meta.loginTitle' : 'meta.signupTitle')}
          </h1>
          <p className="mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-900/55">
            {t(mode === 'login' ? 'meta.loginText' : 'meta.signupText')}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-3.5" noValidate>
            {mode === 'signup' && (
              <Input
                label={t('form.name')}
                placeholder={t('form.namePlaceholder')}
                autoComplete="name"
                error={errors.name?.message}
                {...register('name')}
              />
            )}
            <Input
              label={t('form.email')}
              type="email"
              placeholder={t('form.emailPlaceholder')}
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label={t('form.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('form.passwordPlaceholder')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                error={errors.password?.message}
                className="pr-11"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-[30px] flex h-8 w-8 items-center justify-center rounded-full text-ink-900/35 transition hover:bg-ink-900/5 hover:text-ink-900"
                aria-label={t(showPassword ? 'form.hidePassword' : 'form.showPassword')}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-ink-900/40">{t('form.anyCredentials')}</p>
              {mode === 'login' && (
                <button
                  type="button"
                  className="shrink-0 text-[11px] font-medium text-electric-600 underline decoration-electric-500/30 underline-offset-4 hover:text-electric-500"
                >
                  {t('form.forgot')}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink-900 text-[13px] font-semibold text-white shadow-[0_18px_38px_-20px_rgba(8,13,24,0.8)] transition hover:bg-ink-800 disabled:pointer-events-none disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('form.working')}
                </>
              ) : (
                <>
                  {t(mode === 'login' ? 'form.submitLogin' : 'form.submitSignup')}
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {mode === 'signup' && (
            <p className="mt-3 text-[10.5px] leading-relaxed text-ink-900/40">{t('form.terms')}</p>
          )}

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-ink-900/10" />
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink-900/35">
              {t('form.or')}
            </span>
            <span className="h-px flex-1 bg-ink-900/10" />
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-electric-500/20 bg-gradient-to-br from-electric-500/[0.07] via-white to-violet-500/[0.06] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-white">
                  <BarChart3 size={16} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-electric-600">
                    {t('admin.eyebrow')}
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-ink-900">{t('admin.title')}</p>
                  <p className="mt-1 max-w-[34ch] text-[11px] leading-relaxed text-ink-900/50">
                    {t('admin.text')}
                  </p>
                </div>
              </div>
              <ShieldCheck size={16} className="mt-1 shrink-0 text-electric-500" />
            </div>

            <div className="mt-3.5 grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-2 rounded-xl border border-ink-900/8 bg-white/80 px-3 py-2">
                <Mail size={13} className="shrink-0 text-ink-900/35" />
                <span className="truncate text-[11px] font-medium text-ink-900/70">{ADMIN_EMAIL}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-ink-900/8 bg-white/80 px-3 py-2">
                <Lock size={13} className="shrink-0 text-ink-900/35" />
                <span className="truncate text-[11px] font-medium tracking-[0.08em] text-ink-900/70">
                  {ADMIN_PASSWORD}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onAdmin}
              disabled={adminLoading || submitting}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-violet-500 text-[12.5px] font-semibold text-white shadow-[0_16px_36px_-18px_rgba(88,101,242,0.95)] transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-70"
            >
              {adminLoading ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {t('admin.working')}
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  {t(isAdminTarget ? 'admin.openPanel' : 'admin.button')}
                </>
              )}
            </button>
            <p className="mt-2 text-center text-[10px] text-ink-900/35">{t('admin.hint')}</p>
          </div>

          <p className="mt-5 text-center text-[12px] text-ink-900/50">
            {t(mode === 'login' ? 'form.noAccount' : 'form.haveAccount')}{' '}
            <Link
              to={`${mode === 'login' ? '/signup' : '/login'}${
                params.get('redirect') ? `?redirect=${encodeURIComponent(redirect)}` : ''
              }`}
              className="font-semibold text-electric-600 underline decoration-electric-500/30 underline-offset-4 hover:text-electric-500"
            >
              {t(mode === 'login' ? 'form.toSignup' : 'form.toLogin')}
            </Link>
          </p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-violet-500/30 blur-[80px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-electric-500/25 blur-[70px]"
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'radial-gradient(ellipse at 60% 30%, black, transparent 72%)',
          }}
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Klarwerk Konto
          </span>
          <h2 className="mt-6 font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.03em]">
            {t('meta.asideTitle')}
          </h2>
          <p className="mt-3 max-w-[36ch] text-[13px] leading-relaxed text-white/55">
            {t('meta.asideText')}
          </p>
        </div>

        <div className="relative mt-8 space-y-2.5">
          {['benefit1', 'benefit2', 'benefit3'].map((key) => (
            <div
              key={key}
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.045] px-3.5 py-2.5 backdrop-blur"
            >
              <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
              <span className="text-[12px] text-white/75">{t(`meta.${key}`)}</span>
            </div>
          ))}
        </div>

        <div className="relative mt-8 flex items-center gap-2 border-t border-white/10 pt-4 text-[10.5px] text-white/40">
          <ShieldCheck size={13} className="text-electric-300" />
          {t('meta.trust')}
        </div>
      </aside>
    </div>
  );
}

export function AuthPage({ mode }: AuthFormProps) {
  const { t } = useTranslation('auth');
  return (
    <div className="relative overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-gradient-to-b from-electric-500/[0.08] via-violet-500/[0.04] to-transparent"
      />
      <div className="container-x px-4 py-8 sm:py-10 md:py-14">
        <div className="mx-auto w-full max-w-5xl">
          <AuthForm mode={mode} />
          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-ink-900/35">
            <ShieldCheck size={12} />
            {t('gate.note')}
          </p>
        </div>
      </div>
    </div>
  );
}
