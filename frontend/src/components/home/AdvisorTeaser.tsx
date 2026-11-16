import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { asset } from '@/lib/catalog';

const starterKeys = [
  'starters.studyLaptop',
  'starters.everydayHeadphones',
  'starters.gamingSetup',
] as const;

export function AdvisorTeaser() {
  const { t } = useTranslation(['store', 'assistant']);

  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 text-white sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(155,114,242,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[560px] w-[560px] rounded-full bg-electric-500/12 blur-[140px]" />
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="container-x relative grid items-center gap-12 lg:grid-cols-[1fr_1.02fr] lg:gap-16">
        <Reveal>
          <div>
            <p className="eyebrow text-violet-300">
              <Sparkles size={13} />
              {t('store:home.advisor.eyebrow')}
            </p>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl">
              {t('store:home.advisor.title')}
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/50">
              {t('store:home.advisor.subtitle')}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {starterKeys.map((key) => (
                <Link
                  key={key}
                  to={`/advisor?q=${encodeURIComponent(t(`assistant:${key}`))}`}
                  className="rounded-full border border-white/12 px-3.5 py-1.5 text-[11px] text-white/55 transition hover:border-white/30 hover:bg-white/[0.06] hover:text-white"
                >
                  {t(`assistant:${key}`)}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/advisor"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-semibold text-ink-900 transition hover:bg-white/90"
              >
                {t('store:home.advisor.cta')}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="flex items-center gap-2 text-[11px] text-white/35">
                <Check size={13} className="text-emerald-400" />
                {t('assistant:meta.demoNote')}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.4rem] bg-gradient-to-br from-electric-500/20 via-transparent to-violet-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-ink-800/90 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-electric-500 to-violet-500 text-white">
                    <Sparkles size={14} />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium text-white/90">
                      {t('store:home.advisor.badge')}
                    </p>
                    <p className="text-[9px] uppercase tracking-[0.14em] text-emerald-300/80">
                      {t('assistant:meta.grounded')}
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-white/12 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-white/35">
                  {t('assistant:meta.modeBadge')}
                </span>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex justify-end">
                  <p className="max-w-[82%] rounded-2xl rounded-br-md bg-electric-500 px-4 py-2.5 text-[12px] leading-relaxed text-white">
                    {t('store:home.advisor.previewQuestion')}
                  </p>
                </div>

                <div className="flex gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-violet-300">
                    <Sparkles size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="rounded-2xl rounded-tl-md border border-white/8 bg-white/[0.04] px-4 py-3 text-[12px] leading-relaxed text-white/70">
                      {t('store:home.advisor.previewAnswer')}
                    </p>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/8 bg-ink-950/50 p-2.5">
                      <img
                        src={asset('/assets/images/products/laptop-screen.webp')}
                        alt=""
                        loading="lazy"
                        className="h-12 w-14 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-white/85">
                          {t('store:home.advisor.previewProduct')}
                        </p>
                        <p className="text-[10px] text-white/35">
                          {t('store:home.advisor.previewPrice')}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-1 text-[9px] font-semibold text-emerald-300">
                        {t('store:home.advisor.previewMatch')}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-white/30">
                      <span className="flex gap-1">
                        <span className="h-1 w-1 animate-bounce rounded-full bg-white/40 [animation-delay:0ms]" />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-white/40 [animation-delay:120ms]" />
                        <span className="h-1 w-1 animate-bounce rounded-full bg-white/40 [animation-delay:240ms]" />
                      </span>
                      {t('store:home.advisor.previewTyping')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/8 px-5 py-3.5">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] text-white/25">
                  {t('assistant:composer.placeholderShort')}
                  <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-electric-500 text-white">
                    <ArrowRight size={11} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
