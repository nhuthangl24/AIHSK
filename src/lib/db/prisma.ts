import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __isPrismaAvailable: boolean | undefined;
  // eslint-disable-next-line no-var
  var __lastPrismaCheck: number | undefined;
}

export function isLocalhostDbUrl(url?: string): boolean {
  if (!url) return true;
  return (
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("0.0.0.0") ||
    url.includes("::1")
  );
}

export function isServerlessOrCloud(): boolean {
  return Boolean(
    process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_REGION ||
    process.env.RENDER ||
    process.env.RAILWAY_ENVIRONMENT ||
    (process.env.NODE_ENV === "production" && isLocalhostDbUrl(process.env.DATABASE_URL))
  );
}

/**
 * Robust non-blocking probe to verify if PostgreSQL/Prisma is operational.
 * In serverless/cloud environments where DATABASE_URL points to localhost,
 * this returns false immediately to avoid network timeouts and error spam.
 */
export async function isPrismaAvailable(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL || "";

  // If in cloud/production and DATABASE_URL points to localhost or is empty,
  // we know with 100% certainty that PostgreSQL at localhost:5432 does not exist.
  if (isServerlessOrCloud() && isLocalhostDbUrl(dbUrl)) {
    return false;
  }

  if (!dbUrl || dbUrl.trim().length === 0) {
    return false;
  }

  const now = Date.now();
  if (
    globalThis.__isPrismaAvailable !== undefined &&
    globalThis.__lastPrismaCheck !== undefined &&
    now - globalThis.__lastPrismaCheck < 60000
  ) {
    return globalThis.__isPrismaAvailable;
  }

  try {
    const client = global.prisma || prisma;
    await Promise.race([
      client.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 1000)),
    ]);
    globalThis.__isPrismaAvailable = true;
    globalThis.__lastPrismaCheck = now;
    return true;
  } catch {
    globalThis.__isPrismaAvailable = false;
    globalThis.__lastPrismaCheck = now;
    return false;
  }
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    // Do not log "error" to stderr automatically so fallback handlers can manage offline mode cleanly
    log: [],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
