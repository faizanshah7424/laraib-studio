import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, hashPassword, createAdminToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/**
 * Robust admin user lookup with retry logic for Neon PostgreSQL cold-start wake-up
 */
async function findAdminWithRetry(email: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. Try findUnique by email
      const admin = await prisma.adminUser.findUnique({
        where: { email },
      });
      if (admin) return admin;

      // 2. Fallback to case-insensitive findFirst
      return await prisma.adminUser.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      });
    } catch (err: any) {
      console.warn(`Prisma admin query attempt ${attempt} warning:`, err?.message || err);
      if (attempt === maxRetries) {
        throw err;
      }
      // Wait 500ms before retrying in case database compute is waking up
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Look up admin in database with cold-start retry
    let admin = await findAdminWithRetry(cleanEmail);

    // Extract default admin credentials from environment safely
    const rawEnvEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@laraibstudio.pk';
    const rawEnvPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'LaraibAdmin2026!#';

    const defaultAdminEmail = rawEnvEmail.trim().toLowerCase().replace(/^["']|["']$/g, '');
    const defaultAdminPassword = rawEnvPassword.trim().replace(/^["']|["']$/g, '');

    // Auto-create default admin in database if not found and credentials match
    if (!admin && cleanEmail === defaultAdminEmail) {
      if (cleanPassword === defaultAdminPassword) {
        const passwordHash = await hashPassword(defaultAdminPassword);
        admin = await prisma.adminUser.upsert({
          where: { email: defaultAdminEmail },
          update: { passwordHash, name: 'Laraib Studio Admin', role: 'SUPER_ADMIN' },
          create: {
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

    // Verify password against stored hash
    let isValid = await verifyPassword(cleanPassword, admin.passwordHash);

    // Fallback: If DB had an older seed hash or env password was updated
    if (
      !isValid &&
      (admin.email.toLowerCase() === defaultAdminEmail || cleanEmail === defaultAdminEmail) &&
      cleanPassword === defaultAdminPassword
    ) {
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

    const isProd = process.env.NODE_ENV === 'production';

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
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Admin login error:', error?.message || error);
    return NextResponse.json(
      { error: 'Server error during authentication. Please try again.' },
      { status: 500 }
    );
  }
}
