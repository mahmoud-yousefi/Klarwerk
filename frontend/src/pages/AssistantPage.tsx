import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  CircleHelp,
  Database,
  Eraser,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { AssistantMessage } from '@/components/assistant/AssistantMessage';
import { ChatComposer } from '@/components/assistant/ChatComposer';
import { StarterPrompts } from '@/components/assistant/StarterPrompts';
import { Modal } from '@/components/ui/Modal';
import { useAssistantStore } from '@/stores/assistant.store';
import {
  buildMockReply,
  streamAssistant,
  type AssistantMode,
} from '@/services/assistant.service';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types/catalog';

const modes: AssistantMode[] = ['discover', 'recommend', 'compare', 'advice', 'explain', 'store'];
const autoSentLocations = new Set<string>();

export default function AssistantPage() {
  const { t, i18n } = useTranslation(['assistant', 'common']);
  const locale = (i18n.language.startsWith('en') ? 'en' : 'de') as Locale;

  const messages = useAssistantStore((state) => state.messages);
  const add = useAssistantStore((state) => state.add);
  const update = useAssistantStore((state) => state.update);
  const clear = useAssistantStore((state) => state.clear);

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [mode, setMode] = useState<AssistantMode | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const streamingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const modeRef = useRef<AssistantMode | null>(null);
  const localeRef = useRef<Locale>(locale);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  const streamTurn = useCallback(
    async (userText: string, assistantId: string) => {
      const controller = new AbortController();
      abortRef.current = controller;
      streamingRef.current = true;
      setStreaming(true);
      setActiveId(assistantId);

      const snapshot = useAssistantStore.getState().messages;
      const history = snapshot
        .filter((message) => message.id !== assistantId)
        .filter((message) => message.role === 'user' || message.status === 'done')
        .slice(-8)
        .map((message) => ({ role: message.role, content: message.content }));

      const seedProductIds =
        [...snapshot]
          .reverse()
          .find((message) => message.role === 'assistant' && message.productIds.length >= 2)
          ?.productIds ?? [];

      try {
        const completed = await streamAssistant({
          message: userText,
          locale: localeRef.current,
          mode: modeRef.current,
          history,
          seedProductIds,
          signal: controller.signal,
          onDelta: (text) => update(assistantId, { content: text }),
          onProducts: (ids) => update(assistantId, { productIds: ids }),
          onCompare: (ids) => update(assistantId, { compareIds: ids }),
        });

        if (completed) {
          const reply = buildMockReply(
            userText,
            localeRef.current,
            modeRef.current,
            seedProductIds,
          );
          update(assistantId, { status: 'done', suggestions: reply.suggestions });
        } else {
          update(assistantId, { status: 'stopped' });
        }
      } catch (error) {
        const aborted = error instanceof DOMException && error.name === 'AbortError';
        update(assistantId, { status: aborted ? 'stopped' : 'error' });
      } finally {
        abortRef.current = null;
        streamingRef.current = false;
        setStreaming(false);
        setActiveId(null);
      }
    },
    [update],
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text || streamingRef.current) return;
      add({
        role: 'user',
        content: text,
        productIds: [],
        compareIds: [],
        suggestions: [],
        status: 'done',
      });
      const assistantId = add({
        role: 'assistant',
        content: '',
        productIds: [],
        compareIds: [],
        suggestions: [],
        status: 'streaming',
      });
      void streamTurn(text, assistantId);
    },
    [add, streamTurn],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (activeId) update(activeId, { status: 'stopped' });
    streamingRef.current = false;
    setStreaming(false);
  }, [activeId, update]);

  const retry = useCallback(
    (assistantId: string) => {
      if (streamingRef.current) return;
      const snapshot = useAssistantStore.getState().messages;
      const index = snapshot.findIndex((message) => message.id === assistantId);
      if (index < 0) return;
      const previousUser = [...snapshot.slice(0, index)]
        .reverse()
        .find((message) => message.role === 'user');
      if (!previousUser) return;

      update(assistantId, {
        content: '',
        productIds: [],
        compareIds: [],
        suggestions: [],
        status: 'streaming',
      });
      void streamTurn(previousUser.content, assistantId);
    },
    [streamTurn, update],
  );

  useEffect(() => {
    const query = searchParams.get('q');
    if (!query) return;
    const key = `${location.key}:${query}`;
    if (autoSentLocations.has(key)) return;
    autoSentLocations.add(key);
    send(query);
    const next = new URLSearchParams(searchParams);
    next.delete('q');
    setSearchParams(next, { replace: true });
  }, [location.key, searchParams, send, setSearchParams]);

  const lastMessage = messages[messages.length - 1];
  const lastContentLength = lastMessage?.content.length ?? 0;

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    // Only follow the stream when the user is already near the bottom.
    // Otherwise leave their scroll position untouched so they can read freely.
    const isNearBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 96;
    if (!isNearBottom) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [messages.length, lastContentLength]);

  const contextFor = (index: number) => {
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      if (messages[cursor].role === 'user') return messages[cursor].content;
    }
    return '';
  };

  const confirmClear = () => {
    stop();
    clear();
    setClearOpen(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="bg-mist">
      <div className="container-x py-8 sm:py-10">
        <div className="flex flex-col gap-5 border-b border-ink-900/8 pb-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow text-violet-600">
              <Sparkles size={13} />
              {t('assistant:meta.badge')}
            </p>
            <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl">
              {t('assistant:meta.title')}
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-ink-900/50">
              {t('assistant:meta.intro')}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-violet-700">
                <Database size={10} /> {t('assistant:meta.grounded')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-900/10 bg-white px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-900/45">
                {t('assistant:meta.modeBadge')}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                <ShieldCheck size={10} /> {t('assistant:composer.disclaimer').split(' ')[0]}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/shop"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-ink-900/12 bg-white px-4 text-[11px] font-medium text-ink-900/60 transition hover:border-ink-900/30 hover:text-ink-900"
            >
              <ArrowLeft size={12} /> {t('assistant:meta.backToShop')}
            </Link>
            <button
              type="button"
              onClick={() => (hasMessages ? setClearOpen(true) : undefined)}
              disabled={!hasMessages}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink-900 px-4 text-[11px] font-medium text-white transition hover:bg-ink-800 disabled:pointer-events-none disabled:opacity-35"
            >
              <Plus size={12} /> {t('assistant:meta.newChat')}
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_290px]">
          <section className="flex min-h-[600px] flex-col overflow-hidden rounded-3xl border border-ink-900/8 bg-white shadow-soft">
            <header className="flex items-center gap-3 border-b border-ink-900/8 px-4 py-3 sm:px-5">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric-500 to-violet-500 text-white">
                <Sparkles size={15} />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-ink-900/80">
                  {t('assistant:message.assistant')}
                </p>
                <p className="text-[9px] uppercase tracking-[0.14em] text-ink-900/30">
                  {streaming ? t('assistant:message.streaming') : t('assistant:meta.grounded')}
                </p>
              </div>
              {hasMessages && (
                <button
                  type="button"
                  onClick={() => setClearOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-900/35 transition hover:bg-rose-50 hover:text-rose-500"
                  aria-label={t('assistant:meta.clearChat')}
                  title={t('assistant:meta.clearChat')}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </header>

            <div
              ref={scrollRef}
              className="min-h-[320px] flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(155,114,242,0.05),transparent_60%)] px-4 py-5 sm:px-5 lg:h-[540px] lg:flex-none"
            >
              {hasMessages ? (
                <div className="space-y-5">
                  {messages.map((message, index) => (
                    <AssistantMessage
                      key={message.id}
                      message={message}
                      context={contextFor(index)}
                      streaming={streaming}
                      onSuggestion={send}
                      onRetry={retry}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center py-4">
                  <div className="mx-auto w-full max-w-lg">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                      <Sparkles size={10} /> {t('assistant:meta.badge')}
                    </span>
                    <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">
                      {t('assistant:welcome.title')}
                    </h2>
                    <p className="mt-2 text-[12px] leading-relaxed text-ink-900/50">
                      {t('assistant:welcome.text')}
                    </p>
                    <div className="mt-5">
                      <StarterPrompts onSelect={send} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <ChatComposer onSend={send} onStop={stop} streaming={streaming} />
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <h2 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900/40">
                <CircleHelp size={12} /> {t('assistant:side.modesTitle')}
              </h2>
              <p className="mt-1 text-[10px] leading-relaxed text-ink-900/35">
                {t('assistant:side.modesText')}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {modes.map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setMode(mode === entry ? null : entry)}
                    aria-pressed={mode === entry}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] transition',
                      mode === entry
                        ? 'border-violet-500 bg-violet-500 text-white'
                        : 'border-ink-900/12 text-ink-900/50 hover:border-violet-500/40 hover:text-violet-600',
                    )}
                  >
                    {t(`assistant:modes.${entry}`)}
                  </button>
                ))}
              </div>
              {mode && (
                <button
                  type="button"
                  onClick={() => send(t(`assistant:modePrompts.${mode}`))}
                  className="mt-3 flex w-full items-start gap-2 rounded-xl bg-mist p-2.5 text-left text-[10px] leading-relaxed text-ink-900/55 transition hover:bg-violet-500/[0.07] hover:text-ink-900"
                >
                  <ArrowRight size={11} className="mt-0.5 shrink-0 text-violet-500" />
                  {t(`assistant:modePrompts.${mode}`)}
                </button>
              )}
            </div>

            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900/40">
                {t('assistant:side.howTitle')}
              </h2>
              <ol className="mt-3 space-y-2.5">
                {['how1', 'how2', 'how3'].map((key, index) => (
                  <li key={key} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-900/[0.055] text-[9px] font-semibold text-ink-900/45">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-[10px] leading-relaxed text-ink-900/45">
                      {t(`assistant:side.${key}`)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.045] p-4">
              <h2 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700">
                <ShieldCheck size={12} /> {t('assistant:side.privacyTitle')}
              </h2>
              <p className="mt-1.5 text-[10px] leading-relaxed text-ink-900/45">
                {t('assistant:side.privacyText')}
              </p>
            </div>

            <div className="rounded-2xl border border-ink-900/8 bg-white p-4">
              <h2 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-900/40">
                <Eraser size={12} /> {t('assistant:side.historyTitle')}
              </h2>
              <p className="mt-1.5 text-[10px] leading-relaxed text-ink-900/40">
                {t('assistant:side.historyText')}
              </p>
            </div>
          </aside>
        </div>
      </div>

      <Modal
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title={t('assistant:meta.clearChat')}
        align="center"
        className="max-w-md"
      >
        <div className="p-6">
          <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">
            {t('assistant:meta.clearChat')}
          </h2>
          <p className="mt-2 text-[12px] leading-relaxed text-ink-900/50">
            {t('assistant:actions.clearConfirm')}
          </p>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setClearOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-ink-900/12 px-4 text-[12px] font-medium text-ink-900/60 transition hover:border-ink-900/30 hover:text-ink-900"
            >
              {t('assistant:actions.clearConfirmNo')}
            </button>
            <button
              type="button"
              onClick={confirmClear}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-rose-500 px-4 text-[12px] font-medium text-white transition hover:bg-rose-600"
            >
              <Trash2 size={12} /> {t('assistant:actions.clearConfirmYes')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
