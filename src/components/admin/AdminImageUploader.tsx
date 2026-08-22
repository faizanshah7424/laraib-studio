'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Star, ArrowLeft, ArrowRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface ImageItem {
  id?: string;
  url: string;
  altText?: string;
  isThumbnail: boolean;
}

export interface AdminImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}

export const AdminImageUploader: React.FC<AdminImageUploaderProps> = ({
  images,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg(null);

    const newImages: ImageItem[] = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const message = errData.error || (res.status === 401 ? 'Session expired. Please log in again.' : `Upload failed for file ${file.name}`);
          throw new Error(message);
        }

        const data = await res.json();
        if (data.url) {
          newImages.push({
            url: data.url,
            altText: file.name.replace(/\.[^/.]+$/, ''),
            isThumbnail: newImages.length === 0,
          });
        }

      }

      onChange(newImages);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setErrorMsg(err.message || 'Failed to upload images. Check server logs.');
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, idx) => ({
      ...img,
      isThumbnail: idx === index,
    }));
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    // If we removed the primary thumbnail, set the first remaining as primary
    if (updated.length > 0 && !updated.some((img) => img.isThumbnail)) {
      updated[0].isThumbnail = true;
    }
    onChange(updated);
  };

  const handleAltChange = (index: number, alt: string) => {
    const updated = [...images];
    updated[index].altText = alt;
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Product Image Gallery <span className="text-red-500">*</span>
          </h4>
          <p className="text-xs text-stone-500">
            Upload supplier photos directly from WhatsApp. Select primary cover image and reorder as needed.
          </p>
        </div>

        <label className="cursor-pointer">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-xs hover:bg-stone-800 transition-colors shadow-xs">
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Photos</span>
              </>
            )}
          </span>
        </label>
      </div>

      {errorMsg && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xs">
          {errorMsg}
        </div>
      )}

      {/* Thumbnails Grid */}
      {images.length === 0 ? (
        <div className="border-2 border-dashed border-stone-200 rounded-xs p-8 text-center bg-stone-50/50 space-y-2">
          <ImageIcon className="h-8 w-8 text-stone-400 mx-auto" />
          <p className="text-xs font-medium text-stone-600">No images uploaded yet</p>
          <p className="text-[11px] text-stone-400">
            Select files or drag WhatsApp catalog images here to upload.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`relative group bg-stone-100 border-2 rounded-xs overflow-hidden ${
                img.isThumbnail ? 'border-brand-dark ring-2 ring-brand-dark/20' : 'border-stone-200'
              }`}
            >
              <div className="relative aspect-fashion w-full">
                <Image
                  src={img.url}
                  alt={img.altText || `Product Image ${idx + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />

                {img.isThumbnail && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-brand-dark text-white text-[10px] font-bold uppercase rounded-xs shadow-xs">
                    Primary Cover
                  </div>
                )}

                {/* Quick Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      title="Set as Primary Cover Image"
                      className={`p-1.5 rounded-full transition-colors ${
                        img.isThumbnail ? 'bg-amber-400 text-stone-900' : 'bg-white/80 text-stone-800 hover:bg-amber-400 hover:text-stone-900'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      title="Remove image"
                      className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex justify-between items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'left')}
                      className="p-1 bg-white/80 text-stone-900 rounded-xs disabled:opacity-30 hover:bg-white"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, 'right')}
                      className="p-1 bg-white/80 text-stone-900 rounded-xs disabled:opacity-30 hover:bg-white"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Alt Text Input */}
              <div className="p-1.5 bg-white border-t border-stone-200">
                <input
                  type="text"
                  placeholder="Alt text"
                  value={img.altText || ''}
                  onChange={(e) => handleAltChange(idx, e.target.value)}
                  className="w-full text-[11px] px-1.5 py-0.5 border border-stone-200 rounded-2xs focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
