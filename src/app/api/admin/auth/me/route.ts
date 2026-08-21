import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ admin: null });
    }

    const session = await verifyAdminToken(token);
    if (!session) {
      return NextResponse.json({ admin: null });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Error fetching admin session:', error);
    return NextResponse.json({ error: 'Failed to fetch admin session' }, { status: 500 });
  }
}
