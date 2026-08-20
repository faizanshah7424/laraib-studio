import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCustomerSession } from '@/lib/auth/customerSession';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ customer: null });
    }

    const customer = await prisma.customerUser.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        deliveryAddress: true,
        karachiArea: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    return NextResponse.json({ error: 'Failed to fetch customer profile' }, { status: 500 });
  }
}
