import { PublicProduct, PublicProductImage, PublicProductVariant } from '@/types';
import { isProductNewArrival } from '../utils';

interface RawProductFromDB {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  material?: string | null;
  gender: string;
  retailPrice: number;
  salePrice?: number | null;
  wholesalePrice?: number; // SENSITIVE
  supplierNotes?: string | null; // SENSITIVE
  supplierBrand?: string | null; // SENSITIVE
  isFeatured: boolean;
  isNewArrival: boolean;
  isPublished: boolean;
  publishedAt: Date | string;
  createdAt: Date | string;
  category?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    displayOrder: number;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    logoUrl?: string | null;
  } | null;
  images?: {
    id: string;
    url: string;
    altText?: string | null;
    displayOrder: number;
    isThumbnail: boolean;
  }[];
  variants?: {
    id: string;
    size: string;
    color?: string | null;
    colorHex?: string | null;
    stockQuantity: number;
    sku?: string | null;
  }[];
}

/**
 * Transforms raw database product into a safe Public Product DTO.
 * CRITICAL SECURITY GUARANTEE:
 * Wholesale price, supplier notes, supplier identity, and internal profit margins are
 * strictly omitted before sending to the client or browser.
 */
export function toPublicProduct(
  raw: RawProductFromDB,
  newArrivalDays = 14
): PublicProduct {
  const images: PublicProductImage[] = (raw.images || [])
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText ?? null,
      displayOrder: img.displayOrder,
      isThumbnail: img.isThumbnail,
    }));

  const variants: PublicProductVariant[] = (raw.variants || []).map((v) => ({
    id: v.id,
    size: v.size,
    color: v.color ?? null,
    colorHex: v.colorHex ?? null,
    stockQuantity: v.stockQuantity,
    sku: v.sku ?? null,
  }));

  const isNew = isProductNewArrival(raw.publishedAt, raw.isNewArrival, newArrivalDays);

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    material: raw.material ?? null,
    gender: (raw.gender as 'WOMEN' | 'MEN' | 'UNISEX') || 'WOMEN',
    retailPrice: Number(raw.retailPrice),
    salePrice: raw.salePrice ? Number(raw.salePrice) : null,
    isFeatured: Boolean(raw.isFeatured),
    isNewArrival: isNew,
    isPublished: Boolean(raw.isPublished),
    category: raw.category
      ? {
          id: raw.category.id,
          name: raw.category.name,
          slug: raw.category.slug,
          description: raw.category.description ?? null,
          imageUrl: raw.category.imageUrl ?? null,
          displayOrder: raw.category.displayOrder,
        }
      : null,
    brand: raw.brand
      ? {
          id: raw.brand.id,
          name: raw.brand.name,
          slug: raw.brand.slug,
          description: raw.brand.description ?? null,
          logoUrl: raw.brand.logoUrl ?? null,
        }
      : null,
    images,
    variants,
    publishedAt: new Date(raw.publishedAt).toISOString(),
    createdAt: new Date(raw.createdAt).toISOString(),
  };
}

export function toPublicProductList(
  products: RawProductFromDB[],
  newArrivalDays = 14
): PublicProduct[] {
  return products.map((p) => toPublicProduct(p, newArrivalDays));
}
