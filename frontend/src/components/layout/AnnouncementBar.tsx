import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

export function AnnouncementBar() {
  const { t } = useTranslation();
  return (
    <div className="relative z-[60] overflow-hidden bg-ink-950 text-white/65">
      <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(ellipse_at_left,rgba(88,101,242,0.25),transparent_65%)]" />
      <div className="container-x relative flex h-9 items-center justify-center gap-3 text-[11px] tracking-[0.01em]">
        <Sparkles size={12} className="hidden text-electric-300 sm:block" />
        <p className="truncate">{t('announcement')}</p>
        <span className="hidden items-center gap-3 text-white/35 md:flex">
          <span aria-hidden="true">·</span>
          <span>{t('trust.shipping')}</span>
          <span aria-hidden="true">·</span>
          <span>{t('trust.returns')}</span>
        </span>
      </div>
    </div>
  );
}
