import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  BadgeEuro,
  CreditCard,
  Gauge,
  Inbox,
  Package,
  Percent,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { useAuthStore } from '@/stores/auth.store';
import { products as catalogProducts } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import {
  channelPerformance,
  categoryPerformance,
  groupRevenue,
  hourlyHeatmap,
  satisfaction,
  seedRevenueGoal,
  topProducts,
} from '@/data/adminSeed';
import {
  Bars3D,
  DonutChart,
  GoalRing,
  FunnelChart,
  Heatmap,
  RevenueAreaChart,
  SatisfactionGauge,
  Sparkline,
} from '@/components/admin/Charts';
import { Panel, StatCard, StatusBadge } from '@/components/admin/AdminUi';
import { MessageBadge } from '@/components/admin/AdminUi';

const sparkSets = [
  [18, 22, 20, 26, 24, 30, 28, 35, 33, 39, 42, 47],
  [30, 28, 32, 29, 34, 33, 37, 36, 40, 38, 43, 45],
  [12, 15, 13, 17, 16, 18, 17, 21, 20, 23, 22, 26],
  [41, 38, 40, 36, 39, 35, 37, 33, 35, 32, 34, 31],
];

const overflowProducts = catalogProducts
  .filter((product) => product.stock <= 8)
  .slice(0, 5);

export function OverviewTab({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const orders = useAdminStore((state) => state.orders);
  const messages = useAdminStore((state) => state.messages);
  const customers = useAdminStore((state) => state.customers);
  const settings = useAdminStore((state) => state.settings);
  const reviews = useAdminStore((state) => state.reviews);
  const updateMessageStatus = useAdminStore((state) => state.updateMessageStatus);
  const user = useAuthStore((state) => state.user);

  const points = useMemo(() => groupRevenue(orders, 14), [orders]);
  const revenue = points.reduce((sum, point) => sum + point.revenue, 0);
  const profit = points.reduce((sum, point) => sum + point.profit, 0);
  const orderCount = points.reduce((sum, point) => sum + point.orders, 0);
  const aov = orderCount ? revenue / orderCount : 0;
  const openMessages = messages.filter((message) => message.status !== 'resolved');
  const recentOrders = orders.slice(0, 5);
  const monthRevenue = orders
    .filter((order) => order.status !== 'refunded' && order.status !== 'pending')
    .reduce((sum, order) => sum + order.total, 0);
  const goal = Math.max(settings.monthlyGoal, seedRevenueGoal);

  const heatmapDays =
    locale === 'de'
      ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-electric-500/15 bg-gradient-to-r from-electric-500/[0.07] via-white to-violet-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-white">
            <Star size={17} />
          </span>
          <div>
            <p className="text-[12px] font-semibold text-ink-900">
              {t('overview.welcome', { name: user?.name?.split(' ')[0] ?? 'Aylin' })}
            </p>
            <p className="text-[10.5px] text-ink-900/50">{t('overview.welcomeHint')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-ink-900/10 bg-white/70 px-2.5 py-1 text-[10px] font-medium text-ink-900/55">
            {t('shell.live')} · {new Date().toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB')}
          </span>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink-900 px-3 text-[10.5px] font-semibold text-white transition hover:bg-ink-800"
          >
            {t('overview.ctaProduct')} <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('overview.kpi.revenue')}
          value={formatPrice(revenue, locale)}
          delta={14.8}
          hint={t('overview.kpi.revenueHint')}
          icon={<BadgeEuro size={15} />}
          accent="electric"
          spark={<Sparkline values={sparkSets[0]} />}
        />
        <StatCard
          label={t('overview.kpi.profit')}
          value={formatPrice(profit, locale)}
          delta={9.2}
          hint={t('overview.kpi.profitHint')}
          icon={<TrendingUp size={15} />}
          accent="teal"
          spark={<Sparkline values={sparkSets[1]} color="#4FA3A5" />}
        />
        <StatCard
          label={t('overview.kpi.orders')}
          value={orderCount.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB')}
          delta={6.4}
          hint={t('overview.kpi.ordersHint')}
          icon={<ShoppingCart size={15} />}
          accent="violet"
          spark={<Sparkline values={sparkSets[2]} color="#9B72F2" />}
        />
        <StatCard
          label={t('overview.kpi.aov')}
          value={formatPrice(aov, locale)}
          delta={-1.8}
          hint={t('overview.kpi.aovHint')}
          icon={<CreditCard size={15} />}
          accent="amber"
          spark={<Sparkline values={sparkSets[3]} color="#C28A3D" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title={t('overview.revenue.title')}
          subtitle={t('overview.revenue.subtitle')}
          action={
            <div className="flex items-center gap-3 text-[9.5px] text-ink-900/45">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-electric-500" /> {t('overview.revenue.revenue')}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4FA3A5]" /> {t('overview.revenue.profit')}
              </span>
            </div>
          }
        >
          <RevenueAreaChart points={points} locale={locale} />
        </Panel>

        <div className="space-y-4">
          <Panel title={t('overview.goal.title')} subtitle={t('overview.goal.subtitle')}>
            <GoalRing value={monthRevenue} target={goal} locale={locale} />
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-ink-900/6 pt-3">
              {[
                { icon: Percent, value: `${((profit / Math.max(revenue, 1)) * 100).toFixed(0)}%`, label: t('overview.goal.margin') },
                { icon: Users, value: `${Math.round(orderCount * 0.38)}`, label: t('overview.goal.returning') },
                { icon: Target, value: '3.6%', label: t('overview.goal.conversion') },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="rounded-xl bg-ink-900/[0.025] p-2 text-center">
                  <Icon size={12} className="mx-auto text-ink-900/35" />
                  <p className="mt-1 text-[13px] font-semibold tabular-nums text-ink-900">{value}</p>
                  <p className="text-[8.5px] uppercase tracking-[0.08em] text-ink-900/35">{label}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel
            title={t('overview.satisfaction.title')}
            subtitle={t('overview.satisfaction.subtitle')}
            action={
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                +{satisfaction.responseRate}%
              </span>
            }
          >
            <div className="flex flex-col items-center gap-3 sm:flex-row xl:flex-col">
              <SatisfactionGauge
                value={satisfaction.score}
                label={t('overview.satisfaction.score')}
                sublabel={t('overview.satisfaction.responses', {
                  count: satisfaction.responses,
                })}
              />
              <div className="w-full space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = satisfaction.distribution[star - 1] ?? 0;
                  const ratio = count / Math.max(...satisfaction.distribution);
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span className="w-3 text-[9px] tabular-nums text-ink-900/40">{star}★</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-900/6">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-[9px] tabular-nums text-ink-900/35">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title={t('overview.channels.title')} subtitle={t('overview.channels.subtitle')}>
          <Bars3D data={channelPerformance} />
          <p className="mt-2 border-t border-ink-900/6 pt-2 text-[9.5px] text-ink-900/38">
            {t('overview.channels.foot')}
          </p>
        </Panel>

        <Panel title={t('overview.categories.title')} subtitle={t('overview.categories.subtitle')}>
          <DonutChart
            data={categoryPerformance}
            centerLabel={t('overview.categories.center')}
            centerValue="€412k"
          />
        </Panel>

        <Panel title={t('overview.funnel.title')} subtitle={t('overview.funnel.subtitle')}>
          <FunnelChart
            steps={[
              { label: t('overview.funnel.visits'), value: 45280, color: '#5865F2' },
              { label: t('overview.funnel.views'), value: 21460, color: '#7E8AFB' },
              { label: t('overview.funnel.cart'), value: 8940, color: '#9B72F2' },
              { label: t('overview.funnel.checkout'), value: 4120, color: '#B08CF5' },
              { label: t('overview.funnel.orders'), value: 2184, color: '#4FA3A5' },
            ]}
          />
          <div className="mt-3 flex items-center justify-between rounded-xl bg-ink-900/[0.03] px-3 py-2">
            <span className="text-[9.5px] text-ink-900/45">{t('overview.funnel.total')}</span>
            <span className="text-[11px] font-semibold tabular-nums text-ink-900">4.82%</span>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Panel title={t('overview.heatmap.title')} subtitle={t('overview.heatmap.subtitle')}>
          <Heatmap
            matrix={hourlyHeatmap}
            rows={heatmapDays}
            columns={['8', '9', '10', '11', '12', '13', '14', '15', '16', '17']}
          />
          <div className="mt-3 flex items-center justify-end gap-1.5">
            <span className="text-[8.5px] text-ink-900/35">{t('overview.heatmap.low')}</span>
            {[0.08, 0.24, 0.42, 0.62, 0.86].map((opacity) => (
              <span
                key={opacity}
                className="h-2.5 w-2.5 rounded-[2px]"
                style={{ backgroundColor: `rgba(88,101,242,${opacity})` }}
              />
            ))}
            <span className="text-[8.5px] text-ink-900/35">{t('overview.heatmap.high')}</span>
          </div>
        </Panel>

        <Panel
          title={t('overview.recentOrders.title')}
          subtitle={t('overview.recentOrders.subtitle')}
          action={
            <button
              type="button"
              onClick={() => onNavigate('orders')}
              className="text-[10px] font-medium text-electric-600 hover:text-electric-500"
            >
              {t('common.all')}
            </button>
          }
        >
          <ul className="divide-y divide-ink-900/6">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-[11.5px] font-medium text-ink-900">{order.customer}</p>
                  <p className="text-[9.5px] text-ink-900/38">
                    {order.id} · {order.items} {t('common.items')}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={order.status} />
                  <span className="w-16 text-right text-[11px] font-semibold tabular-nums">
                    {formatPrice(order.total, locale)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <Panel
          title={t('overview.topProducts.title')}
          subtitle={t('overview.topProducts.subtitle')}
          action={
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="text-[10px] font-medium text-electric-600 hover:text-electric-500"
            >
              {t('common.view')}
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-left">
              <thead>
                <tr className="text-[8.5px] uppercase tracking-[0.12em] text-ink-900/35">
                  <th className="pb-2 font-medium">{t('overview.topProducts.product')}</th>
                  <th className="pb-2 text-right font-medium">{t('overview.topProducts.units')}</th>
                  <th className="pb-2 text-right font-medium">{t('overview.topProducts.revenue')}</th>
                  <th className="pb-2 text-right font-medium">{t('overview.topProducts.margin')}</th>
                  <th className="pb-2 text-right font-medium">{t('overview.topProducts.trend')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/6">
                {topProducts.slice(0, 5).map((product) => (
                  <tr key={product.sku} className="text-[11px]">
                    <td className="py-2">
                      <p className="font-medium text-ink-900">{product.name}</p>
                      <p className="text-[9px] text-ink-900/35">{product.sku}</p>
                    </td>
                    <td className="py-2 text-right tabular-nums text-ink-900/65">{product.units}</td>
                    <td className="py-2 text-right font-semibold tabular-nums">
                      {formatPrice(product.revenue, locale)}
                    </td>
                    <td className="py-2 text-right tabular-nums text-ink-900/65">{product.margin}%</td>
                    <td className="py-2 text-right">
                      <span
                        className={
                          product.trend >= 0
                            ? 'text-[10px] font-semibold text-emerald-600'
                            : 'text-[10px] font-semibold text-rose-500'
                        }
                      >
                        {product.trend >= 0 ? '+' : ''}
                        {product.trend}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel
            title={t('overview.inbox.title')}
            subtitle={t('overview.inbox.subtitle', { count: openMessages.length })}
            action={
              <button
                type="button"
                onClick={() => onNavigate('inbox')}
                className="text-[10px] font-medium text-electric-600 hover:text-electric-500"
              >
                {t('common.all')}
              </button>
            }
          >
            <ul className="space-y-2">
              {openMessages.slice(0, 3).map((message) => (
                <li key={message.id} className="rounded-xl border border-ink-900/6 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-semibold text-ink-900">{message.name}</p>
                    <MessageBadge status={message.status} />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-ink-900/55">{message.subject}</p>
                  <button
                    type="button"
                    onClick={() => updateMessageStatus(message.id, 'resolved')}
                    className="mt-1.5 text-[9.5px] font-medium text-electric-600 hover:text-electric-500"
                  >
                    {t('overview.inbox.resolve')}
                  </button>
                </li>
              ))}
              {openMessages.length === 0 && (
                <li className="flex items-center gap-2 rounded-xl bg-emerald-500/8 px-3 py-3 text-[11px] text-emerald-700">
                  <Inbox size={14} /> {t('overview.inbox.empty')}
                </li>
              )}
            </ul>
          </Panel>

          <Panel
            title={t('overview.stock.title')}
            subtitle={t('overview.stock.subtitle', { count: overflowProducts.length })}
            action={
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="text-[10px] font-medium text-electric-600 hover:text-electric-500"
              >
                {t('common.manage')}
              </button>
            }
          >
            <ul className="divide-y divide-ink-900/6">
              {overflowProducts.map((product) => (
                <li key={product.id} className="flex items-center gap-2 py-1.5">
                  <Package size={12} className="shrink-0 text-amber-500" />
                  <span className="min-w-0 flex-1 truncate text-[10.5px] text-ink-900/70">
                    {product.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-amber-700">
                    {product.stock}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Gauge, label: t('overview.foot.session'), value: '3m 48s' },
          { icon: Users, label: t('overview.foot.customers'), value: customers.length.toString() },
          { icon: Star, label: t('overview.foot.reviews'), value: reviews.length.toString() },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-ink-900/[0.07] bg-white px-4 py-3"
          >
            <span className="flex items-center gap-2 text-[10.5px] text-ink-900/50">
              <Icon size={13} className="text-ink-900/30" />
              {label}
            </span>
            <span className="text-[13px] font-semibold tabular-nums">{value}</span>
          </div>
        ))}
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-2 pt-1 text-[9.5px] text-ink-900/30">
        <Link to="/" className="underline decoration-ink-900/15 underline-offset-4 hover:text-ink-900/60">
          {t('shell.backToShop')}
        </Link>
        ·
        <span>{t('shell.footer')}</span>
      </p>
    </div>
  );
}
