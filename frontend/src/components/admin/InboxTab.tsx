import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  ChevronLeft,
  CircleDot,
  Clock3,
  Inbox,
  Mail,
  MessageSquare,
  RotateCcw,
  Send,
  ShieldAlert,
  Ticket,
} from 'lucide-react';
import { useAdminStore } from '@/stores/admin.store';
import type { AdminRequest, RequestType } from '@/types/admin';
import { cn } from '@/lib/utils';
import {
  MessageBadge,
  Panel,
  Select,
  TabHeader,
  adminTextarea,
} from '@/components/admin/AdminUi';

const requestIcons: Record<RequestType, typeof RotateCcw> = {
  return: RotateCcw,
  warranty: ShieldAlert,
  address: Ticket,
  invoice: Mail,
  preorder: Clock3,
};

export function InboxTab({ query }: { query: string }) {
  const { t, i18n } = useTranslation('admin');
  const locale = i18n.language.startsWith('en') ? 'en' : 'de';
  const messages = useAdminStore((state) => state.messages);
  const requests = useAdminStore((state) => state.requests);
  const updateMessageStatus = useAdminStore((state) => state.updateMessageStatus);
  const replyToMessage = useAdminStore((state) => state.replyToMessage);
  const updateRequestStatus = useAdminStore((state) => state.updateRequestStatus);
  const [view, setView] = useState<'messages' | 'requests'>('messages');
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [reply, setReply] = useState('');

  const search = query.trim().toLowerCase();
  const filtered = messages.filter((message) => {
    if (filter !== 'all' && message.status !== filter) return false;
    if (!search) return true;
    return [message.name, message.email, message.subject, message.body]
      .join(' ')
      .toLowerCase()
      .includes(search);
  });

  const selected = useMemo(
    () => messages.find((message) => message.id === selectedId) ?? filtered[0] ?? null,
    [messages, selectedId, filtered],
  );

  const pendingRequests = requests.filter((request) => request.status === 'pending');
  const openCount = messages.filter((message) => message.status === 'open').length;

  const send = () => {
    if (!selected || !reply.trim()) return;
    replyToMessage(selected.id, reply.trim());
    setReply('');
  };

  return (
    <div className="space-y-4">
      <TabHeader
        eyebrow={t('inbox.eyebrow')}
        title={t('inbox.title')}
        subtitle={t('inbox.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-electric-500/10 px-3 py-1.5 text-[10px] font-semibold text-electric-600">
              <CircleDot size={11} /> {t('inbox.openCount', { count: openCount })}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-[10px] font-semibold text-amber-700">
              <Clock3 size={11} /> {t('inbox.requestCount', { count: pendingRequests.length })}
            </span>
          </div>
        }
      />

      <div className="flex items-center gap-1 rounded-full border border-ink-900/8 bg-white p-1">
        {[
          { id: 'messages', label: t('inbox.tabs.messages'), icon: MessageSquare, count: messages.length },
          { id: 'requests', label: t('inbox.tabs.requests'), icon: Ticket, count: requests.length },
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id as 'messages' | 'requests')}
            className={cn(
              'flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[11px] font-medium transition',
              view === id ? 'bg-ink-900 text-white' : 'text-ink-900/50 hover:text-ink-900',
            )}
          >
            <Icon size={13} /> {label}
            <span
              className={cn(
                'rounded-full px-1.5 text-[9px] font-semibold tabular-nums',
                view === id ? 'bg-white/15' : 'bg-ink-900/5',
              )}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {view === 'messages' ? (
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <Panel padded={false} className="overflow-hidden">
            <div className="flex items-center gap-2 border-b border-ink-900/6 p-3">
              <Select
                value={filter}
                onChange={setFilter}
                ariaLabel={t('common.status')}
                options={[
                  { value: 'all', label: t('common.all') },
                  { value: 'open', label: t('statuses.open') },
                  { value: 'pending', label: t('statuses.pending') },
                  { value: 'resolved', label: t('statuses.resolved') },
                ]}
              />
              <span className="text-[10px] text-ink-900/40">
                {t('inbox.count', { count: filtered.length })}
              </span>
            </div>
            <ul className="max-h-[560px] divide-y divide-ink-900/[0.045] overflow-y-auto">
              {filtered.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(message.id)}
                    className={cn(
                      'w-full px-3.5 py-3 text-left transition',
                      selected?.id === message.id ? 'bg-electric-500/[0.06]' : 'hover:bg-ink-900/[0.02]',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[11.5px] font-semibold text-ink-900">
                        {message.name}
                      </span>
                      <MessageBadge status={message.status} />
                    </div>
                    <p className="mt-0.5 truncate text-[10.5px] font-medium text-ink-900/60">
                      {message.subject}
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[9.5px] text-ink-900/38">{message.body}</p>
                    <p className="mt-1 text-[8.5px] uppercase tracking-[0.1em] text-ink-900/30">
                      {message.channel} ·{' '}
                      {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(message.date))}
                    </p>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="flex flex-col items-center gap-2 px-4 py-12 text-center">
                  <Inbox size={20} className="text-ink-900/20" />
                  <p className="text-[11px] text-ink-900/40">{t('inbox.empty')}</p>
                </li>
              )}
            </ul>
          </Panel>

          {selected ? (
            <Panel padded={false} className="overflow-hidden">
              <div className="border-b border-ink-900/6 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-electric-600">
                      {selected.channel} · {selected.id}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold tracking-[-0.02em]">
                      {selected.subject}
                    </h3>
                    <p className="mt-1 text-[11px] text-ink-900/45">
                      {selected.name} · {selected.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['open', 'pending', 'resolved'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateMessageStatus(selected.id, status)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[9.5px] font-medium transition',
                          selected.status === status
                            ? 'bg-ink-900 text-white'
                            : 'border border-ink-900/10 text-ink-900/50 hover:border-ink-900/25',
                        )}
                      >
                        {t(`statuses.${status}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto p-4">
                <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-ink-900/[0.035] p-3">
                  <p className="text-[11.5px] leading-relaxed text-ink-900/70">{selected.body}</p>
                  <p className="mt-1.5 text-[8.5px] uppercase tracking-[0.1em] text-ink-900/30">
                    {selected.name} ·{' '}
                    {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(selected.date))}
                  </p>
                </div>
                {selected.replies.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      'max-w-[85%] rounded-2xl p-3',
                      message.author === 'team'
                        ? 'ml-auto rounded-tr-md bg-electric-500/10'
                        : 'rounded-tl-md bg-ink-900/[0.035]',
                    )}
                  >
                    <p className="text-[11.5px] leading-relaxed text-ink-900/70">{message.text}</p>
                    <p className="mt-1.5 text-[8.5px] uppercase tracking-[0.1em] text-ink-900/30">
                      {message.author === 'team' ? 'Klarwerk Support' : selected.name}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-ink-900/6 p-3.5">
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={t('inbox.replyPlaceholder')}
                  className={adminTextarea}
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <a
                    href={`mailto:${selected.email}`}
                    className="flex items-center gap-1.5 text-[10px] text-ink-900/40 hover:text-ink-900/70"
                  >
                    <Mail size={11} /> {t('inbox.openMail')}
                  </a>
                  <button
                    type="button"
                    onClick={send}
                    disabled={!reply.trim()}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-electric-500 to-violet-500 px-4 text-[11px] font-semibold text-white transition hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <Send size={12} /> {t('inbox.send')}
                  </button>
                </div>
              </div>
            </Panel>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 xl:grid-cols-3">
          {requests.map((request) => {
            const Icon = requestIcons[request.type] ?? Ticket;
            return (
              <RequestCard
                key={request.id}
                request={request}
                icon={<Icon size={15} />}
                onStatus={(status) => updateRequestStatus(request.id, status)}
                locale={locale}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  icon,
  onStatus,
  locale,
}: {
  request: AdminRequest;
  icon: React.ReactNode;
  onStatus: (status: AdminRequest['status']) => void;
  locale: 'de' | 'en';
}) {
  const { t } = useTranslation('admin');
  return (
    <Panel padded={false} className="flex flex-col">
      <div className="flex items-start gap-3 p-4">
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            request.status === 'pending'
              ? 'bg-amber-500/10 text-amber-600'
              : request.status === 'approved'
                ? 'bg-emerald-500/10 text-emerald-600'
                : 'bg-rose-500/10 text-rose-500',
          )}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11.5px] font-semibold text-ink-900">
              {t(`requests.${request.type}`)}
            </p>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.06em]',
                request.status === 'pending'
                  ? 'bg-amber-500/10 text-amber-700'
                  : request.status === 'approved'
                    ? 'bg-emerald-500/10 text-emerald-700'
                    : 'bg-rose-500/10 text-rose-600',
              )}
            >
              {t(`statuses.${request.status}`)}
            </span>
          </div>
          <p className="mt-1 text-[10.5px] leading-relaxed text-ink-900/55">{request.detail}</p>
          <p className="mt-1.5 text-[9px] text-ink-900/35">
            {request.customer} ·{' '}
            {new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
              day: '2-digit',
              month: 'short',
            }).format(new Date(request.date))}
          </p>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-ink-900/6 p-3">
        <button
          type="button"
          onClick={() => onStatus('approved')}
          className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-full bg-emerald-600 text-[10px] font-semibold text-white transition hover:bg-emerald-700"
        >
          <Check size={11} /> {t('requests.approve')}
        </button>
        <button
          type="button"
          onClick={() => onStatus('declined')}
          className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-full border border-ink-900/12 text-[10px] font-medium text-ink-900/55 transition hover:border-rose-300 hover:text-rose-600"
        >
          <ChevronLeft size={11} /> {t('requests.decline')}
        </button>
      </div>
    </Panel>
  );
}
