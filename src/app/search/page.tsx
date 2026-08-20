import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { CatalogView } from '@/components/catalog/CatalogView';
import { getPublicProducts, getPublicCategories, getPublicBrands } from '@/lib/products';
import { STORE_NAME } from '@/lib/constants';
import { Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Search Products',
  description: `Search curated fashion products, unstitched lawn, and pret at ${STORE_NAME}.`,
};

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = typeof searchParams.q === 'string' ? searchParams.q.trim() : (typeof searchParams.search === 'string' ? searchParams.search.trim() : '');
  const category = typeof searchParams.category === 'string' ? searchParams.category : undefined;
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
      searchQuery: query,
      categorySlug: category,
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

  if (!query) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-brand-dark shadow-2xs">
          <SearchIcon className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-stone-900">Search Laraib Studio</h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Type a product name, fabric material (e.g. Lawn, Silk, Chiffon), category, or designer brand.
          </p>
        </div>

        <form action="/search" method="GET" className="flex items-center gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              type="text"
              name="q"
              placeholder="Search lawn, pret, kurtas..."
              className="w-full text-xs pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xs focus:outline-none focus:border-stone-500"
              autoFocus
            />
          </div>
          <Button type="submit" variant="primary" size="md">
            Search
          </Button>
        </form>

        <div className="flex justify-center pt-2">
          <Link href="/collections">
            <Button variant="outline" size="sm">Explore All Collections</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CatalogView
      title={`Search Results for "${query}"`}
      description={`Found ${totalCount} matching item${totalCount === 1 ? '' : 's'}.`}
      badgeText="Catalog Search"
      products={products}
      totalCount={totalCount}
      page={page}
      totalPages={totalPages}
      categories={categories}
      brands={brands}
    />
  );
}
