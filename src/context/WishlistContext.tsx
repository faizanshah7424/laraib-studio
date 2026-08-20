'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PublicProduct } from '@/types';

interface WishlistContextType {
  wishlist: PublicProduct[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: PublicProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'laraib_studio_wishlist_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<PublicProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial wishlist (from API if logged in, or localStorage if guest)
  const loadWishlist = async () => {
    try {
      const res = await fetch('/api/customer/wishlist');
      if (res.ok) {
        const data = await res.json();
        if (data.wishlist && Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist);
          setIsLoaded(true);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load wishlist from API:', err);
    }

    // Fallback to localStorage for guest
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load guest wishlist:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const isInWishlist = (productId: string): boolean => {
    return wishlist.some((item) => item.id === productId);
  };

  const toggleWishlist = async (product: PublicProduct) => {
    const exists = isInWishlist(product.id);
    let updated: PublicProduct[];

    if (exists) {
      updated = wishlist.filter((item) => item.id !== product.id);
    } else {
      updated = [product, ...wishlist];
    }

    setWishlist(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    // Sync with backend API
    try {
      if (exists) {
        await fetch(`/api/customer/wishlist?productId=${product.id}`, {
          method: 'DELETE',
        });
      } else {
        await fetch('/api/customer/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });
      }
    } catch (err) {
      console.error('Error syncing wishlist with server:', err);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const updated = wishlist.filter((item) => item.id !== productId);
    setWishlist(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));

    try {
      await fetch(`/api/customer/wishlist?productId=${productId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error removing from wishlist on server:', err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        itemCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
