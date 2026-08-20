'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getWhatsAppUrl } from '@/lib/utils';
import { AlertTriangle, RefreshCcw, MessageCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Laraib Studio Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 border border-stone-200 shadow-luxury rounded-sm">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Something Went Wrong
          </h2>
          <p className="text-xs text-stone-500">
            We encountered an unexpected issue while loading this page. You can try refreshing or contact our team directly.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button
            variant="primary"
            onClick={() => reset()}
            leftIcon={<RefreshCcw className="h-4 w-4" />}
          >
            Try Again
          </Button>

          <a
            href={getWhatsAppUrl('Hi Laraib Studio, I encountered an issue on the website.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button
              variant="whatsapp"
              leftIcon={<MessageCircle className="h-4 w-4" />}
            >
              WhatsApp Help
            </Button>
          </a>
        </div>

        <div className="pt-4 border-t border-stone-100">
          <Link
            href="/"
            className="text-xs text-stone-500 hover:text-stone-900 underline"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
