'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export const ProductSortSelect: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get('sort') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-3.5 w-3.5 text-stone-400 hidden sm:block" />
      <span className="text-xs text-stone-500 font-medium hidden sm:inline">Sort By:</span>
      <select
        value={currentSort}
        onChange={handleSortChange}
        className="text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs px-2.5 py-1.5 focus:outline-none focus:border-stone-400 cursor-pointer shadow-2xs"
      >
        <option value="newest">Newest Arrivals</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A-Z</option>
        <option value="featured">Featured First</option>
      </select>
    </div>
  );
};
