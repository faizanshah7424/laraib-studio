import React from 'react';
import { PublicProduct } from '@/types';
import { ProductGrid } from '@/components/ui/ProductGrid';

export interface RelatedProductsProps {
  products: PublicProduct[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="border-t border-stone-200 pt-12 mt-16 space-y-6">
      <div className="text-center space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-accent">
          Curated Recommendations
        </span>
        <h2 className="text-2xl font-serif font-bold text-stone-900">
          You May Also Like
        </h2>
      </div>

      <ProductGrid products={products} columns={4} />
    </div>
  );
};
