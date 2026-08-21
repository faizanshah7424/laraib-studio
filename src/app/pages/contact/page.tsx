import React from 'react';
import { Metadata } from 'next';
import {
  STORE_NAME,
  OFFICIAL_EMAIL,
  OFFICIAL_PHONE,
  OFFICIAL_WHATSAPP_DISPLAY,
  OFFICIAL_WHATSAPP_NUMBER,
  KARACHI_DELIVERY_FEE,
} from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { MessageCircle, MapPin, Clock, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Get in touch with ${STORE_NAME} on WhatsApp for orders, sizing support, and delivery inquiries in Karachi.`,
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold uppercase tracking-wider">
          <MessageCircle className="h-3.5 w-3.5 text-brand-whatsapp" />
          <span>WhatsApp Assistance</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-brand-dark">
          Contact {STORE_NAME}
        </h1>
        <p className="text-sm text-stone-500 max-w-xl mx-auto">
          We are ready to assist you with styling recommendations, product inquiries, and Karachi order tracking.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* WhatsApp Fast Contact Card */}
        <div className="bg-white p-8 border border-stone-200 shadow-sm rounded-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center justify-center text-brand-whatsapp">
              <MessageCircle className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-xl font-bold text-brand-dark">
              Instant WhatsApp Support
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our official WhatsApp concierge is the fastest way to get real-time stock confirmations, custom sizing advice, or submit exchange queries.
            </p>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-sm text-xs space-y-1 text-stone-700">
              <p><strong>Phone / WhatsApp:</strong> {OFFICIAL_WHATSAPP_DISPLAY}</p>
              <p><strong>Operating Hours:</strong> 10:00 AM – 10:00 PM (Mon – Sun)</p>
            </div>
          </div>

          <a
            href={getWhatsAppUrl('Hi Laraib Studio, I would like to contact your customer service.')}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="whatsapp"
              size="lg"
              className="w-full"
              leftIcon={<MessageCircle className="h-5 w-5" />}
            >
              Start WhatsApp Chat
            </Button>
          </a>
        </div>

        {/* Karachi Fulfillment & Service Info */}
        <div className="bg-white p-8 border border-stone-200 shadow-sm rounded-sm space-y-6">
          <h2 className="font-serif text-xl font-bold text-brand-dark border-b border-stone-100 pb-3">
            Service & Delivery Info
          </h2>

          <div className="space-y-4 text-xs text-stone-600">
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">Service Coverage</p>
                <p>Deliveries fulfilled exclusively across Karachi, Pakistan.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">Delivery Timeline</p>
                <p>Standard Karachi delivery: 24–48 working hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">Phone / WhatsApp</p>
                <p>{OFFICIAL_PHONE}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-stone-900">Email Inquiries</p>
                <p>
                  <a href={`mailto:${OFFICIAL_EMAIL}`} className="hover:underline text-stone-800">
                    {OFFICIAL_EMAIL}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
