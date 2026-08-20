import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import {
  verifyCustomerPassword,
  createCustomerToken,
} from '@/lib/auth/customerSession';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const customer = await prisma.customerUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValid = await verifyCustomerPassword(password, customer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await createCustomerToken({
      userId: customer.id,
      email: customer.email,
      name: customer.name,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
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
    console.error('Customer login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
