import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';
import { slugify } from '@/lib/utils';
import { getPublicCategories } from '@/lib/products';

export async function GET() {
  try {
    const categories = await getPublicCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
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
    const { name, description, parentId, displayOrder = 0 } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    let slug = slugify(name);
    let count = 1;
    while (await prisma.category.findUnique({ where: { slug } })) {
      slug = `${slugify(name)}-${count++}`;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description || null,
        parentId: parentId || null,
        displayOrder: Number(displayOrder),
      },
    });

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
