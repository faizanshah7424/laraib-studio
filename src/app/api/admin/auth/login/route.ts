import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, hashPassword, createAdminToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

const RETRY_DELAYS = [0, 500, 1200, 2500];

/**
 * Determine if a database error is a transient connection/cold-start issue that should be retried.
 */
function isTransientDbError(err: any): boolean {
  if (!err) return false;

  const code = err.code || err.name || '';
  const transientCodes = ['P1001', 'P1002', 'P1008', 'P1011', 'P1017', 'P2024'];
  if (transientCodes.includes(code)) return true;

  if (err.name === 'PrismaClientInitializationError') return true;

  const msg = (err.message || '').toLowerCase();
  if (
    msg.includes('reach database') ||
    msg.includes('timed out') ||
    msg.includes('timeout') ||
    msg.includes('connection closed') ||
    msg.includes('connection reset') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('econnrefused') ||
    msg.includes('pool')
  ) {
    return true;
  }

  return false;
}

/**
 * Admin user lookup with 4-attempt exponential backoff retry for Neon PostgreSQL cold-starts
 */
async function findAdminWithRetry(email: string, maxRetries = 4) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const delay = RETRY_DELAYS[attempt - 1] || 2500;
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

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
      const isTransient = isTransientDbError(err);
      const errCode = err?.code || err?.name || 'DB_ERROR';

      // Safe server-side logging: Log error code/category and attempt count only (no secrets/credentials)
      console.warn(`[DB Auth] Connection attempt ${attempt}/${maxRetries} failed (Code: ${errCode}, Transient: ${isTransient})`);

      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
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
    const errCode = error?.code || error?.name || 'SERVER_AUTH_ERROR';
    console.error(`[Admin Auth] Authentication error encountered (Code: ${errCode})`);
    return NextResponse.json(
      { error: 'Server error during authentication. Please try again.' },
      { status: 500 }
    );
  }
}

