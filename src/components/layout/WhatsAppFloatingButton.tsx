'use client';

import React from 'react';
import { getWhatsAppUrl } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

export interface WhatsAppFloatingButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppFloatingButton: React.FC<WhatsAppFloatingButtonProps> = ({
  phoneNumber,
  defaultMessage = 'Hi Laraib Studio, I would like to inquire about products and orders.',
}) => {
  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 flex items-center group">
      {/* Tooltip on hover */}
      <span className="hidden md:inline-block mr-3 px-3 py-1.5 bg-brand-dark text-white text-xs font-medium rounded-sm shadow-lg opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none">
        Need help? Chat on WhatsApp
      </span>

      {/* Floating Button */}
      <a
        href={getWhatsAppUrl(defaultMessage, phoneNumber)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Laraib Studio on WhatsApp"
        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-brand-whatsapp text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-brand-whatsappDark active:scale-95 animate-pulse-subtle focus:outline-none focus:ring-4 focus:ring-green-300"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 fill-white" />
      </a>
    </aside>
  );
};
