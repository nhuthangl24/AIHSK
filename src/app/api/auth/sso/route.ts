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
    const { default: prisma } = await import("@/lib/db/prisma");
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      const passwordHash = await hashPassword(crypto.randomUUID() + "!PassA1");
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name,
          passwordHash,
          role,
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
    if (user) userId = user.id;
  } catch (dbErr) {
    console.warn("DB write during SSO skipped:", dbErr);
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
