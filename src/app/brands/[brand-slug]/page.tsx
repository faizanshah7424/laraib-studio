import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import prisma from '@/lib/db';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getPublicProducts, getPublicCategories, getPublicBrands } from '@/lib/products';
import { STORE_NAME } from '@/lib/constants';

interface BrandPageProps {
  params: {
    'brand-slug': string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const brandSlug = params['brand-slug'];
  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
  });

  if (!brand) {
    return {
      title: 'Brand Not Found',
    };
  }

  return {
    title: `${brand.name} | ${STORE_NAME}`,
    description: brand.description || `Explore luxury collections by ${brand.name} at ${STORE_NAME}.`,
  };
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const brandSlug = params['brand-slug'];
  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
  });

  if (!brand) {
    notFound();
  }

  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
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
      brandSlug,
      categorySlug: category,
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
    <div className="space-y-6">
      {brand.logoUrl && (
        <div className="max-w-7xl mx-auto px-4 pt-6 flex items-center justify-center">
          <div className="relative h-16 w-48">
            <Image
              src={brand.logoUrl}
              alt={brand.name}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
      <CatalogView
        title={brand.name}
        description={brand.description || `Browse original designs and curated drops from ${brand.name}.`}
        badgeText="Official Brand Drop"
        products={products}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        categories={categories}
        brands={brands}
        currentBrandName={brand.name}
      />
    </div>
  );
}
