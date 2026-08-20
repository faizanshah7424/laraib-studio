import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getPublicProducts, getPublicCategories, getPublicBrands } from '@/lib/products';
import { STORE_NAME } from '@/lib/constants';

interface CategoryPageProps {
  params: {
    'category-slug': string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const categorySlug = params['category-slug'];
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Collection`,
    description: category.description || `Browse ${category.name} at ${STORE_NAME}.`,
  };
}

export default async function DynamicCategoryPage({ params, searchParams }: CategoryPageProps) {
  const categorySlug = params['category-slug'];
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    notFound();
  }

  const brand = typeof searchParams.brand === 'string' ? searchParams.brand : undefined;
  const gender = typeof searchParams.gender === 'string' ? (searchParams.gender as 'WOMEN' | 'MEN' | 'UNISEX') : undefined;
  const isNew = searchParams.new === 'true';
  const sale = searchParams.sale === 'true';
  const minPrice = typeof searchParams.minPrice === 'string' ? parseFloat(searchParams.minPrice) : undefined;
  const maxPrice = typeof searchParams.maxPrice === 'string' ? parseFloat(searchParams.maxPrice) : undefined;
  const availability = searchParams.availability === 'in-stock' ? 'in-stock' : 'all';
  const sort = typeof searchParams.sort === 'string' ? (searchParams.sort as any) : 'newest';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : 1;

  const [{ products, totalCount, totalPages }, categories, brands] = await Promise.all([
    getPublicProducts({
      categorySlug,
      brandSlug: brand,
      gender,
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
      title={category.name}
      description={category.description || `Explore our latest ${category.name} collection.`}
      products={products}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      categories={categories}
      brands={brands}
      currentCategoryName={category.name}
    />
  );
}
