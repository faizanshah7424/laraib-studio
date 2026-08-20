'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { formatPKR } from '@/lib/utils';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function CustomerWishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Heart className="h-10 w-10 fill-current" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-stone-900">Your Wishlist is Empty</h1>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            Explore our curated Pakistani pret, unstitched lawn, and men's collection to save your favorite items.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/collections/new-in">
            <Button variant="primary">Explore Today's Drop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              My Saved Wishlist ({wishlist.length})
            </h1>
            <p className="text-xs text-stone-500">
              Save your favorite items for later or add them straight to your shopping bag.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {wishlist.map((product) => {
          const thumbnail =
            product.images.find((i) => i.isThumbnail)?.url ||
            product.images[0]?.url ||
            'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800';

          const defaultSize =
            product.variants.find((v) => v.stockQuantity > 0)?.size ||
            product.variants[0]?.size ||
            'Unstitched';

          return (
            <div
              key={product.id}
              className="bg-white border border-stone-200 rounded-xs overflow-hidden flex flex-col justify-between group shadow-2xs"
            >
              <div className="relative aspect-fashion w-full bg-stone-100 overflow-hidden">
                <Link href={`/products/${product.slug}`}>
                  <Image
                    src={thumbnail}
                    alt={product.name}
                    fill
                    sizes="300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-xs"
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  {product.brand && (
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                      {product.brand.name}
                    </span>
                  )}
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-serif text-xs font-semibold text-stone-900 line-clamp-1 hover:text-brand-accent transition-colors"
                  >
                    {product.name}
                  </Link>
                  <span className="font-bold text-xs text-brand-dark block">
                    {formatPKR(product.salePrice || product.retailPrice)}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  className="w-full flex items-center justify-center gap-1.5 text-xs"
                  onClick={() => {
                    addToCart(product, defaultSize);
                    removeFromWishlist(product.id);
                  }}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Move to Bag</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
