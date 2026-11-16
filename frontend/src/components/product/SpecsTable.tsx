import { useTranslation } from 'react-i18next';
import type { ProductSpec } from '@/types/catalog';
import { cn } from '@/lib/utils';

export function SpecsTable({
  specs,
  className,
}: {
  specs: ProductSpec[];
  className?: string;
}) {
  const { i18n } = useTranslation();
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';

  return (
    <dl className={cn('grid gap-x-12 gap-y-0 md:grid-cols-2', className)}>
      {specs.map((spec) => (
        <div
          key={spec.key}
          className="flex items-baseline justify-between gap-6 border-b border-ink-900/8 py-3.5"
        >
          <dt className="shrink-0 text-[12px] text-ink-900/45">{spec.label[locale]}</dt>
          <dd className="text-right text-[13px] font-medium leading-snug">{spec.value}</dd>
        </div>
      ))}
    </dl>
  );
}
