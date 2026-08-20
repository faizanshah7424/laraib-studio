'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { formatPKR } from '@/lib/utils';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    grandTotal,
    itemCount,
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-brand-dark">Your Shopping Bag is Empty</h1>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            You haven't added any Pakistani pret or unstitched drops to your bag yet.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/collections/new-in">
            <Button variant="primary" size="lg">
              Explore Today's New Drop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div className="border-b border-stone-200 pb-4 flex items-baseline justify-between">
        <h1 className="text-3xl font-serif font-bold text-stone-900">
          Shopping Bag ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-stone-500 hover:text-red-600 underline font-medium"
        >
          Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Item List (8 cols) */}
        <div className="lg:col-span-8 space-y-4 divide-y divide-stone-200">
          {cart.map((item) => (
            <div key={item.id} className="pt-4 first:pt-0 flex gap-4 sm:gap-6 items-start">
              <div className="relative w-24 sm:w-28 aspect-fashion flex-shrink-0 bg-stone-100 rounded-xs overflow-hidden border border-stone-200">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif font-semibold text-stone-900 hover:text-brand-accent transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      <span>Size: <strong className="text-stone-800">{item.size}</strong></span>
                      {item.color && (
                        <>
                          <span>•</span>
                          <span>Color: <strong className="text-stone-800">{item.color}</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="font-bold text-stone-900 text-sm sm:text-base">
                    {formatPKR(item.totalPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div className="flex items-center border border-stone-300 rounded-xs bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-xs font-semibold text-stone-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 font-medium transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-sm border border-stone-200 h-fit space-y-6 shadow-2xs">
          <h2 className="font-serif font-bold text-lg text-stone-900 border-b border-stone-200 pb-3">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs text-stone-700">
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

            <div className="flex justify-between text-base font-bold text-stone-900 pt-3 border-t border-stone-200">
              <span>Grand Total</span>
              <span className="text-brand-dark">{formatPKR(grandTotal)}</span>
            </div>
          </div>

          <Link href="/checkout" className="block">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2" size="lg">
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <div className="space-y-2 pt-2 border-t border-stone-200 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Cash on Delivery or Bank Transfer</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-brand-dark shrink-0" />
              <span>3-Day Direct WhatsApp Return Policy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
