import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ui/ProductCard';
import { KARACHI_DELIVERY_FEE, RETURN_POLICY_DAYS } from '@/lib/constants';
import { getWhatsAppUrl } from '@/lib/utils';
import { getPublicProducts } from '@/lib/products';
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  TrendingUp,
} from 'lucide-react';

export default async function HomePage() {
  // Fetch real public new arrivals from DB
  const { products: newArrivals } = await getPublicProducts({
    isNewIn: true,
    limit: 4,
  });

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#111111] text-white">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1800"
            alt="Laraib Studio Fashion Hero Background"
            fill
            priority
            className="object-cover object-center filter grayscale"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36 flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-accent text-xs font-semibold tracking-widest uppercase backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Daily Drops & Karachi Fast Delivery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold tracking-tight max-w-4xl text-white">
            Elegance Curated for <span className="gold-gradient-text">Karachi</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-stone-300 max-w-2xl font-light leading-relaxed">
            Fresh daily fashion drops in women’s unstitched, pret luxury, and men’s staples. Sourced directly and delivered straight to your doorstep for a flat <strong>PKR {KARACHI_DELIVERY_FEE}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto justify-center">
            <Link href="/collections/new-in">
              <Button
                variant="accent"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full sm:w-auto"
              >
                Shop Today's Drop
              </Button>
            </Link>

            <Link href="/collections/women">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/40 text-white hover:bg-white hover:text-brand-dark"
              >
                Women's Collection
              </Button>
            </Link>

            <Link href="/collections/men">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-white/40 text-white hover:bg-white hover:text-brand-dark"
              >
                Men's Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Karachi Service Assurance Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white border border-stone-200 shadow-luxury rounded-sm">
          <div className="flex items-center gap-3.5 p-2">
            <div className="p-2.5 bg-brand-cream border border-stone-200 rounded-sm text-brand-dark">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Karachi Delivery: PKR {KARACHI_DELIVERY_FEE}
              </p>
              <p className="text-[11px] text-stone-500">
                Flat rate across all Karachi localities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-2.5 bg-brand-cream border border-stone-200 rounded-sm text-brand-dark">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Cash on Delivery (COD)
              </p>
              <p className="text-[11px] text-stone-500">
                Pay cash at your doorstep safely
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-2.5 bg-brand-cream border border-stone-200 rounded-sm text-brand-dark">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                {RETURN_POLICY_DAYS}-Day WhatsApp Support
              </p>
              <p className="text-[11px] text-stone-500">
                Easy return/exchange inquiry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm text-emerald-700">
              <MessageCircle className="h-5 w-5 text-brand-whatsapp" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                WhatsApp Ordering
              </p>
              <p className="text-[11px] text-stone-500">
                Direct styling & order assistance
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Today's Drop / New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-accent mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Just Arrived</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">
              Today's New Drops
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Fresh wholesale arrivals handpicked and cataloged daily for Karachi fashion lovers.
            </p>
          </div>

          <Link href="/collections/new-in" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark hover:text-brand-accent transition-colors">
            <span>View All New In</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. Curated Department Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Women Pret */}
          <Link
            href="/collections/women"
            className="group relative h-80 overflow-hidden bg-stone-900 rounded-sm shadow-luxury"
          >
            <Image
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800"
              alt="Women Pret Fashion"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent">
                Ready to Wear
              </span>
              <h3 className="text-xl font-serif font-bold">Women's Pret</h3>
              <p className="text-xs text-stone-300">Kurtis, 2-Piece & 3-Piece Suits</p>
            </div>
          </Link>

          {/* Unstitched Fabric */}
          <Link
            href="/collections/women"
            className="group relative h-80 overflow-hidden bg-stone-900 rounded-sm shadow-luxury"
          >
            <Image
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800"
              alt="Unstitched Luxury Lawn"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent">
                Custom Tailoring
              </span>
              <h3 className="text-xl font-serif font-bold">Unstitched Collections</h3>
              <p className="text-xs text-stone-300">Embroidered Lawn, Chiffon & Silk</p>
            </div>
          </Link>

          {/* Men's Fashion */}
          <Link
            href="/collections/men"
            className="group relative h-80 overflow-hidden bg-stone-900 rounded-sm shadow-luxury"
          >
            <Image
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800"
              alt="Men's Kurta & Casuals"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent">
                Men's Eastern & Casual
              </span>
              <h3 className="text-xl font-serif font-bold">Men's Edit</h3>
              <p className="text-xs text-stone-300">Kurtas, Shalwar Kameez & Waistcoats</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. WhatsApp Direct Concierge Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0C2014] to-[#123620] text-white p-8 sm:p-12 rounded-sm border border-emerald-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-whatsapp/20 text-brand-whatsapp border border-brand-whatsapp/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              <MessageCircle className="h-4 w-4" />
              <span>Official WhatsApp Hotline</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold">
              Looking for Sizing Advice or Direct WhatsApp Ordering?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              Our Karachi support team is available daily. Share product screenshots, confirm sizes, or place an instant Cash on Delivery order through WhatsApp.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={getWhatsAppUrl('Hi Laraib Studio, I would like assistance with choosing sizes.')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="whatsapp"
                size="lg"
                leftIcon={<MessageCircle className="h-5 w-5" />}
              >
                Chat on WhatsApp Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
