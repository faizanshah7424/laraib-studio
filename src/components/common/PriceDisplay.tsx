import React from 'react';
import { formatPKR, cn } from '@/lib/utils';

export interface PriceDisplayProps {
  retailPrice: number;
  salePrice?: number | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscountBadge?: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  retailPrice,
  salePrice,
  className,
  size = 'md',
  showDiscountBadge = true,
}) => {
  const hasSale = typeof salePrice === 'number' && salePrice > 0 && salePrice < retailPrice;
  const discountPercent = hasSale ? Math.round(((retailPrice - salePrice!) / retailPrice) * 100) : 0;

  const fontSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base font-semibold',
    xl: 'text-xl font-bold',
  };

  return (
    <div className={cn('flex items-center gap-2 flex-wrap font-sans', className)}>
      {hasSale ? (
        <>
          <span className={cn('font-semibold text-brand-dark', fontSizes[size])}>
            {formatPKR(salePrice!)}
          </span>
          <span className={cn('text-stone-400 line-through font-normal', size === 'xl' ? 'text-base' : 'text-xs')}>
            {formatPKR(retailPrice)}
          </span>
          {showDiscountBadge && (
            <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-sm">
              {discountPercent}% OFF
            </span>
          )}
        </>
      ) : (
        <span className={cn('font-semibold text-brand-dark', fontSizes[size])}>
          {formatPKR(retailPrice)}
        </span>
      )}
    </div>
  );
};
