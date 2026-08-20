import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';
import { slugify } from '@/lib/utils';

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
    const { name, description, logoUrl } = body;

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const updated = await prisma.brand.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        slug: name !== undefined ? slugify(name) : existing.slug,
        description: description !== undefined ? description?.trim() || null : existing.description,
        logoUrl: logoUrl !== undefined ? logoUrl || null : existing.logoUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Brand updated successfully',
      brand: updated,
    });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
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

    await prisma.product.updateMany({
      where: { brandId: id },
      data: { brandId: null },
    });

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Brand archived successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
