import { useTranslation } from 'react-i18next';
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
import { asset, categories } from '@/lib/catalog';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'xl';
type Effect =
  | 'waves'
  | 'rumble'
  | 'shutter'
  | 'scan'
  | 'ticks'
  | 'keys'
  | 'cursor'
  | 'data'
  | 'signal';

interface Media {
  image: string;
  effect: Effect;
  motion: string;
}

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

/**
 * Real product photography for each category. The motion is chosen to echo
 * what the device actually does: headphones sway with sound, a camera flashes,
 * a gamepad rumbles, a watch ticks and a laptop scans.
 */
const mediaByCategory: Record<string, Media> = {
  smartphones: {
    image: '/assets/images/products/phone-green.webp',
    effect: 'scan',
    motion: 'kw-loader-float',
  },
  laptops: {
    image: '/assets/images/products/laptop-screen.webp',
    effect: 'scan',
    motion: 'kw-loader-float',
  },
  tablets: {
    image: '/assets/images/products/tablet-ipad.webp',
    effect: 'scan',
    motion: 'kw-loader-float',
  },
  monitors: {
    image: '/assets/images/products/monitor-gaming.webp',
    effect: 'scan',
    motion: 'kw-loader-float',
  },
  headphones: {
    image: '/assets/images/products/headphones-black.webp',
    effect: 'waves',
    motion: 'kw-loader-sway',
  },
  smartwatches: {
    image: '/assets/images/products/watch-black.webp',
    effect: 'ticks',
    motion: 'kw-loader-float',
  },
  gaming: {
    image: '/assets/images/products/controller-purple.webp',
    effect: 'rumble',
    motion: 'kw-loader-rumble',
  },
  keyboards: {
    image: '/assets/images/products/keyboard-color.webp',
    effect: 'keys',
    motion: 'kw-loader-float',
  },
  mice: {
    image: '/assets/images/products/mouse-dark.webp',
    effect: 'cursor',
    motion: 'kw-loader-float',
  },
  audio: {
    image: '/assets/images/products/speaker-teal.webp',
    effect: 'waves',
    motion: 'kw-loader-throb',
  },
  storage: {
    image: '/assets/images/products/circuit.webp',
    effect: 'data',
    motion: 'kw-loader-float',
  },
  networking: {
    image: '/assets/images/products/network.webp',
    effect: 'signal',
    motion: 'kw-loader-float',
  },
  cameras: {
    image: '/assets/images/editorial/camera.webp',
    effect: 'shutter',
    motion: 'kw-loader-float',
  },
};

const sizes: Record<Size, { box: string; radius: string; ring: string; label: string }> = {
  sm: { box: 'h-9 w-9', radius: 'rounded-[30%]', ring: '-inset-1', label: 'text-[9px]' },
  md: { box: 'h-20 w-20', radius: 'rounded-[30%]', ring: '-inset-2', label: 'text-[10px]' },
  lg: { box: 'h-32 w-32', radius: 'rounded-[28%]', ring: '-inset-2.5', label: 'text-[11px]' },
  xl: {
    box: 'h-40 w-40 sm:h-48 sm:w-48',
    radius: 'rounded-[27%]',
    ring: '-inset-3',
    label: 'text-[11px]',
  },
};

function EffectOverlay({ effect }: { effect: Effect }) {
  switch (effect) {
    case 'waves':
      return (
        <span className="absolute bottom-2 right-2 flex h-5 items-end gap-[2px]" aria-hidden="true">
          {[7, 12, 17, 11, 6].map((height, index) => (
            <span
              key={index}
              className="kw-loader-wave w-[2px] rounded-full bg-white/85"
              style={{ height, animationDelay: `${index * 0.14}s` }}
            />
          ))}
        </span>
      );
    case 'rumble':
      return (
        <span
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.35),transparent_45%)] kw-loader-rumble-light"
          aria-hidden="true"
        />
      );
    case 'shutter':
      return (
        <>
          <span className="kw-loader-flash absolute inset-0 bg-white" aria-hidden="true" />
          <span
            className="absolute inset-1.5 rounded-[26%] border border-dashed border-white/55 kw-loader-spin"
            aria-hidden="true"
          />
        </>
      );
    case 'scan':
      return (
        <span
          className="kw-loader-scanline absolute inset-x-0 h-7 bg-gradient-to-b from-transparent via-white/30 to-transparent"
          aria-hidden="true"
        />
      );
    case 'ticks':
      return (
        <>
          <span
            className="absolute inset-1.5 rounded-full border border-dashed border-white/45 kw-loader-spin"
            aria-hidden="true"
          />
          <span
            className="absolute bottom-2 left-2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] kw-loader-tick"
            aria-hidden="true"
          />
        </>
      );
    case 'keys':
      return (
        <span className="absolute bottom-2 left-2 flex gap-1" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="kw-loader-key h-1.5 w-3 rounded-[2px] bg-white/80"
              style={{ animationDelay: `${index * 0.18}s` }}
            />
          ))}
        </span>
      );
    case 'cursor':
      return (
        <span
          className="kw-loader-cursor absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
          aria-hidden="true"
        />
      );
    case 'data':
      return (
        <span className="absolute bottom-2 left-2 right-2 flex gap-1" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((index) => (
            <span
              key={index}
              className="kw-loader-data h-1 flex-1 rounded-full bg-white/75"
              style={{ animationDelay: `${index * 0.12}s` }}
            />
          ))}
        </span>
      );
    case 'signal':
      return (
        <span className="absolute right-2 top-2" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="kw-loader-signal absolute bottom-0 right-0 rounded-full border border-white/70"
              style={{
                width: 8 + index * 7,
                height: 8 + index * 7,
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </span>
      );
    default:
      return null;
  }
}

export interface CategoryLoaderProps {
  category?: string;
  size?: Size;
  label?: string;
  showLabel?: boolean;
  showProgress?: boolean;
  className?: string;
}

export function CategoryLoader({
  category = '',
  size = 'md',
  label,
  showLabel = true,
  showProgress = false,
  className,
}: CategoryLoaderProps) {
  const { t } = useTranslation(['store', 'common']);
  const media = mediaByCategory[category] ?? mediaByCategory.laptops;
  const accent = categories.find((entry) => entry.id === category)?.accent ?? '#5865F2';
  const dims = sizes[size];
  const FallbackIcon = (icons as Record<string, typeof Monitor>)[category] ?? Monitor;
  const resolvedLabel = label ?? t('store:catalog.loading');

  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-3 text-center', className)}
      role="status"
      aria-live="polite"
      aria-label={resolvedLabel}
    >
      <div className={cn('relative shrink-0', dims.box)}>
        {/* ambient accent glow */}
        <span
          className="absolute -inset-5 rounded-full opacity-25 blur-2xl"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />

        {/* fine orbital ring with travelling glint */}
        <svg
          className={cn('pointer-events-none absolute', dims.ring)}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <ellipse
            cx="50"
            cy="50"
            rx="48"
            ry="48"
            fill="none"
            stroke={accent}
            strokeWidth="1.2"
            opacity="0.35"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />
          <ellipse
            className="kw-loader-orbit"
            cx="50"
            cy="50"
            rx="48"
            ry="48"
            fill="none"
            stroke={accent}
            strokeWidth="1.8"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="14 86"
            style={{ vectorEffect: 'non-scaling-stroke' }}
          />
        </svg>

        {/* real product photograph */}
        <div
          className={cn(
            'relative h-full w-full overflow-hidden border border-white/25 bg-ink-800 shadow-[0_18px_40px_-18px_rgba(8,13,24,0.65)]',
            dims.radius,
            media.motion,
          )}
        >
          <span
            className="absolute inset-0 flex items-center justify-center text-white/80"
            aria-hidden="true"
          >
            <FallbackIcon size={size === 'sm' ? 18 : size === 'md' ? 24 : 34} strokeWidth={1.4} />
          </span>
          <img
            src={asset(media.image)}
            alt=""
            width={320}
            height={320}
            loading="eager"
            decoding="async"
            className="relative h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <span
            className="absolute inset-0 bg-gradient-to-t from-ink-950/65 via-ink-950/5 to-white/5"
            aria-hidden="true"
          />
          <EffectOverlay effect={media.effect} />
        </div>

        <span
          className="kw-loader-spark absolute -right-1 top-2 h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        />
      </div>

      {showLabel && (
        <p
          className={cn(
            'font-medium uppercase tracking-[0.18em] text-ink-900/45',
            dims.label,
          )}
        >
          {resolvedLabel}
        </p>
      )}

      {showProgress && (
        <span className="relative h-[3px] w-40 overflow-hidden rounded-full bg-ink-900/10" aria-hidden="true">
          <span
            className="kw-loader-progress absolute inset-y-0 left-0 w-1/2 rounded-full"
            style={{ background: `linear-gradient(90deg, transparent, ${accent})` }}
          />
        </span>
      )}
    </div>
  );
}
