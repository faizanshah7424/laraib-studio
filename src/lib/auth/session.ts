import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

export interface AdminSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Get secret key dynamically at runtime from environment
 * Handles potential quotes and whitespace formatting from Vercel env vars
 */
function getAdminJwtSecret(): Uint8Array {
  const rawSecret = process.env.JWT_SECRET || process.env.JWT_CUSTOMER_SECRET || 'laraib-studio-super-secure-production-jwt-secret-key-2026';
  const cleanSecret = rawSecret.trim().replace(/^["']|["']$/g, '');
  return new TextEncoder().encode(cleanSecret);
}

/**
 * Hash plain password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify plain password against bcrypt hash safely
 */
export async function verifyPassword(password: string, hash?: string | null): Promise<boolean> {
  if (!password || !hash || typeof password !== 'string' || typeof hash !== 'string') {
    return false;
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    console.error('Bcrypt comparison error:', err);
    return false;
  }
}

/**
 * Create a signed JWT token for Admin Session
 */
export async function createAdminToken(payload: AdminSessionPayload): Promise<string> {
  const secret = getAdminJwtSecret();
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * Verify and decode an Admin JWT token
 */
export async function verifyAdminToken(token: string): Promise<AdminSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;
  try {
    const secret = getAdminJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    if (!payload || !payload.userId || !payload.email) {
      return null;
    }
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: (payload.name as string) || 'Admin',
      role: (payload.role as string) || 'ADMIN',
    };
  } catch (err) {
    return null;
  }
}
