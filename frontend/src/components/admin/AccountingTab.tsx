import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownToLine,
  Banknote,
  CalendarClock,
  CircleDollarSign,
  Landmark,
  ReceiptText,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { formatPrice } from '@/lib/utils';
import type { InvoiceStatus } from '@/types/admin';
import type { Locale } from '@/types/catalog';
import { financeMonths, seedInvoices, seedPayouts } from '@/data/adminSeed';
import {
  BarList,
  DonutChart,
  RevenueAreaChart,
  Sparkline,
} from '@/components/admin/Charts';
import { Panel, Select, StatCard, TabHeader, adminButtonGhost } from '@/components/admin/AdminUi';
import { cn } from '@/lib/utils';

type Range = 3 | 6 | 12;

const invoiceTones: Record<InvoiceStatus, string> = {
  paid: 'bg-emerald-500/10 text-emerald-700',
  open: 'bg-electric-500/10 text-electric-600',
  overdue: 'bg-rose-500/10 text-rose-600',
  draft: 'bg-ink-900/6 text-ink-900/45',
};

function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  const { t } = useTranslation('admin');
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold',
        invoiceTones[status],
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {t(`accounting.invoices.status.${status}`)}
    </span>
  );
}

export function AccountingTab({ query }: { query: string }) {
  const { t, i18n } = useTranslation('admin');
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;
  const orders = useAdminStore((state) => state.orders);
  const [range, setRange] = useState<Range>(12);
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | InvoiceStatus>('all');

  const months = financeMonths.slice(-range);
  const previous = financeMonths.slice(-range * 2, -range);

  const total = (rows: typeof months, key: keyof (typeof months)[number]) =>
    rows.reduce((sumValue, row) => sumValue + Number(row[key]), 0);

  const grossRevenue = total(months, 'revenue');
  const refunds = total(months, 'refunds');
  const cogs = total(months, 'cogs');
  const opex = total(months, 'opex');
  const marketing = total(months, 'marketing');

  const netRevenue = grossRevenue / 1.19 - refunds;
  const vatOutput = grossRevenue - grossRevenue / 1.19;
  const vatInput = (cogs + opex + marketing) * 0.19 * 0.55;
  const vatPayable = Math.max(vatOutput - vatInput, 0);
  const grossProfit = netRevenue - cogs;
  const ebit = grossProfit - opex - marketing;
  const tax = Math.max(ebit * 0.3, 0);
  const netProfit = ebit - tax;
  const totalExpenses = cogs + opex + marketing;

  const previousNetRevenue = total(previous, 'revenue') / 1.19 - total(previous, 'refunds');
  const previousCogs = total(previous, 'cogs');
  const previousExpenses = previousCogs + total(previous, 'opex') + total(previous, 'marketing');
  const previousProfit =
    previousNetRevenue -
    previousCogs -
    total(previous, 'opex') -
    total(previous, 'marketing');
  const previousGrossProfit = previousNetRevenue - previousCogs;

  const delta = (current: number, before: number) =>
    before ? ((current - before) / Math.abs(before)) * 100 : 0;

  const expenseData = useMemo(
    () => [
      { label: t('accounting.expenses.cogs'), value: cogs, color: '#5865F2' },
      { label: t('accounting.expenses.personnel'), value: opex * 0.62, color: '#9B72F2' },
      { label: t('accounting.expenses.marketing'), value: marketing, color: '#4FA3A5' },
      { label: t('accounting.expenses.tools'), value: opex * 0.23, color: '#C28A3D' },
      { label: t('accounting.expenses.logistics'), value: opex * 0.15, color: '#D9587A' },
      { label: t('accounting.expenses.refunds'), value: refunds, color: '#8C96A8' },
    ],
    [cogs, opex, marketing, refunds, t],
  );

  const chartPoints = useMemo(
    () =>
      months.map((month) => ({
        date: `${month.month}-01`,
        revenue: month.revenue,
        profit: month.revenue / 1.19 - month.cogs - month.opex - month.marketing,
      })),
    [months],
  );

  const sparkRevenue = months.map((month) => Math.round(month.revenue / 1000));
  const sparkProfit = months.map((month) =>
    Math.round((month.revenue / 1.19 - month.cogs - month.opex - month.marketing) / 1000),
  );
  const sparkExpenses = months.map((month) =>
    Math.round((month.cogs + month.opex + month.marketing) / 1000),
  );

  const pnlRows = [
    { key: 'revenue', label: t('accounting.pnl.revenue'), value: grossRevenue, strong: false, negative: false },
    { key: 'refunds', label: t('accounting.pnl.refunds'), value: -refunds, strong: false, negative: true },
    { key: 'netRevenue', label: t('accounting.pnl.netRevenue'), value: netRevenue, strong: true, negative: false },
    { key: 'cogs', label: t('accounting.pnl.cogs'), value: -cogs, strong: false, negative: true },
    { key: 'grossProfit', label: t('accounting.pnl.grossProfit'), value: grossProfit, strong: true, negative: false },
    { key: 'opex', label: t('accounting.pnl.opex'), value: -opex, strong: false, negative: true },
    { key: 'marketing', label: t('accounting.pnl.marketing'), value: -marketing, strong: false, negative: true },
    { key: 'ebit', label: t('accounting.pnl.ebit'), value: ebit, strong: true, negative: false },
    { key: 'tax', label: t('accounting.pnl.tax'), value: -tax, strong: false, negative: true },
    { key: 'netProfit', label: t('accounting.pnl.netProfit'), value: netProfit, strong: true, negative: false },
  ];

  const invoiceSearch = query.trim().toLowerCase();
  const invoices = useMemo(
    () =>
      seedInvoices
        .filter((invoice) => invoiceFilter === 'all' || invoice.status === invoiceFilter)
        .filter((invoice) =>
          invoiceSearch
            ? [invoice.id, invoice.customer, invoice.email]
                .join(' ')
                .toLowerCase()
                .includes(invoiceSearch)
            : true,
        )
        .sort((a, b) => +new Date(b.issued) - +new Date(a.issued)),
    [invoiceFilter, invoiceSearch],
  );

  const openInvoices = seedInvoices.filter(
    (invoice) => invoice.status === 'open' || invoice.status === 'overdue',
  );
  const receivables = openInvoices.reduce((sumValue, invoice) => sumValue + invoice.amount, 0);
  const overdue = seedInvoices
    .filter((invoice) => invoice.status === 'overdue')
    .reduce((sumValue, invoice) => sumValue + invoice.amount, 0);

  const aging = useMemo(() => {
    const now = Date.now();
    const buckets = [
      { label: t('accounting.aging.current'), value: 0, color: '#4FA3A5' },
      { label: t('accounting.aging.d14'), value: 0, color: '#5865F2' },
      { label: t('accounting.aging.d30'), value: 0, color: '#9B72F2' },
      { label: t('accounting.aging.d60'), value: 0, color: '#C28A3D' },
      { label: t('accounting.aging.d90'), value: 0, color: '#D9587A' },
    ];
    openInvoices.forEach((invoice) => {
      const days = Math.floor((now - new Date(invoice.due).getTime()) / 86_400_000);
      const index = days <= 0 ? 0 : days <= 14 ? 1 : days <= 30 ? 2 : days <= 60 ? 3 : 4;
      buckets[index].value += invoice.amount;
    });
    return buckets;
  }, [openInvoices, t]);

  const exportInvoices = () => {
    const header = ['Invoice', 'Customer', 'Email', 'Issued', 'Due', 'Amount', 'VAT', 'Status'];
    const rows = invoices.map((invoice) => [
      invoice.id,
      invoice.customer,
      invoice.email,
      invoice.issued.slice(0, 10),
      invoice.due.slice(0, 10),
      invoice.amount.toFixed(2),
      invoice.vat.toFixed(2),
      invoice.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'klarwerk-accounting.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const openOrderRevenue = orders
    .filter((order) => order.status !== 'refunded' && order.status !== 'pending')
    .reduce((sumValue, order) => sumValue + order.total, 0);

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('accounting.eyebrow')}
        title={t('accounting.title')}
        subtitle={t('accounting.subtitle')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={String(range)}
              onChange={(value) => setRange(Number(value) as Range)}
              ariaLabel={t('accounting.rangeLabel')}
              options={[
                { value: '3', label: t('accounting.range.m3') },
                { value: '6', label: t('accounting.range.m6') },
                { value: '12', label: t('accounting.range.m12') },
              ]}
            />
            <button type="button" onClick={exportInvoices} className={adminButtonGhost}>
              <ArrowDownToLine size={13} /> {t('accounting.export')}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label={t('accounting.kpi.netRevenue')}
          value={formatPrice(netRevenue, locale)}
          delta={delta(netRevenue, previousNetRevenue)}
          hint={t('accounting.kpi.netRevenueHint')}
          icon={<Banknote size={15} />}
          accent="electric"
          spark={<Sparkline values={sparkRevenue} />}
        />
        <StatCard
          label={t('accounting.kpi.grossProfit')}
          value={formatPrice(grossProfit, locale)}
          delta={delta(grossProfit, previousGrossProfit)}
          hint={t('accounting.kpi.grossProfitHint')}
          icon={<TrendingUp size={15} />}
          accent="teal"
          spark={<Sparkline values={sparkProfit} color="#4FA3A5" />}
        />
        <StatCard
          label={t('accounting.kpi.expenses')}
          value={formatPrice(totalExpenses, locale)}
          delta={delta(totalExpenses, previousExpenses)}
          hint={t('accounting.kpi.expensesHint')}
          icon={<Wallet size={15} />}
          accent="amber"
          spark={<Sparkline values={sparkExpenses} color="#C28A3D" />}
        />
        <StatCard
          label={t('accounting.kpi.netProfit')}
          value={formatPrice(netProfit, locale)}
          delta={delta(netProfit, previousProfit)}
          hint={t('accounting.kpi.netProfitHint')}
          icon={<CircleDollarSign size={15} />}
          accent="violet"
          spark={<Sparkline values={sparkProfit.map((value) => value * 0.7)} color="#9B72F2" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title={t('accounting.cashflow.title')}
          subtitle={t('accounting.cashflow.subtitle')}
          action={
            <div className="flex items-center gap-3 text-[9.5px] text-ink-900/45">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-electric-500" />
                {t('accounting.cashflow.revenue')}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4FA3A5]" />
                {t('accounting.cashflow.profit')}
              </span>
            </div>
          }
        >
          <RevenueAreaChart points={chartPoints} locale={locale} height={252} />
        </Panel>

        <div className="space-y-4">
          <Panel title={t('accounting.vat.title')} subtitle={t('accounting.vat.subtitle')}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-900/35">
                  {t('accounting.vat.payable')}
                </p>
                <p className="mt-1 font-display text-[26px] font-semibold leading-none tracking-[-0.03em] tabular-nums">
                  {formatPrice(vatPayable, locale)}
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-electric-500/10 text-electric-600">
                <Landmark size={16} />
              </span>
            </div>
            <div className="mt-4 space-y-1.5 border-t border-ink-900/6 pt-3 text-[10.5px]">
              <div className="flex items-center justify-between">
                <span className="text-ink-900/45">{t('accounting.vat.output')}</span>
                <span className="font-semibold tabular-nums">{formatPrice(vatOutput, locale)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-900/45">{t('accounting.vat.input')}</span>
                <span className="font-semibold tabular-nums text-ink-900/55">
                  −{formatPrice(vatInput, locale)}
                </span>
              </div>
            </div>
            <p className="mt-3 rounded-lg bg-ink-900/[0.03] px-2.5 py-2 text-[9.5px] leading-relaxed text-ink-900/40">
              {t('accounting.vat.note')}
            </p>
          </Panel>

          <Panel title={t('accounting.payouts.title')} subtitle={t('accounting.payouts.subtitle')}>
            <ul className="divide-y divide-ink-900/6">
              {seedPayouts.map((payout) => (
                <li key={payout.id} className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-900/[0.04] text-ink-900/45">
                    <CalendarClock size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-semibold text-ink-900/75">
                      {payout.provider}
                    </p>
                    <p className="text-[9px] text-ink-900/35">
                      {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                        day: '2-digit',
                        month: 'short',
                      }).format(new Date(payout.date))}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10.5px] font-semibold tabular-nums">
                    {formatPrice(payout.amount, locale)}
                  </span>
                  <span
                    className={cn(
                      'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold',
                      payout.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-700'
                        : 'bg-emerald-500/10 text-emerald-700',
                    )}
                  >
                    {t(`accounting.payouts.${payout.status}`)}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <Panel title={t('accounting.pnl.title')} subtitle={t('accounting.pnl.subtitle')}>
          <div className="space-y-0.5">
            {pnlRows.map((row) => {
              const share = Math.min((Math.abs(row.value) / Math.max(grossRevenue, 1)) * 100, 100);
              return (
                <div
                  key={row.key}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 sm:gap-3',
                    row.strong && 'bg-ink-900/[0.03]',
                  )}
                >
                  <span
                    className={cn(
                      'w-[104px] shrink-0 text-[10px] sm:w-40 sm:text-[10.5px]',
                      row.strong ? 'font-semibold text-ink-900' : 'text-ink-900/50',
                    )}
                  >
                    {row.label}
                  </span>
                  <div className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-ink-900/5 sm:block">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        row.value < 0 ? 'bg-rose-400/70' : row.strong ? 'bg-electric-500' : 'bg-electric-500/50',
                      )}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'ml-auto shrink-0 text-right text-[10.5px] tabular-nums sm:w-24 sm:text-[11px]',
                      row.strong ? 'font-semibold text-ink-900' : 'text-ink-900/55',
                      row.negative && 'text-rose-500/80',
                    )}
                  >
                    {row.value < 0 ? '−' : ''}
                    {formatPrice(Math.abs(row.value), locale)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink-900 px-3.5 py-3 text-white">
            <span className="text-[10px] uppercase tracking-[0.12em] text-white/45">
              {t('accounting.pnl.margin')}
            </span>
            <span className="text-[15px] font-semibold tabular-nums">
              {((netProfit / Math.max(netRevenue, 1)) * 100).toFixed(1)}%
            </span>
          </div>
        </Panel>

        <Panel title={t('accounting.expenses.title')} subtitle={t('accounting.expenses.subtitle')}>
          <DonutChart
            data={expenseData}
            centerLabel={t('accounting.expenses.center')}
            centerValue={`${Math.round(totalExpenses / 1000)}k`}
            size={154}
          />
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel padded={false}>
          <div className="flex flex-col gap-2 border-b border-ink-900/6 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                {t('accounting.invoices.title')}
              </h2>
              <p className="mt-0.5 text-[11px] text-ink-900/45">
                {t('accounting.invoices.subtitle')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-ink-900/40">
                {t('accounting.invoices.count', { count: invoices.length })}
              </span>
              <Select
                value={invoiceFilter}
                onChange={(value) => setInvoiceFilter(value as 'all' | InvoiceStatus)}
                ariaLabel={t('common.status')}
                options={[
                  { value: 'all', label: t('accounting.invoices.all') },
                  { value: 'paid', label: t('accounting.invoices.status.paid') },
                  { value: 'open', label: t('accounting.invoices.status.open') },
                  { value: 'overdue', label: t('accounting.invoices.status.overdue') },
                  { value: 'draft', label: t('accounting.invoices.status.draft') },
                ]}
              />
            </div>
          </div>

          <div className="divide-y divide-ink-900/[0.045] md:hidden">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-start justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold tabular-nums text-ink-900">
                    {invoice.id}
                    <InvoiceBadge status={invoice.status} />
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] text-ink-900/55">{invoice.customer}</p>
                  <p className="mt-0.5 text-[9px] text-ink-900/35">
                    {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                      day: '2-digit',
                      month: 'short',
                    }).format(new Date(invoice.due))}
                  </p>
                </div>
                <span className="shrink-0 text-right text-[12px] font-semibold tabular-nums">
                  {formatPrice(invoice.amount, locale)}
                </span>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="px-4 py-10 text-center text-[12px] text-ink-900/40">
                {t('accounting.invoices.empty')}
              </p>
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-0 text-left">
              <thead>
                <tr className="border-b border-ink-900/6 text-[8.5px] uppercase tracking-[0.12em] text-ink-900/35">
                  <th className="px-4 py-2.5 font-medium">{t('accounting.invoices.table.invoice')}</th>
                  <th className="px-3 py-2.5 font-medium">{t('accounting.invoices.table.customer')}</th>
                  <th className="hidden px-3 py-2.5 font-medium lg:table-cell">
                    {t('accounting.invoices.table.issued')}
                  </th>
                  <th className="px-3 py-2.5 font-medium">{t('accounting.invoices.table.due')}</th>
                  <th className="px-3 py-2.5 text-right font-medium">
                    {t('accounting.invoices.table.amount')}
                  </th>
                  <th className="px-3 py-2.5 font-medium">{t('accounting.invoices.table.status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/[0.045]">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="text-[11px] transition hover:bg-ink-900/[0.02]">
                    <td className="px-4 py-2.5 font-medium tabular-nums text-ink-900">{invoice.id}</td>
                    <td className="px-3 py-2.5">
                      <p className="max-w-[160px] truncate font-medium text-ink-900/80">
                        {invoice.customer}
                      </p>
                    </td>
                    <td className="hidden px-3 py-2.5 text-ink-900/45 lg:table-cell">
                      {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                        day: '2-digit',
                        month: 'short',
                      }).format(new Date(invoice.issued))}
                    </td>
                    <td className="px-3 py-2.5 text-ink-900/45">
                      {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                        day: '2-digit',
                        month: 'short',
                      }).format(new Date(invoice.due))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                      {formatPrice(invoice.amount, locale)}
                    </td>
                    <td className="px-3 py-2.5">
                      <InvoiceBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title={t('accounting.aging.title')} subtitle={t('accounting.aging.subtitle')}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-900/35">
                  {t('accounting.aging.receivables')}
                </p>
                <p className="mt-1 font-display text-[22px] font-semibold leading-none tracking-[-0.02em] tabular-nums">
                  {formatPrice(receivables, locale)}
                </p>
              </div>
              <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-semibold text-rose-600">
                {formatPrice(overdue, locale)} {t('accounting.aging.overdue')}
              </span>
            </div>
            <div className="mt-4">
              <BarList data={aging} locale={locale} showShare={false} />
            </div>
          </Panel>

          <Panel title={t('accounting.summary.title')} subtitle={t('accounting.summary.subtitle')}>
            <ul className="space-y-2 text-[10.5px]">
              {[
                { label: t('accounting.summary.orders'), value: String(orders.length) },
                { label: t('accounting.summary.orderRevenue'), value: formatPrice(openOrderRevenue, locale) },
                { label: t('accounting.summary.dso'), value: `${Math.round(19 + (overdue / Math.max(receivables, 1)) * 21)} ${t('accounting.summary.days')}` },
                { label: t('accounting.summary.runway'), value: `${(18 + (netProfit / Math.max(totalExpenses, 1)) * 6).toFixed(1)} ${t('accounting.summary.months')}` },
              ].map((row) => (
                <li key={row.label} className="flex items-center justify-between gap-3 border-b border-ink-900/5 pb-1.5 last:border-0 last:pb-0">
                  <span className="text-ink-900/45">{row.label}</span>
                  <span className="font-semibold tabular-nums text-ink-900/75">{row.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-center gap-1.5 text-[9px] text-ink-900/35">
              <ReceiptText size={10} /> {t('accounting.summary.note')}
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export default AccountingTab;