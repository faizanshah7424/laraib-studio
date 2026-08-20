import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

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

    const customers = await prisma.customerUser.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { phone: { contains: search } },
              { karachiArea: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            orderNumber: true,
            grandTotal: true,
            orderStatus: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const customerList = customers.map((c) => {
      const totalOrderValue = c.orders.reduce((sum, o) => sum + o.grandTotal, 0);
      const lastOrderDate = c.orders[0]?.createdAt || null;

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        whatsapp: c.whatsapp,
        deliveryAddress: c.deliveryAddress,
        karachiArea: c.karachiArea,
        createdAt: c.createdAt,
        orderCount: c.orders.length,
        totalOrderValue,
        lastOrderDate,
        recentOrders: c.orders.slice(0, 5),
      };
    });

    return NextResponse.json({ customers: customerList, totalCount: customerList.length });
  } catch (error) {
    console.error('Error fetching admin customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
