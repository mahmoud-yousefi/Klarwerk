import { useTranslation } from 'react-i18next';
import {
  BadgePercent,
  Briefcase,
  Gamepad2,
  GitCompare,
  Headphones,
  Laptop,
  Smartphone,
  Tablet,
} from 'lucide-react';

const starters = [
  { key: 'studyLaptop', icon: Laptop },
  { key: 'comparePhones', icon: Smartphone },
  { key: 'everydayHeadphones', icon: Headphones },
  { key: 'homeOffice', icon: Briefcase },
  { key: 'laptopDifference', icon: GitCompare },
  { key: 'gamingSetup', icon: Gamepad2 },
  { key: 'value', icon: BadgePercent },
  { key: 'tablet', icon: Tablet },
] as const;

export function StarterPrompts({ onSelect }: { onSelect: (text: string) => void }) {
  const { t } = useTranslation('assistant');

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">
            {t('welcome.promptTitle')}
          </h3>
          <p className="mt-0.5 text-[11px] text-ink-900/40">{t('welcome.promptSubtitle')}</p>
        </div>
        <span className="text-[9px] uppercase tracking-[0.14em] text-ink-900/25">
          {t('meta.grounded')}
        </span>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {starters.map(({ key, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(t(`starters.${key}`))}
            className="group flex items-start gap-2.5 rounded-xl border border-ink-900/10 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-violet-500/35 hover:shadow-soft"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600 transition group-hover:bg-violet-500 group-hover:text-white">
              <Icon size={13} />
            </span>
            <span className="text-[11px] leading-relaxed text-ink-900/65 transition group-hover:text-ink-900">
              {t(`starters.${key}`)}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[10px] italic leading-relaxed text-ink-900/30">
        {t('welcome.example')}
      </p>
    </div>
  );
}
