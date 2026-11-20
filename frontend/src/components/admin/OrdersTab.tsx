import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownToLine,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Search,
  Truck,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { getStoredOrders } from '@/services/checkout.service';
import { formatPrice } from '@/lib/utils';
import type { AdminOrder, OrderStatus } from '@/types/admin';
import { Modal } from '@/components/ui/Modal';
import {
  Panel,
  Select,
  StatusBadge,
  TabHeader,
  adminButtonGhost,
  adminButtonPrimary,
  adminInput,
} from '@/components/admin/AdminUi';

const statuses: OrderStatus[] = ['paid', 'processing', 'shipped', 'delivered', 'pending', 'refunded'];

function liveOrders(): AdminOrder[] {
  return getStoredOrders().map((order) => ({
    id: order.id,
    customer: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
    email: order.customer.email,
    date: order.createdAt,
    total: order.total,
    status: 'paid',
    items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    payment: order.paymentLabel,
    country: order.customer.country || 'DE',
    city: order.customer.city || '',
  }));
}

export function OrdersTab({ query }: { query: string }) {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const orders = useAdminStore((state) => state.orders);
  const updateOrderStatus = useAdminStore((state) => state.updateOrderStatus);
  const [localQuery, setLocalQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [storeOrders] = useState<AdminOrder[]>(() => liveOrders());

  const allOrders = useMemo(() => {
    const seen = new Set(storeOrders.map((order) => order.id));
    return [...storeOrders, ...orders.filter((order) => !seen.has(order.id))].sort(
      (a, b) => +new Date(b.date) - +new Date(a.date),
    );
  }, [orders, storeOrders]);

  const search = `${query} ${localQuery}`.trim().toLowerCase();

  const filtered = allOrders.filter((order) => {
    if (status !== 'all' && order.status !== status) return false;
    if (!search) return true;
    return [order.id, order.customer, order.email, order.city, order.payment]
      .join(' ')
      .toLowerCase()
      .includes(search);
  });

  const totals = {
    revenue: allOrders
      .filter((order) => order.status !== 'refunded' && order.status !== 'pending')
      .reduce((sum, order) => sum + order.total, 0),
    open: allOrders.filter((order) => order.status === 'paid' || order.status === 'processing').length,
    shipped: allOrders.filter((order) => order.status === 'shipped').length,
    refunded: allOrders.filter((order) => order.status === 'refunded').length,
  };

  const exportCsv = () => {
    const header = ['Order', 'Customer', 'Email', 'Date', 'Status', 'Payment', 'Items', 'Total'];
    const rows = filtered.map((order) => [
      order.id,
      order.customer,
      order.email,
      order.date.slice(0, 10),
      order.status,
      order.payment,
      order.items,
      order.total.toFixed(2),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'klarwerk-orders.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('orders.eyebrow')}
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
        actions={
          <>
            <button type="button" onClick={exportCsv} className={adminButtonGhost}>
              <ArrowDownToLine size={13} /> {t('orders.export')}
            </button>
            <button
              type="button"
              onClick={() => setStatus('paid')}
              className={adminButtonPrimary}
            >
              <Clock size={13} /> {t('orders.awaiting')}
            </button>
          </>
        }
      />

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('orders.summary.revenue'), value: formatPrice(totals.revenue, locale), icon: CreditCard, tone: 'text-electric-600' },
          { label: t('orders.summary.open'), value: totals.open.toString(), icon: Package, tone: 'text-violet-600' },
          { label: t('orders.summary.shipped'), value: totals.shipped.toString(), icon: Truck, tone: 'text-[#3B7F81]' },
          { label: t('orders.summary.refunded'), value: totals.refunded.toString(), icon: CheckCircle2, tone: 'text-rose-500' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-ink-900/[0.07] bg-white px-4 py-3"
          >
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-ink-900/38">
                {label}
              </p>
              <p className="mt-1 text-[16px] font-semibold tabular-nums">{value}</p>
            </div>
            <Icon size={16} className={tone} />
          </div>
        ))}
      </div>

      <Panel padded={false}>
        <div className="flex flex-col gap-2 border-b border-ink-900/6 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/30" />
            <input
              value={localQuery}
              onChange={(event) => setLocalQuery(event.target.value)}
              placeholder={t('orders.search')}
              className={`${adminInput} pl-8`}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ink-900/40">
              {t('orders.count', { count: filtered.length })}
            </span>
            <Select
              value={status}
              onChange={setStatus}
              ariaLabel={t('common.status')}
              options={[
                { value: 'all', label: t('common.all') },
                ...statuses.map((entry) => ({ value: entry, label: t(`status.${entry}`) })),
              ]}
            />
          </div>
        </div>

        <div className="divide-y divide-ink-900/[0.045] md:hidden">
          {filtered.slice(0, 24).map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelected(order)}
              className="flex w-full items-start justify-between gap-3 p-3.5 text-left transition hover:bg-ink-900/[0.02]"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-1.5 text-[11.5px] font-semibold tabular-nums text-ink-900">
                  {order.id}
                  <StatusBadge status={order.status} />
                </p>
                <p className="mt-1 truncate text-[11px] text-ink-900/60">{order.customer}</p>
                <p className="mt-0.5 truncate text-[9.5px] text-ink-900/35">
                  {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                    day: '2-digit',
                    month: 'short',
                  }).format(new Date(order.date))}
                  {' · '}
                  {order.payment}
                </p>
              </div>
              <span className="shrink-0 text-right text-[12px] font-semibold tabular-nums">
                {formatPrice(order.total, locale)}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-[12px] text-ink-900/40">{t('orders.empty')}</p>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-0 text-left">
            <thead>
              <tr className="border-b border-ink-900/6 text-[8.5px] uppercase tracking-[0.12em] text-ink-900/35">
                <th className="px-4 py-2.5 font-medium">{t('orders.table.order')}</th>
                <th className="px-3 py-2.5 font-medium">{t('orders.table.customer')}</th>
                <th className="hidden px-3 py-2.5 font-medium xl:table-cell">{t('orders.table.date')}</th>
                <th className="hidden px-3 py-2.5 font-medium lg:table-cell">{t('orders.table.payment')}</th>
                <th className="px-3 py-2.5 font-medium">{t('common.status')}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t('orders.table.total')}</th>
                <th className="w-8 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[0.045]">
              {filtered.slice(0, 24).map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelected(order)}
                  className="cursor-pointer text-[11.5px] transition hover:bg-ink-900/[0.02]"
                >
                  <td className="px-4 py-2.5 font-medium tabular-nums text-ink-900">{order.id}</td>
                  <td className="px-3 py-2.5">
                    <p className="max-w-[180px] truncate font-medium text-ink-900">{order.customer}</p>
                    <p className="hidden max-w-[180px] truncate text-[9.5px] text-ink-900/35 xl:block">
                      {order.email}
                    </p>
                  </td>
                  <td className="hidden px-3 py-2.5 text-ink-900/55 xl:table-cell">
                    {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                      day: '2-digit',
                      month: 'short',
                    }).format(new Date(order.date))}
                    <span className="ml-1 text-[9.5px] text-ink-900/30">
                      {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(order.date))}
                    </span>
                  </td>
                  <td className="hidden px-3 py-2.5 text-ink-900/55 lg:table-cell">{order.payment}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                    {formatPrice(order.total, locale)}
                  </td>
                  <td className="px-3 py-2.5 text-ink-900/25">
                    <ChevronRight size={13} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="hidden px-4 py-10 text-center text-[12px] text-ink-900/40 md:block">{t('orders.empty')}</p>
        )}
      </Panel>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.id}
        className="max-w-xl"
      >
        {selected && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 pr-8">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-electric-600">
                  {t('orders.detail.eyebrow')}
                </p>
                <h3 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em]">
                  {selected.id}
                </h3>
                <p className="mt-0.5 text-[11px] text-ink-900/45">
                  {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  }).format(new Date(selected.date))}
                </p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-ink-900/8 p-3">
                <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-ink-900/35">
                  <Package size={11} /> {t('orders.detail.customer')}
                </p>
                <p className="mt-1 text-[12px] font-medium">{selected.customer}</p>
                <p className="text-[10.5px] text-ink-900/45">{selected.email}</p>
              </div>
              <div className="rounded-xl border border-ink-900/8 p-3">
                <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-ink-900/35">
                  <MapPin size={11} /> {t('orders.detail.address')}
                </p>
                <p className="mt-1 text-[12px] font-medium">{selected.city}</p>
                <p className="text-[10.5px] text-ink-900/45">{selected.country}</p>
              </div>
              <div className="rounded-xl border border-ink-900/8 p-3">
                <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-ink-900/35">
                  <CreditCard size={11} /> {t('orders.detail.payment')}
                </p>
                <p className="mt-1 text-[12px] font-medium">{selected.payment}</p>
              </div>
              <div className="rounded-xl border border-ink-900/8 p-3">
                <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-ink-900/35">
                  <Package size={11} /> {t('orders.detail.items')}
                </p>
                <p className="mt-1 text-[12px] font-medium">
                  {selected.items} {t('common.items')}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-ink-900/[0.03] px-4 py-3">
              <span className="text-[11px] text-ink-900/50">{t('orders.detail.total')}</span>
              <span className="font-display text-lg font-semibold tabular-nums">
                {formatPrice(selected.total, locale)}
              </span>
            </div>

            <div className="mt-4">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-900/40">
                {t('orders.detail.setStatus')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {statuses.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => {
                      updateOrderStatus(selected.id, entry);
                      setSelected({ ...selected, status: entry });
                    }}
                    className={
                      selected.status === entry
                        ? 'rounded-full bg-ink-900 px-3 py-1.5 text-[10px] font-semibold text-white'
                        : 'rounded-full border border-ink-900/10 px-3 py-1.5 text-[10px] font-medium text-ink-900/55 transition hover:border-ink-900/25 hover:text-ink-900'
                    }
                  >
                    {t(`status.${entry}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
