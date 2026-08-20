import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatPKR, getWhatsAppUrl } from '@/lib/utils';
import { STORE_NAME, KARACHI_DELIVERY_FEE, RETURN_POLICY_DAYS } from '@/lib/constants';
import {
  CheckCircle2,
  MessageCircle,
  Truck,
  Building2,
  Package,
  Calendar,
  Phone,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SuccessPageProps {
  params: {
    orderNumber: string;
  };
}

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  return {
    title: `Order Confirmation ${params.orderNumber} | ${STORE_NAME}`,
    description: `Thank you for your order with ${STORE_NAME}. Order reference: ${params.orderNumber}.`,
  };
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { orderNumber } = params;

  // Query order from DB
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Fetch Bank settings if bank transfer
  let bankSettings = {
    bankName: 'Meezan Bank Ltd',
    bankAccountTitle: 'LARAIB STUDIO',
    bankAccountNumber: '01010101010101',
    bankIban: 'PK45MEZN0001010101010101',
  };

  if (order.paymentMethod === 'BANK_TRANSFER') {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ['bank_name', 'bank_account_title', 'bank_account_number', 'bank_iban'] },
      },
    });
    settings.forEach((s) => {
      if (s.key === 'bank_name') bankSettings.bankName = s.value;
      if (s.key === 'bank_account_title') bankSettings.bankAccountTitle = s.value;
      if (s.key === 'bank_account_number') bankSettings.bankAccountNumber = s.value;
      if (s.key === 'bank_iban') bankSettings.bankIban = s.value;
    });
  }

  // Build Useful WhatsApp Order Message
  const buildWhatsAppOrderText = (): string => {
    const itemized = order.items
      .map(
        (it) =>
          `• ${it.productName} (${it.size}${it.color ? ` - ${it.color}` : ''}) × ${
            it.quantity
          } = ${formatPKR(it.totalPrice)}`
      )
      .join('\n');

    return `Hi ${STORE_NAME}! 👋
I have placed an order on your website. Here are my details:

📋 *Order Number:* ${order.orderNumber}
👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📍 *Karachi Delivery Area:* ${order.karachiArea}
🏠 *Address:* ${order.deliveryAddress}

📦 *Items Ordered:*
${itemized}

🚚 *Delivery Fee:* ${formatPKR(order.deliveryFee)}
💰 *Grand Total:* ${formatPKR(order.grandTotal)}
💳 *Payment Method:* ${order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash on Delivery (COD)'}
${order.paymentReference ? `🔢 *Bank Reference:* ${order.paymentReference}\n` : ''}
Please confirm my order dispatch. Thank you!`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      {/* Top Banner */}
      <div className="bg-emerald-50/80 border border-emerald-200 p-6 sm:p-8 rounded-sm text-center space-y-4 shadow-2xs">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
            Order Successfully Placed
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
            Thank You, {order.customerName}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
            Your order has been registered in our Karachi drop system. Reference Order #:{' '}
            <strong className="text-stone-900 font-mono">{order.orderNumber}</strong>
          </p>
        </div>

        {/* WhatsApp Send Confirmation CTA */}
        <div className="pt-2 flex justify-center">
          <a
            href={getWhatsAppUrl(buildWhatsAppOrderText())}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="whatsapp" size="lg" leftIcon={<MessageCircle className="h-5 w-5" />}>
              Send Order Details to WhatsApp Support
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Details */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-dark" />
            <span>Delivery Destination (Karachi)</span>
          </h3>

          <div className="space-y-2 text-xs text-stone-700">
            <div>
              <span className="text-stone-400 block font-medium">Recipient:</span>
              <span className="font-semibold text-stone-900">{order.customerName}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Contact Phone / WhatsApp:</span>
              <span className="font-semibold text-stone-900">{order.customerPhone}</span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Karachi Area & Address:</span>
              <span className="font-semibold text-stone-900">
                {order.karachiArea}, {order.deliveryAddress}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Delivery Status:</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase rounded-xs">
                {order.orderStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
          <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-brand-dark" />
            <span>Payment Method & Status</span>
          </h3>

          <div className="space-y-3 text-xs text-stone-700">
            <div className="flex justify-between items-center">
              <span className="text-stone-400 font-medium">Payment Method:</span>
              <span className="font-bold text-stone-900 uppercase">
                {order.paymentMethod === 'BANK_TRANSFER' ? 'Bank Account Transfer' : 'Cash on Delivery (COD)'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-400 font-medium">Payment Verification:</span>
              <span className="px-2 py-0.5 bg-stone-100 text-stone-800 border border-stone-300 text-[10px] font-bold uppercase rounded-xs">
                {order.paymentStatus}
              </span>
            </div>

            {/* Bank Transfer Instructions */}
            {order.paymentMethod === 'BANK_TRANSFER' && (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xs space-y-2 text-[11px]">
                <p className="font-bold text-emerald-900">Please Transfer Funds to:</p>
                <div className="font-mono text-stone-800 space-y-0.5">
                  <p>Bank: {bankSettings.bankName}</p>
                  <p>Title: {bankSettings.bankAccountTitle}</p>
                  <p>Account #: {bankSettings.bankAccountNumber}</p>
                  <p>IBAN: {bankSettings.bankIban}</p>
                </div>
                {order.paymentReference && (
                  <p className="text-stone-600 pt-1">
                    Submitted Reference #: <strong>{order.paymentReference}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Order Breakdown */}
      <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-4 shadow-2xs">
        <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-3 flex items-center gap-2">
          <Package className="h-4 w-4 text-brand-dark" />
          <span>Itemized Summary</span>
        </h3>

        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 first:pt-0 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-stone-900">{item.productName}</p>
                <span className="text-stone-500">
                  Size: <strong>{item.size}</strong> {item.color ? `| Color: ${item.color}` : ''} ×{' '}
                  {item.quantity}
                </span>
              </div>
              <span className="font-bold text-stone-900">{formatPKR(item.totalPrice)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-stone-200 pt-4 space-y-2 text-xs text-stone-700 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-stone-900">{formatPKR(order.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Karachi Delivery Fee</span>
            <span className="font-semibold text-stone-900">{formatPKR(order.deliveryFee)}</span>
          </div>

          <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-200">
            <span>Grand Total</span>
            <span className="text-brand-dark">{formatPKR(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link href="/collections">
          <Button variant="outline" size="lg">
            Continue Shopping Collections
          </Button>
        </Link>
      </div>
    </div>
  );
}
