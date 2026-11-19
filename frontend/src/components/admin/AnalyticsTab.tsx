import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BadgeEuro,
  Megaphone,
  Percent,
  RotateCcw,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { formatPrice } from '@/lib/utils';
import {
  categoryPerformance,
  cohortRetention,
  groupRevenue,
  satisfaction,
  trafficSources,
} from '@/data/adminSeed';
import {
  Bars3D,
  DonutChart,
  RevenueAreaChart,
  SatisfactionGauge,
  Sparkline,
} from '@/components/admin/Charts';
import { Panel, StatCard, TabHeader } from '@/components/admin/AdminUi';

export function AnalyticsTab() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const orders = useAdminStore((state) => state.orders);
  const reviews = useAdminStore((state) => state.reviews);

  const points = useMemo(() => groupRevenue(orders, 30), [orders]);
  const revenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const profit = points.reduce((sum, point) => sum + point.profit, 0);
  const refunds = orders.filter((order) => order.status === 'refunded');
  const refundRevenue = refunds.reduce((sum, order) => sum + order.total, 0);
  const refundRate = (refundRevenue / Math.max(revenue, 1)) * 100;
  const margin = (profit / Math.max(revenue, 1)) * 100;

  const cohortLabels =
    locale === 'de'
      ? ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('analytics.eyebrow')}
        title={t('analytics.title')}
        subtitle={t('analytics.subtitle')}
        actions={
          <span className="rounded-full border border-ink-900/10 bg-white px-3 py-1.5 text-[10px] font-medium text-ink-900/50">
            {t('analytics.range')}
          </span>
        }
      />

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('analytics.kpi.revenue')}
          value={formatPrice(revenue, locale)}
          delta={12.6}
          hint={t('analytics.kpi.revenueHint')}
          icon={<BadgeEuro size={15} />}
          accent="electric"
          spark={<Sparkline values={[20, 24, 22, 27, 31, 29, 34, 38, 35, 41, 45, 49]} />}
        />
        <StatCard
          label={t('analytics.kpi.margin')}
          value={`${margin.toFixed(0)}%`}
          delta={2.1}
          hint={t('analytics.kpi.marginHint')}
          icon={<Percent size={15} />}
          accent="teal"
          spark={<Sparkline values={[28, 30, 29, 31, 33, 32, 34, 33, 35, 34, 36, 37]} color="#4FA3A5" />}
        />
        <StatCard
          label={t('analytics.kpi.roas')}
          value="4.8×"
          delta={18.4}
          hint={t('analytics.kpi.roasHint')}
          icon={<Megaphone size={15} />}
          accent="violet"
          spark={<Sparkline values={[3.1, 3.4, 3.3, 3.8, 3.6, 4.1, 4.3, 4.2, 4.5, 4.6, 4.7, 4.8]} color="#9B72F2" />}
        />
        <StatCard
          label={t('analytics.kpi.refund')}
          value={`${refundRate.toFixed(1)}%`}
          delta={-0.6}
          hint={t('analytics.kpi.refundHint')}
          icon={<RotateCcw size={15} />}
          accent="rose"
          spark={<Sparkline values={[3.2, 3.0, 3.4, 2.8, 2.9, 2.6, 2.7, 2.4, 2.5, 2.2, 2.3, 2.1]} color="#D9587A" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
        <Panel
          title={t('analytics.trend.title')}
          subtitle={t('analytics.trend.subtitle')}
          action={
            <div className="flex items-center gap-3 text-[9.5px] text-ink-900/45">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-electric-500" /> {t('analytics.trend.revenue')}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4FA3A5]" /> {t('analytics.trend.profit')}
              </span>
            </div>
          }
        >
          <RevenueAreaChart points={points} locale={locale} height={270} />
        </Panel>

        <div className="space-y-4">
          <Panel title={t('analytics.satisfaction.title')} subtitle={t('analytics.satisfaction.subtitle')}>
            <div className="flex items-center gap-4">
              <SatisfactionGauge
                value={satisfaction.score}
                label={t('analytics.satisfaction.avg')}
                sublabel={t('analytics.satisfaction.nps', { value: satisfaction.nps })}
              />
              <div className="flex-1 space-y-2">
                {[
                  { label: t('analytics.satisfaction.response'), value: `${satisfaction.responseRate}%` },
                  { label: t('analytics.satisfaction.reviews'), value: satisfaction.responses.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB') },
                  { label: t('analytics.satisfaction.target'), value: '4.7' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between border-b border-ink-900/5 pb-1.5 text-[10.5px]">
                    <span className="text-ink-900/45">{label}</span>
                    <span className="font-semibold tabular-nums">{value}</span>
                  </div>
                ))}
                <p className="flex items-center gap-1 pt-0.5 text-[10px] font-medium text-emerald-600">
                  <TrendingUp size={11} /> {t('analytics.satisfaction.aboveTarget')}
                </p>
              </div>
            </div>
          </Panel>

          <Panel title={t('analytics.traffic.title')} subtitle={t('analytics.traffic.subtitle')}>
            <ul className="space-y-2.5">
              {trafficSources.map((source) => {
                const max = Math.max(...trafficSources.map((entry) => entry.visits));
                return (
                  <li key={source.label}>
                    <div className="mb-1 flex items-center justify-between text-[10px]">
                      <span className="text-ink-900/60">{source.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums text-ink-900/40">
                          {source.visits.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB')}
                        </span>
                        <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-[8.5px] font-semibold tabular-nums text-emerald-700">
                          {source.conversion}%
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-ink-900/6">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-electric-500 to-violet-400"
                        style={{ width: `${(source.visits / max) * 100}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={t('analytics.channels.title')} subtitle={t('analytics.channels.subtitle')}>
          <Bars3D
            data={[
              { label: 'Organic', value: 38, color: '#5865F2' },
              { label: 'Paid', value: 24, color: '#9B72F2' },
              { label: 'Mail', value: 18, color: '#4FA3A5' },
              { label: 'Social', value: 13, color: '#D9587A' },
              { label: 'Direct', value: 7, color: '#C28A3D' },
            ]}
          />
        </Panel>

        <Panel title={t('analytics.mix.title')} subtitle={t('analytics.mix.subtitle')}>
          <DonutChart
            data={categoryPerformance}
            centerLabel={t('analytics.mix.center')}
            centerValue="€412k"
            size={152}
          />
        </Panel>

        <Panel title={t('analytics.cohorts.title')} subtitle={t('analytics.cohorts.subtitle')}>
          <div className="overflow-x-auto">
            <div className="min-w-0">
              <div className="grid grid-cols-[46px_repeat(6,1fr)] gap-1">
                <span />
                {[0, 1, 2, 3, 4, 5].map((month) => (
                  <span key={month} className="pb-1 text-center text-[8px] text-ink-900/35">
                    M{month}
                  </span>
                ))}
                {cohortRetention.map((row, rowIndex) => (
                  <div key={rowIndex} className="contents">
                    <span className="flex items-center text-[8.5px] text-ink-900/40">
                      {cohortLabels[rowIndex] ?? rowIndex + 1}
                    </span>
                    {row.map((value, columnIndex) => (
                      <span
                        key={columnIndex}
                        className="flex h-6 items-center justify-center rounded-[3px] text-[8px] font-semibold tabular-nums"
                        style={{
                          backgroundColor:
                            value === 0
                              ? 'rgba(8,13,24,0.025)'
                              : `rgba(79,163,165,${0.1 + (value / 100) * 0.7})`,
                          color: value > 62 ? '#fff' : 'rgba(8,13,24,0.55)',
                        }}
                      >
                        {value === 0 ? '–' : `${value}%`}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-2 text-[9px] text-ink-900/35">{t('analytics.cohorts.foot')}</p>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Panel title={t('analytics.reviews.title')} subtitle={t('analytics.reviews.subtitle')}>
          <ul className="divide-y divide-ink-900/[0.045]">
            {reviews.map((review) => (
              <li key={review.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-ink-900">{review.title}</p>
                  <span className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={9}
                        className={
                          index < review.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-ink-900/15'
                        }
                      />
                    ))}
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-ink-900/50">
                  {review.text}
                </p>
                <p className="mt-0.5 text-[8.5px] text-ink-900/35">
                  {review.author} · {review.product} · {review.verified ? t('analytics.reviews.verified') : ''}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t('analytics.insights.title')} subtitle={t('analytics.insights.subtitle')}>
          <ul className="space-y-2">
            {[
              { icon: TrendingUp, title: t('analytics.insights.oneTitle'), text: t('analytics.insights.oneText'), tone: 'text-emerald-600 bg-emerald-500/10' },
              { icon: Users, title: t('analytics.insights.twoTitle'), text: t('analytics.insights.twoText'), tone: 'text-electric-600 bg-electric-500/10' },
              { icon: Percent, title: t('analytics.insights.threeTitle'), text: t('analytics.insights.threeText'), tone: 'text-violet-600 bg-violet-500/10' },
            ].map(({ icon: Icon, title, text, tone }) => (
              <li key={title} className="flex gap-2.5 rounded-xl border border-ink-900/6 p-3">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${tone}`}>
                  <Icon size={13} />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-ink-900">{title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-ink-900/50">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
