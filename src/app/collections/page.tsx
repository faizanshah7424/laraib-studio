import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { STORE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'All Collections',
  description: `Explore all curated fashion collections at ${STORE_NAME}.`,
};

const COLLECTIONS = [
  {
    title: "New In / Today's Drop",
    slug: 'new-in',
    description: 'Fresh daily arrivals in women’s and men’s fashion',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: "Women's Collection",
    slug: 'women',
    description: 'Ready-to-wear pret, unstitched lawn, and festive ensembles',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: "Men's Collection",
    slug: 'men',
    description: 'Egyptian cotton kurtas, shalwar kameez, and casual staples',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800',
  },
  {
    title: 'Sale & Clearance',
    slug: 'sale',
    description: 'Limited-time discounts and seasonal clearance specials',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
  },
];

export default function CollectionsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark">
          Curated Collections
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
          Explore our complete directory of unstitched and ready-to-wear luxury drops.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLLECTIONS.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="group relative h-96 overflow-hidden bg-stone-900 rounded-sm shadow-luxury"
          >
            <Image
              src={c.image}
              alt={c.title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <h3 className="text-xl font-serif font-bold group-hover:text-brand-accent transition-colors">
                {c.title}
              </h3>
              <p className="text-xs text-stone-300 line-clamp-2">{c.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
