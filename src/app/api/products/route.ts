import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { getPublicProducts } from '@/lib/products';
import { verifyAdminToken } from '@/lib/auth/session';
import { slugify } from '@/lib/utils';

/**
 * GET /api/products
 * Public & Admin Product Listing
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdminMode = searchParams.get('admin') === 'true';

    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;

    // Admin raw view with wholesale information
    if (isAdminMode && adminSession) {
      const page = parseInt(searchParams.get('page') || '1', 10);
      const limit = parseInt(searchParams.get('limit') || '50', 10);
      const search = searchParams.get('search') || '';
      const categoryId = searchParams.get('categoryId') || '';
      const brandId = searchParams.get('brandId') || '';
      const skip = (page - 1) * limit;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } },
          { supplierNotes: { contains: search } },
          { supplierBrand: { contains: search } },
        ];
      }
      if (categoryId) where.categoryId = categoryId;
      if (brandId) where.brandId = brandId;

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            category: true,
            brand: true,
            images: true,
            variants: true,
            sale: true,
          },
        }),
        prisma.product.count({ where }),
      ]);

      return NextResponse.json({
        products,
        totalCount,
        page,
        totalPages: Math.ceil(totalCount / limit) || 1,
      });
    }

    // PUBLIC CATALOG REQUEST - DTO SAFE
    const categorySlug = searchParams.get('category') || undefined;
    const brandSlug = searchParams.get('brand') || undefined;
    const gender = (searchParams.get('gender') as 'WOMEN' | 'MEN' | 'UNISEX') || undefined;
    const isSale = searchParams.get('sale') === 'true';
    const isNewIn = searchParams.get('new') === 'true';
    const isFeatured = searchParams.get('featured') === 'true';
    const searchQuery = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice')
      ? parseFloat(searchParams.get('minPrice')!)
      : undefined;
    const maxPrice = searchParams.get('maxPrice')
      ? parseFloat(searchParams.get('maxPrice')!)
      : undefined;
    const availability =
      searchParams.get('availability') === 'in-stock' ? 'in-stock' : 'all';
    const sortBy =
      (searchParams.get('sort') as
        | 'newest'
        | 'price-asc'
        | 'price-desc'
        | 'name-asc'
        | 'featured') || 'newest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const result = await getPublicProducts({
      categorySlug,
      brandSlug,
      gender,
      isSale,
      isNewIn,
      isFeatured,
      searchQuery,
      minPrice,
      maxPrice,
      availability,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Rapid Admin Product Entry & Creation
 */
export async function POST(req: NextRequest) {
  try {
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validation
    const {
      name,
      slug: customSlug,
      description,
      material,
      gender = 'WOMEN',
      retailPrice,
      salePrice,
      wholesalePrice,
      supplierNotes,
      supplierBrand,
      isFeatured = false,
      isNewArrival = false,
      isPublished = true,
      categoryId,
      brandId,
      images = [],
      variants = [],
    } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    if (retailPrice === undefined || retailPrice === null || Number(retailPrice) < 0) {
      return NextResponse.json(
        { error: 'Valid retail price is required' },
        { status: 400 }
      );
    }

    if (
      wholesalePrice === undefined ||
      wholesalePrice === null ||
      Number(wholesalePrice) < 0
    ) {
      return NextResponse.json(
        { error: 'Valid wholesale price is required for admin record' },
        { status: 400 }
      );
    }

    if (salePrice !== undefined && salePrice !== null && Number(salePrice) < 0) {
      return NextResponse.json(
        { error: 'Sale price cannot be negative' },
        { status: 400 }
      );
    }

    // Published products validation
    if (isPublished && images.length === 0) {
      return NextResponse.json(
        { error: 'Published products must have at least one product image' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = customSlug ? slugify(customSlug) : slugify(name);
    if (!baseSlug) baseSlug = `product-${Date.now()}`;
    let finalSlug = baseSlug;
    let count = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    // Process Images
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preparedImages = images.map((img: any, index: number) => ({
      url: typeof img === 'string' ? img : img.url,
      altText: img.altText || name,
      displayOrder: index + 1,
      isThumbnail: index === 0 || Boolean(img.isThumbnail),
    }));

    // Process Variants
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preparedVariants = variants.length > 0
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? variants.map((v: any) => ({
          size: v.size || 'Unstitched',
          color: v.color || null,
          colorHex: v.colorHex || null,
          stockQuantity: typeof v.stockQuantity === 'number' ? v.stockQuantity : 10,
          sku: v.sku || `${finalSlug.slice(0, 8).toUpperCase()}-${v.size}`,
        }))
      : [
          {
            size: 'Unstitched',
            color: null,
            colorHex: null,
            stockQuantity: 10,
            sku: `${finalSlug.slice(0, 8).toUpperCase()}-UNST`,
          },
        ];

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description || null,
        material: material || null,
        gender: gender || 'WOMEN',
        retailPrice: Number(retailPrice),
        salePrice: salePrice ? Number(salePrice) : null,
        wholesalePrice: Number(wholesalePrice),
        supplierNotes: supplierNotes || null,
        supplierBrand: supplierBrand || null,
        isFeatured: Boolean(isFeatured),
        isNewArrival: Boolean(isNewArrival),
        isPublished: Boolean(isPublished),
        categoryId: categoryId || null,
        brandId: brandId || null,
        publishedAt: new Date(),
        images: {
          create: preparedImages,
        },
        variants: {
          create: preparedVariants,
        },
      },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product. Check input parameters.' },
      { status: 500 }
    );
  }
}
