import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100 select-none';

    const variants = {
      primary:
        'bg-brand-dark text-white hover:bg-black focus:ring-brand-dark shadow-sm',
      secondary:
        'bg-stone-100 text-brand-dark hover:bg-stone-200 focus:ring-stone-400',
      accent:
        'bg-brand-accent text-white hover:bg-[#B38F61] focus:ring-brand-accent shadow-sm',
      outline:
        'border border-stone-300 bg-transparent text-brand-dark hover:bg-stone-50 hover:border-stone-400 focus:ring-stone-400',
      ghost:
        'bg-transparent text-stone-700 hover:bg-stone-100 hover:text-brand-dark focus:ring-stone-300',
      whatsapp:
        'bg-brand-whatsapp text-white hover:bg-brand-whatsappDark focus:ring-brand-whatsapp shadow-sm font-semibold',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-sm gap-1.5 h-8',
      md: 'text-sm px-5 py-2.5 rounded-sm gap-2 h-10',
      lg: 'text-base px-7 py-3.5 rounded-sm gap-2.5 h-12 tracking-wide uppercase font-semibold text-xs',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
