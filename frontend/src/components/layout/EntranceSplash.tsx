import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const DURATION = 2800;

export function EntranceSplash({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const timers: number[] = [];
    const finish = () => {
      setFadeOut(true);
      timers.push(window.setTimeout(onDone, 600));
    };

    if (reduceMotion) {
      setShowBrand(true);
      setShowTagline(true);
      timers.push(window.setTimeout(finish, 900));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    timers.push(window.setTimeout(() => setShowBrand(true), 950));
    timers.push(window.setTimeout(() => setShowTagline(true), 1500));
    timers.push(window.setTimeout(finish, DURATION));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onDone]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center overflow-hidden transition-opacity duration-700',
        fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      style={{
        background:
          'radial-gradient(ellipse at 50% 44%, #0e1829 0%, #080d18 46%, #04070d 100%)',
      }}
      aria-hidden="true"
    >
      {/* ambient blue / violet light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 42% 46%, rgba(88,101,242,0.16) 0%, rgba(155,114,242,0.07) 32%, transparent 64%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] noise"
        aria-hidden="true"
      />

      {/* Ring stage. The SVG has no fixed aspect ratio, so the ellipse follows
          the container instead of shrinking into the wordmark on tall phones. */}
      <div className="relative flex h-[min(58vh,480px)] w-[min(88vw,900px)] items-center justify-center">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="kw-splash-ring" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5865F2" stopOpacity="0.12" />
              <stop offset="32%" stopColor="#7E8AFB" stopOpacity="0.9" />
              <stop offset="64%" stopColor="#C4AAF8" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#9B72F2" stopOpacity="0.12" />
            </linearGradient>
            <linearGradient id="kw-splash-glint" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5865F2" stopOpacity="0" />
              <stop offset="35%" stopColor="#A5AEFF" />
              <stop offset="70%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#C4AAF8" stopOpacity="0" />
            </linearGradient>
            <filter id="kw-splash-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <style>{`
            @keyframes kw-splash-draw {
              0% { stroke-dashoffset: 100; opacity: 0; }
              12% { opacity: 1; }
              100% { stroke-dashoffset: 0; opacity: 1; }
            }
            @keyframes kw-splash-travel {
              0% { stroke-dashoffset: 0; opacity: 0; }
              10% { opacity: 1; }
              82% { opacity: 1; }
              100% { stroke-dashoffset: -100; opacity: 0; }
            }
            @keyframes kw-splash-travel-soft {
              0% { stroke-dashoffset: -38; opacity: 0; }
              18% { opacity: 0.5; }
              76% { opacity: 0.5; }
              100% { stroke-dashoffset: -138; opacity: 0; }
            }
            @keyframes kw-splash-line {
              0% { transform: scaleX(0); opacity: 0; }
              18% { opacity: 1; }
              100% { transform: scaleX(1); opacity: 1; }
            }
            .kw-splash-draw {
              animation: kw-splash-draw 1.7s cubic-bezier(0.16, 1, 0.3, 1) both;
            }
            .kw-splash-glint {
              animation: kw-splash-travel 3.4s cubic-bezier(0.45, 0, 0.55, 1) 0.8s infinite;
            }
            .kw-splash-glint-soft {
              animation: kw-splash-travel-soft 4.6s cubic-bezier(0.45, 0, 0.55, 1) 1.7s infinite;
            }
            .kw-splash-line {
              animation: kw-splash-line 1.6s cubic-bezier(0.16, 1, 0.3, 1) 1.7s both;
            }
            @media (prefers-reduced-motion: reduce) {
              .kw-splash-draw,
              .kw-splash-glint,
              .kw-splash-glint-soft,
              .kw-splash-line {
                animation: none;
                opacity: 1;
              }
              .kw-splash-glint,
              .kw-splash-glint-soft { opacity: 0.55; }
            }
          `}</style>

          {/* faint secondary ellipse for depth */}
          <ellipse
            cx="50"
            cy="50"
            rx="44"
            ry="44"
            fill="none"
            stroke="rgba(196,170,248,0.28)"
            strokeWidth="1"
            transform="rotate(-7 50 50)"
            opacity="0.5"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />

          {/* drawn ring */}
          <ellipse
            className="kw-splash-draw"
            cx="50"
            cy="50"
            rx="48"
            ry="48"
            fill="none"
            stroke="url(#kw-splash-ring)"
            strokeWidth="1.4"
            pathLength={100}
            strokeDasharray="100 100"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />

          {/* travelling glints */}
          <ellipse
            className="kw-splash-glint"
            cx="50"
            cy="50"
            rx="48"
            ry="48"
            fill="none"
            stroke="url(#kw-splash-glint)"
            strokeWidth="2.4"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="11 89"
            filter="url(#kw-splash-glow)"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />
          <ellipse
            className="kw-splash-glint-soft"
            cx="50"
            cy="50"
            rx="48"
            ry="48"
            fill="none"
            stroke="rgba(196,170,248,0.7)"
            strokeWidth="1.2"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="5 95"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />
        </svg>

        {/* wordmark centred inside the ellipse */}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <h1
            className={cn(
              'font-display text-6xl font-semibold tracking-[-0.06em] text-white sm:text-7xl md:text-8xl',
              showBrand
                ? 'animate-[letter-in_1.1s_cubic-bezier(0.16,1,0.3,1)_both]'
                : 'opacity-0',
            )}
          >
            klarwerk<span className="text-electric-400">.</span>
          </h1>

          <span
            className={cn(
              'kw-splash-line block h-px w-16 origin-center bg-gradient-to-r from-transparent via-white/45 to-transparent',
              showTagline ? '' : 'opacity-0',
            )}
            aria-hidden="true"
          />

          <p
            className={cn(
              'text-[10px] uppercase tracking-[0.34em] text-white/45 transition-all duration-700 sm:text-[11px]',
              showTagline ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0',
            )}
          >
            Technik, die weiterdenkt
          </p>
        </div>
      </div>

      {/* vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 42%, rgba(2,4,8,0.55) 100%)',
        }}
        aria-hidden="true"
      />
    </div>
  );
}
