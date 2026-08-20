'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { formatPKR, cn } from '@/lib/utils';
import { KARACHI_DELIVERY_FEE } from '@/lib/constants';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    grandTotal,
    itemCount,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-dark" />
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Shopping Bag ({itemCount})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 divide-y divide-stone-100">
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-serif font-bold text-lg text-stone-800">
                  Your bag is currently empty
                </p>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Explore our latest Pakistani pret and unstitched drops delivered across Karachi.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={closeCart}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-dark hover:text-brand-accent transition-colors"
                >
                  <Link href="/collections/new-in">Explore Today's Drop</Link>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                {/* Thumbnail */}
                <div className="relative w-20 h-24 flex-shrink-0 bg-stone-100 rounded-xs overflow-hidden border border-stone-200">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeCart}
                      className="font-serif text-sm font-semibold text-stone-900 line-clamp-1 hover:text-brand-accent transition-colors"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1 text-stone-400 hover:text-red-600 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>Size: <strong className="text-stone-800">{item.size}</strong></span>
                    {item.color && (
                      <>
                        <span>•</span>
                        <span>Color: <strong className="text-stone-800">{item.color}</strong></span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-stone-200 rounded-xs bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-stone-500 hover:bg-stone-100 transition-colors"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-stone-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-stone-500 hover:bg-stone-100 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-semibold text-sm text-stone-900">
                      {formatPKR(item.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">{formatPKR(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Truck className="h-3.5 w-3.5 text-brand-dark" />
                  <span>Karachi Delivery Fee</span>
                </span>
                <span className="font-semibold text-stone-900">{formatPKR(deliveryFee)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Grand Total (PKR)</span>
                <span className="text-brand-dark">{formatPKR(grandTotal)}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Link href="/checkout" onClick={closeCart} className="block">
                <Button variant="primary" className="w-full flex items-center justify-center gap-2" size="lg">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <div className="flex justify-between items-center text-[11px] text-stone-500 px-1">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Karachi COD & Bank Transfer</span>
                </span>

                <button
                  onClick={clearCart}
                  className="text-stone-400 hover:text-red-600 underline font-medium"
                >
                  Clear Bag
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
