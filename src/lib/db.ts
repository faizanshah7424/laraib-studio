import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Configure production-ready PostgreSQL connection URL for Neon Serverless
 * Sets safe connect and pool timeouts and handles PgBouncer pooling if applicable.
 */
function getDatabaseUrl(): string | undefined {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  const cleanUrl = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!cleanUrl) return undefined;

  // Enhance postgresql/postgres connection URLs
  if (cleanUrl.startsWith('postgresql://') || cleanUrl.startsWith('postgres://')) {
    try {
      const parsed = new URL(cleanUrl);

      // 1. Connection timeout (30 seconds for cold-start wake-up)
      if (!parsed.searchParams.has('connect_timeout')) {
        parsed.searchParams.set('connect_timeout', '30');
      }

      // 2. Pool timeout (30 seconds to prevent early timeout under contention)
      if (!parsed.searchParams.has('pool_timeout')) {
        parsed.searchParams.set('pool_timeout', '30');
      }

      // 3. Neon pooler PgBouncer compatibility flag
      if (parsed.hostname.includes('-pooler') && !parsed.searchParams.has('pgbouncer')) {
        parsed.searchParams.set('pgbouncer', 'true');
      }

      return parsed.toString();
    } catch {
      // Fallback string-based formatting if URL parsing fails
      let formattedUrl = cleanUrl;
      if (!formattedUrl.includes('connect_timeout')) {
        const separator = formattedUrl.includes('?') ? '&' : '?';
        formattedUrl = `${formattedUrl}${separator}connect_timeout=30&pool_timeout=30`;
      }
      return formattedUrl;
    }
  }

  return cleanUrl;
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

