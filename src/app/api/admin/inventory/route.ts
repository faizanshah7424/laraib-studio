import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/inventory
 * Return product variants with stock status
 */
export async function GET(req: NextRequest) {
  try {
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;

    if (!adminSession) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin session required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const stockFilter = searchParams.get('stockFilter') || 'ALL'; // ALL | LOW_STOCK | OUT_OF_STOCK

    const variants = await prisma.productVariant.findMany({
      where: search
        ? {
            OR: [
              { product: { name: { contains: search } } },
              { sku: { contains: search } },
              { size: { contains: search } },
              { color: { contains: search } },
            ],
          }
        : undefined,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            wholesalePrice: true,
            retailPrice: true,
            salePrice: true,
            isPublished: true,
            brand: { select: { name: true } },
          },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });

    const items = variants
      .map((v) => {
        let status = 'IN_STOCK';
        if (v.stockQuantity === 0) status = 'OUT_OF_STOCK';
        else if (v.stockQuantity <= 5) status = 'LOW_STOCK';

        return {
          id: v.id,
          productId: v.productId,
          productName: v.product.name,
          productSlug: v.product.slug,
          brandName: v.product.brand?.name || 'Unbranded',
          size: v.size,
          color: v.color,
          sku: v.sku || `SKU-${v.id.slice(-6).toUpperCase()}`,
          stockQuantity: v.stockQuantity,
          wholesalePrice: v.product.wholesalePrice,
          retailPrice: v.product.retailPrice,
          salePrice: v.product.salePrice,
          isPublished: v.product.isPublished,
          status,
        };
      })
      .filter((item) => {
        if (stockFilter === 'LOW_STOCK') return item.status === 'LOW_STOCK';
        if (stockFilter === 'OUT_OF_STOCK') return item.status === 'OUT_OF_STOCK';
        return true;
      });

    return NextResponse.json({ inventory: items, totalCount: items.length });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/inventory
 * Update stock quantity for a variant
 */
export async function PUT(req: NextRequest) {
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
    const { variantId, stockQuantity } = body;

    if (!variantId || typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return NextResponse.json(
        { error: 'Valid variantId and stockQuantity (>= 0) are required' },
        { status: 400 }
      );
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: { stockQuantity },
    });

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      variant: updated,
    });
  } catch (error) {
    console.error('Error updating inventory stock:', error);
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
