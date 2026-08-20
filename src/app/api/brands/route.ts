import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';
import { slugify } from '@/lib/utils';
import { getPublicBrands } from '@/lib/products';

export async function GET() {
  try {
    const brands = await getPublicBrands();
    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Error in GET /api/brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, logoUrl } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });
    }

    let slug = slugify(name);
    let count = 1;
    while (await prisma.brand.findUnique({ where: { slug } })) {
      slug = `${slugify(name)}-${count++}`;
    }

    const newBrand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug,
        description: description || null,
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json({ success: true, brand: newBrand });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
