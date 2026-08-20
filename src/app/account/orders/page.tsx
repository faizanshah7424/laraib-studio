'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Button } from '@/components/ui/Button';
import { formatPKR } from '@/lib/utils';
import { ArrowLeft, ShoppingBag, ChevronRight, Clock, Truck, CheckCircle2 } from 'lucide-react';

export default function CustomerOrdersListPage() {
  const router = useRouter();
  const { customer, isLoggedIn, isLoading } = useCustomerAuth();

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
        Loading orders history...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
        <Link
          href="/account"
          className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">
            My Order History
          </h1>
          <p className="text-xs text-stone-500">
            View status and track delivery of your Karachi orders.
          </p>
        </div>
      </div>

      {loadingOrders ? (
        <div className="py-12 text-center text-xs text-stone-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 border border-stone-200 text-center rounded-sm space-y-4">
          <ShoppingBag className="h-10 w-10 text-stone-400 mx-auto" />
          <div className="space-y-1">
            <p className="font-serif font-bold text-lg text-stone-800">
              You haven't placed any orders yet
            </p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Explore our latest Pakistani pret and unstitched luxury drops delivered across Karachi.
            </p>
          </div>
          <Link href="/collections/new-in">
            <Button variant="primary">Shop Today's Drop</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white p-5 rounded-sm border border-stone-200 shadow-2xs hover:border-stone-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-stone-900">
                      #{ord.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-stone-100 border text-stone-700">
                      {ord.orderStatus}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800">
                      {ord.paymentStatus}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    Placed on{' '}
                    {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-bold text-sm text-brand-dark">
                    {formatPKR(ord.grandTotal)}
                  </span>
                  <Link href={`/account/orders/${ord.orderNumber}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <span>View Order</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mini Item List */}
              <div className="text-xs text-stone-600 space-y-1">
                {ord.items?.map((it: any) => (
                  <div key={it.id} className="flex justify-between">
                    <span>
                      • {it.productName} ({it.size}{it.color ? ` - ${it.color}` : ''}) × {it.quantity}
                    </span>
                    <span className="font-medium text-stone-800">{formatPKR(it.totalPrice)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
