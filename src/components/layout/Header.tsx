'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { STORE_NAME, NAV_LINKS } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { MobileNav } from './MobileNav';
import { ShoppingBag, Search, Menu, MessageCircle, Heart, User } from 'lucide-react';

export interface HeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount,
  onOpenCart,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { isLoggedIn } = useCustomerAuth();

  const count = cartItemCount !== undefined ? cartItemCount : itemCount;
  const handleCartClick = onOpenCart || openCart;

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-header border-b border-stone-200/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left: Mobile Menu Trigger + Desktop Nav */}
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 -ml-2 text-stone-700 hover:text-brand-dark lg:hidden rounded-sm hover:bg-stone-100"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>

              <nav className="hidden lg:flex items-center gap-7">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs uppercase tracking-widest font-medium text-stone-700 hover:text-brand-dark transition-colors relative py-1"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="ml-1 text-[9px] uppercase font-bold bg-red-600 text-white px-1.5 py-0.2 rounded-xs">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Brand Logo */}
            <div className="flex-1 lg:flex-initial text-center lg:text-left">
              <Link href="/" className="inline-block">
                <span className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-brand-dark hover:text-brand-accent transition-colors">
                  {STORE_NAME}
                </span>
                <span className="block text-[9px] uppercase tracking-[0.25em] text-stone-400 font-sans text-center">
                  Karachi
                </span>
              </Link>
            </div>

            {/* Right: Actions (Search, Account, Wishlist, WhatsApp, Cart) */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* WhatsApp Quick Link (Desktop) */}
              <a
                href={getWhatsAppUrl('Hi Laraib Studio, I am contacting you from the website.')}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp Support"
                className="hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-brand-whatsapp transition-colors px-2 py-1.5 rounded-sm hover:bg-stone-100"
              >
                <MessageCircle className="h-4 w-4 text-brand-whatsapp" />
                <span>WhatsApp</span>
              </a>

              {/* Search Trigger */}
              <Link
                href="/search"
                className="p-2 text-stone-700 hover:text-brand-dark hover:bg-stone-100 rounded-full transition-colors"
                title="Search catalog"
              >
                <Search className="h-5 w-5" />
              </Link>

              {/* Account Link */}
              <Link
                href={isLoggedIn ? '/account' : '/account/login'}
                className="p-2 text-stone-700 hover:text-brand-dark hover:bg-stone-100 rounded-full transition-colors"
                title={isLoggedIn ? 'My Account' : 'Sign In'}
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Wishlist Link with Badge */}
              <Link
                href="/account/wishlist"
                className="relative p-2 text-stone-700 hover:text-red-600 hover:bg-stone-100 rounded-full transition-colors"
                title="My Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 text-[10px] font-bold text-white bg-red-600 rounded-full px-1">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={handleCartClick}
                className="relative p-2 text-stone-700 hover:text-brand-dark hover:bg-stone-100 rounded-full transition-colors"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {count > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 text-[10px] font-bold text-white bg-brand-dark rounded-full px-1">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};
