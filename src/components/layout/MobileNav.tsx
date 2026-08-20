'use client';

import React from 'react';
import Link from 'next/link';
import { NAV_LINKS, STORE_NAME, KARACHI_DELIVERY_FEE } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { useWishlist } from '@/context/WishlistContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { X, MessageCircle, Truck, Search, User, Heart, ShoppingBag, RotateCcw, ChevronRight } from 'lucide-react';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { itemCount: wishlistCount } = useWishlist();
  const { isLoggedIn, customer } = useCustomerAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-brand-cream border-r border-stone-200 shadow-2xl flex flex-col justify-between z-10 animate-fade-in">
        <div>
          {/* Header */}
          <div className="p-5 flex items-center justify-between border-b border-stone-200">
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-brand-dark">
                {STORE_NAME}
              </span>
              <p className="text-[10px] uppercase tracking-widest text-stone-500">
                {isLoggedIn ? `Logged in: ${customer?.name}` : 'Karachi Exclusive'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-brand-dark rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Account & Wishlist Mobile Bar */}
          <div className="p-3 bg-white border-b border-stone-200 grid grid-cols-3 gap-2 text-center text-xs">
            <Link
              href="/search"
              onClick={onClose}
              className="p-2 bg-stone-50 rounded-xs hover:bg-stone-100 flex flex-col items-center gap-1 font-medium text-stone-800"
            >
              <Search className="h-4 w-4 text-stone-600" />
              <span>Search</span>
            </Link>

            <Link
              href={isLoggedIn ? '/account' : '/account/login'}
              onClick={onClose}
              className="p-2 bg-stone-50 rounded-xs hover:bg-stone-100 flex flex-col items-center gap-1 font-medium text-stone-800"
            >
              <User className="h-4 w-4 text-stone-600" />
              <span>Account</span>
            </Link>

            <Link
              href="/account/wishlist"
              onClick={onClose}
              className="p-2 bg-stone-50 rounded-xs hover:bg-stone-100 flex flex-col items-center gap-1 font-medium text-stone-800 relative"
            >
              <Heart className="h-4 w-4 text-red-600 fill-current" />
              <span>Wishlist ({wishlistCount})</span>
            </Link>
          </div>

          {/* Main Navigation Links */}
          <nav className="p-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 text-sm font-medium text-stone-800 rounded-sm hover:bg-stone-100 hover:text-brand-dark transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={link.highlight ? 'font-semibold text-brand-dark' : ''}>
                    {link.label}
                  </span>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold bg-red-600 text-white px-1.5 py-0.5 rounded-sm">
                      {link.badge}
                    </span>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            ))}

            {isLoggedIn && (
              <Link
                href="/account/orders"
                onClick={onClose}
                className="flex items-center justify-between py-2.5 px-3 text-sm font-medium text-stone-800 rounded-sm hover:bg-stone-100 hover:text-brand-dark transition-colors border-t border-stone-200 mt-2 pt-3"
              >
                <span>My Orders</span>
                <ChevronRight className="h-4 w-4 text-stone-400" />
              </Link>
            )}

            <Link
              href="/pages/return-exchange-policy"
              onClick={onClose}
              className="flex items-center justify-between py-2.5 px-3 text-xs font-medium text-stone-600 rounded-sm hover:bg-stone-100 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>3-Day WhatsApp Return Policy</span>
              </span>
              <ChevronRight className="h-4 w-4 text-stone-400" />
            </Link>
          </nav>
        </div>

        {/* Footer info & WhatsApp button */}
        <div className="p-4 border-t border-stone-200 bg-white/70 space-y-3">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <Truck className="h-4 w-4 text-brand-accent shrink-0" />
            <span>Karachi Delivery: Flat PKR {KARACHI_DELIVERY_FEE}</span>
          </div>

          <a
            href={getWhatsAppUrl('Hi Laraib Studio, I want to inquire about products.')}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-brand-whatsapp text-white rounded-sm font-medium text-xs uppercase tracking-wider shadow-sm hover:bg-brand-whatsappDark transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Contact via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
