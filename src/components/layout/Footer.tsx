import React from 'react';
import Link from 'next/link';
import { STORE_NAME, KARACHI_DELIVERY_FEE, RETURN_POLICY_DAYS } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { MessageCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark text-white border-t border-stone-800 mt-20">
      {/* Brand Value Pillars */}
      <div className="border-b border-stone-800 py-8 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          {/* Sourcing & Quality */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-stone-900 border border-stone-800 rounded-sm text-brand-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-white">
                100% Authentic Quality
              </h4>
              <p className="text-xs text-stone-400">
                Curated daily from premium fashion brands.
              </p>
            </div>
          </div>

          {/* Karachi Flat Delivery */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-stone-900 border border-stone-800 rounded-sm text-brand-accent">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-white">
                Karachi Delivery: Flat PKR {KARACHI_DELIVERY_FEE}
              </h4>
              <p className="text-xs text-stone-400">
                Fast doorstep delivery across all Karachi areas.
              </p>
            </div>
          </div>

          {/* 3-Day WhatsApp Return Policy */}
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="p-3 bg-stone-900 border border-stone-800 rounded-sm text-brand-accent">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase font-bold tracking-wider text-white">
                {RETURN_POLICY_DAYS}-Day WhatsApp Return/Exchange
              </h4>
              <p className="text-xs text-stone-400">
                Direct customer assistance via official WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <span className="font-serif text-2xl font-bold tracking-tight text-white">
              {STORE_NAME}
            </span>
            <p className="text-xs text-stone-400 leading-relaxed">
              Karachi’s destination for everyday luxury, latest seasonal drops, and unstitched & pret fashion collections.
            </p>
            <div className="pt-2">
              <a
                href={getWhatsAppUrl('Hi Laraib Studio, I would like to make an inquiry.')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-brand-whatsapp text-white rounded-sm text-xs font-semibold hover:bg-brand-whatsappDark transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Customer Care</span>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Collections
            </h5>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/collections/new-in" className="hover:text-white transition-colors">
                  New In / Today's Drop
                </Link>
              </li>
              <li>
                <Link href="/collections/women" className="hover:text-white transition-colors">
                  Women's Fashion
                </Link>
              </li>
              <li>
                <Link href="/collections/men" className="hover:text-white transition-colors">
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link href="/collections/sale" className="hover:text-white transition-colors">
                  Clearance & Sales
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Customer Support
            </h5>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/pages/return-exchange-policy" className="hover:text-white transition-colors">
                  Return & Exchange Policy ({RETURN_POLICY_DAYS} Days)
                </Link>
              </li>
              <li>
                <Link href="/pages/delivery-information" className="hover:text-white transition-colors">
                  Karachi Delivery Terms (PKR {KARACHI_DELIVERY_FEE})
                </Link>
              </li>
              <li>
                <Link href="/order-tracking" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/pages/faqs" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Karachi Store Info */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Service Area
            </h5>
            <p className="text-xs text-stone-400 leading-relaxed">
              We currently accept and fulfill orders exclusively within <strong>Karachi, Pakistan</strong>.
            </p>
            <div className="p-3 bg-stone-900 border border-stone-800 rounded-sm text-xs text-stone-300 space-y-1">
              <p className="font-semibold text-white">Payment Options:</p>
              <p>• Cash on Delivery (COD)</p>
              <p>• Online Bank / Account Transfer</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Karachi, Pakistan</span>
            <Link href="/admin/login" className="hover:text-stone-300 transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
