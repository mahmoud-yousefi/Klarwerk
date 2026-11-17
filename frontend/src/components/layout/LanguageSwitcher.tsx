import { useTranslation } from 'react-i18next';
import { Globe2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({
  className,
  variant = 'dark',
  showIcon = true,
}: {
  className?: string;
  variant?: 'dark' | 'light';
  showIcon?: boolean;
}) {
  const { i18n, t } = useTranslation();
  const current = i18n.language.startsWith('en') ? 'en' : 'de';

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full border p-0.5',
        variant === 'dark' ? 'border-white/15 bg-white/[0.035]' : 'border-ink-900/15 bg-white',
        className,
      )}
      role="group"
      aria-label={t('misc.languageSwitch')}
      title={t('misc.languageSwitch')}
    >
      {showIcon && (
        <Globe2
          size={12}
          aria-hidden="true"
          className={cn(
            'ml-1.5 mr-0.5 shrink-0',
            variant === 'dark' ? 'text-white/40' : 'text-ink-900/40',
          )}
        />
      )}
      {(['de', 'en'] as const).map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => void i18n.changeLanguage(locale)}
          aria-pressed={current === locale}
          aria-label={locale === 'de' ? t('misc.german') : t('misc.english')}
          className={cn(
            'rounded-full px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] transition sm:px-2',
            current === locale
              ? variant === 'dark'
                ? 'bg-white text-ink-900 shadow-sm'
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
