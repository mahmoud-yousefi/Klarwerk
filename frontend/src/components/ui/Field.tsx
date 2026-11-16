import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const baseField =
  'w-full rounded-xl border border-ink-900/15 bg-white px-3.5 text-[14px] text-ink-900 placeholder:text-ink-900/35 transition duration-200 hover:border-ink-900/25 focus:border-electric-500 focus:outline-none focus:ring-4 focus:ring-electric-500/10 disabled:opacity-50';

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, error, hint, optionalLabel, children, className }: FieldWrapperProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={htmlFor} className="text-[12px] font-medium text-ink-900/70">
            {label}
          </label>
          {optionalLabel && <span className="text-[11px] text-ink-900/40">{optionalLabel}</span>}
        </div>
      )}
      {children}
      {error ? (
        <p className="text-[11px] font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-ink-900/45">{hint}</p>
      ) : null}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, error, hint, optionalLabel, wrapperClassName, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  return (
    <Field
      label={label}
      htmlFor={fieldId}
      error={error}
      hint={hint}
      optionalLabel={optionalLabel}
      className={wrapperClassName}
    >
      <input
        ref={ref}
        id={fieldId}
        className={cn(baseField, 'h-11', error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </Field>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  optionalLabel?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, error, hint, optionalLabel, wrapperClassName, id, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  return (
    <Field
      label={label}
      htmlFor={fieldId}
      error={error}
      hint={hint}
      optionalLabel={optionalLabel}
      className={wrapperClassName}
    >
      <textarea
        ref={ref}
        id={fieldId}
        className={cn(baseField, 'min-h-24 py-3', error && 'border-rose-400', className)}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </Field>
  );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, wrapperClassName, id, children, ...props },
  ref,
) {
  const fieldId = id ?? props.name;
  return (
    <Field label={label} htmlFor={fieldId} error={error} className={wrapperClassName}>
      <select
        ref={ref}
        id={fieldId}
        className={cn(baseField, 'h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23080D18\' stroke-width=\'2\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")] bg-[right_14px_center] bg-no-repeat pr-9', className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
});
