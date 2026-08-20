'use client';

import React, { useState } from 'react';
import { PublicProduct, PublicCategory, PublicBrand } from '@/types';
import { ProductGrid } from '@/components/ui/ProductGrid';
import { ProductFilters } from './ProductFilters';
import { ProductSortSelect } from './ProductSortSelect';
import { ActiveFilterPills } from './ActiveFilterPills';
import { Filter, Sparkles } from 'lucide-react';
import Link from 'next/link';

export interface CatalogViewProps {
  title: string;
  description?: string;
  badgeText?: string;
  products: PublicProduct[];
  totalCount: number;
  page: number;
  totalPages: number;
  categories: PublicCategory[];
  brands: PublicBrand[];
  currentCategoryName?: string;
  currentBrandName?: string;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  title,
  description,
  badgeText,
  products,
  totalCount,
  page,
  totalPages,
  categories,
  brands,
  currentCategoryName,
  currentBrandName,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      {/* Header Banner */}
      <div className="border-b border-stone-200 pb-5 space-y-2">
        {badgeText && (
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-accent">
            <Sparkles className="h-4 w-4" />
            <span>{badgeText}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-brand-dark">
            {title}
          </h1>
          <span className="text-xs text-stone-500 font-medium">
            Showing {products.length} of {totalCount} items
          </span>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-stone-500 max-w-2xl">{description}</p>
        )}
      </div>

      {/* Controls Bar (Mobile Filter Toggle + Sort) */}
      <div className="flex items-center justify-between gap-4 bg-stone-50 p-3 rounded-sm border border-stone-200/80">
        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden inline-flex items-center gap-2 text-xs font-semibold uppercase text-stone-800 bg-white border border-stone-200 px-3 py-1.5 rounded-xs"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </button>

        <ActiveFilterPills categoryName={currentCategoryName} brandName={currentBrandName} />

        <ProductSortSelect />
      </div>

      {/* Main Layout (Filters Sidebar + Product Grid) */}
      <div className="flex gap-8">
        <ProductFilters
          categories={categories}
          brands={brands}
          isMobileOpen={mobileFilterOpen}
          onCloseMobile={() => setMobileFilterOpen(false)}
        />

        <div className="flex-1 space-y-8">
          <ProductGrid products={products} columns={4} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-stone-200">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const isCurrent = p === page;
                return (
                  <Link
                    key={p}
                    href={`?page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-xs text-xs font-semibold transition-all ${
                      isCurrent
                        ? 'bg-brand-dark text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
