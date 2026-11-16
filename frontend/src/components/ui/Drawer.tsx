import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useUi';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  side?: 'left' | 'right';
  className?: string;
  hideClose?: boolean;
  ariaLabel?: string;
}

export function Drawer({
  open,
  onClose,
  children,
  title,
  side = 'right',
  className,
  hideClose,
  ariaLabel,
}: DrawerProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement;
    const timer = window.setTimeout(() => panelRef.current?.focus(), 40);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(timer);
      previous?.focus?.();
    };
  }, [open, onClose, side]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div
        className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        tabIndex={-1}
        className={cn(
          'absolute top-0 flex h-full w-full max-w-md flex-col bg-mist shadow-lift outline-none',
          side === 'right' ? 'right-0 animate-[slide-in_0.35s_cubic-bezier(0.16,1,0.3,1)]' : 'left-0 animate-[slide-in-left_0.35s_cubic-bezier(0.16,1,0.3,1)]',
          className,
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-900/8 px-5 py-4">
          <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-900/5 text-ink-900/60 transition hover:bg-ink-900/10 hover:text-ink-900"
              aria-label={t('misc.closeDialog')}
            >
              <X size={17} />
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
