import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 border border-stone-200 shadow-luxury rounded-sm">
        <span className="text-6xl font-serif font-bold text-stone-300">404</span>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Page Not Found
          </h2>
          <p className="text-xs text-stone-500">
            The collection, product, or page you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/">
            <Button
              variant="primary"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Home
            </Button>
          </Link>

          <Link href="/collections/new-in">
            <Button
              variant="outline"
              leftIcon={<ShoppingBag className="h-4 w-4" />}
            >
              Explore Drops
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
