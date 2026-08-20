'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, PublicProduct } from '@/types';
import { KARACHI_DELIVERY_FEE } from '@/lib/constants';

interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (
    product: PublicProduct,
    size: string,
    color?: string,
    quantity?: number
  ) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'laraib_studio_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
      } catch (err) {
        console.error('Failed to save cart to localStorage:', err);
      }
    }
  }, [cart, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addToCart = (
    product: PublicProduct,
    size: string,
    color?: string,
    quantity = 1
  ) => {
    // Find matching variant
    const variant = product.variants.find(
      (v) => v.size === size && (!color || v.color === color)
    ) || product.variants[0];

    const variantId = variant?.id || 'default-variant';
    const itemId = `${product.id}-${size}-${color || 'default'}`;

    const effectiveUnitPrice =
      typeof product.salePrice === 'number' && product.salePrice > 0
        ? product.salePrice
        : product.retailPrice;

    const primaryImage =
      product.images.find((i) => i.isThumbnail)?.url ||
      product.images[0]?.url ||
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800';

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((item) => item.id === itemId);
      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: newQty * effectiveUnitPrice,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          variantId,
          name: product.name,
          slug: product.slug,
          image: primaryImage,
          size,
          color,
          unitPrice: effectiveUnitPrice,
          quantity,
          totalPrice: effectiveUnitPrice * quantity,
        };
        return [...prevCart, newItem];
      }
    });

    setIsOpen(true); // Auto open cart drawer on add
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            quantity,
            totalPrice: item.unitPrice * quantity,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = cart.length > 0 ? KARACHI_DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        grandTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
