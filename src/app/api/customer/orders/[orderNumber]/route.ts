import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCustomerSession } from '@/lib/auth/customerSession';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    orderNumber: string;
  };
}

/**
 * GET /api/customer/orders/[orderNumber]
 * Returns single order details for authenticated owner ONLY
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { orderNumber } = params;
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const customer = await prisma.customerUser.findUnique({
      where: { id: session.userId },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        customerId: true,
        customerName: true,
        customerPhone: true,
        customerWhatsapp: true,
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
            productId: true,
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

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // STRICT AUTHORIZATION SECURITY CHECK (#3, #15)
    // Verify order belongs to this customer
    const isOwner =
      order.customerId === customer.id ||
      (customer.phone && order.customerPhone === customer.phone) ||
      (customer.whatsapp && order.customerWhatsapp === customer.whatsapp);

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Access denied. You can only view your own orders.' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching customer order by orderNumber:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}
