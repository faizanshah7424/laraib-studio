import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCustomerSession } from '@/lib/auth/customerSession';

export const dynamic = 'force-dynamic';

/**
 * GET /api/customer/orders
 * Returns order history for logged-in customer ONLY
 */
export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ orders: [] });
    }

    const customer = await prisma.customerUser.findUnique({
      where: { id: session.userId },
    });

    if (!customer) {
      return NextResponse.json({ orders: [] });
    }

    // Match by customerId OR customer phone/email
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { customerId: customer.id },
          { customerPhone: customer.phone || 'NO_MATCH' },
          { customerWhatsapp: customer.whatsapp || 'NO_MATCH' },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerPhone: true,
        deliveryAddress: true,
        karachiArea: true,
        city: true,
        subtotal: true,
        deliveryFee: true,
        grandTotal: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
        paymentReference: true,
        customerNotes: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            size: true,
            color: true,
            unitPrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 });
  }
}
