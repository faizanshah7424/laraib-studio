import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

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

    const body = await req.json();
    const { title, bannerText, discountPercentage, startDate, endDate, isActive } = body;

    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Sale campaign not found' }, { status: 404 });
    }

    const updated = await prisma.sale.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        bannerText: bannerText !== undefined ? bannerText?.trim() || null : existing.bannerText,
        discountPercentage: discountPercentage !== undefined ? Number(discountPercentage) : existing.discountPercentage,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Sale campaign updated successfully',
      sale: updated,
    });
  } catch (error) {
    console.error('Error updating sale campaign:', error);
    return NextResponse.json({ error: 'Failed to update sale campaign' }, { status: 500 });
  }
}

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

    // Detach from products
    await prisma.product.updateMany({
      where: { saleId: id },
      data: { saleId: null, salePrice: null },
    });

    await prisma.sale.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Sale campaign archived successfully' });
  } catch (error) {
    console.error('Error deleting sale campaign:', error);
    return NextResponse.json({ error: 'Failed to delete sale campaign' }, { status: 500 });
  }
}
