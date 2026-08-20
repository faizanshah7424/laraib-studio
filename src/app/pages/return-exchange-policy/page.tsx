import React from 'react';
import { Metadata } from 'next';
import { STORE_NAME, RETURN_POLICY_DAYS } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { RotateCcw, MessageCircle, ShieldCheck, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Return & Exchange Policy',
  description: `Official ${RETURN_POLICY_DAYS}-Day WhatsApp Return & Exchange Policy at ${STORE_NAME}.`,
};

export default function ReturnExchangePolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-8">
      <div className="border-b border-stone-200 pb-4 text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand-accent">
          <RotateCcw className="h-4 w-4" />
          <span>Customer Assurance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
          3-Day Return & Exchange Policy
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto">
          We want you to love your Pakistani fashion drops. Here is how our simple WhatsApp return and exchange process works.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-sm border border-stone-200 space-y-6 shadow-2xs text-xs sm:text-sm text-stone-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-brand-whatsapp" />
            1. Contact Support via WhatsApp Within {RETURN_POLICY_DAYS} Days
          </h2>
          <p>
            If there is an issue with your delivered order (e.g. incorrect size, defect, or wrong item sent), you must notify the <strong>Laraib Studio Customer Desk on WhatsApp within 3 calendar days</strong> of receiving your parcel.
          </p>
        </section>

        <section className="space-y-2 border-t border-stone-200 pt-5">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-brand-dark" />
            2. Review & Resolution Process
          </h2>
          <p>
            Our team will ask for photos or videos of the item and tag for verification. Each request is evaluated individually. Once reviewed, our support team will provide exact return or exchange instructions via WhatsApp.
          </p>
        </section>

        <section className="space-y-2 border-t border-stone-200 pt-5">
          <h2 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            3. Eligibility Guidelines
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>Products must be unworn, unwashed, and in their original packaging with tags attached.</li>
            <li>Unstitched items must not be cut or altered in any way.</li>
            <li>Return or exchange requests submitted after 3 days of delivery cannot be processed.</li>
            <li>All return logistics and exchanges are coordinated directly through our official WhatsApp hotline.</li>
          </ul>
        </section>

        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-stone-900">Need to initiate a return or exchange?</p>
            <p className="text-xs text-stone-500">Have your order number ready and message us on WhatsApp.</p>
          </div>
          <a
            href={getWhatsAppUrl('Hi Laraib Studio, I would like to inquire about a return/exchange for my order.')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="whatsapp" size="lg" leftIcon={<MessageCircle className="h-5 w-5" />}>
              Contact WhatsApp Support
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
