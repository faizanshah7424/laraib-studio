'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PublicProduct } from '@/types';
import { Badge } from './Badge';
import { PriceDisplay } from '../common/PriceDisplay';
import { getWhatsAppUrl, cn } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { MessageCircle, Heart } from 'lucide-react';

export interface ProductCardProps {
  product: PublicProduct;
  className?: string;
  onQuickAdd?: (product: PublicProduct, size: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  className,
  onQuickAdd,
}) => {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const isLiked = isInWishlist(product.id);

  const primaryImage =
    product.images.find((img) => img.isThumbnail) ||
    product.images[0] || {
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      altText: product.name,
    };

  const secondaryImage = product.images.length > 1 ? product.images[1] : null;

  const hasSale =
    typeof product.salePrice === 'number' &&
    product.salePrice > 0 &&
    product.salePrice < product.retailPrice;

  const whatsAppMessage = `Hi Laraib Studio, I am interested in "${product.name}" (Ref: ${product.slug}). Is this available?`;

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-white border border-stone-200/80 transition-all duration-300 hover:shadow-luxury-hover hover:border-stone-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3:4 Aspect Ratio Image Container */}
      <div className="relative w-full aspect-fashion overflow-hidden bg-stone-100">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          {/* Primary Image */}
          <div
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              secondaryImage && isHovered ? 'opacity-0' : 'opacity-100'
            )}
          >
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

          {/* Secondary Image on Hover */}
          {secondaryImage && (
            <div
              className={cn(
                'absolute inset-0 transition-opacity duration-500',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Image
                src={secondaryImage.url}
                alt={secondaryImage.altText || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          )}
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isNewArrival && (
            <Badge variant="new" size="sm">
              New In
            </Badge>
          )}
          {hasSale && (
            <Badge variant="sale" size="sm">
              Sale
            </Badge>
          )}
        </div>

        {/* Action Buttons Top Right: Wishlist & WhatsApp */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={cn(
              'p-2 rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95',
              isLiked
                ? 'bg-red-600 text-white'
                : 'bg-white/90 text-stone-700 hover:bg-red-50 hover:text-red-600'
            )}
          >
            <Heart className={cn('h-4 w-4', isLiked && 'fill-current')} />
          </button>

          <a
            href={getWhatsAppUrl(whatsAppMessage)}
            target="_blank"
            rel="noopener noreferrer"
            title="Inquire on WhatsApp"
            className="p-2 rounded-full bg-white/90 text-stone-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-brand-whatsapp hover:text-white hover:scale-110 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>

        {/* Quick Size Selection Overlay */}
        {product.variants && product.variants.length > 0 && (
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 p-3 bg-white/95 backdrop-blur-sm border-t border-stone-200 transition-all duration-300 z-10',
              isHovered
                ? 'translate-y-0 opacity-100'
                : 'translate-y-full opacity-0 pointer-events-none md:block'
            )}
          >
            <div className="text-[10px] uppercase font-semibold text-stone-500 mb-1.5 flex justify-between">
              <span>Quick Add Size</span>
              <span>Karachi PKR 200 Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedSize(v.size);
                    if (onQuickAdd) {
                      onQuickAdd(product, v.size);
                    } else {
                      addToCart(product, v.size);
                    }
                  }}
                  disabled={v.stockQuantity <= 0}
                  className={cn(
                    'text-xs px-2 py-1 border transition-all rounded-xs font-medium',
                    v.stockQuantity <= 0
                      ? 'border-stone-200 text-stone-300 line-through cursor-not-allowed bg-stone-50'
                      : selectedSize === v.size
                      ? 'border-brand-dark bg-brand-dark text-white'
                      : 'border-stone-300 bg-white text-stone-800 hover:border-brand-dark hover:bg-stone-50'
                  )}
                >
                  {v.size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Details Info */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div className="space-y-1">
          {product.brand && (
            <p className="text-[11px] uppercase tracking-widest text-stone-500 font-medium">
              {product.brand.name}
            </p>
          )}
          <Link
            href={`/products/${product.slug}`}
            className="block font-serif text-sm font-semibold text-stone-900 line-clamp-1 hover:text-brand-accent transition-colors"
          >
            {product.name}
          </Link>
          {product.material && (
            <p className="text-xs text-stone-500">{product.material}</p>
          )}
        </div>

        {/* Pricing */}
        <div className="pt-1 border-t border-stone-100 flex items-center justify-between">
          <PriceDisplay
            retailPrice={product.retailPrice}
            salePrice={product.salePrice}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};
