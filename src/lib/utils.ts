import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OFFICIAL_WHATSAPP_NUMBER } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Pakistani Rupee (e.g., PKR 3,500)
 */
export function formatPKR(amount: number): string {
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `PKR ${formatted}`;
}

/**
 * Clean and format phone number for WhatsApp link
 * Converts local PK 03XXXXXXXXX to international 923XXXXXXXXX
 */
export function sanitizePhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('03') && digits.length === 11) {
    return '92' + digits.slice(1);
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return '92' + digits;
  }
  return digits;
}

/**
 * Generate a direct WhatsApp chat link with optional pre-filled message
 */
export function getWhatsAppUrl(
  message = 'Hi Laraib Studio, I have an inquiry.',
  phoneNumber = OFFICIAL_WHATSAPP_NUMBER
): string {
  const cleanNumber = sanitizePhoneNumber(phoneNumber);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}

/**
 * Convert string to URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

/**
 * Generate human-readable Order Number: LS-YYYY-XXXX (e.g. LS-2026-1042)
 */
export function generateOrderNumber(sequence = Math.floor(1000 + Math.random() * 9000)): string {
  const year = new Date().getFullYear();
  return `LS-${year}-${sequence}`;
}

/**
 * Determine if a product is a New Arrival based on publish date and duration days
 */
export function isProductNewArrival(
  publishedAt: Date | string,
  isExplicitNewArrival: boolean,
  durationDays = 14
): boolean {
  if (isExplicitNewArrival) return true;
  const pubDate = new Date(publishedAt).getTime();
  const diffDays = (Date.now() - pubDate) / (1000 * 60 * 60 * 24);
  return diffDays <= durationDays;
}
