import React from 'react';
import { ProductCardSkeleton, BannerSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-fade-in">
      <BannerSkeleton />
      <div className="space-y-4">
        <div className="h-8 w-48 bg-stone-200 animate-pulse rounded-sm" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </div>
    </div>
  );
}
