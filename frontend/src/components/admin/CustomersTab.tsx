import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  Crown,
  Mail,
  MapPin,
  Search,
  UserRound,
  Users,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import type { AdminCustomer, CustomerSegment } from '@/types/admin';
import { formatPrice, getInitials } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import {
  Panel,
  SegmentBadge,
  Select,
  TabHeader,
  adminInput,
} from '@/components/admin/AdminUi';

const segments: CustomerSegment[] = ['new', 'returning', 'vip', 'at-risk'];
const avatarColors = ['#5865F2', '#9B72F2', '#4FA3A5', '#D9587A', '#C28A3D', '#3E8BD8'];

export function CustomersTab({ query }: { query: string }) {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const customers = useAdminStore((state) => state.customers);
  const [localQuery, setLocalQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [selected, setSelected] = useState<AdminCustomer | null>(null);

  const search = `${query} ${localQuery}`.trim().toLowerCase();
  const filtered = customers.filter((customer) => {
    if (segment !== 'all' && customer.segment !== segment) return false;
    if (!search) return true;
    return [customer.name, customer.email, customer.country]
      .join(' ')
      .toLowerCase()
      .includes(search);
  });

  const totalSpend = customers.reduce((sum, customer) => sum + customer.spend, 0);
  const vipCount = customers.filter((customer) => customer.segment === 'vip').length;
  const avgSpend = totalSpend / Math.max(customers.length, 1);
  const repeatRate =
    (customers.filter((customer) => customer.orders > 1).length / Math.max(customers.length, 1)) *
    100;

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('customers.eyebrow')}
        title={t('customers.title')}
        subtitle={t('customers.subtitle')}
      />

      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        {[
          { label: t('customers.stats.total'), value: customers.length.toString(), icon: Users, tone: 'text-electric-600' },
          { label: t('customers.stats.vip'), value: vipCount.toString(), icon: Crown, tone: 'text-violet-600' },
          { label: t('customers.stats.avg'), value: formatPrice(avgSpend, locale), icon: UserRound, tone: 'text-[#3B7F81]' },
          { label: t('customers.stats.repeat'), value: `${repeatRate.toFixed(0)}%`, icon: ArrowUpRight, tone: 'text-amber-600' },
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
              placeholder={t('customers.search')}
              className={`${adminInput} pl-8`}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-ink-900/40">
              {t('customers.count', { count: filtered.length })}
            </span>
            <Select
              value={segment}
              onChange={setSegment}
              ariaLabel={t('customers.segmentLabel')}
              options={[
                { value: 'all', label: t('common.all') },
                ...segments.map((entry) => ({ value: entry, label: t(`segments.${entry}`) })),
              ]}
            />
          </div>
        </div>

        <div className="divide-y divide-ink-900/[0.045] md:hidden">
          {filtered.map((customer, index) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => setSelected(customer)}
              className="flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-ink-900/[0.02]"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
              >
                {getInitials(customer.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-semibold text-ink-900">{customer.name}</p>
                <p className="truncate text-[9.5px] text-ink-900/35">{customer.email}</p>
                <p className="mt-0.5 text-[9px] text-ink-900/35">
                  {customer.orders} {t('customers.table.orders')} · {customer.country}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-[11.5px] font-semibold tabular-nums">
                  {formatPrice(customer.spend, locale)}
                </span>
                <SegmentBadge segment={customer.segment} />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-[12px] text-ink-900/40">{t('customers.empty')}</p>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-0 text-left">
            <thead>
              <tr className="border-b border-ink-900/6 text-[8.5px] uppercase tracking-[0.12em] text-ink-900/35">
                <th className="px-4 py-2.5 font-medium">{t('customers.table.customer')}</th>
                <th className="hidden px-3 py-2.5 font-medium lg:table-cell">{t('customers.table.location')}</th>
                <th className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">{t('customers.table.orders')}</th>
                <th className="px-3 py-2.5 text-right font-medium">{t('customers.table.spend')}</th>
                <th className="px-3 py-2.5 font-medium">{t('customers.table.segment')}</th>
                <th className="hidden px-3 py-2.5 font-medium xl:table-cell">{t('customers.table.lastOrder')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/[0.045]">
              {filtered.map((customer, index) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelected(customer)}
                  className="cursor-pointer text-[11.5px] transition hover:bg-ink-900/[0.02]"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
                      >
                        {getInitials(customer.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="max-w-[160px] truncate font-medium text-ink-900">{customer.name}</p>
                        <p className="max-w-[160px] truncate text-[9.5px] text-ink-900/35">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-3 py-2.5 text-ink-900/55 lg:table-cell">{customer.country}</td>
                  <td className="hidden px-3 py-2.5 text-right tabular-nums text-ink-900/65 sm:table-cell">
                    {customer.orders}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                    {formatPrice(customer.spend, locale)}
                  </td>
                  <td className="px-3 py-2.5">
                    <SegmentBadge segment={customer.segment} />
                  </td>
                  <td className="hidden px-3 py-2.5 text-[10.5px] text-ink-900/45 xl:table-cell">
                    {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                      day: '2-digit',
                      month: 'short',
                    }).format(new Date(customer.lastOrder))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p className="hidden px-4 py-10 text-center text-[12px] text-ink-900/40 md:block">{t('customers.empty')}</p>
        )}
      </Panel>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name}
        className="max-w-md"
      >
        {selected && (
          <div className="p-6">
            <div className="flex items-center gap-3 pr-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-electric-500/10 text-[14px] font-bold text-electric-600">
                {getInitials(selected.name)}
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">
                  {selected.name}
                </h3>
                <p className="text-[11px] text-ink-900/45">{selected.email}</p>
              </div>
              <span className="ml-auto">
                <SegmentBadge segment={selected.segment} />
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: t('customers.detail.spend'), value: formatPrice(selected.spend, locale) },
                { label: t('customers.detail.orders'), value: selected.orders.toString() },
                {
                  label: t('customers.detail.avg'),
                  value: formatPrice(selected.spend / Math.max(selected.orders, 1), locale),
                },
                {
                  label: t('customers.detail.since'),
                  value: new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date(selected.joined)),
                },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-ink-900/8 p-3">
                  <p className="text-[8.5px] uppercase tracking-[0.12em] text-ink-900/35">{label}</p>
                  <p className="mt-1 text-[13px] font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2 rounded-xl border border-ink-900/8 p-3 text-[11px] text-ink-900/60">
              <p className="flex items-center gap-2">
                <MapPin size={12} className="text-ink-900/35" /> {selected.country}
              </p>
              <p className="flex items-center gap-2">
                <UserRound size={12} className="text-ink-900/35" /> {selected.id}
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href={`mailto:${selected.email}`}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-ink-900 text-[11.5px] font-semibold text-white transition hover:bg-ink-800"
              >
                <Mail size={13} /> {t('customers.detail.email')}
              </a>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-ink-900/12 px-4 text-[11.5px] font-medium text-ink-900/60 transition hover:border-ink-900/25"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
