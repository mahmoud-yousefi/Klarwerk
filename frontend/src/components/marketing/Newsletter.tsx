import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import { useToastStore } from '@/stores/toast.store';
import { Reveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email(),
});

export function Newsletter({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const { t } = useTranslation();
  const [subscribed, setSubscribed] = useState(false);
  const pushToast = useToastStore((state) => state.push);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ resolver: zodResolver(schema) });

  const onSubmit = () => {
    setSubscribed(true);
    pushToast(t('newsletter.success'), 'success');
  };

  return (
    <Reveal>
      <div
        className={cn(
          'relative overflow-hidden rounded-4xl',
          variant === 'dark'
            ? 'noise bg-ink-800 text-white'
            : 'border border-ink-900/8 bg-white',
        )}
      >
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-electric-500/15 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:p-12">
          <div>
            <p className={cn('eyebrow', variant === 'dark' ? 'text-electric-300' : 'text-electric-600')}>
              {t('store:home.newsletter.eyebrow')}
            </p>
            <h2 className="mt-3 max-w-md font-display text-3xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-4xl">
              {t('newsletter.title')}
            </h2>
            <p className={cn('mt-3 max-w-md text-[13px] leading-relaxed', variant === 'dark' ? 'text-white/55' : 'text-ink-900/55')}>
              {t('newsletter.subtitle')}
            </p>
          </div>

          <div>
            {subscribed ? (
              <div className={cn('flex items-center gap-3 rounded-2xl p-4', variant === 'dark' ? 'bg-white/8' : 'bg-emerald-50')}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <Check size={16} />
                </span>
                <p className={cn('text-[13px]', variant === 'dark' ? 'text-white/80' : 'text-emerald-800')}>
                  {t('newsletter.success')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className={cn(
                  'flex flex-col gap-2 rounded-2xl p-1.5 sm:flex-row',
                  variant === 'dark' ? 'bg-white/8' : 'bg-mist',
                )}>
                  <label htmlFor={`newsletter-${variant}`} className="sr-only">
                    {t('newsletter.placeholder')}
                  </label>
                  <input
                    id={`newsletter-${variant}`}
                    type="email"
                    autoComplete="email"
                    placeholder={t('newsletter.placeholder')}
                    aria-invalid={Boolean(errors.email)}
                    className={cn(
                      'h-11 flex-1 rounded-xl bg-transparent px-4 text-[13px] outline-none',
                      variant === 'dark' ? 'text-white placeholder:text-white/35' : 'text-ink-900 placeholder:text-ink-900/35',
                    )}
                    {...register('email')}
                  />
                  <button
                    type="submit"
                    className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-electric-500 px-5 text-[13px] font-medium text-white transition hover:bg-electric-400"
                  >
                    {t('newsletter.cta')} <ArrowRight size={14} />
                  </button>
                </div>
                <p className={cn('mt-2 px-1 text-[10px]', errors.email ? 'text-rose-500' : variant === 'dark' ? 'text-white/30' : 'text-ink-900/35')}>
                  {errors.email ? t('newsletter.error') : t('newsletter.privacy')}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
