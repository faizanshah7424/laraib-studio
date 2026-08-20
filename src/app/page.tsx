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
  Percent,
  ChevronRight,
  Star,
} from 'lucide-react';

export default async function HomePage() {
  // Fetch real public new arrivals & sale items from DB
  const [{ products: newArrivals }, { products: saleProducts }] = await Promise.all([
    getPublicProducts({ isNewIn: true, limit: 4 }),
    getPublicProducts({ isSale: true, limit: 4 }),
  ]);

  // Fallback to general public products if database has few tagged items
  const displayProducts = newArrivals.length > 0 ? newArrivals : (await getPublicProducts({ limit: 4 })).products;

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#0F0E0D] text-white min-h-[550px] md:min-h-[640px] flex items-center">
        {/* Editorial Fashion Background Image */}
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1800"
            alt="Laraib Studio Fashion Hero Background"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter grayscale"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0E0D] via-[#0F0E0D]/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col items-center text-center space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-brand-accent text-xs font-semibold tracking-widest uppercase backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Daily Drops & Karachi Fast Delivery</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold tracking-tight max-w-4xl text-white leading-tight">
            Elegance Curated for <span className="gold-gradient-text">Karachi</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-stone-300 max-w-2xl font-light leading-relaxed">
            Fresh daily fashion drops in women’s unstitched, pret luxury, and men’s staples. Sourced directly and delivered straight to your doorstep across Karachi for flat <strong>PKR {KARACHI_DELIVERY_FEE}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3.5 pt-4 w-full sm:w-auto justify-center">
            <Link href="/collections/new-in">
              <Button
                variant="accent"
                size="lg"
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full sm:w-auto shadow-luxury hover:scale-102 transition-transform"
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

      {/* 2. KARACHI SERVICE ASSURANCE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white border border-stone-200/80 shadow-luxury rounded-sm">
          <div className="flex items-center gap-3.5 p-2">
            <div className="p-3 bg-brand-cream border border-stone-200 rounded-xs text-brand-dark flex-shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Karachi Flat Delivery: PKR {KARACHI_DELIVERY_FEE}
              </p>
              <p className="text-[11px] text-stone-500">
                Doorstep dispatch across all Karachi localities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-3 bg-brand-cream border border-stone-200 rounded-xs text-brand-dark flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Cash on Delivery (COD)
              </p>
              <p className="text-[11px] text-stone-500">
                Pay safely when your rider arrives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-3 bg-brand-cream border border-stone-200 rounded-xs text-brand-dark flex-shrink-0">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                {RETURN_POLICY_DAYS}-Day WhatsApp Support
              </p>
              <p className="text-[11px] text-stone-500">
                Easy WhatsApp return & exchange assistance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-emerald-700 flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-brand-whatsapp" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-900">
                WhatsApp Ordering
              </p>
              <p className="text-[11px] text-stone-500">
                Direct styling & order confirmation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS DROP SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-accent mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Just Arrived</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">
              Today's New Drops
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Curated luxury Pakistani lawn, pret, and men's apparel cataloged daily.
            </p>
          </div>

          <Link
            href="/collections/new-in"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark hover:text-brand-accent transition-colors"
          >
            <span>Explore All New Drops</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. CURATED DEPARTMENT BANNERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
            Curated Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Shop by Department
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Women Pret */}
          <Link
            href="/collections/women"
            className="group relative h-96 overflow-hidden bg-stone-900 rounded-sm shadow-luxury"
          >
            <Image
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800"
              alt="Women Pret Fashion"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent">
                Ready to Wear
              </span>
              <h3 className="text-2xl font-serif font-bold">Women's Pret</h3>
              <p className="text-xs text-stone-300">Kurtis, 2-Piece & 3-Piece Festive Suits</p>
            </div>
          </Link>

          {/* Unstitched Fabric */}
          <Link
            href="/collections/women"
            className="group relative h-96 overflow-hidden bg-stone-900 rounded-sm shadow-luxury"
          >
            <Image
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800"
              alt="Unstitched Luxury Lawn"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent">
                Custom Tailoring
              </span>
              <h3 className="text-2xl font-serif font-bold">Unstitched Lawn</h3>
              <p className="text-xs text-stone-300">Embroidered Lawn, Chiffon & Silk Drops</p>
            </div>
          </Link>

          {/* Men's Fashion */}
          <Link
            href="/collections/men"
            className="group relative h-96 overflow-hidden bg-stone-900 rounded-sm shadow-luxury"
          >
            <Image
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800"
              alt="Men's Kurta & Casuals"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-accent">
                Men's Eastern Edit
              </span>
              <h3 className="text-2xl font-serif font-bold">Men's Collection</h3>
              <p className="text-xs text-stone-300">Kurtas, Shalwar Kameez & Waistcoats</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. SALE & PROMOTIONS SPOTLIGHT (If sale items exist) */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-600 mb-1">
                <Percent className="h-4 w-4" />
                <span>Limited Time Offers</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Sale & Promotional Drops
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Special discounts on luxury Pakistani seasonal collections.
              </p>
            </div>

            <Link
              href="/collections/sale"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700 hover:text-red-800 transition-colors"
            >
              <span>View All Sale Items</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. WHATSAPP DIRECT CONCIERGE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#0C2014] to-[#123620] text-white p-8 sm:p-12 rounded-sm border border-emerald-800/80 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-whatsapp/20 text-brand-whatsapp border border-brand-whatsapp/30 rounded-full text-xs font-semibold uppercase tracking-wider">
              <MessageCircle className="h-4 w-4" />
              <span>Official WhatsApp Hotline</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold">
              Need Sizing Advice or Direct WhatsApp Ordering?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
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
                className="shadow-luxury hover:scale-105 transition-transform"
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
