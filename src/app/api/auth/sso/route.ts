import { NextRequest, NextResponse } from "next/server";
import { signToken, type UserRole } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import { verifyClassniaToken } from "@/lib/auth/classnia-token";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const redirectPath = searchParams.get("redirect") || searchParams.get("returnUrl") || "/dashboard";

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
  }

  const payload = verifyClassniaToken(token);
  if (!payload || !payload.email) {
    return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
  }

  const normalizedEmail = payload.email.toLowerCase().trim();
  const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
  const role: UserRole = isAdmin ? "ADMIN" : "USER";
  let userId = `sso_${crypto.createHash("md5").update(normalizedEmail).digest("hex").slice(0, 16)}`;
  const name = normalizedEmail.split("@")[0];

  try {
    const { FirebaseDb } = await import("@/lib/firebase-db");
    const fbUser = await FirebaseDb.findUserByEmail(normalizedEmail);
    if (!fbUser) {
      await FirebaseDb.updateUser(userId, {
        email: normalizedEmail,
        name,
        role,
        targetLevel: "HSK 3",
        targetHsk: 3,
        nativeLanguage: "Tiếng Việt",
        learningGoal: "Luyện thi khẩu ngữ tiếng Trung chuẩn hóa",
        studyHoursWeekly: 3,
        streakDays: 1,
        totalMastered: 0,
      }, normalizedEmail);
    } else {
      userId = fbUser.id || userId;
    }
  } catch (fbErr) {
    console.warn("Firestore sync during SSO note:", fbErr);
  }

  const sessionToken = await signToken({
    userId,
    email: normalizedEmail,
    role,
    name,
  });

  const targetUrl = new URL(redirectPath.startsWith("/") ? redirectPath : "/dashboard", req.url);
  const response = NextResponse.redirect(targetUrl);
  const cookieOpts = getAuthCookieOptions();
  response.cookies.set({
    ...cookieOpts,
    value: sessionToken,
  });

  return response;
}
