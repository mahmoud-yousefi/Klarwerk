import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BellRing,
  Check,
  Database,
  LogOut,
  Mail,
  RefreshCcw,
  Save,
  ShieldCheck,
  Store,
  Truck,
  Trash2,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToastStore } from '@/stores/toast.store';
import { Modal } from '@/components/ui/Modal';
import {
  FieldLabel,
  Panel,
  Select,
  TabHeader,
  adminButtonGhost,
  adminButtonPrimary,
  adminInput,
} from '@/components/admin/AdminUi';

export function SettingsTab() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const settings = useAdminStore((state) => state.settings);
  const updateSettings = useAdminStore((state) => state.updateSettings);
  const resetWorkspace = useAdminStore((state) => state.resetWorkspace);
  const resetContent = useAdminStore((state) => state.resetContent);
  const customProducts = useAdminStore((state) => state.customProducts);
  const customCategories = useAdminStore((state) => state.customCategories);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pushToast = useToastStore((state) => state.push);
  const [form, setForm] = useState(settings);
  const [confirm, setConfirm] = useState<'workspace' | 'content' | null>(null);
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateSettings({
      ...form,
      lowStockThreshold: Math.max(1, Number(form.lowStockThreshold) || 1),
      monthlyGoal: Math.max(1000, Number(form.monthlyGoal) || 1000),
      satisfactionTarget: Math.min(5, Math.max(1, Number(form.satisfactionTarget) || 4.7)),
    });
    setSaved(true);
    pushToast(t('settings.saved'), 'success');
    window.setTimeout(() => setSaved(false), 2200);
  };

  const toggles = [
    { key: 'autoReply' as const, label: t('settings.toggles.autoReply'), text: t('settings.toggles.autoReplyText'), icon: Mail },
    { key: 'expressEnabled' as const, label: t('settings.toggles.express'), text: t('settings.toggles.expressText'), icon: Truck },
    { key: 'newsletter' as const, label: t('settings.toggles.newsletter'), text: t('settings.toggles.newsletterText'), icon: BellRing },
  ];

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('settings.eyebrow')}
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={
          <button type="button" onClick={save} className={adminButtonPrimary}>
            {saved ? <Check size={13} /> : <Save size={13} />}
            {saved ? t('settings.savedShort') : t('settings.save')}
          </button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          <Panel title={t('settings.store.title')} subtitle={t('settings.store.subtitle')}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FieldLabel>{t('settings.store.name')}</FieldLabel>
                <div className="relative">
                  <Store size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/30" />
                  <input
                    value={form.storeName}
                    onChange={(event) => setForm((state) => ({ ...state, storeName: event.target.value }))}
                    className={`${adminInput} pl-8`}
                  />
                </div>
              </div>
              <div>
                <FieldLabel>{t('settings.store.email')}</FieldLabel>
                <input
                  value={form.supportEmail}
                  onChange={(event) => setForm((state) => ({ ...state, supportEmail: event.target.value }))}
                  className={adminInput}
                />
              </div>
              <div>
                <FieldLabel>{t('settings.store.phone')}</FieldLabel>
                <input
                  value={form.supportPhone}
                  onChange={(event) => setForm((state) => ({ ...state, supportPhone: event.target.value }))}
                  className={adminInput}
                />
              </div>
              <div>
                <FieldLabel>{t('settings.store.lowStock')}</FieldLabel>
                <input
                  type="number"
                  min={1}
                  value={form.lowStockThreshold}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, lowStockThreshold: Number(event.target.value) }))
                  }
                  className={adminInput}
                />
              </div>
              <div>
                <FieldLabel>{t('settings.store.goal')}</FieldLabel>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={form.monthlyGoal}
                  onChange={(event) =>
                    setForm((state) => ({ ...state, monthlyGoal: Number(event.target.value) }))
                  }
                  className={adminInput}
                />
              </div>
              <div>
                <FieldLabel>{t('settings.store.target')}</FieldLabel>
                <Select
                  value={String(form.satisfactionTarget)}
                  onChange={(value) =>
                    setForm((state) => ({ ...state, satisfactionTarget: Number(value) }))
                  }
                  className="h-10 w-full"
                  options={['4.4', '4.5', '4.6', '4.7', '4.8'].map((value) => ({
                    value,
                    label: `${value} / 5`,
                  }))}
                />
              </div>
              <div>
                <FieldLabel>{t('settings.store.currency')}</FieldLabel>
                <div className={`${adminInput} flex items-center text-ink-900/45`}>EUR · €</div>
              </div>
            </div>
          </Panel>

          <Panel title={t('settings.toggles.title')} subtitle={t('settings.toggles.subtitle')}>
            <ul className="space-y-2">
              {toggles.map(({ key, label, text, icon: Icon }) => (
                <li
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-900/6 px-3.5 py-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-900/[0.04] text-ink-900/50">
                      <Icon size={14} />
                    </span>
                    <div>
                      <p className="text-[11.5px] font-semibold text-ink-900">{label}</p>
                      <p className="text-[10px] leading-relaxed text-ink-900/45">{text}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form[key]}
                    onClick={() => setForm((state) => ({ ...state, [key]: !state[key] }))}
                    className={
                      form[key]
                        ? 'relative h-5 w-9 shrink-0 rounded-full bg-emerald-500 transition'
                        : 'relative h-5 w-9 shrink-0 rounded-full bg-ink-900/15 transition'
                    }
                  >
                    <span
                      className={
                        form[key]
                          ? 'absolute left-[19px] top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all'
                          : 'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all'
                      }
                    />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} className={adminButtonPrimary}>
              <Save size={13} /> {t('settings.save')}
            </button>
            <button
              type="button"
              onClick={() => setForm(settings)}
              className={adminButtonGhost}
            >
              <RefreshCcw size={13} /> {t('settings.discard')}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <Panel title={t('settings.account.title')} subtitle={t('settings.account.subtitle')}>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-[13px] font-bold text-white">
                {user?.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() ?? 'AD'}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink-900">{user?.name}</p>
                <p className="truncate text-[10.5px] text-ink-900/45">{user?.email}</p>
              </div>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-1 text-[8.5px] font-semibold uppercase tracking-[0.08em] text-violet-600">
                <ShieldCheck size={10} /> Admin
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className={`${adminButtonGhost} w-full`}
              >
                <Store size={13} /> {t('shell.backToShop')}
              </button>
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 text-[11.5px] font-medium text-rose-600 transition hover:bg-rose-100"
              >
                <LogOut size={13} /> {t('settings.account.signOut')}
              </button>
            </div>
          </Panel>

          <Panel title={t('settings.data.title')} subtitle={t('settings.data.subtitle')}>
            <div className="space-y-2 text-[10.5px]">
              <div className="flex items-center justify-between rounded-lg bg-ink-900/[0.03] px-3 py-2">
                <span className="flex items-center gap-1.5 text-ink-900/55">
                  <Database size={11} /> {t('settings.data.products')}
                </span>
                <span className="font-semibold tabular-nums">{customProducts.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-ink-900/[0.03] px-3 py-2">
                <span className="flex items-center gap-1.5 text-ink-900/55">
                  <Database size={11} /> {t('settings.data.categories')}
                </span>
                <span className="font-semibold tabular-nums">{customCategories.length}</span>
              </div>
              <p className="pt-1 text-[9.5px] leading-relaxed text-ink-900/38">
                {t('settings.data.note')}
              </p>
            </div>

            <div className="mt-4 space-y-2 border-t border-ink-900/8 pt-3">
              <button
                type="button"
                onClick={() => setConfirm('workspace')}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-ink-900/12 text-[11px] font-medium text-ink-900/60 transition hover:border-ink-900/25 hover:text-ink-900"
              >
                <RefreshCcw size={12} /> {t('settings.data.resetWorkspace')}
              </button>
              <button
                type="button"
                onClick={() => setConfirm('content')}
                className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-rose-200 text-[11px] font-medium text-rose-600 transition hover:bg-rose-50"
              >
                <Trash2 size={12} /> {t('settings.data.resetContent')}
              </button>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        title={t('settings.confirm.title')}
        className="max-w-sm"
      >
        <div className="p-6">
          <h3 className="font-display text-lg font-semibold">
            {confirm === 'content' ? t('settings.confirm.contentTitle') : t('settings.confirm.workspaceTitle')}
          </h3>
          <p className="mt-2 text-[11.5px] leading-relaxed text-ink-900/55">
            {confirm === 'content' ? t('settings.confirm.contentText') : t('settings.confirm.workspaceText')}
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirm(null)} className={adminButtonGhost}>
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm === 'content') {
                  resetContent();
                  pushToast(t('settings.confirm.contentDone'), 'info');
                } else {
                  resetWorkspace();
                  pushToast(t('settings.confirm.workspaceDone'), 'info');
                }
                setConfirm(null);
              }}
              className="inline-flex h-9 items-center justify-center rounded-full bg-rose-600 px-4 text-[11.5px] font-semibold text-white transition hover:bg-rose-700"
            >
              {t('settings.confirm.confirm')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
