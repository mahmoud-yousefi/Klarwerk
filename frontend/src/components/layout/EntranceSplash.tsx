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

      {/* Ellipse ribbon */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="kw-ellipse" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5865F2" />
            <stop offset="50%" stopColor="#7E8AFB" />
            <stop offset="100%" stopColor="#9B72F2" />
          </linearGradient>
          <linearGradient id="kw-travel-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A5AEFF" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#C4AAF8" />
          </linearGradient>
          <filter id="kw-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <style>{`
          @keyframes kw-travel {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
          .kw-travel-light {
            animation: kw-travel 3.6s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .kw-travel-light { animation: none; opacity: 0.7; }
          }
        `}</style>

        {/* Faint secondary tilted ellipse for depth */}
        <ellipse
          cx="600"
          cy="350"
          rx="520"
          ry="210"
          fill="none"
          stroke="rgba(155,114,242,0.12)"
          strokeWidth="1"
          transform="rotate(-8 600 350)"
        />

        {/* Faint base ellipse */}
        <ellipse
          cx="600"
          cy="350"
          rx="470"
          ry="195"
          fill="none"
          stroke="url(#kw-ellipse)"
          strokeWidth="1.4"
          opacity="0.3"
        />

        {/* Traveling light along the ellipse */}
        <ellipse
          className="kw-travel-light"
          cx="600"
          cy="350"
          rx="470"
          ry="195"
          fill="none"
          stroke="url(#kw-travel-grad)"
          strokeWidth="2.6"
          strokeLinecap="round"
          filter="url(#kw-glow)"
          pathLength={1000}
          style={{ strokeDasharray: '200 1000', strokeDashoffset: 1000 }}
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
