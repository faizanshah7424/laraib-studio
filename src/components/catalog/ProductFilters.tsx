'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PublicCategory, PublicBrand } from '@/types';
import { Filter, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ProductFiltersProps {
  categories: PublicCategory[];
  brands: PublicBrand[];
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  brands,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentGender = searchParams.get('gender') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSale = searchParams.get('sale') === 'true';
  const currentNew = searchParams.get('new') === 'true';
  const currentAvailability = searchParams.get('availability') || 'all';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to page 1 on filter change

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    router.push(pathname);
    if (onCloseMobile) onCloseMobile();
  };

  const hasActiveFilters =
    currentGender ||
    currentCategory ||
    currentBrand ||
    currentSale ||
    currentNew ||
    currentAvailability !== 'all' ||
    currentMinPrice ||
    currentMaxPrice;

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-dark" />
          <h3 className="font-serif font-semibold text-sm uppercase tracking-wider text-stone-900">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-brand-dark transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">Gender</h4>
        <div className="flex gap-2">
          {[
            { label: 'All', value: '' },
            { label: 'Women', value: 'WOMEN' },
            { label: 'Men', value: 'MEN' },
          ].map((g) => (
            <button
              key={g.label}
              onClick={() => updateFilters({ gender: g.value || null })}
              className={`flex-1 text-xs py-1.5 border rounded-xs font-medium transition-all ${
                currentGender === g.value
                  ? 'border-brand-dark bg-brand-dark text-white'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Special Highlights */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">Collections</h4>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={currentNew}
              onChange={(e) => updateFilters({ new: e.target.checked ? 'true' : null })}
              className="rounded-xs border-stone-300 text-brand-dark focus:ring-stone-400"
            />
            <span className="font-semibold text-stone-900">New Arrivals Only</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={currentSale}
              onChange={(e) => updateFilters({ sale: e.target.checked ? 'true' : null })}
              className="rounded-xs border-stone-300 text-brand-dark focus:ring-stone-400"
            />
            <span className="font-semibold text-red-600">On Sale / Discounted</span>
          </label>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">Category</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => updateFilters({ category: null })}
              className={`w-full text-left text-xs py-1 px-2 rounded-xs transition-colors ${
                !currentCategory
                  ? 'bg-stone-100 font-semibold text-brand-dark'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilters({ category: cat.slug })}
                className={`w-full text-left text-xs py-1 px-2 rounded-xs transition-colors ${
                  currentCategory === cat.slug
                    ? 'bg-stone-100 font-semibold text-brand-dark'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">Brand</h4>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => updateFilters({ brand: null })}
              className={`w-full text-left text-xs py-1 px-2 rounded-xs transition-colors ${
                !currentBrand
                  ? 'bg-stone-100 font-semibold text-brand-dark'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              All Brands
            </button>
            {brands.map((b) => (
              <button
                key={b.id}
                onClick={() => updateFilters({ brand: b.slug })}
                className={`w-full text-left text-xs py-1 px-2 rounded-xs transition-colors ${
                  currentBrand === b.slug
                    ? 'bg-stone-100 font-semibold text-brand-dark'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">Price (PKR)</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentMinPrice}
            onChange={(e) => updateFilters({ minPrice: e.target.value || null })}
            className="w-full text-xs px-2.5 py-1.5 border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
          />
          <input
            type="number"
            placeholder="Max"
            value={currentMaxPrice}
            onChange={(e) => updateFilters({ maxPrice: e.target.value || null })}
            className="w-full text-xs px-2.5 py-1.5 border border-stone-200 rounded-xs focus:outline-none focus:border-stone-400"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">Availability</h4>
        <div className="flex gap-2">
          {[
            { label: 'All Items', value: 'all' },
            { label: 'In Stock', value: 'in-stock' },
          ].map((a) => (
            <button
              key={a.value}
              onClick={() => updateFilters({ availability: a.value === 'all' ? null : a.value })}
              className={`flex-1 text-xs py-1.5 border rounded-xs font-medium transition-all ${
                (currentAvailability || 'all') === a.value
                  ? 'border-brand-dark bg-brand-dark text-white'
                  : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 bg-white border border-stone-200 p-5 rounded-sm h-fit sticky top-24">
        {content}
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200">
                <h3 className="font-serif font-bold text-lg text-stone-900">Filter Products</h3>
                <button
                  onClick={onCloseMobile}
                  className="p-1 text-stone-500 hover:text-stone-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {content}
            </div>
            <div className="pt-6 border-t border-stone-200 mt-6">
              <Button
                variant="primary"
                className="w-full"
                onClick={onCloseMobile}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
