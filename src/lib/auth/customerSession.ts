import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_CUSTOMER_SECRET_STRING =
  process.env.JWT_CUSTOMER_SECRET ||
  'laraib-studio-customer-secure-jwt-secret-key-2026';
const secretKey = new TextEncoder().encode(JWT_CUSTOMER_SECRET_STRING);

export interface CustomerSessionPayload {
  userId: string;
  email: string;
  name: string;
}

export async function hashCustomerPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyCustomerPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createCustomerToken(
  payload: CustomerSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secretKey);
}

export async function verifyCustomerToken(
  token: string
): Promise<CustomerSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch (err) {
    return null;
  }
}

export async function getCustomerSession(): Promise<CustomerSessionPayload | null> {
  const token = cookies().get('customer_token')?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}
