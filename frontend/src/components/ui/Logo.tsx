import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export function Logo({ className, variant = 'dark', compact = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="Klarwerk"
    >
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-electric-400 via-electric-500 to-violet-500 shadow-[0_8px_20px_-8px_rgba(88,101,242,0.7)]">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5.5 3.5v13" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M14.5 3.5 6.7 10l7.8 6.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
        </svg>
        <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.35)_50%,transparent_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </span>
      {!compact && (
        <span
          className={cn(
            'font-display text-[19px] font-semibold tracking-[-0.03em]',
            variant === 'light' ? 'text-white' : 'text-ink-900',
          )}
        >
          klarwerk
          <span className="text-electric-500">.</span>
        </span>
      )}
    </Link>
  );
}
