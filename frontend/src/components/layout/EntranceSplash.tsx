import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const DURATION = 3400;
const LETTERS = 'klarwerk.'.split('');

export function EntranceSplash({ onDone }: { onDone: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fadeOut, setFadeOut] = useState(false);
  const [showLetters, setShowLetters] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const timers: number[] = [];
    let disposed = false;
    let scene: { dispose: () => void } | null = null;

    const finish = () => {
      setFadeOut(true);
      timers.push(window.setTimeout(onDone, 650));
    };

    if (reduceMotion) {
      setShowLetters(true);
      timers.push(window.setTimeout(finish, 900));
      return () => {
        disposed = true;
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }

    // Let the products settle before the wordmark lands.
    timers.push(window.setTimeout(() => setShowLetters(true), 1150));
    timers.push(window.setTimeout(finish, DURATION));

    (async () => {
      const container = containerRef.current;
      if (!container || disposed) return;
      try {
        const { createSplashScene } = await import('./splash/SplashScene');
        if (disposed) return;
        scene = createSplashScene(container);
      } catch {
        // WebGL unavailable — the wordmark still carries the entrance.
      }
    })();

    return () => {
      disposed = true;
      timers.forEach((timer) => window.clearTimeout(timer));
      scene?.dispose();
    };
  }, [onDone]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-ink-900 transition-opacity duration-700',
        fadeOut ? 'pointer-events-none opacity-0' : 'opacity-100',
      )}
      aria-hidden="true"
    >
      {/* Studio backdrop: a cool pool of light behind the products, dark edges. */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_46%,#1b2540_0%,#101827_38%,#080d18_78%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(4,7,13,0.92)_100%)]" />

      <div ref={containerRef} className="absolute inset-0" />

      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex flex-wrap items-center justify-center">
          {LETTERS.map((letter, i) => (
            <span
              key={i}
              className={cn(
                'font-display text-6xl font-semibold tracking-[-0.06em] text-white sm:text-7xl md:text-8xl',
                showLetters
                  ? 'animate-[letter-in_0.9s_cubic-bezier(0.16,1,0.3,1)_both]'
                  : 'opacity-0',
              )}
              style={showLetters ? { animationDelay: `${i * 70}ms` } : undefined}
            >
              {letter === '.' ? <span className="text-electric-400">.</span> : letter}
            </span>
          ))}
        </div>
        <div
          className={cn(
            'flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-white/45 transition-opacity duration-700',
            showLetters ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transitionDelay: '900ms' }}
        >
          <span className="h-px w-10 bg-white/20" />
          Technik, die weiterdenkt
          <span className="h-px w-10 bg-white/20" />
        </div>
      </div>
    </div>
  );
}
