import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { signToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { getAuthCookieOptions, ADMIN_EMAILS } from "@/lib/auth/session";
import { verifyClassniaToken } from "@/lib/auth/classnia-token";
import { UserRole } from "@prisma/client";

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

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    const passwordHash = await hashPassword(crypto.randomUUID() + "!PassA1");
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: normalizedEmail.split("@")[0],
        passwordHash,
        role: isAdmin ? UserRole.SUPER_ADMIN : UserRole.LEARNER,
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
  } else if (isAdmin && user.role !== UserRole.SUPER_ADMIN) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { role: UserRole.SUPER_ADMIN },
    });
  }

  // Issue aihsk_token
  const aihskToken = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const targetUrl = new URL(redirectPath.startsWith("/") ? redirectPath : "/dashboard", req.url);
  const response = NextResponse.redirect(targetUrl);

  const cookieOpts = getAuthCookieOptions();
  response.cookies.set({
    ...cookieOpts,
    value: aihskToken,
  });

  return response;
}
