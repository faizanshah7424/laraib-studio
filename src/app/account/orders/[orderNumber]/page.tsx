'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { OrderStatusTracker } from '@/components/orders/OrderStatusTracker';
import { Button } from '@/components/ui/Button';
import { formatPKR, getWhatsAppUrl } from '@/lib/utils';
import { STORE_NAME } from '@/lib/constants';
import {
  ArrowLeft,
  Package,
  MapPin,
  Building2,
  MessageCircle,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface OrderDetailPageProps {
  params: {
    orderNumber: string;
  };
}

export default function CustomerOrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderNumber } = params;
  const router = useRouter();
  const { isLoggedIn, isLoading } = useCustomerAuth();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/account/login');
    }
  }, [isLoading, isLoggedIn, router]);

  useEffect(() => {
    async function loadOrder() {
      if (isLoggedIn) {
        try {
          const res = await fetch(`/api/customer/orders/${orderNumber}`);
          const data = await res.json();

          if (!res.ok || data.error) {
            throw new Error(data.error || 'Failed to load order details');
          }

          setOrder(data.order);
        } catch (err: any) {
          setErrorMsg(err.message || 'Access denied or order not found');
        } finally {
          setLoading(false);
        }
      }
    }
    loadOrder();
  }, [isLoggedIn, orderNumber]);

  if (isLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-500 font-serif">
        Loading order details...
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="flex items-center justify-center text-red-600">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Access Restricted</h1>
        <p className="text-xs text-stone-500">{errorMsg || 'Order not found or belongs to another customer.'}</p>
        <Link href="/account/orders">
          <Button variant="outline">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  const buildWhatsAppText = (): string => {
    return `Hi ${STORE_NAME}! 👋
I am inquiring about my Order #${order.orderNumber}.

Current Order Status: *${order.orderStatus}*
Payment Method: *${order.paymentMethod}*

Could you please provide a delivery update?`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/account/orders"
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Order Details
            </span>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
              Order #{order.orderNumber}
            </h1>
          </div>
        </div>

        <a
          href={getWhatsAppUrl(buildWhatsAppText())}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="whatsapp" size="sm" leftIcon={<MessageCircle className="h-4 w-4" />}>
            WhatsApp Support
          </Button>
        </a>
      </div>

      {/* Visual Progress Bar */}
      <OrderStatusTracker status={order.orderStatus} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Destination */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 space-y-3 shadow-2xs">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-dark" />
            <span>Delivery Destination (Karachi)</span>
          </h3>

          <div className="space-y-1.5 text-xs text-stone-700">
            <div>
              <span className="text-stone-400 block font-medium">Customer Name:</span>
              <span className="font-semibold text-stone-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Phone Number:</span>
              <span className="font-semibold text-stone-900">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Karachi Area & Address:</span>
              <span className="font-semibold text-stone-900">
                {order.karachiArea}, {order.deliveryAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white p-5 rounded-sm border border-stone-200 space-y-3 shadow-2xs">
          <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand-dark" />
            <span>Payment Summary</span>
          </h3>

          <div className="space-y-2 text-xs text-stone-700">
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Payment Method:</span>
              <span className="font-bold text-stone-900 uppercase">
                {order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Account Transfer' : 'Cash on Delivery'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-400 font-medium">Payment Status:</span>
              <span className="px-2 py-0.5 bg-stone-100 border text-[10px] font-bold uppercase rounded-xs">
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentReference && (
              <div className="bg-amber-50 p-2 border border-amber-200 rounded-xs">
                <span className="text-[10px] text-amber-800 font-bold block">Submitted Reference:</span>
                <span className="font-mono text-stone-900">{order.paymentReference}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Order Table */}
      <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
        <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-brand-dark" />
          <span>Itemized Products</span>
        </h3>

        <div className="divide-y divide-stone-100">
          {order.items?.map((it: any) => (
            <div key={it.id} className="py-3 first:pt-0 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-stone-900">{it.productName}</p>
                <span className="text-stone-500">
                  Size: <strong>{it.size}</strong> {it.color ? `| Color: ${it.color}` : ''} ×{' '}
                  {it.quantity}
                </span>
              </div>
              <span className="font-bold text-stone-900">{formatPKR(it.totalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-4 space-y-1.5 text-xs text-stone-700 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-semibold text-stone-900">{formatPKR(order.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Karachi Delivery Fee:</span>
            <span className="font-semibold text-stone-900">{formatPKR(order.deliveryFee)}</span>
          </div>

          <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
            <span>Grand Total:</span>
            <span className="text-brand-dark">{formatPKR(order.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
