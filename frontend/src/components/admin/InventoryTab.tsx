import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Package,
  PackageOpen,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAdminStore } from '@/stores/admin.store';
import { buildStockRows, stockSummary, zoneUsage } from '@/lib/operations';
import { suppliers, warehouses } from '@/data/operationsSeed';
import type {
  PurchaseOrderStatus,
  StockRow,
  StockStatus,
  WarehouseId,
} from '@/types/admin';
import {
  FieldLabel,
  Panel,
  Select,
  StatCard,
  TabHeader,
  adminButtonGhost,
  adminButtonPrimary,
  adminInput,
} from '@/components/admin/AdminUi';
import { Modal } from '@/components/ui/Modal';
import { Meter, StockPill, WarehouseFloorPlan } from '@/components/admin/OperationsUi';

const statusOrder: Record<StockStatus, number> = {
  out: 0,
  critical: 1,
  low: 2,
  overstock: 3,
  healthy: 4,
};

const poTones: Record<PurchaseOrderStatus, string> = {
  draft: 'bg-ink-900/[0.05] text-ink-900/50',
  ordered: 'bg-electric-500/10 text-electric-600',
  in_transit: 'bg-violet-500/10 text-violet-600',
  received: 'bg-emerald-500/10 text-emerald-700',
  delayed: 'bg-rose-500/10 text-rose-600',
};

const movementTone = {
  inbound: { icon: ArrowDownToLine, className: 'bg-emerald-500/10 text-emerald-700', sign: '+' },
  outbound: { icon: ArrowUpFromLine, className: 'bg-electric-500/10 text-electric-600', sign: '−' },
  transfer: { icon: ArrowLeftRight, className: 'bg-violet-500/10 text-violet-600', sign: '' },
  adjustment: { icon: ClipboardCheck, className: 'bg-amber-500/10 text-[#9A6A25]', sign: '' },
  return: { icon: RotateCcw, className: 'bg-[#D9587A]/10 text-[#B5385C]', sign: '+' },
} as const;

export function InventoryTab() {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const stockOverrides = useAdminStore((state) => state.stockOverrides);
  const purchaseOrders = useAdminStore((state) => state.purchaseOrders);
  const stockMovements = useAdminStore((state) => state.stockMovements);
  const restockStock = useAdminStore((state) => state.restockStock);
  const receivePurchaseOrder = useAdminStore((state) => state.receivePurchaseOrder);

  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState<'all' | WarehouseId>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StockStatus>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseId>('HAM');
  const [selectedZone, setSelectedZone] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(10);
  const [restock, setRestock] = useState<StockRow | null>(null);
  const [quantity, setQuantity] = useState('24');
  const [restockWarehouse, setRestockWarehouse] = useState<WarehouseId>('HAM');
  const [toast, setToast] = useState<string | null>(null);

  const rows = useMemo(
    () => buildStockRows(stockOverrides, purchaseOrders),
    [stockOverrides, purchaseOrders],
  );
  const summary = useMemo(() => stockSummary(rows), [rows]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows
      .filter((row) => warehouseFilter === 'all' || row.warehouse === warehouseFilter)
      .filter((row) => statusFilter === 'all' || row.status === statusFilter)
      .filter(
        (row) =>
          !term ||
          row.name.toLowerCase().includes(term) ||
          row.brand.toLowerCase().includes(term) ||
          row.sku.toLowerCase().includes(term) ||
          row.bin.toLowerCase().includes(term),
      )
      .sort(
        (a, b) =>
          statusOrder[a.status] - statusOrder[b.status] ||
          a.coverDays - b.coverDays ||
          a.name.localeCompare(b.name),
      );
  }, [rows, search, warehouseFilter, statusFilter]);

  const warehouse = warehouses.find((entry) => entry.id === selectedWarehouse) ?? warehouses[0];
  const warehouseLoad = rows
    .filter((row) => row.warehouse === selectedWarehouse)
    .reduce((sum, row) => sum + row.onHand, 0);

  useEffect(() => {
    setVisible(10);
  }, [search, warehouseFilter, statusFilter]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const number = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB');

  const openRestock = (row: StockRow) => {
    setRestock(row);
    setQuantity(String(Math.max(row.reorderPoint * 2 - row.available, 12)));
    setRestockWarehouse(row.warehouse);
  };

  const submitRestock = () => {
    if (!restock) return;
    const amount = Math.round(Number(quantity));
    if (!Number.isFinite(amount) || amount <= 0) {
      setToast(t('inventory.restock.invalid'));
      return;
    }
    restockStock({
      productId: restock.productId,
      productName: restock.name,
      sku: restock.sku,
      quantity: amount,
      warehouse: restockWarehouse,
      zone: restock.zone,
      onHand: restock.onHand,
    });
    setRestock(null);
    setToast(t('inventory.restock.success', { count: amount, name: restock.name }));
  };

  const receive = (id: string, units: number) => {
    receivePurchaseOrder(id);
    setToast(t('inventory.toast.received', { id, count: units }));
  };

  const selectedZoneData = warehouse.zones.find((zone) => zone.id === selectedZone);
  const selectedZoneUsed = selectedZoneData
    ? Math.min(zoneUsage(rows, warehouse, selectedZoneData), selectedZoneData.capacity)
    : 0;

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('inventory.eyebrow')}
        title={t('inventory.title')}
        subtitle={t('inventory.subtitle')}
        actions={
          <>
            <button
              type="button"
              onClick={() => document.getElementById('purchase-orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className={`${adminButtonGhost} h-8 text-[10.5px]`}
            >
              <PackageOpen size={12} /> {t('inventory.actions.receive')}
            </button>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-3 text-[10px] font-medium text-ink-900/50">
              <ShieldCheck size={12} className="text-emerald-600" />
              {t('inventory.sync')}
            </span>
          </>
        }
      />

      {toast && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-50 px-3.5 py-2.5 text-[11px] text-emerald-800">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
          <span className="min-w-0">{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label={t('inventory.kpi.skus')}
          value={number.format(summary.skus)}
          hint={t('inventory.kpi.skusHint')}
          icon={<Boxes size={15} />}
          accent="electric"
        />
        <StatCard
          label={t('inventory.kpi.units')}
          value={number.format(summary.units)}
          hint={t('inventory.kpi.unitsHint', { count: warehouses.length })}
          icon={<Package size={15} />}
          accent="teal"
        />
        <StatCard
          label={t('inventory.kpi.value')}
          value={formatPrice(summary.value, locale)}
          hint={t('inventory.kpi.valueHint', { days: summary.avgCover })}
          icon={<WarehouseIcon size={15} />}
          accent="violet"
        />
        <StatCard
          label={t('inventory.kpi.reorder')}
          value={number.format(summary.reorder)}
          hint={t('inventory.kpi.reorderHint', { count: summary.critical })}
          icon={<ClipboardCheck size={15} />}
          accent="amber"
        />
      </div>

      <Panel
        title={t('inventory.map.title')}
        subtitle={t('inventory.map.subtitle')}
        action={
          <div className="flex gap-1 rounded-full border border-ink-900/8 bg-ink-900/[0.025] p-0.5">
            {warehouses.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  setSelectedWarehouse(entry.id);
                  setSelectedZone(undefined);
                }}
                className={cn(
                  'rounded-full px-2 py-1 text-[9px] font-semibold transition',
                  selectedWarehouse === entry.id
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-900/40 hover:text-ink-900/70',
                )}
              >
                {entry.id}
              </button>
            ))}
          </div>
        }
      >
        <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr] lg:items-start">
          <div>
            <WarehouseFloorPlan
              warehouse={warehouse}
              rows={rows}
              locale={locale}
              selectedZone={selectedZone}
              onSelectZone={(zone) => setSelectedZone(zone === selectedZone ? undefined : zone)}
              label={t('inventory.map.mapLabel', { name: warehouse.name[locale] })}
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[8.5px] text-ink-900/40">
              {(['receiving', 'storage', 'picking', 'packing', 'dispatch', 'returns'] as const).map(
                (kind) => (
                  <span key={kind} className="flex items-center gap-1">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-[2px]',
                        kind === 'receiving' && 'bg-electric-500',
                        kind === 'storage' && 'bg-[#4FA3A5]',
                        kind === 'picking' && 'bg-violet-500',
                        kind === 'packing' && 'bg-[#3E8B8D]',
                        kind === 'dispatch' && 'bg-ink-900/70',
                        kind === 'returns' && 'bg-[#D9587A]',
                      )}
                    />
                    {t(`inventory.map.zoneKinds.${kind}`)}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-ink-900/7 bg-ink-900/[0.018] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold text-ink-900">{warehouse.name[locale]}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[9px] text-ink-900/40">
                    <MapPin size={9} /> {warehouse.city} · {warehouse.manager}
                  </p>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-ink-900/50">
                  SLA {warehouse.slaHours} h
                </span>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: t('inventory.map.units'), value: number.format(warehouseLoad) },
                  {
                    label: t('inventory.map.zones'),
                    value: String(warehouse.zones.length),
                  },
                  { label: t('inventory.map.temperature'), value: warehouse.temperature[locale] },
                ].map((entry) => (
                  <div key={entry.label} className="rounded-lg bg-white px-1 py-1.5">
                    <p className="text-[11px] font-semibold tabular-nums text-ink-900">
                      {entry.value}
                    </p>
                    <p className="text-[7.5px] uppercase tracking-[0.08em] text-ink-900/35">
                      {entry.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {selectedZoneData ? (
              <div className="rounded-xl border border-electric-500/20 bg-electric-500/[0.035] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10.5px] font-semibold text-ink-900">
                    {selectedZoneData.code} · {selectedZoneData.name[locale]}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSelectedZone(undefined)}
                    className="text-[9px] font-medium text-electric-600"
                  >
                    {t('common.close')}
                  </button>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-[9px] text-ink-900/45">
                  <span>{t('inventory.map.occupied')}</span>
                  <span className="text-[11px] font-semibold tabular-nums text-ink-900">
                    {number.format(selectedZoneUsed)} / {number.format(selectedZoneData.capacity)}
                  </span>
                </div>
                <Meter
                  percent={
                    selectedZoneData.capacity
                      ? (selectedZoneUsed / selectedZoneData.capacity) * 100
                      : 0
                  }
                  tone="electric"
                  className="mt-1.5"
                />
              </div>
            ) : (
              <ul className="max-h-[214px] space-y-1.5 overflow-y-auto pr-1">
                {warehouse.zones
                  .filter((zone) => zone.kind === 'storage')
                  .map((zone) => {
                    const used = Math.min(zoneUsage(rows, warehouse, zone), zone.capacity);
                    const percent = zone.capacity ? Math.round((used / zone.capacity) * 100) : 0;
                    return (
                      <li key={zone.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedZone(zone.id)}
                          className="w-full rounded-lg border border-ink-900/6 px-2 py-1.5 text-left transition hover:border-ink-900/15 hover:bg-ink-900/[0.02]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[9.5px] font-medium text-ink-900/65">
                              {zone.code} · {zone.name[locale]}
                            </span>
                            <span
                              className={cn(
                                'text-[8.5px] font-semibold tabular-nums',
                                percent >= 88
                                  ? 'text-rose-600'
                                  : percent >= 70
                                    ? 'text-[#9A6A25]'
                                    : 'text-emerald-700',
                              )}
                            >
                              {percent}%
                            </span>
                          </div>
                          <Meter
                            percent={percent}
                            tone={percent >= 88 ? 'rose' : percent >= 70 ? 'amber' : 'teal'}
                            className="mt-1 h-1"
                          />
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </Panel>

      <Panel
        title={t('inventory.stock.title')}
        subtitle={t('inventory.stock.subtitle', {
          count: filtered.length,
          warehouses: warehouses.length,
        })}
        action={
          <span className="rounded-full bg-ink-900/[0.04] px-2 py-0.5 text-[9px] font-semibold tabular-nums text-ink-900/45">
            {t('inventory.stock.showing', {
              shown: Math.min(visible, filtered.length),
              total: filtered.length,
            })}
          </span>
        }
      >
        <div className="flex flex-col gap-2">
          <div className="grid gap-2 sm:grid-cols-[1.5fr_1fr_1fr]">
            <div className="relative">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-900/30"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('inventory.stock.search')}
                className={`${adminInput} h-9 pl-8 text-[11px]`}
              />
            </div>
            <Select
              value={warehouseFilter}
              onChange={(value) => setWarehouseFilter(value as 'all' | WarehouseId)}
              ariaLabel={t('inventory.stock.warehouse')}
              options={[
                { value: 'all', label: t('inventory.stock.allWarehouses') },
                ...warehouses.map((entry) => ({
                  value: entry.id,
                  label: `${entry.id} · ${entry.city}`,
                })),
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(value) => setStatusFilter(value as 'all' | StockStatus)}
              ariaLabel={t('inventory.stock.status')}
              options={[
                { value: 'all', label: t('inventory.stock.allStatuses') },
                ...(Object.keys(statusOrder) as StockStatus[]).map((status) => ({
                  value: status,
                  label: t(`inventory.stock.statuses.${status}`),
                })),
              ]}
            />
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="text-[8.5px] uppercase tracking-[0.11em] text-ink-900/35">
                  <th className="pb-2 font-medium">{t('inventory.stock.product')}</th>
                  <th className="pb-2 font-medium">{t('inventory.stock.location')}</th>
                  <th className="pb-2 text-right font-medium">{t('inventory.stock.onHand')}</th>
                  <th className="pb-2 text-right font-medium">{t('inventory.stock.available')}</th>
                  <th className="pb-2 text-right font-medium">{t('inventory.stock.cover')}</th>
                  <th className="pb-2 text-right font-medium">{t('inventory.stock.statusLabel')}</th>
                  <th className="pb-2 text-right font-medium">{t('inventory.stock.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/5">
                {filtered.slice(0, visible).map((row) => (
                  <tr key={row.productId} className="text-[10.5px] transition hover:bg-ink-900/[0.015]">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={row.image}
                          alt=""
                          loading="lazy"
                          className="h-8 w-8 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-900">{row.name}</p>
                          <p className="text-[8.5px] text-ink-900/35">
                            {row.brand} · {row.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <p className="font-medium text-ink-900/65">{row.warehouse}</p>
                      <p className="text-[8.5px] text-ink-900/35">
                        {row.zone}-{row.bin}
                      </p>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <p className="font-semibold tabular-nums text-ink-900">{row.onHand}</p>
                      {row.incoming > 0 && (
                        <p className="text-[8px] tabular-nums text-emerald-600">+{row.incoming}</p>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-ink-900/60">
                      {row.available}
                      <span className="ml-1 text-[8px] text-ink-900/30">/ {row.reserved}</span>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <span
                        className={cn(
                          'tabular-nums',
                          row.coverDays < 4
                            ? 'font-semibold text-rose-600'
                            : row.coverDays < 9
                              ? 'font-medium text-[#9A6A25]'
                              : 'text-ink-900/55',
                        )}
                      >
                        {row.coverDays.toFixed(1)} d
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <StockPill
                        status={row.status}
                        label={t(`inventory.stock.statuses.${row.status}`)}
                      />
                    </td>
                    <td className="py-2 text-right">
                      <button
                        type="button"
                        onClick={() => openRestock(row)}
                        className="inline-flex h-6 items-center gap-1 rounded-full border border-ink-900/10 px-2 text-[8.5px] font-semibold text-ink-900/55 transition hover:border-electric-500/40 hover:text-electric-600"
                      >
                        <ArrowDownToLine size={9} /> {t('inventory.stock.restock')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {filtered.slice(0, visible).map((row) => (
              <article
                key={row.productId}
                className="rounded-xl border border-ink-900/[0.07] bg-white p-2.5"
              >
                <div className="flex items-start gap-2">
                  <img
                    src={row.image}
                    alt=""
                    loading="lazy"
                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-semibold text-ink-900">{row.name}</p>
                        <p className="text-[8.5px] text-ink-900/35">
                          {row.sku} · {row.warehouse} {row.zone}-{row.bin}
                        </p>
                      </div>
                      <StockPill
                        status={row.status}
                        label={t(`inventory.stock.statuses.${row.status}`)}
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                      {[
                        { label: t('inventory.stock.onHand'), value: String(row.onHand) },
                        {
                          label: t('inventory.stock.available'),
                          value: String(row.available),
                        },
                        {
                          label: t('inventory.stock.cover'),
                          value: `${row.coverDays.toFixed(1)} d`,
                        },
                      ].map((entry) => (
                        <div key={entry.label} className="rounded-lg bg-ink-900/[0.025] px-1.5 py-1">
                          <p className="text-[10px] font-semibold tabular-nums text-ink-900">
                            {entry.value}
                          </p>
                          <p className="text-[7px] uppercase tracking-[0.06em] text-ink-900/35">
                            {entry.label}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[9px] text-ink-900/35">
                        {row.incoming > 0
                          ? `${t('inventory.stock.incoming')} +${row.incoming}`
                          : `${t('inventory.stock.reserved')} ${row.reserved}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => openRestock(row)}
                        className="inline-flex h-7 items-center gap-1 rounded-full bg-ink-900 px-2.5 text-[9px] font-semibold text-white transition hover:bg-ink-800"
                      >
                        <ArrowDownToLine size={10} /> {t('inventory.stock.restock')}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="rounded-xl border border-dashed border-ink-900/10 px-4 py-6 text-center text-[11px] text-ink-900/35">
              {t('inventory.stock.empty')}
            </p>
          )}

          {visible < filtered.length && (
            <button
              type="button"
              onClick={() => setVisible((count) => count + 10)}
              className="mx-auto mt-1 inline-flex h-8 items-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-4 text-[10px] font-semibold text-ink-900/55 transition hover:border-ink-900/25 hover:text-ink-900"
            >
              {t('inventory.stock.showMore')}
            </button>
          )}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Panel title={t('inventory.suppliers.title')} subtitle={t('inventory.suppliers.subtitle')}>
          <ul className="divide-y divide-ink-900/5">
            {suppliers.map((supplier) => (
              <li key={supplier.id} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[10.5px] font-semibold text-ink-900">
                      {supplier.name}
                    </p>
                    <p className="truncate text-[8.5px] text-ink-900/35">
                      {supplier.category[locale]} · {supplier.country}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-ink-900/[0.04] px-1.5 py-0.5 text-[8.5px] font-medium tabular-nums text-ink-900/45">
                    {supplier.leadTimeDays} d
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Meter
                    percent={supplier.onTimeRate}
                    tone={supplier.onTimeRate >= 97 ? 'teal' : supplier.onTimeRate >= 94 ? 'amber' : 'rose'}
                    className="h-1"
                  />
                  <span className="w-8 shrink-0 text-right text-[8.5px] font-semibold tabular-nums text-ink-900/55">
                    {supplier.onTimeRate.toFixed(0)}%
                  </span>
                  <span className="w-14 shrink-0 text-right text-[8.5px] tabular-nums text-ink-900/35">
                    {formatPrice(supplier.spendYtd, locale)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-ink-900/6 pt-2 text-center">
            {[
              { label: t('inventory.suppliers.lead'), value: `${Math.round(suppliers.reduce((sum, supplier) => sum + supplier.leadTimeDays, 0) / suppliers.length)} d` },
              { label: t('inventory.suppliers.onTime'), value: `${(suppliers.reduce((sum, supplier) => sum + supplier.onTimeRate, 0) / suppliers.length).toFixed(1)}%` },
              { label: t('inventory.suppliers.quality'), value: (suppliers.reduce((sum, supplier) => sum + supplier.qualityScore, 0) / suppliers.length).toFixed(1) },
            ].map((entry) => (
              <div key={entry.label} className="rounded-lg bg-ink-900/[0.025] px-1 py-1.5">
                <p className="text-[10.5px] font-semibold tabular-nums text-ink-900">{entry.value}</p>
                <p className="text-[7px] uppercase tracking-[0.06em] text-ink-900/35">
                  {entry.label}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          className="scroll-mt-24"
          title={t('inventory.orders.title')}
          subtitle={t('inventory.orders.subtitle')}
          action={
            <span className="rounded-full bg-electric-500/10 px-2 py-0.5 text-[9px] font-semibold text-electric-600">
              {t('inventory.orders.openCount', {
                count: purchaseOrders.filter((order) => order.status !== 'received').length,
              })}
            </span>
          }
        >
          <div id="purchase-orders" className="space-y-2">
            {purchaseOrders.map((order) => {
              const canReceive =
                order.status === 'ordered' ||
                order.status === 'in_transit' ||
                order.status === 'delayed';
              return (
                <article
                  key={order.id}
                  className="rounded-xl border border-ink-900/[0.07] p-2.5 transition hover:border-ink-900/15"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[10.5px] font-semibold text-ink-900">{order.id}</p>
                      <p className="truncate text-[8.5px] text-ink-900/40">
                        {order.supplierName} · {order.warehouse}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold',
                        poTones[order.status],
                      )}
                    >
                      {t(`inventory.orders.status.${order.status}`)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end justify-between gap-2">
                    <div className="grid grid-cols-3 gap-3 text-[8.5px] text-ink-900/40">
                      <span>
                        <span className="block text-[9.5px] font-semibold tabular-nums text-ink-900/65">
                          {order.units}
                        </span>
                        {t('inventory.orders.units')}
                      </span>
                      <span>
                        <span className="block text-[9.5px] font-semibold tabular-nums text-ink-900/65">
                          {formatPrice(order.value, locale)}
                        </span>
                        {t('inventory.orders.value')}
                      </span>
                      <span>
                        <span className="block whitespace-nowrap text-[9.5px] font-semibold tabular-nums text-ink-900/65">
                          {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                            day: '2-digit',
                            month: 'short',
                          }).format(new Date(order.eta))}
                        </span>
                        {t('inventory.orders.eta')}
                      </span>
                    </div>
                    {canReceive ? (
                      <button
                        type="button"
                        onClick={() => receive(order.id, order.units)}
                        className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-ink-900 px-2 text-[8.5px] font-semibold text-white transition hover:bg-ink-800"
                      >
                        <Truck size={9} /> {t('inventory.orders.receive')}
                      </button>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[8.5px] font-semibold',
                          order.status === 'received'
                            ? 'bg-emerald-500/10 text-emerald-700'
                            : 'bg-ink-900/[0.05] text-ink-900/40',
                        )}
                      >
                        {order.status === 'received' && <CheckCircle2 size={9} />}
                        {order.status === 'received'
                          ? t('inventory.orders.received')
                          : t(`inventory.orders.status.${order.status}`)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 truncate border-t border-ink-900/5 pt-1.5 text-[8px] text-ink-900/30">
                    {order.lines.map((line) => `${line.name} × ${line.qty}`).join(' · ')}
                  </p>
                </article>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel
        title={t('inventory.movements.title')}
        subtitle={t('inventory.movements.subtitle')}
        action={
          <span className="rounded-full bg-ink-900/[0.04] px-2 py-0.5 text-[9px] font-semibold text-ink-900/45">
            {stockMovements.length}
          </span>
        }
      >
        {stockMovements.length === 0 ? (
          <p className="py-4 text-center text-[10px] text-ink-900/35">
            {t('inventory.movements.empty')}
          </p>
        ) : (
          <ul className="divide-y divide-ink-900/5">
            {stockMovements.slice(0, 10).map((entry) => {
              const tone = movementTone[entry.type];
              const Icon = tone.icon;
              return (
                <li key={entry.id} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                      tone.className,
                    )}
                  >
                    <Icon size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium text-ink-900">
                      {entry.productName}
                    </p>
                    <p className="truncate text-[8.5px] text-ink-900/35">
                      {t(`inventory.movements.types.${entry.type}`)} · {entry.reference}
                      {entry.fromWarehouse && entry.toWarehouse
                        ? ` · ${entry.fromWarehouse} → ${entry.toWarehouse}`
                        : entry.toWarehouse
                          ? ` · ${entry.toWarehouse}`
                          : entry.fromWarehouse
                            ? ` · ${entry.fromWarehouse}`
                            : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        'text-[10px] font-semibold tabular-nums',
                        entry.type === 'outbound' ? 'text-rose-600' : 'text-emerald-700',
                      )}
                    >
                      {tone.sign}
                      {entry.quantity}
                    </p>
                    <p className="text-[8px] tabular-nums text-ink-900/30">
                      {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(entry.date))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Modal
        open={Boolean(restock)}
        onClose={() => setRestock(null)}
        title={t('inventory.restock.title', { name: restock?.name ?? '' })}
        className="max-w-lg"
      >
        {restock && (
          <div className="p-5 sm:p-6">
            <p className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-electric-600">
              {t('inventory.restock.eyebrow')}
            </p>
            <h2 className="mt-1 font-display text-[20px] font-semibold tracking-[-0.02em] text-ink-900">
              {t('inventory.restock.title', { name: restock.name })}
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-900/45">
              {t('inventory.restock.subtitle')}
            </p>

            <div className="mt-4 flex items-center gap-3 rounded-xl border border-ink-900/7 bg-ink-900/[0.018] p-3">
              <img
                src={restock.image}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold text-ink-900">{restock.name}</p>
                <p className="text-[9.5px] text-ink-900/40">
                  {restock.sku} · {restock.warehouse} {restock.zone}-{restock.bin}
                </p>
                <StockPill
                  status={restock.status}
                  label={t(`inventory.stock.statuses.${restock.status}`)}
                />
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: t('inventory.restock.current'), value: restock.onHand },
                { label: t('inventory.restock.reorder'), value: restock.reorderPoint },
                {
                  label: t('inventory.restock.suggested'),
                  value: Math.max(restock.reorderPoint * 2 - restock.available, 12),
                },
              ].map((entry) => (
                <div key={entry.label} className="rounded-xl bg-ink-900/[0.025] px-2 py-2 text-center">
                  <p className="text-[14px] font-semibold tabular-nums text-ink-900">{entry.value}</p>
                  <p className="text-[7.5px] uppercase tracking-[0.08em] text-ink-900/35">
                    {entry.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <FieldLabel>{t('inventory.restock.quantity')}</FieldLabel>
                <input
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className={adminInput}
                />
              </div>
              <div>
                <FieldLabel>{t('inventory.restock.warehouse')}</FieldLabel>
                <Select
                  value={restockWarehouse}
                  onChange={(value) => setRestockWarehouse(value as WarehouseId)}
                  className="h-10 w-full"
                  options={warehouses.map((entry) => ({
                    value: entry.id,
                    label: `${entry.id} · ${entry.city}`,
                  }))}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setRestock(null)} className={adminButtonGhost}>
                {t('inventory.restock.cancel')}
              </button>
              <button type="button" onClick={submitRestock} className={adminButtonPrimary}>
                <ArrowDownToLine size={13} />
                {t('inventory.restock.submit', { count: Math.max(Number(quantity) || 0, 0) })}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
