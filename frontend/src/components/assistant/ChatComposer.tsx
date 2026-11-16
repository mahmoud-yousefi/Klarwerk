import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_LENGTH = 600;

interface ChatComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
}

export function ChatComposer({ onSend, onStop, streaming }: ChatComposerProps) {
  const { t } = useTranslation('assistant');
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, 168)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-ink-900/8 bg-white px-3 py-3 sm:px-4">
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border bg-mist/60 p-2 transition',
          value.length > MAX_LENGTH
            ? 'border-rose-400/60 ring-2 ring-rose-500/10'
            : 'border-ink-900/12 focus-within:border-electric-500/60 focus-within:ring-4 focus-within:ring-electric-500/10',
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value.slice(0, MAX_LENGTH + 40))}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={t('composer.placeholder')}
          aria-label={t('composer.placeholder')}
          className="max-h-[168px] min-h-[38px] w-full resize-none bg-transparent px-2.5 py-2 text-[13px] leading-relaxed text-ink-900 outline-none placeholder:text-ink-900/30"
        />

        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-900 text-white transition hover:bg-ink-800"
            aria-label={t('composer.stop')}
            title={t('composer.stop')}
          >
            <Square size={12} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || value.length > MAX_LENGTH}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-electric-500 text-white shadow-[0_8px_20px_-8px_rgba(88,101,242,0.9)] transition hover:bg-electric-400 disabled:pointer-events-none disabled:opacity-35"
            aria-label={t('composer.send')}
            title={t('composer.send')}
          >
            <ArrowUp size={15} />
          </button>
        )}
      </div>

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1">
        <p className="text-[9px] text-ink-900/30">{t('composer.hint')}</p>
        <p
          className={cn(
            'text-[9px] tabular-nums',
            value.length > MAX_LENGTH ? 'font-medium text-rose-500' : 'text-ink-900/30',
          )}
        >
          {value.length > MAX_LENGTH
            ? t('limits.maxLength')
            : t('composer.charCount', { count: value.length, max: MAX_LENGTH })}
        </p>
      </div>
      <p className="mt-1 px-1 text-[9px] leading-relaxed text-ink-900/25">
        {t('composer.disclaimer')}
      </p>
    </div>
  );
}
