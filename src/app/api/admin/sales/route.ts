import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        products: {
          select: { id: true, name: true, retailPrice: true, salePrice: true },
        },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error('Error fetching admin sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

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
    const { title, bannerText, discountPercentage, startDate, endDate, isActive = true, productIds = [] } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'Sale title is required' }, { status: 400 });
    }
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and End date are required' }, { status: 400 });
    }

    const slug = slugify(title);

    const sale = await prisma.sale.create({
      data: {
        title: title.trim(),
        slug,
        bannerText: bannerText ? bannerText.trim() : null,
        discountPercentage: discountPercentage ? Number(discountPercentage) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: Boolean(isActive),
      },
    });

    // Attach products and calculate sale prices if discount percentage provided
    if (productIds.length > 0) {
      const discount = discountPercentage ? Number(discountPercentage) : 0;

      for (const pId of productIds) {
        const prod = await prisma.product.findUnique({ where: { id: pId } });
        if (prod) {
          const calcSalePrice = discount > 0 ? Math.round(prod.retailPrice * (1 - discount / 100)) : prod.salePrice;

          await prisma.product.update({
            where: { id: pId },
            data: {
              saleId: sale.id,
              salePrice: calcSalePrice,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sale campaign created successfully',
      sale,
    });
  } catch (error) {
    console.error('Error creating sale campaign:', error);
    return NextResponse.json({ error: 'Failed to create sale campaign' }, { status: 500 });
  }
}
