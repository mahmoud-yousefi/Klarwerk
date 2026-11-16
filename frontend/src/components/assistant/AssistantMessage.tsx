import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Check,
  Copy,
  RefreshCw,
  Sparkles,
  Square,
  TriangleAlert,
} from 'lucide-react';
import { getProductById } from '@/lib/catalog';
import { useToastStore } from '@/stores/toast.store';
import { cn } from '@/lib/utils';
import type { AssistantMessage as AssistantMessageType } from '@/stores/assistant.store';
import type { Product } from '@/types/catalog';
import { RecommendationCard } from '@/components/assistant/RecommendationCard';
import { ComparisonTable } from '@/components/assistant/ComparisonTable';

interface AssistantMessageProps {
  message: AssistantMessageType;
  context: string;
  streaming: boolean;
  onSuggestion: (text: string) => void;
  onRetry: (messageId: string) => void;
}

function renderInline(text: string, prefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    const key = `${prefix}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className="font-semibold text-ink-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

function AssistantText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (!list.length) return;
    const items = [...list];
    list = [];
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-2 space-y-1.5">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2">
            <span
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-electric-500"
              aria-hidden="true"
            />
            <span>{renderInline(item, `li-${blocks.length}-${index}`)}</span>
          </li>
        ))}
      </ul>,
    );
  };

  text.split('\n').forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      return;
    }
    if (line.startsWith('- ')) {
      list.push(line.slice(2));
      return;
    }
    flushList();
    blocks.push(
      <p key={`p-${index}`} className={cn(index > 0 && blocks.length > 0 && 'mt-2')}>
        {renderInline(line, `p-${index}`)}
      </p>,
    );
  });
  flushList();

  return <div className="space-y-0.5">{blocks}</div>;
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:120ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-400 [animation-delay:240ms]" />
    </span>
  );
}

export function AssistantMessage({
  message,
  context,
  streaming,
  onSuggestion,
  onRetry,
}: AssistantMessageProps) {
  const { t } = useTranslation('assistant');
  const push = useToastStore((state) => state.push);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-ink-900 px-4 py-2.5 text-[13px] leading-relaxed text-white">
          {message.content}
        </div>
      </div>
    );
  }

  const products = message.productIds
    .map((id) => getProductById(id))
    .filter((product): product is Product => Boolean(product));
  const visibleProducts = expanded ? products : products.slice(0, 3);
  const isStreamingMessage = message.status === 'streaming' && streaming;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      push(t('message.errorText'), 'error');
    }
  };

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric-500 to-violet-500 text-white shadow-[0_8px_20px_-8px_rgba(88,101,242,0.8)]">
        <Sparkles size={14} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-semibold text-ink-900/75">{t('message.assistant')}</p>
          <span className="rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-violet-600">
            {t('message.mockTag')}
          </span>
          {isStreamingMessage && (
            <span className="text-[9px] text-ink-900/30">{t('message.streaming')}</span>
          )}
        </div>

        <div
          className={cn(
            'mt-1.5 rounded-2xl rounded-tl-md border px-4 py-3 text-[13px] leading-relaxed',
            message.status === 'error'
              ? 'border-rose-500/20 bg-rose-50/60 text-ink-900/75'
              : 'border-ink-900/8 bg-mist/80 text-ink-900/75',
          )}
        >
          {message.status === 'error' ? (
            <div className="flex items-start gap-2.5">
              <TriangleAlert size={15} className="mt-0.5 shrink-0 text-rose-500" />
              <div>
                <p className="text-[12px] font-semibold text-ink-900">{t('message.errorTitle')}</p>
                <p className="mt-1 text-[12px] text-ink-900/55">{t('message.errorText')}</p>
                <button
                  type="button"
                  onClick={() => onRetry(message.id)}
                  className="mt-2.5 inline-flex h-8 items-center gap-1.5 rounded-full bg-ink-900 px-3.5 text-[10px] font-medium text-white transition hover:bg-ink-800"
                >
                  <RefreshCw size={11} /> {t('message.retry')}
                </button>
              </div>
            </div>
          ) : !message.content ? (
            <div className="flex items-center gap-2 text-[11px] text-ink-900/35">
              <TypingDots />
              {t('message.typing')}
            </div>
          ) : (
            <>
              <AssistantText text={message.content} />
              {isStreamingMessage && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-sm bg-electric-500/70" />
              )}
              {message.status === 'stopped' && (
                <p className="mt-2 flex items-center gap-1.5 border-t border-ink-900/8 pt-2 text-[10px] text-amber-700">
                  <Square size={9} /> {t('message.stoppedNotice')}
                </p>
              )}
            </>
          )}
        </div>

        {products.length > 0 && message.status !== 'error' && (
          <div className="mt-3">
            <p className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-900/35">
              {t('recommendations.title')}
              <span className="font-normal normal-case tracking-normal text-ink-900/25">
                {t('recommendations.demoNote')}
              </span>
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {visibleProducts.map((product) => (
                <RecommendationCard key={product.id} product={product} context={context} />
              ))}
            </div>
            {products.length > visibleProducts.length && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="mt-2 text-[10px] font-medium text-electric-600 transition hover:text-electric-500"
              >
                {t('recommendations.showAll', { count: products.length })}
              </button>
            )}
          </div>
        )}

        {message.compareIds.length >= 2 && message.status !== 'error' && (
          <ComparisonTable ids={message.compareIds} />
        )}

        {message.status === 'done' && message.suggestions.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-900/30">
              {t('message.suggestionTitle')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={streaming}
                  onClick={() => onSuggestion(suggestion)}
                  className="rounded-full border border-ink-900/12 bg-white px-2.5 py-1.5 text-[10px] text-ink-900/55 transition hover:border-electric-500/40 hover:text-electric-600 disabled:pointer-events-none disabled:opacity-40"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {message.content && message.status !== 'error' && (
          <div className="mt-2 flex items-center gap-3">
            <span className="text-[9px] text-ink-900/25">{t('message.sources')}</span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1 text-[9px] text-ink-900/35 transition hover:text-ink-900"
            >
              {copied ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
              {copied ? t('message.copied') : t('message.copy')}
            </button>
            {(message.status === 'stopped' || message.status === 'done') && !streaming && (
              <button
                type="button"
                onClick={() => onRetry(message.id)}
                className="inline-flex items-center gap-1 text-[9px] text-ink-900/35 transition hover:text-ink-900"
              >
                <RefreshCw size={10} /> {t('message.retry')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
