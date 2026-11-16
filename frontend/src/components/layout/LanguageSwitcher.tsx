import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({
  className,
  variant = 'dark',
}: {
  className?: string;
  variant?: 'dark' | 'light';
}) {
  const { i18n, t } = useTranslation();
  const current = i18n.language.startsWith('en') ? 'en' : 'de';

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-full border p-0.5',
        variant === 'dark' ? 'border-white/15' : 'border-ink-900/15',
        className,
      )}
      role="group"
      aria-label={t('misc.languageSwitch')}
    >
      {(['de', 'en'] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => void i18n.changeLanguage(locale)}
          aria-pressed={current === locale}
          className={cn(
            'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition',
            current === locale
              ? variant === 'dark'
                ? 'bg-white text-ink-900'
                : 'bg-ink-900 text-white'
              : variant === 'dark'
                ? 'text-white/55 hover:text-white'
                : 'text-ink-900/45 hover:text-ink-900',
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
