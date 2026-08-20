import React from 'react';
import { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getPublicProducts, getPublicCategories, getPublicBrands } from '@/lib/products';
import { STORE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: "New In / Today's Drop",
  description: `Discover fresh daily arrivals in women’s and men’s fashion at ${STORE_NAME}.`,
};

interface NewInPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function NewInPage({ searchParams }: NewInPageProps) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const brand = typeof searchParams.brand === 'string' ? searchParams.brand : undefined;
  const gender = typeof searchParams.gender === 'string' ? (searchParams.gender as 'WOMEN' | 'MEN' | 'UNISEX') : undefined;
  const sale = searchParams.sale === 'true';
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined;
  const availability = searchParams.availability === 'in-stock' ? 'in-stock' : 'all';
  const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as any) : 'newest';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;

  const [{ products, totalCount, totalPages }, categories, brands] = await Promise.all([
    getPublicProducts({
      isNewIn: true,
      categorySlug: category,
      brandSlug: brand,
      gender,
      isSale: sale,
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
      title="New In / Today's Drop"
      description="Fresh daily arrivals in Pakistani luxury lawn, raw silk pret, and men's unstitched cotton. Delivered across Karachi for flat PKR 200."
      badgeText="Live Daily Drops"
      products={products}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      categories={categories}
      brands={brands}
    />
  );
}
