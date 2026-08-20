import React from 'react';
import { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getPublicProducts, getPublicCategories, getPublicBrands } from '@/lib/products';
import { STORE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Sale & Special Offers',
  description: `Shop discounted Pakistani fashion and seasonal luxury clearance sales at ${STORE_NAME}.`,
};

interface SalePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SaleCollectionPage({ searchParams }: SalePageProps) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const brand = typeof searchParams.brand === 'string' ? searchParams.brand : undefined;
  const gender = typeof searchParams.gender === 'string' ? (searchParams.gender as 'WOMEN' | 'MEN' | 'UNISEX') : undefined;
  const isNew = searchParams.new === 'true';
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined;
  const availability = searchParams.availability === 'in-stock' ? 'in-stock' : 'all';
  const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as any) : 'newest';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;

  const [{ products, totalCount, totalPages }, categories, brands] = await Promise.all([
    getPublicProducts({
      isSale: true,
      categorySlug: category,
      brandSlug: brand,
      gender,
      isNewIn: isNew,
      minPrice,
      maxPrice,
      availability,
      sortBy: sort,
      page,
      limit: 12,
    }),
    getPublicCategories(),
    getPublicBrands(),
  ]);

  return (
    <CatalogView
      title="Sale & Seasonal Clearance"
      description="Exclusive limited-time price reductions on high fashion pret, unstitched lawn, and men's kurtas."
      badgeText="Limited Period Offers"
      products={products}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      categories={categories}
      brands={brands}
    />
  );
}
