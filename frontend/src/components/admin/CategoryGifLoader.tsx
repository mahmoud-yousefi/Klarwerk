import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryGifLoaderProps {
  step: number;
  steps: [string, string, string];
}

/**
 * Chunky, looping "category factory" animation — intentionally different from
 * the photoreal product loaders: it reads like a small animated GIF and keeps
 * the admin feedback playful while a new category is being assembled.
 */
export function CategoryGifLoader({ step, steps }: CategoryGifLoaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-ink-900 via-ink-800 to-[#171432] p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-4 h-32 w-32 rounded-full bg-electric-500/30 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 bottom-0 h-28 w-28 rounded-full bg-violet-500/30 blur-2xl"
      />

      <div className="relative flex items-center justify-between">
        <span className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[8.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          category.engine
        </span>
        <span className="flex items-center gap-1.5 text-[9px] text-white/40">
          <Loader2 size={11} className="animate-spin" />
          GIF · 60 fps
        </span>
      </div>

      <div className="relative mt-3 flex h-[104px] items-center justify-center">
        <div className="kw-cat-orbit absolute h-[92px] w-[92px] rounded-full border border-dashed border-white/15">
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-electric-300 shadow-[0_0_10px_rgba(165,174,255,0.9)]" />
          <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-violet-300" />
        </div>
        <div className="kw-cat-orbit-reverse absolute h-[68px] w-[68px] rounded-full border border-white/10">
          <span className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#4FA3A5]" />
        </div>

        <div className="kw-cat-bob relative">
          <div className="absolute -inset-4 rounded-3xl bg-electric-500/20 blur-xl" />
          <div className="relative flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-xl border border-white/25 bg-gradient-to-br from-white/95 to-white/70 shadow-[0_14px_30px_-12px_rgba(0,0,0,0.7)]">
            <div className="grid grid-cols-2 gap-1">
              <span className="h-2.5 w-2.5 rounded-[2px] bg-electric-500/80" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-violet-400/80" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#4FA3A5]/80" />
              <span className="h-2.5 w-2.5 rounded-[2px] bg-[#D9587A]/80" />
            </div>
            <span className="kw-cat-scan absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-electric-400 to-transparent" />
          </div>
          <Sparkles size={11} className="kw-cat-pop absolute -right-2 -top-1 text-amber-300" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center gap-[3px]">
          {[5, 9, 14, 8, 17, 11, 6, 13, 9, 4].map((height, index) => (
            <span
              key={index}
              className="w-[3px] rounded-full bg-white/25"
              style={{
                height,
                animation: `kw-cat-pop ${1 + (index % 4) * 0.28}s ease-in-out infinite`,
                animationDelay: `${index * 0.08}s`,
              }}
            />
          ))}
        </div>

        <span className="kw-cat-slide absolute left-4 top-6 h-1 w-1 rounded-full bg-white/60" />
        <span
          className="kw-cat-slide absolute left-8 top-12 h-0.5 w-0.5 rounded-full bg-electric-300"
          style={{ animationDelay: '0.9s' }}
        />
        <span
          className="kw-cat-slide absolute left-2 top-20 h-1 w-1 rounded-full bg-violet-300"
          style={{ animationDelay: '1.6s' }}
        />
      </div>

      <div className="relative mt-2">
        <div className="flex items-center justify-between text-[9px] text-white/45">
          <span>{steps[Math.min(step, steps.length - 1)]}</span>
          <span className="tabular-nums">{Math.min((step + 1) * 33 + 4, 99)}%</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="kw-cat-stripes h-full rounded-full bg-gradient-to-r from-electric-500 to-violet-500 transition-[width] duration-500"
            style={{ width: `${Math.min((step + 1) * 33 + 4, 99)}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          {steps.map((label, index) => (
            <div
              key={label}
              className={cn(
                'flex min-w-0 flex-1 items-center gap-1 rounded-md border px-1.5 py-1 text-[8px] transition',
                index < step
                  ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                  : index === step
                    ? 'border-white/20 bg-white/10 text-white/80'
                    : 'border-white/8 text-white/30',
              )}
            >
              {index < step ? (
                <Check size={8} className="shrink-0" />
              ) : (
                <span
                  className={cn(
                    'h-1 w-1 shrink-0 rounded-full',
                    index === step ? 'animate-pulse bg-electric-300' : 'bg-white/25',
                  )}
                />
              )}
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
