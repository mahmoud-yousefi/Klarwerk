import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const DURATION = 2800;

export function EntranceSplash({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [draw, setDraw] = useState(false);

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
      setDraw(true);
      setShowBrand(true);
      setShowTagline(true);
      timers.push(window.setTimeout(finish, 900));
      return () => timers.forEach((t) => window.clearTimeout(t));
    }

    // Phase 1: ambient glow already visible; begin drawing the ribbon.
    timers.push(window.setTimeout(() => setDraw(true), 200));
    // Phase 3: brand reveal.
    timers.push(window.setTimeout(() => setShowBrand(true), 1100));
    timers.push(window.setTimeout(() => setShowTagline(true), 1650));
    // Phase 4: transition out.
    timers.push(window.setTimeout(finish, DURATION));

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [onDone]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center overflow-hidden transition-opacity duration-700',
        fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      style={{ background: 'radial-gradient(ellipse at 50% 50%, #0d1524 0%, #080d18 42%, #05080f 100%)' }}
      aria-hidden="true"
    >
      {/* Ambient center glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(88,101,242,0.14) 0%, rgba(155,114,242,0.08) 28%, transparent 62%)' }}
      />

      {/* SVG ribbon layer */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="kw-ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5865F2" />
            <stop offset="50%" stopColor="#7E8AFB" />
            <stop offset="100%" stopColor="#9B72F2" />
          </linearGradient>
          <filter id="kw-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="kw-ribbon-soft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(88,101,242,0.18)" />
            <stop offset="100%" stopColor="rgba(155,114,242,0.12)" />
          </linearGradient>
        </defs>

        {/* Secondary faint background curve */}
        <path
          d="M 120 380 C 120 160, 420 110, 600 150 C 780 110, 1080 160, 1080 380 C 1080 580, 780 630, 600 590 C 420 630, 120 580, 120 380"
          fill="none"
          stroke="url(#kw-ribbon-soft)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />

        {/* Primary ribbon */}
        <path
          d="M 180 360 C 180 140, 420 90, 600 130 C 780 90, 1020 140, 1020 360 C 1020 560, 780 610, 600 570 C 420 610, 180 560, 180 360"
          fill="none"
          stroke="url(#kw-ribbon)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#kw-glow)"
          pathLength={1000}
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: draw ? 0 : 1000,
            transition: draw ? 'stroke-dashoffset 1.7s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
          }}
        />
      </svg>

      {/* Brand wordmark */}
      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <h1
          className={cn(
            'font-display text-6xl font-semibold tracking-[-0.06em] text-white sm:text-7xl md:text-8xl',
            showBrand ? 'animate-[letter-in_0.9s_cubic-bezier(0.16,1,0.3,1)_both]' : 'opacity-0',
          )}
        >
          klarwerk<span className="text-electric-400">.</span>
        </h1>
        <p
          className={cn(
            'text-[11px] uppercase tracking-[0.34em] text-white/40 transition-opacity duration-700',
            showTagline ? 'opacity-100' : 'opacity-0',
          )}
        >
          Technik, die weiterdenkt
        </p>
      </div>
    </div>
  );
}
