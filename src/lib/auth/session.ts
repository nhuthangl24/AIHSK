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

    // 3. Resolve user details from Firebase Firestore database
    try {
      const { FirebaseDb } = await import("@/lib/firebase-db");
      const fbUser =
        (await FirebaseDb.findUserById(payload.userId)) ||
        (await FirebaseDb.findUserByEmail(payload.email));

      if (fbUser) {
        if (fbUser.name) payload.name = fbUser.name;
        if (fbUser.role) payload.role = fbUser.role as any;
        if (!payload.userId && fbUser.id) {
          payload.userId = fbUser.id;
        }
      }
    } catch {
      // In edge/serverless, continue with JWT payload
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUserWithProfile() {
  const session = await getCurrentUser();
  if (!session) return null;

  // 1. Try to enrich from Firebase Firestore (Primary DB)
  try {
    const { FirebaseDb } = await import("@/lib/firebase-db");
    const fbUser =
      (await FirebaseDb.findUserById(session.userId)) ||
      (await FirebaseDb.findUserByEmail(session.email));

    if (fbUser) {
      return {
        id: fbUser.id,
        email: fbUser.email,
        name: fbUser.name,
        role: fbUser.role || session.role,
        avatarUrl: fbUser.avatar || null,
        isActive: true,
        emailVerified: true,
        passwordHash: "",
        suspendedAt: null as Date | null,
        createdAt: new Date(fbUser.createdAt || Date.now()),
        updatedAt: new Date(fbUser.updatedAt || Date.now()),
        profile: {
          id: `prof_${fbUser.id}`,
          userId: fbUser.id,
          targetLevel: fbUser.targetLevel || "HSK 3",
          nativeLanguage: fbUser.nativeLanguage || "Tiếng Việt",
          studyHoursWeekly: fbUser.studyHoursWeekly || 3,
          learningGoal: fbUser.learningGoal || "",
        },
      };
    }
  } catch {
    // Continue to store fallback
  }

  // 2. Fallback: construct from assessmentStore
  const { assessmentStore } = await import("@/lib/db/assessment-store");
  const storedProfile = assessmentStore.getProfile(session.userId);

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
    profile: storedProfile
      ? {
          id: `prof_${session.userId}`,
          userId: session.userId,
          targetLevel: storedProfile.targetLevel,
          nativeLanguage: storedProfile.nativeLanguage,
          studyHoursWeekly: storedProfile.studyHoursWeekly,
          learningGoal: storedProfile.learningGoal,
        }
      : {
          id: `prof_${session.userId}`,
          userId: session.userId,
          targetLevel: "HSK 3",
          nativeLanguage: "Tiếng Việt",
          studyHoursWeekly: 3,
          learningGoal: "",
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
