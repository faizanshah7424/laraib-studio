import React from 'react';
import { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getPublicProducts, getPublicCategories, getPublicBrands } from '@/lib/products';
import { STORE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: "Women's Collection",
  description: `Explore women’s unstitched lawn, luxury pret, formal kaftans & 3-piece sets at ${STORE_NAME}.`,
};

interface WomenPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function WomenCollectionPage({ searchParams }: WomenPageProps) {
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
  const brand = typeof searchParams.brand === 'string' ? searchParams.brand : undefined;
  const isNew = searchParams.new === 'true';
  const sale = searchParams.sale === 'true';
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined;
  const availability = searchParams.availability === 'in-stock' ? 'in-stock' : 'all';
  const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as any) : 'newest';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;

  const [{ products, totalCount, totalPages }, categories, brands] = await Promise.all([
    getPublicProducts({
      gender: 'WOMEN',
      categorySlug: category,
      brandSlug: brand,
      isNewIn: isNew,
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
      title="Women's Collection"
      description="Curated ready-to-wear kurtis, 2-piece ensembles, embroidered 3-piece lawn suits, and festive formal wear."
      products={products}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      categories={categories}
      brands={brands}
    />
  );
}
