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

/**
 * GET /api/orders/[id]
 * Public view by orderNumber / ID OR Admin view
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const token = cookies().get('admin_token')?.value;
    const adminSession = token ? await verifyAdminToken(token) : null;

    // Search by orderNumber or CUID ID
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (adminSession) {
      return NextResponse.json({ order });
    }

    // Public Order View: STRICTLY strip internal notes
    const { internalNotes, ...publicOrder } = order;
    return NextResponse.json({ order: publicOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

/**
 * PUT /api/orders/[id]
 * Admin Update Order Status / Payment Verification
 */
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
    const { orderStatus, paymentStatus, internalNotes, paymentReference } = body;

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || existing.orderStatus,
        paymentStatus: paymentStatus || existing.paymentStatus,
        internalNotes: internalNotes !== undefined ? internalNotes : existing.internalNotes,
        paymentReference: paymentReference !== undefined ? paymentReference : existing.paymentReference,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
