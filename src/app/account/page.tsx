'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { Button } from '@/components/ui/Button';
import { formatPKR } from '@/lib/utils';
import {
  User,
  ShoppingBag,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
  Truck,
  MapPin,
  Clock,
} from 'lucide-react';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { customer, isLoggedIn, isLoading, logout } = useCustomerAuth();
  const { itemCount: wishlistCount } = useWishlist();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/account/login');
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    async function loadOrders() {
      if (isLoggedIn) {
        try {
          const res = await fetch('/api/customer/orders');
          if (res.ok) {
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingOrders(false);
        }
      }
    }
    loadOrders();
  }, [isLoggedIn]);

  if (isLoading || !isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500 font-serif">
        Loading account portal...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Customer Dashboard
          </span>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Welcome back, {customer?.name}!
          </h1>
          <p className="text-xs text-stone-500 mt-1">{customer?.email}</p>
        </div>

        <button
          onClick={async () => {
            await logout();
            router.push('/');
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:border-red-300 hover:text-red-700 rounded-xs transition-colors w-fit"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/account/orders"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-3"
        >
          <div className="w-10 h-10 bg-brand-cream border border-stone-200 text-brand-dark rounded-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center justify-between">
              <span>My Orders ({orders.length})</span>
              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-brand-accent transition-colors" />
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Track status of your Karachi Cash on Delivery and Bank Transfer orders.
            </p>
          </div>
        </Link>

        <Link
          href="/account/wishlist"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-3"
        >
          <div className="w-10 h-10 bg-red-50 border border-red-200 text-red-700 rounded-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center justify-between">
              <span>My Wishlist ({wishlistCount})</span>
              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-red-700 transition-colors" />
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Saved Pakistani lawn, luxury pret, and men's kurtas.
            </p>
          </div>
        </Link>

        <Link
          href="/account/profile"
          className="group bg-white p-5 border border-stone-200 rounded-sm shadow-2xs hover:shadow-luxury-hover hover:border-stone-300 transition-all space-y-3"
        >
          <div className="w-10 h-10 bg-stone-100 border border-stone-200 text-stone-800 rounded-sm flex items-center justify-center group-hover:scale-105 transition-transform">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900 flex items-center justify-between">
              <span>Account Settings</span>
              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-stone-900 transition-colors" />
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Manage your saved Karachi address, phone, and WhatsApp contact details.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Recent Orders
          </h2>
          <Link href="/account/orders" className="text-xs font-bold text-brand-dark hover:underline">
            View All Orders
          </Link>
        </div>

        {loadingOrders ? (
          <p className="text-xs text-stone-400 py-4 text-center">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-stone-500 font-serif">No previous orders found.</p>
            <Link href="/collections/new-in">
              <Button size="sm" variant="outline">
                Browse New Drops
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {orders.slice(0, 3).map((ord) => (
              <div key={ord.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 font-mono">{ord.orderNumber}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-stone-100 border text-stone-700">
                      {ord.orderStatus}
                    </span>
                  </div>
                  <span className="text-stone-400 block text-[11px]">
                    {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-bold text-brand-dark">{formatPKR(ord.grandTotal)}</span>
                  <Link href={`/account/orders/${ord.orderNumber}`}>
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
