import { cookies } from "next/headers";
import crypto from "crypto";
import { UserRole, verifyToken, TokenPayload } from "./jwt";
import { verifyClassniaToken } from "./classnia-token";

export const COOKIE_NAME = "aihsk_token";
export const CLASSNIA_COOKIE_NAME = "hsk_session_token";
export const PROFILE_COOKIE_NAME = "aihsk_profile";

export interface UserProfileCookieData {
  name?: string;
  targetLevel?: string;
  nativeLanguage?: string;
  studyHoursWeekly?: number;
  learningGoal?: string;
  updatedAt?: string;
}

export function getUserProfileCookie(cookieStore: any): UserProfileCookieData | null {
  try {
    const raw = cookieStore.get(PROFILE_COOKIE_NAME)?.value;
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export const ADMIN_EMAILS = [
  "luunhuthang2402@gmail.com",
  "nhuthangl24@gmail.com",
  "superadmin@aihsk.com",
];

export function isAuthorizedAdmin(user: any): boolean {
  if (!user) return false;
  const roleStr = String(user.role || "").toUpperCase();
  const email = String(user.email || "").toLowerCase().trim();
  return roleStr === "ADMIN" || ADMIN_EMAILS.includes(email);
}

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

    // 1. Check native AIHSK token from cookies
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (token) {
      payload = await verifyToken(token);
    }

    // 1b. Check Authorization / X-Auth-Token header fallback
    if (!payload) {
      try {
        const { headers } = await import("next/headers");
        const headerStore = await headers();
        const authHeader = headerStore.get("authorization") || headerStore.get("x-auth-token");
        if (authHeader) {
          const rawToken = authHeader.replace(/^Bearer\s+/i, "").trim();
          if (rawToken) {
            payload = await verifyToken(rawToken);
          }
        }
      } catch {}
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

    // 3. Resolve user details from Firebase Firestore database
    try {
      const { FirebaseDb } = await import("@/lib/firebase-db");
      const fbUser =
        (await FirebaseDb.findUserById(payload.userId)) ||
        (await FirebaseDb.findUserByEmail(payload.email));

      if (fbUser) {
        if (fbUser.name) payload.name = fbUser.name;
        if (fbUser.role) {
          payload.role = String(fbUser.role).toUpperCase() === "ADMIN" ? "ADMIN" : "USER";
        }
        if (!payload.userId && fbUser.id) {
          payload.userId = fbUser.id;
        }
      }
    } catch {
      // In edge/serverless, continue with JWT payload
    }

    // Guarantee ADMIN role if email matches authorized admin list
    if (payload.email && ADMIN_EMAILS.includes(payload.email.toLowerCase().trim())) {
      payload.role = "ADMIN";
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUserWithProfile() {
  const session = await getCurrentUser();
  if (!session) return null;

  const cookieStore = await cookies();
  const profileCookie = getUserProfileCookie(cookieStore);

  // 1. Try to enrich from Firebase Firestore (Primary DB)
  let fbUser: any = null;
  try {
    const { FirebaseDb } = await import("@/lib/firebase-db");
    fbUser =
      (await FirebaseDb.findUserById(session.userId)) ||
      (await FirebaseDb.findUserByEmail(session.email));
  } catch {
    // Continue to store fallback
  }

  // 2. Fallback: construct from assessmentStore
  const { assessmentStore } = await import("@/lib/db/assessment-store");
  const storedProfile =
    assessmentStore.getProfile(session.userId) ||
    assessmentStore.getProfile(session.email);

  const resolvedName = profileCookie?.name || storedProfile?.name || fbUser?.name || session.name;
  const resolvedTargetLevel = profileCookie?.targetLevel || storedProfile?.targetLevel || fbUser?.targetLevel || "HSK 3";
  const resolvedNativeLang = profileCookie?.nativeLanguage || storedProfile?.nativeLanguage || fbUser?.nativeLanguage || "Tiếng Việt";
  const resolvedHours = profileCookie?.studyHoursWeekly ?? storedProfile?.studyHoursWeekly ?? fbUser?.studyHoursWeekly ?? 3;
  const resolvedGoal = profileCookie?.learningGoal ?? storedProfile?.learningGoal ?? fbUser?.learningGoal ?? "";

  return {
    id: fbUser?.id || session.userId,
    email: session.email,
    name: resolvedName,
    role:
      (fbUser?.role && String(fbUser.role).toUpperCase() === "ADMIN") ||
      (session.email && ADMIN_EMAILS.includes(session.email.toLowerCase().trim())) ||
      session.role === "ADMIN"
        ? "ADMIN"
        : "USER",
    avatarUrl: fbUser?.avatar || null,
    isActive: true,
    emailVerified: true,
    passwordHash: "",
    suspendedAt: null as Date | null,
    createdAt: new Date(fbUser?.createdAt || Date.now()),
    updatedAt: new Date(profileCookie?.updatedAt || storedProfile?.updatedAt || fbUser?.updatedAt || Date.now()),
    profile: {
      id: `prof_${session.userId}`,
      userId: session.userId,
      targetLevel: resolvedTargetLevel,
      nativeLanguage: resolvedNativeLang,
      studyHoursWeekly: resolvedHours,
      learningGoal: resolvedGoal,
    },
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
