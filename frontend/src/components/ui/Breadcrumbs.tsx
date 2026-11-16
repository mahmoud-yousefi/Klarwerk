import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight size={11} className="text-ink-900/25" aria-hidden="true" />}
          {item.to ? (
            <Link
              to={item.to}
              className="text-[11px] text-ink-900/45 transition hover:text-ink-900"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[11px] text-ink-900/70" aria-current="page">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
