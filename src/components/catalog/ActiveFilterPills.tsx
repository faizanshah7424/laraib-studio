'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { formatPKR } from '@/lib/utils';

export interface ActiveFilterPillsProps {
  categoryName?: string;
  brandName?: string;
}

export const ActiveFilterPills: React.FC<ActiveFilterPillsProps> = ({
  categoryName,
  brandName,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const gender = searchParams.get('gender');
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const sale = searchParams.get('sale') === 'true';
  const isNew = searchParams.get('new') === 'true';
  const availability = searchParams.get('availability');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const search = searchParams.get('search');

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
  };

  const activeFilters = [];

  if (search) {
    activeFilters.push({ key: 'search', label: `Search: "${search}"` });
  }
  if (gender) {
    activeFilters.push({ key: 'gender', label: `Gender: ${gender}` });
  }
  if (category) {
    activeFilters.push({ key: 'category', label: `Category: ${categoryName || category}` });
  }
  if (brand) {
    activeFilters.push({ key: 'brand', label: `Brand: ${brandName || brand}` });
  }
  if (isNew) {
    activeFilters.push({ key: 'new', label: 'New In Only' });
  }
  if (sale) {
    activeFilters.push({ key: 'sale', label: 'On Sale' });
  }
  if (availability === 'in-stock') {
    activeFilters.push({ key: 'availability', label: 'In Stock' });
  }
  if (minPrice || maxPrice) {
    const minText = minPrice ? formatPKR(Number(minPrice)) : '0';
    const maxText = maxPrice ? formatPKR(Number(maxPrice)) : 'Max';
    activeFilters.push({ key: 'priceRange', keysToRemove: ['minPrice', 'maxPrice'], label: `Price: ${minText} - ${maxText}` });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap pt-2 pb-1">
      <span className="text-xs text-stone-500 font-medium">Active Filters:</span>
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-stone-100 border border-stone-200 text-stone-800 rounded-full"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => {
              if (filter.keysToRemove) {
                filter.keysToRemove.forEach((k) => removeFilter(k));
              } else {
                removeFilter(filter.key);
              }
            }}
            className="text-stone-400 hover:text-stone-700 p-0.5 rounded-full"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="text-xs text-brand-dark underline font-medium hover:text-stone-600 ml-1"
      >
        Clear All
      </button>
    </div>
  );
};
