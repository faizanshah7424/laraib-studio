import React from 'react';
import { getWhatsAppUrl } from '@/lib/utils';
import { Truck, MessageCircle } from 'lucide-react';
import { KARACHI_DELIVERY_FEE } from '@/lib/constants';

export interface AnnouncementBarProps {
  customText?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ customText }) => {
  return (
    <div className="bg-brand-dark text-white text-[11px] font-medium tracking-wider uppercase py-2 px-4 border-b border-stone-800">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        {/* Left / Center announcement */}
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-brand-accent shrink-0" />
          <span>
            {customText || `Karachi Delivery Only: Flat PKR ${KARACHI_DELIVERY_FEE} Delivery Across Karachi`}
          </span>
        </div>

        {/* Right WhatsApp Support Callout */}
        <div className="flex items-center gap-4 text-stone-300">
          <span className="hidden md:inline text-stone-400">|</span>
          <span className="hidden md:inline">3-Day Return & Exchange via WhatsApp</span>
          <a
            href={getWhatsAppUrl('Hi Laraib Studio, I need customer support.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-accent hover:text-white transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5 text-brand-whatsapp" />
            <span className="font-semibold lowercase">Order / Support on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
