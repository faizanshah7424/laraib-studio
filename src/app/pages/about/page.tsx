import React from 'react';
import { Metadata } from 'next';
import { STORE_NAME, KARACHI_DELIVERY_FEE } from '@/lib/constants';
import { Sparkles, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Laraib Studio',
  description: `Discover the story and craftsmanship behind ${STORE_NAME}, Karachi's online fashion destination.`,
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-goldLight text-stone-900 border border-[#E8D9C0] rounded-full text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5 text-brand-accent" />
          <span>Our Brand Story</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark">
          About {STORE_NAME}
        </h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto">
          Bridging premium textile craftsmanship and accessible everyday retail for Karachi.
        </p>
      </div>

      <div className="bg-white p-8 border border-stone-200 shadow-sm rounded-sm space-y-6 text-sm text-stone-700 leading-relaxed">
        <h2 className="font-serif text-xl font-bold text-brand-dark">
          Curated Wholesale Fashion, Reimagined
        </h2>
        <p>
          <strong>{STORE_NAME}</strong> was founded with a singular mission: to bring the finest Pakistani unstitched and ready-to-wear collections directly to our customers at genuine, accessible prices.
        </p>
        <p>
          We source high-grade lawn, embroidered formals, silk dupattas, and classic men’s eastern apparel from premier wholesale textile networks. Every single drop is carefully cataloged and quality-inspected before reaching your wardrobe.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
          <div className="p-4 bg-brand-cream border border-stone-200 rounded-sm">
            <h4 className="font-serif font-bold text-brand-dark text-base">Daily Drops</h4>
            <p className="text-xs text-stone-500 mt-1">Fresh designs and seasonal edits added to our collection every single day.</p>
          </div>
          <div className="p-4 bg-brand-cream border border-stone-200 rounded-sm">
            <h4 className="font-serif font-bold text-brand-dark text-base">Karachi Focused</h4>
            <p className="text-xs text-stone-500 mt-1">Dedicated delivery fleet across Karachi with flat PKR {KARACHI_DELIVERY_FEE} shipping.</p>
          </div>
          <div className="p-4 bg-brand-cream border border-stone-200 rounded-sm">
            <h4 className="font-serif font-bold text-brand-dark text-base">WhatsApp Concierge</h4>
            <p className="text-xs text-stone-500 mt-1">Personalized sizing support and order assistance on WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
