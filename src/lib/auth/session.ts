import { cookies } from "next/headers";
import crypto from "crypto";
import { UserRole, verifyToken, TokenPayload } from "./jwt";
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
    secure: isProd && Boolean(process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    ...(domain ? { domain } : {}),
  };
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();

    let payload: TokenPayload | null = null;

    // 1. Check native AIHSK token
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      payload = await verifyToken(token);
    }

    // 2. Check Classnia session token (hsk_session_token) from classnia.id.vn
    if (!payload) {
      const classniaToken = cookieStore.get(CLASSNIA_COOKIE_NAME)?.value;
      if (classniaToken) {
        const classniaPayload = verifyClassniaToken(classniaToken);
        if (classniaPayload && classniaPayload.email) {
          const normalizedEmail = classniaPayload.email.toLowerCase().trim();
          const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
          payload = {
            userId: `classnia_${normalizedEmail.replace(/[^a-z0-9]/g, "_")}`,
            email: normalizedEmail,
            role: isAdmin ? "ADMIN" : "USER",
            name: normalizedEmail.split("@")[0],
          };
        }
      }
    }

    if (!payload) return null;

    // 3. Ensure userId matches an existing User in the database so foreign key constraints never fail
    try {
      const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
      if (await isPrismaAvailable()) {
        const normalizedEmail = payload.email.toLowerCase().trim();

        let dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: payload.userId },
              { email: normalizedEmail },
            ],
          },
        });

        if (!dbUser) {
          const { hashPassword } = await import("@/lib/auth/password");
          const passwordHash = await hashPassword(crypto.randomUUID() + "!AiHsk2025");
          const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
          dbUser = await prisma.user.create({
            data: {
              id: payload.userId.startsWith("cm") ? payload.userId : undefined,
              email: normalizedEmail,
              name: payload.name || normalizedEmail.split("@")[0],
              passwordHash,
              role: payload.role || (isAdmin ? "ADMIN" : "USER"),
              emailVerified: true,
              profile: {
                create: {
                  targetLevel: "HSK 3",
                  nativeLanguage: "Tiếng Việt",
                  studyHoursWeekly: 3,
                },
              },
            },
          });
        }

        if (dbUser) {
          payload.userId = dbUser.id;
          payload.role = dbUser.role as any;
          if (dbUser.name) payload.name = dbUser.name;
        }
      }
    } catch {
      // In edge/serverless without DB, continue with JWT payload
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUserWithProfile() {
  const session = await getCurrentUser();
  if (!session) return null;

  // Try to enrich from DB if available, otherwise return session data directly
  try {
    const { isPrismaAvailable, default: prisma } = await import("@/lib/db/prisma");
    if (await isPrismaAvailable()) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { profile: true },
      });
      if (user && user.isActive) return user;
    }
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
