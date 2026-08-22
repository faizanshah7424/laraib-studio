import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';
import { toPublicProduct } from '@/lib/dto/product.dto';
import { getNewArrivalDurationDays } from '@/lib/products';
import { slugify } from '@/lib/utils';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/products/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
        sale: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (adminSession) {
      return NextResponse.json({ product });
    }

    // Public view - DTO safe
    const newArrivalDays = await getNewArrivalDurationDays();
    const publicProduct = toPublicProduct(product, newArrivalDays);
    return NextResponse.json({ product: publicProduct });
  } catch (error) {
    console.error('Error fetching product by id:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

/**
 * PUT /api/products/[id]
 * Admin Edit Product
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      slug: customSlug,
      description,
      material,
      gender,
      retailPrice,
      salePrice,
      wholesalePrice,
      supplierNotes,
      supplierBrand,
      isFeatured,
      isNewArrival,
      isPublished,
      categoryId,
      brandId,
      images = [],
      variants = [],
    } = body;

    // Validate prices if provided
    if (retailPrice !== undefined && (retailPrice === null || Number(retailPrice) < 0)) {
      return NextResponse.json({ error: 'Valid retail price is required' }, { status: 400 });
    }
    if (wholesalePrice !== undefined && (wholesalePrice === null || Number(wholesalePrice) < 0)) {
      return NextResponse.json({ error: 'Valid wholesale price is required' }, { status: 400 });
    }

    let updatedSlug = existingProduct.slug;
    if (customSlug && customSlug !== existingProduct.slug) {
      const base = slugify(customSlug);
      let count = 1;
      updatedSlug = base;
      while (
        await prisma.product.findFirst({
          where: { slug: updatedSlug, id: { not: id } },
        })
      ) {
        updatedSlug = `${base}-${count++}`;
      }
    }

    // Delete existing relations and recreate if new ones provided
    if (images.length > 0) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
    }
    if (variants.length > 0) {
      await prisma.productVariant.deleteMany({ where: { productId: id } });
    }

    const hasExplicitThumbnail = images.some((img: any) => Boolean(img.isThumbnail));
    const preparedImages = images.map((img: any, index: number) => ({
      url: typeof img === 'string' ? img : img.url,
      altText: img.altText || name || existingProduct.name,
      displayOrder: index + 1,
      isThumbnail: hasExplicitThumbnail ? Boolean(img.isThumbnail) : index === 0,
    }));


    const preparedVariants = variants.map((v: any) => ({
      size: v.size || 'Unstitched',
      color: v.color || null,
      colorHex: v.colorHex || null,
      stockQuantity: typeof v.stockQuantity === 'number' ? v.stockQuantity : 10,
      sku: v.sku || `${updatedSlug.slice(0, 8).toUpperCase()}-${v.size}`,
    }));

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existingProduct.name,
        slug: updatedSlug,
        description: description !== undefined ? description : existingProduct.description,
        material: material !== undefined ? material : existingProduct.material,
        gender: gender !== undefined ? gender : existingProduct.gender,
        retailPrice: retailPrice !== undefined ? Number(retailPrice) : existingProduct.retailPrice,
        salePrice: salePrice !== undefined ? (salePrice ? Number(salePrice) : null) : existingProduct.salePrice,
        wholesalePrice: wholesalePrice !== undefined ? Number(wholesalePrice) : existingProduct.wholesalePrice,
        supplierNotes: supplierNotes !== undefined ? supplierNotes : existingProduct.supplierNotes,
        supplierBrand: supplierBrand !== undefined ? supplierBrand : existingProduct.supplierBrand,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existingProduct.isFeatured,
        isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : existingProduct.isNewArrival,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : existingProduct.isPublished,
        categoryId: categoryId !== undefined ? categoryId : existingProduct.categoryId,
        brandId: brandId !== undefined ? brandId : existingProduct.brandId,
        ...(images.length > 0 ? { images: { create: preparedImages } } : {}),
        ...(variants.length > 0 ? { variants: { create: preparedVariants } } : {}),
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
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

/**
 * DELETE /api/products/[id]
 * Admin Delete Product
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;
    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
