import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { verifyToken, TokenPayload } from "./jwt";
import { verifyClassniaToken } from "./classnia-token";

export const COOKIE_NAME = "aihsk_token";
export const CLASSNIA_COOKIE_NAME = "hsk_session_token";

export const ADMIN_EMAILS = [
  "luunhuthang2402@gmail.com",
  "nhuthangl24@gmail.com",
  "superadmin@aihsk.com",
];

export function getAuthCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const configuredDomain = process.env.COOKIE_DOMAIN;

  // If explicitly configured or running under classnia.id.vn in production
  let domain: string | undefined = configuredDomain;
  if (!domain && isProd && process.env.NEXT_PUBLIC_APP_URL?.includes("classnia.id.vn")) {
    domain = ".classnia.id.vn";
  }

  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    ...(domain ? { domain } : {}),
  };
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();

    // 1. Check native AIHSK token
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload) return payload;
    }

    // 2. Check Classnia session token (hsk_session_token) from classnia.id.vn
    const classniaToken = cookieStore.get(CLASSNIA_COOKIE_NAME)?.value;
    if (classniaToken) {
      const classniaPayload = verifyClassniaToken(classniaToken);
      if (classniaPayload && classniaPayload.email) {
        const normalizedEmail = classniaPayload.email.toLowerCase().trim();
        const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
        return {
          userId: `classnia_${normalizedEmail.replace(/[^a-z0-9]/g, "_")}`,
          email: normalizedEmail,
          role: isAdmin ? UserRole.ADMIN : UserRole.USER,
          name: normalizedEmail.split("@")[0],
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function getCurrentUserWithProfile() {
  const session = await getCurrentUser();
  if (!session) return null;

  // Try to enrich from DB if available, otherwise return session data directly
  try {
    const { default: prisma } = await import("@/lib/db/prisma");
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });
    if (user && user.isActive) return user;
  } catch {
    // DB not available (e.g. no DATABASE_URL on edge/serverless) — return minimal profile
  }

  // Fallback: construct a virtual user from JWT payload (no DB)
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    role: session.role,
    avatarUrl: null as string | null,
    isActive: true,
    emailVerified: true,
    passwordHash: "",
    suspendedAt: null as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
    profile: null,
  };
}

export async function requireAuth(): Promise<TokenPayload> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<TokenPayload> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
