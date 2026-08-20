import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCustomerSession } from '@/lib/auth/customerSession';

export async function PUT(req: NextRequest) {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, whatsapp, deliveryAddress, karachiArea } = body;

    const updated = await prisma.customerUser.update({
      where: { id: session.userId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
        whatsapp: whatsapp !== undefined ? whatsapp.trim() : undefined,
        deliveryAddress: deliveryAddress !== undefined ? deliveryAddress.trim() : undefined,
        karachiArea: karachiArea !== undefined ? karachiArea.trim() : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        whatsapp: true,
        deliveryAddress: true,
        karachiArea: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      customer: updated,
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
