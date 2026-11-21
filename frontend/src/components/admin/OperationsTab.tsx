import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  ArrowRight,
  AlertTriangle,
  Clock,
  Gauge,
  MapPin,
  PackageCheck,
  Timer,
  Truck,
  Users,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/stores/admin.store';
import { buildStockRows, warehouseUsage } from '@/lib/operations';
import { carriers, shifts, warehouses } from '@/data/operationsSeed';
import type { FulfillmentStage } from '@/types/admin';
import { Panel, StatCard, TabHeader } from '@/components/admin/AdminUi';
import { Sparkline } from '@/components/admin/Charts';
import { FulfillmentMap, Meter } from '@/components/admin/OperationsUi';

const pipelineStages: FulfillmentStage[] = [
  'received',
  'picking',
  'packing',
  'labeling',
  'dispatch',
  'exception',
];

const stageTone: Record<FulfillmentStage, string> = {
  received: 'bg-electric-500',
  picking: 'bg-violet-500',
  packing: 'bg-[#4FA3A5]',
  labeling: 'bg-[#C28A3D]',
  dispatch: 'bg-ink-900',
  exception: 'bg-[#D9587A]',
  delivered: 'bg-emerald-500',
};

const sparkSets = [
  [16, 18, 17, 21, 20, 24, 22, 27, 26, 30, 29, 33],
  [94, 96, 95, 97, 96, 98, 97, 97, 98, 97, 98, 98],
  [8.4, 8.1, 7.6, 7.8, 7.1, 6.9, 6.4, 6.6, 6.1, 5.8, 5.6, 5.4],
  [2, 3, 2, 4, 3, 5, 4, 3, 4, 3, 4, 4],
];

function formatDuration(minutes: number) {
  const total = Math.max(0, Math.round(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours <= 0) return `${mins} min`;
  return `${hours} h ${String(mins).padStart(2, '0')}`;
}

export function OperationsTab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const jobs = useAdminStore((state) => state.fulfillmentJobs);
  const advanceJob = useAdminStore((state) => state.advanceJob);
  const stockOverrides = useAdminStore((state) => state.stockOverrides);
  const purchaseOrders = useAdminStore((state) => state.purchaseOrders);

  const rows = useMemo(
    () => buildStockRows(stockOverrides, purchaseOrders),
    [stockOverrides, purchaseOrders],
  );
  const loads = useMemo(() => warehouseUsage(rows, warehouses), [rows]);

  const activeJobs = jobs.filter((job) => job.stage !== 'delivered');
  const exceptions = jobs.filter((job) => job.stage === 'exception');
  const delivered = jobs.filter((job) => job.stage === 'delivered');
  const tracked = jobs.filter((job) => job.stage !== 'exception');
  const overdue = tracked.filter(
    (job) => job.stage !== 'delivered' && new Date(job.slaDue).getTime() < Date.now(),
  );
  const slaRate =
    carriers.reduce((sum, carrier) => sum + carrier.onTime * carrier.volume, 0) /
    Math.max(
      carriers.reduce((sum, carrier) => sum + carrier.volume, 0),
      1,
    );
  const cycleHours =
    activeJobs.reduce(
      (sum, job) => sum + (Date.now() - new Date(job.started).getTime()) / 3_600_000,
      0,
    ) / Math.max(activeJobs.length, 1);

  const number = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB');

  const dueLabel = (slaDue: string) => {
    const diffMinutes = (new Date(slaDue).getTime() - Date.now()) / 60_000;
    if (diffMinutes < 0) return { label: t('operations.pipeline.overdue'), tone: 'text-rose-600' };
    return {
      label: t('operations.pipeline.dueIn', { time: formatDuration(diffMinutes) }),
      tone: diffMinutes < 90 ? 'text-amber-600' : 'text-ink-900/45',
    };
  };

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('operations.eyebrow')}
        title={t('operations.title')}
        subtitle={t('operations.subtitle')}
        actions={
          <>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 text-[10px] font-semibold text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              {t('operations.live')} · {t('operations.shiftLabel')}
            </span>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('inventory')}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink-900 px-3.5 text-[10.5px] font-semibold text-white transition hover:bg-ink-800"
              >
                <WarehouseIcon size={12} /> {t('operations.warehouse.openMap')}
              </button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label={t('operations.kpi.open')}
          value={number.format(activeJobs.length)}
          delta={6.8}
          hint={t('operations.kpi.openHint')}
          icon={<PackageCheck size={15} />}
          accent="electric"
          spark={<Sparkline values={sparkSets[0]} />}
        />
        <StatCard
          label={t('operations.kpi.sla')}
          value={`${slaRate.toFixed(1)} %`}
          delta={1.2}
          hint={t('operations.kpi.slaHint')}
          icon={<Gauge size={15} />}
          accent="teal"
          spark={<Sparkline values={sparkSets[1]} color="#4FA3A5" />}
        />
        <StatCard
          label={t('operations.kpi.cycle')}
          value={formatDuration(cycleHours * 60)}
          hint={t('operations.kpi.cycleHint')}
          icon={<Timer size={15} />}
          accent="violet"
          spark={<Sparkline values={sparkSets[2]} color="#9B72F2" />}
        />
        <StatCard
          label={t('operations.kpi.exceptions')}
          value={number.format(exceptions.length)}
          hint={t('operations.kpi.exceptionsHint')}
          icon={<AlertTriangle size={15} />}
          accent="rose"
          spark={<Sparkline values={sparkSets[3]} color="#D9587A" />}
        />
      </div>

      <Panel
        title={t('operations.pipeline.title')}
        subtitle={t('operations.pipeline.subtitle')}
        action={
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 sm:inline-flex">
              {t('operations.pipeline.deliveredToday', { count: delivered.length })}
            </span>
            {overdue.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-semibold text-rose-600">
                <Clock size={9} /> {overdue.length}
              </span>
            )}
          </div>
        }
      >
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 xl:grid xl:grid-cols-6 xl:overflow-visible xl:pb-0">
          {pipelineStages.map((stage) => {
            const stageJobs = jobs.filter((job) => job.stage === stage);
            return (
              <div key={stage} className="w-[232px] shrink-0 xl:w-auto xl:min-w-0">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', stageTone[stage])} />
                    <span className="truncate text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-900/55">
                      {t(`operations.pipeline.stage.${stage}`)}
                    </span>
                  </div>
                  <span className="rounded-full bg-ink-900/[0.05] px-1.5 py-0.5 text-[8.5px] font-bold tabular-nums text-ink-900/50">
                    {stageJobs.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {stageJobs.map((job) => {
                    const due = dueLabel(job.slaDue);
                    return (
                      <article
                        key={job.id}
                        className={cn(
                          'group rounded-xl border bg-white p-2.5 transition hover:shadow-soft',
                          stage === 'exception'
                            ? 'border-rose-500/25 bg-rose-500/[0.025]'
                            : 'border-ink-900/[0.07]',
                        )}
                      >
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="min-w-0">
                            <p className="truncate text-[10.5px] font-semibold text-ink-900">
                              {job.orderId}
                            </p>
                            <p className="mt-0.5 truncate text-[9px] text-ink-900/40">{job.customer}</p>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase',
                              job.priority === 'express'
                                ? 'bg-violet-500/10 text-violet-600'
                                : 'bg-ink-900/[0.05] text-ink-900/45',
                            )}
                          >
                            {job.priority === 'express'
                              ? t('operations.pipeline.express')
                              : t('operations.pipeline.standard')}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center gap-1 text-[9px] text-ink-900/45">
                          <MapPin size={9} className="shrink-0" />
                          <span className="truncate">
                            {job.city}, {job.country}
                          </span>
                        </div>
                        {stage === 'exception' && job.exceptionReason && (
                          <p className="mt-1.5 rounded-md bg-rose-500/8 px-1.5 py-1 text-[8.5px] font-medium text-rose-600">
                            {t(`operations.exceptions.reason.${job.exceptionReason}`)}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-1 border-t border-ink-900/5 pt-1.5">
                          <span className={cn('text-[8.5px] font-medium tabular-nums', due.tone)}>
                            {due.label}
                          </span>
                          <span className="text-[8.5px] tabular-nums text-ink-900/35">
                            {job.items} {t('common.items')}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-1">
                          <span className="text-[9px] font-semibold tabular-nums text-ink-900/60">
                            {formatPrice(job.value, locale)}
                          </span>
                          <button
                            type="button"
                            onClick={() => advanceJob(job.id)}
                            className="inline-flex h-6 items-center gap-1 rounded-full border border-ink-900/10 bg-white px-2 text-[8.5px] font-semibold text-ink-900/55 transition group-hover:border-electric-500/40 group-hover:text-electric-600 hover:border-electric-500 hover:bg-electric-500/5 hover:text-electric-600"
                          >
                            {stage === 'exception'
                              ? t('operations.exceptions.resolve')
                              : t('operations.pipeline.advance')}
                            <ArrowRight size={9} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {stageJobs.length === 0 && (
                    <div className="rounded-xl border border-dashed border-ink-900/10 px-3 py-5 text-center text-[9.5px] text-ink-900/30">
                      {t('operations.pipeline.empty')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title={t('operations.network.title')}
          subtitle={t('operations.network.subtitle')}
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-electric-500/10 px-2 py-0.5 text-[9px] font-semibold text-electric-600">
              <Truck size={9} /> {activeJobs.length} {t('operations.network.active')}
            </span>
          }
        >
          <div className="grid gap-4 sm:grid-cols-[1.35fr_1fr] sm:items-start">
            <FulfillmentMap jobs={jobs} label={t('operations.network.mapLabel')} />
            <ul className="space-y-2.5">
              {loads.map(({ warehouse, used, capacity, percent }) => {
                const warehouseJobs = activeJobs.filter((job) => job.warehouse === warehouse.id);
                return (
                  <li key={warehouse.id} className="rounded-xl border border-ink-900/6 p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-ink-900/[0.04] text-ink-900/50">
                          <WarehouseIcon size={11} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[10.5px] font-semibold text-ink-900">
                            {warehouse.name[locale]}
                          </p>
                          <p className="text-[8.5px] text-ink-900/35">{warehouse.code}</p>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[9px] font-bold tabular-nums',
                          percent >= 88
                            ? 'bg-rose-500/10 text-rose-600'
                            : percent >= 70
                              ? 'bg-amber-500/10 text-[#9A6A25]'
                              : 'bg-emerald-500/10 text-emerald-700',
                        )}
                      >
                        {percent}%
                      </span>
                    </div>
                    <Meter
                      percent={percent}
                      tone={percent >= 88 ? 'rose' : percent >= 70 ? 'amber' : 'teal'}
                      className="mt-2"
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[8.5px] text-ink-900/35">
                      <span className="tabular-nums">
                        {number.format(used)} / {number.format(capacity)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={8} /> {warehouseJobs.length} {t('operations.warehouse.jobs')}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Panel>

        <Panel title={t('operations.carrier.title')} subtitle={t('operations.carrier.subtitle')}>
          <ul className="space-y-3">
            {carriers.map((carrier) => (
              <li key={carrier.id}>
                <div className="mb-1 flex items-center justify-between gap-2 text-[10px]">
                  <span className="flex min-w-0 items-center gap-1.5 font-medium text-ink-900/65">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: carrier.color }}
                    />
                    <span className="truncate">{carrier.name}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink-900/75">
                    {carrier.onTime.toFixed(1)}%
                  </span>
                </div>
                <Meter
                  percent={carrier.onTime}
                  tone={carrier.onTime >= 97 ? 'teal' : carrier.onTime >= 95 ? 'amber' : 'rose'}
                />
                <div className="mt-1 flex items-center justify-between text-[8.5px] text-ink-900/35">
                  <span>
                    {t('operations.carrier.transit')} {carrier.transitHours} h
                  </span>
                  <span className="tabular-nums">
                    {number.format(carrier.volume)} {t('operations.carrier.volume')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-ink-900/6 pt-2 text-[9px] text-ink-900/35">
            {t('operations.carrier.target')}
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1.15fr]">
        <Panel title={t('operations.shift.title')} subtitle={t('operations.shift.subtitle')}>
          <ul className="space-y-2">
            {shifts.map((shift) => (
              <li
                key={shift.id}
                className={cn(
                  'flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5',
                  shift.active
                    ? 'border-electric-500/25 bg-electric-500/[0.045]'
                    : 'border-ink-900/6',
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                      shift.active
                        ? 'bg-electric-500/12 text-electric-600'
                        : 'bg-ink-900/[0.04] text-ink-900/35',
                    )}
                  >
                    <Activity size={12} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10.5px] font-semibold text-ink-900">
                      {shift.name[locale]}
                    </p>
                    <p className="text-[8.5px] text-ink-900/35">{shift.window}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold tabular-nums text-ink-900/70">
                    {shift.staff} {t('operations.shift.staff')}
                  </p>
                  <p className="text-[8.5px] text-ink-900/35">
                    {shift.pickRate} {t('operations.shift.pickRateUnit')}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold',
                    shift.active
                      ? 'bg-emerald-500/10 text-emerald-700'
                      : 'bg-ink-900/[0.05] text-ink-900/35',
                  )}
                >
                  {shift.active ? t('operations.shift.active') : t('operations.shift.next')}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title={t('operations.exceptions.title')}
          subtitle={t('operations.exceptions.subtitle')}
          action={
            <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-semibold text-rose-600">
              {exceptions.length}
            </span>
          }
        >
          {exceptions.length === 0 ? (
            <p className="rounded-xl bg-emerald-500/8 px-3 py-4 text-center text-[10px] text-emerald-700">
              {t('operations.exceptions.empty')}
            </p>
          ) : (
            <ul className="space-y-2">
              {exceptions.slice(0, 4).map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-rose-500/15 bg-rose-500/[0.02] px-2.5 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-ink-900">
                      {job.orderId} · {job.customer}
                    </p>
                    <p className="text-[8.5px] text-rose-600">
                      {job.exceptionReason
                        ? t(`operations.exceptions.reason.${job.exceptionReason}`)
                        : t('operations.pipeline.stage.exception')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => advanceJob(job.id)}
                    className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-ink-900/10 bg-white px-2 text-[8.5px] font-semibold text-ink-900/55 transition hover:border-emerald-500/40 hover:text-emerald-700"
                  >
                    {t('operations.exceptions.resolve')}
                    <ArrowRight size={9} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t('operations.delivered.title')}
          subtitle={t('operations.delivered.subtitle', { count: delivered.length })}
        >
          <ul className="divide-y divide-ink-900/5">
            {delivered.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-2 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <PackageCheck size={11} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-medium text-ink-900">
                      {job.orderId} · {job.customer}
                    </p>
                    <p className="truncate text-[8.5px] text-ink-900/35">
                      {job.city} · {job.carrier}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[9px] font-semibold tabular-nums text-ink-900/50">
                  {formatPrice(job.value, locale)}
                </span>
              </li>
            ))}
            {delivered.length === 0 && (
              <li className="py-4 text-center text-[10px] text-ink-900/35">
                {t('operations.delivered.empty')}
              </li>
            )}
          </ul>
          <div className="mt-2 flex items-center justify-between border-t border-ink-900/6 pt-2 text-[9px] text-ink-900/35">
            <span>{t('operations.network.onTime')}</span>
            <span className="font-semibold text-emerald-600">98,4 %</span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
