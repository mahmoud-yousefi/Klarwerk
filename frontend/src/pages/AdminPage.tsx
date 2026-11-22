import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Boxes,
  Calculator,
  ChevronDown,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
  Workflow,
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useAdminStore } from '@/stores/admin.store';
import { Logo } from '@/components/ui/Logo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { CategoriesTab } from '@/components/admin/CategoriesTab';
import { CustomersTab } from '@/components/admin/CustomersTab';
import { InboxTab } from '@/components/admin/InboxTab';
import { AnalyticsTab } from '@/components/admin/AnalyticsTab';
import { AccountingTab } from '@/components/admin/AccountingTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { OperationsTab } from '@/components/admin/OperationsTab';
import { InventoryTab } from '@/components/admin/InventoryTab';
import { buildStockRows, stockSummary } from '@/lib/operations';

type Tab =
  | 'overview'
  | 'operations'
  | 'inventory'
  | 'orders'
  | 'products'
  | 'categories'
  | 'customers'
  | 'inbox'
  | 'analytics'
  | 'accounting'
  | 'settings';

type NavGroup = 'control' | 'operations' | 'commerce' | 'service' | 'analytics' | 'system';

const navGroups: Array<{
  id: NavGroup;
  items: Array<{ id: Tab; icon: typeof LayoutDashboard }>;
}> = [
  { id: 'control', items: [{ id: 'overview', icon: LayoutDashboard }] },
  {
    id: 'operations',
    items: [
      { id: 'operations', icon: Workflow },
      { id: 'inventory', icon: Boxes },
    ],
  },
  {
    id: 'commerce',
    items: [
      { id: 'orders', icon: ShoppingCart },
      { id: 'products', icon: Package },
      { id: 'categories', icon: FolderTree },
      { id: 'customers', icon: Users },
    ],
  },
  { id: 'service', items: [{ id: 'inbox', icon: Mail }] },
  {
    id: 'analytics',
    items: [
      { id: 'analytics', icon: BarChart3 },
      { id: 'accounting', icon: Calculator },
    ],
  },
  { id: 'system', items: [{ id: 'settings', icon: Settings }] },
];

const navItems = navGroups.flatMap((group) => group.items);

export function AdminPage() {
  const { t } = useTranslation('admin');
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('overview');
  const [query, setQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const orders = useAdminStore((state) => state.orders);
  const messages = useAdminStore((state) => state.messages);
  const requests = useAdminStore((state) => state.requests);
  const customProducts = useAdminStore((state) => state.customProducts);
  const fulfillmentJobs = useAdminStore((state) => state.fulfillmentJobs);
  const purchaseOrders = useAdminStore((state) => state.purchaseOrders);
  const stockOverrides = useAdminStore((state) => state.stockOverrides);

  const stock = useMemo(() => {
    const rows = buildStockRows(stockOverrides, purchaseOrders);
    return stockSummary(rows);
  }, [stockOverrides, purchaseOrders]);

  const counts = useMemo(
    () => ({
      orders: orders.filter((order) => order.status === 'paid' || order.status === 'processing').length,
      inbox: messages.filter((message) => message.status !== 'resolved').length,
      products: customProducts.length,
      requests: requests.filter((request) => request.status === 'pending').length,
      operations: fulfillmentJobs.filter((job) => job.stage !== 'delivered').length,
      inventory: stock.reorder,
    }),
    [orders, messages, requests, customProducts, fulfillmentJobs, stock.reorder],
  );

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login?redirect=%2Fadmin" replace />;
  }

  const badgeFor = (id: Tab) => {
    if (id === 'orders') return counts.orders;
    if (id === 'inbox') return counts.inbox;
    if (id === 'products') return counts.products;
    if (id === 'operations') return counts.operations;
    if (id === 'inventory') return counts.inventory;
    return 0;
  };

  const navLabel = (id: Tab) => t(`nav.${id}`);
  const activeGroup = navGroups.find((group) => group.items.some((item) => item.id === tab));
  const ActiveIcon = navItems.find((item) => item.id === tab)?.icon ?? LayoutDashboard;
  const selectTab = (next: Tab) => {
    setTab(next);
    setQuery('');
    setMobileNavOpen(false);
  };

  const renderTab = () => {
    switch (tab) {
      case 'operations':
        return <OperationsTab onNavigate={(next) => setTab(next as Tab)} />;
      case 'inventory':
        return <InventoryTab />;
      case 'orders':
        return <OrdersTab query={query} />;
      case 'products':
        return <ProductsTab query={query} />;
      case 'categories':
        return <CategoriesTab query={query} />;
      case 'customers':
        return <CustomersTab query={query} />;
      case 'inbox':
        return <InboxTab query={query} />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'accounting':
        return <AccountingTab query={query} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab onNavigate={(next) => setTab(next as Tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5FA]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[238px] flex-col overflow-hidden bg-ink-900 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-0 h-64 w-64 rounded-full bg-electric-500/25 blur-[70px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-24 h-56 w-56 rounded-full bg-violet-500/25 blur-[70px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '38px 38px',
            maskImage: 'radial-gradient(ellipse at 40% 20%, black, transparent 70%)',
          }}
        />

        <div className="relative px-5 pt-5">
          <Logo variant="light" />
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 backdrop-blur">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-electric-500 to-violet-500 text-white">
              <Sparkles size={11} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10.5px] font-semibold text-white">Klarwerk Control</p>
              <p className="text-[8.5px] uppercase tracking-[0.14em] text-white/35">
                {t('shell.workspace')}
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-300">
              <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" /> live
            </span>
          </div>
        </div>

        <nav className="relative mt-5 flex-1 space-y-0.5 overflow-y-auto px-3 pb-2">
          {navGroups.map((group) => (
            <div key={group.id} className="pb-1.5">
              <p className="px-2 pb-1 pt-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-white/22">
                {t(`navGroups.${group.id}`)}
              </p>
              {group.items.map(({ id, icon: Icon }) => {
                const badge = badgeFor(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTab(id);
                      setQuery('');
                    }}
                    className={cn(
                      'group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[12px] transition',
                      tab === id
                        ? 'bg-white/10 font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                        : 'text-white/50 hover:bg-white/[0.05] hover:text-white/85',
                    )}
                  >
                    {tab === id && (
                      <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-electric-400" />
                    )}
                    <Icon
                      size={15}
                      className={tab === id ? 'text-electric-300' : 'text-white/35'}
                    />
                    <span className="flex-1 truncate">{navLabel(id)}</span>
                    {badge > 0 && (
                      <span
                        className={cn(
                          'rounded-full px-1.5 py-0.5 text-[8.5px] font-bold tabular-nums',
                          tab === id ? 'bg-electric-500 text-white' : 'bg-white/10 text-white/60',
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="relative border-t border-white/8 p-3">
          <Link
            to="/"
            className="mb-2 flex items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] text-white/45 transition hover:bg-white/[0.05] hover:text-white"
          >
            <Store size={13} /> {t('shell.backToShop')}
          </Link>
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.05] p-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: user.color }}
            >
              {getInitials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-white">{user.name}</p>
              <p className="truncate text-[8.5px] text-white/35">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="rounded-lg p-1.5 text-white/35 transition hover:bg-rose-500/15 hover:text-rose-300"
              aria-label={t('settings.account.signOut')}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[238px]">
        <header className="sticky top-0 z-30 border-b border-ink-900/[0.06] bg-white/85 backdrop-blur-xl">
          <div className="flex h-[58px] items-center gap-3 px-4 sm:px-6">
            <Link to="/" className="flex shrink-0 items-center gap-1.5 text-[11px] text-ink-900/45 transition hover:text-ink-900 lg:hidden">
              <ArrowLeft size={13} /> {t('shell.shop')}
            </Link>
            <div className="hidden items-center gap-1.5 text-[10.5px] text-ink-900/35 lg:flex">
              <span>Klarwerk Control</span>
              <span className="text-ink-900/20">/</span>
              <span className="font-medium text-ink-900/60">{navLabel(tab)}</span>
            </div>

            <div className="ml-auto flex flex-1 items-center justify-end gap-1.5 sm:gap-2">
              <div className="relative hidden w-full max-w-[240px] sm:block">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-900/30" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('shell.search')}
                  className="h-8 w-full rounded-full border border-ink-900/10 bg-ink-900/[0.025] pl-8 pr-3 text-[11px] outline-none transition placeholder:text-ink-900/30 focus:border-electric-500 focus:bg-white focus:ring-2 focus:ring-electric-500/10"
                />
              </div>
              <LanguageSwitcher variant="light" showIcon={false} />
              <button
                type="button"
                onClick={() => setTab('inbox')}
                className="relative flex h-8 w-8 items-center justify-center rounded-full text-ink-900/45 transition hover:bg-ink-900/5 hover:text-ink-900"
                aria-label={t('shell.notifications')}
              >
                <Bell size={15} />
                {counts.inbox + counts.requests > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-electric-500 px-1 text-[8px] font-bold text-white">
                    {counts.inbox + counts.requests}
                  </span>
                )}
              </button>
              <span className="hidden h-5 w-px bg-ink-900/10 sm:block" />
              <span className="hidden items-center gap-1.5 rounded-full bg-violet-500/10 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-violet-600 sm:flex">
                <Sparkles size={10} /> {t('shell.preview')}
              </span>
            </div>
          </div>

          <div className="relative border-t border-ink-900/[0.05] px-3 py-1.5 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen((open) => !open)}
              aria-expanded={mobileNavOpen}
              aria-haspopup="menu"
              className="flex h-9 w-full items-center justify-between gap-2 rounded-full border border-ink-900/10 bg-white px-3 text-left transition hover:border-ink-900/20"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white">
                  <ActiveIcon size={12} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[7.5px] font-semibold uppercase tracking-[0.16em] text-ink-900/30">
                    {t('shell.menu')}
                  </span>
                  <span className="block truncate text-[11px] font-semibold text-ink-900">
                    {navLabel(tab)}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-ink-900/35">
                {activeGroup ? t(`navGroups.${activeGroup.id}`) : ''}
                <ChevronDown
                  size={14}
                  className={cn('transition-transform duration-200', mobileNavOpen && 'rotate-180')}
                />
              </span>
            </button>

            {mobileNavOpen && (
              <>
                <button
                  type="button"
                  aria-label={t('common.close')}
                  onClick={() => setMobileNavOpen(false)}
                  className="fixed inset-0 z-30 cursor-default bg-ink-900/[0.08] backdrop-blur-[1px]"
                />
                <div
                  role="menu"
                  className="absolute inset-x-3 top-[calc(100%+2px)] z-40 max-h-[68vh] overflow-y-auto rounded-2xl border border-ink-900/10 bg-white p-2.5 shadow-[0_28px_70px_-24px_rgba(8,13,24,0.4)]"
                >
                  {navGroups.map((group) => (
                    <div key={group.id} className="pb-1.5 last:pb-0">
                      <p className="px-1 pb-1 pt-1.5 text-[7.5px] font-semibold uppercase tracking-[0.18em] text-ink-900/30">
                        {t(`navGroups.${group.id}`)}
                      </p>
                      <div className="grid grid-cols-2 gap-1 min-[380px]:grid-cols-3">
                        {group.items.map(({ id, icon: Icon }) => {
                          const badge = badgeFor(id);
                          return (
                            <button
                              key={id}
                              type="button"
                              role="menuitem"
                              onClick={() => selectTab(id)}
                              className={cn(
                                'flex min-w-0 items-center gap-1.5 rounded-xl px-2 py-2 text-left text-[10.5px] font-medium transition',
                                tab === id
                                  ? 'bg-ink-900 text-white'
                                  : 'text-ink-900/55 hover:bg-ink-900/5 hover:text-ink-900',
                              )}
                            >
                              <Icon size={12} className="shrink-0" />
                              <span className="min-w-0 flex-1 truncate">{navLabel(id)}</span>
                              {badge > 0 && (
                                <span
                                  className={cn(
                                    'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold tabular-nums',
                                    tab === id
                                      ? 'bg-white/15 text-white'
                                      : 'bg-ink-900/[0.06] text-ink-900/45',
                                  )}
                                >
                                  {badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] overflow-x-hidden p-4 sm:p-6">
          <div key={tab} className="admin-enter">
            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminPage;
