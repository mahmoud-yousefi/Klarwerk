import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant =
  | 'primary'
  | 'dark'
  | 'outline'
  | 'ghost'
  | 'light'
  | 'outline-light'
  | 'soft';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-electric-500 text-white shadow-[0_12px_30px_-12px_rgba(88,101,242,0.8)] hover:bg-electric-400 active:bg-electric-600',
  dark: 'bg-ink-900 text-white hover:bg-ink-800',
  outline: 'border border-ink-900/15 text-ink-900 hover:border-ink-900/35 hover:bg-ink-900/[0.035]',
  ghost: 'text-ink-900 hover:bg-ink-900/[0.06]',
  light: 'bg-white text-ink-900 hover:bg-white/90 shadow-soft',
  'outline-light': 'border border-white/20 text-white hover:border-white/40 hover:bg-white/10',
  soft: 'bg-electric-500/10 text-electric-500 hover:bg-electric-500/16',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] gap-1.5 rounded-full',
  md: 'h-11 px-5 text-sm gap-2 rounded-full',
  lg: 'h-13 px-7 text-[15px] gap-2.5 rounded-full',
  icon: 'h-11 w-11 rounded-full',
};

export const buttonStyles = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  cn(
    'inline-flex select-none items-center justify-center font-medium tracking-[-0.01em] transition duration-300 disabled:pointer-events-none disabled:opacity-45',
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles(variant, size, className)}
      {...props}
    />
  );
});
