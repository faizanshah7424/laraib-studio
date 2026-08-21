import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, hashPassword, createAdminToken } from '@/lib/auth/session';

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

    // Look up admin in database
    let admin = await prisma.adminUser.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: 'insensitive',
        },
      },
    });

    // If no admin in DB, check against configured DEFAULT_ADMIN_EMAIL / DEFAULT_ADMIN_PASSWORD from env
    const defaultAdminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@laraibstudio.pk').trim().toLowerCase();
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'LaraibAdmin2026!#';

    if (!admin && cleanEmail === defaultAdminEmail) {
      if (password === defaultAdminPassword) {
        const passwordHash = await hashPassword(defaultAdminPassword);
        admin = await prisma.adminUser.create({
          data: {
            email: defaultAdminEmail,
            name: 'Laraib Studio Admin',
            passwordHash,
            role: 'SUPER_ADMIN',
          },
        });
      }
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    let isValid = await verifyPassword(password, admin.passwordHash);

    // Fallback: If DB had an older hash or password was updated in env vars for default admin
    if (!isValid && admin.email.toLowerCase() === defaultAdminEmail && password === defaultAdminPassword) {
      const newHash = await hashPassword(defaultAdminPassword);
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { passwordHash: newHash },
      });
      isValid = true;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = await createAdminToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
