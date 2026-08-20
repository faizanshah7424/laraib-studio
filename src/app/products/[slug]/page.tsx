import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicProductBySlug, getRelatedProducts } from '@/lib/products';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { STORE_NAME, KARACHI_DELIVERY_FEE } from '@/lib/constants';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getPublicProductBySlug(params.slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }

  const primaryImage = product.images[0]?.url;

  return {
    title: `${product.name} | ${STORE_NAME}`,
    description:
      product.description ||
      `Buy ${product.name} at ${STORE_NAME}. Fast PKR ${KARACHI_DELIVERY_FEE} Karachi Delivery.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: primaryImage ? [{ url: primaryImage }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const product = await getPublicProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(
    product.id,
    product.category?.id,
    product.brand?.id,
    product.gender,
    4
  );

  // PUBLIC JSON-LD Structured Data - STRICTLY EXCLUDES Wholesale info
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.images.map((img) => img.url),
    brand: {
      '@type': 'Brand',
      name: product.brand?.name || STORE_NAME,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.salePrice || product.retailPrice,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: STORE_NAME,
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Dynamic SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ProductDetailView product={product} />

      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
