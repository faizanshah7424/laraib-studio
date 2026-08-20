'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PublicProductImage } from '@/types';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProductGalleryProps {
  images: PublicProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
}) => {
  const safeImages =
    images && images.length > 0
      ? images
      : [
          {
            id: 'placeholder',
            url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
            altText: productName,
            displayOrder: 1,
            isThumbnail: true,
          },
        ];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const currentImage = safeImages[selectedIndex] || safeImages[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Feature Image Container (3:4 Aspect Ratio) */}
      <div className="relative w-full aspect-fashion bg-stone-100 border border-stone-200/80 rounded-xs overflow-hidden group">
        <Image
          src={currentImage.url}
          alt={currentImage.altText || productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-all duration-500"
        />

        {/* Previous / Next Arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-xs text-stone-800 shadow-md opacity-90 hover:opacity-100 hover:bg-white hover:scale-105 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-xs text-stone-800 shadow-md opacity-90 hover:opacity-100 hover:bg-white hover:scale-105 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Lightbox Trigger Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          aria-label="Zoom image"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-xs text-stone-700 shadow-xs hover:bg-brand-dark hover:text-white transition-all"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* Slide Counter Indicator */}
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-semibold tracking-wider text-white">
            {selectedIndex + 1} / {safeImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Row */}
      {safeImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {safeImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative w-20 aspect-fashion flex-shrink-0 border-2 rounded-xs overflow-hidden transition-all',
                idx === selectedIndex
                  ? 'border-brand-dark ring-1 ring-brand-dark'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 p-3 text-stone-300 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all z-50"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full max-w-4xl h-[85vh]">
            <Image
              src={currentImage.url}
              alt={currentImage.altText || productName}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {safeImages.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
