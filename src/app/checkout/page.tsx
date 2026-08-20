'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { formatPKR, cn } from '@/lib/utils';
import { KARACHI_DELIVERY_FEE, POPULAR_KARACHI_AREAS } from '@/lib/constants';
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Building2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, deliveryFee, grandTotal, clearCart, closeCart } = useCart();

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [karachiArea, setKarachiArea] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('COD');
  const [paymentReference, setPaymentReference] = useState('');

  // Store Bank Details loaded from API
  const [bankInfo, setBankInfo] = useState({
    bankName: 'Meezan Bank Ltd',
    bankAccountTitle: 'LARAIB STUDIO',
    bankAccountNumber: '01010101010101',
    bankIban: 'PK45MEZN0001010101010101',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadBankSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.settings) {
          setBankInfo({
            bankName: data.settings.bank_name || 'Meezan Bank Ltd',
            bankAccountTitle: data.settings.bank_account_title || 'LARAIB STUDIO',
            bankAccountNumber: data.settings.bank_account_number || '01010101010101',
            bankIban: data.settings.bank_iban || 'PK45MEZN0001010101010101',
          });
        }
      } catch (err) {
        console.error('Failed to load bank settings:', err);
      }
    }
    loadBankSettings();
  }, []);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const finalArea = karachiArea === 'Other Karachi Area' ? customArea : karachiArea;

    if (!customerName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg('Active Karachi phone number is required.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setErrorMsg('Delivery address is required.');
      return;
    }
    if (!finalArea.trim()) {
      setErrorMsg('Please select or specify your Karachi area/locality.');
      return;
    }
    if (cart.length === 0) {
      setErrorMsg('Your shopping bag is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerWhatsapp: customerWhatsapp.trim() || customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        karachiArea: finalArea.trim(),
        city: 'Karachi',
        paymentMethod,
        customerNotes: customerNotes.trim() || undefined,
        paymentReference: paymentReference.trim() || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to place order.');
      }

      clearCart();
      closeCart();
      router.push(`/checkout/success/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while placing your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif font-bold text-brand-dark">
            Your Bag is Empty
          </h1>
          <p className="text-sm text-stone-500 max-w-sm mx-auto">
            Please add items to your bag before proceeding to checkout.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/collections/new-in">
            <Button variant="primary">Browse New Arrivals</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Checkout Title */}
      <div className="border-b border-stone-200 pb-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-accent">
          <Lock className="h-3.5 w-3.5" />
          <span>Encrypted Checkout (Karachi Exclusive)</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-stone-900 mt-1">
          Complete Your Order
        </h1>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xs">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Delivery & Payment Details (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: Customer & Delivery Info */}
          <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <Truck className="h-5 w-5 text-brand-dark" />
              <h2 className="font-serif font-bold text-base text-stone-900">
                1. Delivery Information (Karachi Only)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                placeholder="e.g. Fatima Ahmed"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />

              <Input
                label="Phone Number (for COD Delivery) *"
                placeholder="e.g. 0300 1234567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="WhatsApp Number (for Order Updates)"
                placeholder="Same as phone if left empty"
                value={customerWhatsapp}
                onChange={(e) => setCustomerWhatsapp(e.target.value)}
              />

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                  Karachi Area / Locality *
                </label>
                <select
                  value={karachiArea}
                  onChange={(e) => setKarachiArea(e.target.value)}
                  className="w-full text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xs p-2.5 focus:outline-none focus:border-stone-400"
                  required
                >
                  <option value="">Select your Karachi area...</option>
                  {POPULAR_KARACHI_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {karachiArea === 'Other Karachi Area' && (
              <Input
                label="Specify Custom Karachi Locality *"
                placeholder="e.g. Malir Cantt Sector 8, Scheme 33"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                required
              />
            )}

            <Textarea
              label="Complete Delivery Address *"
              placeholder="House/Apartment #, Street #, Block/Phase..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={2}
              required
            />

            <div className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xs text-xs text-stone-600">
              <Info className="h-4 w-4 text-brand-dark flex-shrink-0" />
              <span>
                Delivery City: <strong>Karachi (Fixed)</strong> | Delivery Fee: <strong>PKR {KARACHI_DELIVERY_FEE}</strong>
              </span>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <CreditCard className="h-5 w-5 text-brand-dark" />
              <h2 className="font-serif font-bold text-base text-stone-900">
                2. Select Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('COD')}
                className={cn(
                  'p-4 border-2 rounded-xs cursor-pointer transition-all space-y-2',
                  paymentMethod === 'COD'
                    ? 'border-brand-dark bg-stone-50 ring-1 ring-brand-dark'
                    : 'border-stone-200 hover:border-stone-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-brand-dark" />
                    Cash on Delivery
                  </span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                    className="text-brand-dark focus:ring-stone-400"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Pay cash at your doorstep when the delivery rider arrives.
                </p>
              </div>

              {/* Option B: Bank Transfer */}
              <div
                onClick={() => setPaymentMethod('BANK_TRANSFER')}
                className={cn(
                  'p-4 border-2 rounded-xs cursor-pointer transition-all space-y-2',
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-brand-dark bg-stone-50 ring-1 ring-brand-dark'
                    : 'border-stone-200 hover:border-stone-300'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-brand-dark" />
                    Bank Account Transfer
                  </span>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    className="text-brand-dark focus:ring-stone-400"
                  />
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  Transfer funds to Laraib Studio account via mobile app / ATM.
                </p>
              </div>
            </div>

            {/* Bank Transfer Instructions Box */}
            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Building2 className="h-4 w-4 text-emerald-700" />
                  <span>Laraib Studio Official Bank Account Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-stone-800 bg-white p-3 rounded-xs border border-emerald-100">
                  <div>
                    <span className="text-[10px] text-stone-400 font-sans block">Bank Name:</span>
                    <strong>{bankInfo.bankName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-sans block">Account Title:</span>
                    <strong>{bankInfo.bankAccountTitle}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-sans block">Account Number:</span>
                    <strong>{bankInfo.bankAccountNumber}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 font-sans block">IBAN Number:</span>
                    <strong>{bankInfo.bankIban}</strong>
                  </div>
                </div>

                <Input
                  label="Transaction Reference / Sender Name (Optional)"
                  placeholder="e.g. Ref #1049283 / Trx ID from Banking App"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  helperText="Your order will be verified by staff upon payment receipt."
                />
              </div>
            )}

            <Textarea
              label="Order Notes / Delivery Instructions (Optional)"
              placeholder="e.g. Call before arrival, leave at gate with security..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-sm border border-stone-200 space-y-6 shadow-2xs sticky top-24">
            <h2 className="font-serif font-bold text-base text-stone-900 border-b border-stone-200 pb-3">
              Order Items Summary ({cart.length})
            </h2>

            {/* Itemized Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 divide-y divide-stone-100">
              {cart.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 flex-shrink-0 bg-stone-100 rounded-2xs overflow-hidden border border-stone-200">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 line-clamp-1">{item.name}</p>
                      <span className="text-stone-500">
                        {item.size} × {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold text-stone-900">{formatPKR(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-stone-200 pt-4 space-y-2 text-xs text-stone-700">
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
                <span>Grand Total (PKR)</span>
                <span className="text-brand-dark">{formatPKR(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Placing Order...' : 'Confirm Order & Deliver'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="text-center pt-2 space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>3-Day Direct WhatsApp Support & Returns</span>
              </div>
              <p className="text-[10px] text-stone-400">
                Prices and stock are re-verified on server before order creation.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
