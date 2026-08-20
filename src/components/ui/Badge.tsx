import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'new' | 'sale' | 'featured' | 'karachi' | 'outline' | 'neutral' | 'success' | 'danger';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center font-medium uppercase tracking-wider select-none rounded-full';

  const variants = {
    new: 'bg-brand-dark text-white border border-stone-800',
    sale: 'bg-red-600 text-white font-bold',
    featured: 'bg-[#FAF2E6] text-[#A8865B] border border-[#E8D9C0]',
    karachi: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    outline: 'border border-stone-300 text-stone-800 bg-white/80',
    neutral: 'bg-stone-100 text-stone-700',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
