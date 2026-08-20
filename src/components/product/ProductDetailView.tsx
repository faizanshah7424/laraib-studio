'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PublicProduct, PublicProductVariant } from '@/types';
import { ProductGallery } from './ProductGallery';
import { PriceDisplay } from '@/components/common/PriceDisplay';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getWhatsAppUrl, cn, formatPKR } from '@/lib/utils';
import { KARACHI_DELIVERY_FEE, RETURN_POLICY_DAYS } from '@/lib/constants';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { MessageCircle, ShoppingBag, Truck, RotateCcw, Check, AlertCircle, ShieldCheck, Heart } from 'lucide-react';

export interface ProductDetailViewProps {
  product: PublicProduct;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.variants.length === 1 ? product.variants[0].size : ''
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product.variants.length === 1 ? product.variants[0].color || '' : ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState<boolean>(false);

  // Group variants by size and color
  const availableSizes = Array.from(
    new Set(product.variants.map((v) => v.size).filter(Boolean))
  );

  const availableColors = Array.from(
    new Set(
      product.variants
        .map((v) => v.color)
        .filter((c): c is string => typeof c === 'string' && c.trim() !== '')
    )
  );

  // Find matching variant if size/color selected
  const activeVariant = product.variants.find((v) => {
    const sizeMatch = !selectedSize || v.size === selectedSize;
    const colorMatch = !selectedColor || v.color === selectedColor;
    return sizeMatch && colorMatch;
  });

  const isStockAvailable =
    product.variants.length > 0
      ? product.variants.some((v) => v.stockQuantity > 0)
      : true;

  const handleVariantSelect = (size: string, color?: string) => {
    setSelectedSize(size);
    if (color) setSelectedColor(color);
    setValidationError(null);
  };

  const validateSelection = (): boolean => {
    if (product.variants.length > 0 && !selectedSize) {
      setValidationError('Please select a size before proceeding.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleAddToCart = () => {
    if (!validateSelection()) return;

    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 3000);
  };

  // Generate WhatsApp inquiry URL with pre-filled details
  const buildWhatsAppMessage = (): string => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://laraibstudio.pk/products/${product.slug}`;
    const variantInfo = [
      selectedSize ? `Size: ${selectedSize}` : null,
      selectedColor ? `Color: ${selectedColor}` : null,
    ]
      .filter(Boolean)
      .join(', ');

    return `Hi Laraib Studio! 👋
I would like to inquire about this product:

📦 *Product:* ${product.name}
${variantInfo ? `📏 *Details:* ${variantInfo}\n` : ''}💰 *Price:* ${formatPKR(product.salePrice || product.retailPrice)}
🔗 *URL:* ${pageUrl}

Is this available for delivery in Karachi?`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
      {/* Left Column: Image Gallery (7 Cols) */}
      <div className="lg:col-span-7">
        <ProductGallery images={product.images} productName={product.name} />
      </div>

      {/* Right Column: Product Info & Actions (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Brand & Badges */}
        <div className="space-y-2 border-b border-stone-200 pb-4">
          <div className="flex items-center justify-between">
            {product.brand ? (
              <Link
                href={`/brands/${product.brand.slug}`}
                className="text-xs uppercase tracking-widest text-brand-accent font-bold hover:underline"
              >
                {product.brand.name}
              </Link>
            ) : (
              <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold">
                Laraib Studio Exclusive
              </span>
            )}

            <div className="flex items-center gap-1.5">
              {product.isNewArrival && <Badge variant="new">New In</Badge>}
              {product.salePrice && <Badge variant="sale">Sale</Badge>}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="pt-2">
            <PriceDisplay
              retailPrice={product.retailPrice}
              salePrice={product.salePrice}
              size="xl"
            />
          </div>
        </div>

        {/* Fabric & Availability Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-3 rounded-xs border border-stone-200/80">
          <div>
            <span className="text-stone-400 font-medium block">Fabric / Material:</span>
            <span className="font-semibold text-stone-800">
              {product.material || 'Premium Textile'}
            </span>
          </div>
          <div>
            <span className="text-stone-400 font-medium block">Availability:</span>
            <span
              className={cn(
                'font-semibold',
                isStockAvailable ? 'text-emerald-700' : 'text-red-600'
              )}
            >
              {isStockAvailable ? 'In Stock (Karachi Dispatch)' : 'Out of Stock'}
            </span>
          </div>
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-3 rounded-xs">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Variant Selectors (Size) */}
        {availableSizes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-900 uppercase tracking-wider">
                Select Size <span className="text-red-500">*</span>
              </label>
              {selectedSize && (
                <span className="text-stone-500 font-medium">Selected: {selectedSize}</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {availableSizes.map((size) => {
                const variantForSize = product.variants.find((v) => v.size === size);
                const isOutOfStock =
                  variantForSize && variantForSize.stockQuantity <= 0;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleVariantSelect(size)}
                    disabled={isOutOfStock}
                    className={cn(
                      'px-3.5 py-2 text-xs font-semibold border rounded-xs transition-all relative',
                      isOutOfStock
                        ? 'border-stone-200 text-stone-300 line-through bg-stone-50 cursor-not-allowed'
                        : isSelected
                        ? 'border-brand-dark bg-brand-dark text-white shadow-xs'
                        : 'border-stone-300 bg-white text-stone-800 hover:border-brand-dark hover:bg-stone-50'
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Variant Selectors (Color if multiple) */}
        {availableColors.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
              Color Option
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {availableColors.map((colorName) => {
                const colorObj = product.variants.find((v) => v.color === colorName);
                const isSelected = selectedColor === colorName;

                return (
                  <button
                    key={colorName}
                    type="button"
                    onClick={() => setSelectedColor(colorName)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-medium border rounded-xs flex items-center gap-2 transition-all',
                      isSelected
                        ? 'border-brand-dark bg-stone-900 text-white'
                        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                    )}
                  >
                    {colorObj?.colorHex && (
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: colorObj.colorHex }}
                      />
                    )}
                    <span>{colorName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
            Quantity
          </label>
          <div className="flex items-center w-32 border border-stone-300 rounded-xs bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 py-1.5 text-stone-600 font-bold hover:bg-stone-100 transition-colors"
            >
              -
            </button>
            <span className="flex-1 text-center text-xs font-semibold text-stone-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 py-1.5 text-stone-600 font-bold hover:bg-stone-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              className="flex-1 flex items-center justify-center gap-2"
              size="lg"
              onClick={handleAddToCart}
              disabled={!isStockAvailable}
            >
              <ShoppingBag className="h-5 w-5" />
              <span>{addedToCartSuccess ? 'Added to Bag!' : 'Add to Bag'}</span>
            </Button>

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              className={cn(
                'p-3.5 rounded-xs border transition-all flex items-center justify-center',
                isInWishlist(product.id)
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:border-red-600 hover:text-red-600'
              )}
            >
              <Heart className={cn('h-5 w-5', isInWishlist(product.id) && 'fill-current')} />
            </button>
          </div>

          {/* Direct WhatsApp Fast Inquiry Button */}
          <a
            href={getWhatsAppUrl(buildWhatsAppMessage())}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!validateSelection()) {
                e.preventDefault();
              }
            }}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 bg-brand-whatsapp hover:bg-emerald-700 text-white font-semibold text-sm rounded-xs transition-all shadow-luxury hover:shadow-luxury-hover"
          >
            <MessageCircle className="h-5 w-5" />
            <span>Inquire on WhatsApp (Fast Reply)</span>
          </a>
        </div>

        {/* Value Proposition Badges (Strictly Karachi PKR 200 & Return Policy) */}
        <div className="border-t border-stone-200 pt-5 space-y-3">
          <div className="flex items-start gap-3 text-xs text-stone-700">
            <Truck className="h-4 w-4 text-brand-dark flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900 block">
                Flat PKR {KARACHI_DELIVERY_FEE} Delivery Across Karachi
              </span>
              <span className="text-stone-500">
                Doorstep cash on delivery or bank transfer within 24-48 hours.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-stone-700">
            <RotateCcw className="h-4 w-4 text-brand-dark flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900 block">
                {RETURN_POLICY_DAYS}-Day Direct WhatsApp Return Policy
              </span>
              <span className="text-stone-500">
                Contact our customer desk on WhatsApp within {RETURN_POLICY_DAYS} days of receiving your drop.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-stone-700">
            <ShieldCheck className="h-4 w-4 text-brand-dark flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-900 block">
                100% Authentic Pakistani Designer Drops
              </span>
              <span className="text-stone-500">
                Directly curated from premium franchise collections.
              </span>
            </div>
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="border-t border-stone-200 pt-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Product Description
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
