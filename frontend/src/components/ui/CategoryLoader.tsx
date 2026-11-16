import { lazy, Suspense } from 'react';
import {
  Camera,
  Gamepad2,
  HardDrive,
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Mouse,
  Smartphone,
  Speaker,
  Tablet,
  Watch,
  Wifi,
} from 'lucide-react';
import { categories } from '@/lib/catalog';
import { cn } from '@/lib/utils';

const icons = {
  smartphones: Smartphone,
  laptops: Laptop,
  tablets: Tablet,
  monitors: Monitor,
  headphones: Headphones,
  smartwatches: Watch,
  gaming: Gamepad2,
  keyboards: Keyboard,
  mice: Mouse,
  audio: Speaker,
  storage: HardDrive,
  networking: Wifi,
  cameras: Camera,
} as const;

const animationByCategory: Record<string, string> = {
  smartphones: 'animate-[flip-y_3.2s_ease-in-out_infinite]',
  laptops: 'animate-[swipe_1.8s_ease-in-out_infinite]',
  tablets: 'animate-[swipe_2s_ease-in-out_infinite]',
  monitors: 'animate-[pulse-glow_2s_ease-in-out_infinite]',
  headphones: 'animate-wobble',
  smartwatches: 'animate-[tick_2s_ease-in-out_infinite]',
  gaming: 'animate-[rumble_1.6s_ease-in-out_infinite]',
  keyboards: 'animate-[press_1.4s_ease-in-out_infinite]',
  mice: 'animate-[scroll_1.8s_ease-in-out_infinite]',
  audio: 'animate-[pulse-glow_1.6s_ease-in-out_infinite]',
  storage: 'animate-spin-slow',
  networking: 'animate-[blink_1.6s_steps(2,end)_infinite]',
  cameras: 'animate-[pulse-glow_2.2s_ease-in-out_infinite]',
};

const threeSceneByCategory: Record<string, 'gaming' | 'headphones' | 'audio'> = {
  gaming: 'gaming',
  headphones: 'headphones',
  audio: 'audio',
};

const ThreeScene = lazy(() => import('@/components/ui/CategoryLoader3D'));

interface CategoryLoaderProps {
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizes = {
  sm: { box: 'h-12 w-12', icon: 18, ring: 'h-16 w-16' },
  md: { box: 'h-20 w-20', icon: 28, ring: 'h-28 w-28' },
  lg: { box: 'h-28 w-28', icon: 40, ring: 'h-40 w-40' },
};

export function CategoryLoader({ category = '', size = 'md', label, className }: CategoryLoaderProps) {
  const Icon = (icons as Record<string, typeof Monitor>)[category] ?? Monitor;
  const accent = categories.find((entry) => entry.id === category)?.accent ?? '#5865F2';
  const animation = animationByCategory[category] ?? 'animate-pulse-glow';
  const scene = threeSceneByCategory[category];
  const s = sizes[size];

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative flex items-center justify-center">
        <span
          className={cn('absolute rounded-full opacity-20 blur-xl', s.ring)}
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
        <span
          className={cn('absolute rounded-full border opacity-40', s.ring)}
          style={{ borderColor: accent }}
          aria-hidden="true"
        />
        {scene && !reduceMotion ? (
          <Suspense
            fallback={
              <span
                className={cn('flex items-center justify-center rounded-2xl', s.box, animation)}
                style={{ color: accent }}
              >
                <Icon size={s.icon} strokeWidth={1.6} />
              </span>
            }
          >
            <ThreeScene scene={scene} size={s.box} accent={accent} />
          </Suspense>
        ) : (
          <span
            className={cn('flex items-center justify-center rounded-2xl', s.box, reduceMotion ? '' : animation)}
            style={{ color: accent }}
          >
            <Icon size={s.icon} strokeWidth={1.6} />
          </span>
        )}
      </div>
      {label && <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-ink-900/40">{label}</p>}
    </div>
  );
}
