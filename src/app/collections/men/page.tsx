import React from 'react';
import { Metadata } from 'next';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getPublicProducts, getPublicCategories, getPublicBrands } from '@/lib/products';
import { STORE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: "Men's Collection",
  description: `Discover men’s Egyptian cotton kurtas, shalwar kameez & waistcoats at ${STORE_NAME}.`,
};

interface MenPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function MenCollectionPage({ searchParams }: MenPageProps) {
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
      gender: 'MEN',
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
      title="Men's Collection"
      description="Refined men's eastern staples: tailored Giza Egyptian cotton kurtas, classic shalwar kameez, and formal waistcoats."
      products={products}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      categories={categories}
      brands={brands}
    />
  );
}
