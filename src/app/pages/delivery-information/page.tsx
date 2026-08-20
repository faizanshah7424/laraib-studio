import React from 'react';
import { Metadata } from 'next';
import { STORE_NAME, KARACHI_DELIVERY_FEE, POPULAR_KARACHI_AREAS } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Truck, MapPin, CreditCard, MessageCircle, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Karachi Delivery Information & Rates',
  description: `Find details about our flat PKR ${KARACHI_DELIVERY_FEE} delivery service across Karachi at ${STORE_NAME}.`,
};

export default function DeliveryInformationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider">
          <Truck className="h-3.5 w-3.5 text-brand-whatsapp" />
          <span>Karachi Service Only</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark">
          Karachi Delivery Policy
        </h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto">
          Fast, reliable doorstep delivery to all areas of Karachi for a flat rate of PKR {KARACHI_DELIVERY_FEE}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm space-y-3">
          <div className="flex items-center gap-3 text-brand-dark">
            <Truck className="h-5 w-5 text-brand-accent" />
            <h3 className="font-serif text-base font-bold">Flat Delivery Rate</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            All Karachi orders have a fixed flat delivery charge of <strong>PKR {KARACHI_DELIVERY_FEE}</strong> automatically added at checkout. There are no surprise weight or distance markups within Karachi.
          </p>
        </div>

        <div className="bg-white p-6 border border-stone-200 shadow-sm rounded-sm space-y-3">
          <div className="flex items-center gap-3 text-brand-dark">
            <CreditCard className="h-5 w-5 text-brand-accent" />
            <h3 className="font-serif text-base font-bold">Payment Methods</h3>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            We offer <strong>Cash on Delivery (COD)</strong> upon arrival as well as <strong>Direct Online Bank Transfer</strong> for cashless convenience.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 border border-stone-200 shadow-sm rounded-sm space-y-4">
        <h2 className="text-lg font-serif font-bold text-brand-dark flex items-center gap-2">
          <MapPin className="h-5 w-5 text-brand-accent" />
          <span>Covered Karachi Localities</span>
        </h2>
        <p className="text-xs text-stone-600">
          Our courier network delivers across all Karachi zones including:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs text-stone-700">
          {POPULAR_KARACHI_AREAS.slice(0, 18).map((area) => (
            <div key={area} className="p-2 bg-stone-50 border border-stone-200/70 rounded-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent shrink-0" />
              <span>{area}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 bg-amber-50 border border-amber-200 rounded-sm flex items-start gap-3.5 text-xs text-amber-900">
        <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Notice for Non-Karachi Customers:</p>
          <p>
            Version 1 fulfillment is strictly limited to <strong>Karachi addresses</strong>. Orders with delivery addresses outside Karachi cannot be processed at this time.
          </p>
        </div>
      </div>
    </div>
  );
}
