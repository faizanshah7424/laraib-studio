import React from 'react';
import { PublicProduct } from '@/types';
import { ProductCard } from './ProductCard';
import { cn } from '@/lib/utils';

export interface ProductGridProps {
  products: PublicProduct[];
  className?: string;
  columns?: 3 | 4;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  className,
  columns = 4,
  emptyMessage = 'No products found matching your current selection.',
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center bg-stone-50 border border-dashed border-stone-200 rounded-sm">
        <p className="text-stone-500 font-serif text-lg mb-2">{emptyMessage}</p>
        <p className="text-xs text-stone-400">
          Try resetting filters or adjusting search terms to explore our latest arrivals.
        </p>
      </div>
    );
  }

  const gridCols =
    columns === 3
      ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3'
      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={cn('grid gap-3 sm:gap-6', gridCols, className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
