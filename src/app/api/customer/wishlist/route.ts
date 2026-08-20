import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCustomerSession } from '@/lib/auth/customerSession';
import { toPublicProductList } from '@/lib/dto/product.dto';
import { getNewArrivalDurationDays } from '@/lib/products';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/wishlist
 */
export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ wishlist: [] });
    }

    const items = await prisma.wishlistItem.findMany({
      where: { customerId: session.userId },
      include: {
        product: {
          include: {
            category: true,
            brand: true,
            images: true,
            variants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rawProducts = items
      .map((item) => item.product)
      .filter((p) => p && p.isPublished);

    const newArrivalDays = await getNewArrivalDurationDays();
    const publicProducts = toPublicProductList(rawProducts, newArrivalDays);

    return NextResponse.json({ wishlist: publicProducts });
  } catch (error) {
    console.error('Error fetching customer wishlist:', error);
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

/**
 * POST /api/customer/wishlist
 * Add product to wishlist
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Please log in to save items to your wishlist' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // Upsert or create unique
    await prisma.wishlistItem.upsert({
      where: {
        customerId_productId: {
          customerId: session.userId,
          productId,
        },
      },
      update: {},
      create: {
        customerId: session.userId,
        productId,
      },
    });

    return NextResponse.json({ success: true, message: 'Added to wishlist' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}

/**
 * DELETE /api/customer/wishlist
 * Remove product from wishlist
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 });
    }

    await prisma.wishlistItem.deleteMany({
      where: {
        customerId: session.userId,
        productId,
      },
    });

    return NextResponse.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
  }
}
