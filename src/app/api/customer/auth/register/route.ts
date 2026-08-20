import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  hashCustomerPassword,
  createCustomerToken,
} from '@/lib/auth/customerSession';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone, whatsapp, deliveryAddress, karachiArea } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.customerUser.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashCustomerPassword(password);

    const customer = await prisma.customerUser.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        whatsapp: whatsapp ? whatsapp.trim() : phone ? phone.trim() : null,
        deliveryAddress: deliveryAddress ? deliveryAddress.trim() : null,
        karachiArea: karachiArea ? karachiArea.trim() : null,
        city: 'Karachi',
      },
    });

    const token = await createCustomerToken({
      userId: customer.id,
      email: customer.email,
      name: customer.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        whatsapp: customer.whatsapp,
        deliveryAddress: customer.deliveryAddress,
        karachiArea: customer.karachiArea,
      },
    });

    response.cookies.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Customer registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
