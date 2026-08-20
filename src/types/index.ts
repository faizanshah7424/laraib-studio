// Core TypeScript Types for Laraib Studio

export type Gender = 'WOMEN' | 'MEN' | 'UNISEX';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'FAILED';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

// Public Product Image (safe for client)
export interface PublicProductImage {
  id: string;
  url: string;
  altText?: string | null;
  displayOrder: number;
  isThumbnail: boolean;
}

// Public Product Variant (safe for client)
export interface PublicProductVariant {
  id: string;
  size: string;
  color?: string | null;
  colorHex?: string | null;
  stockQuantity: number;
  sku?: string | null;
}

// Public Category (safe for client)
export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
}

// Public Brand (safe for client)
export interface PublicBrand {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
}

// Public Product DTO (STRICTLY OMITS wholesale_price, supplier_notes, internal costs)
export interface PublicProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  material?: string | null;
  gender: Gender;
  retailPrice: number;
  salePrice?: number | null;
  isFeatured: boolean;
  isNewArrival: boolean; // Computed from date or manual override
  isPublished: boolean;
  category?: PublicCategory | null;
  brand?: PublicBrand | null;
  images: PublicProductImage[];
  variants: PublicProductVariant[];
  publishedAt: string;
  createdAt: string;
}

// Cart Item Model
export interface CartItem {
  id: string; // product_id + variant_id
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  color?: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

// Checkout & Order Form Data (Karachi Only)
export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  deliveryAddress: string;
  karachiArea: string;
  city: 'Karachi';
  paymentMethod: PaymentMethod;
  customerNotes?: string;
}

// Public Order Receipt (safe for customer view)
export interface PublicOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string | null;
  deliveryAddress: string;
  karachiArea: string;
  city: string;
  subtotal: number;
  deliveryFee: number; // Always 200 PKR in Karachi
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: {
    id: string;
    productName: string;
    size: string;
    color?: string | null;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
  createdAt: string;
}

// Site Settings
export interface StoreSettings {
  whatsappNumber: string;
  karachiDeliveryFee: number;
  newArrivalDays: number;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  announcementText: string;
}
